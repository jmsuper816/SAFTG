---
description: 'Implementation tasks for the quippy weekly summary feature'
---

# Tasks: Quippy Weekly Summary

**Input**: Design documents from `/specs/005-weekly-summary/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Contract, unit, integration, browser, accessibility, and failure-path tests are included because the specification explicitly requires evidence traceability, fail-closed publication, approval invalidation, responsive behavior, and regression protection.

**Organization**: Tasks are grouped by user story after the shared evidence, generation, digest, and approval foundation is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes a separate file and does not depend on unfinished work
- **[Story]**: Maps the task to a prioritized user story in `spec.md`
- Every task includes the exact implementation or validation path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the server-only generation dependency and protect generation secrets/private notes before recap code is introduced.

- [X] T001 Add the pinned official OpenAI JavaScript SDK dependency and lockfile changes for the Node-only draft command in package.json and package-lock.json
- [X] T002 [P] Document `OPENAI_API_KEY` plus non-secret recap model/timeout settings without making them mandatory for ordinary builds in .env.example and src/lib/recaps/config.ts
- [X] T003 [P] Exclude raw commissioner recap notes while keeping committed evidence and approved recaps trackable in .gitignore

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the shared contracts, closed-evidence generator boundary, canonical approval digest, and fail-closed editorial commands required by every story.

**⚠️ CRITICAL**: No user-story production work begins until this phase passes its contract, digest, and workflow tests.

### Foundational Tests

> Write these tests first and verify they fail before implementing the shared foundation.

- [X] T004 [P] Add recap contract tests covering `schemaVersion: 1`, exact edition identity, cutoff ordering, unique IDs, official publishers, HTTPS URLs, `started|bench`, finite points, paragraphs “1–6” with each “1–1,000 characters,” evidence references, generation metadata, and nullable approval in tests/contract/recap.test.ts
- [X] T005 [P] Add canonical SHA-256 tests for sorted object keys, authored array order, stable unchanged inputs, excluded audit timestamps/request IDs, and invalidation by edition facts, evidence, note digests, prompt/schema/model versions, references, or prose in tests/unit/recap-digest.test.ts
- [ ] T006 [P] Add editorial workflow tests for draft → approve → verify, atomic failure/no overwrite, missing recap, draft recap, stale approval, refusal/incomplete output, unknown IDs, timeout/authentication failures, and zero live requests in tests/integration/recap-workflow.test.ts

### Foundational Implementation

- [X] T007 Define `RecapEvidenceManifest`, `LineupEvidence`, `FootballNewsSource`, `WeeklyRecap`, `EvidenceReference`, `GenerationMetadata`, and `Approval` types with the field relationships from data-model.md in src/lib/recaps/types.ts
- [X] T008 Implement Zod schemas and cross-record validation for all data-model constraints, including `(previous,current]` timestamps, one-to-one edition identity, team/fact/source references, paragraph indices, blocking warnings, and started-versus-bench semantics in src/lib/recaps/schemas.ts
- [X] T009 [P] Implement the allowlisted official NFL/team publisher registry and HTTPS hostname validation in src/lib/recaps/publishers.ts
- [X] T010 Implement deterministic edition fact projection, canonical JSON serialization, input digest, approval-envelope digest, and derived draft/approved/invalidated status in src/lib/recaps/digest.ts
- [ ] T011 Implement the injectable recap generator, closed fact-packet/prompt assembly, strict `{ paragraphs, evidenceRefs, warnings }` validation, `store: false`, 90-second attempt timeout, maximum two SDK retries, three-minute total deadline, and provider error classification in src/lib/recaps/generator.ts
- [X] T012 Implement one-to-one evidence/recap loading, orphan detection, current-digest verification, approved-paragraph projection, and actionable edition-specific failures in src/lib/recaps/load.ts
- [X] T013 Implement atomic draft generation that validates evidence and local note digests before calling the injected generator and preserves any approved artifact on failure in scripts/generate-recap.ts
- [X] T014 Implement atomic commissioner approval that rejects stale inputs/blocking warnings and writes the exact recomputed content digest in scripts/approve-recap.ts
- [X] T015 Implement network-free single-edition/all-edition verification plus `recap:draft`, `recap:approve`, and `recap:verify` commands in scripts/verify-recaps.ts and package.json

**Checkpoint**: Shared recap artifacts can be validated, drafted with a fake client, approved, invalidated by relevant changes, and verified without network access.

---

## Phase 3: User Story 1 - Read the Week at a Glance (Priority: P1) 🎯 MVP

**Goal**: Render an approved, edition-specific, multi-paragraph recap beneath a short divider immediately after the publication date on current and historical pages.

**Independent Test**: With approved recap fixtures for current and historical editions, open `/` and `/weeks/1/`; verify the divider and ordered paragraphs appear after the date and before navigation, differ by edition, expose no audit/private data, and leave 404 plus existing rankings behavior unchanged.

### Tests for User Story 1

> Add these assertions first and verify they fail before production rendering changes.

- [X] T016 [P] [US1] Add current-page tests for exact recap association, semantic divider/paragraph order after `<time>`, placement before week navigation, and absence of recap metadata/runtime provider requests in tests/e2e/current-ranking.spec.ts
- [X] T017 [P] [US1] Add historical tests for distinct Week 1/Week 2 approved paragraphs, selected-edition isolation, and unchanged historical navigation/ranking order in tests/e2e/history.spec.ts
- [ ] T018 [P] [US1] Add loader tests for exactly one approved/current recap per edition and rejection of missing, orphaned, duplicate, draft, or stale artifacts using temporary roots in tests/unit/recap-loader.test.ts
- [X] T019 [P] [US1] Extend axe, 320 CSS-pixel, 200%-text-size, and no-horizontal-overflow coverage to the divider and multi-paragraph recap in tests/e2e/accessibility.spec.ts

### Implementation for User Story 1

- [X] T020 [US1] Join the latest edition to its verified approved recap and render a decorative short rule plus ordered paragraphs after the date and before `WeekNavigation` in src/pages/index.astro
- [X] T021 [P] [US1] Join each historical edition to its verified approved recap and render the same edition-isolated structure in src/pages/weeks/[week].astro
- [X] T022 [US1] Add theme-consistent divider and recap spacing/typography that reflows at 320 CSS pixels and 200% text while preserving hero contrast in src/styles/global.css
- [ ] T023 [US1] Add approved league-result-only recap fixtures for independent current/history UI testing without external or provider requests in tests/fixtures/recaps/

**Checkpoint**: User Story 1 is independently demonstrable with fixture artifacts and no football-news or personal-context claims.

---

## Phase 4: User Story 2 - Connect Football News to League Results (Priority: P2)

**Goal**: Generate reviewable recap drafts from official-source evidence and verified started/bench facts, with every factual paragraph traceable and unsupported causation rejected.

**Independent Test**: Feed a known edition, official news records, and verified lineup evidence through a fake generator; verify factual paragraphs resolve to supplied IDs, starter impact and bench opportunity remain distinct, invalid/out-of-window sources fail, and provider failure leaves approved content untouched.

### Tests for User Story 2

> Add these evidence-specific tests first and verify they fail before implementing the story.

- [ ] T024 [P] [US2] Add valid NFL/team source fixtures plus unsupported-host, bad-window, correction-timestamp, duplicate-ID, unknown-team, started-impact, and benched-opportunity cases in tests/fixtures/recaps/news-evidence.ts
- [ ] T025 [P] [US2] Add generation tests that require factual paragraph references, reject invented IDs/names/numbers and unsupported causation, distinguish counted starter points from bench opportunities, and allow league-only copy when no reliable news connection exists in tests/unit/recap-generator.test.ts
- [ ] T026 [US2] Extend workflow tests for official-source intake validation, closed fact-packet generation, provider refusal/retry boundaries, and preservation of approved output on failure in tests/integration/recap-workflow.test.ts

### Implementation for User Story 2

- [X] T027 [US2] Extend fact-packet and prompt assembly with official source metadata, edition facts, verified roster/lineup evidence, started-impact versus benched-opportunity instructions, evidence-link requirements, and the supplied tone example in src/lib/recaps/generator.ts
- [X] T028 [US2] Create authoritative Week 1 and Week 2 manifests with explicit first/prior cutoffs, allowlisted official source records, original paraphrases, verified player/team/lineup facts, and no copied article bodies in data/recap-inputs/2026/week-01.json and data/recap-inputs/2026/week-02.json
- [X] T029 [US2] Generate, fact-check, edit, and commissioner-approve distinct Week 1 and Week 2 recap artifacts with every factual paragraph linked to known fact/source IDs in data/recaps/2026/week-01.json and data/recaps/2026/week-02.json

**Checkpoint**: User Story 2 is independently complete when both production editions verify, every football claim is traceable to official evidence, and no browser/build request fetches news or generates prose.

---

## Phase 5: User Story 3 - Enjoy Personalized League Banter (Priority: P3)

**Goal**: Allow optional commissioner-context callbacks while keeping raw notes private, claims supported, tone bounded, and approval invalidated whenever note context changes.

**Independent Test**: Generate from a fixture containing verified league history plus a private note; verify only the note digest and approved resulting prose are committed/rendered, unsupported or hostile personal claims are rejected or warned, and changing the note invalidates approval.

### Tests for User Story 3

> Add these privacy and tone tests first and verify they fail before implementing note support.

- [ ] T030 [P] [US3] Add private-note digest, missing/mismatched note, note-change invalidation, raw-note exclusion, optional-no-callout, and supported-callout fixtures/tests in tests/unit/recap-notes.test.ts
- [ ] T031 [P] [US3] Add generation contract tests that require personal callouts to reference verified league history or commissioner context and surface hateful, threatening, sexual, demeaning, or unsupported output as blocking warnings in tests/unit/recap-generator.test.ts

### Implementation for User Story 3

- [X] T032 [US3] Implement ignored local note loading, SHA-256 verification, minimum necessary prompt inclusion, and raw-note exclusion from logs/artifacts in src/lib/recaps/notes.ts and scripts/generate-recap.ts
- [X] T033 [US3] Review Week 1 and Week 2 for supported league-specific callbacks, update only appropriate approved paragraphs/evidence references, and reapprove changed artifacts in data/recaps/2026/week-01.json and data/recaps/2026/week-02.json

**Checkpoint**: User Story 3 is complete when callbacks are optional, supported, commissioner-approved, non-hostile, and raw notes cannot reach committed or generated public artifacts.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Integrate recap verification into delivery, document the editorial workflow, and validate the complete static artifact.

- [X] T034 [P] Add all-edition network-free recap verification before builds while preserving pinned actions, least-privilege permissions, and exact-artifact deployment in .github/workflows/ci.yml and .github/workflows/pages.yml
- [X] T035 [P] Document official-source evidence entry, private notes, real/fake draft generation, commissioner editing/approval, correction/reapproval, verification, and secret setup in README.md
- [ ] T036 Extend artifact scanning assertions so raw notes, evidence/source metadata, digests, provider/request metadata, and `OPENAI_API_KEY` cannot appear in `dist/` in tests/integration/generate-edition.test.ts
- [X] T037 Run the complete format, lint, typecheck, unit/integration, recap verification, static build, link, artifact-secret, and desktop/mobile Playwright gates from specs/005-weekly-summary/quickstart.md
- [ ] T038 Conduct the five-member comprehension/tone review and record whether at least four identify the main storyline and a football-to-fantasy connection, at least four rate the recap fun and league-specific, and nobody flags a callout as hostile or unsupported in specs/005-weekly-summary/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately; T002 and T003 can proceed after T001 starts because they touch separate files.
- **Foundational (Phase 2)**: Depends on setup and blocks every user story. Write T004–T006 before T007–T015.
- **User Story 1 (Phase 3)**: Starts after foundational completion and establishes static loading/presentation.
- **User Story 2 (Phase 4)**: Starts after US1 so production evidence/recaps can use the finished loader and UI contract.
- **User Story 3 (Phase 5)**: Starts after US2 because personal context extends the evidence-controlled generator and may require recap reapproval.
- **Polish (Phase 6)**: Starts after all desired stories are complete.

### User Story Dependencies

- **US1 (P1)**: Depends only on the foundational artifact/approval pipeline; it is the suggested MVP and is independently testable with approved fixtures.
- **US2 (P2)**: Uses the US1 recap projection but remains independently testable through evidence/generator fixtures.
- **US3 (P3)**: Extends US2 generation with optional private commissioner context; absence of a suitable callback remains valid.

### Within Each User Story

- Write the story's tests first and confirm they fail for the intended missing behavior.
- Implement schema/service changes before CLI or page integration that consumes them.
- Generate or edit recap data only after its validation and approval tooling passes.
- Run the focused story tests at each checkpoint and commit coherent tested groups.

### Parallel Opportunities

- T002 and T003 can run in parallel after dependency installation.
- T004, T005, and T006 can be authored in parallel before foundational implementation.
- T009 can run alongside T010 once shared types exist.
- T016–T019 can be authored in parallel because they change separate test files.
- T021 can run in parallel with T020 after loader behavior is available; T023 can be prepared alongside UI styling.
- T024 and T025 can run in parallel before T026.
- T030 and T031 can run in parallel.
- T034 and T035 can run in parallel after all stories are complete.

---

## Parallel Example: User Story 1

```text
Task T016: Current-page recap contract in tests/e2e/current-ranking.spec.ts
Task T017: Historical recap isolation in tests/e2e/history.spec.ts
Task T018: Recap loader coverage in tests/unit/recap-loader.test.ts
Task T019: Responsive/accessibility recap coverage in tests/e2e/accessibility.spec.ts
```

## Parallel Example: User Story 2

```text
Task T024: Official-source and lineup fixtures in tests/fixtures/recaps/news-evidence.ts
Task T025: Evidence-constrained generation tests in tests/unit/recap-generator.test.ts
```

## Parallel Example: User Story 3

```text
Task T030: Private-note lifecycle tests in tests/unit/recap-notes.test.ts
Task T031: Personal-callout safety tests in tests/unit/recap-generator.test.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete setup and the full shared evidence/digest/approval foundation.
2. Add failing loader/current/history/accessibility tests for US1.
3. Render approved fixture recaps beneath the date on current and historical pages.
4. Stop and validate distinct edition content, ordering, static behavior, reflow, and regressions.

### Incremental Delivery

1. Deliver the shared fail-closed recap lifecycle.
2. Add US1 presentation using approved fixture artifacts.
3. Add US2 official-news and verified-lineup evidence, then generate and approve production backfills.
4. Add US3 optional private-note callbacks and reapprove only changed content.
5. Integrate workflow gates, documentation, artifact checks, and human review before merge.

### Parallel Team Strategy

1. Complete shared contracts and digest behavior together because all stories depend on them.
2. Parallelize different test files and current/historical page templates where marked `[P]`.
3. Keep generator, approval, and recap artifact edits sequential because they share digest contracts.
4. Treat commissioner review/approval and human tone review as explicit release gates, not automated claims.

---

## Notes

- `[P]` tasks modify different files and have no dependency on incomplete work.
- `[US1]`, `[US2]`, and `[US3]` map directly to prioritized stories in `spec.md`.
- Ordinary builds and tests must never require `OPENAI_API_KEY` or perform live news/provider requests.
- Raw commissioner notes remain ignored; only digests and commissioner-approved prose may be committed.
- Do not copy NFL/team article bodies or imagery; store original factual paraphrases and source metadata.
- Commit each coherent tested behavior early on `005-quippy-summary`; squash merge the reviewed feature to main.
