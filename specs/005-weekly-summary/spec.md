# Feature Specification: Quippy Weekly Summary

**Feature Branch**: `005-quippy-summary`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Add a visually separated paragraph beneath the publication date that recaps the week's football news, connects it to league outcomes, and uses a playful, personalized voice like the supplied Week 7 example."

## Clarifications

### Session 2026-09-27

- Q: What happens when an edition has no recap? → A: Require an approved recap and fail publication when it is missing.
- Q: How is recap copy produced? → A: Generate a draft from league/news inputs and require commissioner approval before publication.
- Q: Which football-news sources are authoritative? → A: Official NFL and team reporting only.
- Q: How strong must the evidence be before the recap says an NFL event affected a fantasy matchup? → A: Require verified roster and lineup evidence; include both started-player scoring impact and noteworthy benched-player missed opportunities, clearly distinguishing the two.
- Q: Which weekly editions must receive an approved recap when this feature launches? → A: Every existing and future edition must have an approved recap.
- Q: What time window determines which official football news may be used in a weekly recap? → A: Use news published after the previous edition's cutoff and no later than the current edition's publication cutoff.
- Q: What evidence may support personalized jokes about a manager's recurring behavior? → A: Use verified league history plus commissioner-supplied notes, with the final callout covered by commissioner approval.
- Q: What happens to commissioner approval when recap-relevant data changes afterward? → A: Any supporting-input change invalidates approval; the regenerated or revised draft and its evidence must be approved again.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Read the Week at a Glance (Priority: P1)

As a league member, I can read a lively recap directly beneath the publication date so I understand the week's biggest league results without interpreting every ranking card first.

**Why this priority**: The recap is the primary value of the feature and gives each weekly edition a distinct voice and narrative.

**Independent Test**: Open the current and a historical weekly edition and verify that a short divider follows the date, followed by a readable multi-paragraph recap specific to that edition.

**Acceptance Scenarios**:

1. **Given** a published edition has a weekly recap, **When** a visitor opens that edition, **Then** a short horizontal divider appears beneath the date and the recap begins immediately after it.
2. **Given** a recap contains several ideas, **When** it is displayed, **Then** it is separated into short paragraphs rather than presented as one dense block.
3. **Given** a visitor opens different weekly editions, **When** they compare the recaps, **Then** each edition displays only its own week-specific summary.
4. **Given** the feature launches with existing historical editions, **When** the site is published, **Then** every existing and future edition includes its own approved recap.

---

### User Story 2 - Connect Football News to League Results (Priority: P2)

As a league member, I can see how meaningful football developments influenced our fantasy matchups, scores, rankings, and honors so the recap feels insightful rather than generic.

**Why this priority**: Connecting real football events to this league's results is what turns a standings summary into an entertaining weekly story.

**Independent Test**: Review a completed edition whose player news and league outcomes are known, and verify every claimed connection is supported by the available football-news and league data.

**Acceptance Scenarios**:

1. **Given** a significant injury, bye, breakout performance, role change, or other football development affected a rostered player, **When** the recap is prepared, **Then** it may connect that event to verified lineup and scoring evidence without inventing causation.
2. **Given** the league has notable scores, ranking moves, wins, losses, or badges, **When** the recap is prepared, **Then** it highlights a useful subset rather than listing every result.
3. **Given** no reliable football-news connection is available for an outcome, **When** the recap is prepared, **Then** it describes the league result without presenting unsupported outside context as fact.

---

### User Story 3 - Enjoy Personalized League Banter (Priority: P3)

As a league member, I can enjoy affectionate, specific jokes about recurring league behavior so the recap feels written for our group rather than for a generic fantasy audience.

**Why this priority**: Personalized callbacks, such as the Bobbi bye-week example, create the fun social payoff requested for the site.

**Independent Test**: Review a recap containing a personal callout and verify it refers to supported league behavior, remains playful rather than hostile, and can be understood by league members.

**Acceptance Scenarios**:

1. **Given** a manager has a notable repeated behavior supported by league history or a commissioner-supplied note, **When** a personal callout is included, **Then** the joke accurately reflects that context, uses the league's playful tone, and is included in the commissioner's approval review.
2. **Given** a recap has no suitable personal callback, **When** it is published, **Then** the recap remains entertaining without forcing a joke about an individual.

### Edge Cases

