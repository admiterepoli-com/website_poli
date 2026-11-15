/**
 * Creates or backfills the `users/{uid}` document after sign-in. Extracted from
 * `legacy/firebase-auth.js`; the written fields are unchanged.
 */
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, type FieldValue } from 'firebase/firestore';

import type { BillingId, PlanId, UserDoc } from '../../types/firestore';
import { db } from './app';

/** `code` and `message` of a caught value, for the log lines the legacy code printed. */
function errorInfo(e: unknown): { code: unknown; message: unknown } {
  if (typeof e !== 'object' || e === null) return { code: undefined, message: undefined };
  return {
    code: 'code' in e ? e.code : undefined,
    message: 'message' in e ? e.message : undefined,
  };
}

export async function syncUserToFirestore(
  user: Pick<User, 'uid' | 'email'>,
  plan?: PlanId | null,
  billing?: BillingId | null,
): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    const emailLower = (user.email || '').toLowerCase();
    if (!snap.exists()) {
      const newUser: UserDoc<FieldValue> = {
        email: user.email,
        emailLower,
        status: 'free',
        selectedPlan: plan || 'standard',
        selectedBilling: billing || 'monthly',
        createdAt: serverTimestamp(),
      };
      await setDoc(userRef, newUser);
      console.log('[Auth] Firestore: document creat pentru', user.uid);
    } else if (emailLower && (snap.data() as UserDoc).emailLower !== emailLower) {
      // Backfill: conturile create înainte de introducerea câmpului nu îl au, iar
      // webhook-ul Gumroad se bazează pe el ca fallback când getUserByEmail (care e
      // case-sensitive) nu găseşte un email salvat cu majuscule în Auth. Scriem o
      // singură dată, la primul onAuthStateChanged de după deploy.
      // Catch local: dacă regulile Firestore nu permit update-ul, scrierea ar eşua
      // la FIECARE încărcare de pagină pentru fiecare cont vechi. E o îmbunătăţire
      // oportunistă, nu are voie să rupă fluxul de autentificare.
      try {
        const backfill: UserDoc = { emailLower };
        await setDoc(userRef, backfill, { merge: true });
        console.log('[Auth] Firestore: emailLower completat pentru', user.uid);
      } catch (e) {
        const { code, message } = errorInfo(e);
        console.warn('[Auth] Nu am putut completa emailLower:', code || message);
      }
    } else {
      console.log('[Auth] Firestore: document deja existent pentru', user.uid);
    }
  } catch (e) {
    const { code, message } = errorInfo(e);
    console.error('[Auth] Firestore sync error:', code, message, e);
    throw e;
  }
}
