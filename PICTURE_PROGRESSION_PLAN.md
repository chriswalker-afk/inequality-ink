# Picture Progression Plan

**October 2026 update — Mixed Challenge now has its own artwork.**
The original sections below document the first rollout, which deliberately
reused Full/Solve pictures in Mixed. That initial reuse has since been
superseded. Mixed now has an **independent five-picture primary journey**,
each requiring Mirror Mode, Full Picture and Solve & Paint skills:

| Step | Mixed clue | Finished art | Questions |
| --- | --- | --- | ---: |
| Starter | Pocket Guardian | Little Shield | 6 |
| Step Up | Visitor from Above | Flying Saucer | 8 |
| Building | Against the Clock | Golden Hourglass | 10 |
| Challenge | Flutter By | Butterfly | 12 |
| Big Finish | Here Be Dragons | Dragon Guardian | 14 |

New picture definitions live in `mixed-pictures.mjs`; the other modes'
paths are unaffected. The original shared Mixed pictures (including
Enchanted Potion) are retained under **More pictures**, preserving all
existing IDs, questions and saved progress. Every core Mixed picture
contains mirrored one-sided, full bounded and algebraic problems, with
more difficult negative-coefficient questions in the finale.

---

**Status:** **Quick-win progression implemented** — five accessible picture stages in every mode; classroom evaluation and optional soft unlocking remain future considerations.
**Scope:** Inequality Ink, all five challenge modes
**Goal:** Make early successes happen after only a handful of questions, then visibly build towards more demanding pictures, while keeping the mathematical integrity and the existing saved work.
**Related live site:** https://chriswalker-afk.github.io/inequality-ink/

## 1. The change we want students to experience

Currently students choose a challenge and then choose from a relatively flat group of pictures. Most available pictures require **14 completed rows**. As a result, a student can spend several minutes without completing anything substantial.

The new experience should be:

1. Choose a challenge.
2. Choose a picture from a **clearly ordered progression**, starting with a quick win.
3. Finish a small picture after **6 actual picture questions**, see the same full-screen colour celebration, and earn a completion tick.
4. Continue through **8, 10, 12 and 14 questions** as confidence grows.
5. In **Paint by Inequalities**, the main challenge also increases from **two to five paintable colours**.
6. See a clear next step, while retaining access to previously started and advanced pictures.

### Non-negotiable design decisions

- Rename the heading **“CHOOSE A MYSTERY” → “CHOOSE A PICTURE”** (including accessible labels, navigation and corresponding copy). Retain the playful, non-spoiler **clue** titles; reveal the real **name** on completion.
- Make the **first completed image** achievable with **6 questions**, not 14. Each correct row should be an obvious proportion of the emerging picture.
- Keep the **existing five challenge modes**, mathematics, check behaviour, mobile touch interaction, saved progress, full-screen reveal and PNG download.
- **Never edit an existing picture's ID, row count or mathematical answer sequence** simply to shorten it. Add new pictures for the early steps; keep older work accessible.
- Do not gate the first small picture behind the current two-question general practice. Show contextual help or provide optional practice instead.
- **Do not impose compulsory unlocking in the initial release.** Make the progression visibly recommended; evaluate optional soft unlocks only after testing with students. Nobody should lose access to previously started pictures.

## 2. Five stages, one simple visual language

| Step | Student-facing label | Typical rows/questions | Intent |
| --- | --- | ---: | --- |
| 1 | **Starter** | **6** | Quick win; finish a recognisable icon in a few minutes |
| 2 | **Step Up** | **8** | Repeat the key skill with slightly more nuance |
| 3 | **Building** | **10** | Build fluency and greater image detail |
| 4 | **Challenge** | **12** | Longer, more varied row shapes or colour rules |
| 5 | **Big Finish** | **14** | Current larger illustrations and their staged celebration |

Each challenge-mode picker should display these **five primary stages in order**. The currently available older pictures that are not part of the primary path remain in a separate, clearly labelled **“More pictures”** section. This is a curated path, **not** deletion or rewriting of the existing gallery.

Suggested picker card:

> **1 · Starter** — **Twinkle Time**  
> 6 rows · Quick win · Not started  
> *(Completed example: ✓ Finished)*

For Paint by Inequalities, show **colours as the headline** and rows secondarily:

