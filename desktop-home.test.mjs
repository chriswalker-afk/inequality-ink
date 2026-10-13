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
  assert.ok(html.includes('href="./styles.css?v=desktop-home-v1"'));
  assert.ok(graph.includes('href="../styles.css?v=desktop-home-v1"'));
});
