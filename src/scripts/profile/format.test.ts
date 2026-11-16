import { describe, expect, it } from 'vitest';

import { escHtml, getBadge, initialsOf, paidPlanOf } from './format';

describe('escHtml', () => {
  it('escapes the five HTML-special characters', () => {
    expect(escHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;',
    );
  });
  it('turns null and undefined into an empty string and numbers into text', () => {
    expect(escHtml(null)).toBe('');
    expect(escHtml(undefined)).toBe('');
    expect(escHtml(7.5)).toBe('7.5');
  });
});

describe('getBadge', () => {
  it.each([
    [20, 'Excelent'],
    [16, 'Excelent'],
    [15.9, 'Bine'],
    [11, 'Bine'],
    [10, 'Suficient'],
    [6, 'Suficient'],
    [5, 'Insuficient'],
    [0, 'Insuficient'],
  ])('%s points -> %s', (score, text) => {
    expect(getBadge(score).text).toBe(text);
  });
});

describe('initialsOf', () => {
  it('takes the first letter of the first two words, upper-cased', () => {
    expect(initialsOf('ana maria popescu')).toBe('AM');
    expect(initialsOf('  Ion  ')).toBe('I');
  });
});

describe('paidPlanOf', () => {
  it('checks preadmitere before admitere', () => {
    expect(paidPlanOf('student-plus-preadmitere')).toBe('preadmitere');
    expect(paidPlanOf('student-plus-admitere')).toBe('admitere');
  });
  it('recognises the monthly and the old 3-month product, and defaults to monthly', () => {
    expect(paidPlanOf('student-plus-lunar')).toBe('monthly');
    expect(paidPlanOf('student-plus')).toBe('legacy-3m');
    expect(paidPlanOf('')).toBe('monthly');
  });
});