> **1 · Starter** — **Sweet Heart**  
> 2 colours · 6 rows · Quick win

Use the existing clue-title system: display the actual image name only after completion. A small completion tick is appropriate. Avoid large badges competing with the picture titles.

## 3. Curated picture sequences

### Mirror Mode: one-sided rays and a mirrored reveal

| Step | Clue / working title | Revealed picture | Questions | Approx. authored half-width | Source |
| --- | --- | --- | ---: | ---: | --- |
| 1 · Starter | **Twinkle Time** | Little Star | 6 | 6 columns | New |
| 2 · Step Up | **Heart in a Hurry** | Small Heart | 8 | 7–8 columns | New |
| 3 · Building | **Bounce Around** | Ball | 10 | 8 columns | New |
| 4 · Challenge | **Petal Pop** | Simple Flower | 12 | 9 columns | New |
| 5 · Big Finish | **Whisker Wink** | Cat Cameo | 14 | 10 columns | **Existing ID: cat-cameo** |

Keep **heart-glow**, **coral-crab** and **twilight-owl** accessible under More pictures, with their existing progress.

**Artwork constraint:** Every authored half-row must touch the left or right edge so a *single* genuine one-sided inequality can produce it. The reflected result must remain four-way-connected. A stylised star/flower may need simplified connected silhouettes and staged finishing details rather than visually disjoint points or petals.

### Full Picture, Solve & Paint and Mixed Challenge: graduated sizes

These three modes can initially **reuse the same four new small silhouettes**. This has a pedagogical benefit: the student meets a familiar picture while the **mathematics changes** across modes, rather than having to learn a new visual task every time.

| Step | Clue / working title | Revealed picture | Questions | Suggested grid | Source |
| --- | --- | --- | ---: | --- | --- |
| 1 · Starter | **Star in a Flash** | Starburst / simple star | 6 | 8 × 8 | New, shared |
| 2 · Step Up | **Wrapped with Wonder** | Gift Box | 8 | 8 × 10 | New, shared |
| 3 · Building | **Bouncy Business** | Round Ball | 10 | 10 × 12 | New, shared |
| 4 · Challenge | **Flower Burst** | Flower | 12 | 12 × 14 | New, shared |
| 5 · Big Finish, **Full** | **Woodland Wonder** | Mushroom Mystery | 14 | Existing 16 × 16 | **Existing ID: mushroom-mystery** |
| 5 · Big Finish, **Solve** | **Blast Off** | Rocket Launch | 14 | Existing 16 × 16 | **Existing ID: rocket-launch** |
| 5 · Big Finish, **Mixed** | **Bubbling Brew** | Enchanted Potion | 14 | Existing 16 × 16 | **Existing ID: enchanted-potion** |

Each of the three modes gets **five primary pictures**, but the fifth picture is **mode-specific**. Existing full-picture artwork not selected for that mode's Big Finish remains playable in its **More pictures** collection. The four shared small pictures are authored once, validated for all three modes and offered in each mode's primary path.

**Mathematical constraints:**

- Every row must be **one contiguous interval**; one bounded inequality cannot create two separate horizontal runs.
- **Mixed Challenge requires horizontal symmetry and an even width**. Design all four new small full sprites for this stricter constraint so they can be reused safely.
- A 6-row **Solve & Paint** starter must still contain meaningful algebra and at least one negative-coefficient sign reversal.
- A 6-row **Mixed Challenge** starter must still contain its three main activities (read, draw and solve), not accidentally reduce to a single type.
- Keep exact open/closed endpoint marking and realistic number-line positions. Never substitute “same shaded integer squares” for equivalent real inequalities.

### Paint by Inequalities: colours **and** row count increase

**Colour count means distinct paintable swatches, including the background swatch**, because students must actively paint background-coloured squares too. It does **not** mean the count of separate inequality rules in one row; repeated colours can appear in different contiguous runs.

| Step | Clue / working title | Revealed picture | Questions | Colour count | Suggested grid | Source |
| --- | --- | --- | ---: | ---: | --- | --- |
| 1 · Starter | **Sweet Heart** | Heart | 6 | **2** | 8 × 8 | New |
| 2 · Step Up | **Star Splash** | Star / bright burst | 8 | **2** | 8 × 10 | New |
| 3 · Building | **Daisy Days** | Simple Daisy | 10 | **3** | 10 × 12 | New |
| 4 · Challenge | **Ready for Launch** | Little Rocket | 12 | **4** | 10 × 14 | New |
| 5 · Big Finish | **Beep Beep Buddy** | Friendly Robot | 14 | **5** | Existing 10 × 16 | **Existing ID: paint-robot** |

