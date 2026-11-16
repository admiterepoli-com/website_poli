/**
 * Submit, results screen and page wiring of the exam engine: the `SUBMIT`
 * block of the legacy `simulare-2026-*` pages (`submitAll`, `finalizeExam`,
 * the blank-problems warning), the call to `saveSimulationResult`, and
 * `mountExam`, which ties state, rendering, timer and submit together for a
 * page built on `ExamLayout`.
 *
 * Usage, in the page (see `src/layouts/ExamLayout.astro`):
 *
 *     <Fragment slot="scripts">
 *       <script>
 *         import exam from '../data/simulations/<file>';
 *         import { mountExam } from '../lib/exam/results';
 *         mountExam(exam, { saveTrack: true });
 *       </script>
 *     </Fragment>
 *
 * The generated markup is the legacy one, character for character. The parts
 * that differ between the four legacy pages, and where they come from:
 *
 * - Sheets payload (`SheetsPayload`): simulations without track selection (1
 *   and 2) send `scor_info` / `detalii_info` and no `track`; the others send
 *   `track` and name the two fields after it. Derived from
 *   `ExamConfig.trackSelection`.
 * - Blank-problems warning: simulations 1 and 2 have the long stylesheet (DM
 *   Sans, icon glow) and the text "…nerezolvate la Matematică și/sau
 *   Informatică…"; simulations 3 and 4 the minified one and the short text.
 *   Also derived from `trackSelection`; `MountOptions.warning` overrides it.
 * - Saved result: only simulation 4 passes `track` to `saveSimulationResult`,
 *   so the profile documents of simulations 1 to 3 have `track: null`. Nothing
 *   in the configuration tells simulation 3 from 4, so the page says it with
 *   `MountOptions.saveTrack`.
 * - Simulations 1 and 2 log the result to the console (`Rezultate simulare:`)
 *   and word the fetch log differently; kept, derived from `trackSelection`.
 */

import {
  buildTimerDots,
  installInlineHandlers,
  renderMinimap,
  renderQuestions,
  selectTrack,
  updateProgress,
  updateSubmitCounts,
  updateTimerDots,
} from './render';
import { buildExamResult } from './scoring';
import {
  countTotalUnanswered,
  createExamState,
  finishExam,
  getActiveTrack,
  pauseForConfirmation,
  resumeExam,
  startExam,
} from './state';
import { createExamTimer, updateTimerDisplay, type ExamTimer } from './timer';
import type {
  AnswerDetail,
  ExamConfig,
  ExamResult,
  ExamState,
  SectionResult,
  SheetsPayload,
  SubjectId,
  Track,
} from './types';
import type { SimulationResultInput } from '../../types/firestore';

/* ── Options ──────────────────────────────────────────────────── */

/** Which legacy blank-problems warning to show. */
export type WarningVariant = 'single-track' | 'tracks';

export interface MountOptions {
  /**
   * Pass the chosen track to `saveSimulationResult`. `true` only for
   * simulation 4; simulations 1 to 3 saved `track: null` and must keep doing so.
   */
  saveTrack: boolean;
  /** Defaults to `single-track` without track selection, `tracks` with it. */
  warning?: WarningVariant;
}

/** Everything `submitAll` and `finalizeExam` work on. */
export interface ExamContext {
  config: ExamConfig;
  state: ExamState;
  timer: ExamTimer;
  options: MountOptions;
}

/* ── Pure builders ────────────────────────────────────────────── */

/** Suffix of the `rc-` / `sc-` / `bf-` classes of a results card. */
const CARD_CLASS = {
  info: 'info',
  fizica: 'fizica-res',
  mate: 'mate',
} as const satisfies Record<SubjectId, string>;

/** Card icon as the legacy strings wrote it (`&sum;` as an entity, the others literally). */
function cardIcon(subject: SubjectId, icon: string): string {
  return subject === 'mate' ? '&sum;' : icon;
}

