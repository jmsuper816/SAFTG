import { expect, test } from '@playwright/test';

test('shows the complete current commissioner ranking without runtime data calls', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('espn.com')) requests.push(request.url());
  });
  await page.goto('./');
  await expect(page).toHaveTitle('Sundays Are For The Girls Weekly Roundup');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Sundays Are For The Girls Weekly Roundup' }),
  ).toBeVisible();
  await expect(page.getByText('Week 2 · Current')).toBeVisible();
  await expect(page.locator('.hero > p:not(.eyebrow)')).toHaveText('September 15, 2026');
  await expect(page.locator('.hero > p:not(.eyebrow) time')).toHaveAttribute(
    'datetime',
    '2026-09-15T16:00:00.000Z',
  );
  const recap = page.getByRole('region', { name: 'Weekly recap' });
  await expect(page.locator('.hero time')).toBeVisible();
  await expect(page.locator('.hero .recap-divider')).toBeVisible();
  await expect(recap.locator('p')).toHaveCount(5);
  await expect(recap).toContainText('Shannon’s Serving Punt');
  await expect(page.locator('.hero .weekly-recap')).toBeVisible();
  await expect(page.locator('.hero + .week-nav')).toBeVisible();
  await expect(page.getByText('implementation-draft-week-02')).toHaveCount(0);
  await expect(page.getByText('Tuesday Power', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Commissioner calls. League chaos.', { exact: true })).toHaveCount(0);
  await expect(page.getByText(/Built for fun/)).toHaveCount(0);

  const rankings = page.getByRole('region', { name: 'Current power rankings' });
  const rankingHeading = rankings.getByRole('heading', { name: 'POWER RANKING', exact: true });
  await expect(rankingHeading).toHaveClass(/eyebrow/);
  await expect(rankings.locator('> :first-child')).toHaveText('POWER RANKING');
  await expect(rankings.locator('.ranking-card')).toHaveCount(16);
  await expect(rankings.locator('.ranking-card').first()).toContainText('#1');
  await expect(rankings.locator('.ranking-card').first()).toContainText('Shannon’s Serving Punt');
  await expect(rankings.locator('.ranking-card').first()).toContainText(/Week 2: .* pts/);
  await expect(rankings.locator('.ranking-card [data-movement]').first()).toBeVisible();
  await expect(rankings.locator('.ranking-card .badge').first()).toBeVisible();
  const streaks = rankings.locator('.streak-count');
  expect(await streaks.count()).toBeGreaterThan(0);
  await expect(streaks.first()).toHaveAttribute('aria-label', /\d+-game winning streak/);
  await expect(rankings.getByText(/Ranked \d+(?:st|nd|rd|th) in ESPN/)).toHaveCount(0);
  await expect(page.getByText('Shannon’s Serving Punt').first()).toBeVisible();
  expect(requests).toEqual([]);
});
