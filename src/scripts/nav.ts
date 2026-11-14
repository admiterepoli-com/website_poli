/** Mobile hamburger menu: toggles the nav and closes it when a link is chosen. */
export function initNav(): void {
  const hamburger = document.querySelector<HTMLElement>('.hamburger');
  const navMenu = document.querySelector<HTMLElement>('.nav-elements');
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  document.querySelectorAll<HTMLAnchorElement>('nav li a').forEach((link) =>
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }),
  );
}
