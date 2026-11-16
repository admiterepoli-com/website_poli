// Gumroad webhook ("ping") handler.
//
// Ported from the legacy functions/index.js. Verification, the order of the
// branches, the response codes and bodies, the log lines and the Firestore
// writes are the same as before; only the types are new.
//
// Payload reference: api_gumroad_doc.txt at the repository root (sections
// "Resource subscriptions" and "Sales").
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';

/** The named Firestore database that holds `users`. */
export const DATABASE_ID = 'admiterepoli';

// Produse Gumroad one-time (o simulare, acces permanent), NU abonamente.
// Valorile sunt permalink-urile Gumroad şi sunt folosite ca atare în
// users/{uid}.purchasedSimulations.
export const SIMULATION_PERMALINKS = ['simulare_09_05', 'simulare-21-07'] as const;
export type SimulationPermalink = (typeof SIMULATION_PERMALINKS)[number];

// Planuri Student Plus cu plată unică şi acces până la o dată fixă (NU abonamente).
// accessUntil = ultimul moment cu acces (ora României). expireFixedTermUsers
// retrogradează la "free" după această dată.
export const FIXED_TERM_PLANS = {
  'student-plus-preadmitere': new Date('2027-04-05T23:59:59+03:00'),
  'student-plus-admitere': new Date('2027-07-31T23:59:59+03:00'),
} as const satisfies Record<string, Date>;
export type FixedTermPlan = keyof typeof FIXED_TERM_PLANS;

const FIXED_TERM_PERMALINKS = Object.keys(FIXED_TERM_PLANS) as FixedTermPlan[];

/** Gumroad sends booleans as the strings "true"/"false" (form-encoded body). */
export type GumroadFlag = 'true' | 'false' | boolean;

/**
 * The fields of a Gumroad ping that the webhook reads. Gumroad posts
 * `application/x-www-form-urlencoded`, so every value normally arrives as a string.
 */
export interface GumroadPing {
  /** Buyer email, on "sale" and "refund" pings. */
  email?: string;
  /** Subscriber email, on subscription pings ("cancellation", "subscription_ended"). */
  user_email?: string;
  /** Either the bare permalink or "<seller>/<permalink>". */
  product_permalink?: string;
  sale_id?: string;
  subscription_id?: string;
  refunded?: GumroadFlag;
  /** "cancellation" ping. */
  cancelled?: GumroadFlag;
  /** Timestamp at which the subscription will be cancelled. */
  cancelled_at?: string;
  cancelled_by_buyer?: GumroadFlag;
  cancelled_due_to_payment_failures?: GumroadFlag;
  /** "subscription_ended" ping. */
  ended_at?: string;
  /** "cancelled", "failed_payment" or "fixed_subscription_period_ended". */
  ended_reason?: string;
}

/**
 * A value copied from the request body into Firestore without conversion, as the
 * legacy handler did. It is a string for every real Gumroad ping (see GumroadPing);
 * the body is not validated, so the type stays `unknown`.
 */
export type AsReceived = unknown;

/** The body as it arrives: the keys of GumroadPing, values not yet trusted. */
type ReceivedPing = { readonly [K in keyof GumroadPing]?: AsReceived };

// --- Firestore writes to users/{uid}; all of them are merged into the document ---

export interface SubscriptionEndedWrite {
  status: 'free';
  subscriptionEndedAt: AsReceived;
  subscriptionEndedReason: AsReceived;
}

export interface CancellationWrite {
  status: 'pending_cancellation';
  pendingCancellationAt: AsReceived;
  cancelledByBuyer: boolean;
  cancelledDueToPaymentFailures: boolean;
}

export interface RefundWrite {
  status: 'free';
  refundedAt: FieldValue;
}

export interface SimulationPurchaseWrite {
  gumroadSaleId: AsReceived;
  gumroadProduct: AsReceived;
  paidAt: FieldValue;
  purchasedSimulations: FieldValue;
}

