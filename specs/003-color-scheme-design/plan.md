# Implementation Plan: Football Color Scheme and Design

**Branch**: `003-color-scheme-design` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-color-scheme-design/spec.md`

## Summary

Restyle every current, historical, empty, and not-found view around the supplied teal, cyan,
hot-pink, off-white, and deep-blue football artwork while preserving the static Astro architecture.
Add optimized local portrait and landscape assets, select them from viewport orientation without
JavaScript, place the selected art in a fixed decorative layer with a readability tint, centralize
semantic colors in the global stylesheet, and expose explicit movement-state classes. Extend tests
for orientation, contrast, reflow, zoom, focus, non-color cues, and asset failure.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Astro 7.3.4, CSS

**Primary Dependencies**: Astro static generation; no new runtime dependency

**Storage**: Checked-in assets under `src/assets/backgrounds/`; no application data changes

**Testing**: Vitest 5.0.2; Playwright with axe-core; existing format, lint, type, build, link, and
secret checks

**Target Platform**: Static GitHub Pages site under a repository base path; modern desktop and
mobile browsers including iOS/WebKit

**Project Type**: Static web application

**Performance Goals**: Request only the art matching the active orientation; add no theme
JavaScript; avoid layout shift; compress art so ranking content is not materially delayed

**Constraints**: Static output; base-path-safe local assets; fixed art on long pages; portrait when
height exceeds width and landscape otherwise; 320 CSS-pixel reflow; 200% zoom; WCAG 2.2 AA;
existing semantics and behavior preserved

**Scale/Scope**: One layout, one global stylesheet, four reusable components, current/historical,
empty, and 404 views, two background assets, and the existing 16-team data

## Constitution Check

_Evaluated before research and again after design._

| Gate | Design response | Status |
|---|---|---|
| Static output | CSS, images, and pages are static; orientation selection is CSS-only. | PASS |
| Build-time external data | No API or edition-generation change. | PASS |
| Secrets | No credential or environment value introduced; secret scan retained. | PASS |
| Reproducible builds | Both artworks are versioned inputs and dependencies remain locked. | PASS |
| GitHub Pages | Build-managed URLs honor `/SAFTG`; link/artifact checks retained. | PASS |
| Feature workflow | Work remains on `003-color-scheme-design`, with logical commits and squash merge. | PASS |
| Accessibility/responsiveness | Contrast, non-color cues, focus, orientation, zoom, and reflow are validated. | PASS |
| Quality gates | Format, lint, type, tests, build, links, assets, and secrets are in quickstart. | PASS |

**Post-design re-check**: PASS. There is no server runtime, runtime API call, secret, or base-path
exception. A fixed decorative layer avoids unreliable mobile fixed-background attachment without
client JavaScript. No constitutional exception is required.

## Project Structure

### Documentation (this feature)

```text
specs/003-color-scheme-design/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── visual-theme-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── assets/backgrounds/
│   ├── football-landscape.webp
│   └── football-portrait.webp
├── components/RankingCard.astro   # semantic movement classes
├── layouts/BaseLayout.astro       # shared layout boundary
└── styles/global.css              # tokens, fixed art, component theme

tests/
├── unit/theme-contrast.test.ts
└── e2e/
    ├── accessibility.spec.ts
    └── theme.spec.ts
```

**Structure Decision**: Retain the single Astro project. Centralize styling in `global.css`, which
already reaches every route through `BaseLayout`. Change only `RankingCard.astro` markup to expose
up/down/neutral/new state classes. Keep artwork in `src/assets` so Astro fingerprints it and emits
base-path-safe URLs.

## Design Decisions

### Background composition

- Encode both supplied compositions as optimized WebP while retaining aspect ratio.
- Use a fixed, full-viewport decorative layer rather than unreliable
  `background-attachment: fixed` on iOS.
- Select art with orientation media queries; square viewports use landscape.
- Use centered `cover`, no repeat, deep-teal fallback, and a separate dark static overlay.
- Ensure only the matching orientation asset downloads; do not preload both.

### Palette and states

- Replace legacy literals with semantic tokens from [data-model.md](data-model.md).
- Use stable deep-teal surfaces so contrast never depends on the artwork crop.
- Use cyan for up and hot pink for down, retaining arrows and explicit state classes.
- Use off-white primary text, tested pale secondary text, and a two-color focus treatment.

### Validation

- Preserve existing behavior suites as regression protection.
- Calculate contrast for every approved foreground/surface token pair.
- Test portrait, landscape, square, rotation, fixed art, one selected request, local URLs, and
  blocked-art fallback.
- Test 320-pixel reflow, 200% resize, long content, expanded badges, focus, non-color cues, and
  reduced motion.
- Complete the manual matrix in [quickstart.md](quickstart.md); crop and composited-art readability
  require human review.

## Complexity Tracking

No constitutional violations or additional project layers are required.
