# Quickstart: Validate Weekly Fantasy Football Power Rankings

## Purpose

This guide validates the complete flow from a commissioner ranking and public ESPN results to a
production-equivalent static GitHub Pages artifact. It assumes the implementation tasks have been
completed.

## Prerequisites

- Node.js 24 LTS
- npm with the committed `package-lock.json`
- A publicly viewable ESPN Fantasy Football league ID
- A completed fantasy week with finalized scores
- A commissioner ranking following
  [`contracts/commissioner-ranking.schema.json`](contracts/commissioner-ranking.schema.json)

Set local, non-secret configuration:

```bash
export ESPN_LEAGUE_ID="your-public-league-id"
export ESPN_SEASON="2026"
export LEAGUE_TIMEZONE="America/New_York"
export SITE_ORIGIN="https://your-account.github.io"
export SITE_BASE="/SAFTG"
```

No ESPN cookies or account credentials may be set or used.

## 1. Install Reproducibly

```bash
npm ci
```

Expected: installation uses the committed lockfile without changing it.

## 2. Prepare the Commissioner Ranking

Create `data/rankings/2026/week-01.json`. Include every active ESPN team once, commissioner-authored
ranks, and concise explanations. Validate it before contacting ESPN:

```bash
npm run ranking:validate -- --season 2026 --week 1
```

Expected: schema and rank-sequence checks pass. Duplicate, missing, or unknown teams fail once ESPN
cross-validation runs.

## 3. Generate the Edition

```bash
npm run edition:generate -- --season 2026 --week 1
```

Expected:

- ESPN data is retrieved without credentials and normalized through the adapter contract.
- Generation stops if results are incomplete, malformed, or inconsistent.
- Every active team has exactly one commissioner rank and explanation.
- Badges and rank movement are deterministic.
- `data/editions/2026/week-01.json` matches
  [`contracts/edition.schema.json`](contracts/edition.schema.json).
- No raw ESPN response is persisted.

Review and commit the commissioner input and generated edition together. Regenerating from the same
inputs MUST produce no semantic diff; `publishedAt` is supplied explicitly or preserved during
verification.

## 4. Run Quality Gates

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:contract
npm run edition:verify -- --season 2026 --week 3
```

Expected: fixture tests cover valid responses, schema drift, unavailable data, incomplete results,
ties, byes, team renames, all badge rules, and missing commissioner input without live ESPN calls.

## 5. Build Under the GitHub Pages Base Path

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

In a second terminal:

```bash
npm run test:e2e
npm run check:links
npm run scan:secrets -- dist
```

Expected:

- `dist/index.html` shows the latest valid edition.
- Every `dist/weeks/<week>/index.html` loads directly beneath `/SAFTG/`.
- Internal links and assets retain the configured base path.
- Current ranking, historical navigation, badge details, phone/desktop layouts, keyboard journeys,
  and automated accessibility scans pass.
- The artifact contains no cookies, credentials, environment files, raw upstream data, or secrets.

## 6. Validate Failure Preservation

Run generation against the incomplete and malformed fixtures:

```bash
npm run edition:generate -- --fixture incomplete-week --season 2026 --week 2
npm run edition:generate -- --fixture malformed-response --season 2026 --week 2
npm run edition:generate -- --fixture missing-ranking --season 2026 --week 4
```

Expected: each command exits non-zero, does not replace an existing edition or create week 4, and
leaves all previously validated editions unchanged. A subsequent build continues to make week 3
current.

## 7. Deployment Verification

On the feature pull request, confirm validation builds but cannot deploy. After squash merge to the
default branch, confirm the Pages workflow:

1. builds and tests once;
2. uploads only `dist/` as the Pages artifact;
3. deploys the same artifact from a dependent job;
4. uses the protected `github-pages` environment and least-privilege permissions; and
5. leaves the existing site untouched if any build or validation gate fails.

Use manual dispatch to test recovery. Confirm concurrent runs never deploy out of order and that a
Tuesday run without a complete reviewed edition performs no deployment.

## 8. Reference Validation Results

The implementation was validated locally with the committed fixtures and configuration:

- 33 unit, contract, and integration tests passed.
- The production build generated five routes in approximately 0.15 seconds.
- 12 desktop and mobile end-to-end tests passed in approximately 2.8 seconds, including automated accessibility scans.
- Link validation passed across all 12 generated artifact files.
- The generated artifact passed the secret scan and contains no client-side JavaScript.
- Incomplete, malformed, and missing ranking inputs exited non-zero without replacing the last valid edition.
