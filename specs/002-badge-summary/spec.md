# Feature Specification: Badge Summary

**Feature Branch**: `002-badge-enhancements`

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: "I want a badge summary at the top of the page"

## Clarifications

### Session 2026-09-26

- Q: How should the summary organize badges when several teams or awards are present? → A: Group
  by badge, listing every recipient under that badge.
- Q: Should each badge group show its description and recipient reasons immediately, or reveal
  them only when a visitor expands the group? → A: Show badge names and recipients first, with an
  expandable control that reveals the description and recipient reasons.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Scan This Week's Badge Winners (Priority: P1)

As a league visitor, I want a badge summary near the top of a ranking page so I can immediately
see which teams earned recognition that week without scanning every team card.

**Why this priority**: The primary value is making the playful weekly awards prominent and quick
to understand.

**Independent Test**: Open an edition containing several badge awards and verify that every award
and recipient is visible in a summary above the full ranking list.

**Acceptance Scenarios**:

1. **Given** a weekly edition with badge awards, **When** a visitor opens that edition, **Then** a
   badge summary appears before the individual ranking cards.
2. **Given** one team earned multiple badges, **When** the summary is displayed, **Then** that team
   appears as a recipient within every badge group it earned.
3. **Given** multiple teams share a badge, **When** the summary is displayed, **Then** every tied
   recipient is listed together within one group for that badge.

---

### User Story 2 - Understand Each Award (Priority: P2)

As a visitor, I want each summarized badge to identify its meaning and why it was awarded so the
summary is informative even if I am unfamiliar with the league's badge system.

**Why this priority**: Names and artwork alone may be playful but do not reliably explain why a
team earned an award.

**Independent Test**: Review each summary entry using visual inspection, keyboard navigation, and
assistive technology; the badge name, meaning, recipient, earned week, and award reason are all
available and correctly associated.

**Acceptance Scenarios**:

1. **Given** a summarized badge group, **When** a visitor first encounters it, **Then** they can
   determine the badge name, earned week, and all recipient teams without expanding it.
2. **Given** a summarized badge group, **When** a visitor expands it, **Then** they can determine
   the badge description and each recipient's award reason.
3. **Given** a badge uses color or artwork, **When** those visual cues are unavailable, **Then** the
   same meaning remains available in text.

---

### User Story 3 - Browse Consistent Historical Summaries (Priority: P3)

As a visitor browsing previous weeks, I want each historical page to summarize that edition's
awards so I can compare the league's weekly highlights without losing the historical context.

**Why this priority**: Consistent placement and behavior make badge history useful across the
season, while the current week remains the most important surface.

**Independent Test**: Navigate between current and historical editions and verify that each page
shows only the awards committed to that edition, in the same location and presentation order.

**Acceptance Scenarios**:

1. **Given** two editions with different awards, **When** a visitor moves between them, **Then** each
   summary shows only the selected edition's awards.
2. **Given** an edition with no badge awards, **When** a visitor opens it, **Then** the summary gives
   a clear no-awards message rather than showing an empty or broken region.

### Edge Cases

- A week awards the same badge to several tied teams.
- A team earns several badges in one week.
- No teams qualify for any badge in an otherwise valid edition.
- An award references a badge definition or team that is unavailable; the page must remain usable
  and must not present misleading ownership.
- Long team names, badge descriptions, or award reasons must remain readable on a narrow phone
  screen without clipping or horizontal scrolling.
- Every badge group's details must be reachable, expanded, read, and collapsed with keyboard input.
- A historical edition retains an award that is no longer produced by current badge rules.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Every current and historical ranking page MUST present a badge summary before the
  individual ranking cards.
- **FR-002**: The summary MUST use only the badge awards stored in the selected weekly edition.
- **FR-003**: The summary MUST contain one group per awarded badge and MUST represent every valid
  award in the selected edition exactly once within its badge group.
- **FR-004**: In its initial concise state, each badge group MUST identify the badge name, earned
  week, and every recipient team.
- **FR-005**: Each badge group MUST provide a clearly labeled expandable control that reveals the
  badge description and every recipient's edition-specific award reason, and permits the details
  to be collapsed again.
- **FR-006**: A shared badge MUST list all tied recipients together within the same badge group.
- **FR-007**: The summary MUST preserve all awards when one team earns multiple badges.
- **FR-008**: Badge groups MUST follow badge catalog order, and recipients within each group MUST
  follow the selected edition's ranking order.
- **FR-009**: An edition with no awards MUST display a concise no-awards message in the summary.
- **FR-010**: Badge meaning and award ownership MUST remain understandable without relying on
  color, imagery, hover behavior, or pointer input.
- **FR-011**: The summary MUST provide a meaningful section heading, programmatically exposed
  expanded or collapsed state, and relationships that allow assistive-technology users to navigate
  and understand individual awards.
- **FR-012**: Every badge group MUST be expandable and collapsible with keyboard input.
- **FR-013**: The summary MUST remain readable and operable at phone and desktop widths without
  obscuring the ranking list or causing horizontal page scrolling.
- **FR-014**: Existing badges on individual ranking cards MUST remain available; the summary is an
  overview and MUST NOT remove the detailed team-level award context.
- **FR-015**: Invalid award references MUST fail validation before publication rather than produce
  a misleading or partially attributed summary.
- **FR-016**: The feature MUST preserve static page behavior, direct historical page loads, and the
  configured project-site base path.

### Key Entities

- **Badge Summary**: The edition-level overview of awards, identified by week and containing zero
  or more ordered summary entries.
- **Badge Group**: A presentation of one awarded badge definition, its earned week, and one or more
  recipient teams with their edition-specific reasons.
- **Weekly Edition**: The immutable source of the selected week's badge awards and ranking order.
- **Badge Definition**: The stable name, description, scope, and artwork associated with an award
  identifier.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A visitor can identify all badge-winning teams and their badges within 10 seconds of
  opening a weekly ranking page, without scrolling through the full ranking list.
- **SC-002**: For every tested edition, 100% of valid badge-and-team award pairings appear exactly
  once in the summary and no award from another week appears.
- **SC-003**: In usability testing, at least 90% of participants can expand a selected badge group
  and correctly state why a recipient earned the badge on their first attempt.
- **SC-004**: All summary content and award relationships are available through keyboard and
  assistive-technology journeys, with no meaning conveyed by color or imagery alone.
- **SC-005**: The summary causes no horizontal page scrolling at supported phone and desktop widths,
  including editions with tied recipients, multiple awards, and maximum-length names and reasons.
- **SC-006**: Current and historical ranking pages remain directly loadable, and all existing
  ranking and badge-detail journeys continue to pass after the summary is introduced.

## Assumptions

- “At the top of the page” means after the edition heading and navigation but before the ordered
  team ranking cards, keeping page identity and week controls first.
- The summary covers the selected edition only; an all-season badge leaderboard is outside this
  feature's scope.
- Existing weekly editions already contain authoritative badge awards, reasons, and team IDs.
- Existing individual team-card badges remain the detailed source of team-specific context.
- Historical awards remain immutable even if badge definitions or evaluation rules later change.
- No visitor authentication, personalization, or live browser data request is required.
