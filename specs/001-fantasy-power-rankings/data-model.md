# Data Model: Weekly Fantasy Football Power Rankings

## Overview

The feature has two persisted input layers and one external boundary:

1. A commissioner ranking records editorial ordering and explanations.
2. Public ESPN league data supplies identity, finalized matchups, scores, and records.
3. A normalized weekly edition combines both sources with deterministic badge awards and movement.

Only normalized, public fields are persisted. Raw ESPN responses are fixtures for tests only and
MUST NOT be copied into production editions.

## League

| Field      | Type     | Rules                                                        |
| ---------- | -------- | ------------------------------------------------------------ |
| `leagueId` | string   | Stable ESPN identifier; non-empty; matches configured league |
| `name`     | string   | Public display name; 1–100 characters                        |
| `season`   | integer  | Four-digit season year                                       |
| `timezone` | string   | Valid IANA timezone; controls Tuesday publication target     |
| `teamIds`  | string[] | Unique active team identifiers; 2–20 entries                 |

Relationships: owns Teams and Fantasy Weeks; referenced by every Commissioner Ranking and Weekly
Edition.

## Team

| Field          | Type              | Rules                                                           |
| -------------- | ----------------- | --------------------------------------------------------------- |
| `teamId`       | string            | Stable ESPN team identifier; unique within league and season    |
| `displayName`  | string            | Current sanitized public name; 1–60 characters                  |
| `abbreviation` | string or null    | Up to 8 display characters                                      |
| `logoUrl`      | HTTPS URL or null | Optional public image; rendered with safe fallback and alt text |
| `record`       | Record            | Finalized wins, losses, ties, points for, and points against    |

Identity uses `teamId`, never display name. Name changes update display text without breaking
movement or badge history.

## Record

| Field           | Type                 | Rules                         |
| --------------- | -------------------- | ----------------------------- |
| `wins`          | non-negative integer | From validated ESPN standings |
| `losses`        | non-negative integer | From validated ESPN standings |
| `ties`          | non-negative integer | From validated ESPN standings |
| `pointsFor`     | finite number        | Rounded only for display      |
| `pointsAgainst` | finite number        | Rounded only for display      |

## Fantasy Week

| Field          | Type          | Rules                                                  |
| -------------- | ------------- | ------------------------------------------------------ |
| `week`         | integer       | 1–25; unique per league and season                     |
| `startsAt`     | ISO timestamp | Source scoring-period start                            |
| `endsAt`       | ISO timestamp | Later than `startsAt`                                  |
| `sourceStatus` | enum          | `pending`, `final`, or `invalid`                       |
| `matchups`     | Matchup[]     | Covers every active team at most once; bye is explicit |

## Matchup

| Field          | Type                  | Rules                                                 |
| -------------- | --------------------- | ----------------------------------------------------- |
| `matchupId`    | string                | Unique within week                                    |
| `homeTeamId`   | string                | References active Team                                |
| `awayTeamId`   | string or null        | Null only for an explicit bye                         |
| `homeScore`    | finite number         | Final score when week is final                        |
| `awayScore`    | finite number or null | Null only for a bye                                   |
| `winnerTeamId` | string or null        | Null for tie or bye; otherwise participant            |
| `isFinal`      | boolean               | All non-bye matchups MUST be final before publication |

## Commissioner Ranking

| Field           | Type                 | Rules                                   |
| --------------- | -------------------- | --------------------------------------- |
| `schemaVersion` | literal `1`          | Enables future migrations               |
| `leagueId`      | string               | Matches configured ESPN league          |
| `season`        | integer              | Matches target edition                  |
| `week`          | integer              | Matches target edition                  |
| `commissioner`  | string               | Public display name; 1–80 characters    |
| `submittedAt`   | ISO timestamp        | Audit metadata; not used for ordering   |
| `rankings`      | Ranking Submission[] | Contains every active team exactly once |

### Ranking Submission

