/**
 * State of one exam sitting: the pure part of the legacy `selectTrack`,
 * `startExam`, `selectAnswer` and `switchTab`, and of the pause that
 * `submitAll` makes while it asks about blank problems.
 *
 * Every function takes a state and returns a new one; nothing here touches the
 * DOM, the clock or timers. The caller keeps the current state, renders from it
 * and passes the time in (`now`, epoch milliseconds).
 *
 * Persistence: the legacy pages have none. None of the four simulations writes
 * to `localStorage` or `sessionStorage`, so a reload starts a new exam with a
 * new participant code (simulation 4 says so in a comment). The state therefore
 * lives in memory only and there are no storage keys to keep.
 */

import type {
  AnswerKey,
  AnswerSheet,
  ExamConfig,
  ExamPhase,
  ExamState,
  SectionSlot,
  Track,
  TrackId,
} from './types';

/** `ST` followed by a random integer below 1,000,000 (legacy `userCode`). */
export function generateParticipantCode(random: () => number = Math.random): string {
  return 'ST' + Math.floor(random() * 1000000);
}

/**
 * State of a freshly loaded page: nothing chosen, full time on the clock, no
 * deadline. Simulations without track selection call `startExam` right away
 * with their only track.
 */
export function createExamState(config: ExamConfig, random: () => number = Math.random): ExamState {
  return {
    phase: 'selecting',
    participantCode: generateParticipantCode(random),
    trackId: null,
    activeSlot: 'info',
    answers: {},
    secondsLeft: config.durationSeconds,
    endsAt: null,
  };
}

/** The track with the given id. Throws when the simulation does not have it. */
export function getTrack(config: ExamConfig, trackId: TrackId): Track {
  const track = config.tracks.find((candidate) => candidate.id === trackId);
  if (track === undefined) throw new Error(`Simulation "${config.id}" has no track "${trackId}"`);
  return track;
}

/** The chosen track, or `null` before the exam starts. */
export function getActiveTrack(config: ExamConfig, state: ExamState): Track | null {
  return state.trackId === null ? null : getTrack(config, state.trackId);
}

/**
 * Starts the exam on a track: one blank answer sheet per section, the phase
 * becomes `running` and, in `deadline` timer mode, the absolute end time is
 * fixed at `now + durationSeconds` (legacy `examEndsAt`, set in `selectTrack`).
 * In `countdown` mode there is no deadline; the timer subtracts seconds.
 *
 * Starting twice is a no-op, so a double click on a track card cannot reset
 * the sheets or move the deadline.
 */
export function startExam(state: ExamState, config: ExamConfig, trackId: TrackId, now: number): ExamState {
  if (state.phase !== 'selecting') return state;
  const track = getTrack(config, trackId);
  const answers: Partial<Record<SectionSlot, AnswerSheet>> = {};
  for (const section of track.sections) {
    answers[section.slot] = new Array<AnswerKey | null>(section.problems.length).fill(null);
  }
  return {
    ...state,
    phase: 'running',
    trackId,
    answers,
    secondsLeft: config.durationSeconds,
    endsAt: config.timer.mode === 'deadline' ? now + config.durationSeconds * 1000 : null,
  };
}

/**
 * Records the option chosen for a problem (legacy `selectAnswer`). Choosing
 * again replaces the answer; an answer cannot be cleared. Out-of-range indexes
 * and slots the track does not have are ignored.
 */
export function selectAnswer(
  state: ExamState,
  slot: SectionSlot,
  index: number,
  value: AnswerKey,
): ExamState {
  const sheet = state.answers[slot];
  if (sheet === undefined || !Number.isInteger(index) || index < 0 || index >= sheet.length) return state;
  if (sheet[index] === value) return state;
  const next = sheet.slice();
  next[index] = value;
  return { ...state, answers: { ...state.answers, [slot]: next } };
}

/** Makes a tab the active one (legacy `switchTab`). Returns the same state when it already is. */
export function switchTab(state: ExamState, slot: SectionSlot): ExamState {
  return slot === state.activeSlot ? state : { ...state, activeSlot: slot };
}

function withPhase(state: ExamState, from: ExamPhase, to: ExamPhase): ExamState {
  return state.phase === from ? { ...state, phase: to } : state;
}

/**
 * Submit was pressed with blank problems: the warning is shown and the caller
 * stops the timer. In `countdown` mode the clock is paused meanwhile; in
 * `deadline` mode the deadline keeps running, as in legacy.
 */
export function pauseForConfirmation(state: ExamState): ExamState {
  return withPhase(state, 'running', 'confirming');
}

/** "Mă întorc la test": back to `running`; the caller starts the timer again. */
export function resumeExam(state: ExamState): ExamState {
  return withPhase(state, 'confirming', 'running');
}

/** The results screen is shown. Only a started exam can finish. */
export function finishExam(state: ExamState): ExamState {
  return state.phase === 'running' || state.phase === 'confirming' ? { ...state, phase: 'finished' } : state;
}

/* ── Counters used by the progress bars, timer dots and submit summary ── */

/** Answer sheet of a slot; empty when the track has no such slot or no track is chosen. */
export function getAnswerSheet(state: ExamState, slot: SectionSlot): AnswerSheet {
  return state.answers[slot] ?? [];
}

/** Problems of a slot that have an answer. */
export function countAnswered(state: ExamState, slot: SectionSlot): number {
  return getAnswerSheet(state, slot).filter((answer) => answer !== null).length;
}

/** Problems of a slot (legacy `discN` / `mateN`). */
export function countProblems(state: ExamState, slot: SectionSlot): number {
  return getAnswerSheet(state, slot).length;
}

function sumOverSlots(state: ExamState, count: (slot: SectionSlot) => number): number {
  let total = 0;
  for (const slot of Object.keys(state.answers) as SectionSlot[]) total += count(slot);
  return total;
}

/** Problems of the whole exam (legacy `totalN`). */
export function countTotalProblems(state: ExamState): number {
  return sumOverSlots(state, (slot) => countProblems(state, slot));
}

/** Answered problems of the whole exam. */
export function countTotalAnswered(state: ExamState): number {
  return sumOverSlots(state, (slot) => countAnswered(state, slot));
}

/** Blank problems of the whole exam (legacy `totalUnanswered`). */
export function countTotalUnanswered(state: ExamState): number {
  return countTotalProblems(state) - countTotalAnswered(state);
}
