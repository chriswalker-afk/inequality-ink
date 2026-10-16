# Inequality Ink

A no-login, browser-based pixel-art game for practising inequalities. Students read, represent and solve exact real-number inequalities; the correct answers construct a mystery picture, which gains a background, colours and finishing details on completion.

**Live site:** https://chriswalker-afk.github.io/inequality-ink/

> **Difficulty-first mystery play:** Students choose one of five mathematics modes and a difficulty, then discover one of at least **five pictures** at that level. The original [five-stage progression](PICTURE_PROGRESSION_PLAN.md), optional gallery and saved picture records are preserved; no compulsory practice delays starting.

## My Mural — a living collection of completed pictures

[My Mural](mural.html) is an optional, connected landscape linking five
areas: **Garden → Village → Coast → Highlands → Sky**. Students swipe or
scroll across the panorama and may jump straight to any area.

- **Only genuinely completed Pixel Art pictures appear in the mural.** No
  outlines, empty frames, greyed-out objects, or future-mystery previews
  appear in the world; the landscape itself is a softly illustrated backdrop.
- Finished sprites have **transparent backgrounds**, reusing each picture's
  exact completed pixels, colours and illustrated finishing details. They
  become part of one large scene rather than framed gallery thumbnails.
- Each of the 125 unique pictures has one stable, semantically chosen location,
  determined from the complete catalogue. Collecting another picture never
  rearranges existing discoveries. Pictures playable in multiple modes appear
  **only once** in the mural.
- Tapping or keyboard-activating an earned object opens optional details with
  the completed image and a link to revisit the original game picture.
- The **My Mural** link is accessible from the Pixel Art homepage. Finishing
  a mystery shows a subtle **Added to My Mural** link on the results screen;
  the familiar large picture reveal is never interrupted.
- The persistent, versioned `inequality-ink-mural-v1` archive preserves
  discoveries through later replays, while reading historical and existing
  `inequality-ink-v5` progress. The archive **never changes the game save**.
- Mural progress is on-device, with no accounts or cross-device sync.
  Graph Art pictures are not part of this initial Pixel Art mural.

Tests cover completed-only access, duplicate-mode achievements, archived
replay, fixed placement of all 125 pictures, transparent artwork rendering,
links, keyboard controls and the existing mathematical game suite.

## Five pictures per difficulty per mode (October 2026)

The Pixel Art library now contains **125 distinct artworks**. Because some
historical artworks are playable in more than one mode, there are **143
separately selectable mode/picture combinations**.

All **25 mode/difficulty pools** now contain at least **five playable
pictures** (five modes × five difficulty levels). This release adds **41
individually authored designs** to the previous 84, with a deliberate
emphasis on the easier tiers where variety was missing.

| Mode | New Quick Spark | New Step Up | New Ink Builder | New Brain Stretch | New Masterpiece |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mirror Mode | 2 | 1 | 2 | 2 | 2 |
| Full Picture | 2 | 1 | 2 | 2 | 2 |
| Solve & Paint | 2 | 2 | 1 | 2 | 2 |
| Mixed Challenge | 1 | 0 (already five) | 1 | 1 | 2 |
| Paint by Inequalities | 2 | 2 | 1 | 2 | 2 |

New art uses deliberately shaped pixel silhouettes rather than repeating a
single oval or triangle. Finishing details include subject-specific eyes,
windows, wheels, doors, antennae, portholes and patterned decorations.
All artwork is represented by genuine inequalities or colour-interval
questions at the correct mathematical level.

**Gameplay is unchanged:** unfinished pictures are selected randomly,
partially completed pictures can be resumed, finished pictures are excluded
from automatic selection, and the gallery allows deliberate replay. Every
new picture has its own ID and save record; older student work is untouched.
Automated tests enforce pool sizes, silhouette shape snapshots, colour rules
and mathematical correctness.

## Difficulty-first Pixel Art mysteries (October 2026)

Pixel Art's main desktop and mobile homepage now asks students to **choose a mode
and one of five mathematical difficulties**, rather than select a named picture.
The difficulties are **Quick Spark** (6 questions), **Step Up** (8), **Ink
Builder** (10), **Brain Stretch** (12), and **Masterpiece** (14).

