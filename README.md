# Inequality Ink

A no-login, browser-based pixel-art inequality game for **Edexcel 4MA1 Foundation Mathematics**. Students read, represent and solve exact real-number inequalities; the correct answers construct a mystery picture, which gains a background, colours and finishing details on completion.

**Live site:** https://chriswalker-afk.github.io/inequality-ink/

## Choose a difficulty and a mystery picture

| Difficulty | Mathematics | Pictures included |
| --- | --- | --- |
| **Mirror Mode** | One-sided inequalities. Each correct ray paints one row of a half-image. The completed half-image unfolds across a vertical axis at the end. | Mystery 01: **Cat Cameo** (10-column half-picture); Mystery 02: **Heart Glow** (8-column half-picture) |
| **Full Picture** | Read and draw bounded inequalities, including open and closed endpoints. | Mystery 01: **Mushroom Mystery**; Mystery 02: **Rocket Launch** |
| **Solve & Paint** | Solve compound inequalities (including reversing signs with negative coefficients), then draw the exact interval. | Both full pictures |
| **Mixed Challenge** | Read, draw and solve inequalities, including one-sided rays reflected for suitable symmetrical rows. | Both full pictures |

The picture selector intentionally says *Mystery 01* or *Mystery 02* until a picture is completed. Each picture and difficulty has **independently saved progress**. Students can switch to a different picture and return without losing their previous work.

## Reusable picture engine

The game no longer needs a separate question-writing routine or illustration renderer for each picture.

- **`model.mjs`** — *pure mathematics*: correct inequality membership, exact marking, formatting, linear algebra and tutorial questions. No artwork data.
- **`pictures.mjs`** — the **declarative picture library**: names, permitted difficulties, number-line windows, row silhouettes, palettes, background and finishing details.
- **`picture-engine.mjs`** — reusable picture-independent mathematical engine: question creation, replay variants, integer-column sampling, mirror symmetry, colouring, connectivity and content validation.
- **`app.mjs`** — one shared browser interface for selecting, playing, saving and revealing any picture.
- **`styles.css`**, **`index.html`** — responsive UI and reveal animations.
- **`picture-engine.test.mjs`**, **`model.test.mjs`**, **`static.test.mjs`** — regression tests, run by GitHub Actions.

Picture-specific artistic data is kept in `pictures.mjs`. Adding another picture no longer means modifying the marking code or duplicating the reveal animation.

### What is mathematically supported?

**Mirror Mode** requires that each occupied half-row can be represented by a genuine one-sided ray (`x < k`, `x ≥ k`, etc.). A visible window is used only to sample pixels. For example, with window `[-5,5]`, **`x < 3`** paints integer-labelled columns **−5 through 2** without altering the unbounded mathematical inequality. Each half-row must touch one canvas edge. Reflected silhouettes must be four-connected.

**Full Picture** requires a single uninterrupted block of integer-labelled pixels per row. The engine converts the endpoints into correctly included/excluded real interval boundaries, then can generate reading or drawing questions.

**Solve & Paint** uses the same pictured intervals but applies positive and negative linear transformations to generate compound inequalities that students solve and represent.

**Mixed Challenge** also requires the full silhouette to be symmetric about its vertical midpoint, so some rows can be generated from one-sided rays and correctly reflected.

The validator rejects invalid shapes, disconnected images, invalid row bounds, forbidden modes, offscreen endpoints, ambiguous reading options, invalid colours, unsymmetrical finishing details or question variants that paint the wrong columns. It checks every available mode against every authored row across replay variants.

### Colour and completion

The mathematical silhouette is drawn in monochrome. When all its rows are completed, the final picture is rendered with its picture-specific background and base colours; the character's spots, eyes, ears, portholes or other details appear in stages. Mirror Mode first unfolds a mirrored half-image before the colour/detail reveal. Reduced-motion preferences are respected.

Finished pictures can be saved as PNG files with their full colour, backdrop and details.

## Add a new picture

See **[PICTURE_GUIDE.md](PICTURE_GUIDE.md)** for the full schema and creation checklist.

A new puzzle is a single additional object in the `PICTURE_DEFINITIONS` array in `pictures.mjs` containing:

```js
{
  id: "a-unique-id",
  name: "Secret final picture name",
  mystery: "Mystery 03",
  family: "half",                   // or "full"
  levels: ["mirror"],               // full pictures: ["full","solve","mixed"]
  window: {min: -4, max: 4},       // pixel columns are -4 to 3
  height: 16,
  rows: [
    // one [firstPixel,lastPixel] pair for every active row, top-to-bottom
  ],
  palette: {base:"#f08ba6", edge:"#9c4469"},
  background: {
    base:"#f5e6f8",light:"#fff0fa",shade:"#ebd3f2",sparkle:"#fffde6"
  },
  detailStages:["sparkles"],
  details:[[2,3,"#ffeac0","sparkles"]]
}
```

Once validated, the picture appears automatically under its permitted difficulty levels and gets its own saved progress. **This is an authoring-by-data workflow**; a graphical picture-import/editor interface is not part of this release.

## Running locally and testing

Zero-dependency ES modules: no build process, accounts or external API required.

```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

Test with Node.js 22:

```bash
node --test *.test.mjs
node --check app.mjs
node --check picture-engine.mjs
node --check pictures.mjs
node --check model.mjs
```

GitHub Actions executes these automatically on pushes and pull requests. Deploy as a static site with **Settings → Pages → Deploy from a branch → main → /(root)**.

### Student privacy

Only picture/difficulty progress and local scores are retained, using the browser's `localStorage`. Existing progress from the previous single-picture version is migrated to its corresponding original picture. No student accounts, work submissions, analytics or backend are used.
