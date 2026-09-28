import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { expectNoHorizontalOverflow } from './helpers/theme';

for (const path of ['./', 'weeks/1/', '404.html']) {
  test(`has no detectable accessibility violations at ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('header.site-header')).toHaveCount(0);
    await expect(page.locator('body > footer')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Skip to rankings' })).toHaveAttribute(
      'href',
      '#main',
    );
    await expect(page.locator('main#main')).toHaveCount(1);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    const groups = page.locator('.badge-summary-group');
    if ((await groups.count()) > 0) {
      await groups.first().locator('summary').click();
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      const summaries = page.locator('.badge-summary-group summary');
      await summaries.first().focus();
      for (let index = 1; index < (await summaries.count()); index += 1) {
        await page.keyboard.press('Tab');
        await expect(summaries.nth(index)).toBeFocused();
      }
      await page.evaluate(() => {
        const recipient = document.querySelector<HTMLElement>('.badge-summary-recipients');
        const description = document.querySelector<HTMLElement>('.badge-summary-description');
        const reason = document.querySelector<HTMLElement>('.badge-summary-details li span');
        if (recipient) recipient.textContent = 'Maximum Length Team Name '.repeat(3).slice(0, 60);
        if (description) description.textContent = 'D'.repeat(300);
        if (reason) reason.textContent = 'R'.repeat(300);
      });
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        )
        .toBe(true);
    }
  });
}

test('reflows at 320 CSS pixels with expanded long content', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('./');
  const groups = page.locator('.badge-summary-group');
  for (let index = 0; index < (await groups.count()); index += 1) {
    await groups.nth(index).locator('summary').click();
  }
  await page.evaluate(() => {
    const team = document.querySelector<HTMLElement>('.team-heading h2');
    const reason = document.querySelector<HTMLElement>('.badge-summary-details li span');
    const recap = document.querySelector<HTMLElement>('.weekly-recap p');
    if (team) team.textContent = 'Maximum Length Team Name '.repeat(4);
    if (reason) reason.textContent = 'Long award reason '.repeat(30);
    if (recap) recap.textContent = 'Long weekly recap sentence '.repeat(40);
  });
  await expectNoHorizontalOverflow(page);
  await expect(page.locator('.recap-divider')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Weekly recap' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'POWER RANKING', exact: true })).toBeVisible();
  await expect(page.locator('.ranking-card').first()).toBeVisible();
  await expect(page.locator('.ranking-card').last()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to top' })).toBeVisible();
  for (const control of await page
    .locator('.week-nav > a, .week-nav summary, .back-to-top')
    .all()) {
    const box = await control.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test('preserves content and focus visibility at 200 percent text size', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('./');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole('region', { name: 'Weekly recap' })).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Sundays Are For The Girls Weekly Roundup' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'POWER RANKING', exact: true })).toBeVisible();
  await expect(page.locator('.ranking-card').last()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to top' })).toBeVisible();
  const focusable = page.locator(
    'a:visible, button:visible, summary:visible, [tabindex]:not([tabindex="-1"]):visible',
  );
  for (let index = 0; index < (await focusable.count()); index += 1) {
    await focusable.nth(index).focus();
    await expect(focusable.nth(index)).toBeFocused();
    const indicator = await focusable.nth(index).evaluate((element) => {
      const styles = getComputedStyle(element);
      return { outlineStyle: styles.outlineStyle, outlineWidth: styles.outlineWidth };
    });
    expect(indicator.outlineStyle).not.toBe('none');
    expect(Number.parseFloat(indicator.outlineWidth)).toBeGreaterThanOrEqual(3);
  }
});

for (const path of ['./', 'weeks/1/']) {
  test(`returns to and focuses the roundup heading at ${path}`, async ({ page }) => {
    await page.goto(path);
    const heading = page.getByRole('heading', {
      level: 1,
      name: 'Sundays Are For The Girls Weekly Roundup',
    });
    const backToTop = page.getByRole('link', { name: 'Back to top' });

    await backToTop.scrollIntoViewIfNeeded();
    await backToTop.click();
    await expect(page).toHaveURL(/#roundup-title$/);
    await expect(heading).toBeFocused();
    await expect
      .poll(() => heading.evaluate((element) => element.getBoundingClientRect().top))
      .toBeGreaterThanOrEqual(0);
    await expect
      .poll(() => heading.evaluate((element) => element.getBoundingClientRect().top))
      .toBeLessThan(180);
    const focusIndicator = await heading.evaluate((element) => {
      const styles = getComputedStyle(element);
      return { outlineStyle: styles.outlineStyle, outlineWidth: styles.outlineWidth };
    });
    expect(focusIndicator.outlineStyle).not.toBe('none');
    expect(Number.parseFloat(focusIndicator.outlineWidth)).toBeGreaterThanOrEqual(3);

    await page.keyboard.press('Tab');
    await expect(backToTop).not.toBeFocused();

    await backToTop.focus();
    await page.keyboard.press('Enter');
    await expect(heading).toBeFocused();
  });
}

test('back-to-top remains native when JavaScript is disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const path of ['./', 'weeks/1/']) {
    await page.goto(path);
    const heading = page.getByRole('heading', {
      level: 1,
      name: 'Sundays Are For The Girls Weekly Roundup',
    });
    await page.getByRole('link', { name: 'Back to top' }).click();
    await expect(page).toHaveURL(/#roundup-title$/);
    await expect(heading).toBeFocused();
  }
  await context.close();
});

test('removes decorative transitions when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const duration = await page
    .locator('.ranking-card')
    .first()
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
  expect(duration).toBeLessThanOrEqual(0.00001);
});

test('fallback remains axe clean when artwork cannot load', async ({ page }) => {
  await page.route(/football-(?:portrait|landscape).*\.webp/, (route) => route.abort());
  await page.goto('./');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await expectNoHorizontalOverflow(page);
});
