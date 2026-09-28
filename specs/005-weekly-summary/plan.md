# Implementation Plan: Quippy Weekly Summary

**Branch**: `005-quippy-summary` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-weekly-summary/spec.md`

## Summary

Add an approved multi-paragraph weekly recap beneath each edition date, separated by a short rule.
Keep editorial evidence and recap output in separate committed JSON artifacts linked to the existing
edition. A Node-only command assembles validated league facts, commissioner-provided lineup evidence,
official NFL/team source metadata, and private commissioner notes into a strict structured generation
request. A separate command approves the exact draft and its canonical supporting-input digest. Static
builds perform no live news or generation requests and fail unless every edition has a valid, current,
approved recap.

## Technical Context

**Language/Version**: Node.js 24+, TypeScript 6.0.3, Astro 7.3.4, HTML, CSS

**Primary Dependencies**: Existing Astro and Zod stack; official OpenAI JavaScript SDK using the
Responses API and strict Structured Outputs for the draft-only CLI

**Storage**: Committed JSON evidence manifests in `data/recap-inputs/{season}/`, committed approved
recap artifacts in `data/recaps/{season}/`, and ignored local commissioner notes outside published
artifacts

**Testing**: Vitest contract/unit/integration suites with fake generation clients and local fixtures;
Playwright desktop/mobile accessibility and regression suites; no routine live ESPN, NFL, team, or
OpenAI requests

**Target Platform**: Static GitHub Pages site built in GitHub Actions; editorial commands run locally
or in a trusted secret-bearing workflow before approved artifacts are committed

**Project Type**: Static web application with build-time/editorial CLIs

**Performance Goals**: Static builds add no external request and negligible per-edition validation;
draft generation uses one non-streaming request with a 90-second attempt timeout, at most two SDK
retries, and a three-minute total deadline

**Constraints**: Official NFL/team sources only; no automated site scraping; source window
`(previous cutoff, current cutoff]`; original paraphrases only; started versus benched impact must be
explicit; every edition requires an approved recap; any relevant input/text change invalidates
approval; `OPENAI_API_KEY` remains server-side and generated output remains static

**Scale/Scope**: Backfill two 2026 editions, then one evidence manifest and recap artifact per weekly
edition; typically 3–6 paragraphs and a small selected set of facts/sources rather than an exhaustive
NFL digest

## Constitution Check

_Evaluated before Phase 0 research and re-evaluated after Phase 1 design._

| Gate | Design response | Status |
|---|---|---|
| Static output | Browsers receive approved recap HTML only; no runtime API or generation request is added. | PASS |
| External data | News discovery and prose generation are explicit editorial steps; builds consume validated committed artifacts and never silently fall back. | PASS |
| Secrets | `OPENAI_API_KEY` is environment-only, used by a Node CLI, excluded from JSON/logs/browser code, and covered by source/artifact scans. | PASS |
| Reproducibility | Canonical digests bind edition facts, evidence, prompt/schema/model versions, private-note digests, and exact text; ordinary builds are network-independent. | PASS |
| GitHub Pages | Rendering remains static and base-path safe with no server or rewrite dependency. | PASS |
| Feature workflow | Work stays on `005-quippy-summary`, uses focused commits, and enters main through squash merge. | PASS |
| Accessibility/responsiveness | Semantic rule/paragraph markup, contrast, 320-pixel reflow, 200% text, and axe checks are release gates. | PASS |
| Delivery quality | Contract, digest, lifecycle, CLI, loader, E2E, build, link, and secret gates are included. | PASS |

**Post-design re-check**: PASS. The design avoids live scraping and request-time behavior, keeps raw
commissioner notes and credentials outside public artifacts, fails closed on stale approval, and adds
no constitutional exception.

## Project Structure

### Documentation (this feature)

```text
specs/005-weekly-summary/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── recap-artifacts.md
│   ├── recap-cli.md
│   └── recap-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
data/
├── recap-inputs/2026/
│   ├── week-01.json
│   └── week-02.json
└── recaps/2026/
    ├── week-01.json
    └── week-02.json

src/lib/recaps/
├── schemas.ts
├── types.ts
├── digest.ts
├── generator.ts
└── load.ts

