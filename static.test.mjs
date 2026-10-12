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
   "introPixelArt","pixelCanvas","finishedArt","catFlipStage","catFlipLeft",
   "catFlipRight","replayReveal","progressMarkers"]){
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
test("Half pictures flip only at the end, then the colour and character details appear",()=>{
 const flipping=getSection("function playMirrorReveal(){","function finish({animate=false}");
 const stepA=flipping.indexOf('stage.classList.add("is-flipping")');
 const stepB=flipping.indexOf('stage.classList.add("is-revealed")');
 const stepC=flipping.indexOf('shell.classList.add("is-colouring")');
 const stepD=flipping.indexOf('scheduleDetailReveal(picture,');
 assert.ok(stepA>=0&&stepB>stepA&&stepC>stepB&&stepD>stepC);
 assert.ok(flipping.includes("drawHalfPanel"));
 assert.ok(flipping.includes('fullPictureWidth(picture)+" / "+pictureHeight(picture)'));
 assert.ok(flipping.includes('window.matchMedia?.("(prefers-reduced-motion: reduce)")'));
 assert.ok(css.includes("@keyframes cat-unfold"));
});
test("All picture variants have full-colour backgrounds, finishing details and PNG export",()=>{
 const render=getSection("function renderFinishedArt(){","function revealComplete(){");
 assert.ok(render.includes('fullPictureWidth(picture)'));
 assert.ok(render.includes('pictureColourAt(picture,x,y,{full:true})'));
 assert.ok(render.includes('pictureBackgroundAt(picture,x,y)'));
 assert.ok(render.includes('appendFinalDetails(svg,picture)'));
 assert.ok(app.includes('pictureDetailStages(picture)'));
 assert.ok(app.includes('pictureFinalDetails(picture)'));
 assert.ok(app.includes('scheduleDetailReveal(picture,'));
 assert.ok(app.includes('link.download="inequality-ink-"+picture.id+".png"'));
 assert.ok(app.includes('sprite.setAttribute("height",height*scale)'));
 assert.ok(css.includes('[data-detail-stage]'));
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
