# Implementation Plan: Weekly Fantasy Football Power Rankings

**Branch**: `001-fantasy-power-rankings` | **Date**: 2026-09-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-fantasy-power-rankings/spec.md`

## Summary

Build a playful, accessible Astro static site that publishes commissioner-authored weekly power
rankings, enriches them with public ESPN league results and deterministic badges, preserves each
validated edition as version-controlled content, and deploys the exact tested artifact to GitHub
Pages. A weekly edition is generated only when the commissioner submission and finalized ESPN data
both validate; otherwise the prior deployed edition remains current.

## Technical Context

**Language/Version**: TypeScript 6.x on Node.js 24 LTS; Astro component templates and modern CSS

**Primary Dependencies**: Astro 7.x, Zod 4.x, Vitest 5.x, Playwright, and axe-core for Playwright;
all exact versions resolved and pinned by `package-lock.json`

**Storage**: Version-controlled JSON commissioner submissions and normalized edition snapshots;
no database, browser persistence, or runtime storage

**Testing**: Vitest unit, schema-contract, and integration suites using fixtures; Playwright
built-site journeys; axe automated scans plus documented manual keyboard and semantic review

**Target Platform**: Static HTML/CSS/JavaScript on GitHub Pages, generated on GitHub-hosted Linux
runners and usable in current evergreen desktop and mobile browsers

**Project Type**: Single static web application with a build-time data-ingestion command

**Performance Goals**: Generate and validate one league season in under 5 minutes on a standard
GitHub-hosted runner; render each ranking page without client-side data fetching; keep initial page
JavaScript at zero unless progressive enhancement is required for badge details

**Constraints**: No application server or runtime API calls; repository Pages base path support;
ESPN source is undocumented and must be isolated, validated, retried with bounded attempts, and
fail closed; all published data is public; historical editions must remain reproducible

**Scale/Scope**: One league, one active season, up to 20 teams, up to 25 weekly editions per season,
seven initial badge definitions, and historical pages beginning at launch

## Constitution Check

_GATE: Passed before Phase 0 research and re-checked after Phase 1 design._

| Constitutional requirement               | Design evidence                                                                                | Status |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- | ------ |
| Static output is the product             | Astro static mode emits only `dist/` assets; no server adapter or runtime database             | PASS   |
| External data is acquired at build time  | `edition:generate` retrieves ESPN data before rendering and materializes a validated snapshot  | PASS   |
| Secrets never reach published artifacts  | Public ESPN league access requires no credentials; schemas reject unrelated upstream fields    | PASS   |
| Builds are reproducible and fail clearly | Lockfile, fixtures, committed edition snapshots, schema validation, and fail-closed generation | PASS   |
| GitHub Pages compatibility               | Configured `site`/`base`, static week routes, direct-load tests, and Pages artifact deployment | PASS   |
| Feature branch and squash merge          | Work remains on `001-fantasy-power-rankings`; focused commits precede a squash-merge PR        | PASS   |
| API validation and testing               | Adapter contract tests cover valid, malformed, incomplete, unavailable, and changed responses  | PASS   |
| Accessibility and responsive behavior    | Semantic-first pages, keyboard testing, axe scans, and phone/desktop journey checks            | PASS   |
| Deployment quality gates                 | Lint, type check, tests, build, link check, secret scan, then immutable artifact deployment    | PASS   |

### Post-Design Re-check

The data model retains only public, normalized fields; contracts fail closed on incomplete inputs;
the quickstart validates the repository base path and generated artifact; and deployment separates
build from deploy without rebuilding. No constitutional exceptions or complexity waivers are
required.

## Project Structure

### Documentation (this feature)

```text
specs/001-fantasy-power-rankings/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── commissioner-ranking.schema.json
│   ├── edition.schema.json
│   └── espn-adapter.md
└── tasks.md
```

### Source Code (repository root)

```text
data/
├── editions/
│   └── {season}/week-{NN}.json
└── rankings/
    └── {season}/week-{NN}.json

public/
└── assets/
    └── badges/

scripts/
└── generate-edition.ts

src/
├── components/
│   ├── Badge.astro
│   ├── RankingCard.astro
│   └── WeekNavigation.astro
├── layouts/
│   └── BaseLayout.astro
├── lib/
│   ├── badges/
│   │   ├── catalog.ts
│   │   └── evaluate.ts
│   ├── domain/
│   │   ├── schemas.ts
│   │   └── types.ts
│   ├── editions/
│   │   ├── load.ts
│   │   └── normalize.ts
│   └── espn/
│       ├── client.ts
│       ├── normalize.ts
│       └── schema.ts
├── pages/
│   ├── 404.astro
│   ├── index.astro
│   └── weeks/
│       └── [week].astro
└── styles/
    └── global.css

tests/
├── contract/
│   ├── commissioner-ranking.test.ts
│   ├── edition.test.ts
│   └── espn-adapter.test.ts
├── e2e/
│   ├── accessibility.spec.ts
│   ├── current-ranking.spec.ts
│   └── history.spec.ts
├── fixtures/
│   ├── editions/
│   └── espn/
├── integration/
│   └── generate-edition.test.ts
└── unit/
    ├── badges.test.ts
    └── movement.test.ts
```

**Structure Decision**: Use one Astro project. Commissioner inputs and immutable normalized editions
are distinct so editorial intent is auditable while page rendering never consumes undocumented ESPN
payloads. ESPN-specific behavior is contained under `src/lib/espn/`; all presentation consumes the
stable edition contract.

## Delivery Design

1. The commissioner adds `data/rankings/{season}/week-{NN}.json` on a focused branch.
2. `npm run edition:generate -- --season <year> --week <number>` fetches the public ESPN league with
   timeout and bounded retry, validates finalized results, validates full commissioner coverage,
   calculates badges and movement, and writes the normalized edition snapshot.
3. The commissioner reviews and commits both the ranking input and generated snapshot through a PR.
4. CI runs formatting, type checks, fixture tests, snapshot regeneration verification, a static
   production build under the repository base path, browser journeys, accessibility checks, link
   validation, and a secret scan.
5. After squash merge, the Pages workflow builds once, uploads `dist/`, and deploys that exact
   artifact. A Tuesday schedule validates whether the expected edition exists and deploys only a
   complete edition; manual dispatch provides recovery.
6. Later ESPN stat corrections require a new reviewed snapshot commit; prior edition history never
   changes silently.

## Complexity Tracking

No constitution violations require justification.
