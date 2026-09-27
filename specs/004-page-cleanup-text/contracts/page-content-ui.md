# UI Contract: Weekly Roundup Cleanup

## Global structure

1. Every page retains a skip link and one main landmark.
2. No rendered page contains “Tuesday Power,” “Commissioner calls. League chaos.,” or “Built for
   fun. Rankings are commissioner-authored; scores come from ESPN.”
3. The removed global header/footer are absent from the document, not merely visually hidden.
4. The responsive football background and established theme tokens remain unchanged.

## Current and historical ranking pages

1. The document title and sole primary heading equal “Sundays Are For The Girls Weekly Roundup.”
2. The existing week/status eyebrow remains visible and distinguishes current from historical.
3. The hero supporting line contains exactly one time element whose visible text is the existing
   formatted publication date; it contains no source, commissioner, separator, or “Published.”
4. The primary heading has one unique fragment id and can receive programmatic/native-fragment
   focus without entering the ordinary Tab order.

## Rankings section

1. A semantic heading with exact visible text “POWER RANKING” immediately precedes the first card
   and uses the same typography class as “WEEKLY HONORS.”
2. Every existing card remains in the same order with the same rank, name, movement, record, score,
   and badge content.
3. No card renders edition explanation text.
4. A visible, focusable “Back to top” link follows the final card and targets the primary heading.
5. Empty and 404 states contain neither the rankings label nor the return action.

## Back-to-top behavior

1. Pointer, keyboard Enter, and JavaScript-disabled activation update the fragment and scroll to the
   primary heading.
2. After activation, the primary heading is the active element and its focus indicator is visible.
3. The heading is not hidden by page chrome; the next Tab proceeds from the top content sequence.
4. The action and focused target remain usable at 320 CSS pixels and 200% text size without
   horizontal document scrolling.