- Each difficulty now contains **at least five** independently saved
  pictures, including the previous fifty-bank additions and the new
  hand-authored artwork in this release.
- **Start a mystery** chooses randomly from unplayed art at the selected mode
  and difficulty. Completed art never enters this automatic draw. Partially
  completed work is offered as a separate **Continue your picture** action.
- Once everything at a difficulty is discovered, the main Start control is
  disabled with a completion message. Students can instead freely choose
  another level or deliberately replay via the **Picture gallery**.
- Students may freely choose any difficulty at any time. Nothing is locked
  behind another level, and no new tutorials are compulsory.
- The optional gallery contains every original core picture and bonus.
  Choosing a particular picture there preserves the older direct-play and
  replay workflow. Existing per-picture save IDs, question generators,
  completed artwork reveals and scores are unchanged.
- Discovered pictures are counted within their difficulty pool; completion is
  not inferred from another picture at the same mathematical tier.
- Existing open/closed-circle touch shortcuts and the no-login design remain.

This release preserves all historical artworks and adds independently validated
new ones. Mathematical validation includes the authentic inequalities for
each generated row, stage-appropriate endpoint and algebra profiles, coloured
paint rules, connectivity, and final-detail placement.

## Student feedback pass — Pixel Art

The pixel studio's five-step journeys and student saves remain unchanged. The
authored half-picture masks for **Little Heart**, **Bouncy Ball** and **Tiny
Flower** have been corrected so their final mirrored shapes resemble the
promised objects. Paint by Inequalities' Little Heart now also has two distinct
upper lobes. Automated silhouette snapshots guard against another accidental
"wrong-way mirror" even when all of the mathematical questions remain valid.

**Open circles** are now labelled "< or > — endpoint excluded"; **closed
circles** are "≤ or ≥ — endpoint included". The reminder sits beside both
the reading and drawing tasks rather than interrupting play. The usual
tap-to-toggle, drag and keyboard interactions are preserved. A clear **Check
my choice / number line / solution** action stays visible on narrow screens;
one correct Check continues automatically as before.

Five new, independent **More pictures** alternatives broaden the choice:

| Mode | Fresh optional picture | Same-level mathematics |
| --- | --- | --- |
| Mirror | Forest Sparkle → Little Evergreen | 8 one-sided inequalities |
| Full | Across the Bay → Sailboat | 8 bounded intervals |
| Solve | Up and Away → Hot Air Balloon | 10 algebraic inequalities |
| Mixed | Hidden Treasure → Prism Crystal | 8 mixed-skill questions |
| Paint | Colours Aloft → Rainbow Kite | 10 rows and 3 colours |

The **Surprise me with a picture** and results-screen **Surprise me next**
buttons prefer uncompleted, newly added alternative artwork, then other
uncompleted pictures. They start the chosen task immediately, with no
additional confirmation or compulsory help. Returning to any previous
picture retains its own progress and replays.

## Graph Art Pass 2 — four additional Quick Spark pictures per mode

The first picture-variety batch is now live in the Graph Art library.
**Every Quick Spark difficulty contains five different pictures**, across all
four mathematical modes. Sixteen new handcrafted mathematical artworks take the
Graph Art library from **24 to 40 unique pictures** without changing any
existing picture definitions or student progress IDs.

| Mode | Four new Quick Spark pictures | Mathematics |
| --- | --- | --- |
| **Find & Fill** | Apple Tree, Hot Cocoa, Little Bus, Birthday Cake | Read simple horizontal/vertical inequalities; two bounded pieces |
| **Build & Shade** | Pocket Robot, Power Cell, Night Lantern, Music Player | Choose left/right/above/below, with a few easy dashed boundaries |
| **Curve & Fill** | Mushroom Magic, Autumn Leaf, Winter Snowman, Friendly Jellyfish | Common regions above/below simple centred parabolas |
| **Plot & Shade** | Sky Kite, Birthday Candle, Pocket Rocket, Sunrise Bay | Plot one straight line or parabola for each of two regions |

Each picture includes subject-specific patterns, accents and three-stage
finishing details, but the **coloured mathematical pieces themselves are exact
inequality intersections**, never pre-drawn masks.

