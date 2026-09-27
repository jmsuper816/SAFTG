# Quickstart: Validate Badge Summary

## Purpose

Validate the grouped badge overview on current and historical static pages, including ties,
multiple awards, disclosures, accessibility, failure handling, and GitHub Pages base paths.

## Prerequisites

- Node.js 24 LTS
- Existing committed weekly editions containing badge awards

```bash
npm ci
```

## 1. Run quality gates

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
```

Expected: projection tests prove catalog and recipient ordering, ties, multiple awards, empty state,
and invalid-reference failures; all existing tests remain green.

## 2. Build production-equivalent pages

```bash
SITE_ORIGIN=https://example.github.io SITE_BASE=/SAFTG npm run build
npm run check:links
npm run scan:secrets -- dist
```

Expected: summaries precede ranking cards on current and historical pages; assets retain `/SAFTG/`;
the artifact contains no secrets, runtime request, or required client-side script.

## 3. Exercise browser journeys

```bash
npm run test:e2e
```

Expected on desktop and phone:

1. One group appears per awarded badge in catalog order.
2. Recipient names remain visible while collapsed and follow edition-entry order.
3. Tied winners share a group; a multi-award team appears in every earned group.
4. Keyboard activation expands details and reasons, then collapses them with visible focus.
5. Current and historical pages show only their edition's awards.
6. A no-awards fixture displays the explicit empty message.
7. Closed and opened states have no detectable accessibility violations.
8. Long content causes no clipping or horizontal scrolling.
9. Native disclosure remains usable with JavaScript disabled.

## 4. Verify fail-closed references

```bash
npm test -- tests/unit/badge-summary.test.ts
```

Focused cases supply an unknown badge, unknown team, duplicate award, and inconsistent entry badge
reference. Each invalid case fails actionably; valid output remains deterministic.

## 5. Manual semantic review

Confirm the observable [UI contract](contracts/badge-summary-ui.md): the section has a visible
heading, disclosures announce state, ownership is clear in both states, meaning is textual, and
existing team-card badge details remain present.

## Validation Results

Validated on 2026-09-27:

- Format and lint checks passed.
- Type checking completed with 0 errors and 0 warnings (13 dependency deprecation hints).
- 46 unit, contract, and integration tests passed across 8 files.
- The production build generated four static pages in 581 ms.
- 14 desktop/mobile browser tests passed in 6.0 seconds, including JavaScript-disabled disclosure,
  keyboard, open/closed accessibility, historical isolation, and phone-overflow journeys.
- Link validation passed across 12 generated files.
- The artifact secret scan passed.
- Generated output contains no client scripts or ESPN runtime URLs.
