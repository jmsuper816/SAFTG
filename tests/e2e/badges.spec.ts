import { expect, test } from '@playwright/test';

test('summarizes current awards and reveals reasons with native disclosure', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('espn.com')) requests.push(request.url());
  });
  await page.goto('./');
  const section = page.getByRole('region', { name: 'Badge Summary' });
  await expect(section).toBeVisible();
  await expect(section).toHaveCSS('background-color', 'rgb(5, 45, 55)');
  await expect(section.locator('details')).toHaveCount(6);
  await expect(section.locator('summary').first()).toContainText('Winner of the Week');
  await expect(section.locator('summary').first()).toContainText('Week 2');
  await expect(section.locator('summary').first()).toContainText('The Waffles Special');
  await expect(section.locator('.badge-summary-description').first()).toBeHidden();

  const first = section.locator('details').first();
  const second = section.locator('details').nth(1);
  await first.locator('summary').focus();
  await expect(first.locator('summary')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('open', '');
  await expect(first.getByText('Highest score of the week.')).toBeVisible();
  await expect(first.getByText(/Led the league with/)).toBeVisible();
  await second.locator('summary').click();
  await expect(first).toHaveAttribute('open', '');
  await expect(second).toHaveAttribute('open', '');
  await first.locator('summary').press('Space');
  await expect(first).not.toHaveAttribute('open', '');

  await expect(page.getByLabel(/Winner of the Week, earned week 2/)).toBeVisible();
  expect(requests).toEqual([]);
});

test('native badge disclosures work with JavaScript disabled', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  const details = page.getByRole('region', { name: 'Badge Summary' }).locator('details').first();
  await details.locator('summary').click();
  await expect(details).toHaveAttribute('open', '');
  await expect(details.locator('.badge-summary-description')).toBeVisible();
  await context.close();
});
