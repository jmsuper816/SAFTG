import { expect, type Page } from '@playwright/test';

export async function backdropStyles(page: Page) {
  return page.evaluate(() => {
    const styles = getComputedStyle(document.body, '::before');
    return {
      backgroundColor: styles.backgroundColor,
      backgroundImage: styles.backgroundImage,
      backgroundPosition: styles.backgroundPosition,
      backgroundRepeat: styles.backgroundRepeat,
      backgroundSize: styles.backgroundSize,
      pointerEvents: styles.pointerEvents,
      position: styles.position,
    };
  });
}

export async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
}
