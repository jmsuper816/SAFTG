import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['./', 'weeks/1/', '404.html']) {
  test(`has no detectable accessibility violations at ${path}`, async ({ page }) => {
    await page.goto(path);
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
