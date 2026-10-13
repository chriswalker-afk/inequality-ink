# Picture Authoring Guide

Inequality Ink builds its exercises from pixel-art **silhouette data**, not from a hand-written list of questions. New pictures are declared in [pictures.mjs](pictures.mjs); the engine validates their row shapes and generates the maths. The student only sees ordinary number lines.

## Current library: twenty-nine pictures (47 picture–mode combinations)

Each mode offers a five-step path of **6, 8, 10, 12 and 14 rows**. Eight starter illustrations live in `starter-pictures.mjs`, **five exclusively Mixed Challenge pictures** in `mixed-pictures.mjs` and four short Paint pictures in `paint-starters.mjs`. The original and formerly shared artwork remains accessible under More pictures.

| Mode family | Pictures (picker order) | Mathematical focus |
| --- | --- | --- |
| One-sided rays / Mirror | Cat Cameo, Heart Glow, **Coral Crab**, **Twilight Owl** | Genuine left- and right-pointing rays, open and closed circles, smaller picture-specific windows |
| Double-ended intervals / Full and Solve (Mixed extras) | Mushroom Mystery, Rocket Launch, **Blooming Flower**, **Enchanted Potion**, **Ice Cream Treat** | Varied bounded intervals, transformed algebra; historical Mixed progress preserved in More pictures |
| Original Mixed-only five-stage journey | **Little Shield**, **Flying Saucer**, **Golden Hourglass**, **Butterfly**, **Dragon Guardian** | Every picture combines mirrored one-sided rays, full bounded intervals and algebraic solutions; stages introduce stricter endpoints and sign reversals |

The new sprites are intentionally different both visually and mathematically. Crab and Owl use a roughly even balance of left and right rays with different endpoints; Flower, Potion and Ice Cream include at least six distinct row widths. Each has its own final colour palette, background and animated finishing details.

When adding future illustrations, avoid long runs of identical-width intervals unless repetition is an intentional learning objective. For Mirror Mode, aim for both ray directions and both endpoint types. The test suite checks these design-quality criteria for the five newest sprites.

## 1. Choose a mathematical picture family

**Half picture (Mirror Mode):** Work with one finite display window (e.g. `min:-4, max:4`, giving 8 integer-labelled pixel columns). Each row of the *half*-silhouette must be a single block touching its **left or right edge**. The engine generates a real one-sided ray to paint that run. The unbounded inequality is marked exactly; canvas clipping is never shown as a second endpoint. When finished, this half is reflected over a vertical axis, then coloured and illustrated.

**Full picture (Full Picture, Solve & Paint):** Each row must be **one contiguous interval** of pixels, which the engine uses to derive its two real endpoints and their open/closed circles. Solve & Paint applies linear transformations, including negative coefficients, to the same interval.

**Mixed Challenge:** Five uniquely authored pictures live in `mixed-pictures.mjs` and have `levels:["mixed"]`. A Mixed silhouette must be a **full, horizontally symmetric, even-width picture**, so selected rows can be created by reflecting one-sided rays. The four-question cycle includes reading a mirrored ray, drawing one, drawing a bounded interval, and solving a transformed bounded inequality. **Every** picture has all four tasks. Former shared art remains available as Mixed bonuses without progression positions.

A row such as `██···██` contains two disconnected runs: it cannot currently be generated from a single inequality question and the validator will reject it. Simplify the silhouette or split the question into multiple tasks in a future engine upgrade.

## 2. Design the shape as rows

Every row is `[firstPixel,lastPixel]`, **inclusive**, counting pixel positions from 0 at the **left edge of the authored grid**. Rows are listed from **top to bottom**, but students answer from the bottom upwards. The number of canvas rows depends on the picture; set height to active rows plus two to leave some empty canvas.

For example, a half-heart uses an 8-column window from −4 to 4:

```js
rows: [
  [4,7],
  [2,7],
  [1,7],
  [0,7],
  [0,7],
  [0,6],
  [0,6],
  [0,5],
  [0,5],
  [0,4],
  [0,3],
  [0,2],
  [0,1],
  [0,0]
]
```

The last row `[0,0]` occupies the single column labelled −4. A left-going ray such as `x < −3` paints that one cell, while `x ≤ −4` produces the same cell but is **a different mathematical solution**. Only the designated answer is accepted.

The active rows must touch from row to row (four-way-connected silhouette). In half pictures, the reflected full silhouette must also connect; at least one row must cross the vertical centre when mirrored.

## 3. Add one data object

Open `PICTURE_DEFINITIONS` in [pictures.mjs](pictures.mjs). Copy the structure of an existing picture, change its unique `id`, and supply:

