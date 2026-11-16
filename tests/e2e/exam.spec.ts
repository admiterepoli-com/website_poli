import exam from '../../src/data/simulations/2026-03-21';
import { expect, test } from './fixtures';

/** What the page passed to window.saveSimulationResult (recorded instead of written to Firestore). */
type SavedCall = [string, Record<string, unknown>];

test('a full run of simulation 1: answer, submit, results, saved score', async ({ page, sheets }) => {
  await page.goto('/simulare-2026-03-21');
  await page.waitForFunction(
    () => typeof (window as unknown as { selectAnswer?: unknown }).selectAnswer === 'function',
  );
  await page.evaluate(() => {
    const w = window as unknown as {
      __saved: unknown[];
      saveSimulationResult: (...args: unknown[]) => Promise<void>;
    };
    w.__saved = [];
    w.saveSimulationResult = (...args) => {
      w.__saved.push(args);
      return Promise.resolve();
    };
  });

  // Every Informatică answer right, every Matematică answer wrong: 10 / 20.
  const [info, mate] = exam.tracks[0].sections;
  for (const [slot, section, right] of [
    ['info', info, true],
    ['mate', mate, false],
  ] as const) {
    if (!section) throw new Error(`no ${slot} section`);
    // One subject is visible at a time: switch tabs as a candidate would.
    await page.locator(`.sim-tab.tab-${slot}`).click();
    for (const [i, problem] of section.problems.entries()) {
      const answer = right ? problem.correct : problem.correct === 'a' ? 'b' : 'a';
      await page.locator(`#q-${slot}-${i} .sim-answer input[value="${answer}"]`).locator('..').click();
    }
  }
  await expect(page.locator('#submit-count-total')).toHaveText('20');

  await page.locator('.sim-submit-btn').click();

  const results = page.locator('#results-screen');
  await expect(results).toBeVisible();
  await expect(results).toContainText('10');
  await expect.poll(() => sheets.posts.length).toBe(1);

  const saved = (await page.evaluate(
    () => (window as unknown as { __saved: unknown[] }).__saved,
  )) as SavedCall[];
  expect(saved).toHaveLength(1);
  const [id, data] = saved[0] ?? ['', {}];
  expect(id).toBe('simulare-2026-03-21');
  expect(data).toMatchObject({
    title: 'Simulare 21 Martie 2026',
    scoreTotal: 10,
    scoreInfo: 10,
    scoreMate: 0,
  });
});

test('the gate fallback shows an error when the module bundle is blocked', async ({ page }) => {
  // Block the ES module bundle (auth, gate): only the classic inline fallback script runs.
  await page.route(/\/_astro\/.*\.js$/, (route) => route.abort());
  await page.clock.install();
  await page.goto('/simulare-2026-07-21');
  const gate = page.locator('#exam-gate');
  await expect(gate).toBeHidden();
  await page.clock.runFor(10_500);
  await expect(gate).toBeVisible();
  await expect(gate).toContainText('Nu am putut verifica accesul');
  await expect(page.locator('#exam-content')).toBeHidden();
});
