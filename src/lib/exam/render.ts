/**
 * DOM side of the exam engine: questions, minimap, timer dots, tabs, progress
 * and the track choice (the `RENDER`, `INTERACTIONS` and `TRACK SELECTION`
 * blocks of the legacy `simulare-2026-*` pages).
 *
 * The generated markup is the legacy one, character for character, because the
 * `sim-*` CSS and the static page skeleton depend on its classes and ids:
 * `questions-<slot>`, `q-<slot>-<i>`, `qnum-<slot>-<i>`, `minimap-<slot>`,
 * `dot-<slot>-<i>`, `tdot-<i>`, `progress-fill-<slot>`, `badge-<slot>`, …
 * That includes the inline `onclick` attributes of the answers and of the
 * minimap dots, so the functions they name must exist on `window`; see
 * `installInlineHandlers`.
 *
 * Nothing here keeps state: every function receives the `ExamState` and the
 * `Track` it works on. The timer, scoring and the results screen live in their
 * own modules.
 *
 * Differences between the four legacy pages, all covered by the newest form:
 * - simulations 1 to 3 hard-code 10 + 10 problems (20 timer dots, `/20`);
 *   simulation 4 counts them, which is what this module does;
 * - simulations 1 and 2 have no track choice and write the inline handlers
 *   with a space after each comma (`selectAnswer('info', 0, 'a', this)`);
 *   simulations 3 and 4 write them without. The compact form is generated;
 * - simulation 4 fills `submit-total-*` from the track; older pages have the
 *   totals in the static markup and no such elements;
 * - only simulation 4 tolerates a missing KaTeX or a missing timer dot.
 */

import { ANSWER_KEYS } from './types';
import type {
  AnswerKey,
  AnswerSheet,
  ExamConfig,
  ExamState,
  Section,
  SectionSlot,
  SubjectId,
  Track,
  TrackId,
} from './types';

/* ── Presentation keyed off slot and subject ──────────────────── */

/** Halo drawn for 1.5 s around a question reached from the minimap. */
const HIGHLIGHT_COLOR = {
  info: 'rgba(77,182,172,0.5)',
  fizica: 'rgba(251,191,36,0.5)',
  mate: 'rgba(130,141,248,0.5)',
} as const satisfies Record<SubjectId, string>;

const HIGHLIGHT_MS = 1500;

/** Class that recolours the `info` slot when it holds the physics section. */
const FIZICA_MODE_CLASS = 'fizica-mode';

/** KaTeX auto-render, loaded with `defer` from the CDN by the page head. */
type KatexWindow = Window & { renderMathInElement?: (element: HTMLElement) => void };

/* ── Helpers ──────────────────────────────────────────────────── */

