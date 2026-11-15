/**
 * Sign-in flows and the navbar auth state. Extracted from `legacy/firebase-auth.js` (issue #21):
 * email login, registration (with the verification email), Google popup, logout, the injected navbar
 * avatar with its profile dropdown, and the auth item of the mobile menu.
 *
 * The injected HTML is byte-identical to the legacy one; do not reformat the template literals.
 */
import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';

import { auth } from './app';
import {
  clearError,
  closeModal,
  friendlyError,
  openModal,
  showError,
  showStep,
  type AuthPanelId,
} from './modal';

const googleProvider = new GoogleAuthProvider();

/** `code` and `message` of a caught value, as the legacy code read them from `e`. */
function errorInfo(e: unknown): { code: string | undefined; message: unknown } {
  if (typeof e !== 'object' || e === null) return { code: undefined, message: undefined };
  return {
    code: 'code' in e && typeof e.code === 'string' ? e.code : undefined,
    message: 'message' in e ? e.message : undefined,
  };
}

/**
 * An element the modal or the navbar injection always creates. The legacy code dereferenced these
 * without a check, so a missing one stops the wiring here as it did there.
 */
function requiredElement<T extends HTMLElement>(id: string, type: new () => T): T {
  const el: HTMLElement | null = document.getElementById(id);
  if (!(el instanceof type)) throw new TypeError(`[Auth] Lipsește elementul #${id}`);
  return el;
}

/* ── HTML injectat în DOM ─────────────────────────────────────── */

export function injectNavButton(): void {
  // Inject avatar into .nav-header-actions so it inherits the correct grid column
  const actions: Element | null = document.querySelector('.nav-header-actions');
  const header: Element | null = document.querySelector('header');
  const anchor: Element | null = actions || header;
  if (!anchor) return;

  const wrapper: HTMLDivElement = document.createElement('div');
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

export function injectMobileAuthItem(): void {
  const navElements: Element | null = document.querySelector('.nav-elements');
  if (!navElements) return;
  const li: HTMLLIElement = document.createElement('li');
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

export function closeHamburger(): void {
  document.querySelector('.hamburger')?.classList.remove('active');
  document.querySelector('.nav-elements')?.classList.remove('active');
}

/* ── Google Sign-In (popup pe toate platformele) ─────────────── */

export async function googleSignIn(): Promise<void> {
  const result = await signInWithPopup(auth, googleProvider);
  const isNewUser: boolean = getAdditionalUserInfo(result)?.isNewUser ?? true;
  if (isNewUser) {
    showStep('plan');
  } else {
    closeModal();
  }
}

/* ── Actualizează navbar după schimbarea stării auth ─────────── */

export function updateNavButton(user: Pick<User, 'displayName' | 'email'> | null): void {
  const trigger: HTMLElement | null = document.getElementById('nav-auth-trigger');
  const dropdown: HTMLElement | null = document.getElementById('auth-user-dropdown');
  const emailEl: HTMLElement | null = document.getElementById('auth-user-email');
  const wrapper: HTMLElement | null = document.getElementById('nav-auth-wrapper');
  if (wrapper) wrapper.style.display = user ? 'flex' : 'none';

  const headerSignup: HTMLElement | null = document.getElementById('header-signup-btn');
  if (headerSignup) headerSignup.style.display = user ? 'none' : '';

  if (trigger) {
    if (user) {
      const displayName: string = (user.displayName || '').trim();
      const initials: string = displayName
        ? displayName
            .split(' ')
            .filter(Boolean)
            .map((n) => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : (user.email || '?').charAt(0).toUpperCase();
      trigger.textContent = initials;
      trigger.classList.add('auth-logged-in');
      if (emailEl) emailEl.textContent = user.email;
    } else {
      trigger.classList.remove('auth-logged-in');
      if (dropdown) dropdown.classList.remove('open');
    }
  }

  const mobileBtn: HTMLElement | null = document.getElementById('nav-auth-mobile-btn');
  const mobileUser: HTMLElement | null = document.getElementById('nav-auth-mobile-user');
  const mobileEmail: HTMLElement | null = document.getElementById('nav-auth-mobile-email');
  if (mobileBtn) mobileBtn.style.display = user ? 'none' : '';
  if (mobileUser) mobileUser.style.display = user ? 'flex' : 'none';
  if (mobileEmail) mobileEmail.textContent = user ? user.displayName || user.email : '';
}

/* ── Handlere: navbar, login, înregistrare, logout ───────────── */

/** Opens the modal and switches it to the "Sign Up" tab. */
function openModalOnRegister(): void {
  openModal();
  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>('.auth-toggle-btn[data-tab="register"]')?.click();
  });
}

/** Email + password submit of one panel. `submit` does the Firebase call and the follow-up step. */
function bindEmailSubmit(
  panel: AuthPanelId,
  submit: (email: string, password: string) => Promise<void>,
): void {
  const btn = requiredElement(`btn-${panel}-email`, HTMLButtonElement);
  const emailInput = requiredElement(`${panel}-email`, HTMLInputElement);
  const passwordInput = requiredElement(`${panel}-password`, HTMLInputElement);

  // Enter pe câmpurile de login/register
  [emailInput, passwordInput].forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btn.click();
    });
  });

  btn.addEventListener('click', async () => {
    clearError(panel);
    const email: string = emailInput.value.trim().toLowerCase();
    const password: string = passwordInput.value;
    if (!email || !password) {
      showError(panel, 'Completează email-ul și parola.');
      return;
    }
    btn.disabled = true;
    try {
      await submit(email, password);
    } catch (e) {
      showError(panel, friendlyError(errorInfo(e).code));
    } finally {
      btn.disabled = false;
    }
  });
}

