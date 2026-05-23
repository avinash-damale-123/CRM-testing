const { test, expect } = require('@playwright/test');

test('Login and verify Settings page opens', async ({ page }) => {
  await page.goto(process.env.CRM_URL);

  await page.getByLabel(/email/i).fill(process.env.CRM_EMAIL);
  await page.getByLabel(/password/i).fill(process.env.CRM_PASSWORD);
  await page.getByRole('button', { name: /login|sign in/i }).click();

  await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible({ timeout: 20000 });

  await page.goto(process.env.CRM_URL.replace('/login', '/settings'));

  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 15000 });

  await page.screenshot({
    path: 'test-results/settings-page.png',
    fullPage: true
  });
});
