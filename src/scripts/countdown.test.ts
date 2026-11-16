import { describe, expect, it } from 'vitest';

import { formatCountdown } from './countdown';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('formatCountdown', () => {
  it('pads every unit to two digits', () => {
    expect(formatCountdown(3 * DAY + 7 * HOUR + 5 * MINUTE + 9 * SECOND)).toBe('03z 07h 05m 09s');
  });

  it('drops the milliseconds instead of rounding up', () => {
    expect(formatCountdown(59 * SECOND + 999)).toBe('00z 00h 00m 59s');
  });

  it('shows days beyond 99 in full', () => {
    expect(formatCountdown(120 * DAY)).toBe('120z 00h 00m 00s');
  });

  it('shows zeros at the target', () => {
    expect(formatCountdown(0)).toBe('00z 00h 00m 00s');
  });
});
