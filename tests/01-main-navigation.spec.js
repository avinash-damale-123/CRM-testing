const { test, expect } = require('@playwright/test');

const modules = [
  { name: 'Home', path: '/home', heading: /Home/i },
  { name: 'Dashboard', path: '/dashboard', heading: /Dashboard/i },
  { name: 'Calendar', path: '/calendar', heading: /Calendar/i },
  { name: 'Reports', path: '/reports', heading: /Reports|Lead Reports/i },
  { name: 'Profile', path: '/profile', heading: /Profile|My Profile/i },
  { name: 'Lead', path: '/leads', heading: /Leads|Lead/i },
  { name: 'Customer', path: '/customers', heading: /Customers|Customer/i },
  { name: 'Bookings', path: '/bookings', heading: /Bookings|Booking/i },
  { name: 'Meetings', path: '/meetings', heading: /Meetings|Meeting/i },
  { name: 'Calls', path: '/calls', heading: /Calls|Calling/i },
  { name: 'Tasks', path: '/tasks', heading: /Tasks|Task/i },
  { name: 'Campaigns', path: '/campaigns', heading: /Campaigns|Campaign/i },
  { name: 'Campaign Enabler', path: '/campaign-enabler', heading: /Campaign Enabler|Campaign/i },
  { name: 'Approvals', path: '/approvals', heading: /Approvals|Approval/i },
  { name: 'Settings', path: '/settings', heading: /Settings/i }
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

  const baseUrl = process.env.CRM_URL.replace('/login', '');

  for (const module of modules) {
    await page.goto(`${baseUrl}${module.path}`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);

    await expect(page.getByRole('heading', { name: module.heading }).first()).toBeVisible({ timeout: 15000 });

    await page.screenshot({
      path: `test-results/main-navigation-${safeFileName(module.name)}.png`,
      fullPage: true
    });
  }
});
