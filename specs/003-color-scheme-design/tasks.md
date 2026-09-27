---
description: 'Implementation tasks for the football color scheme and design feature'
---

# Tasks: Football Color Scheme and Design

**Input**: Design documents from `/specs/003-color-scheme-design/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/visual-theme-ui.md`, `quickstart.md`

**Tests**: Required because the specification makes responsive behavior, contrast, accessibility,
fallback behavior, and preservation of existing interactions release criteria.

**Organization**: Tasks are grouped by user story so each increment can be implemented and tested
independently. Tests precede the implementation they verify.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it targets a different file and has no incomplete dependency
- **[Story]**: Maps the task to a user story in `spec.md`
- Every task names the file or directory it changes or validates

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the supplied artwork and implementation locations without changing behavior.

- [X] T001 Create `src/assets/backgrounds/` and encode the supplied portrait artwork as `src/assets/backgrounds/football-portrait.webp`, preserving its intrinsic aspect ratio and avoiding visible quality loss
- [X] T002 Encode the supplied landscape artwork as `src/assets/backgrounds/football-landscape.webp`, preserving its intrinsic aspect ratio and avoiding visible quality loss
- [X] T003 Record final dimensions, byte sizes, and source-to-output orientation mapping for both assets in `specs/003-color-scheme-design/data-model.md`

**Checkpoint**: Both local artwork variants are available as reproducible, reviewable build inputs.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared theme values and test helpers used by all three stories.

**⚠️ CRITICAL**: User-story styling must use these shared semantic roles rather than introducing
new component-specific color literals.

- [X] T004 Define the approved page fallback, artwork tint, primary/elevated surfaces, primary/secondary ink, accent, cyan-up, hot-pink-down, border, and two-color focus values in `src/styles/global.css`, retaining the exact constraints documented in `specs/003-color-scheme-design/data-model.md`
- [X] T005 [P] Add reusable contrast-ratio parsing and calculation helpers for CSS custom properties in `tests/helpers/theme.ts`
- [X] T006 [P] Add Playwright helpers for computed decorative-layer styles, horizontal-overflow checks, and local background request tracking in `tests/e2e/helpers/theme.ts`

**Checkpoint**: The semantic palette and validation helpers are ready; user-story work can begin.

---

## Phase 3: User Story 1 — Enjoy a Cohesive Football Theme (Priority: P1) 🎯 MVP

**Goal**: Show the supplied fixed football artwork in the correct orientation and apply one cohesive
art-derived palette to the current rankings experience.

**Independent Test**: Open the current page at portrait, landscape, and square dimensions; verify
the correct local artwork fills a fixed layer without distortion or tiling, and visually confirm
that navigation, headings, ranking cards, badges, links, and controls use the approved palette.

### Tests for User Story 1

- [X] T007 [P] [US1] Add initially failing portrait, landscape, square-boundary, rotation, centered-cover, no-repeat, fixed-layer, and only-active-local-asset assertions in `tests/e2e/theme.spec.ts`
- [X] T008 [P] [US1] Add an initially failing audit in `tests/unit/theme-contrast.test.ts` that rejects legacy `--gold`, `--mint`, `--danger`, green, and red theme roles and confirms every required semantic custom property exists in `src/styles/global.css`

### Implementation for User Story 1

- [X] T009 [US1] Implement a non-interactive fixed viewport art layer with deep-teal fallback, static dark tint, centered proportional cover, portrait selection for `height > width`, and landscape selection for `width >= height` in `src/styles/global.css`
- [X] T010 [US1] Replace legacy page, header, hero, navigation, ranking-card, badge, disclosure, link, button, and footer colors with the semantic art-derived palette in `src/styles/global.css`
- [X] T011 [US1] Verify the production build fingerprints both backgrounds beneath the configured `/SAFTG` base path and add any missing artifact assertion to `tests/e2e/theme.spec.ts`
- [X] T012 [US1] Record manual crop and palette review results for 320×568, 375×667, 768×1024, 1024×768, 1440×900, 1920×1080, and 800×800 in `specs/003-color-scheme-design/checklists/visual-review.md`

