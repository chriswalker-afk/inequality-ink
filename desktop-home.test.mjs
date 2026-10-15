import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("./index.html",import.meta.url),"utf8");
const graph=readFileSync(new URL("./regions/index.html",import.meta.url),"utf8");
const css=readFileSync(new URL("./styles.css",import.meta.url),"utf8");
const app=readFileSync(new URL("./app.mjs",import.meta.url),"utf8");
const intro=html.slice(html.indexOf('<section id="introScreen"'),
  html.indexOf('<section id="playScreen"'));
function pos(needle){
  const index=intro.indexOf(needle);
  assert.ok(index>=0,"Missing homepage region "+needle);
  return index;
}
test("Desktop launch order is intro, challenge, picture, canvas/actions, extension",()=>{
  const positions=[
    pos('class="intro-copy"'),
    pos('class="intro-challenge-column"'),
    pos('class="picture-picker-shell"'),
    pos('class="intro-canvas-column"'),
    pos('class="quest-invite"')
  ];
  assert.deepEqual([...positions].sort((a,b)=>a-b),positions);
  const canvas=intro.slice(pos('class="intro-canvas-column"'),pos('class="quest-invite"'));
  assert.ok(canvas.includes('class="intro-art"'));
  assert.ok(canvas.includes('id="introPixelArt"'));
  assert.ok(canvas.includes('class="intro-action-column"'));
  assert.ok(canvas.includes('id="startButton"'));
  assert.ok(canvas.includes('id="practiceButton"'));
  assert.ok(canvas.indexOf('id="introPixelArt"')<canvas.indexOf('id="startButton"'));
  assert.ok(intro.includes('class="intro-steps"'));
  assert.ok(intro.includes('id="pictureJourneyHelp"'));
  assert.ok(intro.includes('id="questEnter"'));
  assert.ok(intro.includes('id="pictureSummary"'));
  assert.ok(intro.includes('id="morePicturesSection"'));
  assert.ok(intro.includes('id="pictureStepTrack"'));
});
test("Homepage regrouping has balanced divs, no duplicate IDs, and same five modes",()=>{
  const starts=[...intro.matchAll(/<div(?:\s|>)/g)].length;
  const closes=[...intro.matchAll(/<\/div>/g)].length;
  assert.equal(starts,closes);
  const ids=[...intro.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length);
  assert.equal([...intro.matchAll(/data-level="(?:mirror|full|solve|mixed|paint)"/g)].length,5);
  assert.ok(app.includes('function updateLevelSelector(){'));
  assert.ok(app.includes('$("startButton").onclick=start;'));
  assert.ok(app.includes('$("practiceButton").onclick=startPractice;'));
});
test("Large desktops use a three-column start-first workspace",()=>{
  assert.ok(css.includes('@media(min-width:1200px)'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,.91fr)'));
  assert.ok(css.includes('"challenges pictures canvas"'));
  assert.ok(css.includes('"extensions extensions extensions"'));
  assert.ok(css.includes('#introScreen .intro-steps{display:none}'),
    "The three instructional steps move out of the compact desktop workspace");
  assert.ok(css.includes('#introScreen .intro-copy h1 br{display:none}'));
  assert.ok(css.includes('#introScreen .intro-buttons{'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr) auto;'));
  assert.ok(css.includes('height:clamp(160px,26vh,218px)'),
    "Keep the artwork preview compact enough for the primary action");
  assert.ok(css.includes('#introScreen #startButton{'));
  assert.ok(css.includes('min-height:46px'));
});
test("Mid-size laptop and mobile layouts preserve their distinct user journeys",()=>{
  assert.ok(css.includes('@media(min-width:741px) and (max-width:1199px)'));
  assert.ok(css.includes('"challenges canvas"'));
  assert.ok(css.includes('"pictures canvas"'));
  assert.ok(css.includes('position:sticky;top:12px'),
    "Keep the picture start action accessible beside selectors");
  assert.ok(css.includes('@media(max-width:740px)'));
  assert.ok(css.includes('grid-template-areas:\n      "intro"\n      "challenges"\n      "pictures"\n      "actions"\n      "extensions"\n      "art"'));
  assert.ok(css.includes('#introScreen .intro-canvas-column{display:contents}'));
  assert.ok(css.includes('body.paint-session .studio-switch{display:none}'),
    "Existing one-screen mobile painting layout must stay protected");
});
test("Both studios use the same labelled SVG segmented navigation",()=>{
  const mainNav=html.slice(html.indexOf('<nav class="studio-switch"'),html.indexOf('</nav>')+6);
  const graphNav=graph.slice(graph.indexOf('<nav class="studio-switch"'),graph.indexOf('</nav>')+6);
  for(const nav of [mainNav,graphNav]){
    assert.ok(nav.includes('aria-label="Art style"'));
    assert.equal([...nav.matchAll(/class="studio-tab/g)].length,2);
    assert.equal([...nav.matchAll(/class="studio-icon"/g)].length,2);
    assert.equal([...nav.matchAll(/<svg /g)].length,2);
    assert.ok(nav.includes('<span>Pixel Art</span>'));
    assert.ok(nav.includes('<span>Graph Art</span>'));
    assert.ok(!nav.includes('▦'));
    assert.ok(!nav.includes('◇'));
  }
  assert.match(mainNav,/href="\.\/" aria-current="page"/);
  assert.match(graphNav,/href="\.\/" aria-current="page"/);
  assert.ok(css.includes('.studio-switch .studio-tab:visited:not([aria-current="page"])'));
  assert.ok(css.includes('.studio-switch .studio-tab[aria-current="page"]'));
  assert.ok(css.includes('background:#2e3b58;'));
  assert.ok(css.includes('.studio-switch .studio-icon svg{'));
  assert.match(html,/href="\.\/styles\.css\?v=[^"]+"/);
  assert.ok(graph.includes('href="../styles.css?v=paint-desktop-v3"'));
});


test("Desktop painting gives the picture genuine height and keeps controls compact",()=>{
  const start=css.indexOf("/* Desktop Paint by Inequalities:");
  const end=css.indexOf("/* Phones: miniature artwork beside its rules",start);
  assert.ok(start>0&&end>start,"Desktop overrides must precede unchanged phone layout");
  const desktop=css.slice(start,end);
  assert.ok(desktop.includes("@media(min-width:741px)"));
  assert.ok(desktop.includes('body.paint-session{overflow-y:auto}'),
    "Very short desktop windows must scroll instead of shrinking all 16 image rows");
  assert.ok(desktop.includes("min-height:clamp(515px,calc(100dvh - 130px),760px)"),
    "Picture should retain a readable height on short laptop screens");
  assert.ok(desktop.includes("max-width:1050px"),
    "Keep artwork and controls visually grouped within a restrained studio");
  assert.ok(desktop.includes("minmax(335px,420px)"),
    "Palette, numbered row and Check button should be a compact sidebar");
  assert.ok(desktop.includes('"artwork palette"'));
  assert.ok(desktop.includes('"artwork focus"'));
  assert.ok(desktop.includes('"artwork actions"'));
  assert.ok(desktop.includes('.paint-main-stage{display:contents}'),
    "Do not reorder HTML or alter actual painting behaviour");
  assert.ok(desktop.includes("grid-area:artwork"));
  assert.ok(desktop.includes("max-height:none"),
    "Remove the old 65dvh image-height cap");
  assert.ok(desktop.includes("grid-template-columns:repeat(2,minmax(0,1fr))"),
    "Keep colour cards smaller than the artwork");
  assert.ok(desktop.includes("max-height:225px"),
    "Scrollable palette must handle more inequalities without stretching");
  assert.ok(desktop.includes(".paint-focus-row{width:100%;max-width:none"),
    "Numbered row should fit the compact sidebar");
  assert.ok(desktop.includes(".paint-check{flex:1;min-width:125px}"));
  assert.ok(desktop.includes("body.paint-session .topbar{min-height:42px"),
    "Condense the desktop header without affecting other game modes");
  const mobile=css.slice(end,css.indexOf("/* Extremely short landscape",end));
  assert.ok(mobile.includes("@media(max-width:740px)"));
  assert.ok(mobile.includes(".paint-main-stage{"));
  assert.ok(mobile.includes("grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr)"),
    "Keep the successful mobile picture/rules proportions");
  assert.ok(mobile.includes(".paint-help-note{display:none}"));
  assert.match(html,/href="\.\/styles\.css\?v=[^"]+"/);
});
