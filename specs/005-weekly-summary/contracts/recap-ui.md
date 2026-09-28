# UI Contract: Weekly Recap

## Current and historical ranking pages

1. The existing publication date remains in the hero.
2. A short semantic horizontal separator follows the date.
3. One recap region follows the separator and renders paragraphs in approved authored order.
4. Week navigation, weekly honors, and power rankings follow the recap unchanged.
5. Current and historical pages render only the recap linked to their selected edition.

## Content and accessibility

1. Recap text is ordinary selectable HTML text; it is not an image or client-generated content.
2. The separator is not announced as unexplained decorative content when decoration alone is intended.
3. Paragraph spacing communicates grouping without relying on color.
4. Long names and text reflow at 320 CSS pixels and 200% text size without horizontal page scrolling.
5. Existing heading order, skip link, focus behavior, contrast, artwork, and back-to-top behavior remain
   unchanged.

## Static behavior

1. The rendered page contains no raw commissioner notes, source metadata, generation metadata, approval
   data, digests, or credentials.
2. Loading or reading the recap triggers no ESPN, NFL, team, or generation-provider browser request.
3. Missing, draft, or invalidated recap content is a build error; the public page has no placeholder or
   partial state.
