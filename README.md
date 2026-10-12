# Inequality Ink

**Inequality Ink** is an interactive pixel-art mathematics game for Pearson Edexcel International GCSE Mathematics A (4MA1), Foundation Tier. Students read, draw and solve inequalities to construct a continuous pixel-art picture. Every row is determined by an inequality solution, rather than merely unlocked as a reward.

**Game:** https://chriswalker-afk.github.io/inequality-ink/ (requires GitHub Pages to be enabled in repository settings).

## One picture, four difficulty levels

All four levels build exactly the same **16 × 16** symmetric mushroom.

| Level | Mathematics | How the picture is constructed |
| --- | --- | --- |
| **Mirror Mode** (starter) | One-sided inequalities, read then draw | A correct real-number ray is sampled on the indicated left or right half of the pixel grid, then reflected across the central vertical axis |
| **Full Picture** | Double-ended inequalities, read then draw | The correct two-ended solution determines all pixels in that row |
| **Solve & Paint** | Solve compound linear inequalities, including dividing by negatives | The correctly solved interval directly paints the entire row |
| **Mixed Challenge** | All three question styles | Each row uses the corresponding exact mirror or full-interval rule |

**Important mathematical distinction:** In Mirror Mode, for example, students draw the entire real solution \`x ≤ 3\`, *not* an artificially bounded solution such as \`0 ≤ x ≤ 3\`. The website samples the correct ray at integer columns on only the indicated **right half** (columns 0 to 7); it then reflects those pixels onto the left half (columns −8 to −1). The reflection is an art operation, not a claim that the original ray is mathematically equivalent to a bounded interval.

For a 16-column symmetric sprite with integer column values −8 to 7, the reflection formula for pixel column \`x\` is \`−x−1\`. The centre line lies between −1 and 0.

### Exact marking

Endpoints must have the correct **number** and **open/closed** convention, as well as the correct ray direction or bounded interval. For example, \`x ≤ 3\` and \`x < 4\` paint the same integer columns, but they are different real-number solutions; **only the assigned inequality is correct**.

The pixel artwork is mathematically validated for continuity, row shape, horizontal symmetry, symmetric colouring and exact equivalence between the direct and reflected pixel masks.

### Student experience

- Four selectable difficulties on the landing page; each level has **separate local progress** (changing difficulty doesn't destroy earlier work).
- 14 question rows per picture; Mirror Mode begins with reading single-sided inequalities, followed by drawing them.
- Two optional practice questions adapted to the chosen difficulty.
- Click, drag or use the large +/- controls to place endpoints; choose open or closed circles and shade left, right or between.
- The highlighted half of the number line indicates which side of the ray will be used for Mirror Mode.
- Correct answers paint a monochrome row; in Mirror Mode the reflection follows shortly afterwards. The final symmetric sprite reveals its colours when complete.
- Unlimited retries with misconception-aware feedback and up to three progressive hints.
- Local browser progress saving, first-try statistics, replay questions and finished PNG download.
- Responsive layout, accessible control labels and reduced-motion support.

## Running locally

The site is **zero-dependency**, with plain HTML, CSS and ES modules. Serve it through HTTP rather than opening HTML directly:

\`\`\`bash
python3 -m http.server 8000
\`\`\`

Open http://localhost:8000/.

### Tests

Requires Node.js 20+:

\`\`\`bash
node --test *.test.mjs
node --check app.mjs
node --check model.mjs
\`\`\`

The mathematical tests exhaustively check all four levels across hundreds of replay variations. The static contract tests check the referenced HTML IDs and important interface controls. GitHub Actions runs these tests automatically on pushes and pull requests.

## Publishing on GitHub Pages

From **Settings → Pages**, set source to **Deploy from a branch**, branch \`main\`, directory \`/(root)\` and save.

No student accounts or server-side services are used. Progress is stored only in the browser on that device.

## Files

- \`index.html\` — entry point and all accessible controls
- \`styles.css\` — responsive layout and reflection animations
- \`model.mjs\` — authoritative sprite, mathematical interval logic, mirroring, question generation, validation
- \`app.mjs\` — game interactions, exact marking, persistence, artwork and finish
- \`model.test.mjs\` — mathematical content and reflection regression tests
- \`static.test.mjs\` — interface consistency tests
- \`.github/workflows/verify.yml\` — automated verification

## Future additions

Multiple-polygon and multiple-interval silhouettes, a teacher picture builder, additional themed art, full working-step feedback and optional class-level reports.