The existing difficulty-first system automatically includes all new Quick
Sparks, with **random unfinished-only choices** and independent Continue
progress. A returning student who finished an original Starter now sees the
unfinished same-level alternatives, rather than being pushed to the next level.
All original stories, curves, plotting workflows, reveals and optional
reverse-reading work remain intact. The optional picture gallery also includes
the new artwork for deliberate selection or replay.

**Subsequent Pass 2 batches:** fill the Step Up pools with varied intermediate
maths, then expand Ink Builder, Brain Stretch and Masterpiece. This first
batch deliberately avoids diluting harder mathematics just to increase counts.
A separate completed-only **Graph Art mural** is planned for a later pass.

A dedicated test suite validates all 20 Quick Spark choices, the new 16
silhouettes and staged details, exact half-plane and parabolic regions,
constructible snapped plotting points, and preservation of original saves.

## Graph Art Pass 1 — difficulty-first mysteries (October 2026)

All **four Graph Art modes** now share the same difficulty-first homepage as
Pixel Art, with familiar labels: **Quick Spark, Step Up, Ink Builder, Brain
Stretch and Masterpiece**. Students first choose the maths, then discover a
picture without previewing unrevealed artwork.

- **Start a mystery** randomly chooses an unfinished picture at the selected
  difficulty, preferring untouched art and never automatically replaying an
  already completed picture. The current library honestly offers **one
  standard picture at each difficulty**, plus optional Step Up alternatives. The reverse-reading Diamond Kite stays gallery-only.
  Expanding to five per difficulty belongs to Pass 2, not this change.
- **Continue your picture** resumes partly completed work, including saved
  graph points in Plot & Shade and a partly built inequality in Build & Shade.
- The five difficulties remain freely selectable. When everything at one
  difficulty has been completed, automatic selection is disabled there;
  students can choose a different difficulty or deliberately replay.
- The **Picture gallery** is collapsed by default but contains the exact
  original five pictures, the optional Step Up challenge, and any eligible
  earlier pictures with saved progress. Gallery selections still allow
  view-only inspection or explicit replay of completed work.
- The mystery preview is an empty coordinate canvas until a student opts into
  choosing a specific picture. No compulsory instructions or extra steps
  interrupt the mathematics or full-picture reveal.
- Curve & Fill and Plot & Shade keep their original play screens and
  independently saved work. Visiting the standalone pages directly now opens
  the unified difficulty chooser; specific-picture deep links still work,
  while `?gallery=1` explicitly opens the older gallery. Finishing a mystery
  returns to that difficulty rather than revealing the next picture.
- Difficulty preferences live under a separate key,
  `inequality-ink-graph-mystery-tiers-v1`. Existing Graph Art, Curve & Fill
  and Plot & Shade saves, mathematics, hints, reveals and touch controls
  remain unchanged.

Tests cover all 20 mode/difficulty pools, completed-picture exclusion,
partial-work continuation, restored preferences, old saves, cross-page
navigation, and the existing mathematics/gameplay suite.

## Phase 6 — optional same-level practice and reverse reading

The five-stage routes remain exactly as before. Each Graph Art mode now offers
one extra **Step Up** picture under a collapsed **More practice at the same
level** section. Each new picture has three real mathematical regions, staged
finishing details, its own save record and the same full reveal. No prerequisite,
unlocking, new mode or compulsory explanation interrupts picture play.

| Mode | Optional Step Up picture | New mathematical practice |
| --- | --- | --- |
| Find & Fill | **Mountain Tent** | Identify a three-piece intersection of straight-line inequalities |
| Build & Shade | **Diamond Kite** | Reverse-read highlighted shaded half-planes as inequalities |
| Curve & Fill | **Balloon Parade** | Work with circles, translated parabolas and intersections |
| Plot & Shade | **Snow Globe** | Plot circles using centres/radii and a horizontal boundary |

**Diamond Kite's reverse-reading questions** are an optional Build & Shade
variation, not a fifth mode: a dark boundary and pale shaded side appear on
the graph, and students select the matching inequality from four signs
(<, ≤, >, ≥). Correct answers immediately add the boundary; incorrect
answers allow immediate retry. The separate three-level Hint, optional
Why-this-choice explanation and mode-aware How to play are available only
on request. The ordinary Build & Shade controls and journeys are unchanged.

