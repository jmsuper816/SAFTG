# Data Model: Quippy Weekly Summary

Recap evidence and output are separate from the existing `WeeklyEdition`. Both use the edition's
immutable `editionId` as their one-to-one key.

## Recap Evidence Manifest

Committed editorial input stored at `data/recap-inputs/{season}/week-{NN}.json`.

| Field | Type | Validation |
|---|---|---|
| `schemaVersion` | literal `1` | Required |
| `editionId` | string | Must match exactly one existing edition |
| `cutoff.previous` | RFC 3339 timestamp | Required; strictly earlier than current cutoff |
| `cutoff.current` | RFC 3339 timestamp | Must equal the edition publication cutoff |
| `leagueFactIds` | ordered unique string array | References derived edition facts included in the approval envelope |
| `lineupEvidence` | `LineupEvidence[]` | Stable unique IDs; all team IDs must exist in the edition |
| `newsSources` | `FootballNewsSource[]` | Stable unique IDs; official allowlisted publishers only |
| `commissionerNoteDigests` | ordered unique SHA-256 array | Digests only; raw notes are never committed or published |

The digest also incorporates a deterministic projection of the linked edition: rank, movement, record,
weekly score, badge awards, matchup outcome facts used by the recap, and publication cutoff.

## Lineup Evidence

| Field | Type | Validation |
|---|---|---|
| `evidenceId` | string | Unique within the manifest |
| `teamId` | string | Must reference an edition team |
| `playerId` | string | Required stable fantasy/player identifier |
| `playerName` | string | 1–100 trimmed characters |
| `lineupStatus` | `started` or `bench` | Required |
| `fantasyPoints` | finite number | Required |
| `observedStatement` | string | 1–300 characters; factual original wording |
| `factIds` | non-empty unique string array | Must resolve to league/source facts |

`started` may support actual scoring impact. `bench` may support only a missed-opportunity statement;
it must not be phrased as points that counted toward the matchup result.

## Football News Source

| Field | Type | Validation |
|---|---|---|
| `sourceId` | string | Unique within the manifest |
| `publisherType` | `nfl` or `team` | Required |
| `publisher` | string | Must match the official publisher registry |
| `url` | HTTPS URL | Host must match publisher allowlist; no credentials/fragments |
| `title` | string | 1–200 characters |
| `publishedAt` | RFC 3339 timestamp | Must fall in `(previous cutoff, current cutoff]` |
| `updatedAt` | RFC 3339 timestamp or null | If relied upon, it must also be within the edition window |
| `accessedAt` | RFC 3339 timestamp | Audit metadata; not proof of eligibility |
| `subjects` | non-empty unique string array | Player/team identifiers affected by the fact |
| `summary` | string | 1–500 characters; original factual paraphrase, not copied body text |

## Weekly Recap Artifact

Committed generated/reviewed output stored at `data/recaps/{season}/week-{NN}.json`.

| Field | Type | Validation |
|---|---|---|
| `schemaVersion` | literal `1` | Required |
| `editionId` | string | One-to-one with evidence manifest and edition |
| `paragraphs` | ordered string array | 1–6 paragraphs; each 1–1,000 characters; non-empty after trim |
| `evidenceRefs` | `EvidenceReference[]` | Every factual paragraph references known fact/source IDs |
| `warnings` | unique string array | Review-only; approval requires no unresolved blocking warning |
| `generation` | `GenerationMetadata` | Required for generated drafts |
| `approval` | `Approval` or null | Null means draft; current matching digest means approved |

## Evidence Reference

| Field | Type | Validation |
|---|---|---|
| `paragraphIndex` | integer | Must address an existing paragraph exactly |
| `factIds` | unique string array | All IDs must exist in edition facts or lineup evidence |
| `sourceIds` | unique string array | All IDs must exist in the evidence manifest |

Playful-only paragraphs may have empty arrays. Any paragraph containing a name, number, result, player
event, or causal/missed-opportunity statement must have the appropriate references.

## Generation Metadata

| Field | Type | Validation |
|---|---|---|
| `generatedAt` | RFC 3339 timestamp | Audit field, excluded from approval digest |
| `provider` | literal `openai` | Required |
| `configuredModel` | string | Pinned model ID used in the request |
| `responseModel` | string | Model ID returned by provider |
| `requestId` | string | Audit identifier; never rendered |
| `promptVersion` | positive integer | Included in input/approval digest |
| `inputDigest` | SHA-256 string | Digest of exact recap-relevant inputs used for generation |

## Approval

| Field | Type | Validation |
|---|---|---|
| `status` | literal `approved` | Draft is represented by `approval: null` |
| `commissioner` | string | 1–80 characters |
| `approvedAt` | RFC 3339 timestamp | Audit field, excluded from approval digest |
| `contentDigest` | SHA-256 string | Must match the recomputed canonical approval envelope |

## State Transitions

```text
evidence ready -> draft generated -> commissioner edits/reviews -> approved -> publishable
                       ^                                      |
                       |                                      v
                       +---------- relevant change <- invalidated (derived)
```

- `draft`: structurally valid artifact with `approval: null`.
- `approved`: approval exists and its digest matches all current relevant inputs and exact text.
- `invalidated`: approval exists but the recomputed digest differs; this is derived, not persisted.
- `publishable`: approved plus one-to-one edition/evidence/recap coverage and no blocking warning.
- Generation failure never overwrites an existing approved artifact.

## Private Commissioner Notes

Raw notes are local ignored files keyed by edition. Draft generation verifies their current SHA-256
digests against `commissionerNoteDigests`; only digests and approved prose are committed. Missing or
mismatched notes block regeneration but do not prevent verification of an already approved artifact
whose stored input digest remains current.
