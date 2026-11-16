/**
 * Video modal of the exercitii-video page (legacy `openVideoModal` / `closeVideoModal`).
 * The modal markup is in the page; this module fills and toggles it.
 */

function el(id: string): HTMLElement | null {
  return document.getElementById(id);
}

export function openVideoModal(videoId: string, num: string, title: string, statement: string): void {
  const overlay = el('ev-modal-overlay');
  const video = el('ev-modal-video');
  const numEl = el('ev-modal-num');
  const titleEl = el('ev-modal-title');
  const stmtEl = el('ev-modal-statement');
  if (!overlay || !video || !numEl || !titleEl || !stmtEl) return;

  numEl.textContent = `Lecția ${num}`;
  titleEl.textContent = title;
  stmtEl.textContent = statement || '—';
  video.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" allowfullscreen allow="autoplay; encrypted-media" title="${title}"></iframe>`;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeVideoModal(): void {
  const overlay = el('ev-modal-overlay');
  const video = el('ev-modal-video');
  overlay?.classList.remove('open');
  document.body.style.overflow = '';
  // stop video
  if (video) video.innerHTML = '';
}

/** Close button, click on the backdrop and Escape. */
export function bindVideoModal(): void {
  const overlay = el('ev-modal-overlay');
  el('ev-modal-close')?.addEventListener('click', closeVideoModal);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeVideoModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideoModal();
  });
}
