/**
 * Content gate of the simulation pages (`#exam-gate` / `#exam-content`) and the timer that unlocks
 * a gate at its start time without a refresh. Extracted from `legacy/firebase-auth.js` (issue #24).
 * The injected HTML is byte-identical to the legacy one; do not reformat the template literals.
 *
 * Both elements start hidden and are shown only by `applyExamGate`. When this module never loads
 * (school network, ad blocker), `src/scripts/gate-fallback.ts` shows an error in the gate instead.
 */
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import type { UserDoc } from '../../types/firestore';
import { hasSimulationAccess, isSaleClosed } from './access';
import { db } from './app';
import { STUDENT_PLUS_OFFERS } from './offers';

/** KaTeX auto-render, loaded by the simulation pages as a classic script. */
type MathWindow = Window & { renderMathInElement?: (element: HTMLElement) => void };

/** `message` of a caught value, for the log line the legacy code printed. */
function errorMessage(e: unknown): unknown {
  return typeof e === 'object' && e !== null && 'message' in e ? e.message : undefined;
}

export const STUDENT_PLUS_URL: string = STUDENT_PLUS_OFFERS.monthly.gumroadUrl;

/* Deblocare automată la ora de start, fără refresh manual. Un singur timer activ
   pe pagină — applyExamGate poate fi re-apelat la fiecare schimbare de stare auth.
   setTimeout are un plafon de ~24.8 zile, aşa că îl re-programăm în tranşe. */
const MAX_TIMEOUT_MS = 2147483647;
let gateUnlockTimer: ReturnType<typeof setTimeout> | null = null;

export function stopGateCountdown(): void {
  if (gateUnlockTimer) {
    clearTimeout(gateUnlockTimer);
    gateUnlockTimer = null;
  }
}

/** Runs `onExpire` once `target` is reached (immediately if it already passed). */
export function scheduleGateUnlock(target: Date | number, onExpire: () => void): void {
  stopGateCountdown();
  const diff = Number(target) - Date.now();
  if (diff <= 0) {
    onExpire();
    return;
  }
  gateUnlockTimer = setTimeout(() => scheduleGateUnlock(target, onExpire), Math.min(diff, MAX_TIMEOUT_MS));
}

export async function applyExamGate(user: Pick<User, 'uid' | 'email'> | null): Promise<void> {
  const content = document.getElementById('exam-content');
  const gate = document.getElementById('exam-gate');
  if (!content || !gate) return;

  // Config per pagină (vezi <script> din <head>-ul paginii de simulare)
  const simId = window.simulationId ?? null;
  const simLabel = window.simulationLabel ?? 'Această simulare';
  const buyUrl = window.simulationBuyUrl ?? STUDENT_PLUS_URL;
  const buyLabel = window.simulationBuyUrl ? 'Cumpără acces la simulare' : 'Cumpără acces Student Plus';
  const saleClosed = isSaleClosed(simId);

  function showGate(html: string): void {
    if (!content || !gate) return;
    stopGateCountdown();
    gate.innerHTML = html;
    gate.style.display = '';
    content.style.display = 'none';
  }

  function showContent(): void {
    if (!content || !gate) return;
    stopGateCountdown();
    content.style.display = '';
    gate.style.display = 'none';
    const mathWindow: MathWindow = window;
    if (mathWindow.renderMathInElement) mathWindow.renderMathInElement(content);
  }

  // Înainte de ora de start → blocat pentru toată lumea. Ora vine din fișierul de date al
  // simulării (ExamLayout o scrie în <head>); fără ea nu există fază de „nu a început” (#137).
  const examStart = window.examGateStart;
  const startLabel = window.examGateStartLabel ?? '';
  if (examStart && new Date() < examStart) {
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
          ${
            saleClosed
              ? `<a class="exam-gate-btn exam-gate-btn-outline" href="${STUDENT_PLUS_URL}" target="_blank" rel="noopener">Vezi Student Plus</a>`
              : `<a class="exam-gate-btn exam-gate-btn-outline" href="${buyUrl}" target="_blank" rel="noopener">Cumpără acces</a>`
          }
        </div>
      </div>`);
    return;
  }

  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    const data: UserDoc = snap.exists() ? snap.data() : {};
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
          ${
            saleClosed
              ? `<p class="exam-gate-desc">Vânzarea separată pentru ${simLabel} s-a încheiat. Simularea rămâne inclusă în abonamentul <strong>Student Plus</strong>.</p>
               <div class="exam-gate-actions">
                 <a class="exam-gate-btn" href="${STUDENT_PLUS_URL}" target="_blank" rel="noopener">Vezi Student Plus</a>
               </div>`
              : `<p class="exam-gate-desc">${simLabel} este inclusă în abonamentul <strong>Student Plus</strong> sau poate fi cumpărată separat, cu acces permanent.</p>
               <div class="exam-gate-actions">
                 <a class="exam-gate-btn" href="${buyHref}" target="_blank" rel="noopener">${buyLabel}</a>
                 ${window.simulationBuyUrl ? `<a class="exam-gate-btn exam-gate-btn-outline" href="${STUDENT_PLUS_URL}" target="_blank" rel="noopener">Vezi Student Plus</a>` : ''}
               </div>`
          }
        </div>`);
    }
  } catch (e) {
    console.warn('[Gate] Nu s-a putut verifica statusul:', errorMessage(e));
    showContent();
  }
}
