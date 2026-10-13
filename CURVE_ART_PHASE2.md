# Curve & Fill — full five-picture mode (Phase 2)

**Live gallery:** https://chriswalker-afk.github.io/inequality-ink/regions/curve.html

Curve & Fill is the third Graph Art mode. It reuses Find & Fill's graph
workspace, real-region selection, red incorrect-region flash, translucent
correct selection, Check/Undo workflow, hints, keyboard support, and staged
full-screen reveal with PNG export.

## Five-stage progression

| Stage | Picture | Pieces | Mathematical focus |
| --- | --- | ---: | --- |
| Starter | Parabola Butterfly | 2 | Intersect two parabolas and vertical half-planes |
| Step Up | Rolling Hills | 3 | Translated parabolas and a circular sun |
| Building | Rainbow Ribbons | 4 | Coloured bands between parabolas; dashed boundaries |
| Challenge | Orbit Flower | 5 | Absolute-value graphs, parabolas, and circles |
| Big Finish | Cosmic Jellyfish | 7 | Mixed curves, circular bubbles, strict lines |

Every coloured picture piece is the *actual intersection* of displayed
inequalities, never a decorative reward for unrelated questions. Artwork
details are reserved for the final reveal and completed picture thumbnail.
The gallery has five progression stages, completion indicators, separate
per-picture saves, no locks, and short opening tasks.

## Mathematical engine

`regions/curved-engine.mjs` evaluates exact inequality membership and
renders approximated smooth regions via vertical cross-sections. Supported
families: degree 0–2 polynomials (including vertex form), vertical lines,
scaled and translated absolute-value curves, and circle interiors/exteriors.
Multiple vertical intervals permit circle complements without incorrectly
painting a hole. Correctness checks always use the original inequalities.

Like Find & Fill, an incorrect selection flashes its sign-cell region red
before clearing. A correct selection stays filled until Check. Boundary
proximity is treated neutrally; solid/dashed curves are preserved.

## Files and progress

- `regions/curve-pictures.mjs`: all five galleries and decorative stages
- `regions/curved-engine.mjs`: mathematical membership and region rendering
- `regions/curve-art.mjs`: gameplay, saves, progression, reveal and PNG
- `regions/curve.html` and `regions/curve-art.css`: matching Graph Art UI
- `curve-phase2.test.mjs`, `curve-art.test.mjs`, `curved-engine.test.mjs`: tests

The original butterfly save key `inequality-ink-curve-fill-prototype-v1`
remains readable and is not overwritten. Existing butterfly progress
is copied into the new per-picture `inequality-ink-curve-fill-v2` store.
Find & Fill, Build & Shade and Pixel Art save keys are unchanged.

**Next planned mode:** Plot & Shade (student-created graph boundaries).