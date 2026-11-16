/**
 * Scroll shrink for the nav island (the legacy "Scroll shrink pentru nav island"
 * IIFE from main.js): toggles `scrolled` on the first `<header>` once the page is
 * scrolled past 40px. Same selector as legacy, so it applies to both the modern
 * and the classic header, exactly as main.js did on every page.
 */
export function initNavScroll(): void {
  const header = document.querySelector('header');
  if (!header) return;
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle('scrolled', window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );
}
