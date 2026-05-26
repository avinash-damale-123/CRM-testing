const { test, expect } = require('@playwright/test');

async function login(page) {
  await page.goto(process.env.CRM_URL);
  await page.getByLabel(/email/i).fill(process.env.CRM_EMAIL);
  await page.getByLabel(/password/i).fill(process.env.CRM_PASSWORD);
  await page.getByRole('button', { name: /login|sign in/i }).click();
  await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible({ timeout: 20000 });
}

async function goToSettings(page) {
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('body')).toContainText(/Settings/i, { timeout: 15000 });
}

async function clickIfVisible(page, text) {
  const item = page.getByText(text, { exact: true }).first();
  if (await item.count()) {
    try {
      await item.click({ timeout: 5000 });
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);
      return true;
    } catch (error) {
      console.log(`Could not click ${text}: ${error.message}`);
      return false;
    }
  }
  return false;
}

test('Country module live portal status audit', async ({ page }) => {
  await login(page);
  await goToSettings(page);

  const notes = [];

  const mastersClicked = await clickIfVisible(page, 'Masters');
  if (!mastersClicked) {
    notes.push('Masters tile not found on Settings page.');
  }

  let countryOpened = false;
  const countryTexts = ['Country', 'Countries', 'Country Master'];
  for (const label of countryTexts) {
    if (await clickIfVisible(page, label)) {
      countryOpened = true;
      break;
    }
  }

  const bodyText = await page.locator('body').innerText({ timeout: 10000 });

  if (!countryOpened && !/Country|Countries/i.test(bodyText)) {
    notes.push('Country module or Country option not found after opening Masters.');
  }

  const expectedTexts = [
    { label: 'Country title or table context', pattern: /Country|Countries/i },
    { label: 'Search control', pattern: /Search/i },
    { label: 'Create/Add control', pattern: /Create Country|Add Country|New Country|Create|Add/i },
    { label: 'Export control', pattern: /Export|CSV|Excel/i },
    { label: 'Filter or status control', pattern: /Filter|Status|Active|Inactive/i }
  ];

  for (const item of expectedTexts) {
    if (!item.pattern.test(bodyText)) {
      notes.push(`${item.label} is missing.`);
    }
  }

  await page.screenshot({
    path: 'test-results/country-module-status.png',
    fullPage: true
  });

  console.log('COUNTRY_MODULE_STATUS_AUDIT');
  for (const note of notes) {
    console.log(`COUNTRY_ISSUE: ${note}`);
  }

  expect(notes, notes.join(' | ')).toEqual([]);
});