function resultsCardHtml(track: Track, section: SectionResult): string {
  const source = track.sections.find((candidate) => candidate.slot === section.slot);
  const label = source?.label ?? '';
  const icon = cardIcon(section.subject, source?.icon ?? '');
  const cls = CARD_CLASS[section.subject];
  return (
    '<div class="sim-results-card">' +
    `<div class="sim-results-card-icon rc-${cls}">${icon}</div>` +
    `<div class="sim-results-card-label">${label}</div>` +
    `<div class="sim-results-card-score sc-${cls}">${section.score} / ${section.maxScore}</div>` +
    `<div class="sim-results-card-bar"><div class="sim-results-card-bar-fill bf-${cls}" style="width:${section.percent}%"></div></div>` +
    '</div>'
  );
}

/** Markup of `#results-screen`, as legacy `finalizeExam` builds it. */
export function resultsHtml(track: Track, result: ExamResult): string {
  return (
    '<div class="sim-results">' +
    `<div class="sim-results-badge ${result.badge.className}">${result.badge.text}</div>` +
    '<div class="sim-results-total-wrap">' +
    `<div class="sim-results-total-number">${result.score} / ${result.maxScore}</div>` +
    '<div class="sim-results-total-label">Scor Total</div>' +
    '</div>' +
    '<div class="sim-results-sections">' +
    result.sections.map((section) => resultsCardHtml(track, section)).join('') +
    '</div>' +
    '<div class="sim-results-meta">' +
    '<div class="sim-results-meta-item">' +
    '<p>Cod participant</p>' +
    `<p><strong>${result.participantCode}</strong></p>` +
    '</div>' +
    '<div class="sim-results-meta-item">' +
    '<p>Timp folosit</p>' +
    `<p><span class="meta-time">${result.elapsedLabel}</span></p>` +
    '</div>' +
    '</div>' +
    '</div>'
  );
}

function sectionIn(result: ExamResult, slot: 'info' | 'mate'): SectionResult | undefined {
  return result.sections.find((section) => section.slot === slot);
}

/**
 * Body posted to the Google Apps Script. Keys are in the legacy order; the
 * discipline in the `info` slot is named after the track (`scor_info`,
 * `scor_fizica`), and `track` is sent only by simulations with track selection.
 */
export function buildSheetsPayload(config: ExamConfig, result: ExamResult): SheetsPayload {
  const disc = sectionIn(result, 'info');
  const mate = sectionIn(result, 'mate');
  const discScore = disc?.score ?? 0;
  const discDetails: readonly AnswerDetail[] = disc?.details ?? [];
  const head = config.trackSelection
    ? { id_participant: result.participantCode, track: result.trackId }
    : { id_participant: result.participantCode };
  const scoreField = result.trackId === 'fizica' ? { scor_fizica: discScore } : { scor_info: discScore };
  const detailsField =
    result.trackId === 'fizica' ? { detalii_fizica: discDetails } : { detalii_info: discDetails };
  return {
    ...head,
    timp_folosit: result.elapsedLabel,
    scor_total: result.score,
    ...scoreField,
    scor_mate: mate?.score ?? 0,
    ...detailsField,
    detalii_mate: mate?.details ?? [],
  };
}

/**
 * Second argument of `saveSimulationResult`, field for field as each legacy
 * page sent it: simulations 1 and 2 `scoreInfo`, simulations 3 and 4
 * `scoreDisc` (both end up as `scoreInfo` in the document), and `track` only
 * with `saveTrack`.
 */
export function buildSaveInput(
  config: ExamConfig,
  track: Track,
  result: ExamResult,
  saveTrack: boolean,
): SimulationResultInput {
  const disc = sectionIn(result, 'info')?.score ?? 0;
  const scoreMate = sectionIn(result, 'mate')?.score ?? 0;
  const head: SimulationResultInput = saveTrack
    ? { title: track.resultTitle, track: track.id }
    : { title: track.resultTitle };
  const discField: SimulationResultInput = config.trackSelection ? { scoreDisc: disc } : { scoreInfo: disc };
  return {
    ...head,
    scoreTotal: result.score,
    ...discField,
    scoreMate,
    timeElapsed: result.elapsedSeconds,
  };
}

/* ── Blank-problems warning ───────────────────────────────────── */

