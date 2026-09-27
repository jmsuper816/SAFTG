import { expect, test } from '@playwright/test';

test('navigates stable historical ranking pages', async ({ page }) => {
  await page.goto('weeks/1/');
  await expect(page.getByText('Week 1 · Historical')).toBeVisible();
  await expect(page.getByText('Gridiron Owls')).toBeVisible();
  await page.getByRole('link', { name: 'Week 2 →' }).click();
  await expect(page).toHaveURL(/\/weeks\/2\/$/);
  await page.getByRole('link', { name: 'Current', exact: true }).click();
  await expect(page.getByText('Week 3 · Current')).toBeVisible();
});
