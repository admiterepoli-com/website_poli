/**
 * Info card accordion on `informatii` (the legacy `initInfoCards` from
 * main.js).
 *
 * A click on an `.info-card` opens it and closes every other card; a click on
 * the open card closes it. Clicks on a link inside a card are left alone, so
 * the link works without toggling the card. The expand/collapse animation is
 * pure CSS, driven by the `active` class on the card.
 *
 * Usage (from the page, as a module script):
 *
 *   import { initInfoCards } from '../scripts/info-cards';
 *   initInfoCards();
 */
const CARD_SELECTOR = '.info-card';
const ACTIVE_CLASS = 'active';

let initialised = false;

function bindCards(): void {
  document.querySelectorAll<HTMLElement>(CARD_SELECTOR).forEach((card) => {
    card.addEventListener('click', (event) => {
      // Nu comuta cardul dacă s-a dat click pe un link din interior
      const target = event.target;
      if (target instanceof Element && target.closest('a')) return;

      const isActive = card.classList.contains(ACTIVE_CLASS);
      // Închide toate celelalte carduri
      document
        .querySelectorAll(`${CARD_SELECTOR}.${ACTIVE_CLASS}`)
        .forEach((open) => open.classList.remove(ACTIVE_CLASS));
      if (!isActive) card.classList.add(ACTIVE_CLASS);
    });
  });
}

export function initInfoCards(): void {
  // Legăm handler-ele o singură dată, chiar dacă funcția e apelată de mai multe ori.
  if (initialised) return;
  initialised = true;

  // Legacy-ul lega handler-ele la DOMContentLoaded; un script modul rulează după parsare.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindCards);
  } else {
    bindCards();
  }
}
