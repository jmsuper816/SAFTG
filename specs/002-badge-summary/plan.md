# Implementation Plan: Badge Summary

**Branch**: `002-badge-enhancements` | **Date**: 2026-09-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-badge-summary/spec.md`

## Summary

Add an edition-level badge summary between week navigation and ranking cards on current and
historical pages. A pure grouping function joins stored awards to the badge catalog and ranked
teams, rejects invalid references, and returns catalog-ordered groups with recipients in ranking
order. A shared static component renders each group as a native disclosure: badge name, week, and
recipients stay visible while descriptions and reasons expand without client JavaScript.

## Technical Context

**Language/Version**: TypeScript 6.0.3 on Node.js 24 LTS; Astro component templates

**Primary Dependencies**: Astro 7.3.4, Zod 4.6.5; no new runtime dependency

**Storage**: Existing committed weekly-edition JSON; summary groups are derived at build time

**Testing**: Vitest 5; Playwright with axe-core; existing format, lint, type-check, build, link, and
artifact-secret gates

**Target Platform**: Static HTML/CSS beneath a GitHub Pages project-site base path on desktop and
phone browsers

**Project Type**: Static web application

**Performance Goals**: Render at most seven groups and twenty recipients without perceptible page
delay; preserve the existing production build below the five-minute project gate

**Constraints**: No server, runtime data request, authentication, persistent UI state, or required
client JavaScript; direct historical routes and base-aware assets must continue to work

**Scale/Scope**: Current route plus every committed edition; seven catalog badges, 2–20 teams,
zero or more awards, tied winners, and multiple awards per team

## Constitution Check

_Gate evaluated before research and re-evaluated after Phase 1 design: PASS._

- **Static output**: PASS. Groups derive during static rendering; native disclosure needs no runtime.
- **Build-time data**: PASS. Only committed, validated editions are consumed; no external request.
- **Secrets**: PASS. Only public award content is rendered; artifact scanning remains mandatory.
- **Reproducibility**: PASS. Catalog and entry order determine output; invalid references fail the
  build before publication.
- **GitHub Pages**: PASS. Existing base-aware assets, direct routes, and link checks remain intact.
- **Feature workflow**: PASS. Work is isolated on `002-badge-enhancements`, uses logical commits,
  and must reach `main` through squash merge.
- **Accessibility/responsiveness**: PASS. Semantic headings, native disclosure state, text meaning,
  keyboard journeys, phone layouts, and automated scans are explicit gates.
- **Quality gates**: PASS. Unit/browser coverage plus all existing validation gates are required.

Post-design recheck: PASS. The model is a deterministic derived projection, the UI contract uses
semantic native controls, and the quickstart covers static output, accessibility, base paths, and
fail-closed validation. No constitutional exception is required.

## Project Structure

### Documentation (this feature)

```text
specs/002-badge-summary/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── badge-summary-ui.md
└── tasks.md                  # Created later by $speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Badge.astro
│   └── BadgeSummary.astro
├── lib/badges/
│   ├── catalog.ts
│   └── summary.ts
├── pages/
│   ├── index.astro
│   └── weeks/[week].astro
└── styles/global.css

tests/
├── unit/badge-summary.test.ts
├── e2e/badges.spec.ts
├── e2e/accessibility.spec.ts
└── fixtures/
```

**Structure Decision**: Extend the existing single Astro project. Keep projection in a pure library
function, presentation in one shared component, and integration at the two edition entry points.
No new persistence format, application layer, or client bundle is warranted.

## Complexity Tracking

No constitutional violations or complexity exceptions are required.
