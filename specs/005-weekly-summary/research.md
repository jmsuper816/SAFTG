# Phase 0 Research: Quippy Weekly Summary

## Official football-news evidence

**Decision**: Do not scrape NFL or team sites during an Astro or Pages build. Use commissioner-curated,
committed evidence records from an allowlist of official NFL and club publishers. Store canonical URL,
publisher, displayed timestamps, affected subjects, and an original factual paraphrase—never article
bodies, imagery, or copied prose.

**Rationale**: No stable public official-news API is established for this project. Live HTML or
undocumented JSON retrieval would be brittle and make historical builds depend on mutable remote
content; systematic collection may also conflict with publisher terms. Curated normalized evidence
preserves the official-source requirement while making builds reviewable and reproducible.

**Alternatives considered**: Live HTML scraping was rejected for fragility, reproducibility, and terms
risk. Undocumented internal endpoints were rejected for lack of compatibility or permission contract.
RSS may be added only when an official publisher exposes a compatible feed. Fully manual prose was
rejected because it gives up structured validation and draft assistance.

**References**: [NFL Terms](https://www.nfl.com/legal/terms/),
[NFL injury-report policy](https://operations.nfl.com/media/2683/2017-nfl-injury-report-policy.pdf?fs=e&s=cl),
[official Eagles injury report](https://www.philadelphiaeagles.com/team/app-injury-report/)

## Source window and corrections

**Decision**: Use a half-open source window `(previous cutoff, current cutoff]` with RFC 3339
timestamps normalized to UTC. For a relied-upon correction, use the official displayed update time; if
the time at which the fact changed cannot be established, omit it from that edition. Define an explicit
season-start cutoff for the first edition.

**Rationale**: Exclusive/inclusive boundaries prevent duplicates and gaps between editions. Explicit
timestamps keep backfills and rebuilds stable, while reapproval makes intentional historical
corrections auditable.

**Alternatives considered**: Kickoff-to-final-whistle excludes relevant pregame injury/lineup news.
Open-ended relevance lets future information silently rewrite an approved edition.

## Recap artifact boundary

**Decision**: Keep recap evidence and approved recap output in dedicated committed paths linked to the
existing edition by `editionId`; do not add generated prose to the ranking generator's owned output.

**Rationale**: Ranking generation can remain deterministic and unchanged. Separate recap artifacts
avoid circular generation, prevent ESPN refreshes from overwriting editorial approval, and make private
note exclusion explicit.

**Alternatives considered**: Embedding recap fields in the edition is simpler at render time but mixes
nondeterministic editorial state with generated ranking data. Browser-side generation violates the
static architecture and exposes secrets.

## Generation provider and output contract

**Decision**: Use the official OpenAI JavaScript SDK from a Node-only CLI with the Responses API,
`store: false`, and strict Structured Outputs. Supply a complete evidence-controlled fact packet and no
web tools. Require structured paragraphs, fact/source references, and warnings, then validate all IDs
and semantic bounds locally.

**Rationale**: The requested voice benefits from language generation, while strict output shape and a
closed evidence packet constrain fabrication. The Responses API is the documented forward path and
Structured Outputs provides stronger shape guarantees than JSON mode. Commissioner approval—not model
repeatability—is the final release gate.

**Alternatives considered**: Chat Completions is supported but not preferred. JSON mode does not enforce
the schema. Function calling and agent/web-search tools add unnecessary capability and weaken the
approved-source boundary. Deterministic templates are testable but do not provide the requested voice.

**References**: [official SDKs](https://developers.openai.com/api/docs/libraries),
[Responses migration guidance](https://developers.openai.com/api/docs/guides/migrate-to-responses),
[Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

## Generation reliability and secrets

**Decision**: Use one non-streaming request with a 90-second attempt timeout, SDK retry limit of two,
and a three-minute total deadline. Retry only documented transient/rate-limit failures. Read
`OPENAI_API_KEY` only from the trusted process environment; never log or serialize it. Tests inject a
fake generator and never consume live quota.

**Rationale**: Bounded retries satisfy the constitution without allowing editorial commands to hang.
Keeping generation separate from the build means a provider outage cannot change or destroy the last
approved artifact, and ordinary CI requires no model credential.

**Alternatives considered**: Nested custom and SDK retries risk retry storms. Generating inside every
build spends quota, prevents reproducibility, and turns provider downtime into a deployment outage.

**References**: [rate-limit guidance](https://developers.openai.com/api/docs/guides/rate-limits),
[production practices](https://developers.openai.com/api/docs/guides/production-best-practices)

## Approval and invalidation

**Decision**: Canonicalize and SHA-256 hash a versioned approval envelope containing the edition fact
projection, evidence manifest, commissioner-note digests, prompt/schema/model versions, returned
evidence references, and exact paragraph text. Derive invalidation whenever the stored approval digest
does not equal the recomputed digest.

**Rationale**: The digest binds approval to the exact reviewed prose and facts. Excluding volatile
generation/approval timestamps preserves stability; including ordered arrays ensures paragraph or
evidence ordering changes require review.

**Alternatives considered**: A manual boolean cannot detect stale approval. Hashing text only misses
changed facts. Persisting an `invalidated` flag risks stale state; deriving it from the digest is safer.

## Verified lineup evidence

**Decision**: Introduce a structured commissioner-curated evidence contract for rostered players,
lineup status, fantasy points, and observed impact. Distinguish `started-impact` from
`benched-opportunity` and require the draft to use those labels accurately.

**Rationale**: The current ESPN adapter normalizes teams and matchups but not player rosters or lineups.
An explicit evidence boundary satisfies the clarified verification rule without depending on an
unresearched undocumented roster response during this feature. Commissioner approval covers the
captured evidence and resulting claim.

**Alternatives considered**: Expanding the ESPN adapter to undocumented roster shapes materially
increases scope and fragility. Treating every rostered player as causally relevant violates the
clarified requirement.