- A week may have no relevant or reliably attributable football news connected to league outcomes.
- Multiple news events may affect the same matchup, while one event may affect several teams.
- News may be corrected or change after the recap is prepared.
- An official report published after the current edition's cutoff belongs to the next edition unless the current edition is explicitly revised and reapproved.
- A team may change names or ownership between editions; historical recaps must retain their intended meaning.
- A manager's repeated behavior may be statistically unusual but inappropriate for a personal joke.
- A recap may be unavailable while rankings are otherwise ready to publish.
- Previously granted approval becomes invalid when rankings, roster or lineup evidence, official news inputs, source timing, or commissioner notes used by the recap change.
- Long team names, player names, and multi-paragraph recaps must remain readable on narrow screens and at increased text size.
- External article text must not be reproduced beyond a brief, necessary attribution or reference.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Every ranking edition with a published recap MUST display a short horizontal divider directly beneath its publication date.
- **FR-002**: The weekly recap MUST appear immediately after the divider and before week navigation, weekly honors, and power rankings.
- **FR-003**: The recap MUST support multiple short paragraphs while preserving their authored order.
- **FR-004**: Current and historical pages MUST display the recap belonging only to the selected edition.
- **FR-005**: Each recap MUST identify a useful subset of that week's notable fantasy results, which may include scores, matchup outcomes, ranking movement, records, or badge awards.
- **FR-006**: When reliable football developments materially relate to a league result, the recap MUST use verified roster, lineup, and scoring evidence; it MAY describe a started player's contribution or a noteworthy benched-player missed opportunity, but MUST clearly distinguish actual scoring impact from points left on the bench.
- **FR-007**: Statements presented as fact MUST be traceable to the edition's league data or to a recorded football-news source and publication time.
- **FR-008**: The recap MUST distinguish observed outcomes from playful commentary and MUST NOT assert unsupported causal relationships.
- **FR-009**: The recap MUST use a lively, concise, league-friendly voice consistent with the supplied example, including occasional wordplay and callbacks without requiring every paragraph to contain a joke.
- **FR-010**: Personal callouts MUST be based on supported league behavior and MUST avoid hateful, threatening, sexual, or otherwise demeaning commentary.
- **FR-011**: The published page MUST remain complete static content and MUST NOT fetch football news or generate recap text while a visitor is viewing it.
- **FR-012**: Failure to obtain required football-news inputs MUST NOT silently produce or publish claims based on missing, stale, or malformed information.
- **FR-013**: Recap content and any external inputs MUST be treated as public when published; credentials, private notes, and unpublished source material MUST never appear on the page.
- **FR-014**: The divider and recap MUST preserve the site's existing color scheme, readable contrast, semantic structure, 320 CSS-pixel reflow, and 200% text-size usability.
- **FR-015**: Adding a recap MUST NOT change edition rankings, scores, movement, badges, navigation, background artwork, or back-to-top behavior.
- **FR-016**: Publication MUST fail clearly when an edition has no approved recap; rankings MUST NOT publish without the divider and recap.
- **FR-017**: Weekly recap text MUST be generated as a draft from the available league and news inputs and MUST receive explicit commissioner approval before publication.
- **FR-018**: Football-news claims MUST be supported by official NFL or team reporting; reporting from other outlets MUST NOT be treated as an authoritative recap source.
- **FR-019**: Every existing edition MUST be backfilled with an approved recap before this feature is published, and every future edition MUST include an approved recap before publication.
- **FR-020**: Football-news inputs for an edition MUST have publication times after the previous edition's cutoff and no later than the current edition's publication cutoff; later information MUST NOT alter an approved recap unless the edition is explicitly revised and reapproved.
- **FR-021**: A personal callout MAY use verified league history together with commissioner-supplied contextual notes; the note and resulting callout MUST be reviewed as part of explicit commissioner approval, and unsupported generated personal claims MUST NOT be published.
- **FR-022**: Any change to recap-relevant rankings, roster or lineup evidence, official news inputs, source timing, commissioner notes, or recap text MUST invalidate prior approval; the exact revised draft and supporting evidence MUST receive new commissioner approval before publication.

### Key Entities

- **Weekly Recap**: The ordered paragraphs for one league edition, including its tone, preparation status, approval state, approved supporting-input version, and relationship to that edition; its lifecycle is draft, approved, invalidated when relevant inputs change, and reapproved before publication.
- **Recap Fact**: A league result or football development used to support a statement, including the relevant week, subject, observed outcome, and source reference when external.
- **Football News Item**: A time-stamped report about an injury, bye, performance, lineup role, transaction, or other development that may be relevant to rostered players and weekly outcomes.
- **Personal Callout**: Optional playful commentary about a manager or team, linked to supported league behavior and reviewed against the tone boundary.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: On 100% of editions with a recap, the divider and recap appear beneath the date and before all navigation, honors, and ranking content.
- **SC-002**: In a review sample of at least five weekly recaps, 100% of factual league claims match edition data and 100% of external football claims have a recorded source and publication time.
- **SC-003**: At least 4 of 5 league-member reviewers can identify the week's main league storyline and one football-to-fantasy connection after reading the recap once.
- **SC-004**: At least 4 of 5 league-member reviewers rate the recap as fun and specific to their league, with no reviewer identifying a personal callout as hostile or unsupported.
- **SC-005**: Every recap remains readable without horizontal page scrolling at 320 CSS pixels and at 200% text size.
- **SC-006**: Current and historical edition regression checks show no changes to ranking order, scores, movement, badge awards, navigation, artwork, or return-to-top behavior.
- **SC-007**: Visitors receive a fully rendered recap with no additional news or writing request made from their browsers.

## Assumptions

- The recap belongs to a single weekly edition and becomes part of that edition's historical record.
- “Football news” means developments involving NFL games, teams, and players that can reasonably affect this fantasy league's rostered players or scoring outcomes.
- The recap should select the most entertaining and consequential storylines rather than exhaustively summarize every NFL game or league matchup.
- The supplied Week 7 example establishes the desired energy and structure, not exact wording or a required paragraph count.
- Personal jokes are optional and should be understandable within the league's existing social context.
- The visible recap does not need formal citations inline, but supporting source details must be retained for verification.
- Commissioner approval applies to the complete recap draft, including factual connections, tone, and personal callouts.
- Commissioner-supplied notes may add private league context for drafting, but only the approved resulting recap is published; raw notes remain unpublished input.
- Official NFL and individual team reporting provide the authoritative football-news boundary for this feature.
- Existing publication dates, ranking data, badges, and historical navigation remain authoritative for league outcomes.
- Initial release scope includes backfilling the existing Week 1 and Week 2 editions with approved recaps.
