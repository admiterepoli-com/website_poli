/**
 * Plans: the pricing buttons of the landing page and the plan picker (step 2 of the auth modal).
 * Extracted from `legacy/firebase-auth.js` (issue #22). Labels, class names, the Gumroad targets and
 * the fields written to Firestore are unchanged.
 *
 * The plan picker markup is injected by `./modal`; this module only binds it and keeps the billing
 * toggle state (Lunar / Preadmitere / Admitere).
 */
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import type { BillingId, PlanId, UserDoc } from '../../types/firestore';
import { auth, db } from './app';
import { closeModal, showStep } from './modal';

/* ── Preţuri şi linkuri Gumroad ───────────────────────────────── */

/** What Student Plus costs for one billing option, and where it is bought. */
export interface StudentPlusOffer {
  /** Price in RON, VAT included. */
  price: number;
  /** Struck-through reference price in RON; `null` for the monthly subscription. */
  oldPrice: number | null;
  /** Discount badge next to the old price; `null` for the monthly subscription. */
  discount: string | null;
  /** Text after the price. */
  period: string;
  /** Gumroad product page. */
  gumroadUrl: string;
}

/**
 * Single source for the Student Plus prices and Gumroad products ("plans for year 2026").
 * The picker still reads the amounts from the `data-<billing>` attributes of the markup in `./modal`,
 * which must carry the same values.
 */
export const STUDENT_PLUS_OFFERS = {
  monthly: {
    price: 92,
    oldPrice: null,
    discount: null,
    period: '/lună',
    gumroadUrl: 'https://admiterepoli.gumroad.com/l/student-plus-lunar',
  },
  preadmitere: {
    price: 345,
    oldPrice: 460,
    discount: '-25%',
    period: 'până la Preadmitere',
    gumroadUrl: 'https://admiterepoli.gumroad.com/l/student-plus-preadmitere',
  },
  admitere: {
    price: 480,
    oldPrice: 736,
    discount: '-35%',
    period: 'până la Admitere',
    gumroadUrl: 'https://admiterepoli.gumroad.com/l/student-plus-admitere',
  },
} as const satisfies Record<BillingId, StudentPlusOffer>;

/** The Standard plan is free for every billing option. */
export const STANDARD_PLAN_PRICE = 0;

function isBillingId(value: string | undefined): value is BillingId {
  return value !== undefined && Object.hasOwn(STUDENT_PLUS_OFFERS, value);
}

/**
 * Gumroad checkout link for Student Plus, prefilled with the account email and returning to the
 * profile page. `returnUrl` is passed unencoded.
 */
export function studentPlusCheckoutUrl(billing: BillingId, email: string | null, returnUrl: string): string {
  // `String(null)` keeps the legacy output for an account without an email.
  return `${STUDENT_PLUS_OFFERS[billing].gumroadUrl}?wanted=true&email=${encodeURIComponent(String(email))}&redirect_url=${encodeURIComponent(returnUrl)}`;
}

/** `code` and `message` of a caught value, for the log lines the legacy code printed. */
function errorInfo(e: unknown): { code: unknown; message: unknown } {
  if (typeof e !== 'object' || e === null) return { code: undefined, message: undefined };
  return {
    code: 'code' in e ? e.code : undefined,
    message: 'message' in e ? e.message : undefined,
  };
}

/* ── Butoane pricing index.html ───────────────────────────────── */

function pricingButton(id: string): HTMLButtonElement | null {
  const el = document.getElementById(id);
  return el instanceof HTMLButtonElement ? el : null;
}

export async function updatePricingButtons(user: Pick<User, 'uid'> | null): Promise<void> {
  const btnStandard = pricingButton('oferim-btn-standard');
  const btnPlus = pricingButton('oferim-btn-plus');
  if (!btnStandard || !btnPlus) return; // nu suntem pe index.html

  const heroBtn = document.getElementById('hero-register-btn');

  if (!user) {
    // Deconectat — stare implicită
    if (heroBtn) heroBtn.textContent = 'Începe Acum';

    btnStandard.textContent = 'Creează cont';
    btnStandard.disabled = false;
    btnStandard.classList.remove('lp-btn-current');

    btnPlus.textContent = 'Începe cu Student Plus';
    btnPlus.disabled = false;
    btnPlus.classList.remove('lp-btn-current');
    return;
  }

  if (heroBtn) heroBtn.textContent = 'Intră în contul meu';

  let plan: PlanId = 'standard';
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      const data: UserDoc = snap.data();
      const isPaid = data.status === 'paid' || data.status === 'pending_cancellation';
      plan = isPaid ? 'student-plus' : 'standard';
    }
  } catch (e) {
    console.warn('[Auth] Nu s-a putut citi planul din Firestore:', errorInfo(e).message);
  }

  if (plan === 'student-plus') {
    btnStandard.textContent = 'Creează cont';
    btnStandard.disabled = false;
    btnStandard.classList.remove('lp-btn-current');

    btnPlus.textContent = 'Planul tău actual';
    btnPlus.disabled = true;
    btnPlus.classList.add('lp-btn-current');
  } else {
    // standard (gratuit)
    btnStandard.textContent = 'Planul tău actual';
    btnStandard.disabled = true;
    btnStandard.classList.add('lp-btn-current');

    btnPlus.textContent = 'Începe cu Student Plus';
    btnPlus.disabled = false;
    btnPlus.classList.remove('lp-btn-current');
  }
}

