import { expect, test } from '@playwright/test';

test('navigates edition-isolated historical badge summaries', async ({ page }) => {
  await page.goto('weeks/1/');
  await expect(page.getByText('Week 1 · Historical')).toBeVisible();
  await expect(page.getByText('Pitts Out For the Boys').first()).toBeVisible();
  const historical = page.getByRole('region', { name: 'Badge Summary' });
  await expect(historical.locator('details')).toHaveCount(7);
  await expect(historical.locator('summary').first()).toContainText('Week 1');
  expect(await page.locator('.ranking-card .badge').count()).toBeGreaterThan(0);

  await page.getByRole('link', { name: 'Week 2 →' }).click();
  await expect(page).toHaveURL(/\/weeks\/2\/$/);
  await expect(page.getByRole('region', { name: 'Badge Summary' }).locator('details')).toHaveCount(
    6,
  );
  await page.getByRole('link', { name: 'Current', exact: true }).click();
  await expect(page.getByText('Week 2 · Current')).toBeVisible();
});
