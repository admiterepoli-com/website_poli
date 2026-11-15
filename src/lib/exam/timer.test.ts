/** Unit tests of the exam timer and state, with Vitest fake timers. */

import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, vi } from 'vitest';

import {
  countAnswered,
  countProblems,
  countTotalAnswered,
  countTotalProblems,
  countTotalUnanswered,
  createExamState,
  finishExam,
  generateParticipantCode,
  getActiveTrack,
  pauseForConfirmation,
  resumeExam,
  selectAnswer,
  startExam,
  switchTab,
} from './state';
import {
  createExamTimer,
  formatClock,
  formatElapsedTime,
  getClockLevel,
  getElapsedSeconds,
  getElapsedTime,
  startTimer,
  syncSecondsLeft,
  tickTimer,
  updateTimerDisplay,
  type ClockElement,
  type ExamTimer,
} from './timer';
import type { ExamConfig, ExamState, Problem, Section, TimerRules } from './types';

/* ── Fixtures ─────────────────────────────────────────────────── */

const DURATION = 3 * 60 * 60;
/** Wall clock at the start of every test. */
const T0 = Date.UTC(2026, 6, 21, 14, 0, 0);

const PROBLEM: Problem = {
  statement: 'Cat face 1 + 1?',
  options: ['a) 1', 'b) 2', 'c) 3', 'd) 4', 'e) 5', 'f) 6'],
  correct: 'b',
};

function section(slot: Section['slot'], subject: Section['subject'], problems: number): Section {
  return { slot, subject, label: subject, icon: '', problems: new Array<Problem>(problems).fill(PROBLEM) };
}

function makeConfig(mode: TimerRules['mode']): ExamConfig {
  return {
    id: 'simulare-2026-07-21',
    access: { kind: 'free' },
    durationSeconds: DURATION,
    trackSelection: true,
    tracks: [
      {
        id: 'info',
        sections: [section('info', 'info', 3), section('mate', 'mate', 2)],
        resultId: 'simulare-2026-07-21-info',
        resultTitle: 'Info',
      },
      {
        id: 'fizica',
        sections: [section('info', 'fizica', 4), section('mate', 'mate', 2)],
        resultId: 'simulare-2026-07-21-fizica',
        resultTitle: 'Fizica',
      },
    ],
    timer: { mode, warningAtSeconds: 30 * 60, dangerAtSeconds: 5 * 60 },
    scoring: { pointsPerCorrect: 1, pointsPerWrong: 0, pointsPerBlank: 0 },
    badges: [
      { when: 'time-up', className: 'badge-timeout', text: 'Timpul a expirat' },
      { when: 'submitted', className: 'badge-done', text: 'Simulare finalizata' },
    ],
    resultsEndpoint: 'https://example.invalid/results',
  };
}

const COUNTDOWN = makeConfig('countdown');
const DEADLINE = makeConfig('deadline');

function running(config: ExamConfig, now = T0): ExamState {
  return startExam(createExamState(config), config, 'info', now);
}

/** A started exam wired to a timer, recording what the timer calls. */
function harness(config: ExamConfig, initial: ExamState = running(config)) {
  let state = initial;
  let slept = 0;
  const events: string[] = [];
  const options = {
    config,
    now: () => Date.now() + slept,
    getState: () => state,
    setState: (next: ExamState) => {
      state = next;
    },
    onDisplay: (shown: ExamState) => {
      events.push(formatClock(shown.secondsLeft));
    },
    onExpire: () => {
      events.push('expire');
    },
  };
  return {
    options,
    events,
    /** The tab is suspended: the wall clock moves on, no interval tick runs. */
    sleep: (milliseconds: number) => {
      slept += milliseconds;
    },
    get state() {
      return state;
    },
    set state(next: ExamState) {
      state = next;
    },
  };
}

/* ── State ────────────────────────────────────────────────────── */

