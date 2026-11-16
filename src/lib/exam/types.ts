/**
 * Types of the exam engine (the timed simulations: `simulare-2026-*`).
 *
 * They describe what the four legacy simulation pages do, so that one engine
 * can run all of them from data. Nothing here renders or computes anything;
 * the data files live in `src/data/simulations/` (see `_schema.ts` there).
 *
 * Legacy vocabulary, kept on purpose because it is baked into DOM ids, CSS
 * class names and the saved results:
 * - a *slot* is one of the two tabs of the quiz (`info`, `mate`);
 * - a *subject* is what is shown in a slot (`info`, `fizica` or `mate`);
 * - a *track* is the exam variant a candidate sits (Mate + Info, Mate + Fizică).
 */

import type { PaidSimulationId } from '../../types/firestore';

/* ── Problems ─────────────────────────────────────────────────── */

/** Answer letters. Every legacy problem has exactly six options, a to f. */
export const ANSWER_KEYS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export type AnswerKey = (typeof ANSWER_KEYS)[number];

/**
 * The six options of a problem, in order a to f. Each string is the legacy
 * text verbatim, letter prefix included (`"a) 8"`; one problem of simulation 1
 * uses `"a. …"`), and may contain HTML and KaTeX delimiters.
 *
 * The engine takes the answer value from the first character of the option,
 * so option `i` must start with `ANSWER_KEYS[i]`.
 */
export type ProblemOptions = readonly [string, string, string, string, string, string];

/** One multiple-choice problem. */
export interface Problem {
  /**
   * Statement, inserted as HTML inside `<h3>`. May contain markup
   * (`<pre><code>`, `<img>`, inline `<svg>` figures) and KaTeX delimiters
   * (`\( … \)`, `\[ … \]`), which are rendered in the browser after insertion.
   */
  statement: string;
  options: ProblemOptions;
  correct: AnswerKey;
  /**
   * Points for a correct answer. Omit to use `ScoringRules.pointsPerCorrect`;
   * no legacy simulation sets it (every problem is worth one point).
   */
  points?: number;
}

/* ── Sections and tracks ──────────────────────────────────────── */

/** What a section examines. */
export type SubjectId = 'info' | 'fizica' | 'mate';

/**
 * Tab of the quiz a section is rendered in. It is the suffix of the legacy DOM
 * ids (`panel-info`, `questions-mate`, `q-info-3`, …) and of the CSS classes
 * (`tab-info`, `fill-mate`, …). The physics section of the Mate + Fizică track
 * uses the `info` slot; the page is recoloured by `#quiz-area.fizica-mode`.
 */
export type SectionSlot = 'info' | 'mate';

/** One tab of the quiz: a subject and its problems. */
export interface Section {
  slot: SectionSlot;
  subject: SubjectId;
  /**
   * Name shown in the tab, in "Progres <label>", in "<label>:" of the submit
   * summary and on the results card. Legacy spelling, without diacritics:
   * `Informatica`, `Fizica`, `Matematica`.
   */
  label: string;
  /** Text of the tab and results-card icon: `{ }`, `Φ` or `∑`. */
  icon: string;
  problems: readonly Problem[];
}

/** Exam variant. Simulations 1 and 2 have a single track (`info`). */
export type TrackId = 'info' | 'fizica';

export interface Track {
  id: TrackId;
  /** Sections in tab order, which is also the order of the timer dots. Slots must be unique. */
  sections: readonly [Section, ...Section[]];
  /**
   * Id of the `users/{uid}/simulationResults/{id}` document: the page slug for
   * simulations 1 and 2, `<slug>-<track>` for simulations 3 and 4.
   */
  resultId: string;
  /** Title saved with the result and listed on the profile page. */
  resultTitle: string;
}

/* ── Exam configuration ───────────────────────────────────────── */

/** Page slug of a simulation, which is also the name of its data file. */
export type SimulationSlug = `simulare-${number}-${number}-${number}`;

/** Who may open the simulation. */
export type ExamAccess =
  /** No gate: the page has no `#exam-gate` (simulations 1 and 2). */
  | { kind: 'free' }
  /** Behind the exam gate: Student Plus or a separate purchase (simulations 3 and 4). */
  | {
      kind: 'paid';
      /** `window.simulationId`: the Gumroad permalink stored in `purchasedSimulations`. */
      simulationId: PaidSimulationId;
      /** `window.simulationLabel`, e.g. `Simularea #4`. Simulation 3 does not set it. */
      label?: string;
      /** `window.simulationBuyUrl`. Absent when the simulation is not sold separately. */
      buyUrl?: string;
    };

export interface TimerRules {
  /**
   * How the remaining time is tracked.
   * - `countdown`: one second is subtracted on every tick (simulations 1 to 3).
   * - `deadline`: derived from an absolute end time kept in memory, so it stays
   *   right when the browser suspends the tab (simulation 4).
   */
  mode: 'countdown' | 'deadline';
  /** The clock gets the `warning` class at or below this many seconds left. */
  warningAtSeconds: number;
  /** The clock gets the `danger` class at or below this many seconds left. */
  dangerAtSeconds: number;
}

