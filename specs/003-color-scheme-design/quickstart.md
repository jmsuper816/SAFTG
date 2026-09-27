# Validation Quickstart: Football Color Scheme and Design

## Prerequisites

- Node.js 24+
- `npm install` completed
- Both supplied artwork variants available at the paths in [data-model.md](data-model.md)
- Local environment configured per the repository README

## Automated gates

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run check:links
npm run scan:secrets -- dist
npm run test:e2e
```

All commands must pass. The build must contain both fingerprinted assets, working `/SAFTG` paths,
no secret, and no external artwork URL.

## Production preview

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

Review current rankings, `/weeks/1/`, another historical week, and `/404.html`.

## Orientation and crop matrix

| Viewport | Expected | Review |
|---|---|---|
| 320 × 568 | Portrait | Framing, long text, no overflow |
| 375 × 667 | Portrait | Navigation and badge expansion |
| 768 × 1024 | Portrait | Tablet crop and hierarchy |
| 1024 × 768 | Landscape | Rotation switch and fixed art |
| 1440 × 900 | Landscape | Desktop composition |
| 1920 × 1080 | Landscape | Ultra-wide crop and margins |
| 800 × 800 | Landscape | Square boundary rule |

Test `390 × 844 → 844 × 390 → 390 × 844`. Art must switch portrait → landscape → portrait while
content remains usable. Scroll a long page with all badge summaries expanded; art remains fixed.

## Accessibility and resilience

Automated checks must prove clean axe scans; all token contrast thresholds; arrows plus values for
cyan-up/pink-down; visible focus; 320-pixel reflow; 200% resize; reduced-motion behavior; and no
clipping, overlap, lost controls, or horizontal overflow.

Manual review must:

1. Measure worst-case effective contrast for default, hover, active, current, expanded, and focus
   states without rounding a failing ratio upward.
2. Inspect movement in color, grayscale, and color-vision-deficiency simulation; arrows/text must
   preserve meaning.
3. Keyboard through skip link, brand, navigation, disclosures, badges, and return action; confirm
   order, no trap, visible focus, and no obscured target.
4. Inspect long real content at 320 pixels and 200% zoom.
5. Rotate a phone/tablet and verify reading order and operation remain stable.

Block both background requests in browser tests. The deep-teal fallback must remain readable and
axe-clean. Network inspection must show only the matching local art, no external art, and no new
runtime data request.

The feature is accepted only when all automated gates and manual rows pass and the UI satisfies
[visual-theme-ui.md](contracts/visual-theme-ui.md).