function byId(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function setText(id: string, text: string | number): void {
  const element = byId(id);
  if (element) element.textContent = String(text);
}

function isSectionSlot(value: unknown): value is SectionSlot {
  return value === 'info' || value === 'mate';
}

function isAnswerKey(value: unknown): value is AnswerKey {
  const keys: readonly unknown[] = ANSWER_KEYS;
  return keys.includes(value);
}

function sheetOf(state: ExamState, slot: SectionSlot): AnswerSheet {
  return state.answers[slot] ?? [];
}

function answeredCount(state: ExamState, slot: SectionSlot): number {
  return sheetOf(state, slot).filter((answer) => answer !== null).length;
}

function totalProblems(track: Track): number {
  return track.sections.reduce((total, section) => total + section.problems.length, 0);
}

/** The track with this id, or `null` when the simulation does not have it. */
export function findTrack(config: ExamConfig, trackId: TrackId | null): Track | null {
  return config.tracks.find((track) => track.id === trackId) ?? null;
}

/* ── Render ───────────────────────────────────────────────────── */

/**
 * Markup of a section's questions, as legacy `renderQuestions` builds it.
 * Statements and options are inserted as HTML, unescaped: they carry markup
 * (`<pre><code>`, `<svg>` figures) and KaTeX delimiters.
 */
export function questionsHtml(section: Section): string {
  const slot = section.slot;
  const numClass = slot === 'info' ? 'info-num' : 'mate-num';
  let html = '';
  section.problems.forEach((problem, i) => {
    html +=
      `<div class="sim-question" id="q-${slot}-${i}">` +
      '<div class="sim-q-header">' +
      `<div class="sim-q-number ${numClass}" id="qnum-${slot}-${i}">${i + 1}</div>` +
      `<div class="sim-q-text"><h3>${problem.statement}</h3></div>` +
      '</div><div class="sim-answers">';
    problem.options.forEach((option) => {
      // The answer value is the letter the option starts with ("a) 8", "a. 8").
      const value = option.charAt(0);
      html +=
        `<label class="sim-answer" onclick="selectAnswer('${slot}',${i},'${value}',this)">` +
        `<input type="radio" name="${slot}-p${i}" value="${value}">` +
        '<span class="sim-answer-check"></span>' +
        `<span class="sim-answer-text">${option}</span></label>`;
    });
    html += '</div></div>';
  });
  return html;
}

/** Fills `#questions-<slot>` with the section's problems and typesets the formulas. */
export function renderQuestions(section: Section): void {
  const container = byId(`questions-${section.slot}`);
  if (!container) return;
  container.innerHTML = questionsHtml(section);
  // KaTeX se încarcă cu defer; dacă scriptul ăsta rulează înaintea lui,
  // auto-render.min.js trece oricum peste tot body-ul la onload.
  const katexWindow: KatexWindow = window;
  katexWindow.renderMathInElement?.(container);
}

/** Markup of a section's minimap: one numbered dot per problem. */
export function minimapHtml(section: Section): string {
  const slot = section.slot;
  let html = '';
  section.problems.forEach((_, i) => {
    html += `<div class="sim-minimap-dot" id="dot-${slot}-${i}" onclick="scrollToQuestion('${slot}',${i})">${i + 1}</div>`;
  });
  return html;
}

/** Fills `#minimap-<slot>`. */
export function renderMinimap(section: Section): void {
  const map = byId(`minimap-${section.slot}`);
  if (map) map.innerHTML = minimapHtml(section);
}

/** Markup of the dots under the clock: one per problem of the track. */
export function timerDotsHtml(track: Track): string {
  let html = '';
  const total = totalProblems(track);
  for (let i = 0; i < total; i++) html += `<div class="sim-timer-dot" id="tdot-${i}"></div>`;
  return html;
}

/** Fills `#timer-dots`. */
export function buildTimerDots(track: Track): void {
  const container = byId('timer-dots');
  if (container) container.innerHTML = timerDotsHtml(track);
}

/* ── Interactions ─────────────────────────────────────────────── */

/**
 * Records an answer and marks it in the question, the minimap, the progress
 * bar, the timer dots and the submit summary. `el` is the clicked
 * `label.sim-answer`. Choosing another option of the same problem replaces
 * the answer; an answer cannot be cleared.
 */
export function selectAnswer(
  state: ExamState,
  track: Track,
  slot: SectionSlot,
  index: number,
  value: AnswerKey,
  el: Element,
): void {
  const sheet = state.answers[slot];
  if (sheet) sheet[index] = value;

  const isMate = slot === 'mate';
  const question = byId(`q-${slot}-${index}`);
  question?.querySelectorAll('.sim-answer').forEach((label) => {
    label.classList.remove('selected', 'mate-selected');
  });
  el.classList.add('selected');
  if (isMate) el.classList.add('mate-selected');
  question?.classList.add('answered');
  if (isMate) question?.classList.add('mate-answered');
  byId(`qnum-${slot}-${index}`)?.classList.add('done');
  byId(`dot-${slot}-${index}`)?.classList.add(isMate ? 'answered-mate' : 'answered-info');

  updateProgress(state, slot);
  updateTimerDots(state, track);
  updateSubmitCounts(state, track);
}

/** Shows the panel of another tab. */
export function switchTab(state: ExamState, slot: SectionSlot): void {
  if (slot === state.activeSlot) return;
  state.activeSlot = slot;
  document.querySelectorAll('.sim-tab').forEach((tab) => tab.classList.remove('active'));
  document.querySelector(`.tab-${slot}`)?.classList.add('active');
  document.querySelectorAll('.sim-panel').forEach((panel) => panel.classList.remove('active'));
  byId(`panel-${slot}`)?.classList.add('active');
}

/** Scrolls a question to the middle of the screen and flashes a halo in the subject's colour. */
export function scrollToQuestion(track: Track, slot: SectionSlot, index: number): void {
  const el = byId(`q-${slot}-${index}`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const subject = track.sections.find((section) => section.slot === slot)?.subject ?? slot;
  el.style.boxShadow = `0 0 0 2px ${HIGHLIGHT_COLOR[subject]}`;
  setTimeout(() => {
    el.style.boxShadow = '';
  }, HIGHLIGHT_MS);
}

/* ── Counters ─────────────────────────────────────────────────── */

/** Progress bar, "x / n rezolvate" and the tab badge of one slot. */
export function updateProgress(state: ExamState, slot: SectionSlot): void {
  const total = sheetOf(state, slot).length;
  const answered = answeredCount(state, slot);
  const fill = byId(`progress-fill-${slot}`);
  if (fill) fill.style.width = `${total ? (answered / total) * 100 : 0}%`;
  setText(`progress-count-${slot}`, `${answered} / ${total} rezolvate`);
  setText(`badge-${slot}`, `${answered}/${total}`);
}

/**
 * "answered/total" next to the clock and the dots under it. Each section owns
 * a run of dots, in tab order, and fills them from the left: the dots count
 * the answers of a section, they do not mirror which problems were answered.
 */
export function updateTimerDots(state: ExamState, track: Track): void {
  let offset = 0;
  let answeredTotal = 0;
  for (const section of track.sections) {
    const answered = answeredCount(state, section.slot);
    answeredTotal += answered;
    for (let i = 0; i < section.problems.length; i++) {
      const dot = byId(`tdot-${offset + i}`);
      if (dot) dot.className = `sim-timer-dot${i < answered ? ` filled-${section.slot}` : ''}`;
    }
    offset += section.problems.length;
  }
  setText('timer-answered', `${answeredTotal}/${offset}`);
}

/** Answered problems per section and in total, in the summary above the submit button. */
export function updateSubmitCounts(state: ExamState, track: Track): void {
  let total = 0;
  for (const section of track.sections) {
    const answered = answeredCount(state, section.slot);
    total += answered;
    setText(`submit-count-${section.slot}`, answered);
  }
  setText('submit-count-total', total);
}

/* ── Track selection ──────────────────────────────────────────── */

/**
 * Puts a track into the state and into the page: empty answer sheets, the
 * name and icon of the discipline in the `info` slot (`Informatica` or
 * `Fizica`), the `fizica-mode` recolouring, the totals of the submit summary,
 * and hides the track selector.
 *
 * Returns the track, or `null` if the simulation does not have it (nothing is
 * changed then). It does not start the exam: the caller sets the deadline and
 * calls `startExam`, as legacy `selectTrack` did on its last line. Simulations
 * without a track choice call this once with their only track.
 */
export function selectTrack(config: ExamConfig, state: ExamState, trackId: TrackId): Track | null {
  const track = findTrack(config, trackId);
  if (!track) return null;

  state.trackId = track.id;
  state.answers = {};
  for (const section of track.sections) {
    state.answers[section.slot] = new Array<AnswerKey | null>(section.problems.length).fill(null);
    setText(`submit-total-${section.slot}`, section.problems.length);
  }
  setText('submit-total-total', totalProblems(track));

  // Markup-ul static arată „Informatica”; slotul `info` poate ține și Fizica.
  const discipline = track.sections.find((section) => section.slot === 'info');
  if (discipline) {
    setText('disc-tab-icon', discipline.icon);
    setText('disc-tab-label', discipline.label);
    setText('disc-progress-label', `Progres ${discipline.label}`);
    setText('disc-submit-label', `${discipline.label}:`);
    byId('quiz-area')?.classList.toggle(FIZICA_MODE_CLASS, discipline.subject === 'fizica');
  }

  const selector = byId('track-selector');
  if (selector) selector.style.display = 'none';
  return track;
}

/* ── Inline handlers ──────────────────────────────────────────── */

export interface InlineHandlerHooks {
  /** Called after a track card is clicked and the track is in place; start the exam here. */
  onTrackSelected?: (track: Track) => void;
}

/**
 * Publishes on `window` the functions named by the inline `onclick` attributes
 * of the generated markup (`selectAnswer`, `scrollToQuestion`) and of the page
 * skeleton (`switchTab`, `selectTrack`), with the legacy signatures. Arguments
 * come from markup, so they are checked before use. `submitAll` belongs to
 * the results module.
 */
export function installInlineHandlers(
  config: ExamConfig,
  state: ExamState,
  hooks: InlineHandlerHooks = {},
): void {
  const handlers = {
    selectAnswer(slot: unknown, index: unknown, value: unknown, el: unknown): void {
      const track = findTrack(config, state.trackId);
      if (!track || !isSectionSlot(slot) || typeof index !== 'number') return;
      if (!isAnswerKey(value) || !(el instanceof Element)) return;
      selectAnswer(state, track, slot, index, value, el);
    },
    switchTab(slot: unknown): void {
      if (isSectionSlot(slot)) switchTab(state, slot);
    },
    scrollToQuestion(slot: unknown, index: unknown): void {
      const track = findTrack(config, state.trackId);
      if (track && isSectionSlot(slot) && typeof index === 'number') scrollToQuestion(track, slot, index);
    },
    selectTrack(trackId: unknown): void {
      if (trackId !== 'info' && trackId !== 'fizica') return;
      const track = selectTrack(config, state, trackId);
      if (track) hooks.onTrackSelected?.(track);
    },
  };
  Object.assign(window, handlers);
}
