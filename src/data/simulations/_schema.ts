/**
 * Schema of a simulation data file.
 *
 * Each simulation is one file in this folder, named after its page slug
 * (`simulare-2026-07-21.ts`), whose default export is `defineSimulation({...})`.
 * There is no registry: pages import their own file. The leading underscore
 * marks this file as not being a simulation.
 *
 *     import { defineSimulation, LEGACY_RULES, MATE, INFO } from './_schema';
 *
 *     const mate = { ...MATE, problems: [...] };
 *     export default defineSimulation({
 *       id: 'simulare-2026-03-21',
 *       access: { kind: 'free' },
 *       trackSelection: false,
 *       tracks: [{ id: 'info', sections: [{ ...INFO, problems: [...] }, mate], resultId: ..., resultTitle: ... }],
 *       ...LEGACY_RULES,
 *       timer: LEGACY_COUNTDOWN_TIMER,
 *       resultsEndpoint: '...',
 *     });
 *
 * Problem texts are copied verbatim from the legacy page: `text` becomes
 * `statement`, `answers` becomes `options`, and the unused `img: ""` of
 * simulations 1 and 2 is dropped.
 */

import { ANSWER_KEYS } from '../../lib/exam/types';
import type { BadgeRule, ExamConfig, Problem, ScoringRules, Section, TimerRules } from '../../lib/exam/types';

export type {
  AnswerKey,
  BadgeRule,
  ExamAccess,
  ExamConfig,
  Problem,
  ProblemOptions,
  ScoringRules,
  Section,
  SectionSlot,
  SimulationSlug,
  SubjectId,
  TimerRules,
  Track,
  TrackId,
} from '../../lib/exam/types';

/** What a simulation data file exports. */
export type SimulationData = ExamConfig;

/* ── Values shared by the four legacy simulations ─────────────── */

/** Three hours. */
export const LEGACY_DURATION_SECONDS = 3 * 60 * 60;

/** One point per correct answer, nothing subtracted. */
export const LEGACY_SCORING = {
  pointsPerCorrect: 1,
  pointsPerWrong: 0,
  pointsPerBlank: 0,
} as const satisfies ScoringRules;

/** The results badge depends only on how the exam ended. */
export const LEGACY_BADGES = [
  { when: 'time-up', className: 'badge-timeout', text: 'Timpul a expirat' },
  { when: 'submitted', className: 'badge-done', text: 'Simulare finalizata' },
] as const satisfies readonly [BadgeRule, ...BadgeRule[]];

/** Timer of simulations 1 to 3: decremented every second. */
export const LEGACY_COUNTDOWN_TIMER = {
  mode: 'countdown',
  warningAtSeconds: 30 * 60,
  dangerAtSeconds: 5 * 60,
} as const satisfies TimerRules;

/** Timer of simulation 4: derived from an absolute deadline. */
export const LEGACY_DEADLINE_TIMER = {
  ...LEGACY_COUNTDOWN_TIMER,
  mode: 'deadline',
} as const satisfies TimerRules;

/** Duration, scoring and badges common to all four simulations. Spread into the config. */
export const LEGACY_RULES = {
  durationSeconds: LEGACY_DURATION_SECONDS,
  scoring: LEGACY_SCORING,
  badges: LEGACY_BADGES,
} as const satisfies Pick<ExamConfig, 'durationSeconds' | 'scoring' | 'badges'>;

/** Section headers as the legacy pages show them. Add `problems`. */
export const INFO = {
  slot: 'info',
  subject: 'info',
  label: 'Informatica',
  icon: '{ }',
} as const satisfies Omit<Section, 'problems'>;

/** Physics takes the `info` slot of the Mate + Fizică track. */
export const FIZICA = {
  slot: 'info',
  subject: 'fizica',
  label: 'Fizica',
  icon: 'Φ',
} as const satisfies Omit<Section, 'problems'>;

export const MATE = {
  slot: 'mate',
  subject: 'mate',
  label: 'Matematica',
  icon: '∑',
} as const satisfies Omit<Section, 'problems'>;

/* ── Validation ───────────────────────────────────────────────── */

const SLUG_PATTERN = /^simulare-\d{4}-\d{2}-\d{2}$/;

