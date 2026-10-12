# Inequality Ink

A no-login, browser-based pixel-art inequality game for **Edexcel 4MA1 Foundation Mathematics**. Students read, represent and solve exact real-number inequalities; the correct answers construct a mystery picture, which gains a background, colours and finishing details on completion.

**Live site:** https://chriswalker-afk.github.io/inequality-ink/

> **Picture progression implemented:** [Read the original picture progression plan](PICTURE_PROGRESSION_PLAN.md). Each mode offers five ordered quick-win pictures (6, 8, 10, 12 and 14 questions) and a separate **More pictures** gallery retaining the original artwork and saved results. No compulsory practice questions delay the first six-row Starter.

## Choose a challenge and a picture

| Difficulty | Mathematics | Pictures included |
| --- | --- | --- |
| **Mirror Mode** | One-sided inequalities. Each correct ray paints one row of a half-image. The completed half-image unfolds across a vertical axis at the end. | **Whisker Wink**; **Full of Feeling**; **Seaside Sidestep**; **Night Watch** |
| **Full Picture** | Read and draw bounded inequalities, including open and closed endpoints. | **Woodland Wonder**; **Blast Off**; **In Full Bloom**; **Bubbling Brew**; **Sweet Scoop** |
| **Solve & Paint** | Solve compound inequalities (including reversing signs with negative coefficients), then draw the exact interval. | All five full pictures |
| **Mixed Challenge** | Read, draw and solve inequalities, including one-sided rays reflected for suitable symmetrical rows. | All five full pictures |
| **Paint by Inequalities** | Read 2–4 colour inequalities per row and directly paint the integer-labelled squares. Only the current row can be edited; correct rows lock with their numbers removed. | **To the Moon**, **Petal Parade**, **Beep Beep Buddy** |

The library now contains **twenty-four unique pictures** offering **42 picture/difficulty combinations**. The selector uses playful, spoiler-free **clue titles** (such as *To the Moon*) rather than numbered mysteries. Completing an activity reveals its actual picture name, which then also appears beneath its clue in the picker. Every picture and difficulty has **independently saved progress**. Students can switch pictures without losing their previous work.

### New quick wins and colour progression

Every mode now has a **Starter → Step Up → Building → Challenge → Big Finish** path requiring **6 → 8 → 10 → 12 → 14 real picture questions**. Students get a proper colour reveal after six correct starter rows, with an optional Next picture action, and can choose any picture in any order.

- **Mirror:** Twinkle Time → Heart in a Hurry → Bounce Around → Petal Pop → Whisker Wink.
- **Full:** Star in a Flash → Wrapped with Wonder → Bouncy Business → Flower Burst → Woodland Wonder.
- **Solve:** The same four small silhouettes, ending with Blast Off.
- **Mixed:** The same four small silhouettes, ending with Bubbling Brew.
- **Paint:** Sweet Heart (2 colours) → Star Splash (2) → Daisy Days (3) → Ready for Launch (4) → Beep Beep Buddy (5).

The large existing pictures are **not removed**. Bonus titles stay accessible in **More pictures** with their saved progress and replay statistics. Existing v1–v5 scores keep their original picture IDs. The site automatically suggests the next unfinished stage but **does not lock** later pictures.

### Five additional pictures (October 2026)

The five new pictures were authored as independent mathematical silhouettes, with separate symmetric colours, backgrounds and animated finishing details:

- **Coral Crab** — 10-column Mirror Mode half-image; claws, eyes, cheeks, feet and a seaside background
- **Twilight Owl** — 9-column Mirror Mode half-image; ear tufts, big eyes, beak, wings, feet and a night-sky background
- **Blooming Flower** — a full, 16-column symmetrical flower and pot; petal highlights, golden centre, leaves and pot pattern
- **Enchanted Potion** — a full, 16-column symmetrical bottle; coloured magical liquid, glass highlights, bubbles and sparkle details
- **Ice Cream Treat** — a full, 16-column symmetrical sundae cone; cherry, sauce, colourful sprinkles and waffle pattern

**Educational variety:** Crab and Owl each generate a roughly balanced mix of left- and right-pointing rays and open/closed endpoint questions. The three full pictures have varied widths, and all support Full Picture, Solve & Paint (including negative linear coefficients) and Mixed Challenge. Automated tests check that their generated questions paint precisely the intended picture across many replay variations.

### New: Paint by Inequalities

Unlike the four original modes, this mode asks students to build a **fully coloured pixel picture** directly.

