# Curve & Fill — Phase 1 prototype

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
