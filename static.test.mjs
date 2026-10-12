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

test("Public copy is independent of a particular exam or course",()=>{
 for(const [file,source] of Object.entries({
   "index.html":html,"app.mjs":app,"model.mjs":load("model.mjs"),
   "README.md":load("README.md"),
   "PICTURE_PROGRESSION_PLAN.md":load("PICTURE_PROGRESSION_PLAN.md")
 }))assert.doesNotMatch(source,/\b(?:Foundation|4MA1)\b/i,
   file+" should not contain course-specific wording");
 assert.ok(html.includes("INEQUALITIES • PIXEL ART"));
 assert.ok(html.includes("MATHS THROUGH PIXEL ART"));
 assert.ok(html.includes("Practise inequalities on interactive number lines"));
});

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
test("All five modes offer a picture selector and picture-specific save keys",()=>{
 for(const level of ["mirror","full","solve","mixed","paint"])
   assert.ok(html.includes('data-level="'+level+'"'));
 assert.ok(html.includes('role="group" aria-label="Choose a picture"'));
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
 assert.ok(app.includes('picture.clue'));
  assert.ok(!app.includes('picture.mystery'));
  assert.ok(app.includes('title.textContent=picture.clue'));
  assert.ok(app.includes('progress.completed?picture.name+" — completed"'));
});
test("Numbered mystery placeholders are replaced in all visible game surfaces",()=>{
  const paintData=load("paint-pictures.mjs");
  assert.ok(!definitions.includes('mystery:"Mystery '));
  assert.ok(!paintData.includes('mystery:"Mystery '));
  assert.ok(!html.includes('MYSTERY 01 / MUSHROOM'));
  assert.ok(html.includes('id="playEyebrow">YOUR NEXT CREATION'));
  assert.ok(app.includes('picture.clue.toUpperCase()'));
  assert.ok(app.includes('picture.clue+" — colour studio"'));
  assert.ok(app.includes('card.setAttribute("aria-label",picture.clue'));
  assert.ok(app.includes('title.textContent=picture.clue'));
  assert.ok(app.includes('progress.completed?picture.name+" — completed"'));
  assert.ok(app.includes('$("finishTitle").textContent=picture.name+"!"'));
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


test("One Check & paint press handles correctness, progression and the final reveal",()=>{
  assert.ok(html.includes('id="checkButton">Check &amp; paint'));
  assert.ok(!html.includes('id="nextButton"'));
  assert.ok(!app.includes('$("nextButton")'));
  const check=getSection('function check(){','function hint(){');
  assert.ok(check.includes('scheduleRowAdvance()'));
  assert.ok(check.includes('locked=true'));
  assert.ok(check.includes('initProgress({animate:false,redraw:q.mode==="tutorial"})'));
  assert.ok(check.includes('"Correct — next row"')||
    check.includes('✓ Correct — next row…'));
  const advance=getSection('function scheduleRowAdvance(){','const mk=');
  assert.ok(advance.includes('setTimeout('));
  assert.ok(advance.includes('question()'));
  assert.ok(advance.includes('finish({animate:true})'));
  assert.ok(advance.includes('screen!=="playScreen"'));
  assert.ok(advance.includes('pictureKey!==activeKey()'));
  assert.ok(advance.includes('window.matchMedia?.("(max-width: 740px)")?.matches'));
  assert.ok(advance.includes('scrollIntoView?.('));
  assert.ok(app.includes('function cancelRowAdvance(){'));
  for(const segment of [
    getSection('function chooseLevel(){','function start('),
    getSection('function restart(){','function saveArt(){'),
    getSection('function question(){','function selectLevel(')
  ])assert.ok(segment.includes('cancelRowAdvance()'));
});
test("Number-line circles distinguish quick click/tap, drag and keyboard interactions",()=>{
  const renderer=getSection('function renderLine(svg,interval,readonly=false){',
    'function nearest(ev,svg){');
  assert.ok(renderer.includes('function toggleEndpoint(side,'));
  assert.ok(renderer.includes('g.addEventListener("pointerdown"'));
  assert.ok(renderer.includes('g.addEventListener("keydown"'));
  assert.ok(renderer.includes('"pointerup"'));
  assert.ok(renderer.includes('"pointermove"'));
  assert.ok(renderer.includes('event.pointerType==="mouse"&&event.button!==0'));
  assert.ok(renderer.includes('const CIRCLE_DRAG_THRESHOLD=9'));
  assert.ok(renderer.includes('Math.hypot('));
  assert.ok(renderer.includes('if(gesture.moved||distance>CIRCLE_DRAG_THRESHOLD)'));
  assert.ok(renderer.includes('setEndpoint(gesture.side,nearest(event,$("drawLine")))'));
  assert.ok(renderer.includes('toggleEndpoint(gesture.side)'));
  assert.ok(renderer.includes('"aria-pressed":String(closed)'));
  assert.ok(renderer.includes('role:"button",tabindex:0'));
  assert.ok(html.includes('Tap or click a circle to toggle'));
  assert.ok(html.includes('id="leftOpen"'));
  assert.ok(html.includes('id="rightClosed"'));
});
test("Desktop celebration is as immersive as mobile, with enlarged artwork and final sparkles",()=>{
  assert.ok(css.includes('@media (min-width:900px) and (min-height:650px)'));
  assert.ok(css.includes('width:min(100%,calc(100dvh - 330px),760px)'));
  assert.ok(css.includes('.reveal-dialog.is-celebrated::before'));
  assert.ok(css.includes('.reveal-dialog.is-celebrated::after'));
  assert.ok(css.includes('@keyframes celebration-sparkle-left'));
  assert.ok(css.includes('@keyframes celebration-sparkle-right'));
  assert.ok(css.includes('safe-area-inset-top'));
  assert.ok(css.includes('max-width:740px'));
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  assert.ok(app.includes('classList.add("is-celebrated")'));
  const full=getSection('function finish({animate=false}={}){',
    'function restart(){');
  assert.ok(full.includes('openReveal({animate})'),
    "All desktop and mobile completions should open the full-screen reveal first");
});


test("iOS Safari reveals the finished SVG by removing its real hidden attribute",()=>{
  const setter=getSection('function setRevealFinalArtVisible(visible){','function showRevealFinished(){');
  assert.ok(setter.includes('art.removeAttribute("hidden")'),
    "Safari may ignore assigning SVGElement.hidden=false");
  assert.ok(setter.includes('art.setAttribute("hidden","")'),
    "A replay must hide the SVG using the same attribute");
  assert.ok(setter.includes('art.setAttribute("aria-hidden",visible?"false":"true")'),
    "The visibility state must be accessible");
  assert.ok(!app.includes('$("revealFinalArt").hidden='),
    "Never assign SVGElement.hidden directly; this fails on some iPhones");
  const complete=getSection('function showRevealFinished(){','function playRevealRows(picture,rows){');
  assert.ok(complete.includes('setRevealFinalArtVisible(true)'));
  assert.ok(complete.includes('$("revealBuildLayer").hidden=true'));
  assert.ok(complete.includes('setDetailsVisible(art,true)'));
  const rows=getSection('function playRevealRows(picture,rows){','function openReveal({animate=true}={}){');
  assert.ok(rows.includes('setRevealFinalArtVisible(true)'));
  assert.ok(rows.includes('art.getBoundingClientRect()'),
    "Safari should repaint before starting the colour fade");
  assert.ok(rows.includes('colourTime+1050'),
    "The monochrome row layer must retire after the colour cross-fade");
  assert.ok(rows.includes('$("revealBuildLayer").hidden=true'));
  assert.ok(rows.includes('$("revealMirrorLayer").hidden=true'));
  const reset=getSection('function openReveal({animate=true}={}){','function closeReveal(){');
  assert.ok(reset.includes('setRevealFinalArtVisible(false)'));
  assert.ok(css.includes('[hidden]{display:none!important}'));
});


test("The student's unconfirmed inequality drives both full-size and mobile ghost art",()=>{
  assert.ok(html.includes('id="canvasStage"'));
  assert.ok(html.includes('id="mobilePreviewStrip"'));
  assert.ok(html.includes('id="mobilePixelCanvas"'));
  assert.ok(html.includes('Live picture preview'));
  const render=getSection('function sprite(', 'sprite($("introPixelArt"),{intro:true});');
  assert.ok(render.includes('livePreviewLayers.set(svg'));
  assert.ok(render.includes('svg===$("pixelCanvas")||svg===$("mobilePixelCanvas")'));
  const ghost=getSection('function drawLivePreview(candidate,phase="ghost"){','function previewStudentAnswer(candidate){');
  assert.ok(ghost.includes('picturePaintedValues(picture,q,candidate)'));
  assert.ok(ghost.includes('livePreviewLayers.values()'));
  assert.ok(!ghost.includes('picturePixelAt('),
    "The guess must not be corrected/clipped against secret art");
  assert.ok(!ghost.includes('save.done'));
  const options=getSection('function renderOptions(){','// The number line has');
  assert.ok(options.includes('previewStudentAnswer(opt.value)'));
  const controls=getSection('function toggleEndpoint(side,','function misconception(){');
  assert.ok(controls.includes('previewStudentAnswer(draft)'));
  assert.ok(controls.includes('if(preview)previewStudentAnswer(draft)'));
  assert.ok(controls.includes('function setEndpoint('));
  assert.ok(controls.includes('function setDirection('));
  const question=getSection('function question(){','function selectLevel(');
  assert.ok(question.includes('setDraft(draft,{preview:false})'),
    "Don't show an unchosen initial guess as the student's answer");
  assert.ok(question.includes('cancelPreviewFlash()'));
  assert.ok(question.includes('initProgress()'));
});
test("Incorrect checks flash orange then restore the unchanged ghost",()=>{
  const check=getSection('function check(){','function hint(){');
  assert.ok(check.includes('flashWrongPreview()'));
  assert.ok(check.indexOf('flashWrongPreview()')<check.indexOf('locked=true'));
  const wrong=getSection('function flashWrongPreview(){','function flashCorrectThenCommit(){');
  assert.ok(wrong.includes('drawLivePreview(candidate,"incorrect")'));
  assert.ok(wrong.includes('},580)'));
  assert.ok(wrong.includes('drawLivePreview(currentStudentAnswer(),"ghost")'));
  assert.ok(wrong.includes('cancelPreviewFlash()'));
  assert.ok(css.includes('.ink-live-preview--incorrect .ink-preview-pixel'));
  assert.ok(css.includes('fill:#f4a244'));
  assert.ok(css.includes('@keyframes ink-rejected-flash'));
});
test("Correct checks flash green, then commit only the accepted slate-blue row",()=>{
  const good=getSection('function flashCorrectThenCommit(){','function initProgress(');
  assert.ok(good.includes('drawLivePreview(q.answer,"correct")'));
  assert.ok(good.includes('sprite($("pixelCanvas"),{completed:save.done,animate:!reduced})'));
  assert.ok(good.includes('sprite($("mobilePixelCanvas"),{completed:save.done,animate:!reduced})'));
  assert.ok(good.includes('doneAtCheck'));
  const check=getSection('function check(){','function hint(){');
  assert.ok(check.includes('initProgress({animate:false,redraw:q.mode==="tutorial"})'));
  assert.ok(check.includes('flashCorrectThenCommit()'));
  assert.ok(check.includes('scheduleRowAdvance()'));
  assert.ok(css.includes('.ink-live-preview--correct .ink-preview-pixel'));
  assert.ok(css.includes('fill:#56c78d'));
  assert.ok(css.includes('fill:painted?(colour?pictureColourAt(picture,x,y):"#64738e")')||
    app.includes('pictureColourAt(picture,x,y):"#64738e"'));
  assert.ok(css.includes('@keyframes ink-accepted-flash'));
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
});
test("Phone users can see their ghosts while adjusting the number line",()=>{
  assert.ok(css.includes('.mobile-preview-strip{display:none}'));
  assert.ok(css.includes('@media(max-width:740px)'));
  assert.ok(css.includes('position:sticky'));
  assert.ok(css.includes('safe-area-inset-top'));
  assert.ok(css.includes('.mobile-preview-strip svg'));
  assert.ok(css.includes('.mobile-preview-strip.ink-stage--incorrect'));
  assert.ok(css.includes('.mobile-preview-strip.ink-stage--correct'));
  const redraw=getSection('function initProgress(', 'function question(){');
  assert.ok(redraw.includes('sprite($("mobilePixelCanvas")'));
});

test("One-screen studio always includes picture, colour inequalities and enlarged active row",()=>{
 for(const id of ["paintScreen","paintCanvas","paintRules","paintFocusRow",
   "paintFeedback","paintCheck","paintBack","paintRestart","paintEraser",
   "paintClear","paintProgressLabel","paintProgressFill","paintRowsDone",
   "paintSelectedLabel","paintStep"])
  assert.ok(html.includes('id="'+id+'"'),"Missing paint UI: "+id);
 assert.ok(!html.includes('id="paintQuickPalette"'),
   "Duplicate brush palette creates extra mobile scrolling");
 assert.ok(!html.includes('id="paintCheckMobile"'),
   "Only one Check button should be needed on a single screen");
 assert.ok(html.includes('data-level="paint"'));
 assert.ok(app.includes('from "./paint-engine.mjs"'));
 assert.ok(app.includes('show("paintScreen");startPaintRow();'));
 assert.ok(app.includes('document.body.classList.toggle("paint-session",id==="paintScreen")'));
 assert.ok(app.includes('save.paintDraft'));
 assert.ok(app.includes('checkPaintRow(picture,save.done,save.paintDraft)'));
 assert.ok(app.includes('paintAdvanceTimer=setTimeout('));
 assert.ok(app.includes('finish({animate:true})'));
 assert.ok(app.includes('paintLocked=true'));
});
test("Overview and enlarged labelled row share one draft, no answer leakage",()=>{
 const draw=getSection('function drawPaintCanvas(){','function showPaintFeedback(');
 assert.ok(draw.includes('finished=y>=1&&y<=picture.paint.grid.length&&y>activeY'));
 assert.ok(draw.includes('editable=y===activeY&&!paintLocked'));
 assert.ok(draw.includes('cell.disabled=!editable'));
 assert.ok(draw.includes('cell.textContent=current?String(picture.window.min+x):""'));
 assert.ok(draw.includes('picture.paint.grid[y-1][x]'));
 assert.ok(draw.includes('const focus=$("paintFocusRow")'));
 assert.ok(draw.includes('paintFocusCells=[]'));
 assert.ok(draw.includes('paintFocusCells[x]=cell'));
 assert.ok(draw.includes('cell.textContent=String(picture.window.min+x)'));
 assert.ok(draw.includes('const key=save.paintDraft?.[x]??null'));
 const painter=getSection('function paintSquare(col){','function clearPaintRow(){');
 assert.ok(painter.includes('[paintCells[col],paintFocusCells[col]]'));
 assert.ok(painter.includes('save.paintDraft[col]=paintBrush'));
 const check=getSection('function checkPaintAnswer(){','// Paint on either');
 assert.ok(check.includes('paintFocusCells[col]?.classList.add("paint-cell--wrong")'));
 assert.ok(check.includes('[...paintCells,...paintFocusCells]'));
 assert.ok(!check.includes('scrollIntoView'));
 for(const cls of [".paint-cell--active",".paint-cell--finished",
   ".paint-cell--waiting",".paint-cell--wrong",".paint-cell--correct",
   ".paint-focus-row",".paint-focus-cell"])
  assert.ok(css.includes(cls),cls+" styles missing");
});
test("Mobile rule cards are the palette and the check action stays beside the canvas",()=>{
 const rules=getSection('function renderPaintRules(){','function startPaintRow(){');
 assert.ok(rules.includes('button.dataset.colour=rule.key'));
 assert.ok(rules.includes('button.onclick=()=>selectPaintBrush(rule.key,index)'));
 assert.ok(rules.includes('button.dataset.ruleIndex=String(index)'));
 assert.ok(!rules.includes('paintQuickPalette'));
 const pointer=getSection('for(const boardId of ["paintCanvas","paintFocusRow"])',
   '$("paintCheck").onclick=checkPaintAnswer;');
 assert.ok(pointer.includes('square.disabled'));
 assert.ok(pointer.includes('square.dataset.row!==String(paintQuestion?.row)'));
 assert.ok(pointer.includes('setPointerCapture?.(event.pointerId)'));
 assert.ok(pointer.includes('document.elementFromPoint?.(event.clientX,event.clientY)'));
 assert.ok(pointer.includes('pointermove'));
 assert.ok(pointer.includes('pointercancel'));
 assert.ok(app.includes('$("paintCheck").onclick=checkPaintAnswer'));
 assert.ok(app.includes('$("paintEraser").onclick=()=>selectPaintBrush(null)'));
 assert.ok(app.includes('$("paintClear").onclick=clearPaintRow'));
 assert.ok(css.includes('touch-action:none'));
 assert.ok(css.includes('.paint-main-stage'));
 assert.ok(css.includes('.paint-rule-area'));
 assert.ok(css.includes('.paint-controls'));
 assert.ok(css.includes('height:calc(100dvh - 56px'));
 assert.ok(css.includes('grid-template-rows:minmax(0,1fr) auto auto auto'));
 assert.ok(css.includes('@media(max-width:740px)'));
 assert.ok(css.includes('@media(max-height:450px)'));
 assert.ok(css.includes('body.paint-session{overflow:hidden}'));
});
test("The paint rule palette uses compact cards and selects exact inequalities",()=>{
 const cssRules=css.slice(css.indexOf(".paint-rules{"),css.indexOf(".paint-rule{"));
 const cssCard=css.slice(css.indexOf(".paint-rule{"),css.indexOf(".paint-rule:hover{"));
 assert.ok(cssRules.includes("display:flex;flex-direction:column"),
   "Palette entries must not stretch to fill a tall canvas");
 assert.ok(!cssRules.includes("grid-auto-rows:minmax(0,1fr)"),
   "Equal-height grid rows recreated giant cards on iPhone");
 assert.ok(cssRules.includes("flex:0 1 auto"));
 assert.ok(cssRules.includes("overflow-y:auto"),
   "Four compact rules need a safe scroll fallback on short phones");
 assert.ok(cssCard.includes("flex:0 0 auto"));
 assert.ok(css.includes(".paint-rule.selected::after"));
 assert.ok(css.includes(".paint-rule{min-height:51px;"),
   "Phone-sized colour cards should be compact and touch friendly");
 const selection=getSection('function updatePaintBrush(){','function renderPaintRules(){');
 assert.ok(selection.includes('paintSelectedRuleIndex'));
 assert.ok(selection.includes('Number(b.dataset.ruleIndex)===paintSelectedRuleIndex'));
 assert.ok(!selection.includes('b.dataset.colour===(paintBrush'),
   "Same-colour inequalities must not all be highlighted");
 assert.ok(selection.includes('b.setAttribute("aria-pressed",String(selected))'));
 assert.ok(selection.includes('paintSelectedRuleIndex=null'));
 assert.ok(app.includes('paintSelectedRuleIndex=0;'),
   "The first rule should be selected at the start of each row");
 assert.ok(app.includes('rule?" · "+rule.inequality'),
   "Selected brush label should distinguish same-colour inequalities");
});
test("Paint mode uses the existing full-screen coloured artwork reveal",()=>{
 assert.ok(app.includes('if(picture.paint&&!picturePixelAt(picture,column,question.row))continue'));
 assert.ok(app.includes('finishedArtwork($("finishedArt"),activePicture())'));
 assert.ok(app.includes('setDetailsVisible($("finishedArt"),true)'));
 assert.ok(app.includes('cancelPaintTimers()'));
 for(const source of ["paint-engine.mjs","paint-pictures.mjs","paint-engine.test.mjs"])
  assert.ok(existsSync(join(root,source)),source+" not installed");
});


test("Five visible progression steps lead from six to fourteen rows, and extras stay accessible",()=>{
 for(const id of ["pictureJourneyHelp","picturePathProgress","pictureStepTrack",
   "morePicturesSection","morePicturesToggle","extraPicturePicker",
   "nextPictureButton"])
   assert.ok(html.includes('id="'+id+'"'),"Missing progression element "+id);
 assert.ok(html.includes("CHOOSE A PICTURE"));
 const picker=getSection("function renderPicturePicker(){","function updateLevelSelector(){");
 assert.ok(picker.includes("progressionForLevel(level)"));
 assert.ok(picker.includes("extraPicturesForLevel(level)"));
 assert.ok(picker.includes('for(const picture of core)picker.append(cardFor(picture))'));
 assert.ok(picker.includes("extras)bonus.append(cardFor(picture)"));
 assert.ok(picker.includes('PICTURE_TIERS[step-1]'));
 assert.ok(picker.includes('colours+" colours · "'));
 assert.ok(picker.includes('p.done')===false || picker.includes("progress.done"));
 assert.ok(picker.includes('picture.id===next?.id'));
 assert.ok(picker.includes('progress.completed?picture.name+" — completed"'));
 assert.ok(picker.includes('$("morePicturesSection").open=true'));
 assert.ok(css.includes(".picture-step-track"));
 assert.ok(css.includes(".picture-option-meta"));
 assert.ok(css.includes(".more-pictures"));
});
test("The starter immediately asks a real six-row question, not required practice",()=>{
 const start=getSection('function start({skip=false}={}){','function feedback(');
 assert.ok(start.includes('progressionStep(activePicture(),state.activeLevel)===1'));
 assert.ok(start.includes('save.tutorialDone=true'));
 assert.ok(start.includes('save.tutorial=tutorialFor(state.activeLevel).length'));
 assert.ok(app.includes('$("skipTutorialButton").hidden=state.activeLevel==="paint"||step===1'));
 assert.ok(app.includes('step===1?" · Quick win"'));
 const finish=getSection('function finish({animate=false}={}){','function restart(){');
 assert.ok(finish.includes('progressionForLevel(state.activeLevel)'));
 assert.ok(finish.includes('$("nextPictureButton").hidden=!next'));
 assert.ok(app.includes('$("nextPictureButton").onclick=()=>'));
});
test("Existing picture progress and historical saves never migrate to a different starter",()=>{
 assert.ok(app.includes('const HISTORICAL_DEFAULT_IDS='));
 for(const id of ["cat-cameo","mushroom-mystery","paint-rocket"])
   assert.ok(app.includes('"'+id+'"'));
 assert.ok(app.includes('const picture=pictureById(HISTORICAL_DEFAULT_IDS[level])'));
 assert.ok(app.includes('safeProgress(legacy,pictureById(HISTORICAL_DEFAULT_IDS.mixed))'));
 assert.ok(app.includes('const KEY="inequality-ink-v5"'));
 assert.ok(app.includes('state.progress[key]=safeProgress(current.progress[key],picture)'));
});


test("Solve & Paint provides accessible maths typing and handwriting panels",()=>{
  for(const id of ["workingShell","workTypeButton","workDrawButton","workTypePanel",
    "workDrawPanel","workingArea","workMathKeyboard","workMathPreview",
    "workDrawing","workPen","workEraser","workUndo","workClear"]){
    assert.ok(html.includes('id="'+id+'"'),"Missing working-space control: "+id);
  }
  assert.ok(html.includes('aria-label="Choose how to show your working"'));
  assert.ok(html.includes('aria-pressed="true"'));
  assert.ok(html.includes('data-math-key="fraction"'));
  assert.ok(html.includes('data-math-key="square"'));
  assert.ok(html.includes('aria-label="Drawing tools"'));
  assert.ok(css.includes(".working-draw-surface{"));
  assert.ok(css.includes("touch-action:none;cursor:crosshair"));
  assert.ok(app.includes('import {initWorkingPad} from "./working-space.mjs";'));
  assert.ok(app.includes("workingPad.reset();"));
  assert.ok(app.includes('$("workingShell").hidden=q.mode!=="solve";'));
});
