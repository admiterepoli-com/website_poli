// firebase-auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAml8nJ8UOh9wrIhI6f-3K6-tOaPYLz_c4",
  authDomain: "admiterepoli-715cb.firebaseapp.com",
  projectId: "admiterepoli-715cb",
  storageBucket: "admiterepoli-715cb.firebasestorage.app",
  messagingSenderId: "91434186818",
  appId: "1:91434186818:web:1617d5a2d53b2fea2a95db",
  measurementId: "G-CQJCR937EB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app, 'admiterepoli');

/* ── Butoane pricing index.html ───────────────────────────────── */

async function updatePricingButtons(user) {
  const btnStandard = document.getElementById('oferim-btn-standard');
  const btnPlus     = document.getElementById('oferim-btn-plus');
  if (!btnStandard || !btnPlus) return; // nu suntem pe index.html

  const heroBtn = document.getElementById('hero-register-btn');

  if (!user) {
    // Deconectat — stare implicită
    if (heroBtn) heroBtn.textContent = 'Începe Acum';

    btnStandard.textContent = 'Creează cont';
    btnStandard.disabled    = false;
    btnStandard.classList.remove('lp-btn-current');

    btnPlus.textContent = 'Începe cu Student Plus';
    btnPlus.disabled    = false;
    btnPlus.classList.remove('lp-btn-current');
    return;
  }

  if (heroBtn) heroBtn.textContent = 'Intră în contul meu';

  let plan = 'standard';
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      const data = snap.data();
      const isPaid = data.status === 'paid' || data.status === 'pending_cancellation';
      plan = isPaid ? 'student-plus' : 'standard';
    }
  } catch (e) {
    console.warn('[Auth] Nu s-a putut citi planul din Firestore:', e.message);
  }

  if (plan === 'student-plus') {
    btnStandard.textContent = 'Creează cont';
    btnStandard.disabled    = false;
    btnStandard.classList.remove('lp-btn-current');

    btnPlus.textContent = 'Planul tău actual';
    btnPlus.disabled    = true;
    btnPlus.classList.add('lp-btn-current');
  } else {
    // standard (gratuit)
    btnStandard.textContent = 'Planul tău actual';
    btnStandard.disabled    = true;
    btnStandard.classList.add('lp-btn-current');

    btnPlus.textContent = 'Începe cu Student Plus';
    btnPlus.disabled    = false;
    btnPlus.classList.remove('lp-btn-current');
  }
}

/* ── HTML injectat în DOM ─────────────────────────────────────── */

