/**
 * Access rules for the paid simulations, extracted from `legacy/firebase-auth.js`.
 *
 * Pure functions: no Firebase import, no DOM. They decide from the `users/{uid}` document that the
 * caller has already read.
 */
import { PAID_STATUSES, type UserDoc } from '../../types/firestore';

/** Statuses that unlock all premium content, as plain strings so any stored value can be looked up. */
const paidStatuses: readonly string[] = PAID_STATUSES;

/**
 * Whether the account may open the simulation `simId` (a Gumroad product permalink).
 *
 * - A paid status (`paid`, `pending_cancellation`, `trial`) unlocks everything.
 * - Otherwise the simulation must be listed in `purchasedSimulations`.
 *
 * As in the legacy code, `accessUntil` is not consulted here: when a fixed-term plan ends, the Cloud
 * Functions move the account back to `free`, and that status is what closes the access.
 */
export function hasSimulationAccess(data: UserDoc | null | undefined, simId?: string | null): boolean {
  const status: string = data?.status || 'free';
  if (paidStatuses.includes(status)) return true;
  const purchased: unknown = data?.purchasedSimulations;
  return !!simId && Array.isArray(purchased) && purchased.includes(simId);
}

/* Simulări cu vânzare limitată în timp. După momentul de aici, butoanele de
   „Cumpără acces" dispar din gate-ul paginii de simulare şi din arhiva de pe
   simulari.html. Cheia = product_permalink-ul Gumroad (window.simulationId).
   Atenţie: e doar gating de UI — oprirea reală a vânzării se face din Gumroad
   (unpublish produs), altfel linkul direct rămâne funcţional. */
export const SIMULATION_SALE_END: Readonly<Record<string, Date>> = {
  // Vineri, 24 iulie 2026, ora 10:00 — acelaşi moment cu PUBLIC_AT din index.html
  // şi cu data-reveal-after a blocului de arhivă din simulari.html. Cele trei
  // trebuie să rămână identice: în clipa în care baremul devine public în arhivă,
  // butoanele de cumpărare trebuie să dispară.
  'simulare-21-07': new Date('2026-07-24T10:00:00+03:00'),
};

/**
 * Whether the sale window of `simId` has ended. Simulations without an entry in
 * `SIMULATION_SALE_END` never close. `now` exists for tests; callers omit it.
 */
export function isSaleClosed(simId?: string | null, now: Date = new Date()): boolean {
  const end = simId && Object.hasOwn(SIMULATION_SALE_END, simId) ? SIMULATION_SALE_END[simId] : null;
  return !!end && now >= end;
}
