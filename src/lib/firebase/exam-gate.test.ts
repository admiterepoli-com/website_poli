import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The gate module imports the Firestore handle; the tests never reach Firebase.
vi.mock('./app', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({ doc: vi.fn(), getDoc: vi.fn() }));

const { scheduleGateUnlock, stopGateCountdown } = await import('./exam-gate');

/** The largest delay setTimeout accepts; longer waits are scheduled in tranches. */
const MAX_TIMEOUT_MS = 2147483647;
const NOW = new Date('2026-07-21T16:00:00+03:00').getTime();

describe('scheduleGateUnlock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    stopGateCountdown();
    vi.useRealTimers();
  });

  it('runs at once when the start time has already passed', () => {
    const onExpire = vi.fn();
    scheduleGateUnlock(NOW - 1, onExpire);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('runs once, exactly at the start time', () => {
    const onExpire = vi.fn();
    scheduleGateUnlock(new Date(NOW + 60 * 60 * 1000), onExpire);
    vi.advanceTimersByTime(60 * 60 * 1000 - 1);
    expect(onExpire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onExpire).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(24 * 60 * 60 * 1000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('waits beyond the setTimeout limit (about 24.8 days) in tranches', () => {
    const onExpire = vi.fn();
    const target = NOW + MAX_TIMEOUT_MS + 5000;
    scheduleGateUnlock(target, onExpire);
    vi.advanceTimersByTime(MAX_TIMEOUT_MS);
    expect(onExpire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(5000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('keeps a single timer: scheduling again replaces the previous one', () => {
    const first = vi.fn();
    const second = vi.fn();
    scheduleGateUnlock(NOW + 1000, first);
    scheduleGateUnlock(NOW + 2000, second);
    vi.advanceTimersByTime(5000);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('stopGateCountdown cancels a pending unlock', () => {
    const onExpire = vi.fn();
    scheduleGateUnlock(NOW + 1000, onExpire);
    stopGateCountdown();
    vi.advanceTimersByTime(5000);
    expect(onExpire).not.toHaveBeenCalled();
  });
});