describe('exam state', () => {
  it('builds the participant code from a random number below a million', () => {
    assert.equal(
      generateParticipantCode(() => 0.123456789),
      'ST123456',
    );
    assert.equal(
      generateParticipantCode(() => 0),
      'ST0',
    );
    assert.match(generateParticipantCode(), /^ST\d{1,6}$/);
  });

  it('starts with nothing chosen and the full time on the clock', () => {
    const state = createExamState(DEADLINE, () => 0.5);
    assert.deepEqual(state, {
      phase: 'selecting',
      participantCode: 'ST500000',
      trackId: null,
      activeSlot: 'info',
      answers: {},
      secondsLeft: DURATION,
      endsAt: null,
    });
    assert.equal(getActiveTrack(DEADLINE, state), null);
    assert.equal(countTotalProblems(state), 0);
  });

  it('startExam creates blank sheets for the chosen track', () => {
    const state = startExam(createExamState(COUNTDOWN), COUNTDOWN, 'fizica', T0);
    assert.equal(state.phase, 'running');
    assert.equal(state.trackId, 'fizica');
    assert.deepEqual(state.answers, { info: [null, null, null, null], mate: [null, null] });
    assert.equal(getActiveTrack(COUNTDOWN, state)?.resultId, 'simulare-2026-07-21-fizica');
    assert.equal(countProblems(state, 'info'), 4);
    assert.equal(countTotalProblems(state), 6);
    assert.equal(countTotalUnanswered(state), 6);
  });

  it('startExam fixes the deadline only in deadline mode', () => {
    assert.equal(running(COUNTDOWN).endsAt, null);
    assert.equal(running(DEADLINE).endsAt, T0 + DURATION * 1000);
  });

  it('startExam is a no-op once the exam has started', () => {
    const first = running(DEADLINE);
    assert.equal(startExam(first, DEADLINE, 'fizica', T0 + 60_000), first);
  });

  it('startExam rejects a track the simulation does not have', () => {
    const oneTrack: ExamConfig = { ...COUNTDOWN, tracks: [COUNTDOWN.tracks[0]] };
    assert.throws(() => startExam(createExamState(oneTrack), oneTrack, 'fizica', T0), /no track "fizica"/);
  });

  it('selectAnswer records, replaces and counts answers without mutating', () => {
    const before = running(COUNTDOWN);
    let state = selectAnswer(before, 'info', 1, 'c');
    state = selectAnswer(state, 'mate', 0, 'a');
    state = selectAnswer(state, 'info', 1, 'f');
    assert.deepEqual(state.answers, { info: [null, 'f', null], mate: ['a', null] });
    assert.deepEqual(before.answers, { info: [null, null, null], mate: [null, null] });
    assert.equal(countAnswered(state, 'info'), 1);
    assert.equal(countAnswered(state, 'mate'), 1);
    assert.equal(countTotalAnswered(state), 2);
    assert.equal(countTotalUnanswered(state), 3);
  });

  it('selectAnswer ignores indexes outside the sheet and repeated choices', () => {
    const state = selectAnswer(running(COUNTDOWN), 'info', 0, 'a');
    assert.equal(selectAnswer(state, 'info', 3, 'a'), state);
    assert.equal(selectAnswer(state, 'info', -1, 'a'), state);
    assert.equal(selectAnswer(state, 'info', 0.5, 'a'), state);
    assert.equal(selectAnswer(state, 'info', 0, 'a'), state);
    assert.equal(selectAnswer(createExamState(COUNTDOWN), 'info', 0, 'a').answers.info, undefined);
  });

  it('switchTab changes the active slot', () => {
    const state = running(COUNTDOWN);
    assert.equal(switchTab(state, 'info'), state);
    assert.equal(switchTab(state, 'mate').activeSlot, 'mate');
  });

  it('moves through running, confirming and finished', () => {
    const selecting = createExamState(COUNTDOWN);
    assert.equal(pauseForConfirmation(selecting), selecting);
    assert.equal(finishExam(selecting), selecting);

    const confirming = pauseForConfirmation(running(COUNTDOWN));
    assert.equal(confirming.phase, 'confirming');
    assert.equal(resumeExam(confirming).phase, 'running');

    const finished = finishExam(confirming);
    assert.equal(finished.phase, 'finished');
    assert.equal(resumeExam(finished), finished);
    assert.equal(finishExam(running(COUNTDOWN)).phase, 'finished');
  });
});

