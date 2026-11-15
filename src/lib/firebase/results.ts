/**
 * Saves the result of a finished simulation to the signed-in user's profile. Extracted from
 * `legacy/firebase-auth.js` (issue #27); the written document is unchanged.
 *
 * Simulation pages reach it as `window.saveSimulationResult` (assigned in `./entry`).
 */
import { doc, setDoc, serverTimestamp, type FieldValue } from 'firebase/firestore';

import type { SimulationResultDoc, SimulationResultInput } from '../../types/firestore';
import { auth, db } from './app';

/* ── Salvare rezultat simulare în Firestore ──────────────────── */

/**
 * Writes `users/{uid}/simulationResults/{simulationId}` with `merge: true`. Does nothing when no user
 * is signed in, and never rejects: a failed write is only logged, as in the legacy code.
 */
export async function saveSimulationResult(simulationId: string, data: SimulationResultInput): Promise<void> {
  const user = auth.currentUser;
  if (!user) return; // utilizator neautentificat — silent fail
  try {
    const resultRef = doc(db, 'users', user.uid, 'simulationResults', simulationId);
    // Paginile de simulare trimit `scoreDisc` (info SAU fizică, în funcţie de track).
    // Îl salvăm ca `scoreInfo` pentru că asta citeşte profile.js. Fallback la 0:
    // setDoc aruncă la `undefined` şi ar pica salvarea întregului rezultat.
    const result: SimulationResultDoc<FieldValue> = {
      simulationId,
      track: data.track ?? null,
      title: data.title ?? simulationId,
      scoreTotal: data.scoreTotal ?? 0,
      scoreInfo: data.scoreInfo ?? data.scoreDisc ?? 0,
      scoreMate: data.scoreMate ?? 0,
      completedAt: serverTimestamp(),
      timeElapsed: data.timeElapsed ?? 0,
    };
    await setDoc(resultRef, result, { merge: true });
    console.log('[Profile] Rezultat salvat pentru', simulationId);
  } catch (e) {
    console.error('[Profile] Eroare salvare rezultat:', e);
  }
}