- The pictures have **6–14 rows and 8–10 columns**. Each active square shows its corresponding integer, and only that row can be edited.
- Each row has **one to four genuine real-number inequality rules**, each paired with a named colour. For example, a sky-blue swatch might read \`x < −3\` and an orange swatch \`x ≥ −3\`. Rules never overlap or leave uncoloured integers.
- Click/tap a coloured inequality to select that **specific rule and its paint colour**, then tap or swipe along the enlarged numbered row (or directly on its highlighted row in the picture). When two separate inequalities use the same colour, **only the tapped inequality is highlighted**, but either one still paints with that colour. Both painting surfaces use the **same saved draft**. An eraser and Clear row action remain available.
- **Single-screen workspace:** the full picture stays visible beside the inequality rules, which also act as colour swatches. A large, numbered **active-row strip** underneath mirrors the highlighted row in the picture, making it much easier to paint on a phone. The eraser, Clear row and **one Check row button** stay on the same screen, without scrolling between maths, brushes and canvas. The inequality cards are compact rather than stretching to fill the height of the picture; on unusually short screens their list can scroll if needed, without hiding the enlarged row and Check button.
- An incorrect row briefly flashes orange on the incorrect/unpainted cells but stays editable. A correct row flashes green, **loses its integer labels**, and leaves its colours in place before the next row activates automatically.
- In-progress rows are saved locally. Changing pictures preserves progress, without changing completion statistics from the existing modes.
- The completed picture uses the same **full-screen celebration, background, animated finishing details and PNG download** as other modes.

The colour puzzles and swatches are declarative data in **\`paint-pictures.mjs\`**. The independent **\`paint-engine.mjs\`** generates one-sided and bounded inequalities from each row's colour runs and validates that every rule colours exactly the intended integer-labelled cells. Replay can vary which strict/inclusive endpoints are shown while preserving the same target picture.

## Reusable picture engine

The game no longer needs a separate question-writing routine or illustration renderer for each picture.

- **`model.mjs`** — *pure mathematics*: correct inequality membership, exact marking, formatting, linear algebra and tutorial questions. No artwork data.
- **`pictures.mjs`** — the **declarative picture library**: names, permitted difficulties, number-line windows, row silhouettes, palettes, background and finishing details.
- **`picture-engine.mjs`** — reusable picture-independent mathematical engine: question creation, replay variants, integer-column sampling, mirror symmetry, colouring, connectivity and content validation.
- **`paint-pictures.mjs`** — three authored multi-colour pixel grids and palettes.
- **`starter-pictures.mjs`** — eight small, validated mathematical silhouettes for Mirror, Full, Solve and Mixed.
- **`paint-starters.mjs`** — four short colour puzzles introducing two, three and four swatches.
- **`paint-engine.mjs`** — generates exact non-overlapping colour inequalities for every row and verifies painting.
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

### Fluid question flow and direct endpoint controls

The **Check & paint** button is the only confirmation needed for an inequality. If an answer is incorrect, the student stays on that question and receives targeted feedback. If correct, the completed row is painted and the next question arrives automatically after a short acknowledgement; on the last row, the full-screen reveal opens automatically. This also applies to the introductory practice questions. No separate *Next row* button is needed.

On the interactive number line:

- **Left-click (mouse) or quick tap (touch)** an endpoint circle to switch directly between **open** and **closed** without changing its number.
- **Drag** the same circle to move the endpoint **without** changing whether it is open or closed. The tap-versus-drag threshold is based on CSS pixels, so the interaction is consistent across devices.
- **Press Enter/Space** while an endpoint circle is keyboard-focused to toggle its state. The numbered ticks, +/- steppers and Open/Closed buttons are retained as alternate controls.
- On narrow mobile screens the game scrolls the new question into view automatically after a correct answer. Any pending transition is cancelled when the student switches activities or restarts.

### Live ghost previews and answer feedback

The picture responds **before** the student presses Check & paint:

- In **Read** questions, selecting one of the inequality options displays a faint blue-grey ghost of the pixels it would produce.
- In **Draw** and **Solve & Paint**, the ghost changes immediately when the student moves an endpoint, switches the direction, taps a circle open/closed, or uses the numeric controls.
- Ghosts use the **exact same inequality-to-pixel projection** as the accepted answer, including Mirror Mode canvas clipping and reflected rows in Mixed Challenge. A *wrong* guess is not clipped to the hidden silhouette, because students need to see the actual consequence of their attempt.
- On **Check**, an incorrect attempt flashes **orange**, then returns to the light ghost so it can be adjusted. A correct attempt flashes **green**, then becomes the usual **slate-blue committed row** before automatically advancing. The final artwork colours are still held back for the completion celebration.
- On mobile a **compact sticky preview** stays next to the answer controls, synchronized with the large picture, so students can see their ghost without scrolling back up.
- Previews are temporary visual feedback: they do not change progress, scores or saved pixels. Empty guesses and the initial untouched controls do not reveal the secret artwork. Reduced-motion preferences are respected.

The test suite checks this behaviour across the **19 picture/difficulty combinations**, plus strict mathematical marking, mistaken off-silhouette pixels, mobile previews, the orange/green transitions and automatic progress.

### Full-screen celebration before results

After answering the last inequality, the game opens a **full-screen picture reveal** rather than taking the student straight to their score. This is intentional on both mobile and desktop; the completed picture is the reward and must be clearly visible without downloading it.

1. The monochrome picture **builds row by row**, using the exact generated inequality solutions.
2. In **Mirror Mode**, the finished half-picture **unfolds around its vertical axis**.
3. The whole image then gains its **colour and picture-specific background**.
4. The picture's **eyes, spots, whiskers, bubbles or other details** are added in separate finishing stages.
5. The result stays on screen until the student presses **×**, which closes the reveal and displays the results/summary screen.

The reveal is **equally immersive on desktop**: its full-screen artwork scales with available screen height and gains decorative sparkles at completion. On mobile it retains touch-friendly safe-area spacing. Both have a large close control, a **Show the finished picture** button to skip animation without skipping the picture screen, and a reduced-motion alternative. The completed picture is also available through **View the reveal again** on the summary.

Finished pictures can be saved as PNG files with their full colour, backdrop and details.

## Add a new picture

See **[PICTURE_GUIDE.md](PICTURE_GUIDE.md)** for the full schema and creation checklist.

A new puzzle is a single additional object in the `PICTURE_DEFINITIONS` array in `pictures.mjs` containing:

```js
{
  id: "a-unique-id",
  name: "Secret final picture name",
  clue: "A playful clue, not the final picture name",
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
node --check paint-engine.mjs
node --check paint-pictures.mjs
```

GitHub Actions executes these automatically on pushes and pull requests. Deploy as a static site with **Settings → Pages → Deploy from a branch → main → /(root)**.

### Student privacy

Only picture/difficulty progress and local scores are retained, using the browser's `localStorage`. Existing progress from the previous single-picture version is migrated to its corresponding original picture. No student accounts, work submissions, analytics or backend are used.