/* ── Pure timer logic ─────────────────────────────────────────── */

describe('timer logic', () => {
  it('syncSecondsLeft derives the time left from the deadline', () => {
    const state = running(DEADLINE);
    assert.equal(syncSecondsLeft(state, DEADLINE, T0), state);
    assert.equal(syncSecondsLeft(state, DEADLINE, T0 + 61_000).secondsLeft, DURATION - 61);
    // Rounded to the nearest second, as the legacy Math.round.
    assert.equal(syncSecondsLeft(state, DEADLINE, T0 + 1_499).secondsLeft, DURATION - 1);
    assert.equal(syncSecondsLeft(state, DEADLINE, T0 + 1_500).secondsLeft, DURATION - 1);
    assert.equal(syncSecondsLeft(state, DEADLINE, T0 + 1_501).secondsLeft, DURATION - 2);
    // Never negative.
    assert.equal(syncSecondsLeft(state, DEADLINE, T0 + (DURATION + 500) * 1000).secondsLeft, 0);
  });

  it('syncSecondsLeft gives the full duration while there is no deadline', () => {
    const state = { ...createExamState(DEADLINE), secondsLeft: 5 };
    assert.equal(syncSecondsLeft(state, DEADLINE, T0).secondsLeft, DURATION);
  });

  it('syncSecondsLeft leaves a countdown exam alone', () => {
    const state = { ...running(COUNTDOWN), secondsLeft: 100 };
    assert.equal(syncSecondsLeft(state, COUNTDOWN, T0 + 3_600_000), state);
  });

  it('tickTimer subtracts one second in countdown mode, whatever the wall clock says', () => {
    const state = running(COUNTDOWN);
    assert.equal(tickTimer(state, COUNTDOWN, T0 + 3_600_000).secondsLeft, DURATION - 1);
    assert.equal(tickTimer({ ...state, secondsLeft: 0 }, COUNTDOWN, T0).secondsLeft, 0);
  });

  it('tickTimer follows the wall clock in deadline mode', () => {
    assert.equal(tickTimer(running(DEADLINE), DEADLINE, T0 + 3_600_000).secondsLeft, DURATION - 3600);
  });

  it('formats the elapsed time like legacy', () => {
    assert.equal(formatElapsedTime(0), '0s');
    assert.equal(formatElapsedTime(59), '59s');
    assert.equal(formatElapsedTime(60), '1min 0s');
    assert.equal(formatElapsedTime(3600), '1h 0s');
    assert.equal(formatElapsedTime(4325), '1h 12min 5s');
    assert.equal(formatElapsedTime(DURATION), '3h 0s');
  });

  it('getElapsedTime is the duration minus the time left', () => {
    const state = { ...running(COUNTDOWN), secondsLeft: DURATION - 4325 };
    assert.equal(getElapsedSeconds(state, COUNTDOWN), 4325);
    assert.equal(getElapsedTime(state, COUNTDOWN), '1h 12min 5s');
  });

  it('formats the clock as HH:MM:SS', () => {
    assert.equal(formatClock(DURATION), '03:00:00');
    assert.equal(formatClock(3725), '01:02:05');
    assert.equal(formatClock(59), '00:00:59');
    assert.equal(formatClock(0), '00:00:00');
  });

  it('picks the warning and danger levels at the thresholds', () => {
    const rules = COUNTDOWN.timer;
    assert.equal(getClockLevel(1801, rules), null);
    assert.equal(getClockLevel(1800, rules), 'warning');
    assert.equal(getClockLevel(301, rules), 'warning');
    assert.equal(getClockLevel(300, rules), 'danger');
    assert.equal(getClockLevel(0, rules), 'danger');
  });

  it('updateTimerDisplay writes the text and swaps the classes', () => {
    const classes = new Set<string>(['sim-timer-clock']);
    const element: ClockElement = {
      textContent: '',
      classList: {
        add: (...tokens) => tokens.forEach((token) => classes.add(token)),
        remove: (...tokens) => tokens.forEach((token) => classes.delete(token)),
      },
    };
    updateTimerDisplay(element, 1800, COUNTDOWN.timer);
    assert.equal(element.textContent, '00:30:00');
    assert.deepEqual([...classes], ['sim-timer-clock', 'warning']);
    updateTimerDisplay(element, 300, COUNTDOWN.timer);
    assert.deepEqual([...classes], ['sim-timer-clock', 'danger']);
    updateTimerDisplay(element, DURATION, COUNTDOWN.timer);
    assert.equal(element.textContent, '03:00:00');
    assert.deepEqual([...classes], ['sim-timer-clock']);
  });
});

