# Research: Badge Summary

## Native disclosure interaction

**Decision**: Use independent native disclosure groups. Keep badge name, week, and recipient names
in the always-visible summary; place the description and recipient/reason list in disclosed content.
Do not add redundant roles, manual expanded-state attributes, handlers, or client hydration.

**Rationale**: Native disclosure provides keyboard activation and programmatic state without client
JavaScript. Decorative art can remain `alt=""` because all meaning is textual.

**Alternatives considered**: Custom button/panel controls require client state and manual
accessibility synchronization. Always-visible details contradict clarification B. Links to team
cards do not make reasons available within the summary.

## Deterministic grouping and ordering

**Decision**: Derive one group per awarded catalog badge. Iterate the catalog for group order and
edition entries for recipient order, preserving stored reasons.

**Rationale**: These are the existing stable domain authorities. Entry position remains
deterministic even when competition ranks tie, and derivation avoids duplicating historical data.

**Alternatives considered**: Award-array order is not a presentation contract. Alphabetical order
loses catalog/ranking context. Persisted groups duplicate data and create migration risk.

## Fail-closed validation

**Decision**: Reject unknown badge IDs, unknown team IDs, duplicate badge/team pairs, and
inconsistent award versus entry badge references before static publication.

**Rationale**: Partial rendering could hide or misattribute awards. Historical definitions must
remain resolvable while any committed edition references them.

**Alternatives considered**: Silently omitting or labeling unknown awards violates FR-015; mutating
historical data during rendering violates immutability.

## Component reuse

**Decision**: Use one summary component on current and historical pages after navigation and before
ranking cards. Retain team-card badges.

**Rationale**: Shared markup prevents route drift and preserves detailed team context.

**Alternatives considered**: Duplicated page markup risks inconsistent semantics. Current-only
placement fails historical requirements. Replacing card badges changes existing journeys.

## Verification strategy

**Decision**: Unit-test projection and validation. Browser-test current/historical isolation,
native disclosure, keyboard use, closed/open axe scans, phone overflow, JavaScript-disabled use,
base-path routes, and retained card badges. Keep build, links, zero-client-script, and secret gates.

**Rationale**: Unit tests isolate transformation failures; production-build browser tests prove
interaction and static hosting behavior.

**Alternatives considered**: Snapshots or axe alone do not prove ordering and interaction. Unit
tests alone cannot prove focus, disclosure, responsive layout, or semantic output.
