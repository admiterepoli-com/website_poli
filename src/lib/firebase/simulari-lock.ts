/**
 * Locks of the paid simulations listed in the archive on `simulari.html`: the badge next to the
 * block title and the card that replaces the links of its dropdown. Extracted from
 * `legacy/firebase-auth.js` (issue #25). The injected HTML is byte-identical to the legacy one; do
 * not reformat the template literals.
 */
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import type { PaidSimulationId, UserDoc } from '../../types/firestore';
import { hasSimulationAccess, isSaleClosed } from './access';
import { db } from './app';
import { scheduleGateUnlock } from './exam-gate';

type GateUser = Pick<User, 'uid' | 'email'>;

/** One paid simulation of the archive. */
export interface PaidSimulationConfig {
  /** `id` of the block header on `simulari.html`. */
  headerId: string;
  /** `id` of the dropdown that holds the block's `.sub-links`. */
  dropdownId: string;
  /** Gumroad product permalink. */
  simId: PaidSimulationId;
  /** Name used in the lock card, e.g. `Simularea #4`. */
  label: string;
  /** Gumroad page of the separate purchase; `null` = only through the upgrade modal. */
  buyUrl: string | null;
  /** Simulation not opened yet: until then the entry is locked for everyone, payers included. */
  startsAt?: Date;
  /** Start time as shown in the "not started yet" card. */
  startLabel?: string;
}

/** A configured simulation whose header and dropdown exist on the current page. */
export interface SimulariBlock extends PaidSimulationConfig {
  header: HTMLElement;
  dropdown: HTMLElement;
}

/** `message` of a caught value, for the log line the legacy code printed. */
function errorMessage(e: unknown): unknown {
  return typeof e === 'object' && e !== null && 'message' in e ? e.message : undefined;
}

/** Markup of each dropdown before the first lock was rendered (legacy: `dropdown._originalHTML`). */
const originalDropdownHTML = new WeakMap<HTMLElement, string>();

/* ── Gate blocuri simulări plătite pe simulari.html ──────────── */

// Simulările plătite listate în arhivă. `simId` = product_permalink-ul Gumroad.
// `startsAt` (opţional) = simulare încă nedeschisă: intrarea apare în arhivă, dar
// cu lăcăt pentru toată lumea, inclusiv plătitori. Trebuie să rămână identic cu
// window.examGateStart din pagina simulării şi cu startsAt din pagina de barem.
export const PAID_SIMULATIONS: readonly PaidSimulationConfig[] = [
  {
    headerId: 'sim3-header',
    dropdownId: 'dropdown-arhiva-sim-3',
    simId: 'simulare_09_05',
    label: 'Simularea #3',
    buyUrl: null,
  },
  {
    headerId: 'sim4-header',
    dropdownId: 'dropdown-arhiva-sim-4',
    simId: 'simulare-21-07',
    label: 'Simularea #4',
    buyUrl: 'https://admiterepoli.gumroad.com/l/simulare-21-07',
    startsAt: new Date('2026-07-21T17:00:00+03:00'),
    startLabel: '21 iulie, ora 17:00',
  },
];

export async function applySimulariPaidLinks(user: GateUser | null): Promise<void> {
  const blocks: SimulariBlock[] = [];
  for (const cfg of PAID_SIMULATIONS) {
    const header = document.getElementById(cfg.headerId);
    const dropdown = document.getElementById(cfg.dropdownId);
    if (header && dropdown) blocks.push({ ...cfg, header, dropdown });
  }

  if (!blocks.length) return;

  let data: UserDoc | null = null;
  let fetchFailed = false;

  if (user) {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      data = snap.exists() ? snap.data() : {};
    } catch (e) {
      console.warn('[SimulariGate] Nu s-a putut verifica statusul:', errorMessage(e));
      fetchFailed = true;
    }
  }

  for (const block of blocks) {
    // fail-open: dacă citirea din Firestore crapă, nu blocăm userul autentificat
    const isPaid = fetchFailed || (!!data && hasSimulationAccess(data, block.simId));
    applySimulariLock(block, user, isPaid);
  }
}

