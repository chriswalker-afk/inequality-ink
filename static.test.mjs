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
 for(const id of ["changeLevelButton","chooseLevelButton","mirrorNotice",
                  "mirrorExplainer","mirrorSideLabel","directionChooser"]){
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
  assert.ok(script.includes('const columns=paintedColumns(solvedQuestion).map(v=>cat?v:v-COLUMN_MIN)'));
  assert.ok(script.includes('if(!cat&&!intro&&!colour&&q?.artMode==="mirror")'),
    "The mixed-mode row reflection must not also reflect Cat Cameo rows");
  assert.ok(html.includes('id="introGridSize"'));
  assert.ok(html.includes('id="mirrorMathNote"'));
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
  assert.ok(script.includes('const KEY="inequality-ink-v3"'));
  assert.ok(script.includes('if(!current && id==="mirror")continue;'));
  assert.ok(script.includes('state.progress[id]={...blank(),...p}'));
});
