/**
 * Student Plus prices and Gumroad products. Kept free of DOM and Firebase imports so that
 * `./modal` (which renders the plan picker), `./plans` (which binds it) and `./exam-gate` can all
 * read it without a circular import, and so the unit tests can load it in plain Node.
 */
import type { BillingId } from '../../types/firestore';

/** The billing options, in the order of the plan picker toggle and of its `data-<billing>` attributes. */
export const BILLING_IDS = ['monthly', 'preadmitere', 'admitere'] as const satisfies readonly BillingId[];

/** What Student Plus costs for one billing option, and where it is bought. */
export interface StudentPlusOffer {
  /** Price in RON, VAT included. */
  price: number;
  /** Struck-through reference price in RON; `null` for the monthly subscription. */
  oldPrice: number | null;
  /** Discount badge next to the old price; `null` for the monthly subscription. */
  discount: string | null;
  /** Text after the price. */
  period: string;
  /** Gumroad product page. */
  gumroadUrl: string;
}

/**
 * Single source for the Student Plus prices and Gumroad products ("plans for year 2026").
 * The plan picker markup in `./modal` is rendered from these values.
 */
export const STUDENT_PLUS_OFFERS = {
  monthly: {
    price: 92,
    oldPrice: null,
    discount: null,
    period: '/lună',
    gumroadUrl: 'https://admiterepoli.gumroad.com/l/student-plus-lunar',
  },
  preadmitere: {
    price: 345,
    oldPrice: 460,
    discount: '-25%',
    period: 'până la Preadmitere',
    gumroadUrl: 'https://admiterepoli.gumroad.com/l/student-plus-preadmitere',
  },
  admitere: {
    price: 480,
    oldPrice: 736,
    discount: '-35%',
    period: 'până la Admitere',
    gumroadUrl: 'https://admiterepoli.gumroad.com/l/student-plus-admitere',
  },
} as const satisfies Record<BillingId, StudentPlusOffer>;

/** The Standard plan is free for every billing option. */
export const STANDARD_PLAN_PRICE = 0;

/**
 * Gumroad checkout link for Student Plus, prefilled with the account email and returning to the
 * profile page. `returnUrl` is passed unencoded.
 */
export function studentPlusCheckoutUrl(billing: BillingId, email: string | null, returnUrl: string): string {
  // `String(null)` keeps the legacy output for an account without an email.
  return `${STUDENT_PLUS_OFFERS[billing].gumroadUrl}?wanted=true&email=${encodeURIComponent(String(email))}&redirect_url=${encodeURIComponent(returnUrl)}`;
}
