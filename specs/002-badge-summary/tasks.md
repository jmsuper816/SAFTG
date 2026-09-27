---
description: 'Implementation tasks for the edition-level badge summary'
---

# Tasks: Badge Summary

**Input**: Design documents from `specs/002-badge-summary/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Required by the specification, plan, and constitution. Write each listed test before its
corresponding implementation and confirm it fails for the intended reason.

**Organization**: Tasks are grouped by user story so badge scanning, expandable explanations, and
historical consistency can be implemented and validated as separate increments.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no unmet dependency
- **[Story]**: Maps a task to User Story 1, 2, or 3
- Every task includes an exact repository-relative file path

## Phase 1: Setup (Shared Test Infrastructure)

**Purpose**: Establish reusable badge-summary fixtures without changing production behavior.

- [X] T001 Add reusable weekly-edition fixture builders for catalog ordering, ranking ties, shared badges, multiple awards, no awards, unknown references, duplicates, and maximum-length text in `tests/fixtures/editions/badge-summary.ts`
- [X] T002 [P] Document the new badge-summary fixture coverage and its separation from committed production editions in `tests/fixtures/editions/README.md`

**Checkpoint**: Tests can construct every summary scenario without changing real league editions or contacting ESPN.

---

## Phase 2: Foundational (Blocking Validation)

**Purpose**: Strengthen the publication boundary shared by all badge-summary stories.

**⚠️ CRITICAL**: No summary UI work begins until invalid edition references fail closed.

- [X] T003 Add failing contract cases for unknown catalog badge IDs, unknown award teams, duplicate `(badgeId, teamId)` pairs, and disagreement between `badges[]` and each entry's `badgeIds[]` in `tests/contract/edition.test.ts`
- [X] T004 Implement retained-catalog badge validation, award-team validation, unique `(badgeId, teamId)` enforcement, and exact award-to-entry `badgeIds[]` consistency in `src/lib/domain/schemas.ts`
- [X] T005 Verify all committed editions still satisfy the strengthened publication contract and update only invalid generated fixtures if required in `data/editions/2026/`

**Checkpoint**: Invalid or partially attributable awards cannot reach static page rendering.

---

## Phase 3: User Story 1 - Scan This Week's Badge Winners (Priority: P1) 🎯 MVP

**Goal**: Show one compact group per awarded badge above the current ranking cards, with every
recipient visible in deterministic order.

**Independent Test**: Open the current edition and confirm the “Badge Summary” section precedes the
ranking cards, contains one group per awarded catalog badge, and lists tied and multi-award teams
exactly once per badge in ranking order.

### Tests for User Story 1

- [X] T006 [P] [US1] Add failing projection tests for one group per awarded badge, catalog group order, edition-entry recipient order including tied ranks, exact badge/team pair coverage, one team in multiple groups, and an empty group list for no awards in `tests/unit/badge-summary.test.ts`
- [X] T007 [P] [US1] Add a failing current-page browser journey for summary placement, visible heading, collapsed badge names/week/recipients, tied recipients, multiple awards, retained team-card badges, and zero runtime data requests in `tests/e2e/badges.spec.ts`

### Implementation for User Story 1

- [X] T008 [US1] Define the derived Badge Summary, Badge Group, and Badge Recipient types and implement pure catalog-order grouping with edition-entry recipient order in `src/lib/badges/summary.ts`
- [X] T009 [US1] Build the shared semantic “Badge Summary” section with one initially collapsed group per awarded badge, visible badge name/week/all recipients, base-aware decorative artwork, and no client hydration in `src/components/BadgeSummary.astro`
- [X] T010 [US1] Integrate BadgeSummary after WeekNavigation and before ranking cards on the current edition in `src/pages/index.astro`
- [X] T011 [US1] Add compact desktop/phone badge-summary grid, wrapping names, and collapsed group styling without horizontal overflow in `src/styles/global.css`

**Checkpoint**: User Story 1 independently provides a scannable current-week overview while all
existing team-card badge details remain available.

---

## Phase 4: User Story 2 - Understand Each Award (Priority: P2)

**Goal**: Let visitors expand any badge group to read its definition and recipient-specific reasons
using keyboard, pointer, or assistive technology without required JavaScript.

**Independent Test**: Focus a collapsed badge group, expand it with keyboard input, associate every
reason with its recipient, then collapse it again while state and focus remain perceivable.

### Tests for User Story 2

- [X] T012 [P] [US2] Extend the failing badge browser journey with Enter/Space expansion and collapse, description visibility, recipient-to-reason association, independent simultaneous open groups, visible focus, and JavaScript-disabled operation in `tests/e2e/badges.spec.ts`
- [X] T013 [P] [US2] Add failing automated accessibility scans for closed and opened badge-summary states on desktop and phone in `tests/e2e/accessibility.spec.ts`

### Implementation for User Story 2

- [X] T014 [US2] Complete each BadgeSummary native disclosure body with the catalog description and semantic recipient/reason list, relying on native state without redundant roles, manual expanded-state attributes, handlers, or nested interactive controls in `src/components/BadgeSummary.astro`
- [X] T015 [US2] Add visible keyboard focus, open-state distinction that does not rely on color alone, readable reason-list spacing, reduced-motion-safe behavior, and maximum-length content wrapping in `src/styles/global.css`

**Checkpoint**: User Stories 1 and 2 independently expose both a compact overview and complete
award explanations with accessible native interaction.

---

## Phase 5: User Story 3 - Browse Consistent Historical Summaries (Priority: P3)

**Goal**: Give historical editions the same edition-isolated summary and a clear no-awards state.

**Independent Test**: Direct-load current and historical routes, verify that each summary contains
only that edition's awards in identical structure, and verify the no-awards projection produces the
specified message instead of empty groups.

### Tests for User Story 3

- [X] T016 [P] [US3] Add a failing historical browser journey for direct `/SAFTG/weeks/<week>/` loads, selected-edition-only awards, equivalent summary structure/order, and retained historical team-card badges in `tests/e2e/history.spec.ts`
- [X] T017 [P] [US3] Add failing unit coverage that the no-awards projection maps to the exact message “No badges were awarded this week.” and that groups do not leak across sequential edition projections in `tests/unit/badge-summary.test.ts`

### Implementation for User Story 3

- [X] T018 [US3] Integrate BadgeSummary after WeekNavigation and before ranking cards on every generated historical edition route in `src/pages/weeks/[week].astro`
- [X] T019 [US3] Implement the visible, semantically named no-awards state with no empty disclosure group in `src/components/BadgeSummary.astro`

**Checkpoint**: Current and historical routes present consistent, immutable, edition-specific badge
summaries, including the explicit empty state.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Enforce static hosting, responsive accessibility, artifact safety, and documentation
across all three stories.

- [X] T020 [P] Add maximum-length phone overflow assertions using `document.documentElement.scrollWidth <= document.documentElement.clientWidth` and confirm all summary disclosure controls remain reachable by keyboard in `tests/e2e/accessibility.spec.ts`
- [X] T021 [P] Update feature usage and badge-summary behavior documentation, including current/historical placement and no-JavaScript disclosure behavior, in `README.md`
- [X] T022 Confirm the production artifact contains no badge-summary client script or runtime request and that badge assets resolve under `SITE_BASE` using `scripts/check-links.ts` and `specs/002-badge-summary/quickstart.md`
- [X] T023 Run formatting, lint, type-check, all unit/contract/integration tests, production build, desktop/phone browser tests, link checks, and artifact secret scan; record results in `specs/002-badge-summary/quickstart.md`
- [X] T024 Perform and record manual semantic heading, collapsed/expanded announcement, keyboard focus, text-only meaning, long-content phone, and historical-page review in `specs/002-badge-summary/checklists/accessibility.md`

**Checkpoint**: Every constitutional quality gate passes and the exact static artifact is ready for
review and squash merge.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: No dependencies.
- **Phase 2 — Foundational**: Depends on T001 and blocks all user stories.
- **Phase 3 — US1**: Depends on Phase 2 and produces the MVP projection, component, and current page.
- **Phase 4 — US2**: Depends on the US1 component; its tests can be drafted after Phase 2.
- **Phase 5 — US3**: Depends on the US1 component/projection; T016–T017 can be drafted after Phase 2.
- **Phase 6 — Polish**: Depends on all selected user stories.

### User Story Dependency Graph

```text
Setup → Publication validation → US1 current summary (MVP)
                                   ├── US2 expandable explanations
                                   └── US3 historical + empty state

