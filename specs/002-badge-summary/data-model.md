# Data Model: Badge Summary

The feature adds no persisted data. It derives a validated presentation model from the immutable
weekly edition, badge catalog, and ranked entries during static rendering.

## Existing source entities

### Weekly Edition

- `week.number`: earned-week label.
- `entries[]`: ranked teams; array position establishes recipient order.
- `badges[]`: stored award pairings and edition-specific reasons.

One edition has zero or more awards. A team may receive multiple awards, and one badge may have
multiple recipients.

### Badge Definition

- `badgeId`: stable unique identifier.
- `name` and `description`: public meaning.
- `assetPath`: decorative artwork.
- Catalog position: canonical group order.

### Badge Award

- `badgeId`: references one definition.
- `teamId`: references one ranked team in the same edition.
- `reason`: edition-specific recipient explanation.
- `metric`: optional calculation evidence, not shown in the summary.

Identity: `(editionId, badgeId, teamId)` is unique.

## Derived entities

### Badge Summary

- `week`: selected edition week.
- `groups`: zero or more ordered Badge Groups.

It contains only selected-edition awards, one group per awarded known badge, and no unawarded group.
An empty group list produces the explicit no-awards state.

### Badge Group

- `badge`: referenced Badge Definition.
- `week`: selected edition week.
- `recipients`: non-empty ordered Badge Recipient list.
- `initialState`: `collapsed`.

Identity: `badge.badgeId` is unique within the summary. Groups follow catalog order.

### Badge Recipient

- `teamId`: stable team identifier.
- `displayName`: name snapshotted in the edition.
- `rank`: selected-edition rank.
- `reason`: stored award explanation.

Identity: `(badgeId, teamId)` is unique within the summary. Recipients follow edition-entry order,
which stays deterministic when ranks tie.

## Validation and failure rules

The projection rejects rather than partially renders when:

- an award references a badge absent from the retained catalog;
- an award references a team absent from edition entries;
- the same `(badgeId, teamId)` pair occurs more than once;
- entry badge references and authoritative awards disagree; or
- a required source field already fails the weekly-edition contract.

## Interaction state

Each group has transient, unpersisted browser state:

```text
Collapsed (initial) ⇄ Expanded
```

- **Collapsed**: badge name, week, and all recipient names are visible.
- **Expanded**: the description and every recipient reason become additionally visible.
- Keyboard or pointer activation transitions either direction.
- Reloading or navigating restores the collapsed initial state.
