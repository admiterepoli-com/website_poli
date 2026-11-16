import { expect, test } from './fixtures';

test.describe('cookie banner', () => {
  for (const choice of ['accept', 'reject'] as const) {
    test(`${choice} hides the banner and is remembered`, async ({ page }) => {
      await page.goto('/');
      const banner = page.locator('#cookie-banner');
      await expect(banner).toBeVisible();
      await page.locator(`#cookie-${choice}`).click();
      await expect(banner).toHaveCount(0);
      expect(await page.evaluate(() => localStorage.getItem('cookie_consent'))).toBe(
        choice === 'accept' ? 'accepted' : 'rejected',
      );
      const gaDisabled = await page.evaluate(
        () => (window as unknown as Record<string, unknown>)['ga-disable-G-PC1VMXYCRN'],
      );
      expect(gaDisabled).toBe(choice !== 'accept');

      await page.reload();
      await expect(page.locator('#cookie-banner')).toHaveCount(0);
    });
  }
});

test('the auth modal opens on Sign Up and switches panels', async ({ page }) => {
  await page.goto('/informatii');
  await page.locator('#header-signup-btn').click();
  const overlay = page.locator('#auth-modal-overlay');
  await expect(overlay).toHaveClass(/open/);
  await expect(page.locator('#auth-panel-register')).toHaveClass(/active/);

  await page.locator('.auth-toggle-btn[data-tab="login"]').click();
  await expect(page.locator('#auth-panel-login')).toHaveClass(/active/);
  await expect(page.locator('#auth-panel-register')).not.toHaveClass(/active/);

  await page.locator('#auth-close-btn').click();
  await expect(overlay).not.toHaveClass(/open/);
});

test('a barem page renders its PDF', async ({ page }) => {
  await page.goto('/admitere-2025-matematica-barem');
  await expect(page.locator('#pdfViewer canvas').first()).toBeVisible({ timeout: 30_000 });
});

test('simulari: an archive dropdown opens and closes', async ({ page }) => {
  await page.goto('/simulari');
  const header = page.locator('.subiecte-box[data-set="arhiva-sim-1"]');
  const section = page.locator('#dropdown-arhiva-sim-1');
  const height = async (): Promise<number> => (await section.boundingBox())?.height ?? 0;
  const closed = await height();
  await header.click();
  await expect.poll(height).toBeGreaterThan(closed + 50);
  await expect(section.locator('a[href="./barem-simulare-admiterepoli-1"]')).toBeVisible();
  await header.click();
  await expect.poll(height).toBeLessThanOrEqual(closed + 1);
});
