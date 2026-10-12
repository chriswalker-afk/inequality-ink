# Inequality Ink

A self-contained maths game for **Pearson Edexcel International GCSE Mathematics A (4MA1), Foundation Tier**. Students read, represent, and solve inequalities to create continuous pixel artwork.

**Live game:** https://chriswalker-afk.github.io/inequality-ink/

## The new Mirror Mode

Mirror Mode now keeps the mathematical interaction entirely ordinary. Students only see a conventional, correctly labelled number line and a question, such as **x < 3**. They are not told which pixels are generated, which part of a number line is sampled, or how the sprite is constructed.

Behind the scenes, a picture has a **number-line window**. For the first mystery picture, that window is **−5 to 5**. Each integer column from **−5 to 4** corresponds to one pixel in the half-image, so this gives **10 possible pixel columns**. For **x < 3**, the engine shades exactly the eight integer-labelled columns **−5, −4, −3, −2, −1, 0, 1, 2**. The student's answer remains an actual unbounded ray, not a bounded inequality.

The width of another picture can be chosen through its own window: for example, a window of **−3 to 3** yields six columns. The reusable `pixelsInWindow(interval,window)` function implements this without changing the rules of mathematics or modifying the UI for individual questions.

Open/closed circles are still marked as real inequalities: `x < 3` and `x ≤ 2` produce the same integer pixels but are **not** equivalent solutions, and only the assigned correct answer is accepted.

### The final reveal

During all 14 questions, students produce **only one half** of a mystery picture. When the final row is correct:

1. The complete half-picture is shown in monochrome.
2. A reflected copy folds open about a **vertical axis**.
3. The complete symmetric picture is shown in monochrome.
4. The full picture fades into colour.

The finished first Mirror Mode picture is the symmetrical **Cat Cameo**, **20 × 16** pixels. Its name and colourful details are withheld until the end of the reveal. There is a replay button, a PNG download and a reduced-motion alternative.

### Other difficulty modes

| Level | Mathematics | Artwork |
| --- | --- | --- |
| **Mirror Mode** | Genuine one-sided inequalities, first reading then drawing | Ten-column half-picture; final reflection only |
| **Full Picture** | Reading and drawing double-ended inequalities | The original mushroom |
| **Solve & Paint** | Solve compound linear inequalities before representing them | The original mushroom |
| **Mixed Challenge** | One-sided and double-ended questions, including algebra | The original mushroom |

The other three levels and their saved progress are preserved. Progress from the previous Mirror Mode is reset because its picture and number-line window changed.

## The engineering model

- `CAT_WINDOW={min:-5,max:5}` defines the visible number-line limits and the ten integer-labelled pixel positions.
- `pixelsInWindow(interval,window)` samples integer-labelled positions strictly inside `[min,max)` that satisfy the complete real-number inequality.
- The authored sprite `CAT_HALF_ROWS` is stored in zero-based half-image indices but its question generator converts positions into true real inequalities using `CAT_WINDOW.min`.
- Each row is a contiguous cropped ray; the ten-column half-image is four-connected. Reflecting it produces the continuous, symmetric 20-column full image, with all colour pixels inside the mathematical outline.
- The student's number line displays ticks only from **−5 to 5**, with a standard open or filled endpoint and one correct ray. No extra endpoints, half-line highlights or pixel mapping explanations appear.
- All drawing controls (clickable number-line ticks, draggable endpoint, numeric steppers, circle and direction selectors) use the visible window.
- `localStorage` saves progress separately for each difficulty. No student accounts or server backend.

## Running and testing

This is a zero-dependency static website. Serve the files over HTTP:

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/.

Run automated tests with Node.js 20+:

```bash
node --test *.test.mjs
node --check app.mjs
node --check model.mjs
```

GitHub Actions runs the mathematical checks on pushes and pull requests. Tests include the exact requested `x < 3` example, both strict and non-strict half-lines, configurable windows, all generated replay questions, the connected half-sprite and full-colour reflection, and student-facing UI checks.

## Publishing

Set **GitHub Settings → Pages → Deploy from a branch → main → /(root)** to publish the site.

Progress is local to the browser and is not transmitted to a server.
