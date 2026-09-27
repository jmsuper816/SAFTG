---
description: 'Implementation tasks for page cleanup and text edits'
---

# Tasks: Page Cleanup and Text Edits

**Input**: Design documents from `/specs/004-page-cleanup-text/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/page-content-ui.md`, `quickstart.md`

**Tests**: Browser, accessibility, responsive, and regression tests are included because the specification explicitly requires those outcomes.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches a different file and has no dependency on an incomplete task
- **[Story]**: Maps the task to a user story in `spec.md`
- Every task names the exact file it changes or validates

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing feature branch starts from a known-good browser-test baseline; this feature requires no new package or project structure.

- [X] T001 Run the existing current, history, and accessibility Playwright suites to establish the pre-change baseline for tests/e2e/current-ranking.spec.ts, tests/e2e/history.spec.ts, and tests/e2e/accessibility.spec.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No new model, service, dependency, or shared infrastructure is required. Existing edition data, static generation, theme assets, and test helpers remain the foundation for every story.

**Checkpoint**: Baseline confirmed; user-story work can begin.

---

## Phase 3: User Story 1 - See a Cleaner Weekly Roundup (Priority: P1) 🎯 MVP

**Goal**: Remove redundant global chrome and give current and historical ranking pages the exact roundup title, matching browser title, retained week context, and date-only supporting line.

**Independent Test**: Open `/`, `/weeks/1/`, and `/404.html`; verify current and historical pages have the requested title and date-only hero, all pages omit the removed header/footer strings, historical week context remains, and the skip link/main landmark still work.

### Tests for User Story 1

> Write or update these assertions first and verify they fail before implementation.

- [X] T002 [P] [US1] Replace old current-page title/source assertions with exact document-title, h1, week-status, date-only, removed-copy, card-count, and no-runtime-request assertions in tests/e2e/current-ranking.spec.ts
- [X] T003 [P] [US1] Add historical title, h1, week-context, date-only, and removed-copy assertions while retaining badge-summary navigation coverage in tests/e2e/history.spec.ts
- [X] T004 [P] [US1] Add all-page assertions that the global header/footer are absent while the skip link and main landmark remain on current, historical, and 404 pages in tests/e2e/accessibility.spec.ts

### Implementation for User Story 1

- [X] T005 [US1] Remove the site-header and footer markup while preserving the skip link and `<main id="main">` landmark in src/layouts/BaseLayout.astro
- [X] T006 [P] [US1] Set the exact browser title and focus-ready visible h1 to “Sundays Are For The Girls Weekly Roundup,” retain the current-week eyebrow, and reduce the supporting line to the existing formatted `<time>` in src/pages/index.astro
- [X] T007 [P] [US1] Set the exact browser title and focus-ready visible h1 to “Sundays Are For The Girls Weekly Roundup,” retain the historical-week eyebrow, and reduce the supporting line to the existing formatted `<time>` in src/pages/weeks/[week].astro
- [X] T008 [US1] Remove obsolete `.site-header`, `.brand`, and `footer` rules without changing football backgrounds, theme tokens, skip-link styles, or responsive behavior in src/styles/global.css

**Checkpoint**: User Story 1 is independently complete when the focused US1 browser assertions pass on current, historical, and 404 pages.

---

## Phase 4: User Story 2 - Scan the Power Rankings Quickly (Priority: P2)

**Goal**: Identify the rankings-list start with a semantic “POWER RANKING” heading and remove every rendered explanation while preserving all ranking and badge information.

**Independent Test**: On current and historical pages, verify “POWER RANKING” immediately precedes the first of 16 cards in the same typography treatment as “WEEKLY HONORS,” no explanation is rendered, and rank, team, movement, record, score, badge content, and order are unchanged.

### Tests for User Story 2

> Update these assertions first and verify they fail before implementation.

- [X] T009 [US2] Add current-page assertions for semantic ranking-label placement, shared eyebrow typography class, absent explanation text, and preserved rank/team/movement/record/score/badge content in tests/e2e/current-ranking.spec.ts
- [X] T010 [US2] Add historical-page assertions for semantic ranking-label placement, absent explanation text, 16-card order, and preserved edition-specific rank and badge content in tests/e2e/history.spec.ts

### Implementation for User Story 2

- [X] T011 [US2] Remove only the rendered `entry.explanation` paragraph while preserving rank, display name, movement, record, weekly score, and awards markup in src/components/RankingCard.astro
- [X] T012 [P] [US2] Add the exact semantic “POWER RANKING” heading as the first child of the non-empty rankings section using the existing eyebrow class in src/pages/index.astro
- [X] T013 [P] [US2] Add the exact semantic “POWER RANKING” heading as the first child of the non-empty rankings section using the existing eyebrow class in src/pages/weeks/[week].astro

**Checkpoint**: User Story 2 is independently complete when both editions retain their data and badge behavior while rendering the new section heading and no explanation nodes.

---

## Phase 5: User Story 3 - Return to the Page Start (Priority: P3)

**Goal**: Add a visible native “Back to top” link after every non-empty ranking list that scrolls to and focuses the roundup heading without JavaScript.

**Independent Test**: On current and historical pages, activate the link by pointer and keyboard and in a JavaScript-disabled browser; verify the fragment, viewport position, focused h1, visible focus indicator, next Tab sequence, 320-pixel reflow, and 200% text-size behavior.

### Tests for User Story 3

> Add these tests first and verify they fail before implementation.

