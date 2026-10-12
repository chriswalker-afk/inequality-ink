import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";
const root=dirname(fileURLToPath(import.meta.url));
const load=path=>readFileSync(join(root,path),"utf8");
const html=load("index.html"),app=load("app.mjs"),css=load("styles.css");
const engine=load("picture-engine.mjs"),definitions=load("pictures.mjs");
const getSection=(start,end)=>app.slice(app.indexOf(start),app.indexOf(end,app.indexOf(start)));

test("Every referenced element exists, with no duplicate HTML IDs",()=>{
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(ids).size,ids.length);
 for(const [,id] of app.matchAll(/\$\("([^"]+)"\)/g))
   assert.ok(ids.includes(id),"Missing HTML element: "+id);
 for(const id of ["picturePicker","picturePickerStatus","pictureSummary",
   "introPixelArt","pixelCanvas","finishedArt","revealDialog","revealBoard",
   "revealBuildArt","revealMirrorLeft","revealMirrorRight","revealFinalArt",
   "closeReveal","skipReveal","revealStageText","replayReveal","progressMarkers"]){
   assert.ok(ids.includes(id));
 }
});
test("All four modes offer a picture selector and picture-specific save keys",()=>{
 for(const level of ["mirror","full","solve","mixed"])
   assert.ok(html.includes('data-level="'+level+'"'));
 assert.ok(html.includes('role="group" aria-label="Choose a mystery picture"'));
 assert.ok(app.includes('function renderPicturePicker(){'));
 assert.ok(app.includes('picturesForLevel(state.activeLevel)'));
 assert.ok(app.includes('state.selectedPictures[state.activeLevel]=id'));
 assert.ok(app.includes('const progressKey=(level,pictureId)=>level+":"+pictureId;'));
 assert.ok(app.includes('state.progress[activeKey()]=blank()'));
 assert.ok(app.includes('state.progress[key]=safeProgress(current.progress[key],picture)'));
 assert.ok(app.includes('state.progress[progressKey(level,picture.id)]=safeProgress(old,picture)'));
 assert.ok(app.includes('const KEY="inequality-ink-v5"'));
});
test("Changing picture never changes the student's chosen mathematical mode",()=>{
 const select=getSection("function selectPicture(id){","function renderPicturePicker(){");
 assert.ok(select.includes('state.selectedPictures[state.activeLevel]=id'));
 assert.ok(select.includes('syncProgress()'));
 assert.ok(!select.includes('state.activeLevel='));
 assert.ok(app.includes('defaultPictureForLevel(level).id'));
 assert.ok(app.includes('picture.mystery'));
});
test("The picture renderer and question generator do not use hardcoded cats or mushrooms",()=>{
 assert.ok(app.includes('from "./picture-engine.mjs"'));
 assert.ok(app.includes('validatePictureLibrary()'));
 const draw=getSection('function sprite(', 'sprite($("introPixelArt"),{intro:true});');
 assert.ok(draw.includes('pictureWidth(picture)'));
 assert.ok(draw.includes('picturePixelAt(picture,x,y)'));
 assert.ok(draw.includes('makePictureQuestion(picture,i,save.replay,state.activeLevel)'));
 assert.ok(draw.includes('picturePaintedValues(picture,task)'));
 assert.ok(draw.includes('pictureColourAt(picture,x,y)'));
 assert.ok(!draw.includes('catPixelAt('));
 assert.ok(!draw.includes('mushroomRows'));
 assert.ok(app.includes('makePictureQuestion(picture,save.done,save.replay,state.activeLevel)'));
 assert.ok(app.includes('questionCount(activePicture())'));
});
test("Standard number lines retain correct endpoints without artwork hints",()=>{
 const line=getSection('function renderLine(svg,interval,readonly=false){','function nearest(ev,svg){');
 assert.ok(line.includes('const {min,max}=visibleAxis()'));
 assert.ok(app.includes('const visibleAxis=()=>pictureAxis(activePicture())'));
 for(const forbidden of ["RIGHT HALF FOR PIXELS","LEFT HALF FOR PIXELS",
   "mirrorNotice","mirrorExplainer","mirrorSideLabel","mirrorMathNote"]){
   assert.ok(!html.includes(forbidden));
 }
 assert.ok(!line.includes("picturePaintedValues"));
});
test("The fullscreen dialog owns the reveal and remains visible until dismissed",()=>{
  assert.ok(html.includes('<dialog id="revealDialog"'));
  assert.ok(html.includes('aria-labelledby="revealHeading"'));
  assert.ok(html.includes('aria-describedby="revealStageText"'));
  assert.ok(html.includes('id="closeReveal"'));
  assert.ok(html.includes('aria-label="Close picture reveal and see results"'));
  assert.ok(html.includes('id="skipReveal"'));
  const finish=getSection('function finish({animate=false}={}){','function restart(){');
  assert.ok(finish.includes('openReveal({animate})'));
  assert.ok(!finish.includes('show("finishScreen")'),
    "Do not show the results screen at the moment of completion");
  const popup=getSection('function openReveal({animate=true}={}){','function closeReveal(){');
  assert.ok(popup.includes('show(null)'));
  assert.ok(popup.includes('dialog.showModal()'));
  assert.ok(popup.includes('dialog.showModal()'));
  assert.ok(popup.includes('document.body.classList.add("reveal-open")'));
  const close=getSection('function closeReveal(){','function finish({animate=false}={}){');
  assert.ok(close.includes('clearRevealTimers()'));
  assert.ok(close.includes('show("finishScreen")'));
  assert.ok(close.includes('dialog.close()'));
  assert.ok(app.includes('$("closeReveal").onclick=closeReveal'));
  assert.ok(app.includes('$("revealDialog").addEventListener("cancel"'));
});
test("Every row is revealed separately before reflection, colour and details",()=>{
  const reveal=getSection('function playRevealRows(picture,rows){',
    'function openReveal({animate=true}={}){');
  const buildIndex=reveal.indexOf('row.setAttribute("opacity","1")');
  const reflectIndex=reveal.indexOf('layer.classList.add("is-unfolding")');
  const colourIndex=reveal.indexOf('$("revealBoard").classList.add("has-colour")');
  const detailsIndex=reveal.indexOf('group.setAttribute("opacity","1")');
  assert.ok(buildIndex>=0);
  assert.ok(reflectIndex>buildIndex);
  assert.ok(colourIndex>reflectIndex);
  assert.ok(detailsIndex>colourIndex);
  assert.ok(reveal.includes('const total=rows.length'));
  assert.ok(reveal.includes('picture.family==="half"'));
  assert.ok(reveal.includes('pictureDetailStages(picture)'));
  const ink=getSection('function buildMonochromeRows(picture){',
    'function setupRevealStages(picture){');
  assert.ok(ink.includes('makePictureQuestion(picture,index,save.replay,state.activeLevel)'));
  assert.ok(ink.includes('picturePaintedValues(picture,question)'));
  assert.ok(ink.includes('question.row'));
  assert.ok(css.includes('@keyframes reveal-unfold'));
  assert.ok(css.includes('.reveal-board.has-colour .reveal-final-art'));
});
test("Background, colours and details remain picture specific, including PNG export",()=>{
  const render=getSection('function finishedArtwork(svg,picture){',
    'function renderFinishedArt(){');
  assert.ok(render.includes('fullPictureWidth(picture)'));
  assert.ok(render.includes('pictureColourAt(picture,x,y,{full:true})'));
  assert.ok(render.includes('pictureBackgroundAt(picture,x,y)'));
  assert.ok(render.includes('appendFinalDetails(svg,picture)'));
  assert.ok(app.includes('pictureDetailStages(picture)'));
  assert.ok(app.includes('pictureFinalDetails(picture)'));
  assert.ok(app.includes('setDetailsVisible($("finishedArt"),true)'));
  assert.ok(app.includes('setDetailsVisible($("revealFinalArt"),false)'));
  assert.ok(app.includes('link.download="inequality-ink-"+picture.id+".png"'));
  assert.ok(app.includes('sprite.setAttribute("height",height*scale)'));
  assert.ok(css.includes('[data-detail-stage]'));
});
test("Mobile reveal keeps the picture in view and supports reduced motion",()=>{
  assert.ok(css.includes('.reveal-dialog{'));
  assert.ok(css.includes('height:100dvh'));
  assert.ok(css.includes('safe-area-inset-top'));
  assert.ok(css.includes('safe-area-inset-bottom'));
  assert.ok(css.includes('.reveal-picture-space'));
  assert.ok(css.includes('.reveal-close'));
  assert.ok(css.includes('min-height:45px'));
  assert.ok(css.includes('@media(max-height:600px)'));
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
  assert.ok(app.includes('window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches'));
  assert.ok(app.includes('showRevealFinished()'));
  assert.ok(app.includes('$("skipReveal").onclick=showRevealFinished'));
  const skip=getSection('function showRevealFinished(){','function playRevealRows(picture,rows){');
  assert.ok(skip.includes('clearRevealTimers()'));
  assert.ok(skip.includes('setDetailsVisible(art,true)'));
  assert.ok(!skip.includes('show("finishScreen")'));
});
test("Site remains dependency-free and keyboard/mobile friendly",()=>{
 for(const path of ["model.mjs","picture-engine.mjs","pictures.mjs",
   "app.mjs","styles.css","index.html","picture-engine.test.mjs"]){
   assert.ok(existsSync(join(root,path)),"Missing "+path);
 }
 assert.ok(html.includes('type="module" src="./app.mjs"'));
 assert.ok(html.includes('href="./styles.css"'));
 assert.ok(css.includes('max-width:740px')||css.includes('max-width:740px'));
 assert.ok(css.includes('.picture-picker'));
 assert.ok(css.includes('prefers-reduced-motion:reduce'));
 assert.ok(app.includes('tick.addEventListener("keydown"'));
});
