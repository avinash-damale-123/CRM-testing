const { test, expect } = require('@playwright/test');

test('Login and verify Settings tiles open', async ({ page }) => {
  await page.goto(process.env.CRM_URL);

  await page.getByLabel(/email/i).fill(process.env.CRM_EMAIL);
  await page.getByLabel(/password/i).fill(process.env.CRM_PASSWORD);
  await page.getByRole('button', { name: /login|sign in/i }).click();

  await expect(page.getByText(/Welcome back|Dashboard|Home/i)).toBeVisible({ timeout: 20000 });

  await page.goto(process.env.CRM_URL.replace('/login', '/settings'));
  await expect(page.getByText('Settings')).toBeVisible({ timeout: 15000 });

  const tiles = [
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

  for (const tile of tiles) {
    await page.goto(process.env.CRM_URL.replace('/login', '/settings'));
    await expect(page.getByText(tile)).toBeVisible({ timeout: 15000 });

    await page.getByText(tile).click();
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `test-results/settings-${tile.replace(/[^a-zA-Z0-9]/g, '-')}.png`,
      fullPage: true
    });
  }
});
