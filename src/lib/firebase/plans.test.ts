import { describe, expect, it } from 'vitest';

// `./plans` re-exports these, but importing it would initialise Firebase; `./offers` is pure.
import { BILLING_IDS, STUDENT_PLUS_OFFERS, studentPlusCheckoutUrl } from './offers';

const RETURN_URL = 'https://admiterepoli.com/profil?upgraded=1';
const ENCODED_RETURN_URL = 'https%3A%2F%2Fadmiterepoli.com%2Fprofil%3Fupgraded%3D1';

describe('studentPlusCheckoutUrl', () => {
  it('builds the legacy Gumroad link for the monthly subscription', () => {
    expect(studentPlusCheckoutUrl('monthly', 'elev@example.com', RETURN_URL)).toBe(
      `https://admiterepoli.gumroad.com/l/student-plus-lunar?wanted=true&email=elev%40example.com&redirect_url=${ENCODED_RETURN_URL}`,
    );
  });

  it.each(BILLING_IDS)('uses the Gumroad product of the %s offer', (billing) => {
    const url = studentPlusCheckoutUrl(billing, 'elev@example.com', RETURN_URL);
    expect(url.startsWith(`${STUDENT_PLUS_OFFERS[billing].gumroadUrl}?wanted=true&`)).toBe(true);
  });

  it('writes "null" for an account without an email, like the legacy code', () => {
    expect(studentPlusCheckoutUrl('admitere', null, RETURN_URL)).toBe(
      `https://admiterepoli.gumroad.com/l/student-plus-admitere?wanted=true&email=null&redirect_url=${ENCODED_RETURN_URL}`,
    );
  });

  it('encodes characters that would break the query string', () => {
    const url = studentPlusCheckoutUrl('preadmitere', 'a+b&c@example.com', 'https://x.ro/p?a=1&b=2');
    expect(url).toBe(
      'https://admiterepoli.gumroad.com/l/student-plus-preadmitere?wanted=true&email=a%2Bb%26c%40example.com&redirect_url=https%3A%2F%2Fx.ro%2Fp%3Fa%3D1%26b%3D2',
    );
  });
});
