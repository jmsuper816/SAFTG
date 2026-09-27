# Phase 0 Research: Football Color Scheme and Design

## Responsive artwork

**Decision**: Select portrait/landscape assets with orientation media queries and render the
selected image with centered, proportional `cover` and no repeat.

**Rationale**: This directly expresses the clarified height-versus-width rule, reacts to rotation
without JavaScript, fills the viewport, and does not distort the art.

**Alternatives considered**: Width breakpoints misclassify rotated and split-screen devices;
JavaScript duplicates native CSS behavior; `contain` leaves gaps.

**References**: [MDN orientation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/orientation),
[MDN background-size](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/background-size)

## Reliable fixed backdrop

**Decision**: Use a fixed full-viewport decorative layer, not `background-attachment: fixed` as the
sole mechanism.

**Rationale**: It delivers the accepted stable backdrop while avoiding known mobile WebKit
behavior that can ignore, scroll, or incorrectly size fixed background attachments.

**Alternatives considered**: Fixed background attachment is simpler but unreliable on iOS;
allowing mobile scrolling contradicts the clarified requirement.

**References**: [MDN background-attachment](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/background-attachment),
[WebKit behavior](https://bugs.webkit.org/show_bug.cgi?id=275247)

## Asset ownership and Pages paths

**Decision**: Store optimized variants under `src/assets/backgrounds/` and reference them
relatively from the global stylesheet.

**Rationale**: Astro fingerprints source assets and emits paths honoring the configured `/SAFTG`
base. The published appearance remains self-contained.

**Alternatives considered**: Root-absolute `public` URLs can bypass the repository base; inline
layout URLs couple asset mechanics to markup; shipping both unoptimized originals wastes bandwidth.

## Theme architecture

**Decision**: Centralize semantic tokens and shared styling in `src/styles/global.css`; change
markup only to add up/down/neutral/new movement classes.

**Rationale**: One stylesheet and base layout already cover every route. Semantic tokens prevent
color drift, and movement classes are the only missing styling hook.

**Alternatives considered**: Component styles duplicate tokens; a runtime theme provider is
unnecessary for one theme; broad markup rewrites risk accessible behavior.

## Readability and accessibility

**Decision**: Target WCAG 2.2 AA using a dark-teal overlay and stable panel colors. Validate all
foreground/surface token pairs deterministically and inspect the rendered composition manually.

**Rationale**: Text requires 4.5:1 normally and 3:1 when large; meaningful non-text boundaries need
3:1. Automated scanners cannot reliably judge layered artwork, so text cannot depend on raw image
pixels for contrast.

**Alternatives considered**: Axe-only and screenshot-only checks are incomplete; transparent cards
over raw art are crop-dependent; blur cannot be required because support and cost vary.

**References**: [WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
[W3C testing tools](https://www.w3.org/WAI/test-evaluate/tools/selecting/)

## Color-independent state and focus

**Decision**: Pair cyan up and pink down with arrows and semantic classes; use a two-color focus
indicator that survives panels and exposed artwork.

**Rationale**: Direction remains understandable without color, and focus remains visible across
varied surfaces.

**Alternatives considered**: Color-only movement is inaccessible; legacy green/red conflicts with
the product decision; a thin single-color outline may disappear against the art.

**References**: [WCAG use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
[WCAG focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
[two-color focus](https://www.w3.org/WAI/WCAG22/Techniques/css/C40)

## Reflow, motion, and performance

**Decision**: Test 320-pixel reflow, 200% resize, orientation transitions, fallback loading,
selected-resource requests, and reduced motion. Add no parallax or art animation and preload
neither orientation unconditionally.

**Rationale**: Existing tests do not cover explicit token contrast, orientation switching, art
failure, full focus traversal, 200% resizing, or the 320-pixel threshold. Only the active optimized
asset should consume bandwidth.

**Alternatives considered**: Manual-only review misses deterministic regressions; screenshot-only
tests miss semantics; animated/parallax art adds motion and rendering cost without user value.

**References**: [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html),
[WCAG resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html),
[MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion),
[web.dev background optimization](https://web.dev/articles/optimize-css-background-images-with-media-queries)
