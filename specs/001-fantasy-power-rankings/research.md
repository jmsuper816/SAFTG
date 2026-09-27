# Phase 0 Research: Weekly Fantasy Football Power Rankings

## Planning Gate: ESPN Team Power Rankings

**Decision**: The commissioner will provide the authoritative weekly team ranking as a
version-controlled input. ESPN remains authoritative for public league metadata, standings,
matchups, records, and scores used for context and badge calculation.

**Rationale**: ESPN's official material documents fantasy-player rankings, league standings,
matchups, box scores, and team pages, but no official documentation was found for a weekly,
league-team power-ranking feed. The commonly used community ESPN library method named
`power_rankings()` calculates its own two-step-dominance ranking from matchup results; it does not
retrieve an ESPN-authored team ranking. Treating that result as ESPN's authoritative ranking would
be misleading. A commissioner-authored input preserves editorial control, keeps ranking behavior
testable, and requires no server or private credential.

The Fantasy v3 league endpoint used by community integrations is undocumented and unsupported.
Observed responses can provide team identity, standings, schedules, matchups, scores, settings, and
status, but their schema and availability are not guaranteed. Any implementation MUST isolate this
source behind a validated adapter and fail closed when the response contract changes.

**Alternatives considered**:

- Calculate and clearly label a transparent site-owned ranking from ESPN matchup data. Rejected in
  favor of commissioner editorial control.
- Require a sample ESPN league response proving an ESPN-authored weekly team ranking exists.
  Rejected because no supported contract was found and it would block implementation.
- Substitute ESPN standings. Rejected because standings are not power rankings and the current
  specification explicitly prohibits inferred replacements.

**Sources**:

- ESPN league and team page guide:
  https://www.espn.com/fantasy/football/story/_/id/19541264/league-team-pages
- ESPN public-viewability guidance:
  https://support.espn.com/hc/en-us/articles/47160849553940-Making-a-Private-League-Public-LM-Only
- Community library calculation source:
  https://github.com/cwendt94/espn-api/blob/master/espn_api/football/league.py
- Community library method description:
  https://github.com/cwendt94/espn-api/wiki/League-Class
- Community description of the unsupported Fantasy endpoint:
  https://github.com/aaronweldy/espn-openapi/blob/main/spec-fantasy.yaml

## Static Site Stack

**Decision**: Use Astro in static-output mode with TypeScript, a committed npm lockfile, and the
active Node.js LTS release pinned in local and CI configuration.

**Rationale**: Astro prerenders pages by default, performs remote fetches at build time, supports
data-driven static routes for weekly history, and documents direct deployment to GitHub Pages. It
meets the constitution without adding a browser framework or server runtime.

**Alternatives considered**:

- Eleventy: viable and lightweight, with useful fetch caching, but requires more custom structure
  for typed schemas and component-oriented views.
- Vite alone: strong asset pipeline but no built-in data-driven static page generation.
- Next.js static export: capable but adds unnecessary framework and adapter complexity for this
  fully static, read-only site.

**Sources**:

- Astro build-time data fetching: https://docs.astro.build/en/guides/data-fetching/
- Astro routing and static paths: https://docs.astro.build/en/guides/routing/
- Astro GitHub Pages deployment: https://docs.astro.build/en/guides/deploy/github/

## Validation and Testing

**Decision**: Validate all external and persisted data at the adapter boundary with Zod; use Vitest
for unit and contract tests, Playwright for built-site journeys, and axe plus manual review for
accessibility.

**Rationale**: The ESPN source is unsupported and therefore requires strict runtime validation.
Fixture-based contract tests avoid consuming live quotas or depending on external availability.
Browser tests verify static routing, repository base paths, badge interaction, keyboard behavior,
and historical navigation against production-equivalent output.

**Alternatives considered**:

- Live ESPN calls in routine tests: rejected because they are nondeterministic and couple test
  reliability to an unsupported external service.
- Browser tests only: rejected because badge and normalization rules need focused boundary cases.
- Automated accessibility checks only: rejected because automated tools detect only part of the
  accessibility requirements.

**Sources**:

- Astro testing guidance: https://docs.astro.build/en/guides/testing/
- Playwright accessibility testing: https://playwright.dev/docs/accessibility-testing

## Historical Data and Failure Behavior

**Decision**: Commit normalized, non-sensitive weekly edition snapshots as immutable source data.
Generate all current and historical pages from those snapshots. A scheduled run stages a new
snapshot only after retrieval, schema validation, completeness checks, ranking validation, and
badge calculation all succeed.

**Rationale**: Preserved snapshots make historical editions reproducible even when ESPN changes old
data or its unsupported response schema. Failed or incomplete Tuesday builds deploy nothing, so the
last valid Pages artifact remains live. The snapshot contains only information intended for public
display and excludes upstream payloads, cookies, and manager identity data.

**Alternatives considered**:

- Re-fetch every historical week on every build: rejected because old editions could drift and
  builds would depend on the continued availability of all historical data.
- Commit raw ESPN responses: rejected because responses can contain unnecessary or sensitive
  metadata and create schema coupling.
- Browser storage: rejected because history must be consistent for all visitors and devices.

## GitHub Pages Delivery

**Decision**: Use one GitHub Actions workflow with distinct validation/build and deployment jobs.
Run it on the default branch after relevant changes, on a Tuesday schedule in the league timezone,
and through manual dispatch. Upload the validated `dist/` directory once with the Pages artifact
action; deploy that exact artifact from a dependent job.

**Rationale**: Separate jobs prevent rebuilding with different inputs. The build receives only
`contents: read`; deployment receives `pages: write` and `id-token: write` and targets the protected
`github-pages` environment. Workflow concurrency permits one Pages deployment at a time without
cancelling an in-progress production deployment. All actions are pinned to reviewed full commit
SHAs. Astro's `site` and `base` configuration and all internal links use the repository Pages base
path.

Scheduled workflows can be delayed, so the Tuesday noon goal is a service target rather than an
exact trigger guarantee. Manual dispatch supplies recovery without changing the artifact contract.

**Alternatives considered**:

- Deploy a newly rebuilt artifact from the deploy job: rejected because it breaks artifact
  identity after validation.
- Publish a generated branch: rejected in favor of GitHub's supported Pages artifact flow.
- Cancel in-progress deployments: rejected because an interrupted production release is riskier
  than allowing the next pending run to proceed afterward.

**Sources**:

- GitHub Pages custom workflows:
  https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Scheduled workflow behavior:
  https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- Workflow permissions:
  https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- Action pinning guidance:
  https://docs.github.com/en/code-security/tutorials/secure-your-organization/protect-against-threats

## Planned Project Structure

**Decision**: Use a single Astro project with isolated ingestion, domain, persistence, and
presentation boundaries.

**Rationale**: One static application is the simplest architecture satisfying the feature and
constitution. ESPN-specific parsing remains replaceable and cannot leak upstream shapes into page
components.

**Proposed layout**:

```text
src/
├── components/
├── content/editions/
├── layouts/
├── lib/
│   ├── badges/
│   ├── domain/
│   ├── espn/
│   └── editions/
├── pages/
│   ├── index.astro
│   ├── 404.astro
│   └── weeks/[week].astro
└── styles/

scripts/
└── generate-edition.ts

tests/
├── contract/
├── e2e/
├── fixtures/
├── integration/
└── unit/
```
