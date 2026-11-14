/** Sliding pill that follows the hovered link in the desktop nav (pages with `.lp-body`). */
export function initNavCursor(): void {
  const cursor = document.getElementById('nav-cursor');
  const nav = document.querySelector<HTMLElement>('.lp-body nav');
  if (!cursor || !nav) return;

  nav.querySelectorAll<HTMLAnchorElement>('ul a').forEach((link) => {
    link.addEventListener('mouseenter', () => {
      const navRect = nav.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      cursor.style.left = `${linkRect.left - navRect.left - 5}px`;
      cursor.style.width = `${linkRect.width}px`;
      cursor.style.opacity = '1';
    });
  });

  nav.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
}