/** "Continuă cu Google" of one panel; login and registration share the same flow. */
function bindGoogleButton(panel: AuthPanelId): void {
  const btn = requiredElement(`btn-${panel}-google`, HTMLButtonElement);
  btn.addEventListener('click', async () => {
    clearError(panel);
    btn.disabled = true;
    try {
      await googleSignIn();
    } catch (e) {
      const { code, message } = errorInfo(e);
      console.error(`[Auth] Google ${panel} error:`, code, message);
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        showError(panel, friendlyError(code));
      }
    } finally {
      btn.disabled = false;
    }
  });
}

/**
 * Wires the navbar auth controls and the sign-in forms of the modal. Call once, on
 * `DOMContentLoaded`, after `injectNavButton`, `injectMobileAuthItem` and `injectModal`.
 */
export function bindAuthHandlers(): void {
  const trigger: HTMLElement | null = document.getElementById('nav-auth-trigger');
  const dropdown: HTMLElement | null = document.getElementById('auth-user-dropdown');
  const wrapper: HTMLElement | null = document.getElementById('nav-auth-wrapper');
  if (!trigger) return;

  // Ghost "Autentificare" → deschide modal pe tab-ul Login
  document.getElementById('nav-auth-signin')?.addEventListener('click', () => {
    openModal();
  });

  // CTA "Înregistrează-te" → deschide modal pe tab-ul Register; avatar → dropdown
  trigger.addEventListener('click', () => {
    if (auth.currentUser) {
      dropdown?.classList.toggle('open');
    } else {
      openModalOnRegister();
    }
  });

  // Închide dropdown la click în afară
  document.addEventListener('click', (e) => {
    const target: Node | null = e.target instanceof Node ? e.target : null;
    if (dropdown && wrapper && !wrapper.contains(target)) {
      dropdown.classList.remove('open');
    }
  });

  // Login email/parolă
  bindEmailSubmit('login', async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    closeModal();
  });

  // Login Google
  bindGoogleButton('login');

  // Register email/parolă
  bindEmailSubmit('register', async (email, password) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(user);
    showStep('plan');
  });

  // Register Google (același flux ca login)
  bindGoogleButton('register');

  // Logout
  requiredElement('btn-logout', HTMLButtonElement).addEventListener('click', async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('[Auth] signOut error:', e);
    } finally {
      dropdown?.classList.remove('open');
    }
  });

  // Header Sign Up button (outside nav pill)
  document.getElementById('header-signup-btn')?.addEventListener('click', openModalOnRegister);

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
}
