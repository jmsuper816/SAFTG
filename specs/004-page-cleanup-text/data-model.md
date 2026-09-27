# Presentation Model: Page Cleanup and Text Edits

This feature introduces no stored entity and does not alter the weekly-edition schema. It defines
how existing edition fields map to visible static content.

## Ranking Page Presentation

| Field | Source | Visible rule |
|---|---|---|
| Browser title | Feature constant | Exactly “Sundays Are For The Girls Weekly Roundup” |
| Primary heading | Feature constant | Same exact text as browser title; one per ranking page |
| Heading target | Primary heading | Unique stable fragment id; programmatically focusable but excluded from normal Tab order |
| Week status | Existing edition week/current state | Remains visible above the heading |
| Publication date | Existing `publishedAt` and league timezone | Existing long human-readable date only |
| Rankings label | Feature constant | Exact text “POWER RANKING,” immediately before cards |
| Return action | Rankings list presence | Exact text “Back to top,” after final card, targets primary heading |

## Ranking Card Presentation

| Existing field | State after cleanup |
|---|---|
| Rank | Visible and unchanged |
| Display name | Visible and unchanged |
| Movement | Visible and unchanged |
| Record | Visible and unchanged |
| Weekly score | Visible and unchanged |
| Badge awards | Visible and unchanged |
| Explanation | Still required in edition data; not rendered |

## Page States

| State | Roundup title/date | Power ranking label/cards | Back to top | Global header/footer |
|---|---|---|---|---|
| Current edition | Present | Present | Present | Absent |
| Historical edition | Present | Present | Present | Absent |
| Empty current page | Existing empty message | Absent | Absent | Absent |
| 404 page | Existing error heading | Absent | Absent | Absent |

## Navigation State Transition

1. Visitor reaches the return action after the final card.
2. Pointer click or keyboard activation updates the URL fragment to the roundup heading id.
3. The browser scrolls the heading into view and assigns focus to it.
4. The next sequential Tab continues from the heading's document location, not the bottom action.

