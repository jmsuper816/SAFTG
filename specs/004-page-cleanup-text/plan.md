# Implementation Plan: Page Cleanup and Text Edits

**Branch**: `004-page-cleanup-text` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-page-cleanup-text/spec.md`

## Summary

Simplify the static rankings presentation by removing shared header/footer chrome, standardizing
the visible and browser title, showing only the edition date under the title, introducing a
“POWER RANKING” section label, hiding card explanations, and adding a native no-JavaScript return
link after the ranking list. The link targets a programmatically focusable roundup heading so
fragment navigation returns both the viewport and keyboard focus to the top content.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Astro 7.3.4, HTML, CSS

**Primary Dependencies**: Astro static generation; no new dependency

**Storage**: Existing edition JSON remains unchanged; no new stored data

**Testing**: Existing Vitest suites; Playwright desktop/mobile projects with axe-core and a
JavaScript-disabled browser context; format, lint, type, build, link, and secret gates

**Target Platform**: Static GitHub Pages site under the configured repository base path

**Project Type**: Static web application

**Performance Goals**: Add no client JavaScript, external request, or new media asset; reduce
rendered chrome and card content without changing build performance

**Constraints**: Exact requested copy; current/historical parity; native fragment navigation;
heading focus after activation; 320 CSS-pixel reflow; 200% text size; established football theme,
rankings, badges, and no-JavaScript disclosures preserved

**Scale/Scope**: One shared layout, two ranking page templates, one card component, one stylesheet,
and focused current/history/accessibility browser tests; empty and 404 views receive only the global
chrome removal

## Constitution Check

_Evaluated before Phase 0 research and re-evaluated after Phase 1 design._

| Gate | Design response | Status |
|---|---|---|
| Static output | All changes are build-time HTML/CSS; the return action is a native fragment link. | PASS |
| External data | No ingestion, ESPN adapter, or edition-data behavior changes. | PASS |
| Secrets | No secret or environment handling changes; artifact scanning remains required. | PASS |
| Reproducibility | Existing pinned toolchain and production build path are unchanged. | PASS |
| GitHub Pages | The fragment is same-document and independent of rewrite rules or root paths. | PASS |
| Feature workflow | Work remains isolated on `004-page-cleanup-text` with logical commits and squash merge. | PASS |
| Accessibility/responsiveness | Skip navigation, landmarks, focus, no-JS operation, reflow, zoom, and axe coverage remain gates. | PASS |
| Delivery quality | Focused regressions plus full format, lint, type, test, build, link, and secret checks are specified. | PASS |

**Post-design re-check**: PASS. The design removes DOM content rather than visually hiding it,
retains semantic landmarks and the skip link, and adds no runtime behavior. No constitutional
exception is required.

## Project Structure

### Documentation (this feature)

```text
specs/004-page-cleanup-text/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── page-content-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/
│   └── RankingCard.astro
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── index.astro
│   └── weeks/[week].astro
└── styles/
    └── global.css

tests/e2e/
├── accessibility.spec.ts
├── current-ranking.spec.ts
└── history.spec.ts
```

**Structure Decision**: Keep the current single Astro project. Remove global chrome at its shared
layout source; make identical content changes in the two ranking templates; remove only the
explanation node from the reusable card; and delete obsolete selectors/add minimal new selectors in
the global stylesheet. No domain, data, badge, or build module changes are needed.

## Design Decisions

### Global chrome and copy

- Retain the skip link and `<main id="main">`; remove only the site header and footer elements.
- Remove obsolete `.site-header`, `.brand`, and `footer` rules instead of hiding elements.
- Use the exact roundup name for both page metadata and the visible `h1` on current/history pages.
- Retain the week/status eyebrow and existing timezone-aware long date formatting, but render only
  the `<time>` value beneath the title.
- Remove the complete explanation paragraph from `RankingCard`; keep explanation data validation
  and storage unchanged.

### Ranking section and return navigation

- Put an eyebrow-styled “POWER RANKING” heading as the first child of each non-empty rankings list.
- Put an anchor styled as the existing button after the last card.
- Give the common roundup `h1` a stable unique fragment id and `tabindex="-1"`. The return anchor
  targets that id, so the HTML fragment algorithm scrolls to and focuses the heading without adding
  it to normal Tab order or requiring JavaScript.
- Give the focusable heading a visible focus treatment and scroll margin if required; do not use a
  positive tabindex, button role, or scripted scroll.

### Validation

- Update old current-page assertions that expect the replaced title/source copy.
- Validate exact title metadata, visible heading, date-only hero line, removed strings, section
  ordering, 16 cards, retained card facts/badges, and missing explanation nodes on current/history.
- Validate pointer, keyboard, and JavaScript-disabled fragment activation: hash, heading focus,
  viewport position, and next sequential Tab destination.
- Extend 320-pixel and 200%-text checks to include the new label and return link.
- Keep badge, theme, data, contract, and integration suites unchanged and passing as regression
  evidence.

## Complexity Tracking

No constitutional violations or additional abstractions are required.

