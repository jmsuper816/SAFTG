# UI Contract: Badge Summary

## Scope

Observable behavior on every current and historical weekly ranking page. The persisted edition
contract is unchanged.

## Placement and section

Every valid edition page contains exactly one badge-summary section after edition heading and week
navigation, before ranking cards, with a visible “Badge Summary” heading as its accessible name.

## Badge group

Each awarded badge renders exactly one independent disclosure group. Its collapsed summary exposes:

- badge name;
- earned week;
- decorative artwork that is not the sole carrier of meaning; and
- every recipient display name.

Activation exposes the badge description and each recipient name associated with that recipient's
reason. The same control collapses details again. State is programmatically available and keyboard
operable without pointer input or required client JavaScript. No additional interactive control is
nested inside the disclosure summary.

## Ordering

- Groups follow canonical catalog order.
- Recipients follow their selected-edition entry order.
- Each badge/team pair appears exactly once.
- A multi-award team appears in every applicable group.

## Empty state

With no awards, the section remains and says: “No badges were awarded this week.” No empty group is
rendered.

## Failure behavior

Unknown badges, unknown teams, duplicate badge/team pairs, or inconsistent award references stop
static publication with an actionable error. Awards are never silently omitted or misattributed.

## Responsive and accessibility behavior

- No horizontal page scrolling at supported phone or desktop widths.
- Long names and reasons wrap without clipping.
- Focus is visible on every disclosure control.
- Ownership and meaning remain textual without color or artwork.
- Current and historical pages expose equivalent structure.
- No network request, runtime data dependency, or required client-side script is introduced.
