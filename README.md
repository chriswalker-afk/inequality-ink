# Inequality Ink

An interactive, browser-based pixel-art game for **Pearson Edexcel International GCSE Mathematics A (4MA1), Foundation Tier**. Students read, draw and solve inequalities; correct number-line solutions generate exact integer pixels.

**Website (when GitHub Pages is enabled):** https://chriswalker-afk.github.io/inequality-ink/

## Two designs, four difficulties

| Difficulty | Picture | Mathematics and drawing |
| --- | --- | --- |
| **Mirror Mode** | **Cat Cameo** | 14 true one-sided inequalities draw only the **right half** of a symmetrical cat. After the final question, the half-cat unfolds across a vertical axis, the full monochrome cat appears, then it gains colour. |
| **Full Picture** | Mushroom Mystery | Read and draw two-ended inequalities. Each exact interval shades the entire horizontal row. |
| **Solve & Paint** | Mushroom Mystery | Solve linear compound inequalities before drawing the full interval. |
| **Mixed Challenge** | Mushroom Mystery | Read, draw and solve questions, including both bounded and one-sided styles. |

**Mirror Mode is intentionally different from the old row-by-row mirroring game. No row is reflected while answering questions.** Students first complete an **8 × 16** half-sprite. After all 14 questions, the completed half-sprite rotates around the central vertical axis, revealing a **16 × 16** full cat in monochrome. The game waits until the full shape is visible before fading on symmetric colours.

### How a one-sided inequality makes pixels

For the right half of Cat Cameo, the visible integer columns are **0 through 7**. Students must plot the entire mathematical real-number ray correctly.

For example, \`x > 3\` is an unbounded interval extending rightwards. The artwork uses only the integer columns in its intersection with \`{0,1,2,3,4,5,6,7}\`, namely **4, 5, 6, 7**. The canvas edge clips the *drawing only*: **no second endpoint or upper limit is shown on the number line**.

Rows near the top of the cat use right-going rays such as \`x > 3\`, while inner rows use left-going rays such as \`x ≤ 4\`. Both open and closed circles are assessed exactly. For instance, \`x ≤ 4\` and \`x < 5\` paint identical integer pixels but are different real-number solution sets, and the student must represent the assigned one.

### Cat Cameo row blueprint

Half-columns are measured outwards from the centre: 0 closest to the axis and 7 at the outside edge.

| Row (top down) | Half-columns | First-play inequality |
|---|---|---|
| 1 | 6–7 | \`x > 5\` |
| 2 | 5–7 | \`x ≥ 5\` |
| 3 | 4–7 | \`x > 3\` |
| 4 | 0–7 | \`x ≥ 0\` |
| 5 | 0–7 | \`x < 8\` |
| 6 | 0–6 | \`x ≤ 6\` |
| 7 | 0–6 | \`x < 7\` |
| 8 | 0–5 | \`x ≤ 5\` |
| 9 | 0–5 | \`x < 6\` |
| 10 | 0–4 | \`x ≤ 4\` |
| 11 | 0–4 | \`x < 5\` |
| 12 | 0–3 | \`x ≤ 3\` |
| 13 | 0–2 | \`x < 3\` |
| 14 | 0–1 | \`x ≤ 1\` |

Rows are presented to students bottom-up. The first three questions involve reading a completed number line, then students draw their own rays. Two optional practice questions establish the controls.

## Mathematical and artwork integrity

- The answer checker compares **real interval endpoints and inclusivity**, not just which integer pixels are produced.
- Cat Cameo is a deliberately authored **eight-column, four-connected half-sprite**; every half-row is a contiguous cropped ray.
- The final reflection maps half-column \(x\) to \(-x-1\) in signed full-column coordinates, with a vertical axis between the middle two columns.
- The finished symmetrical 16-column cat is connected. Colours never extend outside its mathematical silhouette.
- Full Picture, Solve & Paint and Mixed Challenge retain their existing mushroom content.
- Changing difficulty maintains **independent browser progress**. Existing progress from the old Mirror Mode is reset because the sprite and questions have changed; other difficulty progress is migrated.
- Correct answers accumulate one half-row at a time without reflecting during gameplay.
- After completion, flip, full silhouette and colour are deliberately separate stages. A **Watch the flip again** control is available.
- The experience works on mobile and desktop, with hints, keyboard-friendly endpoint controls and reduced-motion support.
- Finished colour art can be downloaded as a PNG.

## Running locally

No JavaScript dependencies or build process. Serve the project via HTTP (ES modules cannot reliably be loaded over \`file://\`):

\`\`\`bash
python3 -m http.server 8000
\`\`\`

Open http://localhost:8000/.

### Tests

Requires Node.js 20+.

\`\`\`bash
node --test *.test.mjs
node --check app.mjs
node --check model.mjs
\`\`\`

GitHub Actions runs these checks on pushes and pull requests. Tests verify clipped rays across many replay variations, symmetry, connected artwork, the exact \`x > 3\` question, and the final reveal structure.

## Publish

Go to **Settings → Pages**, choose **Deploy from a branch**, branch \`main\`, directory \`/(root)\` and save.

The app uses no logins or backend. Progress is stored in the browser's \`localStorage\` on the student's device.
