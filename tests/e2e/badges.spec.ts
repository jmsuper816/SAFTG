import { expect, test } from '@playwright/test';

test('explains earned badges to keyboard and assistive technology', async ({ page }) => {
  await page.goto('./');
  const badge = page.getByLabel(/Scoreboard Scorcher, earned week 3/);
  await expect(badge).toBeVisible();
  await badge.focus();
  await expect(badge).toBeFocused();
  await expect(badge.getByText('Highest score of the week.')).toBeVisible();
});
