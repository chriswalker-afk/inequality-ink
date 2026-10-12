import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";
const root=dirname(fileURLToPath(import.meta.url));
const read=filename=>readFileSync(join(root,filename),"utf8");
const html=read("index.html"),script=read("app.mjs"),css=read("styles.css");

test("all DOM elements addressed by the game exist and have unique IDs",()=>{
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(ids).size,ids.length,"Duplicate HTML IDs");
 for(const [,id] of script.matchAll(/\$\("([^"]+)"\)/g)){
   assert.ok(ids.includes(id),"Missing DOM element: "+id);
 }
});
test("all four difficulty choices have accessible, wired controls",()=>{
 for(const id of ["mirror","full","solve","mixed"]){
   assert.ok(html.includes('data-level="'+id+'"'));
 }
 assert.ok(script.includes('addEventListener("click",()=>selectLevel('));
 for(const id of ["changeLevelButton","chooseLevelButton","directionChooser",
                  "introGridSize","pixelCanvas"]){
   assert.ok(html.includes('id="'+id+'"'));
 }
 assert.ok(html.includes('aria-pressed="true"'));
});
test("static site needs no build process or remote assets",()=>{
 for(const path of ["index.html","styles.css","model.mjs","app.mjs","model.test.mjs"]){
   assert.ok(existsSync(join(root,path)),path+" is missing");
 }
 assert.ok(html.includes('src="./app.mjs"'));
 assert.ok(html.includes('href="./styles.css"'));
 assert.ok(script.includes('from "./model.mjs"'));
});
test("the CSS includes a clear reflection animation and reduced motion option",()=>{
 assert.ok(css.includes(".ink-new-primary"));
 assert.ok(css.includes(".ink-new-reflection"));
 assert.ok(css.includes("prefers-reduced-motion:reduce"));
});

test("Cat Cameo uses a half-width canvas until every question is completed",()=>{
  assert.ok(script.includes('const cat=state.activeLevel==="mirror",width=cat?CAT_HALF_WIDTH:WIDTH'));
  assert.ok(script.includes('const active=cat?catHalfPixelAt(x,y):pixelAt(x,y)'));
  assert.ok(script.includes('paintedColumns(solvedQuestion)'));
  assert.ok(script.includes('const columns=paintedColumns(solvedQuestion).map(v=>cat?v-CAT_WINDOW.min:v-COLUMN_MIN)'));
  assert.ok(script.includes('if(!cat&&!intro&&!colour&&q?.artMode==="mirror")'),
    "The mixed-mode row reflection must not also reflect Cat Cameo rows");
  assert.ok(html.includes('id="introGridSize"'));
  assert.ok(!html.includes('id="mirrorMathNote"'));
});
test("finale unfolds first, displays a complete monochrome cat, then applies colour",()=>{
  const start=script.indexOf('function playCatReveal(){');
  const end=script.indexOf('function finish({animate=false}',start);
  assert.ok(start>0&&end>start);
  const reveal=script.slice(start,end);
  const flips=reveal.indexOf('stage.classList.add("is-flipping")');
  const completeMono=reveal.indexOf('stage.classList.add("is-revealed")');
  const colours=reveal.indexOf('shell.classList.add("is-colouring")');
  assert.ok(flips>0 && completeMono>flips && colours>completeMono);
  assert.ok(reveal.includes('drawCatPanel($("catFlipLeft"),true)'));
  assert.ok(reveal.includes('drawCatPanel($("catFlipRight"),false)'));
  assert.ok(script.includes('save.done===14)finish({animate:true})'));
  assert.ok(script.includes('catPixelAt(x,y)'));
  assert.ok(script.includes('catColourAt(x,y)'));
  for(const id of ['catFlipStage','catFlipLeft','catFlipRight','catFlipStatus',
                   'finishedArt','finishedArtShell','replayReveal']){
    assert.ok(html.includes('id="'+id+'"'));
  }
  assert.ok(css.includes('@keyframes cat-unfold'));
  assert.ok(css.includes('.is-colouring #finishedArt'));
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
});
test("migrating to a new half-cat only resets old Mirror Mode progress",()=>{
  assert.ok(script.includes('const KEY="inequality-ink-v4"'));
  assert.ok(script.includes('if(!current && id==="mirror")continue;'));
  assert.ok(script.includes('state.progress[id]={...blank(),...p}'));
});

