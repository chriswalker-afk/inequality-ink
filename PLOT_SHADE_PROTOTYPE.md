# Plot & Shade — historical Phase 3 prototype

The complete five-picture mode is now implemented.
See [PLOT_SHADE_FULL_MODE.md](PLOT_SHADE_FULL_MODE.md).
The notes below describe the original Little Umbrella prototype, whose
mathematics and previous progress are preserved.

**Prototype page:** https://chriswalker-afk.github.io/inequality-ink/regions/plot.html

Graph Art's fourth mode begins as one short, completely playable picture.
**Little Umbrella** comprises two genuine inequality regions:

| Piece | Given boundary | Boundary to plot | Student construction |
| --- | --- | --- | --- |
| Coral canopy | y ≥ 1 | y ≤ 4 − 0.5x² | Vertex and one other point on the parabola |
| Blue puddle | y ≥ −4 + 0.25x² | y < −3 | Any two distinct points on the horizontal line |

The student first constructs a graph from two points (snapped to 0.5 units).
A correct sketch advances to a separate solid/dashed decision. A correct
boundary decision unlocks shaded-region selection. Wrong plotted graphs
remain editable with targeted feedback; wrong shaded sign-cell regions flash
red and clear, and correct filled regions stay selected until Check.

Completing both regions opens a **full-screen Big Reveal** with six stages:
canopy, puddle, umbrella patterns, handle/puddle details, raindrops, final
artwork. The completed thumbnail includes the finishing details. Replay,
skip, save PNG and restart are available.

## Interaction

- Click/tap on a coordinate to add a point, up to two points.
- Drag either point to adjust the graph; points snap to halves.
- Select a point and use four nudge buttons to adjust by 0.5.
- Keyboard: arrow keys move a graph cursor, Enter adds points, Backspace
  removes the last point; in shade mode Enter selects the region.
- The mobile layout has a fixed, contextual Check/Undo dock, while the graph
  and current plotting equation remain visible together.
- Hints do not penalise the student. Other Graph Art progress is unchanged.

## Architecture

- `regions/plot-pictures.mjs`: unique mathematical picture and decorative details
- `regions/plot-engine.mjs`: pure algebraic graph construction and feedback
- `regions/plot-art.mjs`: page controller, point interactions, saves, and reveal
- `regions/plot.html`, `regions/plot-art.css`: shared Graph Art interface
- `plot-engine.test.mjs`, `plot-art.test.mjs`: pure mathematics and UI tests

The prototype uses the existing `regions/curved-engine.mjs` to calculate
actual curved-region fills and validate selected points. It does not
create a fake picture or treat a plotted curve as an image.

The independent save key is `inequality-ink-plot-shade-prototype-v1`, which
stores the current piece, phase, chosen points, boundary style and replays.
The other three Graph Art modes and their saves remain untouched.

## Limits (intentional Phase 3 prototype)

One original two-piece picture is available. Additional graph families
(circles, absolute-value graphs, sloping lines, expanded quadratics) and
the five-picture progression will follow after student usability review.