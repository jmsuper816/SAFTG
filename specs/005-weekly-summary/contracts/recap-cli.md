# Contract: Recap Editorial Commands

## `npm run recap:draft -- --season <year> --week <number>`

1. Load the matching edition, evidence manifest, and configured local note file.
2. Validate identity, official-source allowlist, cutoff window, lineup semantics, note digests, and all
   fact/source references before making a provider request.
3. Assemble a closed fact packet and request strict structured output without web tools or storage.
4. Validate the response and write a draft atomically with `approval: null`.
5. On any failure, exit nonzero without modifying the last approved recap.

Test-only fixture injection may replace the provider, but ordinary CI tests never require a live key or
consume quota. `OPENAI_API_KEY` is required only for a real draft request and must never be logged.

## `npm run recap:approve -- --season <year> --week <number> --commissioner <name>`

1. Load and validate the draft, evidence, edition, and referenced IDs.
2. Reject unresolved blocking warnings or a stale generation input digest.
3. Compute the canonical approval digest over exact current inputs and content.
4. Add approval identity/timestamp/digest and replace the artifact atomically.
5. Exit nonzero without mutation if any validation fails.

## `npm run recap:verify -- [--season <year> --week <number> | --all]`

- Perform no external request and require no secret.
- Exit zero only when the selected scope has complete one-to-one edition/evidence/recap coverage and each
  recap is structurally valid, approved, and current.
- Exit nonzero with an actionable edition-specific reason for missing, orphaned, draft, invalidated,
  malformed, bad-window, unsupported-source, or unresolved-reference artifacts.

## Build and workflow contract

- `npm run build` and Pages publication must invoke all-edition recap verification before rendering.
- Pull-request validation uses committed fixtures and approved backfills, not live external APIs.
- The Tuesday freshness check still applies and cannot substitute for recap approval verification.
