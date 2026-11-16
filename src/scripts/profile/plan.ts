/**
 * "Planul tău" card of the profile page (legacy `renderPlanSection` in `profile.js`): the current
 * plan, the Standard / Student Plus comparison, the plan picker for free accounts and the
 * subscription / one-time-payment notes for paid ones.
 *
 * The injected HTML is byte-identical to the legacy one; do not reformat the template literals.
 * Prices and Gumroad products come from `STUDENT_PLUS_OFFERS` instead of being written out again;
 * the resulting text is the legacy text.
 */
import type { Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';

import { STUDENT_PLUS_OFFERS } from '../../lib/firebase/offers';
import type { BillingId, UserDoc } from '../../types/firestore';
import { escHtml, formatRoDate, paidPlanOf, type PaidPlan } from './format';

const { monthly, preadmitere, admitere } = STUDENT_PLUS_OFFERS;

const PAID_PLAN_INFO: Record<PaidPlan, { name: string; price: string }> = {
  monthly: { name: 'Student Plus · Lunar', price: `${monthly.price} RON / lună` },
  preadmitere: {
    name: 'Student Plus · Până la Preadmitere',
    price: `${preadmitere.price} RON · plată unică`,
  },
  admitere: { name: 'Student Plus · Până la Admitere', price: `${admitere.price} RON · plată unică` },
  'legacy-3m': { name: 'Student Plus · 3 luni', price: 'plată unică' },
};

/** Gumroad checkout prefilled with the account email (no return URL, as on the legacy page). */
function checkoutUrl(billing: BillingId, email: string | null): string {
  return `${STUDENT_PLUS_OFFERS[billing].gumroadUrl}?wanted=true&email=${encodeURIComponent(String(email))}`;
}

/** Student Plus price shown in the comparison for each position of the billing toggle. */
const PRICE_LABELS: Record<BillingId, string> = {
  monthly: `${monthly.price} RON / lună`,
  preadmitere: `<s style="color:var(--muted);font-size:0.85em">${preadmitere.oldPrice} RON</s> ${preadmitere.price} RON · ${preadmitere.period}`,
  admitere: `<s style="color:var(--muted);font-size:0.85em">${admitere.oldPrice} RON</s> ${admitere.price} RON · ${admitere.period}`,
};

function isBillingId(value: string | undefined): value is BillingId {
  return value === 'monthly' || value === 'preadmitere' || value === 'admitere';
}

export function renderPlanSection(user: User, userData: UserDoc<Timestamp>): void {
  const container = document.getElementById('profile-plan-content');
  if (!container) return;

  const isTrial = userData.status === 'trial';
  const isTrialPending = userData.status === 'trial_pending';
  const isPaid = userData.status === 'paid' || userData.status === 'pending_cancellation';
  const isPendingCancellation = userData.status === 'pending_cancellation';
  const product = (isPaid && userData.gumroadProduct) || '';
  const paidPlan = paidPlanOf(product);
  const planName = isPaid ? PAID_PLAN_INFO[paidPlan].name : 'Standard';
  const planPrice = PAID_PLAN_INFO[paidPlan].price;
  const accessUntilDate =
    userData.accessUntil && typeof userData.accessUntil.toDate === 'function'
      ? userData.accessUntil.toDate()
      : null;
  const accessUntilText = accessUntilDate ? formatRoDate(accessUntilDate) : null;

  if (isTrial || isTrialPending) {
    const statusText = isTrialPending
      ? 'Acces simulare cumpărat · Premium activ din 9 mai, ora 08:00'
      : 'Trial activ · 9 mai – 12 mai';
    const badgeText = isTrialPending ? 'În așteptare' : 'Activ';
    const badgeStyle = isTrialPending ? 'background:var(--gold);color:#222' : '';

    const upgradeUrl = checkoutUrl('monthly', user.email);

    container.innerHTML = `
      <div class="profile-plan-current">
        Planul tău actual: <strong>Trial Simulare</strong>
        <span class="profile-plan-badge" style="${badgeStyle}">${badgeText}</span>
      </div>
      <p class="profile-muted" style="margin-top:0.75rem">${statusText}</p>
      <div style="margin-top:1.25rem">
        <p class="profile-label">Vrei acces permanent?</p>
        <p class="profile-muted">Fă upgrade la Student Plus pentru acces complet după expirarea trial-ului.</p>
        <a class="profile-btn-upgrade" href="${escHtml(upgradeUrl)}" target="_blank" rel="noopener noreferrer"
           style="margin-top:0.75rem;display:inline-block;text-decoration:none">
          Upgrade la Student Plus
        </a>
      </div>
    `;
    return;
  }

  const standardBenefits = [
    'Acces la toate subiectele și rezolvările',
    'Simulări gratuite cu autocorectare',
    'Rezultate salvate în profil',
  ];
  const plusBenefits = ['Tot ce include Standard', 'Acces la toate resursele premium', 'Suport prioritar'];

  const manageUrl = userData.gumroadSubscriptionId
    ? `https://gumroad.com/subscriptions/${encodeURIComponent(userData.gumroadSubscriptionId)}/manage`
    : null;

  const isSubscription = !!userData.gumroadSubscriptionId;

  const cancelSection = isPaid
    ? `
    <div class="profile-cancel-section">
      ${
        isSubscription
          ? `
        <p class="profile-label">Gestionare abonament</p>
        ${
          isPendingCancellation
            ? `<p class="profile-muted" style="color:var(--gold)">Abonamentul tău va expira pe <strong>${userData.pendingCancellationAt ? formatRoDate(new Date(userData.pendingCancellationAt)) : 'data din emailul Gumroad'}</strong>. Accesul rămâne activ până atunci.</p>`
            : `<a class="profile-btn-secondary" href="${manageUrl}" target="_blank" rel="noopener noreferrer">Gestionează abonamentul</a>`
        }
        <p class="profile-muted" style="margin-top:0.5rem">Pentru refund în primele 14 zile, scrie-ne la <a class="profile-cancel-link" href="mailto:admiterepoli@gmail.com">admiterepoli@gmail.com</a>.</p>
      `
          : `
        <p class="profile-label">Plată unică</p>
        <p class="profile-muted">${
          accessUntilText
            ? `Ai acces complet până pe <strong>${accessUntilText}</strong> inclusiv.`
            : 'Ai acces complet pe perioada planului cumpărat.'
        } Nu se reînnoiește automat.</p>
        <p class="profile-muted" style="margin-top:0.5rem">Dacă dorești un refund în primele 14 zile, scrie-ne la <a class="profile-cancel-link" href="mailto:admiterepoli@gmail.com">admiterepoli@gmail.com</a>.</p>
      `
      }
    </div>
  `
    : '';

  const upgradeSection = isPaid
    ? ''
    : `
    <div class="plan-toggle-wrap" style="margin-top:1rem">
      <div class="plan-toggle plan-toggle--3" id="profile-billing-toggle">
        <button class="plan-toggle-btn active" data-billing="monthly">Lunar</button>
        <button class="plan-toggle-btn" data-billing="preadmitere">Preadmitere</button>
        <button class="plan-toggle-btn" data-billing="admitere">Admitere</button>
        <div class="plan-toggle-slider"></div>
      </div>
    </div>
    <p class="profile-muted" style="text-align:center;margin-top:0.5rem">Toate prețurile includ TVA.</p>
    <button class="profile-btn-upgrade" id="btn-upgrade-plan">Upgrade la Student Plus</button>
  `;

  container.innerHTML = `
    <div class="profile-plan-current">
      Planul tău actual: <strong>${planName}</strong>
      ${
        isPendingCancellation
          ? '<span class="profile-plan-badge" style="background:var(--gold);color:#222">Expiră curând</span>'
          : isPaid
            ? '<span class="profile-plan-badge">Activ</span>'
            : ''
      }
    </div>
    <div class="profile-plan-compare">
      <div class="profile-plan-col ${!isPaid ? 'plan-col-active' : ''}">
        <div class="profile-plan-col-name">Standard</div>
        <div class="profile-plan-col-price">Gratuit</div>
        <ul class="profile-plan-benefits">
          ${standardBenefits.map((b) => `<li>${b}</li>`).join('')}
        </ul>
      </div>
      <div class="profile-plan-col ${isPaid ? 'plan-col-active' : ''}">
        <div class="profile-plan-col-name">Student Plus</div>
        <div class="profile-plan-col-price" id="profile-plus-price">${isPaid ? planPrice : PRICE_LABELS.monthly}</div>
        <ul class="profile-plan-benefits">
          ${plusBenefits.map((b) => `<li>${b}</li>`).join('')}
        </ul>
      </div>
    </div>
    ${upgradeSection}
    ${cancelSection}
  `;

  if (!isPaid) bindPlanPicker(user, container);
}

/** Plan picker of a free account: Standard / Student Plus columns and the billing toggle. */
function bindPlanPicker(user: User, container: HTMLElement): void {
  let billing: BillingId = 'monthly';
  let selectedPlan: 'standard' | 'plus' = 'standard';

  const cols = container.querySelectorAll<HTMLElement>('.profile-plan-col');
  const standardCol = cols[0];
  const plusCol = cols[1];
  const upgradeBtn = document.getElementById('btn-upgrade-plan');
  const priceEl = document.getElementById('profile-plus-price');
  const slider = container.querySelector<HTMLElement>('#profile-billing-toggle .plan-toggle-slider');
  const toggleBtns = [...container.querySelectorAll<HTMLElement>('#profile-billing-toggle .plan-toggle-btn')];
  if (!standardCol || !plusCol || !upgradeBtn || !priceEl || !slider) return;

  function selectPlan(plan: 'standard' | 'plus'): void {
    if (plan === selectedPlan || !standardCol || !plusCol || !upgradeBtn) return;
    selectedPlan = plan;

    standardCol.classList.toggle('plan-col-active', plan === 'standard');
    plusCol.classList.toggle('plan-col-active', plan === 'plus');

    if (plan === 'plus') {
      upgradeBtn.classList.add('plan-ready');
    } else {
      upgradeBtn.classList.remove('plan-ready', 'plan-animate');
    }
  }

  standardCol.addEventListener('click', () => selectPlan('standard'));
  plusCol.addEventListener('click', () => selectPlan('plus'));

  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.billing;
      if (next === billing || !isBillingId(next)) return;
      toggleBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      billing = next;

      slider.style.transform = `translateX(${toggleBtns.indexOf(btn) * 100}%)`;

      // PRICE_LABELS sunt constante din cod (nu date de la user), deci innerHTML e sigur.
      priceEl.innerHTML = PRICE_LABELS[billing];
    });
  });

  upgradeBtn.addEventListener('click', () => {
    if (selectedPlan !== 'plus') return;
    window.open(checkoutUrl(billing, user.email), '_blank', 'noopener,noreferrer');
  });
}
