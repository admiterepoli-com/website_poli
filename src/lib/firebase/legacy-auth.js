// firebase-auth.js
// Copy of legacy/firebase-auth.js (issue #19). The only change: the CDN imports and the app
// initialisation were replaced by the npm SDK and ./app. Typed modules are extracted from this file
// by the following issues; do not add new code here.
import {
  onAuthStateChanged,
  signInWithPopup,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from './app';
import { applyBaremGate } from './barem-gate';
import { applyExamGate } from './exam-gate';
import { applySimulariPaidLinks } from './simulari-lock';
import { syncUserToFirestore } from './user-sync';
import { updatePricingButtons, updatePlanHighlight, bindPlanPicker, openUpgradeModal } from './plans';
import {
  injectModal,
  openModal,
  closeModal,
  showStep,
  showError,
  clearError,
  friendlyError,
  onPlanStepShown,
} from './modal';

// showStep('plan') repositions the plan highlight (./plans).
onPlanStepShown(updatePlanHighlight);

const googleProvider = new GoogleAuthProvider();

/* ── HTML injectat în DOM ─────────────────────────────────────── */

function injectNavButton() {
  // Inject avatar into .nav-header-actions so it inherits the correct grid column
  const actions = document.querySelector('.nav-header-actions');
  const header = document.querySelector('header');
  const anchor = actions || header;
  if (!anchor) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'nav-auth-wrapper';
  wrapper.style.display = 'none'; // Hidden until user is logged in
  wrapper.innerHTML = `
    <button class="nav-auth-pill" id="nav-auth-trigger"></button>
    <div class="auth-user-dropdown" id="auth-user-dropdown">
      <div class="auth-email" id="auth-user-email"></div>
      <a href="./profil" class="auth-dropdown-link" id="btn-profile">Profilul meu</a>
      <button id="btn-logout">Deconectare</button>
    </div>
  `;

  anchor.appendChild(wrapper);
}

function injectMobileAuthItem() {
  const navElements = document.querySelector('.nav-elements');
  if (!navElements) return;
  const li = document.createElement('li');
  li.id = 'nav-auth-mobile-li';
  li.innerHTML = `
    <button class="nav-auth-mobile-btn" id="nav-auth-mobile-btn">Înregistrează-te</button>
    <div class="nav-auth-mobile-user" id="nav-auth-mobile-user">
      <span class="nav-auth-mobile-email" id="nav-auth-mobile-email"></span>
      <a href="./profil" class="nav-auth-mobile-profile">Profilul meu</a>
      <button class="nav-auth-mobile-logout" id="btn-logout-mobile">Deconectare</button>
    </div>
  `;
  navElements.appendChild(li);
}

function closeHamburger() {
  document.querySelector('.hamburger')?.classList.remove('active');
  document.querySelector('.nav-elements')?.classList.remove('active');
}

/* ── Salvare rezultat simulare în Firestore ──────────────────── */

async function saveSimulationResult(simulationId, data) {
  const user = auth.currentUser;
  if (!user) return; // utilizator neautentificat — silent fail
  try {
    const resultRef = doc(db, 'users', user.uid, 'simulationResults', simulationId);
    // Paginile de simulare trimit `scoreDisc` (info SAU fizică, în funcţie de track).
    // Îl salvăm ca `scoreInfo` pentru că asta citeşte profile.js. Fallback la 0:
    // setDoc aruncă la `undefined` şi ar pica salvarea întregului rezultat.
    await setDoc(
      resultRef,
      {
        simulationId,
        track: data.track ?? null,
        title: data.title ?? simulationId,
        scoreTotal: data.scoreTotal ?? 0,
        scoreInfo: data.scoreInfo ?? data.scoreDisc ?? 0,
        scoreMate: data.scoreMate ?? 0,
        completedAt: serverTimestamp(),
        timeElapsed: data.timeElapsed ?? 0,
      },
      { merge: true },
    );
    console.log('[Profile] Rezultat salvat pentru', simulationId);
  } catch (e) {
    console.error('[Profile] Eroare salvare rezultat:', e);
  }
}

window.saveSimulationResult = saveSimulationResult;

/* ── Google Sign-In (popup pe toate platformele) ─────────────── */

async function googleSignIn() {
  const result = await signInWithPopup(auth, googleProvider);
  const isNewUser = getAdditionalUserInfo(result)?.isNewUser ?? true;
  if (isNewUser) {
    showStep('plan');
  } else {
    closeModal();
  }
}

/* ── Actualizează navbar după schimbarea stării auth ─────────── */

function updateNavButton(user) {
  const trigger = document.getElementById('nav-auth-trigger');
  const dropdown = document.getElementById('auth-user-dropdown');
  const emailEl = document.getElementById('auth-user-email');
  const wrapper = document.getElementById('nav-auth-wrapper');
  if (wrapper) wrapper.style.display = user ? 'flex' : 'none';

  const headerSignup = document.getElementById('header-signup-btn');
  if (headerSignup) headerSignup.style.display = user ? 'none' : '';

  if (trigger) {
    if (user) {
      const displayName = (user.displayName || '').trim();
      const initials = displayName
        ? displayName
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : (user.email || '?')[0].toUpperCase();
      trigger.textContent = initials;
      trigger.classList.add('auth-logged-in');
      if (emailEl) emailEl.textContent = user.email;
    } else {
      trigger.classList.remove('auth-logged-in');
      if (dropdown) dropdown.classList.remove('open');
    }
  }

  const mobileBtn = document.getElementById('nav-auth-mobile-btn');
  const mobileUser = document.getElementById('nav-auth-mobile-user');
  const mobileEmail = document.getElementById('nav-auth-mobile-email');
  if (mobileBtn) mobileBtn.style.display = user ? 'none' : '';
  if (mobileUser) mobileUser.style.display = user ? 'flex' : 'none';
  if (mobileEmail) mobileEmail.textContent = user ? user.displayName || user.email : '';
}

/* ── Inițializare ────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  injectNavButton();
  injectMobileAuthItem();
  injectModal();

  const overlay = document.getElementById('auth-modal-overlay');
  const trigger = document.getElementById('nav-auth-trigger');
  const dropdown = document.getElementById('auth-user-dropdown');
  const wrapper = document.getElementById('nav-auth-wrapper');

  if (!trigger || !overlay) return;

  // Ghost "Autentificare" → deschide modal pe tab-ul Login
  document.getElementById('nav-auth-signin')?.addEventListener('click', () => {
    openModal();
  });

  // CTA "Înregistrează-te" → deschide modal pe tab-ul Register; avatar → dropdown
  trigger.addEventListener('click', () => {
    if (auth.currentUser) {
      dropdown.classList.toggle('open');
    } else {
      openModal();
      requestAnimationFrame(() => {
        document.querySelector('.auth-toggle-btn[data-tab="register"]')?.click();
      });
    }
  });

  // Închide dropdown la click în afară
  document.addEventListener('click', (e) => {
    if (dropdown && wrapper && !wrapper.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });

  // Închide modal
  document.getElementById('auth-close-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  /* ── Auth toggle (Login / Register) cu slider animat ────────── */
  document.querySelectorAll('.auth-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      clearError('login');
      clearError('register');
      document.querySelectorAll('.auth-toggle-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.auth-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`auth-panel-${btn.dataset.tab}`).classList.add('active');

      const toggle = document.getElementById('auth-toggle');
      const slider = toggle.querySelector('.auth-toggle-slider');
      const idx = btn.dataset.tab === 'register' ? 1 : 0;
      slider.style.transform = `translateX(${idx * 100}%)`;
    });
  });

  bindPlanPicker();

  // Enter pe câmpurile de login/register
  ['login-email', 'login-password'].forEach((id) => {
    document.getElementById(id).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-login-email').click();
    });
  });
  ['register-email', 'register-password'].forEach((id) => {
    document.getElementById(id).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-register-email').click();
    });
  });

  // Login email/parolă
  document.getElementById('btn-login-email').addEventListener('click', async () => {
    clearError('login');
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    if (!email || !password) {
      showError('login', 'Completează email-ul și parola.');
      return;
    }
    const btn = document.getElementById('btn-login-email');
    btn.disabled = true;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      closeModal();
    } catch (e) {
      showError('login', friendlyError(e.code));
    } finally {
      btn.disabled = false;
    }
  });

  // Login Google
  document.getElementById('btn-login-google').addEventListener('click', async () => {
    clearError('login');
    const btn = document.getElementById('btn-login-google');
    btn.disabled = true;
    try {
      await googleSignIn();
    } catch (e) {
      console.error('[Auth] Google login error:', e.code, e.message);
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        showError('login', friendlyError(e.code));
      }
    } finally {
      btn.disabled = false;
    }
  });

  // Register email/parolă
  document.getElementById('btn-register-email').addEventListener('click', async () => {
    clearError('register');
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;
    if (!email || !password) {
      showError('register', 'Completează email-ul și parola.');
      return;
    }
    const btn = document.getElementById('btn-register-email');
    btn.disabled = true;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(user);
      showStep('plan');
    } catch (e) {
      showError('register', friendlyError(e.code));
    } finally {
      btn.disabled = false;
    }
  });

  // Register Google (același flux ca login)
  document.getElementById('btn-register-google').addEventListener('click', async () => {
    clearError('register');
    const btn = document.getElementById('btn-register-google');
    btn.disabled = true;
    try {
      await googleSignIn();
    } catch (e) {
      console.error('[Auth] Google register error:', e.code, e.message);
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        showError('register', friendlyError(e.code));
      }
    } finally {
      btn.disabled = false;
    }
  });

  // Logout
  document.getElementById('btn-logout').addEventListener('click', async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('[Auth] signOut error:', e);
    } finally {
      dropdown.classList.remove('open');
    }
  });

  // Header Sign Up button (outside nav pill)
  document.getElementById('header-signup-btn')?.addEventListener('click', () => {
    openModal();
    requestAnimationFrame(() => {
      document.querySelector('.auth-toggle-btn[data-tab="register"]')?.click();
    });
  });

  // Hero "Începe Acum" / "Intră în contul meu" button
  document.getElementById('hero-register-btn')?.addEventListener('click', () => {
    if (auth.currentUser) {
      window.location.href = './profil';
      return;
    }
    openModal();
    requestAnimationFrame(() => {
      document.querySelector('.auth-toggle-btn[data-tab="register"]')?.click();
    });
  });

  // Pricing — "Creează cont" (Standard plan)
  document.getElementById('oferim-btn-standard')?.addEventListener('click', () => {
    openModal();
    requestAnimationFrame(() => {
      document.querySelector('.auth-toggle-btn[data-tab="register"]')?.click();
    });
  });

  // Pricing — "Începe cu Student Plus"
  document.getElementById('oferim-btn-plus')?.addEventListener('click', () => {
    if (auth.currentUser) {
      // Already logged in → go straight to plan selection
      openModal();
      requestAnimationFrame(() => showStep('plan'));
    } else {
      // Not logged in → register first, plan step shows automatically after register
      openModal();
      requestAnimationFrame(() => {
        document.querySelector('.auth-toggle-btn[data-tab="register"]')?.click();
      });
    }
  });

  // Mobile menu — Contul meu
  document.getElementById('nav-auth-mobile-btn')?.addEventListener('click', () => {
    closeHamburger();
    openModal();
  });

  // Mobile menu — Deconectare
  document.getElementById('btn-logout-mobile')?.addEventListener('click', async () => {
    closeHamburger();
    try {
      await signOut(auth);
    } catch (e) {
      console.error('[Auth] signOut error:', e);
    }
  });

  window.openModal = openModal;

  // Listener stare auth
  onAuthStateChanged(auth, async (user) => {
    updateNavButton(user);
    if (user) syncUserToFirestore(user, 'standard', 'monthly');
    await Promise.all([
      updatePricingButtons(user),
      applyExamGate(user),
      applySimulariPaidLinks(user),
      applyBaremGate(user),
    ]);
  });

  // Expune openUpgradeModal global pentru alte pagini (ex: exercitii-video)
  window.openUpgradeModal = openUpgradeModal;
});