const WARNING_STYLE_ID = 'sim-alert-styles';
const OVERLAY_CLASS = 'sim-super-overlay';

/* Stylesheets and markup copied verbatim from the legacy pages. */
const WARNING_STYLES: Record<WarningVariant, string> = {
  'single-track': `
                .sim-super-overlay { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background: rgba(13, 17, 23, 0.8) !important; backdrop-filter: blur(10px) !important; -webkit-backdrop-filter: blur(10px) !important; z-index: 2147483647 !important; display: flex !important; align-items: center !important; justify-content: center !important; opacity: 0; transition: opacity 0.3s ease !important; }
                .sim-super-overlay.show { opacity: 1 !important; }
                .sim-super-box { background: var(--glass-bg, #111827) !important; border: 1px solid var(--glass-border, rgba(255,255,255,0.1)) !important; border-radius: 20px !important; padding: 2.5rem !important; max-width: 450px !important; text-align: center !important; box-shadow: 0 20px 50px rgba(0,0,0,0.8) !important; transform: translateY(20px) scale(0.95) !important; transition: all 0.3s ease !important; font-family: 'DM Sans', sans-serif !important; color: #e2e8f0 !important; }
                .sim-super-overlay.show .sim-super-box { transform: translateY(0) scale(1) !important; }
                .sim-super-icon { font-size: 3.5rem !important; margin-bottom: 1rem !important; filter: drop-shadow(0 0 12px rgba(255, 202, 75, 0.3)) !important; }
                .sim-super-title { font-size: 1.5rem !important; margin-bottom: 0.5rem !important; color: white !important; font-weight: bold !important; }
                .sim-super-desc { color: #94a3b8 !important; margin-bottom: 2rem !important; line-height: 1.5 !important; }

                .sim-alert-buttons { display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem; flex-wrap: wrap; }
                .sim-super-btn { background: var(--accent, #38bdf8) !important; color: #000 !important; border: none !important; padding: 12px 24px !important; border-radius: 10px !important; font-size: 1rem !important; font-weight: 600 !important; cursor: pointer !important; transition: transform 0.2s !important; }
                .sim-super-btn:hover { transform: scale(1.05) !important; }
                .sim-super-btn-outline { background: transparent !important; color: #94a3b8 !important; border: 1px solid #94a3b8 !important; padding: 12px 24px !important; border-radius: 10px !important; font-size: 1rem !important; font-weight: 600 !important; cursor: pointer !important; transition: all 0.2s !important; }
                .sim-super-btn-outline:hover { background: rgba(148, 163, 184, 0.1) !important; color: #fff !important; border-color: #fff !important; }
            `,
  tracks: `.sim-super-overlay{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;background:rgba(13,17,23,.8)!important;backdrop-filter:blur(10px)!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;opacity:0;transition:opacity .3s ease!important}.sim-super-overlay.show{opacity:1!important}.sim-super-box{background:var(--glass-bg,#111827)!important;border:1px solid rgba(255,255,255,.1)!important;border-radius:20px!important;padding:2.5rem!important;max-width:450px!important;text-align:center!important;box-shadow:0 20px 50px rgba(0,0,0,.8)!important;transform:translateY(20px) scale(.95)!important;transition:all .3s ease!important;color:#e2e8f0!important}.sim-super-overlay.show .sim-super-box{transform:translateY(0) scale(1)!important}.sim-super-icon{font-size:3.5rem!important;margin-bottom:1rem!important}.sim-super-title{font-size:1.5rem!important;margin-bottom:.5rem!important;color:#fff!important;font-weight:700!important}.sim-super-desc{color:#94a3b8!important;margin-bottom:2rem!important;line-height:1.5!important}.sim-alert-buttons{display:flex;gap:1rem;justify-content:center;margin-top:1.5rem;flex-wrap:wrap}.sim-super-btn{background:var(--accent,#38bdf8)!important;color:#000!important;border:none!important;padding:12px 24px!important;border-radius:10px!important;font-size:1rem!important;font-weight:600!important;cursor:pointer!important;transition:transform .2s!important}.sim-super-btn:hover{transform:scale(1.05)!important}.sim-super-btn-outline{background:transparent!important;color:#94a3b8!important;border:1px solid #94a3b8!important;padding:12px 24px!important;border-radius:10px!important;font-size:1rem!important;font-weight:600!important;cursor:pointer!important;transition:all .2s!important}.sim-super-btn-outline:hover{background:rgba(148,163,184,.1)!important;color:#fff!important;border-color:#fff!important}`,
};

