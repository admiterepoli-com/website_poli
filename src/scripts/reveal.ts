/**
 * Scheduled reveal (the legacy `revealScheduled` IIFE from main.js).
 *
 * Elements with `data-reveal-after="<date>"` start with `style="display:none"`
 * in the HTML (so nothing flashes while the page loads) and are shown once that
 * date has passed. Unlike the legacy script, which only looked at the clock
 * when the page loaded, a timer also reveals them for a visitor who keeps the
 * page open across the moment.
 */
const REVEAL_SELECTOR = '[data-reveal-after]';
const REVEAL_ATTRIBUTE = 'data-reveal-after';

/** The longest delay `setTimeout` accepts; a longer one fires immediately. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/** The part of an `HTMLElement` this script touches. */
export interface RevealTarget {
  readonly dataset: { readonly revealAfter?: string };
  readonly style: { display: string };
  removeAttribute(name: string): void;
}

/**
 * Shows every target whose date has passed and returns the earliest date
 * (epoch milliseconds) still in the future, or `null` when nothing is left to
 * reveal. A target with a missing or unparsable date stays hidden for good.
 */
export function revealScheduled(targets: Iterable<RevealTarget>, now: number = Date.now()): number | null {
  let next: number | null = null;

  for (const el of targets) {
    const at = new Date(el.dataset.revealAfter ?? '').getTime();
    if (Number.isNaN(at)) continue;

    if (now >= at) {
      // Restaurăm display-ul la '' — nu la 'block' — ca să nu rupem regulile de clasă.
      el.style.display = '';
      el.removeAttribute(REVEAL_ATTRIBUTE);
    } else if (next === null || at < next) {
      next = at;
    }
  }

  return next;
}

let initialised = false;

export function initScheduledReveal(): void {
  // Componenta poate apărea de mai multe ori pe pagină; pornim o singură dată.
  if (initialised) return;
  initialised = true;

  function run(): void {
    const now = Date.now();
    const next = revealScheduled(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR), now);
    // Elementele afişate şi-au pierdut atributul, deci următoarea trecere le sare.
    if (next !== null) setTimeout(run, Math.min(next - now, MAX_TIMEOUT_MS));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}
