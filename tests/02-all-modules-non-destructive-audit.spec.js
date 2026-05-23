const { test, expect } = require('@playwright/test');

const modules = [
  { name: 'Home', path: '/home', mustHave: ['Welcome back'] },
  { name: 'Dashboard', path: '/dashboard', mustHave: ['Dashboard', 'Leads', 'Conversion'] },
  { name: 'Calendar', path: '/calendar', mustHave: ['Calendar'] },
  { name: 'Reports', path: '/reports', mustHave: ['Reports'] },
  { name: 'Profile', path: '/profile', mustHave: ['My Profile'] },
  { name: 'Leads', path: '/leads', mustHave: ['Leads', 'Add Lead'] },
  { name: 'Customers', path: '/customers', mustHave: ['Customers'] },
  { name: 'Bookings', path: '/bookings', mustHave: ['Bookings'] },
  { name: 'Meetings', path: '/meetings', mustHave: ['Meetings', 'Log Meeting'] },
  { name: 'Calls', path: '/calls', mustHave: ['Calls', 'Log Call'] },
  { name: 'Tasks', path: '/tasks', mustHave: ['Tasks', 'New Task'] },
  { name: 'Campaigns', path: '/campaigns', mustHave: ['Campaigns', 'New Campaign'] },
  { name: 'Campaign Enabler', path: '/campaigns/enabler', mustHave: ['Campaign Enabler'] },
  { name: 'Approvals', path: '/approvals', mustHave: ['Approvals'] },
  { name: 'Settings', path: '/settings', mustHave: ['Settings', 'User Management'] }
];

test('Requirement-style smoke audit for main CRM modules', async ({ page }) => {
  await page.goto(process.env.CRM_URL);
  await page.getByLabel(/email/i).fill(process.env.CRM_EMAIL);
  await page.getByLabel(/password/i).fill(process.env.CRM_PASSWORD);
  await page.getByRole('button', { name: /login|sign in/i }).click();
  await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible({ timeout: 20000 });

  const baseUrl = process.env.CRM_URL.replace('/login', '');
  const failures = [];

  for (const item of modules) {
    await page.goto(`${baseUrl}${item.path}`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);

    const bodyText = await page.locator('body').innerText({ timeout: 10000 });
    const moduleFailures = [];

    if (/404|500|Application error|Something went wrong/i.test(bodyText)) {
      moduleFailures.push('Page shows application/not-found error.');
    }

    for (const expectedText of item.mustHave) {
      if (!bodyText.toLowerCase().includes(expectedText.toLowerCase())) {
        moduleFailures.push(`Missing expected text: ${expectedText}`);
      }
    }

    console.log(`MODULE_AUDIT | ${item.name} | ${moduleFailures.length === 0 ? 'PASS' : 'FAIL'} | ${page.url()} | ${moduleFailures.join(' ; ')}`);

    if (moduleFailures.length > 0) {
      failures.push(`${item.name}: ${moduleFailures.join(' ; ')}`);
      await page.screenshot({ path: `test-results/failure-${item.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`, fullPage: true });
    }
  }

  expect(failures, failures.join(' | ')).toEqual([]);
});
