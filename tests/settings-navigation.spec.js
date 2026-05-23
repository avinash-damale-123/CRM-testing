const { test, expect } = require('@playwright/test');

const settingsTiles = [
  'Masters',
  'Lead Sources',
  'Routing Rules',
  'Website / Webhook Capture',
  'Email (SMTP)',
  'Email Templates',
  'WhatsApp Business',
  'Meta Lead Ads',
  'Regions',
  'Departments',
  'Roles',
  'Permission Sets',
  'Branch Management',
  'User Management',
  'Field-Level Security',
  'Sharing Rules',
  'Access Delegation',
  'Approval Rules',
  'SLA / Escalation',
  'Voice AI Calling',
  'Audit Logs',
  'Active Sessions',
  'Activity Intelligence',
  'Integrations'
];

function safeFileName(value) {
  return value.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

test('Login and capture Settings tile pages', async ({ page }) => {
  await page.goto(process.env.CRM_URL);

  await page.getByLabel(/email/i).fill(process.env.CRM_EMAIL);
  await page.getByLabel(/password/i).fill(process.env.CRM_PASSWORD);
  await page.getByRole('button', { name: /login|sign in/i }).click();

  await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible({ timeout: 20000 });

  await page.goto(process.env.CRM_URL.replace('/login', '/settings'));
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 15000 });

  await page.screenshot({
    path: 'test-results/00-settings-main-page.png',
    fullPage: true
  });

  for (const tile of settingsTiles) {
    await page.goto(process.env.CRM_URL.replace('/login', '/settings'));
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 15000 });

    const tileLocator = page.getByText(tile, { exact: true }).first();
    await expect(tileLocator).toBeVisible({ timeout: 15000 });
    await tileLocator.click();

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: `test-results/settings-tile-${safeFileName(tile)}.png`,
      fullPage: true
    });
  }
});
