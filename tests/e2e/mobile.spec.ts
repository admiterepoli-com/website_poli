import { expect, test } from './fixtures';

test.describe('mobile navigation', () => {
  test('the hamburger opens the menu and a link navigates', async ({ page }) => {
    await page.goto('/informatii');
    const hamburger = page.locator('.hamburger');
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    await expect(hamburger).toHaveClass(/active/);

    const link = page.locator('.nav-elements a[href="./subiecte"]');
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/subiecte$/);
    await expect(page.locator('h1')).toHaveText('Subiecte, Bareme și Rezolvări');
  });
});
