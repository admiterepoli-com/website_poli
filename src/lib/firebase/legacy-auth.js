// firebase-auth.js
// Copy of legacy/firebase-auth.js (issue #19). The only change: the CDN imports and the app
// initialisation were replaced by the npm SDK and ./app. Typed modules are extracted from this file
// by the following issues; do not add new code here.
import { onAuthStateChanged } from 'firebase/auth';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from './app';
import { applyBaremGate } from './barem-gate';
import { applyExamGate } from './exam-gate';
import { applySimulariPaidLinks } from './simulari-lock';
import { syncUserToFirestore } from './user-sync';
import { updatePricingButtons, updatePlanHighlight, bindPlanPicker, openUpgradeModal } from './plans';
import { injectModal, openModal, closeModal, showStep, clearError, onPlanStepShown } from './modal';
import { injectNavButton, injectMobileAuthItem, updateNavButton, bindAuthHandlers } from './auth';

// showStep('plan') repositions the plan highlight (./plans).
onPlanStepShown(updatePlanHighlight);

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

/* ── Inițializare ────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  injectNavButton();
  injectMobileAuthItem();
  injectModal();

  const overlay = document.getElementById('auth-modal-overlay');
  const trigger = document.getElementById('nav-auth-trigger');

  if (!trigger || !overlay) return;

  // Navbar, login, înregistrare, Google, logout (./auth)
  bindAuthHandlers();

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