export interface FixedTermPlanWrite {
  status: 'paid';
  gumroadSaleId: AsReceived;
  gumroadProduct: AsReceived;
  gumroadSubscriptionId: null;
  accessUntil: Timestamp;
  paidAt: FieldValue;
}

export interface SubscriptionWrite {
  status: 'paid';
  gumroadSaleId: AsReceived;
  gumroadProduct: AsReceived;
  gumroadSubscriptionId: AsReceived;
  accessUntil: FieldValue;
  paidAt: FieldValue;
}

export type UserWrite =
  | SubscriptionEndedWrite
  | CancellationWrite
  | RefundWrite
  | SimulationPurchaseWrite
  | FixedTermPlanWrite
  | SubscriptionWrite;

// --- The slice of firebase-admin the webhook uses (the real classes satisfy it) ---

export interface MergeOption {
  merge: true;
}

export interface UserDocRef {
  set(data: UserWrite, options: MergeOption): Promise<unknown>;
}

export interface UserDocSnapshot {
  readonly exists: boolean;
  get(field: string): unknown;
}

export interface UserQuerySnapshot {
  readonly empty: boolean;
  readonly docs: readonly { readonly id: string }[];
}

export interface UserQuery {
  limit(count: number): { get(): Promise<UserQuerySnapshot> };
}

export interface UsersCollection {
  where(field: string, op: '==', value: unknown): UserQuery;
  doc(id: string): UserDocRef;
}

export interface UserTransaction {
  get(ref: UserDocRef): Promise<UserDocSnapshot>;
  set(ref: UserDocRef, data: UserWrite, options: MergeOption): unknown;
}

export interface WebhookFirestore {
  collection(path: 'users'): UsersCollection;
  runTransaction<T>(update: (tx: UserTransaction) => Promise<T>): Promise<T>;
}

export interface WebhookAuth {
  getUserByEmail(email: string): Promise<{ readonly uid: string }>;
}

export interface WebhookDeps {
  db: WebhookFirestore;
  auth: WebhookAuth;
  /** Value of the WEBHOOK_TOKEN secret; the webhook rejects everything when it is unset. */
  webhookToken: string | undefined;
}

export interface WebhookRequest {
  readonly method: string;
  readonly query: { readonly token?: unknown };
  readonly body: unknown;
}

export interface WebhookResponse {
  status(code: number): { send(body: string): unknown };
}

// Gumroad trimite fie permalink-ul simplu, fie forma "<user>/<permalink>".
function matchPermalink<P extends string>(productPermalink: unknown, permalinks: readonly P[]): P | null {
  if (typeof productPermalink !== 'string') return null;
  return permalinks.find((p) => productPermalink === p || productPermalink.endsWith(`/${p}`)) ?? null;
}

export function matchSimulationPermalink(productPermalink: unknown): SimulationPermalink | null {
  return matchPermalink(productPermalink, SIMULATION_PERMALINKS);
}

export function matchFixedTermPlan(productPermalink: unknown): FixedTermPlan | null {
  return matchPermalink(productPermalink, FIXED_TERM_PERMALINKS);
}

function isFlagSet(value: unknown): boolean {
  return value === 'true' || value === true;
}

function errorCode(error: unknown): unknown {
  return typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
}

function hasToDate(value: unknown): value is { toDate(): Date } {
  return (
    typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function'
  );
}

function readPing(body: unknown): ReceivedPing {
  return typeof body === 'object' && body !== null ? body : {};
}

