/**
 * Cookie consent banner. INLINED into <head> by CookieConsent.astro and run
 * synchronously BEFORE the Google Analytics tag: until the visitor accepts,
 * analytics is switched off through the `ga-disable-*` flag.
 *
 * This file is compiled as a classic script (see src/lib/inline-script.ts):
 * no imports, no exports. Markup, ids, classes, texts and the storage key are
 * the same as in the legacy cookie-consent.js.
 */
(function () {
  type Consent = 'accepted' | 'rejected';
  const CONSENT_KEY = 'cookie_consent';
  const GA_DISABLE_FLAG = 'ga-disable-G-PC1VMXYCRN';

  function getConsent(): string | null {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch {
      return null;
    }
  }

  function saveConsent(value: Consent): void {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Storage unavailable (private mode): the banner will simply show again.
    }
  }

  function hideBanner(banner: HTMLElement): void {
    banner.classList.remove('cookie-banner-visible');
    setTimeout(function () {
      banner.parentNode?.removeChild(banner);
    }, 300);
  }

  // Blocăm GA4 dacă nu există consimțământ explicit
  if (getConsent() !== 'accepted') {
    window[GA_DISABLE_FLAG] = true;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (getConsent() !== null) return; // utilizatorul a ales deja

    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Consimțământ cookie-uri');
    banner.innerHTML =
      '<div class="cookie-banner-inner">' +
      '<p class="cookie-banner-text">' +
      'Folosim cookie-uri pentru analiză și îmbunătățirea experienței. ' +
      '<a href="./politica-confidentialitate" class="cookie-banner-link">Politică de confidențialitate</a>' +
      '</p>' +
      '<div class="cookie-banner-actions">' +
      '<button id="cookie-reject" class="cookie-btn-reject">Refuz</button>' +
      '<button id="cookie-accept" class="cookie-btn-accept">Accept</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(banner);
    requestAnimationFrame(function () {
      banner.classList.add('cookie-banner-visible');
    });

    document.getElementById('cookie-accept')?.addEventListener('click', function () {
      saveConsent('accepted');
      window[GA_DISABLE_FLAG] = false;
      hideBanner(banner);
    });

    document.getElementById('cookie-reject')?.addEventListener('click', function () {
      saveConsent('rejected');
      hideBanner(banner);
    });
  });
})();
