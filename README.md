# Inequality Ink

A classroom-ready pixel-art inequality game for **Pearson Edexcel International GCSE Mathematics A (4MA1), Foundation Tier**.

**Live site once GitHub Pages is activated:** https://chriswalker-afk.github.io/inequality-ink/

## The first game: Mushroom Mystery

- A deliberately designed **16 × 16** pixel-art mushroom with **14 mathematical rows**
- **Two practice questions** introducing open and closed circles and the real-number solution set
- **3 Read**, **7 Draw** and **4 Solve** picture questions
- A precise interactive SVG number line with draggable endpoints, accessible increment/decrement inputs, and open/closed circle choices
- One exact bounded integer interval per row; picture pixels appear only when the student's **real-number solution** is mathematically correct
- Targeted marking feedback, three stages of hints, replay with different equivalent algebraic inequalities, automatic browser progress saving
- Full-colour pixel-art finish and PNG export
- Responsive desktop/mobile layout, keyboard focus support and reduced-motion styles

### Why exact interval checking matters

The interval `−4 < x ≤ 2` and the distinct real interval `−3 ≤ x ≤ 2` would paint the same integer columns. We **do not** mark them both correct. The student has to plot the right endpoint numbers and the correct open/closed-circle convention.

Each pixel is sampled at its integer column value, from `−8` to `7`. Each solved interval determines every pixel in its row, and colour can only appear *within* the mathematically constructed silhouette.

## Run locally

This is a zero-dependency native-JavaScript website. The JavaScript uses ES modules, so serve the folder rather than opening `index.html` directly as a file:

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/ .

## Run the mathematical tests

Requires Node.js 20+:

```bash
node --test model.test.mjs
```

## Enable GitHub Pages

Go to **Settings → Pages → Build and deployment**, set **Source = Deploy from a branch**, choose **main** and **/(root)**, and save. As this is a plain static site, no compilation or build action is necessary.

Once GitHub Pages finishes publishing, use the live URL above. GitHub Pages is a public static site; no student credentials are required.

## Repository layout

- `index.html` – app layout, tutorial, number-line controls, completion screen
- `styles.css` – responsive game design
- `app.mjs` – interaction, precise marking, hints, saving and reveal
- `model.mjs` – validated mathematical sprite model, row intervals, questions, colours
- `model.test.mjs` – mathematical and content regression tests

## Planned expansions

More polished pictures, multiple bounded intervals per row, teacher-authored artwork with connectivity validation, and class-friendly printable/review reports.

## Privacy

Progress is saved in `localStorage` on the student's device only. The app does not collect names, authentication information or student work on any server.
