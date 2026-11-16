import { describe, expect, it, vi } from 'vitest';

// The lock module imports the Firestore handle; the tests never reach Firebase.
vi.mock('./app', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({ doc: vi.fn(), getDoc: vi.fn() }));

const { PAID_SIMULATIONS, formatUnlockLabel } = await import('./simulari-lock');

describe('formatUnlockLabel', () => {
  it('matches the label the config used to spell out by hand', () => {
    expect(formatUnlockLabel(new Date('2026-07-21T17:00:00+03:00'))).toBe('21 iulie, ora 17:00');
  });

  it('uses Bucharest time in winter too, whatever the runner time zone', () => {
    expect(formatUnlockLabel(new Date('2026-12-05T08:05:00Z'))).toBe('5 decembrie, ora 10:05');
  });
});

describe('PAID_SIMULATIONS', () => {
  it('has no unopened simulation: every one is already published', () => {
    expect(PAID_SIMULATIONS.filter((sim) => sim.unlocksAtTimestamp)).toEqual([]);
  });
});
