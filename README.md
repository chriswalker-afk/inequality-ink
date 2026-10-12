# Inequality Ink

A no-login, browser-based pixel-art inequality game for **Edexcel 4MA1 Foundation Mathematics**. Students read, represent and solve exact real-number inequalities; the correct answers construct a mystery picture, which gains a background, colours and finishing details on completion.

**Live site:** https://chriswalker-afk.github.io/inequality-ink/

## Choose a difficulty and a mystery picture

| Difficulty | Mathematics | Pictures included |
| --- | --- | --- |
| **Mirror Mode** | One-sided inequalities. Each correct ray paints one row of a half-image. The completed half-image unfolds across a vertical axis at the end. | Mystery 01: **Cat Cameo**; 02: **Heart Glow**; 03: **Coral Crab**; 04: **Twilight Owl** |
| **Full Picture** | Read and draw bounded inequalities, including open and closed endpoints. | Mystery 01: **Mushroom Mystery**; 02: **Rocket Launch**; 03: **Blooming Flower**; 04: **Enchanted Potion**; 05: **Ice Cream Treat** |
| **Solve & Paint** | Solve compound inequalities (including reversing signs with negative coefficients), then draw the exact interval. | All five full pictures |
| **Mixed Challenge** | Read, draw and solve inequalities, including one-sided rays reflected for suitable symmetrical rows. | All five full pictures |

The library now contains **nine unique pictures** offering **19 picture/difficulty combinations**. The selector uses non-spoiler labels (*Mystery 01*, *Mystery 02*, etc.) until each picture is completed. Every picture and difficulty has **independently saved progress**. Students can switch pictures without losing their previous work.

### Five additional pictures (October 2026)

The five new pictures were authored as independent mathematical silhouettes, with separate symmetric colours, backgrounds and animated finishing details:

- **Coral Crab** — 10-column Mirror Mode half-image; claws, eyes, cheeks, feet and a seaside background
- **Twilight Owl** — 9-column Mirror Mode half-image; ear tufts, big eyes, beak, wings, feet and a night-sky background
- **Blooming Flower** — a full, 16-column symmetrical flower and pot; petal highlights, golden centre, leaves and pot pattern
- **Enchanted Potion** — a full, 16-column symmetrical bottle; coloured magical liquid, glass highlights, bubbles and sparkle details
- **Ice Cream Treat** — a full, 16-column symmetrical sundae cone; cherry, sauce, colourful sprinkles and waffle pattern

**Educational variety:** Crab and Owl each generate a roughly balanced mix of left- and right-pointing rays and open/closed endpoint questions. The three full pictures have varied widths, and all support Full Picture, Solve & Paint (including negative linear coefficients) and Mixed Challenge. Automated tests check that their generated questions paint precisely the intended picture across many replay variations.

## Reusable picture engine

The game no longer needs a separate question-writing routine or illustration renderer for each picture.

- **`model.mjs`** — *pure mathematics*: correct inequality membership, exact marking, formatting, linear algebra and tutorial questions. No artwork data.
- **`pictures.mjs`** — the **declarative picture library**: names, permitted difficulties, number-line windows, row silhouettes, palettes, background and finishing details.
- **`picture-engine.mjs`** — reusable picture-independent mathematical engine: question creation, replay variants, integer-column sampling, mirror symmetry, colouring, connectivity and content validation.
- **`app.mjs`** — one shared browser interface for selecting, playing, saving and revealing any picture.
- **`styles.css`**, **`index.html`** — responsive UI and reveal animations.
- **`picture-engine.test.mjs`**, **`model.test.mjs`**, **`static.test.mjs`**, **`app-smoke.test.mjs`** — mathematical, interface and complete simulated-student play-through tests, run by GitHub Actions.

Picture-specific artistic data is kept in `pictures.mjs`. Adding another picture no longer means modifying the marking code or duplicating the reveal animation.

### What is mathematically supported?

**Mirror Mode** requires that each occupied half-row can be represented by a genuine one-sided ray (`x < k`, `x ≥ k`, etc.). A visible window is used only to sample pixels. For example, with window `[-5,5]`, **`x < 3`** paints integer-labelled columns **−5 through 2** without altering the unbounded mathematical inequality. Each half-row must touch one canvas edge. Reflected silhouettes must be four-connected.

**Full Picture** requires a single uninterrupted block of integer-labelled pixels per row. The engine converts the endpoints into correctly included/excluded real interval boundaries, then can generate reading or drawing questions.

**Solve & Paint** uses the same pictured intervals but applies positive and negative linear transformations to generate compound inequalities that students solve and represent.

**Mixed Challenge** also requires the full silhouette to be symmetric about its vertical midpoint, so some rows can be generated from one-sided rays and correctly reflected.

The validator rejects invalid shapes, disconnected images, invalid row bounds, forbidden modes, offscreen endpoints, ambiguous reading options, invalid colours, unsymmetrical finishing details or question variants that paint the wrong columns. It checks every available mode against every authored row across replay variants.

### Full-screen celebration before results

After answering the last inequality, the game opens a **full-screen picture reveal** rather than taking the student straight to their score. This is intentional on both mobile and desktop; the completed picture is the reward and must be clearly visible without downloading it.

1. The monochrome picture **builds row by row**, using the exact generated inequality solutions.
2. In **Mirror Mode**, the finished half-picture **unfolds around its vertical axis**.
3. The whole image then gains its **colour and picture-specific background**.
4. The picture's **eyes, spots, whiskers, bubbles or other details** are added in separate finishing stages.
5. The result stays on screen until the student presses **×**, which closes the reveal and displays the results/summary screen.

The reveal has a large touch-friendly close control, a **Show the finished picture** button to skip animation without skipping the picture screen, mobile safe-area support and a reduced-motion alternative. The completed picture is also available through **View the reveal again** on the summary.

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
