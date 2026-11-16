/**
 * Scoring of an exam sitting: the arithmetic of the legacy `submitAll` of the
 * `simulare-2026-*` pages, without DOM, network or timers.
 *
 * Legacy rules, which `LEGACY_SCORING` and `LEGACY_BADGES` in
 * `src/data/simulations/_schema.ts` express as data:
 * - a problem counts when the chosen letter equals the correct one, compared
 *   case-insensitively (`answer.toLowerCase() === correct.toLowerCase()`);
 *   nothing is subtracted for wrong or blank answers;
 * - a section score is the number of correct answers and the maximum is the
 *   number of problems;
 * - the results bar width is `(score / max) * 100`, division first. That
 *   order is kept on purpose: 1 of 3 gives `33.33333333333333` (not
 *   `33.333333333333336`), which ends up verbatim in the bar `style`;
 * - the badge only depends on how the exam ended (time up or submitted).
 *
 * Simulations 1 to 3 wrote the maxima as literals (`/ 10`, `/ 20`,
 * `(score / 10) * 100`); every section of those pages has ten problems, so the
 * counted maxima used here give the same numbers.
 */

import { getElapsedSeconds, getElapsedTime } from './timer';
import type {
  AnswerDetail,
  AnswerKey,
  AnswerSheet,
  BadgeRule,
  ExamConfig,
  ExamResult,
  ExamState,
  Problem,
  ScoringRules,
  Section,
  SectionResult,
  Track,
} from './types';

/** Legacy comparison: the answer is set and equals the correct letter, ignoring case. */
export function isCorrectAnswer(answer: AnswerKey | null | undefined, correct: AnswerKey): boolean {
  return answer !== null && answer !== undefined && answer.toLowerCase() === correct.toLowerCase();
}

/** Points a problem is worth when answered correctly. */
export function problemPoints(problem: Problem, rules: ScoringRules): number {
  return problem.points ?? rules.pointsPerCorrect;
}

/** Points obtained for one problem. */
export function scoreProblem(
  problem: Problem,
  answer: AnswerKey | null | undefined,
  rules: ScoringRules,
): number {
  if (answer === null || answer === undefined) return rules.pointsPerBlank;
  return isCorrectAnswer(answer, problem.correct) ? problemPoints(problem, rules) : rules.pointsPerWrong;
}

/** `(score / max) * 100`, or 0 for an empty maximum (legacy `discN ? … : 0`). */
export function scorePercent(score: number, maxScore: number): number {
  return maxScore ? (score / maxScore) * 100 : 0;
}

/** Per-problem rows sent with the result: `{ problem, answer, correct }`, numbered from 1. */
export function answerDetails(section: Section, sheet: AnswerSheet): AnswerDetail[] {
  return section.problems.map((problem, i) => ({
    problem: i + 1,
    answer: sheet[i] ?? null,
    correct: problem.correct,
  }));
}

/** Score, maximum, bar percentage and details of one section. */
export function scoreSection(section: Section, sheet: AnswerSheet, rules: ScoringRules): SectionResult {
  let score = 0;
  let maxScore = 0;
  section.problems.forEach((problem, i) => {
    score += scoreProblem(problem, sheet[i], rules);
    maxScore += problemPoints(problem, rules);
  });
  return {
    slot: section.slot,
    subject: section.subject,
    score,
    maxScore,
    percent: scorePercent(score, maxScore),
    details: answerDetails(section, sheet),
  };
}

/**
 * First badge rule for how the exam ended whose threshold the total reaches.
 * Throws if none applies; `validateSimulation` guarantees a rule without a
 * threshold for both endings.
 */
export function pickBadge(badges: readonly BadgeRule[], timeUp: boolean, totalPercent: number): BadgeRule {
  const when: BadgeRule['when'] = timeUp ? 'time-up' : 'submitted';
  const badge = badges.find(
    (rule) =>
      rule.when === when && (rule.minScorePercent === undefined || totalPercent >= rule.minScorePercent),
  );
  if (badge === undefined) throw new Error(`No results badge applies to "${when}"`);
  return badge;
}

/** Scores every section of a track from the answer sheets, in the track's section order. */
export function scoreTrack(
  track: Track,
  answers: ExamState['answers'],
  rules: ScoringRules,
): SectionResult[] {
  return track.sections.map((section) => scoreSection(section, answers[section.slot] ?? [], rules));
}

/**
 * Result of a sitting on a track, as legacy `submitAll` computes it. The
 * elapsed time is read from `state.secondsLeft` as of the last timer tick.
 */
export function buildExamResult(
  config: ExamConfig,
  track: Track,
  state: ExamState,
  timeUp: boolean,
): ExamResult {
  const sections = scoreTrack(track, state.answers, config.scoring);
  const score = sections.reduce((total, section) => total + section.score, 0);
  const maxScore = sections.reduce((total, section) => total + section.maxScore, 0);
  return {
    participantCode: state.participantCode,
    trackId: track.id,
    timeUp,
    elapsedSeconds: getElapsedSeconds(state, config),
    elapsedLabel: getElapsedTime(state, config),
    score,
    maxScore,
    sections,
    badge: pickBadge(config.badges, timeUp, scorePercent(score, maxScore)),
  };
}