function problemErrors(problem: Problem, where: string): string[] {
  const errors: string[] = [];
  if (problem.statement.trim() === '') errors.push(`${where}: empty statement`);
  // Typed data always has six options; this guards data that was cast or generated.
  const options: readonly string[] = problem.options;
  if (options.length !== ANSWER_KEYS.length) {
    errors.push(`${where}: expected ${ANSWER_KEYS.length} options, found ${options.length}`);
  }
  options.forEach((option, index) => {
    const key = ANSWER_KEYS[index];
    // The engine uses the first character of the option as the answer value.
    if (key !== undefined && option.charAt(0) !== key) {
      errors.push(`${where}: option ${index + 1} must start with "${key}", found "${option.slice(0, 8)}"`);
    }
  });
  const keys: readonly string[] = ANSWER_KEYS;
  if (!keys.includes(problem.correct))
    errors.push(`${where}: correct answer "${problem.correct}" is not a to f`);
  if (problem.points !== undefined && !(Number.isFinite(problem.points) && problem.points > 0)) {
    errors.push(`${where}: points must be a positive number`);
  }
  return errors;
}

/** Returns every rule the configuration breaks; an empty list means it is valid. */
export function validateSimulation(config: ExamConfig): string[] {
  const errors: string[] = [];

  if (!SLUG_PATTERN.test(config.id)) errors.push(`id "${config.id}" is not a simulation page slug`);
  if (!(config.durationSeconds > 0)) errors.push('durationSeconds must be positive');
  if (config.startsAt !== undefined && Number.isNaN(Date.parse(config.startsAt))) {
    errors.push(`startsAt "${config.startsAt}" is not a date`);
  }
  if (config.access.kind === 'free' && config.startsAt !== undefined) {
    errors.push('startsAt has no effect on a free simulation: it has no gate');
  }

  const { warningAtSeconds, dangerAtSeconds } = config.timer;
  if (!(
    dangerAtSeconds >= 0 &&
    dangerAtSeconds <= warningAtSeconds &&
    warningAtSeconds <= config.durationSeconds
  )) {
    errors.push('timer thresholds must satisfy 0 <= danger <= warning <= duration');
  }

  const { pointsPerCorrect, pointsPerWrong, pointsPerBlank } = config.scoring;
  if (!(pointsPerCorrect > 0)) errors.push('scoring.pointsPerCorrect must be positive');
  if (!(pointsPerWrong <= 0)) errors.push('scoring.pointsPerWrong must be zero or negative');
  if (!(pointsPerBlank <= 0)) errors.push('scoring.pointsPerBlank must be zero or negative');

  for (const when of ['time-up', 'submitted'] as const) {
    // A rule without a threshold guarantees that some badge always applies.
    if (!config.badges.some((badge) => badge.when === when && badge.minScorePercent === undefined)) {
      errors.push(`badges: no rule without a threshold for "${when}"`);
    }
  }

  if (!config.trackSelection && config.tracks.length !== 1) {
    errors.push('a simulation without track selection must have exactly one track');
  }
  const trackIds = new Set<string>();
  const resultIds = new Set<string>();
  for (const track of config.tracks) {
    if (trackIds.has(track.id)) errors.push(`duplicate track "${track.id}"`);
    trackIds.add(track.id);
    if (resultIds.has(track.resultId)) errors.push(`duplicate resultId "${track.resultId}"`);
    resultIds.add(track.resultId);
    if (!track.resultId.startsWith(config.id)) {
      errors.push(`track "${track.id}": resultId "${track.resultId}" must start with "${config.id}"`);
    }

    const slots = new Set<string>();
    for (const section of track.sections) {
      if (slots.has(section.slot)) errors.push(`track "${track.id}": duplicate slot "${section.slot}"`);
      slots.add(section.slot);
      if (section.problems.length === 0) errors.push(`track "${track.id}", ${section.subject}: no problems`);
      section.problems.forEach((problem, index) => {
        errors.push(
          ...problemErrors(problem, `track "${track.id}", ${section.subject} problem ${index + 1}`),
        );
      });
    }
  }

  return errors;
}

/**
 * Wraps the default export of a simulation data file: checks the shape at
 * compile time and the rules above when the module is loaded, so a broken data
 * file fails the build instead of the exam.
 */
export function defineSimulation(config: ExamConfig): SimulationData {
  const errors = validateSimulation(config);
  if (errors.length > 0) {
    throw new Error(`Invalid simulation "${config.id}":\n- ${errors.join('\n- ')}`);
  }
  return config;
}
