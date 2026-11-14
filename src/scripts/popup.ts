/**
 * WhatsApp group popup ("newsletter popup"). Shown 12 seconds after load, at
 * most once every 24 hours, and never on top of the auth modal.
 * Storage key and timings are the same as in the legacy main.js.
 */
const STORAGE_KEY = 'newsletter_last_shown';
const COOLDOWN_MS = 86_400_000; // 24 ore
const SHOW_DELAY_MS = 12_000;

type DismissAction = 'close-btn' | 'dismiss-link' | 'whatsapp-link' | 'outside-click';

export function initPopup(): void {
  const popup = document.getElementById('newsletter-popup');
  if (!popup) return; // Pagina nu are popup, ieșim

  // Ascunde popup-ul și salvează timestamp-ul curent în localStorage.
  // Apelată indiferent de modul în care utilizatorul interacționează.
  function dismissPopup(action: DismissAction): void {
    if (!popup) return;
    popup.classList.remove('active');
    // Așteptăm animația de fade-out înainte de display:none
    setTimeout(() => {
      popup.style.display = 'none';
    }, 300);

    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch (error) {
      console.warn('[Popup] Nu s-a putut salva în localStorage:', error);
    }
    console.log('[Popup] Închis via:', action);
  }

  // Afișează popup-ul dacă nu au trecut 24 de ore de la ultima interacțiune.
  function tryShowPopup(): void {
    let lastShownTime = 0;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) lastShownTime = parseInt(stored, 10) || 0;
    } catch (error) {
      console.warn('[Popup] Nu s-a putut citi localStorage:', error);
    }

    if (Date.now() - lastShownTime <= COOLDOWN_MS) return;

    setTimeout(() => {
      if (!popup) return;
      const authModal = document.getElementById('auth-modal-overlay');
      if (authModal?.classList.contains('open')) return;
      popup.style.display = 'flex';
      // Micro-delay pentru a declanșa tranziția CSS
      setTimeout(() => popup.classList.add('active'), 10);
    }, SHOW_DELAY_MS);
  }

  tryShowPopup();

  popup.querySelector('.close-btn')?.addEventListener('click', () => dismissPopup('close-btn'));

  popup.querySelector('.dismiss-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    dismissPopup('dismiss-link');
  });

  // Nu prevenim navigarea (target="_blank"): browser-ul deschide grupul WA în
  // tab nou, iar popup-ul se închide în background.
  document.getElementById('whatsapp-link')?.addEventListener('click', () => dismissPopup('whatsapp-link'));

  window.addEventListener('click', (event) => {
    if (event.target === popup) dismissPopup('outside-click');
  });
}