**Checkpoint**: User Story 1 is demonstrable as a themed current-ranking page and can be reviewed as
the visual MVP.

---

## Phase 4: User Story 2 — Read Every Ranking Clearly (Priority: P2)

**Goal**: Guarantee readable surfaces, accessible color contrast, non-color movement meaning, and
visible keyboard focus across the expressive artwork.

**Independent Test**: Exercise default, hover, focus, current, expanded, up, down, neutral, and new
states; all approved pairs meet 4.5:1 normal-text or 3:1 large/non-text thresholds, movement remains
understandable without color, and every keyboard target has visible focus.

### Tests for User Story 2

- [X] T013 [P] [US2] Add initially failing ≥4.5:1 normal-text and ≥3:1 large/non-text checks for every documented token pairing in `tests/unit/theme-contrast.test.ts`
- [X] T014 [P] [US2] Extend `tests/e2e/accessibility.spec.ts` with initially failing 320 CSS-pixel reflow, 200% resize, expanded long-content, complete keyboard-focus visibility, and reduced-motion checks
- [X] T015 [P] [US2] Add initially failing assertions for cyan up, hot-pink down, neutral, and new state classes plus visible non-color cues in `tests/e2e/theme.spec.ts`

### Implementation for User Story 2

- [X] T016 [US2] Derive and emit `movement--up`, `movement--down`, `movement--neutral`, and `movement--new` classes while retaining the up arrow/magnitude, down arrow/magnitude, em dash, and `New` text in `src/components/RankingCard.astro`
- [X] T017 [US2] Apply cyan-up, hot-pink-down, readable neutral/new, stable panel opacity, interactive-state separation, and a two-color focus treatment meeting the data-model thresholds in `src/styles/global.css`
- [X] T018 [US2] Complete the exact-ratio, grayscale/color-vision, keyboard-only, 320-pixel, and 200%-resize rows in `specs/003-color-scheme-design/checklists/visual-review.md`

**Checkpoint**: User Story 2 independently proves that the themed current page remains readable and
operable without relying on color alone.

---

## Phase 5: User Story 3 — Keep the Experience Consistent Across Pages (Priority: P3)

**Goal**: Apply and verify the same resilient visual system on historical, empty, expanded, and 404
states, including when the artwork cannot load.

**Independent Test**: Visit current, historical, and 404 routes, expand disclosures, and block each
art request; every route retains consistent tokens, fixed treatment, readable fallback, content,
navigation, and native no-JavaScript interaction.

### Tests for User Story 3

- [X] T019 [P] [US3] Add initially failing current, historical, and 404 route-consistency plus blocked-background fallback assertions in `tests/e2e/theme.spec.ts`
- [X] T020 [P] [US3] Extend axe and overflow coverage for both orientations, historical content, open disclosures, long strings, and art-request failure in `tests/e2e/accessibility.spec.ts`
- [X] T021 [P] [US3] Preserve no-JavaScript disclosure and no-runtime-ESPN-request coverage while asserting the themed states in `tests/e2e/badges.spec.ts`

### Implementation for User Story 3

- [X] T022 [US3] Finish shared styling for all-weeks menus, open badge summaries, individual badges, empty content, fallback messages, and the 404 return action in `src/styles/global.css`
- [X] T023 [US3] Remove remaining unrelated user-facing hard-coded accent colors and document any required exception in `src/styles/global.css` and `specs/003-color-scheme-design/checklists/visual-review.md`
- [X] T024 [US3] Complete current, historical, expanded, empty/404, orientation-rotation, long-scroll, and blocked-art rows in `specs/003-color-scheme-design/checklists/visual-review.md`

**Checkpoint**: All user stories work across every published route and defined failure state.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation, and release readiness.