test("ordinary number lines contain no labels about pixel transfer",()=>{
 for(const forbidden of [
   "RIGHT HALF FOR PIXELS","LEFT HALF FOR PIXELS","RIGHT HALF FIRST",
   "only the highlighted half","the eight visible canvas columns",
   "The canvas edge silently limits","mirrorNotice","mirrorExplainer",
   "mirrorSideLabel","mirrorMathNote"
 ]){
   assert.ok(!html.includes(forbidden),"Unexpected student-facing instruction: "+forbidden);
 }
 const renderer=script.slice(script.indexOf("function renderLine("),
   script.indexOf('function nearest(ev,svg){'));
 assert.ok(renderer.includes('const {min,max}=visibleAxis()'));
 assert.ok(!renderer.includes('HALF FOR PIXELS'));
 assert.ok(!renderer.includes('RIGHT HALF'));
 assert.ok(!renderer.includes('mirrorSide'));
 assert.ok(script.includes('state.activeLevel==="mirror"?CAT_WINDOW:{min:AXIS_MIN,max:AXIS_MAX}'));
 assert.ok(script.includes('const columns=paintedColumns(solvedQuestion).map(v=>cat?v-CAT_WINDOW.min:v-COLUMN_MIN)'));
});
test("half artwork has exactly 10 columns, with 20 columns at full reveal",()=>{
 assert.ok(html.includes('id="introGridSize">10 × 16'));
 assert.ok(html.includes('viewBox="0 0 10 16"'));
 assert.ok(html.includes('viewBox="0 0 20 16"'));
 assert.ok(script.includes('svg.setAttribute("viewBox","0 0 "+CAT_FULL_WIDTH+" "+HEIGHT)'));
 assert.ok(script.includes('for(let y=0;y<HEIGHT;y++)for(let x=0;x<CAT_FULL_WIDTH;x++)'));
});
test("the picture name is held back until the end of the flip reveal",()=>{
 const reveal=script.slice(script.indexOf('function playCatReveal(){'),
   script.indexOf('function finish({animate=false}',script.indexOf('function playCatReveal(){')));
 assert.ok(reveal.lastIndexOf('$("finishTitle").textContent="Cat Cameo!"')>
   reveal.indexOf('shell.classList.add("is-colouring")'),
   "Animated reveal must not name the picture before the colour stage");
 assert.ok(html.includes('id="playTitle">Mystery Picture'));
 assert.ok(!html.includes('RIGHT HALF FOR PIXELS'));
});


test("finishing details never appear in the question canvas or before the colour stage",()=>{
  const inGame=script.slice(script.indexOf("function sprite("),script.indexOf('sprite($("introPixelArt"),{intro:true});'));
  assert.ok(!inGame.includes("appendFinalDetails"));
  assert.ok(!inGame.includes("revealAllDetails"));
  const finish=script.slice(script.indexOf("function renderFinishedArt(){"),
    script.indexOf("function playCatReveal(){"));
  assert.ok(finish.includes("appendFinalDetails(svg,cat?"));
  const catReveal=script.slice(script.indexOf("function playCatReveal(){"),
    script.indexOf("function finish({animate=false}",script.indexOf("function playCatReveal(){")));
  assert.ok(catReveal.indexOf('shell.classList.add("is-colouring")')<
    catReveal.indexOf('scheduleDetailReveal("cat"'),
    "Details should begin after the full-colour cat is visible");
  const mushroom=script.slice(script.indexOf("function playMushroomReveal(){"),
    script.indexOf("function playCatReveal(){"));
  assert.ok(mushroom.includes('scheduleDetailReveal("mushroom"'));
  assert.ok(script.includes('revealAllDetails()'),
    "Returning to finished pictures and reduced-motion finishes must include details");
});
test("only completed images receive their symmetric pastel backgrounds",()=>{
  assert.ok(script.includes('colour?finishedBackgroundAt(cat?"cat":"mushroom",x,y)'),
    "Mushroom background should only appear in finished-colour rendering");
  assert.ok(script.includes('fill:filled?catColourAt(x,y):finishedBackgroundAt("cat",x,y)'),
    "Cat background should be painted around, not over, its final silhouette");
  assert.ok(!html.includes("finishedBackgroundAt"),
    "Do not reveal internal background mechanics in student instructions");
});
test("both completion screens and downloaded PNGs include backgrounds and facial details",()=>{
  assert.ok(script.includes('sprite.querySelectorAll("[data-detail-stage]").forEach('));
  assert.ok(script.includes('group.setAttribute("opacity","1")'));
  assert.ok(script.includes('canvas.width=width*scale;canvas.height=HEIGHT*scale'));
  assert.ok(script.includes('sprite.setAttribute("height",HEIGHT*scale)'));
  assert.ok(script.includes('sprite.setAttribute("width",width*scale)'));
  assert.ok(html.includes('id="replayReveal"'));
  assert.ok(html.includes("Replay the reveal"));
  assert.ok(css.includes('[data-detail-stage]'));
});
