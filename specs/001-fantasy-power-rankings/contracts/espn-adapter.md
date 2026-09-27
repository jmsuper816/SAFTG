# ESPN Adapter Contract

## Purpose

Isolate the undocumented public ESPN Fantasy Football response behind a small, validated boundary.
No page, badge rule, or edition component may consume the upstream response directly.

## Input

The adapter accepts:

- `leagueId`: configured public ESPN league identifier
- `season`: four-digit season
- `week`: fantasy scoring period, 1–25
- `timeoutMs`: positive request timeout
- `maxAttempts`: bounded total attempts, including the first request

The adapter performs unauthenticated HTTPS requests only. Cookies, account credentials, and private
league tokens are prohibited.

## Successful Output

```text
EspnWeekSnapshot
├── league: { leagueId, name, season, timezone? }
├── status: { week, isFinal, startsAt, endsAt }
├── teams[]
│   ├── teamId
│   ├── displayName
│   ├── abbreviation?
│   ├── logoUrl?
│   └── record: { wins, losses, ties, pointsFor, pointsAgainst }
└── matchups[]
    ├── matchupId
    ├── homeTeamId
    ├── awayTeamId?
    ├── homeScore
    ├── awayScore?
    ├── winnerTeamId?
    └── isFinal
```

All identifiers are normalized to strings. Numeric inputs must be finite. Text is trimmed and size
bounded. Extra upstream fields are discarded.

## Invariants

- Response league, season, and week match the request.
- Team identifiers are unique and the configured active-team count is 2–20.
- Every matchup references known teams and no active team occurs in more than one matchup.
- Every non-bye matchup is final before an edition can be generated.
- Records, scores, timestamps, and matchup winners are internally consistent.
- A public league request must succeed without authentication material.

## Failure Contract

The adapter returns a typed failure and writes no edition when it encounters:

- timeout, DNS, connection, rate-limit, or non-success response;
- HTML or another unexpected content type;
- malformed JSON or a schema change;
- wrong league, season, or week;
- incomplete teams, standings, scores, or matchup state; or
- any request for authentication.

Transient failures use exponential backoff with jitter for the configured bounded attempt count.
Validation and authentication failures are not retried. Logs include the failure category, target
league/season/week, attempt count, and safe response metadata but never the full upstream body.

## Fixture Contract Tests

Maintain sanitized fixtures for:

- complete finalized week;
- first week and no prior movement;
- ties, bye, odd-team league, and zero score;
- renamed team with stable identifier;
- incomplete matchup;
- missing or duplicate team;
- unexpected field type and missing required field;
- upstream error, rate limit, timeout, and HTML response.

A live smoke test may run manually against the configured public league but MUST NOT gate routine
pull requests or consume credentials.
