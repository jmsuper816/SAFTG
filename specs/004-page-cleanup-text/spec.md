# Feature Specification: Page Cleanup and Text Edits

**Feature Branch**: `004-page-cleanup-text`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Remove the Tuesday Power/Commissioner top bar and the Built for fun footer. Change the visible title to Sundays Are For The Girls Weekly Roundup, show only the published date beneath it, add a POWER RANKING label above the cards in the WEEKLY HONORS style, remove the Ranked X in ESPN explanation from cards, and add a Back to top button."

## Clarifications

### Session 2026-09-27

- Q: Should the browser-tab title also change to “Sundays Are For The Girls Weekly Roundup,” or should only the visible page heading change? → A: Use the new title for both the visible heading and browser tab.
- Q: After activating “Back to top” with a keyboard, should focus move to the roundup heading or remain on the button after the page scrolls? → A: Scroll to the top and move focus to the roundup heading.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - See a Cleaner Weekly Roundup (Priority: P1)

As a league member, I immediately see the weekly roundup without redundant branding or explanatory chrome, so the page feels focused on the league's content.

**Why this priority**: The primary goal is to simplify the visible page hierarchy and establish the requested roundup title.

**Independent Test**: Open both the current rankings page and a historical-week page and verify that the first content heading is “Sundays Are For The Girls Weekly Roundup,” its supporting line contains only the formatted publication date, and neither removed bar appears.

**Acceptance Scenarios**:

1. **Given** a visitor opens the current rankings page, **When** the page is displayed, **Then** the visible page title is “Sundays Are For The Girls Weekly Roundup.”
2. **Given** a visitor opens a historical rankings page, **When** the page is displayed, **Then** the same roundup title appears and the page still identifies the relevant week separately.
3. **Given** a ranking edition has a publication date, **When** its hero content is displayed, **Then** the line beneath the title contains only the human-readable date and no commissioner, ranking-source, or “Published” label.
4. **Given** a visitor views any site page, **When** the page loads, **Then** the “Tuesday Power” / “Commissioner calls. League chaos.” top bar and the “Built for fun. Rankings are commissioner-authored; scores come from ESPN.” bottom bar are absent.

---

### User Story 2 - Scan the Power Rankings Quickly (Priority: P2)

As a league member, I can identify where the ranked-team list begins and scan each team card without repeated source text, so the standings are easier to read.

**Why this priority**: A clear section label and less repetitive card copy improve the core rankings experience.

**Independent Test**: Locate the ranked-team list on current and historical pages and confirm that “POWER RANKING” appears directly above it in the same visual treatment as “WEEKLY HONORS,” while no card displays its stored ranking explanation.

**Acceptance Scenarios**:

1. **Given** a page contains ranking cards, **When** the visitor reaches the rankings section, **Then** “POWER RANKING” appears immediately before the card list using the same typography treatment as “WEEKLY HONORS.”
2. **Given** a ranking card previously displayed text such as “Ranked 6th in ESPN's Week 2 power rankings,” **When** the redesigned card is displayed, **Then** that explanatory line is absent while rank, team name, movement, record, weekly score, and badges remain available.
3. **Given** current and historical editions contain different rankings, **When** either page is viewed, **Then** the cleanup does not change team order, rank values, movement, scores, or badge awards.

---

### User Story 3 - Return to the Page Start (Priority: P3)

As a visitor who has reached the end of a long rankings list, I can activate “Back to top” and return to the beginning of the page without manually scrolling through every card.

**Why this priority**: The 16-team list is long on mobile, so a direct return action improves navigation after the content cleanup.

**Independent Test**: Scroll to the end of current and historical ranking pages, activate “Back to top” with pointer and keyboard input, and verify that the page targets its beginning without requiring client-side scripting.

**Acceptance Scenarios**:

1. **Given** a visitor reaches the end of a rankings list, **When** they inspect the content after the final card, **Then** a clearly styled “Back to top” action is present.
2. **Given** focus is on “Back to top,” **When** the visitor activates it, **Then** the page scrolls to the roundup heading, keyboard focus moves to that heading, and the visitor can continue from the start of the content.
3. **Given** client-side scripting is unavailable, **When** the visitor activates “Back to top,” **Then** the action still works as an in-page link.

### Edge Cases