| Field         | Type             | Rules                                                                |
| ------------- | ---------------- | -------------------------------------------------------------------- |
| `teamId`      | string           | Unique and present in current ESPN team set                          |
| `rank`        | positive integer | Non-decreasing in file order; ties allowed; no rank above team count |
| `explanation` | string           | 1–500 characters after trimming; rendered as untrusted text          |

Tied ranks use competition ranking: after two teams ranked `2`, the next rank is `4`. Cross-record
validation rejects duplicates, missing teams, unknown teams, invalid gaps, or a changed league/week.

## Badge Definition

| Field         | Type    | Rules                                                |
| ------------- | ------- | ---------------------------------------------------- |
| `badgeId`     | string  | Stable kebab-case identifier                         |
| `name`        | string  | Public playful label                                 |
| `description` | string  | Plain-language achievement definition                |
| `scope`       | enum    | `weekly` or `streak`                                 |
| `exclusive`   | boolean | Whether one team or all tied teams receive it        |
| `tieRule`     | enum    | `all`, `none`, or deterministic secondary comparison |
| `assetPath`   | string  | Repository-relative static image path                |

Initial definitions: highest score, lowest score, largest win, closest win, biggest upset, longest
active winning streak, and unluckiest high-scoring loss.

## Badge Award

| Field     | Type           | Rules                                  |
| --------- | -------------- | -------------------------------------- |
| `badgeId` | string         | References Badge Definition            |
| `teamId`  | string         | References Team in this edition        |
| `reason`  | string         | Deterministic, plain-language evidence |
| `metric`  | number or null | Exact comparison value when applicable |

Unique key: `(season, week, badgeId, teamId)`. Awards are immutable after the edition is committed;
later rule changes apply only to later editions.

## Weekly Edition

| Field               | Type                 | Rules                                               |
| ------------------- | -------------------- | --------------------------------------------------- |
| `schemaVersion`     | literal `1`          | Edition contract version                            |
| `editionId`         | string               | `{leagueId}-{season}-week-{NN}`; globally unique    |
| `league`            | League Summary       | Public normalized league metadata                   |
| `week`              | Fantasy Week Summary | Final source period only                            |
| `publishedAt`       | ISO timestamp        | Controlled generation time                          |
| `rankingSource`     | Ranking Source       | Commissioner display name and submission path       |
| `entries`           | Ranking Entry[]      | Complete commissioner order enriched with ESPN data |
| `badges`            | Badge Award[]        | Deterministic awards for the same week              |
| `previousEditionId` | string or null       | Prior published week when available                 |

### Ranking Entry

| Field          | Type                     | Rules                                           |
| -------------- | ------------------------ | ----------------------------------------------- |
| `teamId`       | string                   | Unique; every active team exactly once          |
| `displayName`  | string                   | Snapshot of name for historical stability       |
| `rank`         | positive integer         | Preserves commissioner value                    |
| `previousRank` | positive integer or null | Null when no prior edition                      |
| `movement`     | integer or null          | `previousRank - rank`; null on first appearance |
| `record`       | Record                   | Snapshot after target week                      |
| `weeklyScore`  | finite number            | Final target-week score                         |
| `winningStreak` | non-negative integer     | Consecutive wins through the target week        |
| `explanation`  | string                   | Preserves commissioner text                     |
| `badgeIds`     | string[]                 | Awards referencing this entry                   |

## Lifecycle and State Transitions

```text
awaiting-results ──ESPN final──▶ awaiting-ranking
       │                              │
       └──invalid/unavailable─────────┴──▶ skipped
                                      │
                       complete commissioner input
                                      ▼
                                  validating
                                  │        │
                              failure    success
                                  │        ▼
                               skipped  generated
                                             │
                                      review + commit
                                             ▼
                                         published
```

- `skipped` creates no Weekly Edition and cannot replace the latest valid edition.
- `generated` is local/CI output and is not public until reviewed, committed, tested, and deployed.
- `published` editions are immutable. Corrections create a reviewed replacement commit with the
  same `editionId` and an auditable Git history; silent mutation is prohibited.