function injectModal() {
  const overlay = document.createElement('div');
  overlay.id = 'auth-modal-overlay';
  overlay.innerHTML = `
    <div class="auth-modal-card">
      <button class="auth-modal-close" id="auth-close-btn" aria-label="Închide">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <!-- Step 1: Auth (Login / Register) -->
      <div class="auth-step active" id="auth-step-auth">
        <div class="auth-toggle-wrap">
          <div class="auth-toggle" id="auth-toggle">
            <button class="auth-toggle-btn active" data-tab="login">Log In</button>
            <button class="auth-toggle-btn" data-tab="register">Sign Up</button>
            <div class="auth-toggle-slider"></div>
          </div>
        </div>

        <!-- Tab Login -->
        <div class="auth-panel active" id="auth-panel-login">
          <div class="auth-error" id="auth-error-login"></div>
          <div class="auth-field">
            <label for="login-email">Email</label>
            <input type="email" id="login-email" placeholder="email@exemplu.com" autocomplete="email">
          </div>
          <div class="auth-field">
            <label for="login-password">Parolă</label>
            <input type="password" id="login-password" placeholder="••••••••" autocomplete="current-password">
          </div>
          <button class="auth-btn-primary" id="btn-login-email">Autentifică-te</button>
          <div class="auth-divider"><span>sau</span></div>
          <button class="auth-btn-google" id="btn-login-google">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
            Continuă cu Google
          </button>
        </div>

        <!-- Tab Register -->
        <div class="auth-panel" id="auth-panel-register">
          <div class="auth-error" id="auth-error-register"></div>
          <div class="auth-field">
            <label for="register-email">Email</label>
            <input type="email" id="register-email" placeholder="email@exemplu.com" autocomplete="email">
          </div>
          <div class="auth-field">
            <label for="register-password">Parolă</label>
            <input type="password" id="register-password" placeholder="Minim 6 caractere" autocomplete="new-password">
          </div>
          <button class="auth-btn-primary" id="btn-register-email">Creează cont</button>
          <div class="auth-divider"><span>sau</span></div>
          <button class="auth-btn-google" id="btn-register-google">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
            Continuă cu Google
          </button>
        </div>
      </div>

      <!-- Step 2: Plan Selection -->
      <div class="auth-step" id="auth-step-plan">
        <h2 class="plan-title">Alege planul tău</h2>
        <p class="plan-subtitle">Selectează planul care ți se potrivește · prețuri cu TVA inclus</p>

        <div class="plan-toggle-wrap">
          <div class="plan-toggle plan-toggle--3" id="plan-toggle">
            <button class="plan-toggle-btn active" data-billing="monthly">Lunar</button>
            <button class="plan-toggle-btn" data-billing="preadmitere">Preadmitere</button>
            <button class="plan-toggle-btn" data-billing="admitere">Admitere</button>
            <div class="plan-toggle-slider"></div>
          </div>
        </div>

        <div class="plan-cards" id="plan-cards">
          <div class="plan-highlight-box" id="plan-highlight-box"></div>

          <div class="plan-card selected" data-plan="standard">
            <div class="plan-card-header">
              <div class="plan-radio"><div class="plan-radio-dot"></div></div>
              <div class="plan-card-info">
                <span class="plan-name">Standard</span>
                <span class="plan-desc">Acces la resursele de bază</span>
              </div>
            </div>
            <div class="plan-price">
              <span class="plan-amount" data-monthly="0" data-preadmitere="0" data-admitere="0">0</span>
              <span class="plan-currency">RON</span>
              <span class="plan-period" data-monthly="/lună" data-preadmitere="/lună" data-admitere="/lună">/lună</span>
            </div>
          </div>

          <div class="plan-card" data-plan="student-plus">
            <div class="plan-card-header">
              <div class="plan-radio"><div class="plan-radio-dot"></div></div>
              <div class="plan-card-info">
                <span class="plan-name">Student Plus</span>
                <span class="plan-badge">Popular</span>
                <span class="plan-desc">Acces complet la toate resursele</span>
              </div>
            </div>
            <div class="plan-price-wrap">
              <div class="plan-price-old-row" hidden>
                <span class="plan-amount-old" data-monthly="" data-preadmitere="460" data-admitere="736"></span>
                <span class="plan-amount-old">RON</span>
                <span class="plan-sale-badge" data-monthly="" data-preadmitere="-25%" data-admitere="-35%"></span>
              </div>
              <div class="plan-price">
                <span class="plan-amount" data-monthly="92" data-preadmitere="345" data-admitere="480">92</span>
                <span class="plan-currency">RON</span>
                <span class="plan-period" data-monthly="/lună" data-preadmitere="până la Preadmitere" data-admitere="până la Admitere">/lună</span>
              </div>
            </div>
          </div>
        </div>

        <button class="auth-btn-primary" id="btn-select-plan">Începe acum</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function injectNavButton() {
  // Inject avatar into .nav-header-actions so it inherits the correct grid column
  const actions = document.querySelector('.nav-header-actions');
  const header  = document.querySelector('header');
  const anchor  = actions || header;
  if (!anchor) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'nav-auth-wrapper';
  wrapper.style.display = 'none'; // Hidden until user is logged in
  wrapper.innerHTML = `
    <button class="nav-auth-pill" id="nav-auth-trigger"></button>
    <div class="auth-user-dropdown" id="auth-user-dropdown">
      <div class="auth-email" id="auth-user-email"></div>
      <a href="./profil" class="auth-dropdown-link" id="btn-profile">Profilul meu</a>
      <button id="btn-logout">Deconectare</button>
    </div>
  `;

  anchor.appendChild(wrapper);
}

function injectMobileAuthItem() {
  const navElements = document.querySelector('.nav-elements');
  if (!navElements) return;
  const li = document.createElement('li');
  li.id = 'nav-auth-mobile-li';
  li.innerHTML = `
    <button class="nav-auth-mobile-btn" id="nav-auth-mobile-btn">Înregistrează-te</button>
    <div class="nav-auth-mobile-user" id="nav-auth-mobile-user">
      <span class="nav-auth-mobile-email" id="nav-auth-mobile-email"></span>
      <a href="./profil" class="nav-auth-mobile-profile">Profilul meu</a>
      <button class="nav-auth-mobile-logout" id="btn-logout-mobile">Deconectare</button>
    </div>
  `;
  navElements.appendChild(li);
}


function closeHamburger() {
  document.querySelector('.hamburger')?.classList.remove('active');
  document.querySelector('.nav-elements')?.classList.remove('active');
}

/* ── Helpers UI ──────────────────────────────────────────────── */

function showError(panelId, message) {
  const el = document.getElementById(`auth-error-${panelId}`);
  if (!el) return;
  el.textContent = message;
  el.style.color = '';
  el.style.borderColor = '';
  el.classList.add('visible');
}

function clearError(panelId) {
  const el = document.getElementById(`auth-error-${panelId}`);
  if (!el) return;
  el.classList.remove('visible');
  el.style.color = '';
  el.style.borderColor = '';
}

function openModal() {
  const newsletterPopup = document.getElementById('newsletter-popup');
  if (newsletterPopup && newsletterPopup.classList.contains('active')) {
    newsletterPopup.classList.remove('active');
    setTimeout(() => { newsletterPopup.style.display = 'none'; }, 300);
  }
  showStep('auth');
  document.getElementById('auth-modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('auth-modal-overlay').classList.remove('open');
  clearError('login');
  clearError('register');
}

function showStep(step) {
  document.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`auth-step-${step}`).classList.add('active');
  if (step === 'plan') {
    requestAnimationFrame(() => requestAnimationFrame(updatePlanHighlight));
  }
}

function friendlyError(code) {
  const map = {
    'auth/invalid-email':           'Adresă de email invalidă.',
    'auth/invalid-credential':      'Email sau parolă incorectă.',
    'auth/email-already-in-use':    'Există deja un cont cu acest email.',
    'auth/weak-password':           'Parola trebuie să aibă minim 6 caractere.',
    'auth/popup-closed-by-user':    'Fereastra Google a fost închisă.',
    'auth/popup-blocked':           'Popup-ul a fost blocat de browser. Activează popup-urile pentru acest site.',
    'auth/too-many-requests':       'Prea multe încercări. Încearcă mai târziu.',
    'auth/network-request-failed':  'Eroare de rețea. Verifică conexiunea la internet.',
    'auth/unauthorized-domain':     'Domeniul curent nu este autorizat. Adaugă-l în Firebase Console → Authentication → Settings → Authorized domains.',
    'auth/operation-not-allowed':   'Autentificarea cu Google nu este activată. Activează-o în Firebase Console → Authentication → Sign-in method.',
    'auth/cancelled-popup-request': 'Cerere anulată. Încearcă din nou.',
    'auth/account-exists-with-different-credential': 'Există deja un cont cu acest email, conectat printr-o altă metodă.',
    'auth/user-disabled':           'Acest cont a fost dezactivat.',
    'auth/user-not-found':          'Nu există niciun cont cu acest email.',
    'auth/wrong-password':          'Parolă incorectă.',
    'auth/internal-error':          'Eroare internă Firebase. Încearcă din nou.',
  };
  return map[code] || `A apărut o eroare (${code || 'necunoscută'}). Încearcă din nou.`;
}

/* ── Sincronizare utilizator cu Firestore ───────────────────── */

async function syncUserToFirestore(user, plan, billing) {
  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const emailLower = (user.email || '').toLowerCase();
    if (!snap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        emailLower,
        status: 'free',
        selectedPlan: plan || 'standard',
        selectedBilling: billing || 'monthly',
        createdAt: serverTimestamp()
      });
      console.log('[Auth] Firestore: document creat pentru', user.uid);
    } else if (emailLower && snap.data().emailLower !== emailLower) {
      // Backfill: conturile create înainte de introducerea câmpului nu îl au, iar
      // webhook-ul Gumroad se bazează pe el ca fallback când getUserByEmail (care e
      // case-sensitive) nu găseşte un email salvat cu majuscule în Auth. Scriem o
      // singură dată, la primul onAuthStateChanged de după deploy.
      // Catch local: dacă regulile Firestore nu permit update-ul, scrierea ar eşua
      // la FIECARE încărcare de pagină pentru fiecare cont vechi. E o îmbunătăţire
      // oportunistă, nu are voie să rupă fluxul de autentificare.
      try {
        await setDoc(userRef, { emailLower }, { merge: true });
        console.log('[Auth] Firestore: emailLower completat pentru', user.uid);
      } catch (e) {
        console.warn('[Auth] Nu am putut completa emailLower:', e.code || e.message);
      }
    } else {
      console.log('[Auth] Firestore: document deja existent pentru', user.uid);
    }
  } catch (e) {
    console.error('[Auth] Firestore sync error:', e.code, e.message, e);
    throw e;
  }
}

/* ── Content gate pentru paginile de simulare ───────────────── */

const STUDENT_PLUS_URL = 'https://admiterepoli.gumroad.com/l/student-plus-lunar';

// Statusuri care dau acces la tot conținutul premium.
const PAID_STATUSES = ['paid', 'pending_cancellation', 'trial'];

function hasSimulationAccess(data, simId) {
  const status = data?.status || 'free';
  if (PAID_STATUSES.includes(status)) return true;
  return !!simId && Array.isArray(data?.purchasedSimulations)
    && data.purchasedSimulations.includes(simId);
}

/* Simulări cu vânzare limitată în timp. După momentul de aici, butoanele de
   „Cumpără acces" dispar din gate-ul paginii de simulare şi din arhiva de pe
   simulari.html. Cheia = product_permalink-ul Gumroad (window.simulationId).
   Atenţie: e doar gating de UI — oprirea reală a vânzării se face din Gumroad
   (unpublish produs), altfel linkul direct rămâne funcţional. */
const SIMULATION_SALE_END = {
  // Vineri, 24 iulie 2026, ora 10:00 — acelaşi moment cu PUBLIC_AT din index.html
  // şi cu data-reveal-after a blocului de arhivă din simulari.html. Cele trei
  // trebuie să rămână identice: în clipa în care baremul devine public în arhivă,
  // butoanele de cumpărare trebuie să dispară.
  'simulare-21-07': new Date('2026-07-24T10:00:00+03:00')
};

function isSaleClosed(simId) {
  const end = simId ? SIMULATION_SALE_END[simId] : null;
  return !!end && new Date() >= end;
}

/* Deblocare automată la ora de start, fără refresh manual. Un singur timer activ
   pe pagină — applyExamGate poate fi re-apelat la fiecare schimbare de stare auth.
   setTimeout are un plafon de ~24.8 zile, aşa că îl re-programăm în tranşe. */
const MAX_TIMEOUT_MS = 2147483647;
let gateUnlockTimer = null;

function stopGateCountdown() {
  if (gateUnlockTimer) {
    clearTimeout(gateUnlockTimer);
    gateUnlockTimer = null;
  }
}

function scheduleGateUnlock(target, onExpire) {
  stopGateCountdown();
  const diff = target - Date.now();
  if (diff <= 0) {
    onExpire();
    return;
  }
  gateUnlockTimer = setTimeout(
    () => scheduleGateUnlock(target, onExpire),
    Math.min(diff, MAX_TIMEOUT_MS)
  );
}

async function applyExamGate(user) {
  const content = document.getElementById('exam-content');
  const gate = document.getElementById('exam-gate');
  if (!content || !gate) return;

  // Config per pagină (vezi <script> din <head>-ul paginii de simulare)
  const simId    = window.simulationId ?? null;
  const simLabel = window.simulationLabel ?? 'Această simulare';
  const buyUrl   = window.simulationBuyUrl ?? STUDENT_PLUS_URL;
  const buyLabel = window.simulationBuyUrl ? 'Cumpără acces la simulare' : 'Cumpără acces Student Plus';
  const saleClosed = isSaleClosed(simId);

  function showGate(html) {
    stopGateCountdown();
    gate.innerHTML = html;
    gate.style.display = '';
    content.style.display = 'none';
  }

  function showContent() {
    stopGateCountdown();
    content.style.display = '';
    gate.style.display = 'none';
    if (window.renderMathInElement) renderMathInElement(content);
  }

  // Înainte de ora de start → blocat pentru toată lumea
  const examStart = window.examGateStart ?? new Date('2026-05-09T09:50:00+03:00');
  const startLabel = window.examGateStartLabel ?? '9 Mai 2026, ora 9:50';
  if (new Date() < examStart) {
    showGate(`
      <div class="exam-gate-inner">
        <div class="exam-gate-icon">🕐</div>
        <h2 class="exam-gate-title">Simularea nu a început încă</h2>
        <p class="exam-gate-desc">${simLabel} se deschide pe <strong>${startLabel}</strong>.<br>Cumpără acum accesul pentru a intra imediat după start.</p>
        <a class="exam-gate-btn" href="${buyUrl}" target="_blank" rel="noopener">${buyLabel}</a>
      </div>`);
    // La ora de start re-rulăm gate-ul: cine are acces intră fără refresh.
    scheduleGateUnlock(examStart, () => applyExamGate(user));
    return;
  }

  // După start → verificare membership
  if (!user) {
    showGate(`
      <div class="exam-gate-inner">
        <div class="exam-gate-icon">🔒</div>
        <h2 class="exam-gate-title">Acces restricționat</h2>
        <p class="exam-gate-desc">Această simulare este disponibilă membrilor <strong>Student Plus</strong> sau celor care au cumpărat accesul separat.<br>Autentifică-te dacă ai deja acces.</p>
        <div class="exam-gate-actions">
          <button class="exam-gate-btn" onclick="openModal()">Autentifică-te</button>
          ${saleClosed
            ? `<a class="exam-gate-btn exam-gate-btn-outline" href="${STUDENT_PLUS_URL}" target="_blank" rel="noopener">Vezi Student Plus</a>`
            : `<a class="exam-gate-btn exam-gate-btn-outline" href="${buyUrl}" target="_blank" rel="noopener">Cumpără acces</a>`}
        </div>
      </div>`);
    return;
  }

  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    const data = snap.exists() ? snap.data() : {};
    if (hasSimulationAccess(data, simId)) {
      showContent();
    } else {
      const buyHref = window.simulationBuyUrl
        ? `${window.simulationBuyUrl}?wanted=true&email=${encodeURIComponent(user.email || '')}`
        : STUDENT_PLUS_URL;
      showGate(`
        <div class="exam-gate-inner">
          <div class="exam-gate-icon">🔒</div>
          <h2 class="exam-gate-title">Acces restricționat</h2>
          ${saleClosed
            ? `<p class="exam-gate-desc">Vânzarea separată pentru ${simLabel} s-a încheiat. Simularea rămâne inclusă în abonamentul <strong>Student Plus</strong>.</p>
               <div class="exam-gate-actions">
                 <a class="exam-gate-btn" href="${STUDENT_PLUS_URL}" target="_blank" rel="noopener">Vezi Student Plus</a>
               </div>`
            : `<p class="exam-gate-desc">${simLabel} este inclusă în abonamentul <strong>Student Plus</strong> sau poate fi cumpărată separat, cu acces permanent.</p>
               <div class="exam-gate-actions">
                 <a class="exam-gate-btn" href="${buyHref}" target="_blank" rel="noopener">${buyLabel}</a>
                 ${window.simulationBuyUrl ? `<a class="exam-gate-btn exam-gate-btn-outline" href="${STUDENT_PLUS_URL}" target="_blank" rel="noopener">Vezi Student Plus</a>` : ''}
               </div>`}
        </div>`);
    }
  } catch (e) {
    console.warn('[Gate] Nu s-a putut verifica statusul:', e.message);
    showContent();
  }
}

/* ── Gate blocuri simulări plătite pe simulari.html ──────────── */

// Simulările plătite listate în arhivă. `simId` = product_permalink-ul Gumroad.
// `startsAt` (opţional) = simulare încă nedeschisă: intrarea apare în arhivă, dar
// cu lăcăt pentru toată lumea, inclusiv plătitori. Trebuie să rămână identic cu
// window.examGateStart din pagina simulării şi cu startsAt din pagina de barem.
const PAID_SIMULATIONS = [
  { headerId: 'sim3-header', dropdownId: 'dropdown-arhiva-sim-3', simId: 'simulare_09_05', label: 'Simularea #3', buyUrl: null },
  { headerId: 'sim4-header', dropdownId: 'dropdown-arhiva-sim-4', simId: 'simulare-21-07', label: 'Simularea #4',
    buyUrl: 'https://admiterepoli.gumroad.com/l/simulare-21-07',
    startsAt: new Date('2026-07-21T17:00:00+03:00'), startLabel: '21 iulie, ora 17:00' }
];

async function applySimulariPaidLinks(user) {
  const blocks = PAID_SIMULATIONS
    .map(cfg => ({
      ...cfg,
      header: document.getElementById(cfg.headerId),
      dropdown: document.getElementById(cfg.dropdownId)
    }))
    .filter(b => b.header && b.dropdown);

  if (!blocks.length) return;

  let data = null;
  let fetchFailed = false;

  if (user) {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      data = snap.exists() ? snap.data() : {};
    } catch (e) {
      console.warn('[SimulariGate] Nu s-a putut verifica statusul:', e.message);
      fetchFailed = true;
    }
  }

  for (const block of blocks) {
    // fail-open: dacă citirea din Firestore crapă, nu blocăm userul autentificat
    const isPaid = fetchFailed || (!!data && hasSimulationAccess(data, block.simId));
    applySimulariLock(block, user, isPaid);
  }
}

function applySimulariLock({ header, dropdown, label, simId, buyUrl, startsAt, startLabel }, user, isPaid) {
  // După închiderea vânzării separate rămâne doar ruta Student Plus.
  if (isSaleClosed(simId)) buyUrl = null;

  if (!dropdown._originalHTML) dropdown._originalHTML = dropdown.innerHTML;

  // Fiecare randare porneşte de la markup-ul original. Altfel, odată înlocuit
  // dropdown-ul, `.sub-links` dispare şi nu mai putem comuta între stări — iar
  // la ora de start chiar trebuie să comutăm (aşteptare → cumpără / linkuri).
  dropdown.innerHTML = dropdown._originalHTML;
  header.querySelector('.sim-lock-badge')?.remove();

  // Înainte de start intrarea se vede în arhivă, dar închisă pentru toată lumea:
  // linkurile de barem/rezolvare n-au ce căuta la îndemână cât timp simularea
  // nu a început. Acelaşi prag ca applyBaremGate şi ca gate-ul paginii de simulare.
  const beforeStart = !!startsAt && new Date() < startsAt;

  if (isPaid && !beforeStart) return;

  const strong = header.querySelector('strong');
  if (strong) {
    const badge = document.createElement('span');
    badge.className = 'sim-lock-badge';
    badge.style.cssText = 'margin-left:0.6rem;font-size:1rem;opacity:0.8;vertical-align:middle;';
    badge.textContent = beforeStart ? '🕐' : '🔒';
    strong.appendChild(badge);
  }

  const subLinks = dropdown.querySelector('.sub-links');
  if (!subLinks) return;

  const buyBtn = buyUrl
    ? `<a href="${buyUrl}${user ? '?wanted=true&email=' + encodeURIComponent(user.email || '') : ''}" target="_blank" rel="noopener" style="display:inline-block;padding:0.6rem 1.4rem;background:var(--accent2);color:#fff;border-radius:8px;font-weight:600;font-size:0.95rem;text-decoration:none;">
        Cumpără acces
       </a>`
    : `<button onclick="openUpgradeModal()" style="padding:0.6rem 1.4rem;background:var(--accent2);color:#fff;border:none;border-radius:8px;font-weight:600;font-size:0.95rem;cursor:pointer;">
        Cumpără acces
       </button>`;

  const authButtons = user
    ? buyBtn
    : `<div style="display:flex;gap:0.75rem;flex-wrap:wrap;justify-content:center;">
        <button onclick="openModal()" style="padding:0.6rem 1.4rem;background:var(--accent);color:#fff;border:none;border-radius:8px;font-weight:600;font-size:0.95rem;cursor:pointer;">
          Autentifică-te
        </button>
        ${buyBtn}
      </div>`;

  const card = (icon, title, desc, actions) =>
    `<div style="display:flex;flex-direction:column;align-items:center;gap:1rem;padding:2rem 1.5rem;text-align:center;">
      <div style="font-size:2.5rem;line-height:1;">${icon}</div>
      <h3 style="margin:0;color:#fff;font-size:1.15rem;">${title}</h3>
      <p style="margin:0;color:var(--muted);font-size:0.95rem;max-width:280px;line-height:1.5;">${desc}</p>
      ${actions}
    </div>`;

  if (beforeStart) {
    subLinks.outerHTML = card(
      '🕐',
      'Nu a început încă',
      `${label} se deschide pe <strong style="color:#C3D5F0;">${startLabel}</strong>. Subiectul, baremul şi rezolvarea apar aici în acel moment.`,
      isPaid
        ? `<span style="padding:0.6rem 1.4rem;color:var(--accent3);font-weight:600;font-size:0.95rem;">Ai deja acces ✓</span>`
        : authButtons
    );
    // La ora de start re-randăm: plătitorii primesc linkurile fără refresh.
    scheduleGateUnlock(startsAt, () => applySimulariPaidLinks(user));
    return;
  }

  subLinks.outerHTML = card(
    '🔒',
    'Acces restricționat',
    `${label} este disponibilă membrilor <strong style="color:#C3D5F0;">Student Plus</strong> sau prin cumpărare separată.`,
    authButtons
  );
}

/* ── Gate pagină de barem ───────────────────────────────────── */

/* Baremul se deblochează în acelaşi moment cu subiectul: la startul simulării,
   pentru cine are acces. Înainte de start e închis pentru toată lumea, inclusiv
   pentru plătitori — altfel cine cumpără cu o zi înainte citeşte răspunsurile pe
   îndelete. După isSaleClosed() pagina devine publică (acelaşi moment cu apariţia
   în arhiva de pe simulari.html).
   Config-ul stă în window.baremConfig, în <head>-ul paginii de barem.
   Nu e securitate reală — răspunsurile sunt oricum în sursa paginii de simulare —
   ci împiedicarea drumului uşor către ele cât timp fereastra e deschisă. */

async function applyBaremGate(user) {
  const cfg = window.baremConfig;
  const content = document.getElementById('barem-content');
  const gate = document.getElementById('barem-gate');
  if (!cfg || !content || !gate) return;

  function showGate(html) {
    stopGateCountdown();
    gate.innerHTML = `<div class="exam-gate-inner">${html}</div>`;
    gate.style.display = '';
    content.style.display = 'none';
  }

  function showContent() {
    stopGateCountdown();
    content.style.display = '';
    gate.style.display = 'none';
  }

  // După publicare baremul e liber, ca cele de la simulările anterioare.
  if (isSaleClosed(cfg.simId)) {
    showContent();
    return;
  }

  // Înainte de startul simulării, închis pentru toată lumea. La ora de start
  // re-rulăm gate-ul: cine are acces intră fără refresh.
  if (cfg.startsAt && new Date() < cfg.startsAt) {
    showGate(`
      <div class="exam-gate-icon">🕐</div>
      <h2 class="exam-gate-title">Baremul nu e disponibil încă</h2>
      <p class="exam-gate-desc">${cfg.label} se deschide pe <strong>${cfg.startLabel}</strong>. Baremul se deblochează în acelaşi moment pentru cine are acces, iar pe <strong>${cfg.publicLabel}</strong> devine public.</p>
      <div class="exam-gate-actions">
        <a class="exam-gate-btn exam-gate-btn-outline" href="${cfg.simUrl}">Mergi la simulare</a>
      </div>`);
    scheduleGateUnlock(cfg.startsAt, () => applyBaremGate(user));
    return;
  }

  if (!user) {
    showGate(`
      <div class="exam-gate-icon">🔒</div>
      <h2 class="exam-gate-title">Barem indisponibil momentan</h2>
      <p class="exam-gate-desc">${cfg.label} este încă în desfăşurare. Baremul e disponibil celor care au acces, iar pe <strong>${cfg.publicLabel}</strong> devine public.</p>
      <div class="exam-gate-actions">
        <button class="exam-gate-btn" onclick="openModal()">Autentifică-te</button>
        <a class="exam-gate-btn exam-gate-btn-outline" href="${cfg.simUrl}">Mergi la simulare</a>
      </div>`);
    return;
  }

  // Fail-closed: dacă nu putem verifica, nu arătăm răspunsurile. Invers decât la
  // celelalte gate-uri, unde fail-open doar deschide conţinut deja cumpărat.
  let data;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    data = snap.exists() ? snap.data() : {};
  } catch (e) {
    console.warn('[BaremGate] Nu s-a putut verifica statusul:', e.message);
    showGate(`
      <div class="exam-gate-icon">⚠️</div>
      <h2 class="exam-gate-title">Nu am putut verifica accesul</h2>
      <p class="exam-gate-desc">Reîncarcă pagina. Dacă problema persistă, scrie-ne pe WhatsApp.</p>`);
    return;
  }

  if (!hasSimulationAccess(data, cfg.simId)) {
    const buyHref = `${cfg.buyUrl}?wanted=true&email=${encodeURIComponent(user.email || '')}`;
    showGate(`
      <div class="exam-gate-icon">🔒</div>
      <h2 class="exam-gate-title">Acces restricționat</h2>
      <p class="exam-gate-desc">Baremul pentru ${cfg.label} este disponibil membrilor <strong>Student Plus</strong> sau celor care au cumpărat simularea separat.</p>
      <div class="exam-gate-actions">
        <a class="exam-gate-btn" href="${buyHref}" target="_blank" rel="noopener">Cumpără acces la simulare</a>
        <a class="exam-gate-btn exam-gate-btn-outline" href="${STUDENT_PLUS_URL}" target="_blank" rel="noopener">Vezi Student Plus</a>
      </div>`);
    return;
  }

  showContent();
}

/* ── Salvare rezultat simulare în Firestore ──────────────────── */

async function saveSimulationResult(simulationId, data) {
  const user = auth.currentUser;
  if (!user) return; // utilizator neautentificat — silent fail
  try {
    const resultRef = doc(db, 'users', user.uid, 'simulationResults', simulationId);
    // Paginile de simulare trimit `scoreDisc` (info SAU fizică, în funcţie de track).
    // Îl salvăm ca `scoreInfo` pentru că asta citeşte profile.js. Fallback la 0:
    // setDoc aruncă la `undefined` şi ar pica salvarea întregului rezultat.
    await setDoc(resultRef, {
      simulationId,
      track: data.track ?? null,
      title: data.title ?? simulationId,
      scoreTotal: data.scoreTotal ?? 0,
      scoreInfo: data.scoreInfo ?? data.scoreDisc ?? 0,
      scoreMate: data.scoreMate ?? 0,
      completedAt: serverTimestamp(),
      timeElapsed: data.timeElapsed ?? 0
    }, { merge: true });
    console.log('[Profile] Rezultat salvat pentru', simulationId);
  } catch (e) {
    console.error('[Profile] Eroare salvare rezultat:', e);
  }
}

window.saveSimulationResult = saveSimulationResult;

/* ── Google Sign-In (popup pe toate platformele) ─────────────── */

async function googleSignIn() {
  const result = await signInWithPopup(auth, googleProvider);
  const isNewUser = getAdditionalUserInfo(result)?.isNewUser ?? true;
  if (isNewUser) {
    showStep('plan');
  } else {
    closeModal();
  }
}

/* ── Plan picker helpers ────────────────────────────────────── */

let currentBilling = 'monthly';

function updatePlanHighlight() {
  const cards = document.getElementById('plan-cards');
  const selected = cards?.querySelector('.plan-card.selected');
  const box = document.getElementById('plan-highlight-box');
  if (!selected || !box || !cards) return;

  const cardsRect = cards.getBoundingClientRect();
  const cardRect = selected.getBoundingClientRect();
  box.style.transform = `translateY(${cardRect.top - cardsRect.top}px)`;
  box.style.height = `${cardRect.height}px`;
}

function updatePlanPrices() {
  document.querySelectorAll('.plan-amount').forEach(el => {
    const value = el.getAttribute(`data-${currentBilling}`);
    animateNumber(el, parseInt(el.textContent), parseInt(value));
  });
  document.querySelectorAll('.plan-amount-old[data-monthly], .plan-sale-badge[data-monthly]').forEach(el => {
    el.textContent = el.getAttribute(`data-${currentBilling}`);
  });
  // Lunar e preţul de referinţă — rândul cu preţul tăiat apare doar la planurile fixe.
  document.querySelectorAll('.plan-price-old-row').forEach(el => {
    el.hidden = currentBilling === 'monthly';
  });
  document.querySelectorAll('.plan-period').forEach(el => {
    el.textContent = el.getAttribute(`data-${currentBilling}`);
  });
}

function animateNumber(el, from, to) {
  if (from === to) return;
  const duration = 400;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── Actualizează navbar după schimbarea stării auth ─────────── */

function updateNavButton(user) {
  const trigger = document.getElementById('nav-auth-trigger');
  const dropdown = document.getElementById('auth-user-dropdown');
  const emailEl = document.getElementById('auth-user-email');
  const wrapper = document.getElementById('nav-auth-wrapper');
  if (wrapper) wrapper.style.display = user ? 'flex' : 'none';

  const headerSignup = document.getElementById('header-signup-btn');
  if (headerSignup) headerSignup.style.display = user ? 'none' : '';

  if (trigger) {
    if (user) {
      const displayName = (user.displayName || '').trim();
      const initials = displayName
        ? displayName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : (user.email || '?')[0].toUpperCase();
      trigger.textContent = initials;
      trigger.classList.add('auth-logged-in');
      if (emailEl) emailEl.textContent = user.email;
    } else {
      trigger.classList.remove('auth-logged-in');
      if (dropdown) dropdown.classList.remove('open');
    }
  }

  const mobileBtn = document.getElementById('nav-auth-mobile-btn');
  const mobileUser = document.getElementById('nav-auth-mobile-user');
  const mobileEmail = document.getElementById('nav-auth-mobile-email');
  if (mobileBtn) mobileBtn.style.display = user ? 'none' : '';
  if (mobileUser) mobileUser.style.display = user ? 'flex' : 'none';
  if (mobileEmail) mobileEmail.textContent = user ? (user.displayName || user.email) : '';
}

/* ── Inițializare ────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  injectNavButton();
  injectMobileAuthItem();
  injectModal();

  const overlay = document.getElementById('auth-modal-overlay');
  const trigger = document.getElementById('nav-auth-trigger');
  const dropdown = document.getElementById('auth-user-dropdown');
  const wrapper = document.getElementById('nav-auth-wrapper');

  if (!trigger || !overlay) return;

  // Ghost "Autentificare" → deschide modal pe tab-ul Login
  document.getElementById('nav-auth-signin')?.addEventListener('click', () => {
    openModal();
  });

  // CTA "Înregistrează-te" → deschide modal pe tab-ul Register; avatar → dropdown
  trigger.addEventListener('click', () => {
    if (auth.currentUser) {
      dropdown.classList.toggle('open');
    } else {
      openModal();
      requestAnimationFrame(() => {
        document.querySelector('.auth-toggle-btn[data-tab="register"]')?.click();
      });
    }
  });

  // Închide dropdown la click în afară
  document.addEventListener('click', (e) => {
    if (dropdown && wrapper && !wrapper.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });

  // Închide modal
  document.getElementById('auth-close-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  /* ── Auth toggle (Login / Register) cu slider animat ────────── */
  document.querySelectorAll('.auth-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      clearError('login');
      clearError('register');
      document.querySelectorAll('.auth-toggle-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`auth-panel-${btn.dataset.tab}`).classList.add('active');

      const toggle = document.getElementById('auth-toggle');
      const slider = toggle.querySelector('.auth-toggle-slider');
      const idx = btn.dataset.tab === 'register' ? 1 : 0;
      slider.style.transform = `translateX(${idx * 100}%)`;
    });
  });

  /* ── Plan billing toggle (Lunar / Preadmitere / Admitere) ──── */
  const planToggleBtns = document.querySelectorAll('.plan-toggle-btn');
  planToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      planToggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentBilling = btn.dataset.billing;

      const toggle = document.getElementById('plan-toggle');
      const slider = toggle.querySelector('.plan-toggle-slider');
      const idx = [...planToggleBtns].indexOf(btn);
      slider.style.transform = `translateX(${idx * 100}%)`;

      updatePlanPrices();
    });
  });

  /* ── Plan card selection ───────────────────────────────────── */
  const planCards = document.querySelectorAll('.plan-card');
  planCards.forEach(card => {
    card.addEventListener('click', () => {
      planCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      updatePlanHighlight();
    });
  });

  // Enter pe câmpurile de login/register
  ['login-email', 'login-password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-login-email').click();
    });
  });
  ['register-email', 'register-password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-register-email').click();
    });
  });

  // Login email/parolă
  document.getElementById('btn-login-email').addEventListener('click', async () => {
    clearError('login');
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    if (!email || !password) { showError('login', 'Completează email-ul și parola.'); return; }
    const btn = document.getElementById('btn-login-email');
    btn.disabled = true;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      closeModal();
    } catch (e) {
      showError('login', friendlyError(e.code));
    } finally {
      btn.disabled = false;
    }
  });

  // Login Google
  document.getElementById('btn-login-google').addEventListener('click', async () => {
    clearError('login');
    const btn = document.getElementById('btn-login-google');
    btn.disabled = true;
    try {
      await googleSignIn();
    } catch (e) {
      console.error('[Auth] Google login error:', e.code, e.message);
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        showError('login', friendlyError(e.code));
      }
    } finally {
      btn.disabled = false;
    }
  });

  // Register email/parolă
  document.getElementById('btn-register-email').addEventListener('click', async () => {
    clearError('register');
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;
    if (!email || !password) { showError('register', 'Completează email-ul și parola.'); return; }
    const btn = document.getElementById('btn-register-email');
    btn.disabled = true;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(user);
      showStep('plan');
    } catch (e) {
      showError('register', friendlyError(e.code));
    } finally {
      btn.disabled = false;
    }
  });

  // Register Google (același flux ca login)
  document.getElementById('btn-register-google').addEventListener('click', async () => {
    clearError('register');
    const btn = document.getElementById('btn-register-google');
    btn.disabled = true;
    try {
      await googleSignIn();
    } catch (e) {
      console.error('[Auth] Google register error:', e.code, e.message);
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        showError('register', friendlyError(e.code));
      }
    } finally {
      btn.disabled = false;
    }
  });

  /* ── Plan selection confirm ────────────────────────────────── */
  document.getElementById('btn-select-plan').addEventListener('click', async () => {
    const selected = document.querySelector('.plan-card.selected');
    const plan = selected ? selected.dataset.plan : 'standard';
    const billing = currentBilling;
    const btn = document.getElementById('btn-select-plan');
    btn.disabled = true;

    const user = auth.currentUser;

    // Gumroad se deschide în tab nou SINCRON, direct în handler-ul de click —
    // după un await, browserul nu mai consideră deschiderea iniţiată de user
    // şi o blochează ca popup.
    if (plan === 'student-plus' && user) {
      const returnUrl = encodeURIComponent(`${window.location.origin}/profil?upgraded=1`);
      const gumroadUrls = {
        monthly:     `https://admiterepoli.gumroad.com/l/student-plus-lunar?wanted=true&email=${encodeURIComponent(user.email)}&redirect_url=${returnUrl}`,
        preadmitere: `https://admiterepoli.gumroad.com/l/student-plus-preadmitere?wanted=true&email=${encodeURIComponent(user.email)}&redirect_url=${returnUrl}`,
        admitere:    `https://admiterepoli.gumroad.com/l/student-plus-admitere?wanted=true&email=${encodeURIComponent(user.email)}&redirect_url=${returnUrl}`
      };
      window.open(gumroadUrls[billing] || gumroadUrls.monthly, '_blank', 'noopener,noreferrer');
    }

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          selectedPlan: plan,
          selectedBilling: billing
        }, { merge: true });
      } catch (e) {
        console.error('[Auth] Nu s-a putut salva în Firestore:', e.code, e.message);
      }
    } else {
      console.warn('[Auth] auth.currentUser este null la selectarea planului');
    }

    btn.disabled = false;
    closeModal();
  });

  // Logout
  document.getElementById('btn-logout').addEventListener('click', async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('[Auth] signOut error:', e);
    } finally {
      dropdown.classList.remove('open');
    }
  });

  // Header Sign Up button (outside nav pill)
  document.getElementById('header-signup-btn')?.addEventListener('click', () => {
    openModal();
    requestAnimationFrame(() => {
      document.querySelector('.auth-toggle-btn[data-tab="register"]')?.click();
    });
  });

  // Hero "Începe Acum" / "Intră în contul meu" button
  document.getElementById('hero-register-btn')?.addEventListener('click', () => {
    if (auth.currentUser) {
      window.location.href = './profil';
      return;
    }
    openModal();
    requestAnimationFrame(() => {
      document.querySelector('.auth-toggle-btn[data-tab="register"]')?.click();
    });
  });

  // Pricing — "Creează cont" (Standard plan)
  document.getElementById('oferim-btn-standard')?.addEventListener('click', () => {
    openModal();
    requestAnimationFrame(() => {
      document.querySelector('.auth-toggle-btn[data-tab="register"]')?.click();
    });
  });

  // Pricing — "Începe cu Student Plus"
  document.getElementById('oferim-btn-plus')?.addEventListener('click', () => {
    if (auth.currentUser) {
      // Already logged in → go straight to plan selection
      openModal();
      requestAnimationFrame(() => showStep('plan'));
    } else {
      // Not logged in → register first, plan step shows automatically after register
      openModal();
      requestAnimationFrame(() => {
        document.querySelector('.auth-toggle-btn[data-tab="register"]')?.click();
      });
    }
  });

  // Mobile menu — Contul meu
  document.getElementById('nav-auth-mobile-btn')?.addEventListener('click', () => {
    closeHamburger();
    openModal();
  });

  // Mobile menu — Deconectare
  document.getElementById('btn-logout-mobile')?.addEventListener('click', async () => {
    closeHamburger();
    try {
      await signOut(auth);
    } catch (e) {
      console.error('[Auth] signOut error:', e);
    }
  });

  window.openModal = openModal;

  // Listener stare auth
  onAuthStateChanged(auth, async (user) => {
    updateNavButton(user);
    if (user) syncUserToFirestore(user, 'standard', 'monthly');
    await Promise.all([
      updatePricingButtons(user),
      applyExamGate(user),
      applySimulariPaidLinks(user),
      applyBaremGate(user),
    ]);
  });

  // Expune openUpgradeModal global pentru alte pagini (ex: exercitii-video)
  window.openUpgradeModal = () => {
    // Resetează la monthly și pre-selectează Student Plus
    currentBilling = 'monthly';
    document.querySelectorAll('.plan-toggle-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.billing === 'monthly');
    });
    const slider = document.querySelector('#plan-toggle .plan-toggle-slider');
    if (slider) slider.style.transform = 'translateX(0)';
    document.querySelectorAll('.plan-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.plan === 'student-plus');
    });
    updatePlanPrices();
    showStep('plan');
    document.getElementById('auth-modal-overlay').classList.add('open');
  };
});