/* ── Interval, with fake timers ───────────────────────────────── */

describe('exam timer', () => {
  let timer: ExamTimer | null = null;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'], now: T0 });
  });

  afterEach(() => {
    timer?.stop();
    timer = null;
    vi.useRealTimers();
  });

  /** Lets `seconds` pass one tick at a time, as a tab in the foreground does. */
  function advance(seconds: number): void {
    for (let i = 0; i < seconds; i++) vi.advanceTimersByTime(1000);
  }

  for (const config of [COUNTDOWN, DEADLINE]) {
    describe(`${config.timer.mode} mode`, () => {
      it('start shows the clock at once and then ticks every second', () => {
        const exam = harness(config);
        timer = startTimer(exam.options);
        assert.equal(timer.isRunning(), true);
        assert.deepEqual(exam.events, ['03:00:00']);

        vi.advanceTimersByTime(999);
        assert.deepEqual(exam.events, ['03:00:00']);
        vi.advanceTimersByTime(1);
        assert.deepEqual(exam.events, ['03:00:00', '02:59:59']);

        advance(2);
        assert.equal(exam.state.secondsLeft, DURATION - 3);
        assert.equal(getElapsedTime(exam.state, config), '3s');
      });

      it('stop freezes the clock', () => {
        const exam = harness(config);
        timer = startTimer(exam.options);
        advance(5);
        timer.stop();
        assert.equal(timer.isRunning(), false);
        advance(60);
        assert.equal(exam.state.secondsLeft, DURATION - 5);
        assert.equal(exam.events.length, 6);
      });

      it('starting twice keeps a single interval', () => {
        const exam = harness(config);
        timer = startTimer(exam.options);
        timer.start();
        advance(10);
        assert.equal(exam.state.secondsLeft, DURATION - 10);
      });

      it('expires exactly once and stops', () => {
        const exam = harness(config);
        timer = startTimer(exam.options);
        advance(DURATION - 1);
        assert.equal(exam.state.secondsLeft, 1);
        assert.equal(exam.events.includes('expire'), false);

        advance(1);
        assert.equal(exam.state.secondsLeft, 0);
        assert.equal(timer.isRunning(), false);
        assert.equal(getElapsedTime(exam.state, config), '3h 0s');

        advance(30);
        assert.equal(exam.events.filter((event) => event === 'expire').length, 1);
      });
    });
  }

  it('countdown: on the last tick the exam expires before the clock is redrawn', () => {
    const exam = harness(COUNTDOWN, { ...running(COUNTDOWN), secondsLeft: 2 });
    timer = startTimer(exam.options);
    advance(2);
    assert.deepEqual(exam.events, ['00:00:02', '00:00:01', 'expire', '00:00:00']);
  });

  it('deadline: on the last tick the clock is redrawn before the exam expires', () => {
    const exam = harness(DEADLINE, running(DEADLINE, T0 - (DURATION - 2) * 1000));
    timer = startTimer(exam.options);
    advance(2);
    assert.deepEqual(exam.events, ['00:00:02', '00:00:01', '00:00:00', 'expire']);
  });

  it('countdown: seconds the browser did not tick are lost (tab sleep)', () => {
    const exam = harness(COUNTDOWN);
    timer = startTimer(exam.options);
    advance(10);
    exam.sleep(600_000);
    advance(1);
    assert.equal(exam.state.secondsLeft, DURATION - 11);
  });

  it('deadline: the clock is right again on the first tick after tab sleep', () => {
    const exam = harness(DEADLINE);
    timer = startTimer(exam.options);
    advance(10);
    exam.sleep(600_000);
    advance(1);
    assert.equal(exam.state.secondsLeft, DURATION - 611);
    assert.equal(exam.events.at(-1), '02:49:49');
  });

  it('deadline: sleeping past the end expires the exam on the next tick', () => {
    const exam = harness(DEADLINE);
    timer = startTimer(exam.options);
    advance(10);
    exam.sleep((DURATION + 3600) * 1000);
    advance(1);
    assert.equal(exam.state.secondsLeft, 0);
    assert.deepEqual(exam.events.slice(-2), ['00:00:00', 'expire']);
    assert.equal(timer.isRunning(), false);
  });

  it('countdown: the clock is paused while the warning is shown, then resumes', () => {
    const exam = harness(COUNTDOWN);
    timer = startTimer(exam.options);
    advance(100);

    timer.stop();
    exam.state = pauseForConfirmation(exam.state);
    advance(300);
    assert.equal(exam.state.secondsLeft, DURATION - 100);

    exam.state = resumeExam(exam.state);
    timer.start();
    assert.equal(exam.events.at(-1), formatClock(DURATION - 100));
    advance(20);
    assert.equal(exam.state.secondsLeft, DURATION - 120);
  });

  it('deadline: the time spent on the warning counts when the exam resumes', () => {
    const exam = harness(DEADLINE);
    timer = startTimer(exam.options);
    advance(100);

    timer.stop();
    exam.state = pauseForConfirmation(exam.state);
    advance(300);
    assert.equal(exam.state.secondsLeft, DURATION - 100);

    exam.state = resumeExam(exam.state);
    timer.start();
    assert.equal(exam.state.secondsLeft, DURATION - 400);
    assert.equal(exam.events.at(-1), formatClock(DURATION - 400));
    advance(20);
    assert.equal(exam.state.secondsLeft, DURATION - 420);
  });

  it('deadline: resuming after the deadline expires at once, without an interval', () => {
    const exam = harness(DEADLINE);
    timer = createExamTimer(exam.options);
    exam.sleep((DURATION + 1) * 1000);
    timer.start();
    assert.deepEqual(exam.events, ['00:00:00', 'expire']);
    assert.equal(timer.isRunning(), false);
    advance(5);
    assert.deepEqual(exam.events, ['00:00:00', 'expire']);
  });

  it('a reload starts a new exam: nothing carries over from the old state', () => {
    const exam = harness(DEADLINE);
    timer = startTimer(exam.options);
    advance(600);
    exam.state = selectAnswer(exam.state, 'info', 0, 'b');
    timer.stop();

    // What the page does on load: a fresh state, a fresh deadline.
    const reloaded = harness(DEADLINE, running(DEADLINE, Date.now()));
    timer = startTimer(reloaded.options);
    assert.equal(reloaded.state.secondsLeft, DURATION);
    assert.equal(reloaded.state.endsAt, T0 + (600 + DURATION) * 1000);
    assert.equal(countTotalAnswered(reloaded.state), 0);
  });
});
