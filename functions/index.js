const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
db.settings({ databaseId: "admiterepoli" });

// Produse Gumroad one-time (o simulare, acces permanent), NU abonamente.
// Valorile sunt permalink-urile Gumroad şi sunt folosite ca atare în
// users/{uid}.purchasedSimulations.
const SIMULATION_PERMALINKS = ["simulare_09_05", "simulare-21-07"];

// Planuri Student Plus cu plată unică şi acces până la o dată fixă (NU abonamente).
// accessUntil = ultimul moment cu acces (ora României). expireFixedTermUsers
// retrogradează la "free" după această dată.
const FIXED_TERM_PLANS = {
  "student-plus-preadmitere": new Date("2027-04-05T23:59:59+03:00"),
  "student-plus-admitere": new Date("2027-07-31T23:59:59+03:00"),
};

// Gumroad trimite fie permalink-ul simplu, fie forma "<user>/<permalink>".
function matchPermalink(productPermalink, permalinks) {
  if (typeof productPermalink !== "string") return null;
  return permalinks.find(
    (p) => productPermalink === p || productPermalink.endsWith(`/${p}`)
  ) || null;
}

function matchSimulationPermalink(productPermalink) {
  return matchPermalink(productPermalink, SIMULATION_PERMALINKS);
}

function matchFixedTermPlan(productPermalink) {
  return matchPermalink(productPermalink, Object.keys(FIXED_TERM_PLANS));
}