The primary **0 of 5** gallery count still measures just the main five stages.
Each practice picture has independent progress in the existing mode-specific
browser save, and replay affects only that picture. Five-stage progress, older
saves, core questions and touch controls are not modified.

Tests additionally cover all optional mathematical regions, independent save
restoration, the reverse-reading workflow and full original-mode regression
behaviour.

## Desktop homepage: start-first workspace

On desktop, the home screen is organised around three immediate choices:
**challenge → picture → canvas and Start picture**. The introduction is
compact, while challenge cards, picture progression and the preview sit in
parallel columns instead of a vertically centred landing page. On smaller
laptops the two-column layout keeps the canvas and Start action beside the
selectors, and **Pixel Art / Graph Art** appears as a centred, accessible
two-option navigation control with matching SVG icons in both studios.

The mobile page deliberately retains its original larger introductory text,
three instructions, existing card design and vertical reading order
(challenge, picture, buttons, optional extension, artwork). The mobile
Paint by Inequalities one-screen workspace is unchanged. The layout
reorganises markup and CSS only: student saves, questions, artwork,
mathematical marking, Quadratic Quest and Graph Art remain independent.

## Plot & Shade — full five-stage Graph Art mode

[Open Plot & Shade](regions/plot.html) from the fourth Graph Art mode card.
Students create **21 real mathematical pieces** across five distinct pictures.
The construction challenge progresses from a single missing parabola or line
to **multiple boundaries per piece**, including lines, translated parabolas,
circles and absolute-value graphs. The workflow is Plot → Boundary → Shade,
with repeated plotting steps when the region requires multiple curves.

All correct mathematical constructions are accepted (not just model points).
Graphs are edited with draggable, half-unit-snapped points, keyboard placement,
and nudge controls on touch screens. Incorrect shading flashes red and clears;
correct regions persist until Check. Reused graph boundaries are highlighted,
each picture has its own progress record and staged finishing-details Big Reveal,
and the original two-piece Little Umbrella progress is imported without erasure.

| Stage | Picture | Pieces | Focus |
| --- | --- | ---: | --- |
| Starter | Little Umbrella | 2 | Parabola and horizontal line |
| Step Up | Ice Cream Dream | 3 | Sloping line and two circles |
| Building | Rainbow Gate | 4 | Multiple parabolic bands and reused boundaries |
| Challenge | Moonlight Lantern | 5 | V-shaped graphs, circles and an arched roof |
| Big Finish | Rocket Launch | 7 | Mixed, multi-step construction with twelve graph tasks |

See [full Plot & Shade design notes](PLOT_SHADE_FULL_MODE.md).
The historical [Phase 3 prototype](PLOT_SHADE_PROTOTYPE.md) remains available.

## Two art studios: Pixel Art / Graph Art

A shared **Pixel Art / Graph Art** selector switches between independent
maths experiences. Pixel Art keeps its number-line modes and saved progress.
Graph Art at [regions/](regions/) has **four modes, each with five unique
primary pictures**, optional Step Up practice art, and independently saved journeys:

- **Find & Fill:** all inequalities for one mathematical shape are shown
  together. Students identify and paint their **common solution region**.
  Incorrect regions flash and clear. A correct choice remains until **Check**
  commits that genuine polygon to the picture.
- **Build & Shade:** students decide **above/below** (or **left/right**) and
  **solid/dashed** for every inequality. Each correct boundary receives an
  inward arrow and narrows the translucent intersection. At the final
  inequality the arrows converge, the actual intersection glows green, and
  the shape settles into its colour. **Next piece** waits for the student's
  decision so the maths can be studied before moving on.
- **Curve & Fill:** students identify actual intersections of parabolas,
  quadratic curves, absolute-value graphs, circles and straight lines.
  Five unique pictures progress from two to seven coloured pieces. Correct
  selections persist until Check; incorrect curved regions flash red and clear.
- **Plot & Shade:** students construct missing boundaries with exact points,
  choose solid or dashed, then fill the common region. Lines, circles,
  parabolas and V-shaped graphs build five pictures from two to seven pieces.

