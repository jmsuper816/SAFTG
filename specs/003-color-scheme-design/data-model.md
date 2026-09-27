# Design Model: Football Color Scheme and Design

This feature does not change league data. Its model is a static presentation contract shared by
the stylesheet, component states, assets, and tests.

## Background Variant

| Field | Meaning | Validation |
|---|---|---|
| `orientation` | `portrait` or `landscape` | Exactly one of each |
| `asset` | Build-managed local image | Resolves under the production base path |
| `intrinsicAspect` | Source width/height relationship | Preserved during optimization |
| `fit` | Viewport coverage | Proportional `cover`; never stretch or tile |
| `position` | Crop anchor | Center unless crop review establishes a safer fixed anchor |
| `fallback` | Color shown on image failure | Deep teal satisfying surface contrast |

| Variant | Source dimensions | Published format | Published size |
|---|---:|---|---:|
| Portrait | 940 × 1672 | WebP | 287,438 bytes |
| Landscape | 1672 × 941 | WebP | 283,616 bytes |

Selection states: `height > width` selects portrait; `width >= height` selects landscape. Resize
and rotation transition between states without changing content order.

## Theme Palette

Final hexadecimal values are selected from the supplied art during implementation and recorded
with measured ratios.

| Semantic role | Family | Consumers | Validation |
|---|---|---|---|
| Page fallback | Deep teal | Behind artwork | Readable when art fails |
| Artwork tint | Dark teal/blue | Fixed overlay | Decoration remains subordinate |
| Primary surface | Deep teal/blue | Navigation, cards, footer | Text contrast |
| Elevated surface | Darker teal/blue | Menus and nested details | Text, border, focus contrast |
| Primary ink | Off-white | Headings and body | ≥4.5:1 normal text |
| Secondary ink | Pale off-white/cyan | Supporting text | ≥4.5:1 normal text |
| Accent | Cyan or pink | Links and emphasis | ≥4.5:1 when normal text |
| Movement up | Cyan | Up state | ≥4.5:1 text; ≥3:1 graphics |
| Movement down | Hot pink | Down state | ≥4.5:1 text; ≥3:1 graphics |
| Border | Muted cyan/teal | Required boundaries | ≥3:1 when identification depends on it |
| Focus inner/outer | Two contrasting theme colors | Keyboard focus | Visible on surfaces and art; target ≥3:1 change |

## Readability Layer

The decorative layer is fixed behind all content, has no motion, cannot intercept input, and falls
back to solid deep teal. Its static tint makes the art secondary. Content uses stable surfaces so
contrast is independent of crop.

## Movement State

| Existing value | State/class | Visible cue | Color role |
|---|---|---|---|
| Positive | Up | Up arrow and magnitude | Cyan |
| Negative | Down | Down arrow and absolute magnitude | Hot pink |
| Zero | Neutral | Em dash | Readable ink |
| Null | New | `New` | Readable ink/accent |

Every ranking entry maps to exactly one state. Color never replaces the visible arrow or label.
All routes inherit one palette and one selected background through the shared layout.