exports.gumroadWebhook = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // Verificare token secret
  const expectedToken = process.env.WEBHOOK_TOKEN;
  if (!expectedToken || req.query.token !== expectedToken) {
    console.warn("Token invalid sau lipsă");
    return res.status(401).send("Unauthorized");
  }

  console.log("[Webhook] Body:", JSON.stringify(req.body));

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
  } = req.body;

  const isCancellationEvent = cancelled === "true" || cancelled === true;
  const isEndedEvent = !!ended_at;

  try {
    let uid;

    // Pentru cancellation și subscription_ended, Gumroad trimite subscription_id și user_email
    // (care în test mode e emailul seller-ului, nu al cumpărătorului).
    // Căutăm userul după subscription_id salvat în Firestore — mai fiabil decât emailul.
    if ((isCancellationEvent || isEndedEvent) && subscription_id) {
      const snap = await db.collection("users")
        .where("gumroadSubscriptionId", "==", subscription_id)
        .limit(1)
        .get();

      if (snap.empty) {
        console.error(`Niciun user cu subscription_id: ${subscription_id}`);
        return res.status(404).send("User not found");
      }
      uid = snap.docs[0].id;
    } else {
      // Pentru sale/refund folosim emailul din payload
      const rawEmail = email || user_email;
      if (!rawEmail) {
        console.error("Webhook primit fără email");
        return res.status(400).send("Missing email");
      }
      const normalizedEmail = rawEmail.toLowerCase();
      try {
        const userRecord = await admin.auth().getUserByEmail(normalizedEmail);
        uid = userRecord.uid;
      } catch (err) {
        if (err.code !== "auth/user-not-found") throw err;
        // Conturile vechi pot avea emailul stocat cu majuscule în Auth, iar
        // getUserByEmail e case-sensitive și nu le găsește. Fallback: căutăm
        // după emailLower în Firestore (normalizat la înregistrare).
        const snap = await db.collection("users")
          .where("emailLower", "==", normalizedEmail)
          .limit(1)
          .get();
        if (snap.empty) {
          console.error(`Niciun user Firebase/Firestore cu emailul: ${normalizedEmail}`);
          return res.status(404).send("User not found");
        }
        uid = snap.docs[0].id;
        console.log(`[Webhook] User găsit prin fallback emailLower: ${normalizedEmail} → uid ${uid}`);
      }
    }

    // --- subscription_ended: subscripția s-a terminat efectiv (acces revocat acum) ---
    if (isEndedEvent) {
      await db.collection("users").doc(uid).set(
        {
          status: "free",
          subscriptionEndedAt: ended_at,
          subscriptionEndedReason: ended_reason || null,
        },
        { merge: true }
      );
      console.log(`Subscripție terminată pentru uid ${uid} (${ended_reason})`);
      return res.status(200).send("Subscription ended processed");
    }

    // --- cancellation: userul a cerut anulare, dar accesul continuă până la cancelled_at ---
    if (isCancellationEvent) {
      await db.collection("users").doc(uid).set(
        {
          status: "pending_cancellation",
          pendingCancellationAt: cancelled_at || null,
          cancelledByBuyer: cancelled_by_buyer === "true" || cancelled_by_buyer === true || false,
          cancelledDueToPaymentFailures: cancelled_due_to_payment_failures === "true" || cancelled_due_to_payment_failures === true || false,
        },
        { merge: true }
      );
      console.log(`Anulare programată pentru uid ${uid}, activ până la ${cancelled_at}`);
      return res.status(200).send("Cancellation processed");
    }

    // --- refund: ramburs imediat, revocare acces ---
    if (refunded === "true" || refunded === true) {
      await db.collection("users").doc(uid).set(
        { status: "free", refundedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      console.log(`Refund procesat pentru uid ${uid}`);
      return res.status(200).send("Refund processed");
    }

    // --- sale: cumpărare simulare one-time ---
    // Permalink-ul cumpărat devine cheia din purchasedSimulations; frontend-ul
    // (window.simulationId) trebuie să folosească exact aceleaşi valori.
    const simulationPermalink = matchSimulationPermalink(product_permalink);
    if (simulationPermalink && refunded !== "true" && refunded !== true) {
      await db.collection("users").doc(uid).set(
        {
          gumroadSaleId: sale_id || null,
          gumroadProduct: product_permalink,
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          purchasedSimulations: admin.firestore.FieldValue.arrayUnion(simulationPermalink),
        },
        { merge: true }
      );
      console.log(`[Webhook] Acces simulare ${simulationPermalink} acordat pentru uid ${uid}`);
      return res.status(200).send("Simulare access granted");
    }

    // --- sale: plan cu plată unică până la o dată fixă (preadmitere / admitere) ---
    const fixedPlan = matchFixedTermPlan(product_permalink);
    if (fixedPlan) {
      const userRef = db.collection("users").doc(uid);
      const newUntil = FIXED_TERM_PLANS[fixedPlan];
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(userRef);
        // Dacă userul are deja un plan fix mai lung (ex. a cumpărat Admitere,
        // apoi Preadmitere), nu îi scurtăm accesul.
        const current = snap.exists ? snap.get("accessUntil") : null;
        const currentDate = current && typeof current.toDate === "function" ? current.toDate() : null;
        const accessUntil = currentDate && currentDate > newUntil ? currentDate : newUntil;
        tx.set(userRef, {
          status: "paid",
          gumroadSaleId: sale_id || null,
          gumroadProduct: product_permalink,
          gumroadSubscriptionId: null,
          accessUntil: admin.firestore.Timestamp.fromDate(accessUntil),
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      });
      console.log(`[Webhook] Plan fix ${fixedPlan} activat pentru uid ${uid}`);
      return res.status(200).send("Fixed-term plan granted");
    }

    // --- sale: abonament lunar, cumpărare nouă sau reînnoire ---
    // accessUntil se şterge: accesul e guvernat de abonament (cancel/ended events),
    // altfel expireFixedTermUsers l-ar retrograda pe baza unei date vechi.
    await db.collection("users").doc(uid).set(
      {
        status: "paid",
        gumroadSaleId: sale_id || null,
        gumroadProduct: product_permalink || null,
        gumroadSubscriptionId: subscription_id || null,
        accessUntil: admin.firestore.FieldValue.delete(),
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`Status actualizat la 'paid' pentru uid ${uid}`);
    return res.status(200).send("OK");
  } catch (e) {
    if (e.code === "auth/user-not-found") {
      console.error(`Niciun user Firebase cu emailul din webhook`);
      return res.status(404).send("User not found");
    }
    console.error("Eroare webhook:", e);
    return res.status(500).send("Internal error");
  }
});

// Migrare + expirare trial: 12 mai 2026, 10:00 EEST = 07:00 UTC
// Adaugă simulare_09_05 la purchasedSimulations pentru userii cu trial/trial_pending
// înainte de a le revoca statusul, astfel păstrând accesul la simularea cumpărată.
exports.expireTrialUsers = onSchedule({ schedule: "0 7 12 5 *", timeZone: "UTC" }, async () => {
    const snap = await db.collection("users")
      .where("status", "in", ["trial", "trial_pending"])
      .get();

    if (snap.empty) {
      console.log("[expireTrialUsers] Niciun user trial/trial_pending de expirat.");
      return null;
    }

    const batch = db.batch();
    snap.docs.forEach(docSnap => {
      batch.update(docSnap.ref, {
        status: "free",
        purchasedSimulations: admin.firestore.FieldValue.arrayUnion("simulare_09_05"),
      });
    });
    await batch.commit();
    console.log(`[expireTrialUsers] ${snap.docs.length} useri migrati → purchasedSimulations + free`);
    return null;
  });

// Expirare planuri fixe (preadmitere / admitere): zilnic la 00:10 ora României,
// retrogradează la "free" userii plătiţi al căror accessUntil a trecut.
// Interogare doar pe accessUntil (index single-field automat), filtrare status în cod,
// ca să nu fie nevoie de index compus.
exports.expireFixedTermUsers = onSchedule(
  { schedule: "10 0 * * *", timeZone: "Europe/Bucharest" },
  async () => {
    const now = admin.firestore.Timestamp.now();
    const snap = await db.collection("users")
      .where("accessUntil", "<=", now)
      .get();

    const expired = snap.docs.filter((d) => d.get("status") === "paid");
    if (expired.length === 0) {
      console.log("[expireFixedTermUsers] Niciun plan fix de expirat.");
      return null;
    }

    // Batch-urile Firestore au limită de 500 de operaţii.
    for (let i = 0; i < expired.length; i += 500) {
      const batch = db.batch();
      expired.slice(i, i + 500).forEach((d) => {
        batch.update(d.ref, {
          status: "free",
          accessExpiredAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
    }
    console.log(`[expireFixedTermUsers] ${expired.length} useri retrogradaţi la free`);
    return null;
  }
);