All four modes follow the Pixel Art progression labels **Starter → Step Up →
Building → Challenge → Big Finish**. No stage is locked, and partial
progress saves by picture and mode. The picture itself is always formed from
real simultaneous inequalities; decorative finishing touches are added only
after all mathematical regions have been completed.

| Stage | Find & Fill picture | Pieces | Build & Shade picture | Pieces | Mathematical step |
| --- | --- | ---: | --- | ---: | --- |
| Starter | Signal Flag | 2 | Wrapped Gift | 2 | Horizontal/vertical, solid |
| Step Up | Little House | 3 | Mountain Morning | 3 | Rising/falling diagonals; first dashed boundary in Build & Shade |
| Building | Sailboat Sunset | 4 | Friendly Robot | 4 | Mixed gradients, strict/dashed |
| Challenge | Origami Fox | 6 | Aurora Crystal | 5 | Standard forms/fractional gradients; strict crystal core |
| Big Finish | Cosmic Rocket | 9 | Moonlit Castle | 8 | Longer multi-region pictures with mixed forms |

Every non-legacy piece is authored as a convex polygon; the app derives its
linear inequalities from the edges. The gallery validator confirms each
inequality is a real boundary, the intersection has the exact authored area,
and piece counts increase strictly in both modes. Students' drawings
**cannot** be unlocked by answering unrelated questions.

Decorative finishing details use a small shared contrast-safe accent palette
for features against the ivory canvas. Pale highlights inside the artwork
retain thin contrasting outlines where needed (snowcaps, gift details,
window panes), while the inequality-generated picture regions are unchanged.

The original **Little House** and **Aurora Crystal** IDs, piece order,
inequalities and saved progress remain intact. Existing work in the other
mode is retained in an optional **Earlier pictures with saved progress**
section rather than deleted. The retired v1 Aurora Crystal completion can
still be imported. Pixel Art and Quadratic Quest saves are not changed.

**Curve & Fill full mode:** [Open the gallery](regions/curve.html). The five
pictures are **Parabola Butterfly (2 pieces)**, **Rolling Hills (3)**,
**Rainbow Ribbons (4)**, **Orbit Flower (5)** and **Cosmic Jellyfish (7)**.
See the [Phase 2 implementation guide](CURVE_ART_PHASE2.md) for the curved
mathematics and save migration. The original butterfly save is imported
without overwriting it, and Find & Fill/Build & Shade progress is unchanged.

The two straight-line modes use the dependency-free half-plane clipper in
regions/regions-engine.mjs, the authored ten-picture gallery in
regions/graph-art-pictures.mjs and the interactive UI in
regions/regions-app.mjs. regions.test.mjs checks ten pictures, valid
mathematics and displayed inequality notation, fill/arrow/solid-dashed
interactions, persistent progress, reduced motion, the full Rocket and
Castle journeys, and the staged celebration.

## Optional extension: Quadratic Quest — full five-picture journey

**Quadratic Quest** is an optional, independent mathematical extension beneath the site's five familiar modes. It has its own **Choose a picture** screen, five-step progression, saved results, reveals and replay controls. Students who have not studied quadratic inequalities can continue the complete main game without entering it.

| Picture | Questions | Mathematical progression |
| --- | ---: | --- |
| **Prism of Possibilities** | 6 | Already-factorised monic quadratics, roots, strict/inclusive, between/outside, then one expanded and negative-leading example |
| **Petal Parabola** | 8 | Expanded monic quadratics, simple factorisation, mixed endpoint inclusivity |
| **Skyline Arc** | 10 | Rearrange an inequality to zero before factorising, including an introductory negative-leading and common-factor example |
| **Crystal Path** | 12 | Scaled factors and expanded non-monic quadratics; combine the multiplier's sign with the direction of the parabola |
| **Nova Finale** | 14 | Full mixed review: factorised/expanded/scaled/rearranged forms and upward/downward parabolas |

That is **50 fully authored inequalities**, each with **two distinct, visible integer roots** and exactly two root controls. Repeated roots, no-real-root cases and all-real/no-solution cases remain excluded until dedicated number-line controls are available.

