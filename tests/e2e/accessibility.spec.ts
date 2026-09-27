import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['./', 'weeks/1/', '404.html']) {
  test(`has no detectable accessibility violations at ${path}`, async ({ page }) => {
    await page.goto(path);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}
