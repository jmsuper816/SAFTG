import { expect, test } from '@playwright/test';

test('navigates edition-isolated historical badge summaries', async ({ page }) => {
  await page.goto('weeks/1/');
  await expect(page).toHaveTitle('Sundays Are For The Girls Weekly Roundup');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Sundays Are For The Girls Weekly Roundup' }),
  ).toBeVisible();
  await expect(page.getByText('Week 1 · Historical')).toBeVisible();
  await expect(page.locator('.hero > p:not(.eyebrow)')).toHaveText('September 8, 2026');
  const weekOneRecap = page.getByRole('region', { name: 'Weekly recap' });
  await expect(weekOneRecap.locator('p')).toHaveCount(4);
  await expect(weekOneRecap).toContainText('Slayday Barbie');
  await expect(page.getByText('Tuesday Power', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Commissioner calls. League chaos.', { exact: true })).toHaveCount(0);
  await expect(page.getByText(/Built for fun/)).toHaveCount(0);
  await expect(page.getByText('Pitts Out For the Boys').first()).toBeVisible();
  const historical = page.getByRole('region', { name: 'Badge Summary' });
  await expect(historical.locator('details')).toHaveCount(6);
  await expect(historical.getByText('Hot Streak', { exact: true })).toHaveCount(0);
  await expect(page.locator('.streak-count')).toHaveCount(0);
  await expect(historical.locator('summary').first()).toContainText('Week 1');
  expect(await page.locator('.ranking-card .badge').count()).toBeGreaterThan(0);

  const rankings = page.getByRole('region', { name: 'Week 1 power rankings' });
  await expect(rankings.locator('> :first-child')).toHaveText('POWER RANKING');
  await expect(rankings.getByRole('heading', { name: 'POWER RANKING', exact: true })).toHaveClass(
    /eyebrow/,
  );
  await expect(rankings.locator('.ranking-card')).toHaveCount(16);
  await expect(rankings.locator('.ranking-card').first()).toContainText('#1');
  await expect(rankings.locator('.ranking-card').first()).toContainText('Pitts Out For the Boys');
  await expect(rankings.locator('.ranking-card [data-movement]').first()).toBeVisible();
  await expect(rankings.getByText(/Ranked \d+(?:st|nd|rd|th) in ESPN/)).toHaveCount(0);

  if (test.info().project.name === 'mobile') {
    const navigation = page.getByRole('navigation', { name: 'Ranking weeks' });
    const previousBox = await navigation.locator('.week-nav-previous').boundingBox();
    const nextBox = await navigation.locator('.week-nav-next').boundingBox();
    const currentBox = await navigation.getByRole('link', { name: 'Current' }).boundingBox();
    const allWeeksBox = await navigation.getByText('All weeks', { exact: true }).boundingBox();
    expect(previousBox?.y).toBeCloseTo(nextBox?.y ?? 0, 0);
    expect(currentBox?.y).toBeGreaterThan((previousBox?.y ?? 0) + (previousBox?.height ?? 0));
    expect(allWeeksBox?.y).toBeGreaterThan((currentBox?.y ?? 0) + (currentBox?.height ?? 0));
    expect(currentBox?.width).toBeCloseTo(allWeeksBox?.width ?? 0, 0);
  }

  await page.getByRole('link', { name: 'Week 2 →' }).click();
  await expect(page).toHaveURL(/\/weeks\/2\/$/);
  await expect(page.getByRole('region', { name: 'Weekly recap' })).toContainText(
    'Shannon’s Serving Punt',
  );
  await expect(page.getByRole('region', { name: 'Weekly recap' })).not.toContainText(
    'Slayday Barbie brought the fireworks',
  );
  await expect(page.getByRole('region', { name: 'Badge Summary' }).locator('details')).toHaveCount(
    6,
  );
  await page.getByRole('link', { name: 'Current', exact: true }).click();
  await expect(page.getByText('Week 2 · Current')).toBeVisible();
});