**Gameplay:** Choose any picture (later stages are never locked), press Start picture or Continue picture and solve one real quadratic inequality per artwork row. The interface supports **Between roots / Outside roots** (two unbounded rays), independent open/closed roots, draggable circles, keyboard-adjustable endpoints, three staged hints, a collapsible parabola and an optional typed-MathML/handwritten working space. Correctly solving an inequality **unlocks a decorative row**; the artwork is not presented as a graph of its solution. Every picture has its own full-screen reveal, question-by-question review and Next picture action. The number-line window expands as appropriate for each stage.

**Compatibility and preservation:** The six Prism prototype questions, artwork and its established answer behaviour are unchanged. On first load, a completed or partly completed `inequality-ink-quadratic-quest-v1` save is **copied** into Prism's slot in `inequality-ink-quadratic-quest-v2`; the original v1 save remains untouched. Later progress is saved by picture ID, including hints, replay count and first-try statistics. Restart affects **only the selected quadratic picture**. Original `inequality-ink-v5` game saves remain separate and unchanged.

The pure question data, generated algebra notation and strict real-domain validation live in `quadratic-quest.mjs`. The five-stage selector, scoped progress migration, number-line UI and per-picture reveals live in `quadratic-quest-ui.mjs`. Automated tests solve all fifty questions, verify two-ended interval semantics and simulate leaving, returning, completing and replaying independent pictures.

## Choose a challenge and a picture

| Difficulty | Mathematics | Pictures included |
| --- | --- | --- |
| **Mirror Mode** | One-sided inequalities. Each correct ray paints one row of a half-image. The completed half-image unfolds across a vertical axis at the end. | **Whisker Wink**; **Full of Feeling**; **Seaside Sidestep**; **Night Watch** |
| **Full Picture** | Read and draw bounded inequalities, including open and closed endpoints. | **Woodland Wonder**; **Blast Off**; **In Full Bloom**; **Bubbling Brew**; **Sweet Scoop** |
| **Solve & Paint** | Solve compound inequalities (including reversing signs with negative coefficients), then draw the exact interval. | All five full pictures |
| **Mixed Challenge** | Each picture combines mirrored one-sided rays, bounded intervals and algebra, including negative-coefficient sign reversals at higher stages. | **Pocket Guardian**, **Visitor from Above**, **Against the Clock**, **Flutter By**, **Here Be Dragons** (five original pictures) |
| **Paint by Inequalities** | Read 2–4 colour inequalities per row and directly paint the integer-labelled squares. Only the current row can be edited; correct rows lock with their numbers removed. | **To the Moon**, **Petal Parade**, **Beep Beep Buddy** |

The library now contains **thirty-four unique pictures** offering **52 picture/difficulty combinations**. The selector uses playful, spoiler-free **clue titles** (such as *To the Moon*) rather than numbered mysteries. Completing an activity reveals its actual picture name, which then also appears beneath its clue in the picker. Every picture and difficulty has **independently saved progress**. Students can switch pictures without losing their previous work.

### Start a picture immediately, or practise separately

**Start picture / Continue picture** now always opens the next genuine picture question, in **every stage and bonus picture**. There is no compulsory tutorial and no need to press “Skip practice”. For the four number-line challenges (Mirror, Full, Solve and Mixed), **Just for practice** offers two optional number-line questions. These examples are clamped to the selected picture's visible number-line range and return to the picture picker when complete. Students can also leave practice early using **Back to pictures**.

Practice is separate from picture play: it does not fill rows, change scores, affect completion, or alter saved picture progress. The first completed picture can be earned after exactly the advertised number of picture questions. Paint by Inequalities continues to start directly in its colour studio, without an unrelated number-line practice option.

### Mixed Challenge: an independent three-skill picture journey

Unlike the other modes, the core Mixed Challenge no longer reuses the same
Star, Gift, Ball and Flower starter silhouettes. It has five **unique** full
pictures—Little Shield (6 rows), Flying Saucer (8), Golden Hourglass (10),
Butterfly (12), and Dragon Guardian (14). Every picture interleaves four
question types: **read a mirrored ray**, **draw a mirrored ray**, **draw a
bounded inequality**, and **solve and draw a transformed inequality**.
Each picture contains at least one instance of every skill, rather than
assigning one mathematical topic per picture. Algebra grows harder at later
stages, including guaranteed negative-coefficient sign reversals in the
Big Finish.

