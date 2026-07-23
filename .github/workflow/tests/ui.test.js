const { test, expect } = require('@playwright/test');

// UI tests run over plain HTTP directly against the app container.
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

test('user can submit a valid search term and see it on the result page', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.fill('#searchTerm', 'playwright test');
  await page.click('button[type="submit"]');
  await expect(page.locator('body')).toContainText('playwright test');
  await expect(page.getByRole('button', { name: 'Back to Home' })).toBeVisible();
});

test('user can return to the home page from the result page', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.fill('#searchTerm', 'go home');
  await page.click('button[type="submit"]');
  await page.getByRole('button', { name: 'Back to Home' }).click();
  await expect(page.locator('#searchTerm')).toBeVisible();
});

test('XSS payload is blocked client-side and the input is cleared', async ({ page }) => {
  await page.goto(BASE_URL);
  page.once('dialog', (dialog) => dialog.accept());
  await page.fill('#searchTerm', '<script>alert(1)</script>');
  await page.click('button[type="submit"]');
  await expect(page.locator('#searchTerm')).toHaveValue('');
});