src/pages/index.astro
src/pages/weeks/[week].astro
src/styles/global.css

scripts/
├── generate-recap.ts
├── approve-recap.ts
└── verify-recaps.ts

tests/
├── contract/recap.test.ts
├── unit/recap-digest.test.ts
├── unit/recap-loader.test.ts
├── integration/recap-workflow.test.ts
├── fixtures/recaps/
└── e2e/
    ├── current-ranking.spec.ts
    ├── history.spec.ts
    └── accessibility.spec.ts
```

**Structure Decision**: Keep the single Astro project and existing edition schema stable. Store
editorial evidence separately from generated/approved copy so ranking regeneration cannot overwrite
approval and private inputs cannot leak into editions. Join recaps to editions by immutable
`editionId` in the loader, then pass only approved paragraphs to current and historical templates.

## Design Decisions

### Evidence collection and source boundary

- Do not scrape NFL or team pages during generation or deployment. A commissioner records a canonical
  official URL, publisher, displayed publication/update timestamp, original factual paraphrase, and
  affected subjects in a committed evidence manifest.
- Maintain an allowlisted official publisher registry; reject unsupported hosts, non-HTTPS URLs,
  missing timestamps, duplicate IDs, and items outside `(previous cutoff, current cutoff]`.
- Record verified fantasy evidence as structured started-player impact or benched-player opportunity,
  including team/player identity, lineup status, fantasy points, observed statement, and related fact
  IDs. The model receives only this curated packet and may not browse.
- Raw commissioner notes live in an ignored local input path. Commit only their SHA-256 digests; the
  generated approved prose is public, but raw notes never enter the edition or static artifact.

### Draft generation and approval

- Use the official server-side OpenAI SDK with a single non-streaming Responses API request,
  `store: false`, strict JSON Schema output, bounded timeout/retries, and no web tools.
- Require `{ paragraphs, evidenceRefs, warnings }`; validate paragraph bounds and ensure every returned
  fact/source reference exists in the supplied packet. A refusal, incomplete response, unknown ID,
  timeout, authentication error, or schema failure exits nonzero and leaves any approved recap intact.
- Pin and record the evaluated model identifier, prompt version, schema version, response model, and
  request ID. Exact prose need not be reproducible; commissioner approval is the content release gate.
- `recap:approve` computes a canonical SHA-256 digest over the versioned edition fact projection,
  evidence manifest, note digests, prompt/schema/model configuration, evidence references, and exact
  paragraph order/text. Generation and approval timestamps are excluded from the digest.
- Approval is current only when the stored digest equals the recomputed digest. A mismatch derives an
  invalidated state and blocks verification until the revised draft is explicitly reapproved.

### Static loading and presentation

- `recap:verify --all` and the recap loader require exactly one current approved recap for every
  edition, including backfilled Weeks 1 and 2. Missing, malformed, draft, stale, or orphaned artifacts
  fail closed before static rendering.
- Current and historical templates render a semantic short divider followed by ordered recap
  paragraphs inside the existing hero, immediately after `<time>` and before week navigation.
- Only paragraphs are rendered. Evidence, source metadata, generation metadata, approval identity,
  note digests, and request IDs stay out of the public page.

### Validation

- Contract tests cover bounds, enums, official publishers, HTTPS URLs, cutoff windows, team/fact/source
  references, paragraph/evidence linkage, and draft/approval shapes.
- Unit tests cover canonical ordering, stable hashes, array-order preservation, and invalidation for
  every recap-relevant input class without leaking raw notes or secrets.
- CLI integration tests cover draft → edit → approve → verify, atomic failure behavior, missing/stale
  recap rejection, refusal/incomplete generation, and mocked retry/error classification.
- E2E tests cover current/history-specific paragraphs, source order beneath the date, semantic markup,
  no runtime requests, 320-pixel reflow, 200% text, and all existing rankings/badges/navigation/theme
  behavior.

## Complexity Tracking

No constitutional violation requires justification. The added editorial CLI and separate artifact are
the minimum boundary needed to keep nondeterministic prose generation and private notes out of the
reproducible static build.
