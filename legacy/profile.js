// profile.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAml8nJ8UOh9wrIhI6f-3K6-tOaPYLz_c4",
  authDomain: "admiterepoli-715cb.firebaseapp.com",
  projectId: "admiterepoli-715cb",
  storageBucket: "admiterepoli-715cb.firebasestorage.app",
  messagingSenderId: "91434186818",
  appId: "1:91434186818:web:1617d5a2d53b2fea2a95db",
  measurementId: "G-CQJCR937EB"
};

// Refolosim app-ul Firebase dacă a fost deja inițializat de firebase-auth.js
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, 'admiterepoli');

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = './';
    return;
  }
  // Dacă userul vine înapoi de pe Gumroad, așteptăm 3s să proceseze webhookul, apoi reîncărcăm
  const params = new URLSearchParams(window.location.search);
  if (params.has('upgraded')) {
    history.replaceState(null, '', window.location.pathname);
    setTimeout(() => initProfilePage(user), 3000);
  } else {
    initProfilePage(user);
  }
});

async function initProfilePage(user) {
  const emailHeader = document.getElementById('profile-email-header');
  if (emailHeader) emailHeader.textContent = user.email;

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    const userData = snap.exists() ? snap.data() : {};
    renderAccountSection(user, userData);
    renderPlanSection(user, userData);
    await renderResultsSection(user);
  } catch (e) {
    console.error('[Profile] Eroare inițializare profil:', e);
  }
}

function renderAccountSection(user, userData) {
  // Email
  const emailDisplay = document.getElementById('profile-email-display');
  if (emailDisplay) emailDisplay.textContent = user.email;

  // Nume afișat
  const nameInput = document.getElementById('profile-name-input');
  if (nameInput && userData.displayName) nameInput.value = userData.displayName;

  // Buton salvare nume
  const btnSaveName = document.getElementById('btn-save-name');
  const nameFeedback = document.getElementById('name-feedback');
  if (btnSaveName) {
    btnSaveName.addEventListener('click', async () => {
      if (!nameInput || !nameFeedback) return;
      const name = nameInput.value.trim();
      if (!name) {
        nameFeedback.textContent = 'Introdu un nume valid.';
        nameFeedback.className = 'profile-feedback error';
        return;
      }
      btnSaveName.disabled = true;
      try {
        const userRef = doc(db, 'users', user.uid);
        await Promise.all([
          updateDoc(userRef, { displayName: name }),
          updateProfile(user, { displayName: name })
        ]);
        nameFeedback.textContent = 'Nume salvat cu succes!';
        nameFeedback.className = 'profile-feedback success';

        // Actualizează inițialele în navbar fără reload
        const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const navTrigger = document.getElementById('nav-auth-trigger');
        if (navTrigger) navTrigger.textContent = initials;
      } catch (e) {
        nameFeedback.textContent = 'Eroare la salvare. Încearcă din nou.';
        nameFeedback.className = 'profile-feedback error';
      } finally {
        btnSaveName.disabled = false;
      }
    });
  }

  // Secțiunea parolă
  const passwordSection = document.getElementById('profile-password-section');
  if (!passwordSection) return;

  const isGoogle = user.providerData.some(p => p.providerId === 'google.com');
  if (isGoogle) {
    passwordSection.innerHTML = `
      <label class="profile-label">Parolă</label>
      <p class="profile-value profile-muted">Contul tău este conectat prin Google. Parola este gestionată de Google.</p>
    `;
  } else {
    passwordSection.innerHTML = `
      <label class="profile-label">Parolă</label>
      <button class="profile-btn-secondary" id="btn-reset-password">Trimite email de resetare parolă</button>
      <p class="profile-feedback" id="password-feedback"></p>
    `;
    document.getElementById('btn-reset-password').addEventListener('click', async () => {
      const btn = document.getElementById('btn-reset-password');
      const feedback = document.getElementById('password-feedback');
      btn.disabled = true;
      try {
        await sendPasswordResetEmail(auth, user.email);
        feedback.textContent = `Email trimis la ${user.email}. Verifică-ți inbox-ul.`;
        feedback.className = 'profile-feedback success';
      } catch (e) {
        feedback.textContent = 'Eroare la trimiterea emailului. Încearcă din nou.';
        feedback.className = 'profile-feedback error';
      } finally {
        btn.disabled = false;
      }
    });
  }
}