/** Markup of the warning box for `blank` problems left unanswered. */
export function warningHtml(variant: WarningVariant, blank: number): string {
  if (variant === 'single-track') {
    return `
            <div class="sim-super-box">
                <div class="sim-super-icon">⚠️</div>
                <div class="sim-super-title">Atenție! ${blank} subiecte goale</div>
                <div class="sim-super-desc">Mai ai întrebări nerezolvate la Matematică și/sau Informatică. Sigur vrei să finalizezi? Nu te vei mai putea întoarce la test.</div>
                <div class="sim-alert-buttons">
                    <button class="sim-super-btn" onclick="this.closest('.sim-super-overlay').classList.remove('show'); setTimeout(() => this.closest('.sim-super-overlay').remove(), 300); startTimer();">Mă întorc la test</button>
                    <button class="sim-super-btn-outline" onclick="submitAll(false, true)">Trimite oricum</button>
                </div>
            </div>
        `;
  }
  return `<div class="sim-super-box"><div class="sim-super-icon">⚠️</div><div class="sim-super-title">Atenție! ${blank} subiecte goale</div><div class="sim-super-desc">Mai ai întrebări nerezolvate. Sigur vrei să finalizezi? Nu te vei mai putea întoarce la test.</div><div class="sim-alert-buttons"><button class="sim-super-btn" onclick="this.closest('.sim-super-overlay').classList.remove('show');setTimeout(()=>this.closest('.sim-super-overlay').remove(),300);startTimer();">Mă întorc la test</button><button class="sim-super-btn-outline" onclick="submitAll(false,true)">Trimite oricum</button></div></div>`;
}

function showWarning(variant: WarningVariant, blank: number): void {
  if (!document.getElementById(WARNING_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = WARNING_STYLE_ID;
    style.innerHTML = WARNING_STYLES[variant];
    document.head.appendChild(style);
  }
  const overlay = document.createElement('div');
  overlay.className = OVERLAY_CLASS;
  overlay.innerHTML = warningHtml(variant, blank);
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('show'), 10);
}

/* ── Submit ───────────────────────────────────────────────────── */

function postResult(config: ExamConfig, result: ExamResult): void {
  const payload = buildSheetsPayload(config, result);
  const scriptURL = config.resultsEndpoint;
  if (!scriptURL) return;
  const sentMessage = config.trackSelection ? 'Date trimise!' : 'Datele au ajuns în tabelul organizatorilor!';
  fetch(scriptURL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })
    .then(() => console.log(sentMessage))
    .catch((err: unknown) => console.error('Eroare:', err));
}

/**
 * Shows the results (legacy `finalizeExam`): closes the warning, hides the
 * quiz, posts the payload, fills `#results-screen`, scrolls to the top and
 * saves the result to the signed-in user's profile.
 */
export function finalizeExam(context: ExamContext, track: Track, result: ExamResult): void {
  const { config, state, options } = context;
  finishExam(state);

  const existingOverlay = document.querySelector(`.${OVERLAY_CLASS}`);
  if (existingOverlay) {
    existingOverlay.classList.remove('show');
    setTimeout(() => existingOverlay.remove(), 300);
  }

  const quizArea = document.getElementById('quiz-area');
  quizArea?.classList.remove('active');
  if (quizArea) quizArea.style.display = 'none';
  const resultsEl = document.getElementById('results-screen');
  if (resultsEl) resultsEl.style.display = 'block';

  postResult(config, result);

  if (resultsEl) {
    resultsEl.innerHTML = resultsHtml(track, result);
    window.renderMathInElement?.(resultsEl);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!config.trackSelection) {
    const disc = sectionIn(result, 'info');
    const mate = sectionIn(result, 'mate');
    console.log('Rezultate simulare:', {
      code: result.participantCode,
      scoreInfo: disc?.score ?? 0,
      scoreMate: mate?.score ?? 0,
      scoreTotal: result.score,
      elapsed: result.elapsedLabel,
      info: disc?.details ?? [],
      mate: mate?.details ?? [],
    });
  }

  // Salvare rezultat în profilul utilizatorului (dacă e autentificat)
  void window.saveSimulationResult?.(
    track.resultId,
    buildSaveInput(config, track, result, options.saveTrack),
  );
}

