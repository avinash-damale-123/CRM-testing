const { test, expect } = require('@playwright/test');

const modules = [
  'Home',
  'Dashboard',
  'Calendar',
  'Reports',
  'Profile',
  'Lead',
  'Customer',
  'Bookings',
  'Meetings',
  'Calls',
  'Tasks',
  'Campaigns',
  'Campaign Enabler',
  'Approvals',
  'Settings'
];

function safeFileName(value) {
  return value.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

test('Login and verify main sidebar module pages open', async ({ page }) => {
  await page.goto(process.env.CRM_URL);

  await page.getByLabel(/email/i).fill(process.env.CRM_EMAIL);
  await page.getByLabel(/password/i).fill(process.env.CRM_PASSWORD);
  await page.getByRole('button', { name: /login|sign in/i }).click();

  await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible({ timeout: 20000 });

  for (const moduleName of modules) {
    const link = page.getByRole('link', { name: moduleName }).first();
    await expect(link).toBeVisible({ timeout: 15000 });
    await link.click();

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    await expect(page.locator('body')).not.toContainText(/404|500|Application error|not found/i, { timeout: 5000 });

    await page.screenshot({
      path: `test-results/main-navigation-${safeFileName(moduleName)}.png`,
      fullPage: true
    });
  }
});