The previous shared Mixed pictures—including **Bubbling Brew**—still appear
under **More pictures**. Their IDs, inequalities, first-play answers and
`inequality-ink-v5` progress records are unchanged. Full Picture and
Solve & Paint retain their existing five-picture journeys. The Mixed
picker and question screen now indicate when students are practising Mirror,
Full Picture or Solve & Paint skills.

### New quick wins and colour progression

Every mode now has a **Starter → Step Up → Building → Challenge → Big Finish** path requiring **6 → 8 → 10 → 12 → 14 real picture questions**. Students get a proper colour reveal after six correct starter rows, with an optional Next picture action, and can choose any picture in any order.

- **Mirror:** Twinkle Time → Heart in a Hurry → Bounce Around → Petal Pop → Whisker Wink.
- **Full:** Star in a Flash → Wrapped with Wonder → Bouncy Business → Flower Burst → Woodland Wonder.
- **Solve:** The same four small silhouettes, ending with Blast Off.
- **Mixed:** Pocket Guardian → Visitor from Above → Against the Clock → Flutter By → Here Be Dragons. **All five pictures are exclusive to Mixed Challenge.**
- **Paint:** Sweet Heart (2 colours) → Star Splash (2) → Daisy Days (3) → Ready for Launch (4) → Beep Beep Buddy (5).

The large existing pictures are **not removed**. Bonus titles stay accessible in **More pictures** with their saved progress and replay statistics. Existing v1–v5 scores keep their original picture IDs. The site automatically suggests the next unfinished stage but **does not lock** later pictures.

### Mathematical progression (first pass)

The five picture stages now also set mode-specific mathematical difficulty. Starter questions use simple closed endpoints first, then introduce open endpoints; Solve & Paint begins with addition/subtraction and multiplication, ending its six-row picture with one simple negative-coefficient sign reversal. Step Up, Building and Challenge progressively vary endpoints, coefficients and sign reversals. Mixed Challenge has its own five-stage picture sequence. **Every** mixed picture uses all three skills: one-sided rays that reflect across the centre (Mirror Mode), two-ended bounded intervals (Full Picture), and transformed algebraic inequalities (Solve & Paint). Higher stages introduce more open endpoints and negative-coefficient sign reversals; the Big Finish includes two such reversals even after replaying. Paint by Inequalities introduces open colour-rule boundaries gradually while preserving the painted target of every row.

**Compatibility:** Big Finish and bonus pictures keep their previous mathematical generators, including any authored first-play answers. The new profiles do not change picture IDs, picture geometry, completion records, controls or reveals. Tests exercise all row/replay combinations and exact inequality marking.

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
- **`starter-pictures.mjs`** — eight small, validated mathematical silhouettes for Mirror and shared Full/Solve play. The four former Mixed starter pictures remain available as historical bonuses.
- **`mixed-pictures.mjs`** — five distinct, horizontally symmetric, fully connected Mixed-only silhouettes with independent colours, stage details and 6/8/10/12/14-row progression.
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

### Optional Solve & Paint working space

Solve & Paint now has a two-way **Type maths / Draw working** switch below the interactive number line. This is scratch working, **not the marked answer**; the number line above remains the student's submission.

- **Type maths:** enter one algebra step per line with a built-in compact keyboard for `x`, operations, inequality signs, brackets, a fraction template, powers, backspace and new lines. A live, locally rendered **MathML** preview shows real mathematical layout including stacked fractions and superscripts. Typing `<=` or `>=` renders the correct inequality symbol, `/` makes a fraction and `^2` makes a square.
- **Draw working:** a touch-action-safe SVG writing surface accepts a finger, stylus or mouse; Pen, Eraser, Undo and Clear provide full control without external libraries or handwriting recognition.
- Students can switch between both methods **without losing either draft for the current question**. Work resets only on the next question/restart. The optional scratch work is not assessed or stored; saved picture progress and marking remain independent. The design adapts to small mobile screens and keyboard navigation.

The rendering/ink logic lives in **`working-space.mjs`** and is covered by focused mathematical, safety and simulated-student interaction tests.

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
