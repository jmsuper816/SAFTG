# UI Contract: Football Visual Theme

## Background

1. Height greater than width selects portrait art; width greater than or equal to height selects
   landscape art.
2. Art fills proportionally, remains centered and fixed during scrolling, and never tiles.
3. Rotation/resizing switches art without JavaScript, content loss, or overflow.
4. Exactly one active orientation asset is requested. URLs are local and base-path safe.
5. A blocked asset leaves a deep-teal fallback and fully readable, operable content.
6. The decorative layer is absent from the accessibility tree and cannot intercept input.

## Surface and palette

1. All user-facing theme rules use semantic teal, cyan, pink, off-white, and deep-blue tokens.
2. Normal text pairs measure ≥4.5:1; large text and meaningful non-text elements measure ≥3:1.
3. Stable surfaces make contrast independent of the crop.
4. Content stays visually dominant at every required viewport.
5. Legacy gold, green, red, and unrelated accents do not remain unless documented as a necessary
   semantic exception.

## Movement

| State | Visible content | Treatment |
|---|---|---|
| Up | Up arrow and magnitude | Cyan and up class |
| Down | Down arrow and magnitude | Hot pink and down class |
| Neutral | Em dash | Neutral class and readable ink |
| New | `New` | New class and readable ink/accent |

Direction remains understandable in monochrome and when custom colors are unavailable.

## Focus, interaction, and resilience

1. Existing semantic roles, accessible names, content, and keyboard behavior do not change.
2. Every focusable control has visible focus on panels and exposed artwork.
3. Native disclosures continue to work without client JavaScript.
4. No new continuous motion or parallax is introduced; reduced-motion preferences are respected.
5. At 320, 375, 768, 1024, 1440, and 1920 CSS-pixel widths, content is unclipped with no horizontal
   document overflow.
6. At 200% text size/zoom, all navigation, badge details, names, reasons, and actions remain usable.
7. Current, historical, empty, and 404 views share the same theme and fallback behavior.
