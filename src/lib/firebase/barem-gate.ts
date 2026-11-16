/**
 * Gate of a barem page (`#barem-gate` / `#barem-content`), extracted from `legacy/firebase-auth.js`
 * (issue #26). The injected HTML is byte-identical to the legacy one; do not reformat the template
 * literals.
 *
 * `#barem-content` starts hidden and is shown by `applyBaremGate`. It also carries a
 * `data-reveal-after` attribute, the safety net handled outside this module: once the barem is
 * public, the reveal script shows it even when this module never loads. Keep both paths.
 */
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import type { UserDoc } from '../../types/firestore';
import { hasSimulationAccess, isSaleClosed } from './access';
import { db } from './app';
import { STUDENT_PLUS_URL, scheduleGateUnlock, stopGateCountdown } from './exam-gate';

/** `message` of a caught value, for the log line the legacy code printed. */
function errorMessage(e: unknown): unknown {
  return typeof e === 'object' && e !== null && 'message' in e ? e.message : undefined;
}

/* Baremul se deblochează în acelaşi moment cu subiectul: la startul simulării,
   pentru cine are acces. Înainte de start e închis pentru toată lumea, inclusiv
   pentru plătitori — altfel cine cumpără cu o zi înainte citeşte răspunsurile pe
   îndelete. După isSaleClosed() pagina devine publică (acelaşi moment cu apariţia
   în arhiva de pe simulari.html).
   Config-ul stă în window.baremConfig, în <head>-ul paginii de barem.
   Nu e securitate reală — răspunsurile sunt oricum în sursa paginii de simulare —
   ci împiedicarea drumului uşor către ele cât timp fereastra e deschisă. */

export async function applyBaremGate(user: Pick<User, 'uid' | 'email'> | null): Promise<void> {
  const cfg = window.baremConfig;
  const content = document.getElementById('barem-content');
  const gate = document.getElementById('barem-gate');
  if (!cfg || !content || !gate) return;

  function showGate(html: string): void {
    if (!content || !gate) return;
    stopGateCountdown();
    gate.innerHTML = `<div class="exam-gate-inner">${html}</div>`;
    gate.style.display = '';
    content.style.display = 'none';
  }

  function showContent(): void {
    if (!content || !gate) return;
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
  let data: UserDoc;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    data = snap.exists() ? snap.data() : {};
  } catch (e) {
    console.warn('[BaremGate] Nu s-a putut verifica statusul:', errorMessage(e));
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
