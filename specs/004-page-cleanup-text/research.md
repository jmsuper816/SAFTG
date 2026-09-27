# Phase 0 Research: Page Cleanup and Text Edits

## Presentation-only implementation boundary

**Decision**: Limit production changes to the shared layout, current/historical ranking templates,
ranking-card markup, and global styling. Do not modify edition JSON, schemas, loaders, normalization,
or badge logic.

**Rationale**: Every requested string is rendered directly by those templates. The repeated ESPN
sentence is the existing `entry.explanation` node; removing that node preserves the required data
contract and every rank, score, movement, badge, and ordering behavior.

**Alternatives considered**: Deleting explanation data or relaxing schemas risks generation and
contract regressions. Filtering only the current ESPN phrase would allow future explanation copy to
reappear contrary to the requirement.

## Shared chrome removal

**Decision**: Keep the skip link and main landmark in the shared layout, remove the header and
footer elements, and delete their obsolete style rules.

**Rationale**: Source removal clears the content from both visual display and the accessibility
tree across current, historical, empty, and 404 views while preserving bypass navigation.

**Alternatives considered**: CSS hiding leaves unnecessary DOM and can produce accessibility or
maintenance ambiguity. Removing the skip link would regress keyboard access.

## Roundup title and date

**Decision**: Use “Sundays Are For The Girls Weekly Roundup” for both the layout title and visible
heading on current/history. Retain the week/status eyebrow and render the existing timezone-aware
formatted date as the sole supporting content.

**Rationale**: This implements both clarified title surfaces, preserves historical context, and
avoids changing publication data or date behavior.

**Alternatives considered**: Week-specific browser titles contradict the selected clarification;
removing the eyebrow loses current/historical context; rebuilding date logic creates unnecessary
locale risk.

## Native fragment navigation and focus

**Decision**: Use a bottom anchor targeting the roundup `h1`, with a unique stable id and
`tabindex="-1"` on that heading.

**Rationale**: HTML fragment navigation reveals, scrolls to, and runs focusing steps for the
target. `tabindex="-1"` makes the heading programmatically focusable without inserting a
noninteractive heading into the ordinary Tab order. The behavior works without JavaScript.

**Alternatives considered**: `#top` scrolls but does not target the clarified heading; an unfocusable
heading may leave active focus behind; `tabindex="0"` adds the heading to every Tab sequence; a
button needs script and misrepresents same-document navigation.

**References**: [WHATWG scrolling to a fragment](https://html.spec.whatwg.org/dev/browsing-the-web.html#scrolling-to-a-fragment),
[W3C bypass-blocks technique G1](https://www.w3.org/WAI/WCAG21/Techniques/general/G1),
[WAI-ARIA keyboard interface guidance](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)

## Semantic rankings label and action placement

**Decision**: Make “POWER RANKING” a semantic heading styled with the existing eyebrow treatment,
as the first child of the rankings section; place the return anchor after the final card.

**Rationale**: Source order matches visual order and assistive navigation, while ranking-only
placement automatically omits both elements from empty and 404 states. Existing button styling and
global focus styling can be reused.

**Alternatives considered**: Plain decorative text weakens document structure; placing the action
in the removed footer shows it on pages without rankings; a new component adds abstraction for two
small identical fragments.

## Regression strategy

**Decision**: Update current/history E2E assertions and extend accessibility tests for fragment
focus, no-JavaScript activation, reflow, and text resize. Keep theme, badge, and data suites intact.

**Rationale**: Current tests explicitly expect old copy and must change. Browser tests most directly
validate static markup, native navigation, focus, and absence. Existing suites already protect the
unchanged artwork, badge disclosure, edition isolation, schemas, and no-runtime-API guarantees.

**Alternatives considered**: Unit tests add little value for static template output; broad rewrites
of unrelated tests reduce useful regression coverage.

