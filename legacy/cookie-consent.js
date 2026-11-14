(function () {
  var CONSENT_KEY = 'cookie_consent';
  var GA_ID = 'G-PC1VMXYCRN';

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function saveConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  }

  // Blocăm GA4 dacă nu există consimțământ explicit
  if (getConsent() !== 'accepted') {
    window['ga-disable-' + GA_ID] = true;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (getConsent() !== null) return; // utilizatorul a ales deja

    var banner = document.createElement('div');
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
    requestAnimationFrame(function () { banner.classList.add('cookie-banner-visible'); });

    document.getElementById('cookie-accept').addEventListener('click', function () {
      saveConsent('accepted');
      window['ga-disable-' + GA_ID] = false;
      hideBanner(banner);
    });

    document.getElementById('cookie-reject').addEventListener('click', function () {
      saveConsent('rejected');
      hideBanner(banner);
    });
  });

  function hideBanner(banner) {
    banner.classList.remove('cookie-banner-visible');
    setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 300);
  }
})();
