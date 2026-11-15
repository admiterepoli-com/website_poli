/**
 * The single auth module loaded by `BaseLayout` on ported pages, in place of the legacy
 * `<script type="module" src="./firebase-auth.js">`.
 *
 * It is the init block of `legacy/firebase-auth.js` (issue #27): it injects the navbar button and the
 * modal, wires the handlers that belong to no single feature module (closing the modal, the
 * Login / Register toggle, the hero and pricing buttons), exposes the `window` bridge used by inline
 * handlers and legacy simulation pages, and starts the auth state listener. Everything else lives in
 * the typed modules next to this file.
 */
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './app';
import { injectNavButton, injectMobileAuthItem, updateNavButton, bindAuthHandlers } from './auth';
import { applyBaremGate } from './barem-gate';
import { applyExamGate } from './exam-gate';
import { injectModal, openModal, closeModal, showStep, clearError, onPlanStepShown } from './modal';
import { updatePricingButtons, updatePlanHighlight, bindPlanPicker, openUpgradeModal } from './plans';
import { saveSimulationResult } from './results';
import { applySimulariPaidLinks } from './simulari-lock';
import { syncUserToFirestore } from './user-sync';

// showStep('plan') repositions the plan highlight (./plans).
onPlanStepShown(updatePlanHighlight);

// Assigned while the module is evaluated, not on DOMContentLoaded: simulation pages call it.
window.saveSimulationResult = saveSimulationResult;

/** Opens the modal and switches it to the Register tab on the next frame. */
function openModalOnRegister(): void {
  openModal();
  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>('.auth-toggle-btn[data-tab="register"]')?.click();
  });
}

/* ── Inițializare ────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  injectNavButton();
  injectMobileAuthItem();
  injectModal();

  const overlay: HTMLElement | null = document.getElementById('auth-modal-overlay');
  const trigger: HTMLElement | null = document.getElementById('nav-auth-trigger');

  if (!trigger || !overlay) return;

  // Navbar, login, înregistrare, Google, logout (./auth)
  bindAuthHandlers();

  // Închide modal. `injectModal` always creates the button; the legacy code dereferenced it without a
  // check, so a missing one stops the wiring here as it did there.
  const closeBtn: HTMLElement | null = document.getElementById('auth-close-btn');
  if (!closeBtn) throw new TypeError('[Auth] Lipsește elementul #auth-close-btn');
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  /* ── Auth toggle (Login / Register) cu slider animat ────────── */
  document.querySelectorAll<HTMLElement>('.auth-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      clearError('login');
      clearError('register');
      document.querySelectorAll('.auth-toggle-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.auth-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      // The legacy handler threw at the first missing element; stop at the same point.
      const panel: HTMLElement | null = document.getElementById(`auth-panel-${btn.dataset.tab}`);
      if (!panel) return;
      panel.classList.add('active');

      const slider = document
        .getElementById('auth-toggle')
        ?.querySelector<HTMLElement>('.auth-toggle-slider');
      if (!slider) return;
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
    openModalOnRegister();
  });

  // Pricing — "Creează cont" (Standard plan)
  document.getElementById('oferim-btn-standard')?.addEventListener('click', openModalOnRegister);

  // Pricing — "Începe cu Student Plus"
  document.getElementById('oferim-btn-plus')?.addEventListener('click', () => {
    if (auth.currentUser) {
      // Already logged in → go straight to plan selection
      openModal();
      requestAnimationFrame(() => showStep('plan'));
    } else {
      // Not logged in → register first, plan step shows automatically after register
      openModalOnRegister();
    }
  });

  window.openModal = openModal;

  // Listener stare auth
  onAuthStateChanged(auth, async (user) => {
    updateNavButton(user);
    // Not awaited, as in the legacy code: the gates below must not wait for the profile sync.
    if (user) void syncUserToFirestore(user, 'standard', 'monthly');
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
