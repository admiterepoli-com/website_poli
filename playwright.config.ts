import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end smoke tests (tests/e2e/) against the built site: `npm run build && npm run test:e2e`.
 * They run in CI after the build. Every test goes through tests/e2e/fixtures.ts, which blocks
 * analytics, Firebase and the results sheet, so nothing reaches production services.
 */
const PORT = 4321;

export default defineConfig({
  testDir: 'tests/e2e',
  // Traces and screenshots of failed tests; .astro/ is already ignored by git, ESLint and Prettier.
  outputDir: '.astro/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['list']] : 'list',
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    locale: 'ro-RO',
    timezoneId: 'Europe/Bucharest',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /mobile\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: {
    command: `npx astro preview --host 127.0.0.1 --port ${PORT} --ignore-lock`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
});
