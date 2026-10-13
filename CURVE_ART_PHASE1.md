# Curve & Fill — Phase 1 historical prototype

**Phase 2 is now a complete five-picture mode.** See [Phase 2](CURVE_ART_PHASE2.md).
This page documents the original two-wing prototype, which remains intact.

Visit [Curve & Fill](https://chriswalker-afk.github.io/inequality-ink/regions/curve.html) from Graph Art.

This intentionally scoped prototype tests **one complete two-piece mathematical picture**. The left and right wings are real bounded regions satisfying:
- y ≥ x² − 4
- y ≤ 4 − x²
- x ≤ 0 (left) or x > 0 (right)

The graph shows the actual parabolic boundaries, including a dashed strict right-side line, and uses the same inequalities for region fills and click validation. Tap a region, check it, then advance to the second piece. Supports touch, keyboard, hints, local progress, and restart.

Implementation:
- `regions/curved-engine.mjs`: pure function/vertical inequality evaluation and sampled smooth region polygons; existing linear clipper is unchanged.
- `regions/curve-art.mjs`, `regions/curve.html`, `regions/curve-art.css`: isolated working UI.
- `curved-engine.test.mjs`: mathematical regression checks.

Phase 2 would expand the curve rule model and gallery, and later consolidate the separate prototype into data-driven Graph Art modes. This phase deliberately leaves the original two galleries and their saves untouched.

## Consistent Find & Fill experience (Phase 1 refinement)

The Curve & Fill prototype now imports the same site-wide styles and Graph Art
workspace, rule cards, feedback panel, picture picker, two-step completion
summary and full-screen reveal as Find & Fill. The graph has matching grid and
colours. Selecting a wrong **mathematically defined sign-cell region** flashes
that whole region red then automatically clears after 950 ms. Correct selections
fill the curved region translucent green/picture colour until the separate
Check action; undo/toggle, hints and keyboard feedback mirror Find & Fill.

## Butterfly finishing details and big reveal

The two mathematically accurate quadratic wings remain untouched. Finishing
details are explicit coordinate-based SVG artwork, separate from the inequality
solver. When both wings are complete, the existing full-screen Graph Art reveal
runs a five-part sequence: left wing, right wing, decorative wing markings,
body/head/antennae, and contrast-safe sparkles, then the finished picture.
The staged SVG decorations are also included when saving the PNG.

Reduced-motion users receive the complete picture immediately. Replay,
Skip/Show finished, close and restart cancel pending timers; the finished
picture (including details) appears in the completed gallery thumbnail,
while incomplete thumbnails never spoil the decorations. Visual integration
shares the Graph Art reveal and CSS, with additional scoped SVG animations.
