# Edition fixtures

The historical edition fixtures are committed in `data/editions/2026/`. They are used by unit,
integration, build, and browser tests so the same validated editions exercise current-week
selection, movement, historical routes, badges, and base-path navigation.

`badge-summary.ts` builds isolated in-memory editions for group ordering, ranking ties, shared
badges, multiple awards, no-awards output, invalid references, duplicates, and maximum-length text.
These synthetic cases never modify or replace committed production editions.