- An empty current-edition state with no ranking cards must not display a misleading “POWER RANKING” label or “Back to top” action.
- Long formatted dates and localized browser font scaling must not clip or overflow the cleaned hero area.
- Direct navigation to the top target must focus the roundup heading without hiding the heading or its focus indicator behind another element.
- Historical pages must retain their week context after the title becomes identical across editions.
- Removing the card explanation must not remove or visually collapse badges, records, movement, or weekly scores.
- The back-to-top action must remain visible, keyboard focusable, and usable at 320 CSS pixels and 200% text size.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The site MUST remove the global top bar containing “Tuesday Power” and “Commissioner calls. League chaos.” from all pages.
- **FR-002**: Current and historical ranking pages MUST display the visible primary heading exactly as “Sundays Are For The Girls Weekly Roundup.”
- **FR-002A**: Current and historical ranking pages MUST use “Sundays Are For The Girls Weekly Roundup” as the browser-tab title as well as the visible heading.
- **FR-003**: Ranking pages MUST retain a separate visible week-status label so visitors can distinguish the current edition from a historical edition.
- **FR-004**: The supporting line immediately beneath the roundup heading MUST contain only the edition's human-readable publication date.
- **FR-005**: The supporting line MUST NOT display a ranking-source name, commissioner name, separator, or the word “Published.”
- **FR-006**: Ranking pages with cards MUST display the exact label “POWER RANKING” immediately above the card list.
- **FR-007**: “POWER RANKING” MUST use the same visual typography treatment as the existing “WEEKLY HONORS” label.
- **FR-008**: Ranking cards MUST NOT display the ranking explanation text, including generated text such as “Ranked X in ESPN's Week N power rankings.”
- **FR-009**: Removing the explanation MUST NOT alter or remove the displayed rank, team name, movement, record, weekly score, or earned badges.
- **FR-010**: The site MUST remove the global bottom bar containing “Built for fun. Rankings are commissioner-authored; scores come from ESPN.” from all pages.
- **FR-011**: Current and historical pages with ranking cards MUST display a “Back to top” action after the final ranking card.
- **FR-012**: The “Back to top” action MUST target the roundup heading through a native in-page link that works without client-side scripting.
- **FR-013**: Activating “Back to top” MUST scroll to and move keyboard focus to the roundup heading without obscuring the heading or its focus indicator.
- **FR-014**: The “Back to top” action MUST be keyboard focusable, have a visible focus state, meet existing contrast requirements, and remain usable at 320 CSS pixels and 200% text size.
- **FR-015**: Pages without a rankings list MUST omit both “POWER RANKING” and “Back to top.”
- **FR-016**: The cleanup MUST preserve current/historical navigation, ranking order, movement, scores, badge summaries, badge details, and all no-JavaScript disclosure behavior.
- **FR-017**: The cleanup MUST preserve the established responsive football artwork and color scheme.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: On 100% of current and historical ranking pages, the requested roundup heading and browser-tab title match, the date-only supporting line appears, and all four removed text strings are absent.
- **SC-002**: On 100% of ranking pages containing cards, “POWER RANKING” appears immediately before the list and no ranking card displays explanation text.
- **SC-003**: In desktop and mobile validation, 100% of “Back to top” activations scroll to and focus the roundup heading using pointer input, keyboard input, and a browser with client-side scripting disabled.
- **SC-004**: All existing ranking, historical navigation, badge-summary, badge-detail, accessibility, and responsive-theme checks continue to pass after the cleanup.
- **SC-005**: At 320 CSS pixels and 200% text size, the title, publication date, section label, final card, and back-to-top action remain readable and usable with no horizontal page scrolling.
- **SC-006**: In a five-person usability check, at least four participants identify the weekly roundup title, publication date, rankings-list start, and return-to-top action within 10 seconds each.

## Assumptions

- The requested title replaces the visible primary heading on both current and historical ranking pages; the 404 message keeps its error-specific heading.
- “Subheading” means the supporting line directly beneath the primary heading, not the separate week/current-or-historical eyebrow above it.
- The publication date keeps the site's existing human-readable date format and league timezone.
- “POWER RANKING” is intentionally singular because that is the exact wording supplied.
- The complete ranking explanation paragraph is removed from presentation even if future explanation wording differs from the ESPN example; the underlying edition data remains unchanged.
- “Back to top” appears after the complete rankings list and before the end of meaningful page content.
- A native in-page link is the expected behavior; animated scrolling is not required.