function renderPlanSection(user, userData) {
  const container = document.getElementById('profile-plan-content');
  if (!container) return;

  const isTrial = userData.status === 'trial';
  const isTrialPending = userData.status === 'trial_pending';
  const isPaid = userData.status === 'paid' || userData.status === 'pending_cancellation';
  const isPendingCancellation = userData.status === 'pending_cancellation';
  const product = (isPaid && userData.gumroadProduct) || '';
  // Ordinea contează: „student-plus-preadmitere” conţine şi „admitere”.
  const paidPlan = product.includes('preadmitere') ? 'preadmitere'
    : product.includes('admitere') ? 'admitere'
    : product.includes('lunar') ? 'monthly'
    : product.includes('student-plus') ? 'legacy-3m'
    : 'monthly';
  const PAID_PLAN_INFO = {
    'monthly':     { name: 'Student Plus · Lunar',               price: '92 RON / lună' },
    'preadmitere': { name: 'Student Plus · Până la Preadmitere', price: '345 RON · plată unică' },
    'admitere':    { name: 'Student Plus · Până la Admitere',    price: '480 RON · plată unică' },
    'legacy-3m':   { name: 'Student Plus · 3 luni',              price: 'plată unică' }
  };
  const planName = isPaid ? PAID_PLAN_INFO[paidPlan].name : 'Standard';
  const planPrice = PAID_PLAN_INFO[paidPlan].price;
  const accessUntilDate = userData.accessUntil && typeof userData.accessUntil.toDate === 'function'
    ? userData.accessUntil.toDate()
    : null;
  const accessUntilText = accessUntilDate
    ? accessUntilDate.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  if (isTrial || isTrialPending) {
    const statusText = isTrialPending
      ? 'Acces simulare cumpărat · Premium activ din 9 mai, ora 08:00'
      : 'Trial activ · 9 mai – 12 mai';
    const badgeText = isTrialPending ? 'În așteptare' : 'Activ';
    const badgeStyle = isTrialPending ? 'background:var(--gold);color:#222' : '';

    const upgradeUrl = `https://admiterepoli.gumroad.com/l/student-plus-lunar?wanted=true&email=${encodeURIComponent(user.email)}`;

    container.innerHTML = `
      <div class="profile-plan-current">
        Planul tău actual: <strong>Trial Simulare</strong>
        <span class="profile-plan-badge" style="${badgeStyle}">${badgeText}</span>
      </div>
      <p class="profile-muted" style="margin-top:0.75rem">${statusText}</p>
      <div style="margin-top:1.25rem">
        <p class="profile-label">Vrei acces permanent?</p>
        <p class="profile-muted">Fă upgrade la Student Plus pentru acces complet după expirarea trial-ului.</p>
        <a class="profile-btn-upgrade" href="${escHtml(upgradeUrl)}" target="_blank" rel="noopener noreferrer"
           style="margin-top:0.75rem;display:inline-block;text-decoration:none">
          Upgrade la Student Plus
        </a>
      </div>
    `;
    return;
  }

  const standardBenefits = [
    'Acces la toate subiectele și rezolvările',
    'Simulări gratuite cu autocorectare',
    'Rezultate salvate în profil'
  ];
  const plusBenefits = [
    'Tot ce include Standard',
    'Acces la toate resursele premium',
    'Suport prioritar'
  ];

  const manageUrl = userData.gumroadSubscriptionId
    ? `https://gumroad.com/subscriptions/${encodeURIComponent(userData.gumroadSubscriptionId)}/manage`
    : null;

  const isSubscription = !!userData.gumroadSubscriptionId;

  const cancelSection = isPaid ? `
    <div class="profile-cancel-section">
      ${isSubscription ? `
        <p class="profile-label">Gestionare abonament</p>
        ${isPendingCancellation
          ? `<p class="profile-muted" style="color:var(--gold)">Abonamentul tău va expira pe <strong>${userData.pendingCancellationAt ? new Date(userData.pendingCancellationAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'data din emailul Gumroad'}</strong>. Accesul rămâne activ până atunci.</p>`
          : `<a class="profile-btn-secondary" href="${manageUrl}" target="_blank" rel="noopener noreferrer">Gestionează abonamentul</a>`
        }
        <p class="profile-muted" style="margin-top:0.5rem">Pentru refund în primele 14 zile, scrie-ne la <a class="profile-cancel-link" href="mailto:admiterepoli@gmail.com">admiterepoli@gmail.com</a>.</p>
      ` : `
        <p class="profile-label">Plată unică</p>
        <p class="profile-muted">${accessUntilText
          ? `Ai acces complet până pe <strong>${accessUntilText}</strong> inclusiv.`
          : 'Ai acces complet pe perioada planului cumpărat.'} Nu se reînnoiește automat.</p>
        <p class="profile-muted" style="margin-top:0.5rem">Dacă dorești un refund în primele 14 zile, scrie-ne la <a class="profile-cancel-link" href="mailto:admiterepoli@gmail.com">admiterepoli@gmail.com</a>.</p>
      `}
    </div>
  ` : '';

  const upgradeSection = isPaid ? '' : `
    <div class="plan-toggle-wrap" style="margin-top:1rem">
      <div class="plan-toggle plan-toggle--3" id="profile-billing-toggle">
        <button class="plan-toggle-btn active" data-billing="monthly">Lunar</button>
        <button class="plan-toggle-btn" data-billing="preadmitere">Preadmitere</button>
        <button class="plan-toggle-btn" data-billing="admitere">Admitere</button>
        <div class="plan-toggle-slider"></div>
      </div>
    </div>
    <p class="profile-muted" style="text-align:center;margin-top:0.5rem">Toate prețurile includ TVA.</p>
    <button class="profile-btn-upgrade" id="btn-upgrade-plan">Upgrade la Student Plus</button>
  `;

  container.innerHTML = `
    <div class="profile-plan-current">
      Planul tău actual: <strong>${planName}</strong>
      ${isPendingCancellation
        ? '<span class="profile-plan-badge" style="background:var(--gold);color:#222">Expiră curând</span>'
        : isPaid
          ? '<span class="profile-plan-badge">Activ</span>'
          : ''
      }
    </div>
    <div class="profile-plan-compare">
      <div class="profile-plan-col ${!isPaid ? 'plan-col-active' : ''}">
        <div class="profile-plan-col-name">Standard</div>
        <div class="profile-plan-col-price">Gratuit</div>
        <ul class="profile-plan-benefits">
          ${standardBenefits.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>
      <div class="profile-plan-col ${isPaid ? 'plan-col-active' : ''}">
        <div class="profile-plan-col-name">Student Plus</div>
        <div class="profile-plan-col-price" id="profile-plus-price">${isPaid ? planPrice : '92 RON / lună'}</div>
        <ul class="profile-plan-benefits">
          ${plusBenefits.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>
    </div>
    ${upgradeSection}
    ${cancelSection}
  `;


  if (!isPaid) {
    let billing = 'monthly';
    let selectedPlan = 'standard'; // 'standard' | 'plus'

    const gumroadUrls = {
      monthly:   `https://admiterepoli.gumroad.com/l/student-plus-lunar?wanted=true&email=${encodeURIComponent(user.email)}`,
      preadmitere: `https://admiterepoli.gumroad.com/l/student-plus-preadmitere?wanted=true&email=${encodeURIComponent(user.email)}`,
      admitere:    `https://admiterepoli.gumroad.com/l/student-plus-admitere?wanted=true&email=${encodeURIComponent(user.email)}`
    };

    const priceLabels = {
      monthly:     '92 RON / lună',
      preadmitere: '<s style="color:var(--muted);font-size:0.85em">460 RON</s> 345 RON · până la Preadmitere',
      admitere:    '<s style="color:var(--muted);font-size:0.85em">736 RON</s> 480 RON · până la Admitere'
    };

    const cols = document.querySelectorAll('.profile-plan-col');
    const upgradeBtn = document.getElementById('btn-upgrade-plan');

    function selectPlan(plan) {
      if (plan === selectedPlan) return;
      selectedPlan = plan;

      cols[0].classList.toggle('plan-col-active', plan === 'standard');
      cols[1].classList.toggle('plan-col-active', plan === 'plus');

      if (plan === 'plus') {
        upgradeBtn.classList.add('plan-ready');
      } else {
        upgradeBtn.classList.remove('plan-ready', 'plan-animate');
      }
    }

    cols[0].addEventListener('click', () => selectPlan('standard'));
    cols[1].addEventListener('click', () => selectPlan('plus'));

    document.querySelectorAll('#profile-billing-toggle .plan-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.billing === billing) return;
        document.querySelectorAll('#profile-billing-toggle .plan-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        billing = btn.dataset.billing;

        const slider = document.querySelector('#profile-billing-toggle .plan-toggle-slider');
        const btns = [...document.querySelectorAll('#profile-billing-toggle .plan-toggle-btn')];
        slider.style.transform = `translateX(${btns.indexOf(btn) * 100}%)`;

        // priceLabels sunt constante din cod (nu date de la user), deci innerHTML e sigur.
        document.getElementById('profile-plus-price').innerHTML = priceLabels[billing];
      });
    });

    upgradeBtn.addEventListener('click', () => {
      if (selectedPlan !== 'plus') return;
      window.open(gumroadUrls[billing], '_blank', 'noopener,noreferrer');
    });
  }
}