- [X] T025 [P] Update theme asset, design, and local-preview guidance in `README.md`
- [X] T026 [P] Verify `src/assets/backgrounds/football-portrait.webp` and `src/assets/backgrounds/football-landscape.webp` are reasonably compressed and that only the active orientation asset is requested in the browser network log
- [X] T027 Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run test:e2e`, fixing feature-related failures under `src/` and `tests/`
- [X] T028 Run `npm run build`, `npm run check:links`, and `npm run scan:secrets`, then verify built CSS/assets contain no external artwork URL or unsupported runtime dependency in `dist/`
- [X] T029 Execute every scenario in `specs/003-color-scheme-design/quickstart.md` and record the final automated and manual results in `specs/003-color-scheme-design/checklists/visual-review.md`
- [X] T030 Confirm every task and acceptance row is complete in `specs/003-color-scheme-design/tasks.md` and `specs/003-color-scheme-design/checklists/visual-review.md`

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)** has no dependency.
- **Foundational (Phase 2)** depends on both optimized assets and blocks all user stories.
- **US1 (Phase 3)** depends on the foundation and is the MVP.
- **US2 (Phase 4)** depends on semantic tokens from the foundation; it can begin alongside US1 after
  T004–T006, but T017 must reconcile with US1 edits to `global.css`.
- **US3 (Phase 5)** depends on the shared US1/US2 theme because it verifies that treatment across
  secondary routes and failure states.
- **Polish (Phase 6)** depends on all selected user stories.

### User-story graph

```text
Setup → Foundation → US1 (visual MVP)
                   ├→ US2 (readability/accessibility)
                   └→ US1 + US2 → US3 (cross-route consistency)
                                      → Polish
```

### Within each story

- Write the story's tests first and confirm they fail for the intended missing behavior.
- Implement semantic markup before the CSS that targets it.
- Run the focused unit/E2E files before marking the story checkpoint complete.
- Commit after each coherent story or test/implementation checkpoint with a descriptive message.

## Parallel Opportunities

- T003 can run while T001–T002 are being reviewed once output metadata is known.
- T005 and T006 target different helper files and can run together after T004 defines the contract.
- US1 test tasks T007–T008 can run together.
- US2 test tasks T013–T015 can run together.
- US3 test tasks T019–T021 can run together.
- T025 and T026 can run together after feature behavior stabilizes.
- Tasks touching `src/styles/global.css` must run sequentially or be carefully coordinated.

## Parallel Examples

### User Story 1

```text
Task T007: Write responsive background browser contract in tests/e2e/theme.spec.ts
Task T008: Write semantic-token and legacy-color audit in tests/unit/theme-contrast.test.ts
```

### User Story 2

```text
Task T013: Add contrast-ratio assertions in tests/unit/theme-contrast.test.ts
Task T014: Add reflow, resize, focus, and motion checks in tests/e2e/accessibility.spec.ts
Task T015: Add semantic movement checks in tests/e2e/theme.spec.ts
```

### User Story 3

```text
Task T019: Add route and fallback checks in tests/e2e/theme.spec.ts
Task T020: Extend axe/overflow checks in tests/e2e/accessibility.spec.ts
Task T021: Preserve no-JavaScript/runtime-request coverage in tests/e2e/badges.spec.ts
```

## Implementation Strategy

### MVP first

1. Complete Setup and Foundation.
2. Complete US1 tests and implementation.
3. Stop and review the current page at every orientation/size in T012.
4. Demo the cohesive football theme before adding later guarantees.

### Incremental delivery

1. **US1**: Correct fixed artwork plus cohesive palette.
2. **US2**: Measured contrast, semantic movement, focus, zoom, and reflow.
3. **US3**: Historical/404/expanded/failure consistency.
4. **Polish**: Full static-build and manual acceptance evidence.

## Notes

- `[P]` means different files or safely isolated changes, not permission to edit `global.css`
  concurrently.
- Every asset path must remain compatible with the configured GitHub Pages base.
- Do not introduce client JavaScript for background selection or disclosures.
- Keep tests deterministic and do not consume live ESPN APIs.
- Commit at logical checkpoints and squash merge the completed branch to `main`.
