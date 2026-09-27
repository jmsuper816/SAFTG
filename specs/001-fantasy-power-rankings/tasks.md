---
description: 'Implementation tasks for weekly fantasy football power rankings'
---

# Tasks: Weekly Fantasy Football Power Rankings

**Input**: Design documents from `specs/001-fantasy-power-rankings/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Required by the specification and constitution. Write each listed test before its
corresponding implementation and confirm that it fails for the intended reason.

**Organization**: Tasks are grouped by user story so current rankings, badges, and history can be
implemented and validated as separate increments.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no unmet dependency
- **[Story]**: Maps a task to User Story 1, 2, or 3
- Every task includes an exact repository-relative file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the reproducible Astro and TypeScript project and its quality tooling.

- [X] T001 Initialize Astro 7.x, TypeScript 6.x, and Node.js 24 LTS scripts in `package.json` and commit exact dependency resolutions in `package-lock.json`
- [X] T002 [P] Configure Astro static output, `SITE_ORIGIN`, and repository `SITE_BASE` handling in `astro.config.ts`
- [X] T003 [P] Configure strict TypeScript and Node/Astro types in `tsconfig.json`
- [X] T004 [P] Configure formatting, linting, and ignored generated directories in `prettier.config.mjs`, `eslint.config.js`, and `.gitignore`
- [X] T005 [P] Configure Vitest unit/contract projects and Playwright base-path browser testing in `vitest.config.ts` and `playwright.config.ts`
- [X] T006 [P] Create the planned source, data, public asset, script, and test directory skeleton with tracked placeholders in `src/`, `data/`, `public/assets/badges/`, `scripts/`, and `tests/fixtures/`

**Checkpoint**: `npm ci`, formatting, lint, type-check, and empty test commands run consistently.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the validated data boundary and shared edition pipeline required by every
user story.

**⚠️ CRITICAL**: No user-story implementation begins until this phase is complete.

### Tests for the Foundation

- [X] T007 [P] Add commissioner contract tests for `schemaVersion` literal `1`; `leagueId` 1–64 characters; `season` 2020–2100; `week` 1–25; `commissioner` 1–80 characters; 2–20 rankings; `teamId` 1–64 characters; `rank` 1–20; `explanation` 1–500 characters; uniqueness, full-team coverage, and competition-rank gaps in `tests/contract/commissioner-ranking.test.ts`
- [X] T008 [P] Add edition contract tests for `schemaVersion` literal `1`; `{leagueId}-{season}-week-{NN}` edition IDs; league name 1–100 characters; season 2020–2100; week 1–25 with final-only status; commissioner 1–80 characters; 2–20 unique entries; display name 1–60 characters; rank/prior rank 1–20; nullable movement -19–19; non-negative wins/losses/ties; finite points and weekly score; explanation 1–500 characters; unique kebab-case badge IDs; badge reason 1–300 characters; nullable finite metric; and source/league/week consistency in `tests/contract/edition.test.ts`
- [X] T009 [P] Add sanitized ESPN fixtures for finalized, incomplete, tied, bye, odd-team, zero-score, renamed-team, duplicate-team, missing-field, wrong-type, HTML, rate-limit, and upstream-error responses in `tests/fixtures/espn/`
- [X] T010 Add failing adapter contract tests for unauthenticated HTTPS retrieval, timeout, bounded retry, response validation, safe logs, unknown fields, and every fixture from T009 in `tests/contract/espn-adapter.test.ts`

### Shared Implementation

- [X] T011 [P] Define League, Team, Record, FantasyWeek, Matchup, CommissionerRanking, RankingSubmission, WeeklyEdition, RankingEntry, BadgeDefinition, and BadgeAward TypeScript types in `src/lib/domain/types.ts`
- [X] T012 Implement Zod commissioner and edition schemas matching `contracts/commissioner-ranking.schema.json` and `contracts/edition.schema.json`, including cross-record uniqueness, complete active-team coverage, and competition ranking, in `src/lib/domain/schemas.ts`
- [X] T013 [P] Implement the discard-extra-fields ESPN response schema with unique 2–20 teams, finite scores, week 1–25, known matchup participants, explicit byes, and final-state checks in `src/lib/espn/schema.ts`
- [X] T014 Implement the unauthenticated ESPN client with HTTPS enforcement, configurable timeout, bounded exponential backoff with jitter, typed failures, and metadata-only safe logging in `src/lib/espn/client.ts`
- [X] T015 Implement ESPN normalization for string identifiers, 1–60 character sanitized team names, optional abbreviation/logo, non-negative records, final matchups, and stable renamed-team identity in `src/lib/espn/normalize.ts`
- [X] T016 [P] Implement validated environment configuration for public league ID, season 2020–2100, IANA timezone, site origin/base, timeout, and attempt count in `src/lib/config.ts`
- [X] T017 Implement commissioner submission loading and schema validation without contacting ESPN in `src/lib/editions/load-ranking.ts`
- [X] T018 Add the `ranking:validate`, `edition:generate`, `edition:verify`, `format:check`, `typecheck`, `test:contract`, and `test:e2e` commands to `package.json`

**Checkpoint**: Shared contracts reject invalid or private inputs, the ESPN adapter passes every
fixture without live calls, and all later story work can consume stable domain objects.

---

## Phase 3: User Story 1 - View Weekly Power Rankings (Priority: P1) 🎯 MVP

**Goal**: Publish one complete commissioner-authored weekly ranking enriched with finalized ESPN
records, score context, movement, explanation, and source attribution.

**Independent Test**: Generate an edition fixture and load the built current page; every active team
appears exactly once in commissioner order with rank, name, record, weekly score, movement or a
first-week unavailable state, explanation, commissioner attribution, week, and publication date.

### Tests for User Story 1

- [X] T019 [P] [US1] Add failing movement tests for first appearance, rise, fall, unchanged position, commissioner ties, and stable team IDs across renames in `tests/unit/movement.test.ts`
- [X] T020 [P] [US1] Add failing generation tests for valid output, deterministic regeneration, incomplete ESPN results, missing/incomplete commissioner input, unknown/duplicate team, mismatched league/season/week, and no-write-on-failure behavior in `tests/integration/generate-edition.test.ts`
- [X] T021 [P] [US1] Add a failing current-ranking browser journey covering complete team display, commissioner attribution, direct page load under `/SAFTG/`, phone/desktop layouts, and no browser API requests in `tests/e2e/current-ranking.spec.ts`

### Implementation for User Story 1

- [X] T022 [P] [US1] Implement rank movement as `previousRank - rank`, preserving null for no prior edition and commissioner-provided ties, in `src/lib/editions/movement.ts`
- [X] T023 [US1] Implement edition normalization that joins complete commissioner rankings to finalized ESPN teams/results, preserves 1–500 character explanations, snapshots 1–60 character display names, and produces no output on any invariant failure in `src/lib/editions/normalize.ts`
- [X] T024 [US1] Implement the deterministic `edition:generate` CLI with explicit/preserved `publishedAt`, atomic writes, and non-zero fail-closed exits to `data/editions/{season}/week-{NN}.json` in `scripts/generate-edition.ts`
- [X] T025 [US1] Implement validated edition discovery and latest-valid selection without re-reading ESPN at render time in `src/lib/editions/load.ts`
- [X] T026 [P] [US1] Build the semantic ranking card showing rank, display name, record, weekly score, movement, explanation, and safe logo fallback in `src/components/RankingCard.astro`
- [X] T027 [P] [US1] Build the document shell, skip link, metadata, source attribution region, and repository-base-aware navigation in `src/layouts/BaseLayout.astro`
- [X] T028 [US1] Build the current weekly rankings page with complete edition metadata, commissioner attribution, awaiting-update state, and ordered RankingCard rendering in `src/pages/index.astro`
- [X] T029 [US1] Add focused responsive ranking-card and current-page styling without required client JavaScript in `src/styles/global.css`

**Checkpoint**: User Story 1 is a deployable MVP and satisfies FR-001–FR-005, FR-011–FR-019, and
the first-week/current-week acceptance scenarios without badges or history navigation.

---

## Phase 4: User Story 2 - Discover Team Badges (Priority: P2)

**Goal**: Calculate and explain playful deterministic weekly and streak badges from finalized league
results and display them accessibly with qualifying teams.

**Independent Test**: Generate an edition from fixtures containing qualifying, non-qualifying, tied,
and multi-award teams; only qualifying teams receive the expected badge name, reason, and week, and
each badge meaning is available by keyboard and assistive technology.

### Tests for User Story 2

- [X] T030 [P] [US2] Add failing unit cases for highest score, lowest score, largest win, closest win, biggest upset, longest active winning streak, unluckiest high-scoring loss, no qualifier, all/none/secondary tie outcomes, and multiple awards per team in `tests/unit/badges.test.ts`
- [X] T031 [P] [US2] Add a failing badge browser journey for visible names, descriptions, reasons, earned week, keyboard focus, screen-reader text, and multiple tied recipients in `tests/e2e/badges.spec.ts`

### Implementation for User Story 2

- [X] T032 [P] [US2] Define seven stable kebab-case badge IDs with public names, descriptions, `weekly` or `streak` scope, exclusivity, `all`/`none`/secondary tie rule, and repository-relative asset path in `src/lib/badges/catalog.ts`
- [X] T033 [P] [US2] Create accessible decorative badge assets with no embedded scripts or external resources in `public/assets/badges/`
- [X] T034 [US2] Implement deterministic badge evaluation over finalized matchups and prior editions, emitting unique `(season, week, badgeId, teamId)` awards with a 1–300 character reason and finite metric or null, in `src/lib/badges/evaluate.ts`
- [X] T035 [US2] Integrate badge evaluation into normalized edition generation while preserving committed historical awards when later rules change in `src/lib/editions/normalize.ts`
- [X] T036 [P] [US2] Build a keyboard-accessible badge component with image fallback, name, description, reason, and earned-week semantics in `src/components/Badge.astro`
- [X] T037 [US2] Render zero, one, or multiple earned badges beside each qualifying team without obscuring ranking content in `src/components/RankingCard.astro`
- [X] T038 [US2] Add playful responsive badge styling that never conveys meaning by color alone in `src/styles/global.css`

**Checkpoint**: User Story 2 passes independently against fixture editions and adds badges without
changing commissioner ranking order or requiring live browser data.

---

## Phase 5: User Story 3 - Browse Ranking History (Priority: P3)

**Goal**: Generate stable direct-load pages for every committed edition and let visitors reach any
available week from the current edition in no more than two interactions.

**Independent Test**: Build with at least three immutable editions, open each weekly URL directly
under `/SAFTG/`, move among weeks and back to current rankings, and verify that a missing week shows
a friendly recovery route without changing historical content.

### Tests for User Story 3

- [X] T039 [P] [US3] Add failing edition-loader tests for chronological ordering, latest-valid selection, duplicate edition IDs, schema-invalid files, stable historical snapshots, and 1–25 week limits in `tests/unit/edition-loader.test.ts`
- [X] T040 [P] [US3] Add a failing browser journey for three historical weeks, two-interaction reachability, first-week null movement, current/historical labels, direct base-path loads, and missing-week recovery in `tests/e2e/history.spec.ts`

### Implementation for User Story 3

- [X] T041 [P] [US3] Build base-aware previous, next, all-weeks, and current navigation with an explicit first/last state in `src/components/WeekNavigation.astro`
- [X] T042 [US3] Generate one static route per validated edition using `getStaticPaths()`, stable week labels, historical commissioner ranking, badges, and no runtime fetch in `src/pages/weeks/[week].astro`
- [X] T043 [US3] Integrate WeekNavigation into current and historical pages so any available week is reachable in at most two interactions in `src/pages/index.astro` and `src/pages/weeks/[week].astro`
- [X] T044 [US3] Implement a friendly static missing-page state with base-aware links to current and available rankings in `src/pages/404.astro`

**Checkpoint**: All three stories function independently, and committed historical editions remain
stable across rebuilds and later source changes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Enforce accessibility, security, performance, deployment, and operational gates across
all stories.

- [X] T045 [P] Add axe scans plus phone/desktop viewport and keyboard-only journeys for all ranking, badge, and history functions in `tests/e2e/accessibility.spec.ts`
- [X] T046 [P] Add a generated-site internal link and missing-asset checker that honors `SITE_BASE` in `scripts/check-links.ts`
- [X] T047 [P] Add a published-artifact secret and forbidden-file scanner covering cookies, tokens, environment files, raw ESPN payloads, caches, and internal metadata in `scripts/scan-artifact.ts`
- [X] T048 Add a CI validation workflow with `npm ci`, format, lint, type-check, fixtures, unit/contract/integration tests, deterministic edition verification, base-path build, browser tests, link checks, and artifact secret scan in `.github/workflows/ci.yml`
- [X] T049 Add a GitHub Pages workflow with Tuesday timezone schedule, manual dispatch, default-branch deployment guard, non-cancelling `pages` concurrency, separate build/deploy jobs, least-privilege permissions, protected `github-pages` environment, full-SHA-pinned actions, and exact `dist/` artifact deployment in `.github/workflows/pages.yml`
- [X] T050 [P] Document public league configuration, commissioner weekly JSON workflow, stat-correction replacement process, manual recovery, rollback, and GitHub Pages settings in `README.md`
- [X] T051 [P] Add a sanitized three-week example season covering a rename, tie, bye, badge ties, and first-week movement state in `data/rankings/2026/`, `data/editions/2026/`, and `tests/fixtures/editions/`
- [X] T052 Verify generation plus production build completes in under 5 minutes and initial ranking pages ship no client JavaScript; record measurements and any justified exception in `specs/001-fantasy-power-rankings/quickstart.md`
- [X] T053 Perform and record manual semantic HTML, keyboard, focus visibility, screen-reader labeling, contrast, phone, and desktop review in `specs/001-fantasy-power-rankings/checklists/accessibility.md`
- [X] T054 Execute every command and failure-preservation scenario in `specs/001-fantasy-power-rankings/quickstart.md` and record the final validation result in that file

**Checkpoint**: Every constitutional quality gate passes, a failed or incomplete Tuesday update
leaves the previous site untouched, and the exact validated artifact is deployable to GitHub Pages.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: No dependencies; begins immediately.
- **Phase 2 — Foundation**: Depends on Phase 1 and blocks every user story.
- **Phase 3 — US1**: Depends on Phase 2 and produces the MVP/current ranking surface.
- **Phase 4 — US2**: Core badge rules and component can start after Phase 2; T035 and T037 integrate
  with US1 files and therefore follow T023 and T026.
- **Phase 5 — US3**: Loader tests and navigation component can start after Phase 2; routes integrate
  with the current page and therefore T042–T044 follow T025 and T028.
- **Phase 6 — Polish**: Depends on all stories selected for release; deployment requires all three.

### User Story Dependency Graph

```text
Setup → Foundation → US1 (MVP)
                   ├── US2 core ──▶ US2 integration after US1
                   └── US3 core ──▶ US3 integration after US1

