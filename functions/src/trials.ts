// Scheduled jobs that downgrade users to "free".
//
// Ported from the legacy functions/index.js. The schedules, the queries, the
// Firestore writes and the log lines are the same as before; only the types are new.
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import {
  FieldValue,
  getFirestore,
  Timestamp,
  type Firestore,
  type UpdateData,
} from 'firebase-admin/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { DATABASE_ID, type SimulationPermalink } from './gumroad.js';

/** The `users.status` values these jobs read and write. */
type TrialStatus = 'trial' | 'trial_pending';

/** Fields of users/{uid} the jobs touch. */
interface UserDoc {
  status: TrialStatus | 'paid' | 'free';
  purchasedSimulations: SimulationPermalink[];
  accessUntil: Timestamp;
  accessExpiredAt: Timestamp;
}

/** Firestore batches accept at most 500 operations. */
const BATCH_LIMIT = 500;

// The app may already exist (gumroadWebhook initialises it lazily too), and a
// second initializeApp() would throw.
function usersDb(): Firestore {
  const app = getApps().length === 0 ? initializeApp() : getApp();
  return getFirestore(app, DATABASE_ID);
}

// Migrare + expirare trial: 12 mai 2026, 10:00 EEST = 07:00 UTC
// Adaugă simulare_09_05 la purchasedSimulations pentru userii cu trial/trial_pending
// înainte de a le revoca statusul, astfel păstrând accesul la simularea cumpărată.
export const expireTrialUsers = onSchedule(
  { schedule: '0 7 12 5 *', timeZone: 'UTC' },
  async () => {
    const db = usersDb();
    const trialStatuses: TrialStatus[] = ['trial', 'trial_pending'];
    const snap = await db.collection('users').where('status', 'in', trialStatuses).get();

    if (snap.empty) {
      console.log('[expireTrialUsers] Niciun user trial/trial_pending de expirat.');
      return;
    }

    const migrated: SimulationPermalink = 'simulare_09_05';
    const batch = db.batch();
    snap.docs.forEach((docSnap) => {
      const update: UpdateData<UserDoc> = {
        status: 'free',
        purchasedSimulations: FieldValue.arrayUnion(migrated),
      };
      batch.update(docSnap.ref, update);
    });
    await batch.commit();
    console.log(
      `[expireTrialUsers] ${snap.docs.length} useri migrati → purchasedSimulations + free`,
    );
  },
);

// Expirare planuri fixe (preadmitere / admitere): zilnic la 00:10 ora României,
// retrogradează la "free" userii plătiţi al căror accessUntil a trecut.
// Interogare doar pe accessUntil (index single-field automat), filtrare status în cod,
// ca să nu fie nevoie de index compus.
export const expireFixedTermUsers = onSchedule(
  { schedule: '10 0 * * *', timeZone: 'Europe/Bucharest' },
  async () => {
    const db = usersDb();
    const now = Timestamp.now();
    const snap = await db.collection('users').where('accessUntil', '<=', now).get();

    const expired = snap.docs.filter((d) => d.get('status') === 'paid');
    if (expired.length === 0) {
      console.log('[expireFixedTermUsers] Niciun plan fix de expirat.');
      return;
    }

    // Batch-urile Firestore au limită de 500 de operaţii.
    for (let i = 0; i < expired.length; i += BATCH_LIMIT) {
      const batch = db.batch();
      expired.slice(i, i + BATCH_LIMIT).forEach((d) => {
        const update: UpdateData<UserDoc> = {
          status: 'free',
          accessExpiredAt: FieldValue.serverTimestamp(),
        };
        batch.update(d.ref, update);
      });
      await batch.commit();
    }
    console.log(`[expireFixedTermUsers] ${expired.length} useri retrogradaţi la free`);
  },
);
