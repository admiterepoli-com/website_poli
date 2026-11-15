import { defineConfig } from 'vitest/config';

/**
 * Unit tests for the typed libraries in `src/`. They run in plain Node and must never talk to the
 * production Firebase project: test only pure functions, or mock the SDK.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
