/**
 * Settings for `npm run visual`.
 *
 * BASE_COMMIT is the commit where the old site was moved into legacy/ without
 * any other change. The reference screenshots are always rendered from that
 * commit, so they stay reproducible after pages are deleted from legacy/.
 */
export const BASE_COMMIT = '5e38b37';

export const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

/** Share of differing pixels above which a page fails (0.001 = 0.1%). */
export const MAX_DIFF_RATIO = 0.001;

/** Per-pixel colour tolerance passed to pixelmatch (0 = exact, 1 = anything). */
export const PIXEL_THRESHOLD = 0.1;

/** The clock every page sees, so countdowns and date-based gates are stable. */
export const FIXED_TIME = '2026-11-01T12:00:00+02:00';

/** How much fake time to run after load, letting entry animations and popups settle. */
export const SETTLE_MS = 8000;

/** Requests to these hosts are blocked: they are irrelevant to rendering and make runs flaky. */
export const BLOCKED_HOSTS = [
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'region1.google-analytics.com',
];