export interface ScoringRules {
  /** Points for a correct answer, unless the problem sets its own `points`. */
  pointsPerCorrect: number;
  /** Points for a wrong answer (zero or negative). */
  pointsPerWrong: number;
  /** Points for a problem left blank (zero or negative). */
  pointsPerBlank: number;
}

/**
 * Badge shown at the top of the results screen. Rules are tried in order and
 * the first match wins.
 */
export interface BadgeRule {
  /** `time-up`: the timer ran out. `submitted`: the candidate finished by hand. */
  when: 'time-up' | 'submitted';
  /**
   * Lowest total score, as a percentage of the maximum (0 to 100), for which
   * the rule applies. Omit for no threshold; no legacy simulation uses one.
   */
  minScorePercent?: number;
  /** Class added next to `sim-results-badge`: `badge-timeout`, `badge-done`. */
  className: string;
  text: string;
}

export interface ExamConfig {
  id: SimulationSlug;
  /**
   * Moment the gate opens, as an ISO 8601 string with offset
   * (`window.examGateStart`). Every paid simulation sets it: the gate has no
   * built-in default (#137). Simulations 1 and 2 are not gated.
   */
  startsAt?: string;
  /** `window.examGateStartLabel`, e.g. `21 Iulie 2026, ora 17:00`. */
  startsAtLabel?: string;
  access: ExamAccess;
  durationSeconds: number;
  /**
   * `false`: the only track starts when the page loads (simulations 1 and 2).
   * `true`: the candidate picks a track first and the choice is reported with
   * the result (simulations 3 and 4).
   */
  trackSelection: boolean;
  tracks: readonly [Track, ...Track[]];
  timer: TimerRules;
  scoring: ScoringRules;
  badges: readonly [BadgeRule, ...BadgeRule[]];
  /** Google Apps Script endpoint that receives the `SheetsPayload` on submit. */
  resultsEndpoint: string;
}

/* ── Runtime state and results ────────────────────────────────── */

/** Chosen option per problem, `null` while unanswered. */
export type AnswerSheet = (AnswerKey | null)[];

/**
 * - `selecting`: the track selector is shown.
 * - `running`: the timer runs.
 * - `confirming`: submit was pressed with blank problems; the warning is shown and the timer is stopped.
 * - `finished`: the results screen is shown.
 */
export type ExamPhase = 'selecting' | 'running' | 'confirming' | 'finished';

/** State of one sitting. Kept in memory only: a reload starts a new exam. */
export interface ExamState {
  phase: ExamPhase;
  /** `ST` followed by a random number below 1,000,000; shown on the results screen. */
  participantCode: string;
  /** `null` until a track is chosen. */
  trackId: TrackId | null;
  activeSlot: SectionSlot;
  /** One sheet per slot of the chosen track. */
  answers: Partial<Record<SectionSlot, AnswerSheet>>;
  secondsLeft: number;
  /** Absolute deadline in epoch milliseconds (`deadline` timer mode), otherwise `null`. */
  endsAt: number | null;
}

/** One row of the per-problem details sent with the result. Field names are the legacy ones. */
export interface AnswerDetail {
  /** Problem number, starting at 1. */
  problem: number;
  answer: AnswerKey | null;
  correct: AnswerKey;
}

export interface SectionResult {
  slot: SectionSlot;
  subject: SubjectId;
  /** Points obtained. */
  score: number;
  /** Points available. */
  maxScore: number;
  /** `score / maxScore` as a percentage (0 when the section is empty); width of the results bar. */
  percent: number;
  details: readonly AnswerDetail[];
}

export interface ExamResult {
  participantCode: string;
  trackId: TrackId;
  /** `true` when the timer ran out, `false` when the candidate submitted. */
  timeUp: boolean;
  elapsedSeconds: number;
  /** Elapsed time as shown and reported, e.g. `1h 12min 5s`. */
  elapsedLabel: string;
  score: number;
  maxScore: number;
  /** In the track's section order. */
  sections: readonly SectionResult[];
  badge: BadgeRule;
}

/**
 * Body posted to `ExamConfig.resultsEndpoint`. Field names are the legacy
 * Romanian ones because the spreadsheets are keyed by them. Simulations 1 and 2
 * send `scor_info` / `detalii_info` and no `track`; simulations 3 and 4 send
 * `track` and name the two fields after it.
 */
export type SheetsPayload = {
  id_participant: string;
  track?: TrackId;
  timp_folosit: string;
  scor_total: number;
  scor_mate: number;
  detalii_mate: readonly AnswerDetail[];
} & Partial<Record<`scor_${TrackId}`, number>> &
  Partial<Record<`detalii_${TrackId}`, readonly AnswerDetail[]>>;