- [X] T014 [US3] Add pointer, keyboard Enter, JavaScript-disabled, URL-fragment, h1-focus, viewport-position, and next-Tab tests for current and historical back-to-top navigation in tests/e2e/accessibility.spec.ts
- [X] T015 [US3] Extend the 320 CSS-pixel and 200%-text-size checks to cover the roundup heading, “POWER RANKING” label, final card, back-to-top link, visible focus ring, and absence of horizontal scrolling in tests/e2e/accessibility.spec.ts

### Implementation for User Story 3

- [X] T016 [P] [US3] Give the current-page roundup h1 one stable unique id with `tabindex="-1"` and add a native “Back to top” anchor targeting it after the final card in src/pages/index.astro
- [X] T017 [P] [US3] Give the historical-page roundup h1 the same per-document stable id with `tabindex="-1"` and add a native “Back to top” anchor targeting it after the final card in src/pages/weeks/[week].astro
- [X] T018 [US3] Style the return anchor consistently with existing controls and add a visible focus treatment and safe scroll margin for the targeted h1 while preserving 320-pixel reflow and 200% zoom behavior in src/styles/global.css

**Checkpoint**: User Story 3 is independently complete when native fragment navigation scrolls and focuses correctly with pointer, keyboard, and JavaScript disabled.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the integrated feature against the constitution, UI contract, and measurable success criteria.

- [X] T019 Run the full format, lint, typecheck, unit, production build, link, generated-artifact secret scan, and Playwright gates documented in specs/004-page-cleanup-text/quickstart.md
- [X] T020 Validate current, historical, empty-state, and 404 behavior plus unchanged football artwork and badge disclosures against specs/004-page-cleanup-text/contracts/page-content-ui.md
- [ ] T021 Conduct the five-person discoverability check for title, date, rankings start, and return action and record whether at least four participants complete each identification within 10 seconds in specs/004-page-cleanup-text/quickstart.md
- [X] T022 Review git changes for feature-only scope and create logical checkpoint commits for specs/004-page-cleanup-text/ and the implemented src/ and tests/e2e/ files before squash-merge review

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Contains no implementation because the existing static-site foundation is sufficient; it is cleared after T001.
- **User Story 1 (Phase 3)**: Starts after T001 and establishes the shared layout and page hero used by later stories.
- **User Story 2 (Phase 4)**: Starts after US1 because its tests and implementation revisit the same page templates and E2E files.
- **User Story 3 (Phase 5)**: Starts after US2 because its link is placed after the rankings markup and targets the h1 introduced by US1.
- **Polish (Phase 6)**: Starts after all desired stories are complete.

### User Story Dependencies

- **US1 (P1)**: Depends only on the baseline; it is the suggested MVP.
- **US2 (P2)**: Functionally independent for users, but executes after US1 to avoid concurrent edits to `index.astro`, `[week].astro`, and shared tests.
- **US3 (P3)**: Depends on the stable roundup h1 from US1 and non-empty rankings boundary used by US2.

### Within Each User Story

- Add or update the story’s browser assertions and confirm they fail before changing production code.
- Apply shared-layout/component changes before final page integration when applicable.
- Run the focused story tests at the checkpoint before advancing.
- Commit each coherent tested behavior as a logical checkpoint.

### Parallel Opportunities

- T002, T003, and T004 can run in parallel because they modify different test files.
- T006 and T007 can run in parallel after T005 because they modify separate page templates.
- T012 and T013 can run in parallel after T011.
- T016 and T017 can run in parallel after the US3 tests are written.
- Manual contract review in T020 can be divided across current, historical, empty, and 404 pages after T019 builds the final artifact.

---

## Parallel Example: User Story 1

```text
Task T002: Update current-page content assertions in tests/e2e/current-ranking.spec.ts
Task T003: Update historical-page content assertions in tests/e2e/history.spec.ts
Task T004: Add global chrome/landmark assertions in tests/e2e/accessibility.spec.ts

After T005:
Task T006: Implement the current-page hero in src/pages/index.astro
Task T007: Implement the historical-page hero in src/pages/weeks/[week].astro
```

## Parallel Example: User Story 2

```text
After T011:
Task T012: Add the current-page rankings label in src/pages/index.astro
Task T013: Add the historical-page rankings label in src/pages/weeks/[week].astro
```

## Parallel Example: User Story 3

```text
After T014 and T015:
Task T016: Add current-page fragment target and return link in src/pages/index.astro
Task T017: Add historical-page fragment target and return link in src/pages/weeks/[week].astro
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 and confirm the existing baseline.
2. Complete T002–T004 as failing US1 tests.
3. Complete T005–T008 and rerun the focused tests.
4. Stop and validate the cleaner current, historical, and global page presentation independently.

### Incremental Delivery

1. Deliver US1 for global cleanup, exact roundup title, week context, and date-only supporting text.
2. Deliver US2 for the semantic rankings label and explanation-free cards without altering ranking data.
3. Deliver US3 for native, focus-correct return navigation.
4. Complete all cross-cutting quality, security, responsive, and usability validation before review.

### Parallel Team Strategy

1. Establish the baseline together.
2. Within US1, split current, historical, and global accessibility tests across separate files, then split the two page templates after the layout change.
3. Within US2 and US3, parallelize only the current and historical page-template tasks; keep same-file test and stylesheet work sequential.
4. Integrate in priority order to avoid conflicts while preserving independently testable story checkpoints.

---

## Notes

- `[P]` tasks touch different files and have no dependency on incomplete work.
- `[US1]`, `[US2]`, and `[US3]` provide traceability to `spec.md`.
- Existing edition schemas and data remain unchanged; explanation stays required in stored edition data but is not rendered.
- No client JavaScript, package, external request, or media asset is added.
- Every completed logical group should be committed early on `004-page-cleanup-text`; the completed feature must be squash merged through review.
