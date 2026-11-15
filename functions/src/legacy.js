const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
db.settings({ databaseId: "admiterepoli" });

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
