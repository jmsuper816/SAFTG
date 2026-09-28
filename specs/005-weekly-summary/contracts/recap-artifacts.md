# Contract: Recap Evidence and Artifact Files

## Paths and identity

- Evidence manifest: `data/recap-inputs/{season}/week-{NN}.json`
- Recap artifact: `data/recaps/{season}/week-{NN}.json`
- Both files must reference the exact `editionId` from `data/editions/{season}/week-{NN}.json`.
- Every edition must have exactly one manifest and one recap; orphaned or duplicate artifacts fail.

## Evidence contract

Evidence must conform to the fields and bounds in [data-model.md](../data-model.md), including:

1. a half-open `(previous, current]` UTC cutoff window;
2. allowlisted official NFL/team publishers and HTTPS URLs;
3. original factual paraphrases rather than article body text;
4. explicit `started` or `bench` status for player impact;
5. committed commissioner-note digests only, never raw notes.

An intake or verification command must reject unsupported hosts, redirects to unsupported hosts,
missing/invalid timestamps, duplicate IDs, out-of-window items, unknown teams/facts, copied empty
content, and contradictory lineup status.

## Generated output contract

Strict generated output is:

```json
{
  "paragraphs": ["string"],
  "evidenceRefs": [
    { "paragraphIndex": 0, "factIds": ["string"], "sourceIds": ["string"] }
  ],
  "warnings": ["string"]
}
```

- Paragraphs retain order and must meet the count/length bounds in the data model.
- Returned IDs must already exist in the supplied fact packet; the generator cannot invent URLs or IDs.
- Factual paragraphs require evidence. Playful-only copy may have empty reference arrays.
- A refusal, incomplete response, malformed shape, unknown reference, blocking warning, or timeout is a
  failed draft; it must not replace an approved artifact.

## Approval contract

- Approval covers exact ordered paragraphs, evidence references, and recap-relevant supporting inputs.
- Canonical object keys are sorted; arrays retain authored order.
- The versioned SHA-256 envelope includes the edition fact projection, evidence manifest, note digests,
  prompt/schema/model versions, paragraphs, and evidence references.
- `generatedAt`, `approvedAt`, and request IDs are audit fields and excluded from the digest.
- Stored and recomputed digests must match. A mismatch is derived invalidation and blocks publication.

## Public-output boundary

Only approved paragraph text is rendered into static HTML. Raw notes, evidence manifests, source
summaries, URLs, digests, provider/request metadata, approval identity, and environment secrets must not
appear in `dist/`.
