/**
 * "Informații cont" card of the profile page (legacy `renderAccountSection` in `profile.js`):
 * email, display name with its save button, and the password reset (or the Google note).
 * The injected HTML is byte-identical to the legacy one; do not reformat the template literals.
 */
import { sendPasswordResetEmail, updateProfile, type User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

import { auth, db } from '../../lib/firebase/app';
import { initialsOf } from './format';
import type { ProfileUserDoc } from './types';

export function renderAccountSection(user: User, userData: ProfileUserDoc): void {
  // Email
  const emailDisplay = document.getElementById('profile-email-display');
  if (emailDisplay) emailDisplay.textContent = user.email;

  // Nume afișat
  const nameInput = document.getElementById('profile-name-input');
  const nameField = nameInput instanceof HTMLInputElement ? nameInput : null;
  if (nameField && userData.displayName) nameField.value = userData.displayName;

  // Buton salvare nume
  const btnSaveName = document.getElementById('btn-save-name');
  const nameFeedback = document.getElementById('name-feedback');
  if (btnSaveName instanceof HTMLButtonElement) {
    btnSaveName.addEventListener('click', async () => {
      if (!nameField || !nameFeedback) return;
      const name = nameField.value.trim();
      if (!name) {
        nameFeedback.textContent = 'Introdu un nume valid.';
        nameFeedback.className = 'profile-feedback error';
        return;
      }
      btnSaveName.disabled = true;
      try {
        const userRef = doc(db, 'users', user.uid);
        await Promise.all([
          updateDoc(userRef, { displayName: name }),
          updateProfile(user, { displayName: name }),
        ]);
        nameFeedback.textContent = 'Nume salvat cu succes!';
        nameFeedback.className = 'profile-feedback success';

        // Actualizează inițialele în navbar fără reload
        const navTrigger = document.getElementById('nav-auth-trigger');
        if (navTrigger) navTrigger.textContent = initialsOf(name);
      } catch {
        nameFeedback.textContent = 'Eroare la salvare. Încearcă din nou.';
        nameFeedback.className = 'profile-feedback error';
      } finally {
        btnSaveName.disabled = false;
      }
    });
  }

  // Secțiunea parolă
  const passwordSection = document.getElementById('profile-password-section');
  if (!passwordSection) return;

  const isGoogle = user.providerData.some((p) => p.providerId === 'google.com');
  if (isGoogle) {
    passwordSection.innerHTML = `
      <label class="profile-label">Parolă</label>
      <p class="profile-value profile-muted">Contul tău este conectat prin Google. Parola este gestionată de Google.</p>
    `;
    return;
  }

  passwordSection.innerHTML = `
      <label class="profile-label">Parolă</label>
      <button class="profile-btn-secondary" id="btn-reset-password">Trimite email de resetare parolă</button>
      <p class="profile-feedback" id="password-feedback"></p>
    `;
  const btn = document.getElementById('btn-reset-password');
  const feedback = document.getElementById('password-feedback');
  if (!(btn instanceof HTMLButtonElement) || !feedback) return;
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    try {
      // Legacy passed `user.email` as it is; an account without an email cannot reset a password.
      await sendPasswordResetEmail(auth, user.email ?? '');
      feedback.textContent = `Email trimis la ${user.email}. Verifică-ți inbox-ul.`;
      feedback.className = 'profile-feedback success';
    } catch {
      feedback.textContent = 'Eroare la trimiterea emailului. Încearcă din nou.';
      feedback.className = 'profile-feedback error';
    } finally {
      btn.disabled = false;
    }
  });
}
