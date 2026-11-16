/**
 * Entry of the profile page (legacy `profile.js`): auth guard, then the three cards.
 * A visitor who is not signed in is sent to the home page.
 */
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, type Timestamp } from 'firebase/firestore';

import type { UserDoc } from '../../types/firestore';
import { auth, db } from '../../lib/firebase/app';
import { renderAccountSection } from './account';
import { renderPlanSection } from './plan';
import { renderResultsSection } from './results';

/** After a Gumroad purchase the webhook needs a moment before the user document shows it. */
const UPGRADE_WAIT_MS = 3000;

async function initProfilePage(user: User): Promise<void> {
  const emailHeader = document.getElementById('profile-email-header');
  if (emailHeader) emailHeader.textContent = user.email;

  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    const userData: UserDoc<Timestamp> = snap.exists() ? (snap.data() as UserDoc<Timestamp>) : {};
    renderAccountSection(user, userData);
    renderPlanSection(user, userData);
    await renderResultsSection(user);
  } catch (e) {
    console.error('[Profile] Eroare inițializare profil:', e);
  }
}

export function initProfile(): void {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = './';
      return;
    }
    // Dacă userul vine înapoi de pe Gumroad, așteptăm 3s să proceseze webhookul, apoi reîncărcăm
    const params = new URLSearchParams(window.location.search);
    if (params.has('upgraded')) {
      history.replaceState(null, '', window.location.pathname);
      setTimeout(() => void initProfilePage(user), UPGRADE_WAIT_MS);
    } else {
      void initProfilePage(user);
    }
  });
}
