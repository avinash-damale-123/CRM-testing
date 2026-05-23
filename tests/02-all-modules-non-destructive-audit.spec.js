const { test, expect } = require('@playwright/test');

const sidebarModules = [
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

async function login(page) {
  await page.goto(process.env.CRM_URL);
  await page.getByLabel(/email/i).fill(process.env.CRM_EMAIL);
  await page.getByLabel(/password/i).fill(process.env.CRM_PASSWORD);
  await page.getByRole('button', { name: /login|sign in/i }).click();
  await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible({ timeout: 20000 });
}

async function capturePage(page, label, prefix) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: `test-results/${prefix}-${safeFileName(label)}.png`,
    fullPage: true
  });
}

test.describe('All modules non-destructive CRM audit', () => {
  test('Capture all sidebar module pages', async ({ page }) => {
    await login(page);

    for (const moduleName of sidebarModules) {
      const link = page.getByRole('link', { name: moduleName }).first();
      await expect(link).toBeVisible({ timeout: 15000 });
      await link.click();
      await capturePage(page, moduleName, 'audit-sidebar');
    }
  });

  test('Capture all Settings tile pages', async ({ page }) => {
    await login(page);

    for (const tile of settingsTiles) {
      await page.getByRole('link', { name: 'Settings' }).click();
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 15000 });

      const tileLocator = page.getByText(tile, { exact: true }).first();
      await expect(tileLocator).toBeVisible({ timeout: 15000 });
      await tileLocator.click();
      await capturePage(page, tile, 'audit-settings');
    }
  });

  test('Capture key action areas without saving records', async ({ page }) => {
    await login(page);

    const modulesToCapture = [
      'Lead',
      'Customer',
      'Bookings',
      'Meetings',
      'Calls',
      'Tasks',
      'Campaigns',
      'Approvals'
    ];

    for (const moduleName of modulesToCapture) {
      const link = page.getByRole('link', { name: moduleName }).first();
      await expect(link).toBeVisible({ timeout: 15000 });
      await link.click();
      await capturePage(page, moduleName, 'audit-actions');
    }
  });
});