| Field | What to put |
| --- | --- |
| `id` | Unique lowercase hyphenated slug; used for progress and PNG filename |
| `name` | The true picture name, revealed on completion |
| `clue` | A playful, non-spoiler title such as `To the Moon`; shown in the picture picker and activity heading until completion |
| `progression` | Optional mode-specific positions, e.g. `{full:1,solve:1,mixed:1}` for a starter or `{mirror:5}` for a final picture; absent means More pictures |
| `description` | Short non-spoiler metadata |
| `family` | `"half"` or `"full"` |
| `levels` | Half: `["mirror"]`; full: any combination of `"full"`, `"solve"`, `"mixed"` |
| `window` | `{min,max}` integer number-line bounds; the pixel count is `max-min` |
| `axis` | Optional larger visible number line, e.g. `{min:-9,max:8}` for the existing 16-pixel mushroom |
| `height` | Canvas height; typically `rows.length+2` for the small progressions |
| `rows` | Top-to-bottom pairs of inclusive first/last pixel indices |
| `palette` | Hex `base`, `edge`, optional `bands` with `{from,to,fill}` for selected rows |
| `background` | Hex `base`, `light`, `shade`, `sparkle` colours for the completed artwork |
| `detailStages` | Ordered labels, e.g. `["eyes","mouth"]` |
| `details` | List of `[x,y,"#rrggbb","stage",height]` decorative marks in the **finished full picture**; height defaults to 1 |

**Keep the surprise:** The `clue` is the *visible* title; the `name` is the actual image name and appears only after a student completes that picture. Avoid numbered labels (e.g. “Mystery 01”) and direct spoilers. Clues should be short, distinctive and unique within each mode. Saved progress is linked to `id`, not `clue` or `name`, so a clue may be revised later without resetting students' work.

All example picture definitions live in one place: no JavaScript functions are needed inside the picture data.

**Details are symmetrical:** Author one mark per side pair. If the full width is 16 and you place a mark at `x=3,y=7`, the engine adds its reflected mark at `x=12,y=7`. Each must land inside the final silhouette. Height may be a fraction, such as `0.25`, for short whisker strokes.

### Five-stage quick-win artwork

Each mode has exactly five core pictures. The stages are **Starter (6 rows)**, **Step Up (8)**, **Building (10)**, **Challenge (12)** and **Big Finish (14)**. The engine rejects duplicate or missing stage positions.

New symmetric, contiguous-interval full pictures *can* technically be reused across levels, but Mixed Challenge's primary path deliberately has five exclusive pictures. Small Mirror sprites must still be connected with every half-row touching an edge. Keep exact real-number endpoints visible even when a strict ray endpoint lies just outside the painted columns.

Paint by Inequalities also grows from **two to five distinct swatches** (including its actively painted background), progressing 2, 2, 3, 4, 5. Paint grids may have 6–14 rows. A complete one-colour row may have a single genuine inequality; the rule validator still checks every integer is painted exactly once.

Preserve all existing picture IDs and row counts so saved student progress remains valid. A picture without a mode-specific progression position is always offered as a bonus under More pictures.
### Stage-aware mathematical profiles

Core picture steps 1–4 use the central `math-progression.mjs` profiles. The modes retain their original skills, but open/closed endpoints and the complexity of Solve & Paint transformations are introduced in a deliberate order. In Paint by Inequalities, the rules continue to be derived from contiguous colour runs; the profiles change only the presentation of their endpoints, not the run count or painted result. Existing Stage 5 and More pictures retain their original question mathematics and replay behavior. The new Mixed-only Stage 5 is additionally guaranteed to have two negative-coefficient algebra questions on each replay.

Never change an existing picture ID or row count to adjust difficulty. For new artwork, confirm that real-number inequality endpoints remain fully visible and that every allowed replay still paints precisely the authored integer columns.

## 4. Optional first-question control

The engine can derive valid questions automatically. Usually no additional math data is needed, but the picture may supply:

- `firstStrict`: top-to-bottom booleans indicating a preference for open vs closed endpoints in the initial Mirror Mode run.
- `fullRayDirection`: which direction to use on a half-row that fills the entire width; indexed by its y-coordinate.
- `initial`: an optional top-to-bottom array of specific valid bounded intervals. This preserves familiar questions when migrating a previously published picture. Each interval can include `transform:{a,b}` to preserve the first Solve & Paint algebra question.

Replays automatically create equivalent drawings using mathematically **different** correct endpoints. The engine always checks that the generated solution paints the exact intended integer columns.

## 5. Validate before publishing

```bash
node --test *.test.mjs
node --check app.mjs
node --check picture-engine.mjs
node --check pictures.mjs
```

`validatePictureLibrary()` runs when the website starts and in automated tests. It rejects malformed IDs, disconnected art, impossible rows, bad colours, outside/overlapping detail marks, ambiguous multiple-choice reading answers, unsupported difficulties, or any derived inequality that fails to paint its intended row across multiple replay variants.

After validation, a new picture appears automatically in the picker for its supported difficulties. Progress is kept separately for each **picture + difficulty**. The final colour/background/detail reveal and PNG export are automatic.

## 6. Practical first additions

Design at a small resolution and begin with a simple outline such as a balloon, heart, star, tree, rocket or animal face. Check that each horizontal row obeys the one-interval rule. Add final decorative features (eyes, stars, mouth, windows, etc.) as `details` rather than attempting to encode them as extra separate inequality runs.

An **image upload / drag-and-drop editor is not yet implemented**. Author pictures in `pictures.mjs`; this makes new packs small and safe to review, and allows the tests to check every question before publication.
