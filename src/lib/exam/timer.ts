/**
 * Exam timer: legacy `syncSecondsLeft`, `startTimer`, `updateTimerDisplay`
 * and `getElapsedTime`.
 *
 * The legacy pages track the remaining time in two ways and both are kept,
 * selected by `ExamConfig.timer.mode`:
 *
 * - `countdown` (simulations 1 to 3): one second is subtracted on every
 *   interval tick. Ticks the browser skips while the tab is suspended are
 *   lost, and the clock is paused while the blank-problems warning is shown.
 * - `deadline` (simulation 4): the remaining time is derived from the absolute
 *   end time `ExamState.endsAt` on every tick, so it stays right after tab
 *   sleep, keeps running behind the warning, and the exam ends at once when
 *   the timer is started after the deadline has passed.
 *
 * Neither mode survives a reload: legacy stores nothing, a reload is a new exam.
 *
 * The first half of the file is pure (state in, state out). `createExamTimer`
 * owns the interval; `updateTimerDisplay` is the only function that writes to
 * the page, through a structural type so it does not need a real DOM.
 */

import type { ExamConfig, ExamState, TimerRules } from './types';

/* ── Pure logic ───────────────────────────────────────────────── */

/**
 * `deadline` mode: recomputes `secondsLeft` from `endsAt` and the wall clock,
 * rounded to the nearest second and never negative; the full duration while
 * there is no deadline yet. `countdown` mode has no wall-clock reference, so
 * the state is returned as it is.
 */
export function syncSecondsLeft(state: ExamState, config: ExamConfig, now: number): ExamState {
  if (config.timer.mode !== 'deadline') return state;
  const secondsLeft =
    state.endsAt === null ? config.durationSeconds : Math.max(0, Math.round((state.endsAt - now) / 1000));
  return secondsLeft === state.secondsLeft ? state : { ...state, secondsLeft };
}

/**
 * One interval tick: `countdown` subtracts a second (not below zero),
 * `deadline` syncs with the wall clock.
 */
export function tickTimer(state: ExamState, config: ExamConfig, now: number): ExamState {
  if (config.timer.mode === 'deadline') return syncSecondsLeft(state, config, now);
  return { ...state, secondsLeft: Math.max(0, state.secondsLeft - 1) };
}

/** `true` when no time is left. */
export function isTimeUp(state: ExamState): boolean {
  return state.secondsLeft <= 0;
}

/**
 * Seconds used so far, as saved with the result (`timeElapsed`). Like legacy,
 * it is read from `secondsLeft` as of the last tick, not from the wall clock.
 */
export function getElapsedSeconds(state: ExamState, config: ExamConfig): number {
  return config.durationSeconds - state.secondsLeft;
}

/** `3725` becomes `1h 2min 5s`; zero hours and zero minutes are left out, seconds never. */
export function formatElapsedTime(elapsedSeconds: number): string {
  const h = Math.floor(elapsedSeconds / 3600);
  const m = Math.floor((elapsedSeconds % 3600) / 60);
  const s = elapsedSeconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(h + 'h');
  if (m > 0) parts.push(m + 'min');
  parts.push(s + 's');
  return parts.join(' ');
}

/** Time used so far as shown on the results screen and sent with the result (`timp_folosit`). */
export function getElapsedTime(state: ExamState, config: ExamConfig): string {
  return formatElapsedTime(getElapsedSeconds(state, config));
}

/** Text of the clock: `HH:MM:SS`. */
export function formatClock(secondsLeft: number): string {
  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

export type ClockLevel = 'warning' | 'danger';

/** Class the clock carries for the time left, `null` for none. `danger` wins over `warning`. */
export function getClockLevel(secondsLeft: number, rules: TimerRules): ClockLevel | null {
  if (secondsLeft <= rules.dangerAtSeconds) return 'danger';
  if (secondsLeft <= rules.warningAtSeconds) return 'warning';
  return null;
}

/* ── Display ──────────────────────────────────────────────────── */

/** The part of an `HTMLElement` the clock needs (`#timer-clock`). */
export interface ClockElement {
  textContent: string | null;
  classList: { add(...tokens: string[]): void; remove(...tokens: string[]): void };
}

/** Writes the remaining time and the `warning` / `danger` class to the clock element. */
export function updateTimerDisplay(element: ClockElement, secondsLeft: number, rules: TimerRules): void {
  element.textContent = formatClock(secondsLeft);
  element.classList.remove('warning', 'danger');
  const level = getClockLevel(secondsLeft, rules);
  if (level !== null) element.classList.add(level);
}

/* ── Interval ─────────────────────────────────────────────────── */

export interface ExamTimerOptions {
  config: ExamConfig;
  /** Reads the current state. */
  getState: () => ExamState;
  /** Stores the state after a tick. */
  setState: (state: ExamState) => void;
  /** Called on start and on every tick with the fresh state; the place for `updateTimerDisplay`. */
  onDisplay: (state: ExamState) => void;
  /** Called once when the time runs out (legacy `submitAll(true)`); the interval is already stopped. */
  onExpire: () => void;
  /** Wall clock in epoch milliseconds. Defaults to `Date.now`. */
  now?: () => number;
}

export interface ExamTimer {
  /** Legacy `startTimer`: starts or resumes the clock. */
  start: () => void;
  /** Legacy `clearInterval(timerInterval)`: stops ticking; `start` resumes. */
  stop: () => void;
  isRunning: () => boolean;
}

/**
 * The one-second interval of the exam.
 *
 * Order of the callbacks follows legacy: in `countdown` mode a tick that
 * reaches zero calls `onExpire` and then `onDisplay`; in `deadline` mode
 * `onDisplay` comes first, and `start` itself expires the exam, without
 * creating an interval, when the deadline has already passed.
 *
 * `start` always replaces a running interval. Simulations 1 to 3 did not clear
 * it, so a double click on "Mă întorc la test" left two intervals running and
 * the clock at double speed; simulation 4 fixed that and its behaviour is used
 * for both modes.
 */
export function createExamTimer(options: ExamTimerOptions): ExamTimer {
  const { config, getState, setState, onDisplay, onExpire } = options;
  const now = options.now ?? (() => Date.now());
  let interval: ReturnType<typeof setInterval> | null = null;

  function stop(): void {
    if (interval !== null) clearInterval(interval);
    interval = null;
  }

  function tick(): void {
    const state = tickTimer(getState(), config, now());
    setState(state);
    if (config.timer.mode === 'deadline') {
      onDisplay(state);
      if (isTimeUp(state)) {
        stop();
        onExpire();
      }
    } else {
      if (isTimeUp(state)) {
        stop();
        onExpire();
      }
      onDisplay(getState());
    }
  }

  function start(): void {
    stop();
    if (config.timer.mode === 'deadline') {
      const state = syncSecondsLeft(getState(), config, now());
      setState(state);
      onDisplay(state);
      // Started again after the deadline passed, e.g. back from the warning.
      if (isTimeUp(state)) {
        onExpire();
        return;
      }
    } else {
      onDisplay(getState());
    }
    interval = setInterval(tick, 1000);
  }

  return { start, stop, isRunning: () => interval !== null };
}

/** Creates the timer and starts it. Keep the returned timer to stop and resume it. */
export function startTimer(options: ExamTimerOptions): ExamTimer {
  const timer = createExamTimer(options);
  timer.start();
  return timer;
}
