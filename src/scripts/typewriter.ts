/**
 * Hero typewriter (the legacy "Typewriter hero" IIFE from main.js).
 *
 * A heading with `data-typewriter="<text>"` gets that text typed into it one
 * character at a time, ahead of its optional `.tw-cursor` child. Visitors who
 * prefer reduced motion get nothing typed; the stylesheet hides the cursor for
 * them.
 */
const TYPEWRITER_SELECTOR = '[data-typewriter]';
const TYPEWRITER_ATTRIBUTE = 'data-typewriter';
const CURSOR_SELECTOR = '.tw-cursor';

/** Pause before the first character, in milliseconds. */
export const START_DELAY_MS = 350;

/**
 * Delay in milliseconds before typing `ch`.
 * Viteze variabile: mai rapid pe litere comune, pauze la spații/punctuație.
 */
export function nextDelay(ch: string, random: () => number = Math.random): number {
  if (ch === ' ') return 80 + random() * 60;
  if (ch === '-') return 150 + random() * 80;
  if (/[A-Z]/.test(ch)) return 90 + random() * 50; // majuscule — mic efort
  return 55 + random() * 45;
}

export function initTypewriter(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const h1 = document.querySelector<HTMLElement>(TYPEWRITER_SELECTOR);
  if (!h1) return;

  const fullText = h1.getAttribute(TYPEWRITER_ATTRIBUTE) ?? '';
  const cursor = h1.querySelector(CURSOR_SELECTOR);

  // Scoate cursorul temporar ca să tipărim înaintea lui
  if (cursor) h1.insertBefore(document.createTextNode(''), cursor);

  let textNode: ChildNode;
  const first = h1.firstChild;
  if (first && first.nodeType === Node.TEXT_NODE) {
    textNode = first;
  } else {
    textNode = document.createTextNode('');
    h1.insertBefore(textNode, cursor);
  }

  let i = 0;

  function type(): void {
    if (i >= fullText.length) return;
    // Ca în legacy, avansăm pe unități UTF-16 (`fullText[i]`).
    textNode.textContent = (textNode.textContent ?? '') + fullText.charAt(i);
    i++;
    if (i < fullText.length) setTimeout(type, nextDelay(fullText.charAt(i)));
  }

  // Pornește după 350ms
  setTimeout(type, START_DELAY_MS);
}