US1 + US2 + US3 → Polish → GitHub Pages release
```

### Within Each User Story

- Write tests and verify intended failures before implementation.
- Implement domain calculation/loading before components and pages.
- Build semantic content before visual polish.
- Pass the story's independent test before beginning its integration checkpoint.
- Commit after each task or coherent logical group on the feature branch.

### Parallel Opportunities

- T002–T006 can run in parallel after T001.
- T007–T009, T011, T013, and T016 touch independent foundational files.
- T019–T021 can be authored in parallel before US1 implementation.
- T030–T033 can run in parallel after the foundation.
- T039–T041 can run in parallel after the foundation.
- T045–T047, T050, and T051 touch independent cross-cutting files.
- After Phase 2, separate contributors can develop US1, US2 core, and US3 core concurrently while
  respecting the integration dependencies above.

---

## Parallel Example: User Story 1

```text
Task T019: Write movement tests in tests/unit/movement.test.ts
Task T020: Write edition generation tests in tests/integration/generate-edition.test.ts
Task T021: Write current-ranking browser tests in tests/e2e/current-ranking.spec.ts
```

## Parallel Example: User Story 2

```text
Task T030: Write badge rule tests in tests/unit/badges.test.ts
Task T031: Write badge browser tests in tests/e2e/badges.spec.ts
Task T032: Define the badge catalog in src/lib/badges/catalog.ts
Task T033: Create badge assets in public/assets/badges/
```

## Parallel Example: User Story 3

```text
Task T039: Write edition-loader tests in tests/unit/edition-loader.test.ts
Task T040: Write history browser tests in tests/e2e/history.spec.ts
Task T041: Build navigation in src/components/WeekNavigation.astro
```

---

## Implementation Strategy

### MVP First: User Story 1

1. Complete Setup and Foundation.
2. Write and fail the US1 tests.
3. Implement current-edition generation and rendering.
4. Stop and run the US1 independent test.
5. Demonstrate the static current-ranking page before adding badges or history.

### Incremental Delivery

1. **Foundation**: validated public ESPN adapter and commissioner/edition contracts.
2. **US1**: current rankings with commissioner ordering and score context — MVP.
3. **US2**: deterministic badges and accessible explanations.
4. **US3**: immutable historical routes and week navigation.
5. **Polish**: complete accessibility, security, performance, CI, and Pages deployment gates.

### Parallel Team Strategy

After the shared foundation is complete:

- Contributor A implements US1 and owns edition integration.
- Contributor B implements US2 badge rules, assets, and isolated component tests.
- Contributor C implements US3 loader tests and navigation.
- Contributors B and C integrate after Contributor A stabilizes edition loading and RankingCard.

## Notes

- `[P]` means different files and no incomplete-task dependency.
- Story labels provide traceability to the specification.
- Fixture tests never depend on live ESPN availability or consume credentials.
- The site never substitutes standings or a calculated ranking for commissioner input.
- Generated edition snapshots and commissioner inputs are reviewed and committed together.
- The deploy job never rebuilds or mutates the validated Pages artifact.
