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
  'Roles & Permissions',
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

async function checkPageHealth(page, label, screenshotPrefix) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1200);
  await expect(page.locator('body')).not.toContainText(/404|500|Application error|Something went wrong|not found/i, { timeout: 5000 });
  await page.screenshot({
    path: `test-results/${screenshotPrefix}-${safeFileName(label)}.png`,
    fullPage: true
  });
}

test.describe('All modules non-destructive CRM audit', () => {
  test('Audit sidebar module pages', async ({ page }) => {
    await login(page);

    for (const moduleName of sidebarModules) {
      const link = page.getByRole('link', { name: moduleName }).first();
      await expect.soft(link, `${moduleName} sidebar link should be visible`).toBeVisible({ timeout: 15000 });
      await link.click();
      await checkPageHealth(page, moduleName, 'audit-sidebar');
    }
  });

  test('Audit Settings tile pages', async ({ page }) => {
    await login(page);

    for (const tile of settingsTiles) {
      await page.getByRole('link', { name: 'Settings' }).click();
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 15000 });

      const tileLocator = page.getByText(tile, { exact: true }).first();
      await expect.soft(tileLocator, `${tile} tile should be visible`).toBeVisible({ timeout: 15000 });
      await tileLocator.click();
      await checkPageHealth(page, tile, 'audit-settings');
    }
  });

  test('Audit key create/action buttons are visible without saving records', async ({ page }) => {
    await login(page);

    const checks = [
      { module: 'Lead', expectedButtons: [/Add Lead/i, /Import/i, /Filters/i] },
      { module: 'Customer', expectedButtons: [/CSV/i, /Excel/i] },
      { module: 'Bookings', expectedButtons: [/CSV/i, /Excel/i] },
      { module: 'Meetings', expectedButtons: [/Log Meeting/i] },
      { module: 'Calls', expectedButtons: [/Log Call/i] },
      { module: 'Tasks', expectedButtons: [/New Task/i, /List/i, /Board/i] },
      { module: 'Campaigns', expectedButtons: [/New Campaign/i, /Campaign Enabler/i] },
      { module: 'Approvals', expectedButtons: [/Pending/i, /Approved/i, /Rejected/i, /Cancelled/i] }
    ];

    for (const item of checks) {
      await page.getByRole('link', { name: item.module }).first().click();
      await checkPageHealth(page, item.module, 'audit-actions');

      for (const buttonName of item.expectedButtons) {
        const buttonOrText = page.getByRole('button', { name: buttonName }).or(page.getByText(buttonName)).first();
        await expect.soft(buttonOrText, `${item.module} should show ${buttonName}`).toBeVisible({ timeout: 8000 });
      }
    }
  });
});
