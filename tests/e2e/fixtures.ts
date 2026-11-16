import { test as base, expect } from '@playwright/test';

/** Hosts that must never be reached from a test: analytics, Firebase (Auth + Firestore), forms. */
const BLOCKED = [
  /googletagmanager\.com/,
  /google-analytics\.com/,
  /identitytoolkit\.googleapis\.com/,
  /securetoken\.googleapis\.com/,
  /firestore\.googleapis\.com/,
  /api\.web3forms\.com/,
];

/** Bodies POSTed to the Google Sheets results endpoint (intercepted, never sent). */
export interface SheetsLog {
  posts: string[];
}

export const test = base.extend<{ sheets: SheetsLog }>({
  sheets: async ({ page }, use) => {
    const log: SheetsLog = { posts: [] };
    await page.route('https://script.google.com/**', async (route) => {
      log.posts.push(route.request().postData() ?? '');
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await use(log);
  },
  page: async ({ page }, use) => {
    await page.route(
      (url) => BLOCKED.some((pattern) => pattern.test(url.hostname)),
      (route) => route.abort(),
    );
    await use(page);
  },
});

export { expect };
