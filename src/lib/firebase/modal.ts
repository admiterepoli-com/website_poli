/**
 * Auth modal: the markup injected into every page and the small UI helpers around it.
 * Extracted from `legacy/firebase-auth.js` (issue #20). The injected HTML is byte-identical to the
 * legacy one; do not reformat the template literal.
 */
import { BILLING_IDS, STANDARD_PLAN_PRICE, STUDENT_PLUS_OFFERS, type StudentPlusOffer } from './offers';

/** The two error boxes of the modal: `#auth-error-login` and `#auth-error-register`. */
export type AuthPanelId = 'login' | 'register';

/** The two steps of the modal: `#auth-step-auth` and `#auth-step-plan`. */
export type AuthStep = 'auth' | 'plan';

let planStepShownHandler: (() => void) | null = null;

/**
 * Registers what runs (after two animation frames) when the plan step becomes visible. The legacy
 * code called `updatePlanHighlight` here; that function still lives in `legacy-auth.js`, so it is
 * passed in instead of imported, which would be a circular import.
 */
export function onPlanStepShown(handler: () => void): void {
  planStepShownHandler = handler;
}

/* ── HTML injectat în DOM ─────────────────────────────────────── */

/** `data-monthly="…" data-preadmitere="…" data-admitere="…"`, one value per billing option. */
function billingAttrs(value: (billing: (typeof BILLING_IDS)[number]) => string): string {
  return BILLING_IDS.map((billing) => `data-${billing}="${value(billing)}"`).join(' ');
}

/** The same attributes, read from the Student Plus offer of each billing option. */
function offerAttrs(value: (offer: StudentPlusOffer) => string): string {
  return billingAttrs((billing) => value(STUDENT_PLUS_OFFERS[billing]));
}

export function injectModal(): void {
  const overlay: HTMLDivElement = document.createElement('div');
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
              <span class="plan-amount" ${billingAttrs(() => String(STANDARD_PLAN_PRICE))}>${STANDARD_PLAN_PRICE}</span>
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
                <span class="plan-amount-old" ${offerAttrs((o) => (o.oldPrice === null ? '' : String(o.oldPrice)))}></span>
                <span class="plan-amount-old">RON</span>
                <span class="plan-sale-badge" ${offerAttrs((o) => o.discount ?? '')}></span>
              </div>
              <div class="plan-price">
                <span class="plan-amount" ${offerAttrs((o) => String(o.price))}>${STUDENT_PLUS_OFFERS.monthly.price}</span>
                <span class="plan-currency">RON</span>
                <span class="plan-period" ${offerAttrs((o) => o.period)}>${STUDENT_PLUS_OFFERS.monthly.period}</span>
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

/* ── Helpers UI ──────────────────────────────────────────────── */

export function showError(panelId: AuthPanelId, message: string): void {
  const el: HTMLElement | null = document.getElementById(`auth-error-${panelId}`);
  if (!el) return;
  el.textContent = message;
  el.style.color = '';
  el.style.borderColor = '';
  el.classList.add('visible');
}

export function clearError(panelId: AuthPanelId): void {
  const el: HTMLElement | null = document.getElementById(`auth-error-${panelId}`);
  if (!el) return;
  el.classList.remove('visible');
  el.style.color = '';
  el.style.borderColor = '';
}

export function openModal(): void {
  const newsletterPopup: HTMLElement | null = document.getElementById('newsletter-popup');
  if (newsletterPopup && newsletterPopup.classList.contains('active')) {
    newsletterPopup.classList.remove('active');
    setTimeout(() => {
      newsletterPopup.style.display = 'none';
    }, 300);
  }
  showStep('auth');
  const overlay: HTMLElement | null = document.getElementById('auth-modal-overlay');
  overlay?.classList.add('open');
}

export function closeModal(): void {
  const overlay: HTMLElement | null = document.getElementById('auth-modal-overlay');
  overlay?.classList.remove('open');
  clearError('login');
  clearError('register');
}

export function showStep(step: AuthStep): void {
  document.querySelectorAll<HTMLElement>('.auth-step').forEach((s) => s.classList.remove('active'));
  const target: HTMLElement | null = document.getElementById(`auth-step-${step}`);
  target?.classList.add('active');
  if (step === 'plan') {
    requestAnimationFrame(() => requestAnimationFrame(() => planStepShownHandler?.()));
  }
}

const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  'auth/invalid-email': 'Adresă de email invalidă.',
  'auth/invalid-credential': 'Email sau parolă incorectă.',
  'auth/email-already-in-use': 'Există deja un cont cu acest email.',
  'auth/weak-password': 'Parola trebuie să aibă minim 6 caractere.',
  'auth/popup-closed-by-user': 'Fereastra Google a fost închisă.',
  'auth/popup-blocked': 'Popup-ul a fost blocat de browser. Activează popup-urile pentru acest site.',
  'auth/too-many-requests': 'Prea multe încercări. Încearcă mai târziu.',
  'auth/network-request-failed': 'Eroare de rețea. Verifică conexiunea la internet.',
  'auth/unauthorized-domain':
    'Domeniul curent nu este autorizat. Adaugă-l în Firebase Console → Authentication → Settings → Authorized domains.',
  'auth/operation-not-allowed':
    'Autentificarea cu Google nu este activată. Activează-o în Firebase Console → Authentication → Sign-in method.',
  'auth/cancelled-popup-request': 'Cerere anulată. Încearcă din nou.',
  'auth/account-exists-with-different-credential':
    'Există deja un cont cu acest email, conectat printr-o altă metodă.',
  'auth/user-disabled': 'Acest cont a fost dezactivat.',
  'auth/user-not-found': 'Nu există niciun cont cu acest email.',
  'auth/wrong-password': 'Parolă incorectă.',
  'auth/internal-error': 'Eroare internă Firebase. Încearcă din nou.',
};

/** Romanian message for a Firebase Auth error code (`error.code`). */
export function friendlyError(code: string | undefined): string {
  const known: string | undefined = code ? ERROR_MESSAGES[code] : undefined;
  return known || `A apărut o eroare (${code || 'necunoscută'}). Încearcă din nou.`;
}