export async function handleGumroadWebhook(
  req: WebhookRequest,
  res: WebhookResponse,
  { db, auth, webhookToken }: WebhookDeps,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Verificare token secret
  const expectedToken = webhookToken;
  if (!expectedToken || req.query.token !== expectedToken) {
    console.warn('Token invalid sau lipsă');
    res.status(401).send('Unauthorized');
    return;
  }

  console.log('[Webhook] Body:', JSON.stringify(req.body));

  // Gumroad folosește "email" pentru sale/refund și "user_email" pentru subscription events
  const {
    email,
    user_email,
    product_permalink,
    sale_id,
    subscription_id,
    refunded,
    cancelled,
    cancelled_at,
    cancelled_by_buyer,
    cancelled_due_to_payment_failures,
    ended_at,
    ended_reason,
  } = readPing(req.body);

  const isCancellationEvent = isFlagSet(cancelled);
  const isEndedEvent = !!ended_at;

  try {
    let uid: string;

    // Pentru cancellation și subscription_ended, Gumroad trimite subscription_id și user_email
    // (care în test mode e emailul seller-ului, nu al cumpărătorului).
    // Căutăm userul după subscription_id salvat în Firestore — mai fiabil decât emailul.
    if ((isCancellationEvent || isEndedEvent) && subscription_id) {
      const snap = await db
        .collection('users')
        .where('gumroadSubscriptionId', '==', subscription_id)
        .limit(1)
        .get();

      const found = snap.docs[0];
      if (snap.empty || !found) {
        console.error(`Niciun user cu subscription_id: ${String(subscription_id)}`);
        res.status(404).send('User not found');
        return;
      }
      uid = found.id;
    } else {
      // Pentru sale/refund folosim emailul din payload
      const rawEmail = email || user_email;
      if (!rawEmail) {
        console.error('Webhook primit fără email');
        res.status(400).send('Missing email');
        return;
      }
      if (typeof rawEmail !== 'string') {
        // The legacy handler called rawEmail.toLowerCase() here, which threw
        // for a non-string value and ended in the 500 below.
        throw new TypeError('rawEmail.toLowerCase is not a function');
      }
      const normalizedEmail = rawEmail.toLowerCase();
      try {
        const userRecord = await auth.getUserByEmail(normalizedEmail);
        uid = userRecord.uid;
      } catch (err) {
        if (errorCode(err) !== 'auth/user-not-found') throw err;
        // Conturile vechi pot avea emailul stocat cu majuscule în Auth, iar
        // getUserByEmail e case-sensitive și nu le găsește. Fallback: căutăm
        // după emailLower în Firestore (normalizat la înregistrare).
        const snap = await db.collection('users').where('emailLower', '==', normalizedEmail).limit(1).get();
        const found = snap.docs[0];
        if (snap.empty || !found) {
          console.error(`Niciun user Firebase/Firestore cu emailul: ${normalizedEmail}`);
          res.status(404).send('User not found');
          return;
        }
        uid = found.id;
        console.log(`[Webhook] User găsit prin fallback emailLower: ${normalizedEmail} → uid ${uid}`);
      }
    }

    // --- subscription_ended: subscripția s-a terminat efectiv (acces revocat acum) ---
    if (isEndedEvent) {
      const write: SubscriptionEndedWrite = {
        status: 'free',
        subscriptionEndedAt: ended_at,
        subscriptionEndedReason: ended_reason || null,
      };
      await db.collection('users').doc(uid).set(write, { merge: true });
      console.log(`Subscripție terminată pentru uid ${uid} (${String(ended_reason)})`);
      res.status(200).send('Subscription ended processed');
      return;
    }

    // --- cancellation: userul a cerut anulare, dar accesul continuă până la cancelled_at ---
    if (isCancellationEvent) {
      const write: CancellationWrite = {
        status: 'pending_cancellation',
        pendingCancellationAt: cancelled_at || null,
        cancelledByBuyer: isFlagSet(cancelled_by_buyer),
        cancelledDueToPaymentFailures: isFlagSet(cancelled_due_to_payment_failures),
      };
      await db.collection('users').doc(uid).set(write, { merge: true });
      console.log(`Anulare programată pentru uid ${uid}, activ până la ${String(cancelled_at)}`);
      res.status(200).send('Cancellation processed');
      return;
    }

    // --- refund: ramburs imediat, revocare acces ---
    if (isFlagSet(refunded)) {
      const write: RefundWrite = { status: 'free', refundedAt: FieldValue.serverTimestamp() };
      await db.collection('users').doc(uid).set(write, { merge: true });
      console.log(`Refund procesat pentru uid ${uid}`);
      res.status(200).send('Refund processed');
      return;
    }

    // --- sale: cumpărare simulare one-time ---
    // Permalink-ul cumpărat devine cheia din purchasedSimulations; frontend-ul
    // (window.simulationId) trebuie să folosească exact aceleaşi valori.
    const simulationPermalink = matchSimulationPermalink(product_permalink);
    if (simulationPermalink) {
      const write: SimulationPurchaseWrite = {
        gumroadSaleId: sale_id || null,
        gumroadProduct: product_permalink,
        paidAt: FieldValue.serverTimestamp(),
        purchasedSimulations: FieldValue.arrayUnion(simulationPermalink),
      };
      await db.collection('users').doc(uid).set(write, { merge: true });
      console.log(`[Webhook] Acces simulare ${simulationPermalink} acordat pentru uid ${uid}`);
      res.status(200).send('Simulare access granted');
      return;
    }

    // --- sale: plan cu plată unică până la o dată fixă (preadmitere / admitere) ---
    const fixedPlan = matchFixedTermPlan(product_permalink);
    if (fixedPlan) {
      const userRef = db.collection('users').doc(uid);
      const newUntil = FIXED_TERM_PLANS[fixedPlan];
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(userRef);
        // Dacă userul are deja un plan fix mai lung (ex. a cumpărat Admitere,
        // apoi Preadmitere), nu îi scurtăm accesul.
        const current = snap.exists ? snap.get('accessUntil') : null;
        const currentDate = hasToDate(current) ? current.toDate() : null;
        const accessUntil = currentDate && currentDate > newUntil ? currentDate : newUntil;
        const write: FixedTermPlanWrite = {
          status: 'paid',
          gumroadSaleId: sale_id || null,
          gumroadProduct: product_permalink,
          gumroadSubscriptionId: null,
          accessUntil: Timestamp.fromDate(accessUntil),
          paidAt: FieldValue.serverTimestamp(),
        };
        tx.set(userRef, write, { merge: true });
      });
      console.log(`[Webhook] Plan fix ${fixedPlan} activat pentru uid ${uid}`);
      res.status(200).send('Fixed-term plan granted');
      return;
    }

    // --- sale: abonament lunar, cumpărare nouă sau reînnoire ---
    // accessUntil se şterge: accesul e guvernat de abonament (cancel/ended events),
    // altfel expireFixedTermUsers l-ar retrograda pe baza unei date vechi.
    const write: SubscriptionWrite = {
      status: 'paid',
      gumroadSaleId: sale_id || null,
      gumroadProduct: product_permalink || null,
      gumroadSubscriptionId: subscription_id || null,
      accessUntil: FieldValue.delete(),
      paidAt: FieldValue.serverTimestamp(),
    };
    await db.collection('users').doc(uid).set(write, { merge: true });

    console.log(`Status actualizat la 'paid' pentru uid ${uid}`);
    res.status(200).send('OK');
  } catch (e) {
    if (errorCode(e) === 'auth/user-not-found') {
      console.error(`Niciun user Firebase cu emailul din webhook`);
      res.status(404).send('User not found');
      return;
    }
    console.error('Eroare webhook:', e);
    res.status(500).send('Internal error');
  }
}

// Created on the first request, not at module load: the default app may already
// exist (the scheduled jobs in trials.ts initialise it lazily too), and a second
// initializeApp() would throw.
function productionDeps(): WebhookDeps {
  const app = getApps().length === 0 ? initializeApp() : getApp();
  return {
    db: getFirestore(app, DATABASE_ID),
    auth: getAuth(app),
    webhookToken: process.env.WEBHOOK_TOKEN,
  };
}

export const gumroadWebhook = onRequest(async (req, res) => {
  await handleGumroadWebhook(req, res, productionDeps());
});