Keep **paint-rocket** and **paint-flower** in More pictures, with existing saved work. These currently also have **five paintable swatches including background**.

**Make the early paintings genuinely simple:** fewer swatches, larger touch targets, familiar shapes, and uncomplicated boundaries. Students should *read and apply* the inequalities, not infer colour from the hidden image. Every integer-labelled cell still has exactly one mathematically correct colour.

For the first two-colour sprites, many rows can have **background–object–background** (three contiguous colour runs but only two swatches). Avoid lots of complex alternating runs at the Starter stage.

## 4. Picker and progress experience

### Layout

Within each selected challenge:

1. Heading: **Choose a picture**.
2. Short mode-aware encouragement:
   - Non-paint: “Start small. Each picture gets a little bigger.”
   - Paint: “Start with two colours, then take on richer pictures.”
3. **Your progress:** “2 of 5 pictures complete” with a five-step progression strip.
4. Primary path: **five cards** in order (Starter → Big Finish).
5. Secondary expandable section: **More pictures**, containing existing extra artwork with its original progress.
6. Context-sensitive primary action: **Start**, **Continue**, or **View completed picture**.

### Each picture card should show

- Its clue title, never the hidden true name when unfinished.
- Step number and tier label.
- **Actual question count** from the data, not a manually typed number.
- In Paint mode, **actual distinct swatch count** from its palette.
- Status: Not started / In progress (e.g. “3 of 8 rows”) / Completed.
- A clear but restrained suggestion for the **next unfinished primary picture**.

After the final reveal and summary, include a **“Next picture”** action that selects the next step but does not start the next activity automatically. Preserve Replay, Save image and Choose challenge actions.

### Duration copy

Replace the hard-coded “About 15–20 minutes” on every selection. Use copy like “6 rows · Quick win”; optionally introduce estimated times **only after testing** with real students. An arbitrary estimate is less useful than an honest row/colour count.

### First-run practice

Currently the non-paint modes have two standalone tutorial questions. For the first 6-row picture:

- **Begin painting the real picture immediately.**
- Put small optional instructions/hints inline, with a **“Practise first”** action available for students who want it.
- Do not count optional practice in the six-picture-question promise.
- Retain the tutorial mechanism for higher steps and for students who explicitly choose practice.

This is important: **six picture rows should feel like six successful actions leading to a celebration**, not eight or more required questions.

### Unlocking (separate decision / Phase 2)

Start with **ordered, unlocked cards** and a visibly highlighted next recommendation. This gives a meaningful path without preventing a teacher from assigning a later picture or a confident student from choosing one.

After a classroom trial, consider **soft unlocking** (muted later cards with “Complete the previous step” guidance), while retaining an explicit **“Play anyway”** / teacher override. Never block a picture a student has already started or completed. Hard locks are **not** part of this first implementation.

## 5. Architecture and data changes

### Suggested authoring metadata

Keep the current stable picture IDs, true names, clues and supported modes. Add a mode-specific **primary path position**:

~~~js
// New six-question full picture, reused for three mathematics modes:
{
  id: "full-star-starter",
  name: "Starburst",
  clue: "Star in a Flash",
  levels: ["full", "solve", "mixed"],
  progression: { full: 1, solve: 1, mixed: 1 },
  height: 8,
  rows: [/* six valid, connected, symmetric rows */]
}

// Existing 14-question picture used as the Full mode finale:
{
  id: "mushroom-mystery",  // MUST NOT CHANGE
  name: "Mushroom Mystery",
  clue: "Woodland Wonder",
  progression: { full: 5 },
  // Existing rows, clues, modes and save keys retained.
}
~~~

An enabled mode **without** a progression position is a **More pictures** entry. Derive the tier label from the position instead of repeatedly writing it into every picture. Reject duplicate positions within a mode and require **exactly one primary picture at each step 1–5** before deployment.

**Do not change** the semantics of the existing supported-mode list. A picture that was playable in Full, Solve and Mixed remains playable in all three; it may simply be a main-path finale in one and an extra in the others.