/* ── Plan picker helpers ────────────────────────────────────── */

let currentBilling: BillingId = 'monthly';

/** Billing option currently selected in the plan picker toggle. */
export function getCurrentBilling(): BillingId {
  return currentBilling;
}

export function updatePlanHighlight(): void {
  const cards = document.getElementById('plan-cards');
  const selected = cards?.querySelector('.plan-card.selected');
  const box = document.getElementById('plan-highlight-box');
  if (!selected || !box || !cards) return;

  const cardsRect = cards.getBoundingClientRect();
  const cardRect = selected.getBoundingClientRect();
  box.style.transform = `translateY(${cardRect.top - cardsRect.top}px)`;
  box.style.height = `${cardRect.height}px`;
}

export function updatePlanPrices(): void {
  document.querySelectorAll<HTMLElement>('.plan-amount').forEach((el) => {
    const value = el.getAttribute(`data-${currentBilling}`);
    animateNumber(el, parseInt(el.textContent ?? '', 10), parseInt(value ?? '', 10));
  });
  document
    .querySelectorAll<HTMLElement>('.plan-amount-old[data-monthly], .plan-sale-badge[data-monthly]')
    .forEach((el) => {
      el.textContent = el.getAttribute(`data-${currentBilling}`);
    });
  // Lunar e preţul de referinţă — rândul cu preţul tăiat apare doar la planurile fixe.
  document.querySelectorAll<HTMLElement>('.plan-price-old-row').forEach((el) => {
    el.hidden = currentBilling === 'monthly';
  });
  document.querySelectorAll<HTMLElement>('.plan-period').forEach((el) => {
    el.textContent = el.getAttribute(`data-${currentBilling}`);
  });
}

export function animateNumber(el: HTMLElement, from: number, to: number): void {
  if (from === to) return;
  const duration = 400;
  const start = performance.now();
  function tick(now: number): void {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = String(Math.round(from + (to - from) * eased));
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── Plan picker: toggle, carduri, confirmare ───────────────── */

/** Binds the plan picker injected by `injectModal`. Call once, after the modal is in the DOM. */
export function bindPlanPicker(): void {
  /* ── Plan billing toggle (Lunar / Preadmitere / Admitere) ──── */
  const planToggleBtns = document.querySelectorAll<HTMLElement>('.plan-toggle-btn');
  planToggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      const billing = btn.dataset.billing;
      if (!isBillingId(billing)) return;
      planToggleBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentBilling = billing;

      const slider = document.querySelector<HTMLElement>('#plan-toggle .plan-toggle-slider');
      const idx = [...planToggleBtns].indexOf(btn);
      if (slider) slider.style.transform = `translateX(${idx * 100}%)`;

      updatePlanPrices();
    });
  });

  /* ── Plan card selection ───────────────────────────────────── */
  const planCards = document.querySelectorAll<HTMLElement>('.plan-card');
  planCards.forEach((card) => {
    card.addEventListener('click', () => {
      planCards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      updatePlanHighlight();
    });
  });

  /* ── Plan selection confirm ────────────────────────────────── */
  const selectBtn = document.getElementById('btn-select-plan');
  if (!(selectBtn instanceof HTMLButtonElement)) return;
  selectBtn.addEventListener('click', async () => {
    const selected = document.querySelector<HTMLElement>('.plan-card.selected');
    const plan: PlanId = selected?.dataset.plan === 'student-plus' ? 'student-plus' : 'standard';
    const billing = currentBilling;
    selectBtn.disabled = true;

    const user = auth.currentUser;

    // Gumroad se deschide în tab nou SINCRON, direct în handler-ul de click —
    // după un await, browserul nu mai consideră deschiderea iniţiată de user
    // şi o blochează ca popup.
    if (plan === 'student-plus' && user) {
      const returnUrl = `${window.location.origin}/profil?upgraded=1`;
      window.open(studentPlusCheckoutUrl(billing, user.email, returnUrl), '_blank', 'noopener,noreferrer');
    }

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const selection: UserDoc = {
          selectedPlan: plan,
          selectedBilling: billing,
        };
        await setDoc(userRef, selection, { merge: true });
      } catch (e) {
        const { code, message } = errorInfo(e);
        console.error('[Auth] Nu s-a putut salva în Firestore:', code, message);
      }
    } else {
      console.warn('[Auth] auth.currentUser este null la selectarea planului');
    }

    selectBtn.disabled = false;
    closeModal();
  });
}

/** Opens the modal directly on the plan step. Exposed as `window.openUpgradeModal` (ex: exercitii-video). */
export function openUpgradeModal(): void {
  // Resetează la monthly și pre-selectează Student Plus
  currentBilling = 'monthly';
  document.querySelectorAll<HTMLElement>('.plan-toggle-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.billing === 'monthly');
  });
  const slider = document.querySelector<HTMLElement>('#plan-toggle .plan-toggle-slider');
  if (slider) slider.style.transform = 'translateX(0)';
  document.querySelectorAll<HTMLElement>('.plan-card').forEach((c) => {
    c.classList.toggle('selected', c.dataset.plan === 'student-plus');
  });
  updatePlanPrices();
  showStep('plan');
  document.getElementById('auth-modal-overlay')?.classList.add('open');
}
