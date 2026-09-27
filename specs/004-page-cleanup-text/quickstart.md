# Validation Quickstart: Page Cleanup and Text Edits

## Prerequisites

- Node.js 24+
- Dependencies installed with `npm install`
- Local environment configured per the repository README

## Automated gates

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run check:links
npm run scan:secrets -- dist
npm run test:e2e
```

Expected: every command succeeds, all internal links resolve beneath the configured Pages base, and
the artifact contains no secret or new runtime request.

## Production preview

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

Review the current page, `/weeks/1/`, an additional historical week, and `/404.html`.

## Content checks

On current and historical ranking pages, verify:

- the browser tab and visible `h1` both read “Sundays Are For The Girls Weekly Roundup”;
- the week/current-or-historical eyebrow remains visible;
- only the formatted date appears below the `h1`;
- “POWER RANKING” appears between the badge summary and first card in the “WEEKLY HONORS” style;
- all 16 cards retain rank, team name, movement, record, score, and badges but no explanation;
- “Back to top” appears after the last card.

Across current, historical, empty, and 404 views, confirm all removed global strings are absent and
the football artwork/theme remain intact.

## Return navigation checks

On both desktop and mobile:

1. Scroll to the last ranking card.
2. Click “Back to top”; confirm the URL fragment targets the roundup heading, the heading is near
   the viewport top, and the heading has focus with a visible indicator.
3. Repeat using keyboard focus and Enter.
4. Repeat in a browser context with JavaScript disabled.
5. Press Tab after arrival and confirm navigation continues from the top content rather than the
   bottom of the page.

## Responsive and regression checks

- At 320 CSS pixels, confirm no horizontal scrolling and verify title, date, ranking label, final
  card, and return action are readable.
- At 200% text size, repeat the overflow, visibility, and focus checks.
- Expand badge summaries and use week navigation to confirm preserved native behavior.
- Verify current/history card counts and order, badge counts, movement cues, and fixed background.
- Confirm ranking-only elements are absent from the 404 and an empty-edition rendering.

Acceptance requires conformance with [page-content-ui.md](contracts/page-content-ui.md) and all
automated and manual scenarios above.
