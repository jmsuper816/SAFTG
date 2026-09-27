import { expect, test } from '@playwright/test';

test('shows the complete current commissioner ranking without runtime data calls', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('espn.com')) requests.push(request.url());
  });
  await page.goto('./');
  await expect(page.getByRole('heading', { name: /Tuesday League Power Rankings/ })).toBeVisible();
  await expect(page.getByText('Ranked by Commissioner Jess')).toBeVisible();
  await expect(page.locator('.ranking-card')).toHaveCount(2);
  await expect(page.getByText('Moonlight Owls')).toBeVisible();
  expect(requests).toEqual([]);
});