/**
 * Legacy `submitAll(timeUp, forceSubmit)`: stops the clock and scores the
 * sitting. When the time is up, the candidate confirmed, or nothing is left
 * blank, the results are shown; otherwise the warning asks for confirmation
 * and the clock stays stopped until "Mă întorc la test".
 */
export function submitAll(context: ExamContext, timeUp = false, forceSubmit = false): void {
  const { config, state, timer, options } = context;
  timer.stop();
  const track = getActiveTrack(config, state);
  if (track === null) return;
  const result = buildExamResult(config, track, state, timeUp);
  const blank = countTotalUnanswered(state);

  if (timeUp || forceSubmit || blank === 0) {
    finalizeExam(context, track, result);
    return;
  }

  pauseForConfirmation(state);
  showWarning(options.warning ?? (config.trackSelection ? 'tracks' : 'single-track'), blank);
}

/* ── Page wiring ──────────────────────────────────────────────── */

/**
 * Starts the exam on the track already put in place by `selectTrack` (legacy
 * `startExam`): renders questions, minimaps and counters, starts the clock and
 * scrolls the timer bar to just below the header.
 */
function beginExam(context: ExamContext, track: Track): void {
  if (!startExam(context.state, context.config, track.id, Date.now())) return;
  document.getElementById('quiz-area')?.classList.add('active');
  for (const section of track.sections) renderQuestions(section);
  for (const section of track.sections) renderMinimap(section);
  buildTimerDots(track);
  for (const section of track.sections) updateProgress(context.state, section.slot);
  updateTimerDots(context.state, track);
  updateSubmitCounts(context.state, track);
  context.timer.start();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const headerH = document.querySelector('header')?.offsetHeight ?? 0;
      const timerBar = document.querySelector('.sim-timer-bar');
      if (!timerBar) return;
      const timerRect = timerBar.getBoundingClientRect();
      window.scrollTo({ top: Math.max(0, window.scrollY + timerRect.top - headerH - 8), behavior: 'smooth' });
    });
  });
}

/**
 * Runs a simulation page built on `ExamLayout`. Publishes on `window` the
 * functions named by inline `onclick` attributes (`selectTrack`,
 * `selectAnswer`, `switchTab`, `scrollToQuestion`, `submitAll`, and
 * `startTimer` for "Mă întorc la test"). Simulations without track selection
 * start as soon as the document is parsed, as legacy did on
 * `DOMContentLoaded`; the others wait for a track card to be clicked.
 */
export function mountExam(config: ExamConfig, options: MountOptions): ExamContext {
  const state = createExamState(config);
  const clock = document.getElementById('timer-clock');
  // `context` is filled right below; the timer only calls back once started.
  const context: ExamContext = {
    config,
    state,
    options,
    timer: createExamTimer({
      config,
      state,
      onDisplay: (current) => {
        if (clock) updateTimerDisplay(clock, current.secondsLeft, config.timer);
      },
      onExpire: () => submitAll(context, true),
    }),
  };

  installInlineHandlers(config, state, { onTrackSelected: (track) => beginExam(context, track) });
  Object.assign(window, {
    submitAll(timeUp?: unknown, forceSubmit?: unknown): void {
      submitAll(context, Boolean(timeUp), Boolean(forceSubmit));
    },
    startTimer(): void {
      resumeExam(state);
      context.timer.start();
    },
  });

  if (!config.trackSelection) {
    const start = (): void => {
      const track = selectTrack(config, state, config.tracks[0].id);
      if (track) beginExam(context, track);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }
  return context;
}