### File-by-file implementation

| File | Required work |
| --- | --- |
| **pictures.mjs** | Add four small Mirror sprites and four small shared Full/Solve/Mixed sprites; assign progression positions; preserve all existing definitions and IDs. |
| **paint-pictures.mjs** | Add four small paint sprites with 2/2/3/4 colour counts; assign the existing robot as Paint step 5; preserve the other existing paint images. |
| **picture-engine.mjs** | Add helpers to return **ordered primary-path** and **extra** pictures for a mode; make the default selection its Starter while honouring a saved existing selection; validate unique step numbers, connected silhouettes, valid maths and the 6/8/10/12/14 sequence. |
| **paint-engine.mjs** | Remove the **exactly 14 rows** requirement; allow short grids (6, 8, 10, 12, 14) and **two** palette swatches; keep the one-colour-per-integer, non-overlapping genuine inequality validation. Permit a single-run row only if a pedagogically useful design genuinely requires it; otherwise design beginner sprites with at least two contiguous runs per row. |
| **model.mjs** | Retain the five mathematical modes and exact inequality definitions. Adapt the starter-practice flow only if necessary without removing optional help. |
| **app.mjs** | Render five ordered progression cards plus More pictures; show correct row/colour counts and completion state; add next-picture action; make the first starter question begin immediately; ensure all progress calculations use dynamic question counts. |
| **index.html** | Rename picker/ARIA labels to “Choose a picture”; add progress strip, tier labels, expandable extras and optional next-picture action in the completed summary. |
| **styles.css** | Clearly show progression on desktop/mobile; support small picture aspect ratios and compact cards; preserve the **single-screen Paint studio** at common phone sizes. |
| **PICTURE_GUIDE.md** | Document new progression metadata, 6–14-row authoring, symmetry/connection constraints and paint colour counts. |
| **README.md** | Describe the progression and quick-start experience; keep an accurate, generated-or-maintained count of pictures and mode combinations. |
| **\*.test.mjs**, **.github/workflows/verify.yml** | Add step-ordering, short-picture mathematics, new paint palettes, saved-progress, full-play-through and responsive-layout regression tests. |

### Current assumptions to remove or audit

- **Paint validator:** presently requires **14 rows** and **at least three swatches**. Both must become flexible.
- **Hard-coded strings and tests:** some currently assert 14 questions, a fixed number of pictures, or exact historical gallery contents. Update them to check the intended curated path and extra collection without weakening the mathematics tests.
- **Existing gallery order:** pictures currently appear in data-definition order, with the default equal to the first picture. This must change for the curated path while not overriding an active saved selection.
- **Intro and reveal sizing:** inspect any assumptions about 16-row canvases, the progress bar, row-by-row celebration and PNG export. Use the picture's own height and question count.
- **Paint phone layout:** the newly built one-screen studio uses a variable picture aspect ratio and an enlarged active-row strip. Verify widths of **8 and 10** and heights of **8, 10, 12, 14 and 16** without introducing clipped brushes or Check buttons.

## 6. Student progress and backwards compatibility

Progress is currently saved under **level + picture ID** in local storage. This must remain stable.

- **Never rename or recycle an existing ID** just to change its sequence position.
- Keep all completed, attempted and partially coloured existing pictures in the gallery.
- A picture previously selected by a returning student should **remain selected** if it is still supported, even if it is now in More pictures.
- New students and users without a saved selection should start on **step 1** in that mode.
- If the UI ever shows a later picture as subdued, an existing in-progress/completed one must stay fully accessible.
- Do not overwrite progress when a picture is moved between the primary path and More pictures.
- Retain replay counters and independently saved progress between challenge modes.
- Never mark the complete path as finished solely because one extra picture was completed; the path numerator should count only **its five core steps**.

The row count of an **existing** picture remains unchanged, avoiding invalidating its saved “done” number and paint draft.

## 7. Acceptance tests before release

### Maths and artwork

- Every mode has exactly **five ordered core steps** requiring **6/8/10/12/14** correct rows; all existing extras still appear.
- New Mirror rows obey the one-ray boundary rule, connect after reflection and have mathematically valid right/left rays with open/closed circles.
- New shared Full pictures use one contiguous interval per row and have symmetric, even-width silhouettes valid in Mixed.
- Replay variants for every newly added sprite draw **exactly** the required integer cells but remain mathematically precise for open/closed real endpoints.
- Paint starter pictures have **2/2/3/4/5 distinct paintable swatches** across the five steps and every integer square has **exactly one** colour rule.
- All new silhouettes remain recognisable and connected; decorative marks sit inside the image and finish correctly.

