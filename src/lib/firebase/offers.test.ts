import { describe, expect, it } from 'vitest';

import { BILLING_IDS, STANDARD_PLAN_PRICE, STUDENT_PLUS_OFFERS } from './offers';

describe('STUDENT_PLUS_OFFERS', () => {
  it('has one offer per billing option, in the order of the plan picker toggle', () => {
    expect(Object.keys(STUDENT_PLUS_OFFERS)).toEqual([...BILLING_IDS]);
  });

  it('keeps the monthly subscription without a reference price or discount', () => {
    expect(STUDENT_PLUS_OFFERS.monthly.oldPrice).toBeNull();
    expect(STUDENT_PLUS_OFFERS.monthly.discount).toBeNull();
  });

  it.each(['preadmitere', 'admitere'] as const)(
    'shows a discount on %s that matches its two prices',
    (billing) => {
      const { price, oldPrice, discount } = STUDENT_PLUS_OFFERS[billing];
      expect(oldPrice).not.toBeNull();
      const percent = Math.round((1 - price / (oldPrice ?? price)) * 100);
      expect(discount).toBe(`-${percent}%`);
    },
  );

  it('sells every offer through its own admiterepoli Gumroad product', () => {
    const urls = BILLING_IDS.map((billing) => STUDENT_PLUS_OFFERS[billing].gumroadUrl);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) expect(url).toMatch(/^https:\/\/admiterepoli\.gumroad\.com\/l\/[a-z0-9-]+$/);
  });

  it('keeps Standard free', () => {
    expect(STANDARD_PLAN_PRICE).toBe(0);
  });
});
