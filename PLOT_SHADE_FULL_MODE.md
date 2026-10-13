# Plot & Shade — complete five-stage mode

Live: https://chriswalker-afk.github.io/inequality-ink/regions/plot.html

This is the fourth Graph Art mode, visually aligned with Find & Fill,
Build & Shade and Curve & Fill. Every filled picture piece is the *actual*
intersection of all its shown inequalities. Sketching never relies on
freehand accuracy or arbitrary solution masks.

## Five-picture student progression

| Stage | Picture | Pieces | Constructions |
| --- | --- | ---: | --- |
| Starter | Little Umbrella | 2 | Simple parabola and horizontal line |
| Step Up | Ice Cream Dream | 3 | Rising straight line, circular scoops |
| Building | Rainbow Gate | 4 | Curved bands, plot two boundaries in the first piece; subsequent boundaries are reused |
| Challenge | Moonlight Lantern | 5 | Two absolute-value graphs for one region, circles, parabolic roof |
| Big Finish | Rocket Launch | 7 | Nose cone, curved body, straight fins and parabolic flames |

There are 21 total mathematical regions and more than 25 graph constructions.

**Key plotting interactions**:

- Lines: two different points, including vertical/horizontal gradients.
- Parabolas: turning point plus a second point on the curve.
- Absolute-value graphs: V vertex plus another point on an arm.
- Circles: centre plus any point on the circumference.
- The system reconstructs the underlying equation and checks exact algebraic
  equivalence with the target. Any correct point pair is accepted.
- Every plotted boundary is separately checked solid/dashed, depending on
  inclusive versus strict inequalities.
- When several plots are required for the same piece, a previously verified
  boundary remains on screen; the student plots the next, then shades.
- Boundaries already constructed on earlier pieces are reused instead of
  requiring the student to redraw them; the list labels these as REUSED.
- Correct shading stays until the student presses Check. An incorrect sign
  cell flashes red then clears (using the same underlying curved-region
  evaluator as Curve & Fill).
- Mobile plotting maintains a compact equation and action dock, editable
  point labels and half-step nudge buttons. Keyboard supports arrows/Enter.

## Genuine artwork and Big Reveal

Each picture has its own mathematical regions, a separate clue and completion
bar, and three finishing-details stages. On completion, the full-screen
reveal animates coloured mathematical pieces first, then decoration stages.
Students can skip, replay, save a PNG, or make a picture again. A completed
gallery thumbnail shows all details, while unfinished art remains mysterious.
Motion can be disabled through reduced-motion settings.

## Save migration and independence

Original key: \`inequality-ink-plot-shade-prototype-v1\`
New key: \`inequality-ink-plot-shade-v2\`

The original Umbrella record is imported, including a valid partially
completed sketch/style/shade step; the legacy key is not deleted. The new
save contains a named record per picture, with current piece, current
construction task, confirmed earlier boundaries, raw editable points,
chosen style and replay count. Saved constructions are revalidated against
the authored mathematical rules to prevent corrupted saves bypassing tasks.

Existing Pixel Art, Find & Fill, Build & Shade and Curve & Fill save keys
are unaffected.

## Implementation

- \`regions/plot-engine.mjs\`: exact construction of line/parabola/circle/V
- \`regions/plot-pictures.mjs\`: all five unique picture definitions, sample
  constructions, details, difficulty and validation
- \`regions/plot-art.mjs\`: saved state, gallery, plotting, style, region
  selection, reveal and PNG export
- \`regions/plot.html\`, \`regions/plot-art.css\`: matching Graph Art UI
- \`regions/curved-engine.mjs\`: existing real inequality region evaluation
- \`plot-art.test.mjs\`, \`plot-engine.test.mjs\`: maths and interaction QA

This release expands the existing small prototype into the full mode; it
does not introduce an additional fifth Graph Art mode.