async function renderResultsSection(user) {
  const container = document.getElementById('profile-results-content');
  if (!container) return;

  try {
    const resultsRef = collection(db, 'users', user.uid, 'simulationResults');
    const snap = await getDocs(resultsRef);

    if (snap.empty) {
      container.innerHTML = `
        <p class="profile-empty">Nu ai completat nicio simulare încă.</p>
        <a href="./simulari" class="profile-btn-primary profile-btn-inline">Mergi la Simulări</a>
      `;
      return;
    }

    // Sortăm descrescător după completedAt client-side (evităm nevoia de index Firestore)
    const sortedDocs = snap.docs.slice().sort((a, b) => {
      const ta = a.data().completedAt?.toMillis?.() ?? 0;
      const tb = b.data().completedAt?.toMillis?.() ?? 0;
      return tb - ta;
    });

    const PAGE_SIZE = 5;
    const allCards = sortedDocs.map(d => {
      const r = d.data();
      const date = r.completedAt?.toDate
        ? r.completedAt.toDate().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—';
      const infoPct = (r.scoreInfo / 10) * 100;
      const matePct = (r.scoreMate / 10) * 100;
      const badge = getBadge(r.scoreTotal);

      return `
        <div class="profile-result-card">
          <div class="profile-result-header">
            <div>
              <div class="profile-result-title">${escHtml(r.title || r.simulationId)}</div>
              <div class="profile-result-date">${escHtml(date)}</div>
            </div>
            <span class="profile-result-badge ${badge.cls}">${badge.text}</span>
          </div>
          <div class="profile-result-score">${escHtml(r.scoreTotal)} / 20</div>
          <div class="profile-result-sections">
            <div class="profile-result-section">
              <div class="profile-result-section-label">
                <span>Informatică</span><span>${escHtml(r.scoreInfo)} / 10</span>
              </div>
              <div class="profile-result-bar">
                <div class="profile-result-bar-fill bar-info" style="width:${escHtml(infoPct)}%"></div>
              </div>
            </div>
            <div class="profile-result-section">
              <div class="profile-result-section-label">
                <span>Matematică</span><span>${escHtml(r.scoreMate)} / 10</span>
              </div>
              <div class="profile-result-bar">
                <div class="profile-result-bar-fill bar-mate" style="width:${escHtml(matePct)}%"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    const renderCards = (count) => {
      const visible = allCards.slice(0, count).join('');
      const remaining = allCards.length - count;
      const showMoreBtn = remaining > 0
        ? `<button class="profile-btn-secondary profile-show-more" id="btn-show-more">Arată mai multe (${remaining})</button>`
        : '';
      container.innerHTML = visible + showMoreBtn;
      if (remaining > 0) {
        document.getElementById('btn-show-more').addEventListener('click', () => {
          renderCards(count + PAGE_SIZE);
        });
      }
    };

    renderCards(PAGE_SIZE);
  } catch (e) {
    console.error('[Profile] Eroare încărcare rezultate:', e);
    container.innerHTML = `<p class="profile-empty">Eroare la încărcarea rezultatelor.</p>`;
  }
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getBadge(score) {
  if (score >= 16) return { text: 'Excelent', cls: 'badge-excellent' };
  if (score >= 11) return { text: 'Bine', cls: 'badge-good' };
  if (score >= 6)  return { text: 'Suficient', cls: 'badge-ok' };
  return { text: 'Insuficient', cls: 'badge-fail' };
}
