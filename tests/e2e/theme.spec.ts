import { expect, test } from '@playwright/test';
import { backdropStyles, expectNoHorizontalOverflow } from './helpers/theme';

const portrait = /football-portrait/;
const landscape = /football-landscape/;

test('selects one local fixed background for the initial orientation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const artworkRequests: string[] = [];
  page.on('request', (request) => {
    if (/football-(?:portrait|landscape)/.test(request.url())) artworkRequests.push(request.url());
  });
  await page.goto('./');
  await expect.poll(() => artworkRequests.length).toBe(1);
  const artworkRequest = artworkRequests[0]!;
  expect(artworkRequest).toMatch(portrait);
  expect(artworkRequest).toContain('/SAFTG/_astro/');
  expect(new URL(artworkRequest).origin).toBe('http://127.0.0.1:4321');
  expect(await backdropStyles(page)).toMatchObject({
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    pointerEvents: 'none',
    position: 'fixed',
  });
});

test('switches between dark and light surfaces and persists the choice', async ({ page }) => {
  await page.goto('./');
  const toggle = page.getByRole('button', { name: 'Light mode' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');

  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(
    await page.locator('.hero').evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe('rgb(255, 255, 255)');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('switches portrait, landscape, and square variants without losing content', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  expect((await backdropStyles(page)).backgroundImage).toMatch(portrait);
  await page.setViewportSize({ width: 844, height: 390 });
  expect((await backdropStyles(page)).backgroundImage).toMatch(landscape);
  await page.setViewportSize({ width: 800, height: 800 });
  expect((await backdropStyles(page)).backgroundImage).toMatch(landscape);
  await expect(page.locator('.ranking-card')).toHaveCount(16);
  await expectNoHorizontalOverflow(page);
});

test('exposes semantic movement states with visible non-color cues', async ({ page }) => {
  await page.goto('./');
  const up = page.locator('[data-movement="up"]').first();
  const down = page.locator('[data-movement="down"]').first();
  await expect(up).toContainText(/▲\s*\d+/);
  await expect(down).toContainText(/▼\s*\d+/);
  await expect(up).toHaveCSS('color', 'rgb(111, 247, 242)');
  await expect(down).toHaveCSS('color', 'rgb(255, 112, 174)');
});

test('movement direction survives color-vision-deficiency emulation', async ({ page, context }) => {
  const session = await context.newCDPSession(page);
  await session.send('Emulation.setEmulatedVisionDeficiency', { type: 'achromatopsia' });
  await page.goto('./');
  await expect(page.locator('[data-movement="up"]').first()).toContainText(/▲\s*\d+/);
  await expect(page.locator('[data-movement="down"]').first()).toContainText(/▼\s*\d+/);
  await session.send('Emulation.setEmulatedVisionDeficiency', { type: 'none' });
});

for (const path of ['./', 'weeks/1/', '404.html']) {
  test(`keeps the shared theme and fallback readable at ${path}`, async ({ page }) => {
    await page.route(/football-(?:portrait|landscape).*\.webp/, (route) => route.abort());
    await page.goto(path);
    const styles = await backdropStyles(page);
    expect(styles.backgroundColor).toBe('rgb(6, 59, 70)');
    await expect(page.locator('main')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}