US1 + US2 + US3 → Cross-cutting validation → Review
```

### Within Each User Story

- Write tests and confirm they fail for the intended missing behavior before implementation.
- Implement the pure projection before rendering it.
- Implement semantic content before visual polish.
- Complete and validate the story checkpoint before moving to the next priority.
- Commit after each coherent test-and-behavior group.

### Parallel Opportunities

- T002 can run alongside T001.
- After T001, T003 can be authored while fixture documentation is updated.
- T006 and T007 can run in parallel after Phase 2.
- T012 and T013 can run in parallel; T016 and T017 can also run in parallel.
- After US1, US2 and US3 test authoring can proceed in parallel, though edits to shared component
  and browser-test files must be serialized.
- T020 and T021 touch independent files and can run in parallel.

---

## Parallel Example: User Story 1

```text
Task T006: Add projection tests in tests/unit/badge-summary.test.ts
Task T007: Add current-page browser tests in tests/e2e/badges.spec.ts
```

## Parallel Example: User Stories 2 and 3 after US1

```text
Task T013: Add open/closed accessibility scans in tests/e2e/accessibility.spec.ts
Task T016: Add historical summary journey in tests/e2e/history.spec.ts
Task T017: Add historical-isolation and empty-state unit cases in tests/unit/badge-summary.test.ts
```

---

## Implementation Strategy

### MVP First

1. Complete Setup and publication validation.
2. Write US1 projection and current-page browser tests.
3. Implement grouping, the shared compact component, current-page integration, and base styling.
4. Stop and validate the P1 summary independently before adding expandable details.

### Incremental Delivery

1. **US1**: Visitors can scan all current-week winners above rankings.
2. **US2**: Visitors can expand groups to understand badge meaning and reasons accessibly.
3. **US3**: The same summary works for history and explicit no-awards editions.
4. **Polish**: Run complete static, accessibility, path, security, and manual gates.

### Parallel Team Strategy

After foundation and US1 projection contracts stabilize, one contributor may prepare US2 browser
and accessibility tests while another prepares US3 historical/unit tests. Shared component, style,
and browser-test edits remain serialized to avoid file conflicts.

## Notes

- `[P]` tasks touch different files and have no incomplete dependency.
- `[US1]`, `[US2]`, and `[US3]` provide requirement traceability.
- No production edition fixture may be mutated merely to create an empty or invalid test scenario.
- Historical badge definitions must remain resolvable while committed editions reference them.
- Stop at each checkpoint for independent validation and commit logical progress early.