### Student journey

- A brand-new student can complete the first **6-question** picture and see the full-screen reveal without compulsory unrelated practice questions.
- A correct answer still checks, paints and advances with **one press**; a wrong answer does not advance.
- The main picture's progress bar, row numbers, final label, art, download and reveal all work with **6, 8, 10, 12 and 14** rows.
- Paint's active numbered row, colour buttons, eraser, finger swipe, error flash and locked completed colours work for small widths and short heights.
- After finishing, a **Next picture** action selects the next suggested stage (without auto-starting it).
- Switching challenges does not reset picture progress, and previously selected bonus pictures still load.

### UI and accessibility

- “**Choose a picture**” appears consistently in the heading and accessible picker label.
- Stage names, row counts, and (in Paint) colour counts are clearly visible and accurate.
- Long-running pictures are in More pictures, not silently removed.
- Keyboard, click, touch, focus and reduced-motion alternatives remain functional.
- Test **320 × 568, 375 × 667, 390 × 844, tablet landscape, desktop 1366 × 768**. Ensure no controls are clipped; allow a safe short-landscape fallback where necessary.
- The initial small-art preview must not reveal the real picture name or the hidden solution.
- Run **node --test \*.test.mjs**, per-file syntax checks and GitHub Actions verification. Compare the finished art with the actual picture definition.

## 8. Delivery phases and recommended build order

### Phase A — Core structure (one PR)

1. Add optional mode-specific progression metadata and helpers.
2. Rename “Choose a mystery” to **“Choose a picture”**.
3. Render ordered stages, counts, completion state and More pictures.
4. Keep all cards selectable; preserve saved selections.
5. Introduce regression tests for sequencing and backwards compatibility.

**Review point:** The gallery now reads as a progression, even before all the small pictures exist. Avoid shipping incomplete 1–5 sequences as though they are finished; temporary early-step content can be explicitly labelled “coming next” during development.

### Phase B — Quick wins for maths modes (one or two PRs)

1. Author and mathematically validate **four Mirror starters**.
2. Author and validate **four shared Full/Solve/Mixed starters**.
3. Set existing Cat / Mushroom / Rocket / Potion as the relevant Big Finish.
4. Enable the short Starter flow without compulsory general tutorials.
5. Check animated reveal and artwork quality at small sizes.

**Review point:** Students can complete a legitimate six-row picture quickly in every inequality-drawing mode.

### Phase C — Paint colour ladder (one PR)

1. Generalise paint validation from fixed 14 rows and ≥3 colours.
2. Author 2-colour Heart and Star, 3-colour Daisy and 4-colour Rocket.
3. Use existing 5-colour Robot as the final challenge.
4. Check the compact one-screen studio with variable widths/heights.
5. Run complete simulated play-throughs for all five painting stages.

**Review point:** Colours and row counts increase visibly, without adding scrolling or complex brush switching back to the mobile experience.

### Phase D — Polishing and evidence (one PR)

1. Add Next picture recommendations and concise encouragement after completion.
2. Test with students at different starting points: time to first finished picture, ability to identify the next step, successful completion rate, and whether larger stages feel manageable.
3. Adjust tier copy, early artwork recognisability and question variety using this feedback.
4. Consider, **but do not automatically enable**, optional soft unlocking after the pilot.

## 9. Definition of done

A student choosing any of the five modes sees a clear **five-picture journey**, starts with an accessible small picture, can achieve a **full reveal after six correct picture questions**, knows exactly what is next, and can progress toward a larger 14-question finale. In Paint by Inequalities, the visible progression moves through **two to five colours**. The original twelve-picture library and its saved progress are retained within the new twenty-four-picture gallery.

---

**Implementation note:** The five-stage gallery, twelve new small pictures, dynamic row and colour counts, six-question Starter flow, Next picture action and preservation of existing saved work have now been implemented. The delivery phases remain as a record of the design process. Classroom testing and optional soft unlocking are still future improvements; no picture is forcibly locked.
