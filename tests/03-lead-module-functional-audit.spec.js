const { test, expect } = require('@playwright/test');

async function login(page) {
  await page.goto(process.env.CRM_URL);
  await page.getByLabel(/email/i).fill(process.env.CRM_EMAIL);
  await page.getByLabel(/password/i).fill(process.env.CRM_PASSWORD);
  await page.getByRole('button', { name: /login|sign in/i }).click();
  await expect(page.getByRole('link', { name: 'Lead' })).toBeVisible({ timeout: 20000 });
}

async function openLeads(page) {
  await page.getByRole('link', { name: 'Lead' }).click();
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('body')).toContainText(/Lead|Leads/i, { timeout: 15000 });
}

test.describe('Lead module requirement audit', () => {
  test('Lead list page has required controls', async ({ page }) => {
    await login(page);
    await openLeads(page);
    const body = page.locator('body');
    await expect(body).toContainText(/Lead|Leads/i);
    await expect(body).toContainText(/Add Lead/i);
    await expect(body).toContainText(/Import/i);
    await expect(body).toContainText(/CSV|Excel|Export/i);
    await expect(body).toContainText(/Filter|Filters/i);
    await expect(body).toContainText(/Search/i);
  });

  test('Add Lead form opens and shows mandatory field labels', async ({ page }) => {
    await login(page);
    await openLeads(page);
    await page.getByRole('button', { name: /Add Lead/i }).click();
    await page.waitForTimeout(1000);
    const body = page.locator('body');
    await expect(body).toContainText(/First Name|Name/i);
    await expect(body).toContainText(/Contact|Mobile|Phone/i);
    await expect(body).toContainText(/Lead Source|Source/i);
    await expect(body).toContainText(/Priority/i);
    await expect(body).toContainText(/Status|Stage/i);
    await expect(body).toContainText(/Assigned|Assign/i);
  });

  test('Empty Add Lead save shows validation', async ({ page }) => {
    await login(page);
    await openLeads(page);
    await page.getByRole('button', { name: /Add Lead/i }).click();
    await page.waitForTimeout(1000);
    const saveButton = page.getByRole('button', { name: /Save|Create|Submit/i }).first();
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await saveButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText(/required|mandatory|Please enter|Please select|validation|field/i);
  });

  test('Lead Summary tab or button is available', async ({ page }) => {
    await login(page);
    await openLeads(page);
    await expect(page.locator('body')).toContainText(/Summary|Lead Summary/i);
  });
});
