/**
 * Shapes of the Firestore documents used by the site and by the Cloud
 * Functions (database id: "admiterepoli"). This is the single definition:
 * the site imports it through `src/types/firestore.ts`; code in `functions/src`
 * imports it as `import type { … } from '../../shared/firestore.js'`.
 *
 * These types describe what the legacy code reads and writes. Documents are
 * written with `{ merge: true }` from several places, so almost every field is
 * optional: always handle the missing case.
 *
 * `Timestamp` is generic so the same types work with the web SDK
 * (firebase/firestore) and the admin SDK (firebase-admin) without importing either.
 *
 * Why a `.d.ts` with types only:
 * - Firebase deploys `functions/` on its own, so the functions must not load
 *   anything from outside it at runtime. A declaration file has no output.
 * - `functions/tsconfig.json` has `rootDir: "src"`; a `.ts` file here would be
 *   outside it, a `.d.ts` file is not subject to `rootDir`.
 * - The functions compile to CommonJS while this folder is ESM (root
 *   `"type": "module"`). Import from here with `import type` only.
 *
 * Runtime values (such as `PAID_STATUSES`) live next to their users, not here.
 * `skipLibCheck` skips this file in both projects; after changing it, run
 * `npx tsc --ignoreConfig --noEmit --strict --skipLibCheck false
 * shared/firestore.d.ts`.
 */

/**
 * Access level of an account.
 * - `free`: account without a paid plan.
 * - `paid`: active subscription or fixed-term plan.
 * - `pending_cancellation`: the user cancelled, access continues until the period ends.
 * - `trial` / `trial_pending`: historical trial states. `expireTrialUsers` moved them to `free`.
 */
export type UserStatus = 'free' | 'paid' | 'pending_cancellation' | 'trial' | 'trial_pending';

/** Plan chosen in the sign-up modal; stored as-is from the card's `data-plan` attribute. */
export type PlanId = 'standard' | 'student-plus';

/** Billing option chosen in the plan picker (`data-billing`). */
export type BillingId = 'monthly' | 'preadmitere' | 'admitere';

/**
 * Identifier of a paid simulation. It equals the Gumroad product permalink and
 * is what `purchasedSimulations` contains. Note the two historical spellings.
 */
export type PaidSimulationId = 'simulare_09_05' | 'simulare-21-07';

/** `users/{uid}` */
export interface UserDoc<Timestamp = unknown> {
  /** Written by the site on first sign-in. */
  email?: string | null;
  /** Lower-cased email; fallback lookup key for the Gumroad webhook. */
  emailLower?: string;
  status?: UserStatus;
  /** Name the user sets on the profile page (also stored on the Firebase Auth profile). */
  displayName?: string;
  selectedPlan?: PlanId;
  selectedBilling?: BillingId;
  createdAt?: Timestamp;

  /** Written by the Gumroad webhook. */
  gumroadSaleId?: string | null;
  gumroadProduct?: string | null;
  /** `null` for one-time fixed-term plans; set for the monthly subscription. */
  gumroadSubscriptionId?: string | null;
  paidAt?: Timestamp;
  /** End of a fixed-term plan (preadmitere / admitere). Absent for subscriptions. */
  accessUntil?: Timestamp;
  /** Set by `expireFixedTermUsers` when it moves an expired fixed-term plan to `free`. */
  accessExpiredAt?: Timestamp;
  /** One-time simulation purchases; values are Gumroad permalinks. */
  purchasedSimulations?: string[];

  /** Cancellation and refund bookkeeping (dates are ISO strings as sent by Gumroad). */
  pendingCancellationAt?: string | null;
  cancelledByBuyer?: boolean;
  cancelledDueToPaymentFailures?: boolean;
  subscriptionEndedAt?: string;
  subscriptionEndedReason?: string | null;
  refundedAt?: Timestamp;
}

/** Track chosen in simulations that have two variants (3 and 4). `null` for simulations 1 and 2. */
export type SimulationTrack = string | null;

/**
 * `users/{uid}/simulationResults/{simulationId}`
 *
 * The document id is `simulare-2026-03-21`, `simulare-2026-03-26`,
 * `simulare-2026-05-09-<track>` or `simulare-2026-07-21-<track>`.
 */
export interface SimulationResultDoc<Timestamp = unknown> {
  simulationId: string;
  track: SimulationTrack;
  title: string;
  scoreTotal: number;
  /** Score of the second subject: informatics OR physics, depending on the track. */
  scoreInfo: number;
  scoreMate: number;
  completedAt: Timestamp;
  /** Seconds spent in the exam. */
  timeElapsed: number;
}

/**
 * What a simulation page passes to `window.saveSimulationResult`. Pages send
 * `scoreDisc` (the track's second subject); it is stored as `scoreInfo`.
 */
export interface SimulationResultInput {
  track?: SimulationTrack;
  title?: string;
  scoreTotal?: number;
  scoreInfo?: number;
  scoreDisc?: number;
  scoreMate?: number;
  timeElapsed?: number;
}

/** `videos/{docId}`: readable only by users whose access level allows the video. */
export interface VideoDoc {
  /** YouTube video id. */
  videoId: string;
}