export function applySimulariLock(block: SimulariBlock, user: GateUser | null, isPaid: boolean): void {
  const { header, dropdown, label, simId, startsAt, startLabel } = block;
  // După închiderea vânzării separate rămâne doar ruta Student Plus.
  const buyUrl = isSaleClosed(simId) ? null : block.buyUrl;

  let originalHTML = originalDropdownHTML.get(dropdown);
  if (!originalHTML) {
    originalHTML = dropdown.innerHTML;
    originalDropdownHTML.set(dropdown, originalHTML);
  }

  // Fiecare randare porneşte de la markup-ul original. Altfel, odată înlocuit
  // dropdown-ul, `.sub-links` dispare şi nu mai putem comuta între stări — iar
  // la ora de start chiar trebuie să comutăm (aşteptare → cumpără / linkuri).
  dropdown.innerHTML = originalHTML;
  header.querySelector('.sim-lock-badge')?.remove();

  // Înainte de start intrarea se vede în arhivă, dar închisă pentru toată lumea:
  // linkurile de barem/rezolvare n-au ce căuta la îndemână cât timp simularea
  // nu a început. Acelaşi prag ca applyBaremGate şi ca gate-ul paginii de simulare.
  const beforeStart = !!startsAt && new Date() < startsAt;

  if (isPaid && !beforeStart) return;

  const strong = header.querySelector('strong');
  if (strong) {
    const badge = document.createElement('span');
    badge.className = 'sim-lock-badge';
    badge.style.cssText = 'margin-left:0.6rem;font-size:1rem;opacity:0.8;vertical-align:middle;';
    badge.textContent = beforeStart ? '🕐' : '🔒';
    strong.appendChild(badge);
  }

  const subLinks = dropdown.querySelector('.sub-links');
  if (!subLinks) return;

  const buyBtn = buyUrl
    ? `<a href="${buyUrl}${user ? '?wanted=true&email=' + encodeURIComponent(user.email || '') : ''}" target="_blank" rel="noopener" style="display:inline-block;padding:0.6rem 1.4rem;background:var(--accent2);color:#fff;border-radius:8px;font-weight:600;font-size:0.95rem;text-decoration:none;">
        Cumpără acces
       </a>`
    : `<button onclick="openUpgradeModal()" style="padding:0.6rem 1.4rem;background:var(--accent2);color:#fff;border:none;border-radius:8px;font-weight:600;font-size:0.95rem;cursor:pointer;">
        Cumpără acces
       </button>`;

  const authButtons = user
    ? buyBtn
    : `<div style="display:flex;gap:0.75rem;flex-wrap:wrap;justify-content:center;">
        <button onclick="openModal()" style="padding:0.6rem 1.4rem;background:var(--accent);color:#fff;border:none;border-radius:8px;font-weight:600;font-size:0.95rem;cursor:pointer;">
          Autentifică-te
        </button>
        ${buyBtn}
      </div>`;

  const card = (icon: string, title: string, desc: string, actions: string): string =>
    `<div style="display:flex;flex-direction:column;align-items:center;gap:1rem;padding:2rem 1.5rem;text-align:center;">
      <div style="font-size:2.5rem;line-height:1;">${icon}</div>
      <h3 style="margin:0;color:#fff;font-size:1.15rem;">${title}</h3>
      <p style="margin:0;color:var(--muted);font-size:0.95rem;max-width:280px;line-height:1.5;">${desc}</p>
      ${actions}
    </div>`;

  if (startsAt && beforeStart) {
    subLinks.outerHTML = card(
      '🕐',
      'Nu a început încă',
      `${label} se deschide pe <strong style="color:#C3D5F0;">${startLabel}</strong>. Subiectul, baremul şi rezolvarea apar aici în acel moment.`,
      isPaid
        ? `<span style="padding:0.6rem 1.4rem;color:var(--accent3);font-weight:600;font-size:0.95rem;">Ai deja acces ✓</span>`
        : authButtons,
    );
    // La ora de start re-randăm: plătitorii primesc linkurile fără refresh.
    scheduleGateUnlock(startsAt, () => applySimulariPaidLinks(user));
    return;
  }

  subLinks.outerHTML = card(
    '🔒',
    'Acces restricționat',
    `${label} este disponibilă membrilor <strong style="color:#C3D5F0;">Student Plus</strong> sau prin cumpărare separată.`,
    authButtons,
  );
}
