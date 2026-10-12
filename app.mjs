import {LEVELS,LEVEL_IDS,tutorialFor,identicalSolution,formatInterval,fmt} from "./model.mjs";
import {
 PICTURE_LIBRARY,pictureById,picturesForLevel,defaultPictureForLevel,
 progressionForLevel,extraPicturesForLevel,progressionStep,PICTURE_TIERS,
 pictureWidth,fullPictureWidth,pictureHeight,questionCount,pictureAxis,
 makePictureQuestion,picturePaintedValues,picturePixelAt,pictureColourAt,
 pictureBackgroundAt,pictureFinalDetails,pictureDetailStages,validatePictureLibrary
} from "./picture-engine.mjs";
import {makePaintQuestion,paintTarget,checkPaintRow} from "./paint-engine.mjs";
import {initWorkingPad} from "./working-space.mjs";
validatePictureLibrary();
const $=id=>document.getElementById(id), SVG="http://www.w3.org/2000/svg";
const workingPad=initWorkingPad(document);
const KEY="inequality-ink-v5", PREVIOUS_KEY="inequality-ink-v4";
const blank=()=>({tutorial:0,done:0,firstTry:0,hints:0,attempts:0,replay:0,tutorialDone:false,completed:false,paintDraft:[]});
const defaultSelection=()=>Object.fromEntries(LEVEL_IDS.map(level=>[level,defaultPictureForLevel(level).id]));
// Keep per-level saves from v1–v4 attached to their ORIGINAL pictures.
const HISTORICAL_DEFAULT_IDS={
 mirror:"cat-cameo",full:"mushroom-mystery",solve:"mushroom-mystery",
 mixed:"mushroom-mystery",paint:"paint-rocket"
};
const defaults=()=>({activeLevel:"mirror",selectedPictures:defaultSelection(),progress:{}});
const progressKey=(level,pictureId)=>level+":"+pictureId;
let state=defaults();
function safeProgress(raw,picture){
 if(!raw||typeof raw!=="object"||!Number.isInteger(raw.done)||raw.done<0||
   raw.done>questionCount(picture)||!Number.isInteger(raw.tutorial)||
   raw.tutorial<0||raw.tutorial>2)return blank();
 return {...blank(),...raw,completed:raw.completed===true||raw.done===questionCount(picture)};
}
try{
 const current=JSON.parse(localStorage.getItem(KEY));
 if(current&&typeof current==="object"&&LEVELS[current.activeLevel]){
   state.activeLevel=current.activeLevel;
   for(const level of LEVEL_IDS){
     const requested=current.selectedPictures?.[level];
     if(picturesForLevel(level).some(p=>p.id===requested))state.selectedPictures[level]=requested;
   }
   if(current.progress&&typeof current.progress==="object"){
     for(const level of LEVEL_IDS)for(const picture of picturesForLevel(level)){
       const key=progressKey(level,picture.id);
       if(current.progress[key])state.progress[key]=safeProgress(current.progress[key],picture);
     }
   }
 }else{
   const previous=JSON.parse(localStorage.getItem(PREVIOUS_KEY))||
     JSON.parse(localStorage.getItem("inequality-ink-v3"))||
     JSON.parse(localStorage.getItem("inequality-ink-v2"));
   if(previous&&typeof previous==="object"&&LEVELS[previous.activeLevel]&&previous.progress){
     state.activeLevel=previous.activeLevel;
     for(const level of LEVEL_IDS){
       const picture=pictureById(HISTORICAL_DEFAULT_IDS[level]),old=previous.progress[level];
       if(old)state.progress[progressKey(level,picture.id)]=safeProgress(old,picture);
     }
   }else{
     const legacy=JSON.parse(localStorage.getItem("inequality-ink-v1"));
     if(legacy&&typeof legacy==="object")
       state.progress[progressKey("mixed",HISTORICAL_DEFAULT_IDS.mixed)]=
         safeProgress(legacy,pictureById(HISTORICAL_DEFAULT_IDS.mixed));
   }
 }
}catch{}
const activePicture=()=>pictureById(state.selectedPictures[state.activeLevel]);
const activeKey=()=>progressKey(state.activeLevel,activePicture().id);
let save=state.progress[activeKey()]||(state.progress[activeKey()]=blank());
const syncProgress=()=>{
 const key=activeKey();
 save=state.progress[key]||(state.progress[key]=blank());
};
const store=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};
let paintQuestion=null,paintBrush=null,paintLocked=false,paintAdvanceTimer=null,
 paintErrorTimer=null,paintPointer=null,paintCells=[],paintFocusCells=[],
 paintSelectedRuleIndex=null;
function cancelPaintTimers(){
 if(paintAdvanceTimer!==null){clearTimeout(paintAdvanceTimer);paintAdvanceTimer=null;}
 if(paintErrorTimer!==null){clearTimeout(paintErrorTimer);paintErrorTimer=null;}
 paintPointer=null;
}
let screen="intro", q=null, draft=null, selected="left", chosen=null,
  locked=false, hintsShown=0, attempts=0, assisted=false, drag=null;
let rowAdvanceTimer=null;
const livePreviewLayers=new Map();
let previewFlashTimer=null;
function cancelPreviewFlash(){
 if(previewFlashTimer!==null){clearTimeout(previewFlashTimer);previewFlashTimer=null;}
}
function cancelRowAdvance(){
 if(rowAdvanceTimer!==null){
   clearTimeout(rowAdvanceTimer);
   rowAdvanceTimer=null;
 }
}
function scheduleRowAdvance(){
 cancelRowAdvance();
 const pictureKey=activeKey(),doneAtCheck=save.done;
 const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
 // Keep the ink animation and confirmation readable, without requiring
 // a second press. Ignore the callback if the player has left this picture.
 rowAdvanceTimer=setTimeout(()=>{
   rowAdvanceTimer=null;
   if(screen!=="playScreen"||!locked||pictureKey!==activeKey()||
      save.done!==doneAtCheck)return;
   if(save.done===questionCount(activePicture())){
     finish({animate:true});
   }else{
     question();
     // On a narrow display the button is well below the next question.
     // Bring the NEW inequality into view without moving the desktop layout.
     if(window.matchMedia?.("(max-width: 740px)")?.matches){
       document.activeElement?.blur?.();
       $("questionStep").scrollIntoView?.({
         behavior:reduced?"instant":"smooth",block:"start"
       });
     }
   }
 },reduced?340:q?.artMode==="mirror"?1170:820);
}
const mk=(tag,attrs={},parent=null)=>{const el=document.createElementNS(SVG,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));if(parent)parent.append(el);return el;};
const show=id=>{
 ["introScreen","playScreen","paintScreen","finishScreen"].forEach(
   name=>$(name).hidden=name!==id);
 document.body.classList.toggle("paint-session",id==="paintScreen");
 screen=id;
};
function sprite(svg,{completed=0,colour=false,intro=false,animate=false}={}){
 const picture=activePicture(),width=pictureWidth(picture),height=pictureHeight(picture);
 const half=picture.family==="half";
 svg.replaceChildren();
 svg.setAttribute("viewBox","0 0 "+width+" "+height);
 svg.classList.toggle("half-canvas",half);
 svg.setAttribute("aria-label","A mystery picture in progress. Each correct inequality adds a row.");
 const filledRows=new Map();
 if(!intro)for(let i=0;i<completed;i++){
   const task=makePictureQuestion(picture,i,save.replay,state.activeLevel);
   const columns=picturePaintedValues(picture,task)
     .map(value=>value-picture.window.min);
   filledRows.set(task.row,new Set(columns));
 }
 const activeRow=animate&&q?.row;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const inside=picturePixelAt(picture,x,y);
   const painted=intro?inside&&y>=Math.floor(height/2):
      inside&&(colour||(filledRows.get(y)?.has(x)??false));
   const fill=painted?(colour?pictureColourAt(picture,x,y):"#64738e"):
      colour?pictureBackgroundAt(picture,x,y,{full:false}):
      intro&&inside?"#d0d6dd":"#e9e5df";
   const attrs={x,y,width:1,height:1,fill,
     stroke:colour&&painted?"none":"#f7f3ed","stroke-width":0.035};
   if(animate&&painted&&y===activeRow&&!colour){
     attrs.class=q.artMode==="mirror"?
        ((q.mirrorSide==="right"?x>=width/2:x<width/2)?
          "ink-new-primary":"ink-new-reflection"):
        half?"ink-new-primary":"ink-new-full";
   }
   mk("rect",attrs,svg);
 }
 // In Mixed Challenge only, a reflected answer can construct both sides
 // of a row. No student-facing number-line pixel hints are added.
 if(!half&&!intro&&!colour&&q?.artMode==="mirror"){
   mk("line",{x1:width/2,x2:width/2,y1:0,y2:height,
     stroke:"#6ca69b","stroke-width":.13,
     "stroke-dasharray":".32 .25",opacity:.95},svg);
 }
 if(svg===$("pixelCanvas")||svg===$("mobilePixelCanvas")){
   livePreviewLayers.set(svg,mk("g",{"class":"ink-live-preview",
     "aria-hidden":"true"},svg));
 }

}
sprite($("introPixelArt"),{intro:true});
// Live candidate pixels are projected from the student's attempted solution,
// NOT clipped to the secret silhouette. Incorrect guesses remain visible only
// as temporary ghosts and never become committed or saved pixels.
function setPreviewPhase(phase){
 const stage=$("canvasStage");
 stage.classList.remove("ink-stage--incorrect","ink-stage--correct");
 if(phase==="incorrect"||phase==="correct")
   stage.classList.add("ink-stage--"+phase);
 $("mobilePreviewStrip").classList.remove("ink-stage--incorrect","ink-stage--correct");
 if(phase==="incorrect"||phase==="correct")
   $("mobilePreviewStrip").classList.add("ink-stage--"+phase);
 for(const layer of livePreviewLayers.values())
   layer.setAttribute("class","ink-live-preview ink-live-preview--"+phase);
}
function drawLivePreview(candidate,phase="ghost"){
 if(!livePreviewLayers.size)return;
 for(const layer of livePreviewLayers.values())layer.replaceChildren();
 setPreviewPhase(phase);
 if(!candidate||!q?.pictureId||q.mode==="tutorial")return;
 const picture=activePicture();
 for(const value of picturePaintedValues(picture,q,candidate)){
   for(const layer of livePreviewLayers.values())
     mk("rect",{x:value-picture.window.min,y:q.row,width:1,height:1,
       "class":"ink-preview-pixel","shape-rendering":"crispEdges"},layer);
 }
}
function previewStudentAnswer(candidate){
 if(locked||q?.mode==="tutorial")return;
 cancelPreviewFlash();
 drawLivePreview(candidate,"ghost");
}
function currentStudentAnswer(){
 return q?.mode==="read"?q.options?.[chosen]?.value:draft;
}
function flashWrongPreview(){
 const candidate=currentStudentAnswer();
 if(!candidate||!q?.pictureId)return;
 cancelPreviewFlash();
 drawLivePreview(candidate,"incorrect");
 const currentQuestion=q,pictureKey=activeKey();
 previewFlashTimer=setTimeout(()=>{
   previewFlashTimer=null;
   if(!locked&&q===currentQuestion&&screen==="playScreen"&&
      pictureKey===activeKey())
     drawLivePreview(currentStudentAnswer(),"ghost");
 },580);
}
function flashCorrectThenCommit(){
 if(!q?.pictureId)return;
 cancelPreviewFlash();
 const currentQuestion=q,pictureKey=activeKey(),doneAtCheck=save.done;
 drawLivePreview(q.answer,"correct");
 const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
 previewFlashTimer=setTimeout(()=>{
   previewFlashTimer=null;
   if(locked&&q===currentQuestion&&screen==="playScreen"&&
      pictureKey===activeKey()&&save.done===doneAtCheck){
     sprite($("pixelCanvas"),{completed:save.done,animate:!reduced});
     sprite($("mobilePixelCanvas"),{completed:save.done,animate:!reduced});
     $("canvasStage").classList.remove("ink-stage--correct","ink-stage--incorrect");
     $("mobilePreviewStrip").classList.remove("ink-stage--correct","ink-stage--incorrect");
   }
 },reduced?130:340);
}
function initProgress({animate=false,redraw=true}={}){
 const total=questionCount(activePicture());
 $("progressMarkers").replaceChildren();
 for(let n=0;n<total;n++){
   const el=document.createElement("span");
   if(n<save.done)el.classList.add("done");
   $("progressMarkers").append(el);
 }
 $("progressText").textContent=save.done+" of "+total;
 $("canvasProgress").textContent=save.done+" / "+total;
 $("progressFill").style.width=(save.done/total*100)+"%";
 $("phaseText").textContent=q?.mode==="read"?"READ THE LINE":
   q?.mode==="solve"?"SOLVE & DRAW":q?.mode==="tutorial"?"PRACTICE":"DRAW THE LINE";
 $("activeRowText").textContent=q?.mode==="tutorial"?
   "Practice — canvas unchanged":"Current row: "+q?.row;
 $("canvasProgress").setAttribute("aria-label",
   save.done+" of "+total+" picture rows finished");
 if(redraw){
   sprite($("pixelCanvas"),{completed:save.done,animate});
   sprite($("mobilePixelCanvas"),{completed:save.done,animate});
 }
}
function question(){
 cancelRowAdvance();
 cancelPreviewFlash();
 $("canvasStage").classList.remove("ink-stage--correct","ink-stage--incorrect");
 $("mobilePreviewStrip").classList.remove("ink-stage--correct","ink-stage--incorrect");
 drag=null;
 const picture=activePicture(),practice=tutorialFor(state.activeLevel);
 const tutorial=!save.tutorialDone&&save.tutorial<practice.length;
 q=tutorial?practice[save.tutorial]:
   makePictureQuestion(picture,save.done,save.replay,state.activeLevel);
 if(!q){finish();return;}
 attempts=0;hintsShown=0;assisted=false;chosen=null;locked=false;selected="left";
 draft={direction:picture.family==="half"?"right":"between",
   lower:0,upper:1,lowerIncluded:false,upperIncluded:false,at:0,included:false};
 workingPad.reset();
 const {min,max}=visibleAxis();
 for(const side of ["left","right"]){
   $(side+"Value").min=min;$(side+"Value").max=max;
 }
 document.querySelectorAll(".endpoint-card button,.endpoint-card input,.direction-chooser button")
   .forEach(el=>el.disabled=false);
 document.querySelector('[data-direction="between"]').hidden=picture.family==="half";
 $("questionStep").textContent=tutorial?"LET'S PRACTISE":
   "ROW "+(save.done+1)+" OF "+questionCount(picture);
 $("questionHeading").textContent=tutorial?"Learn the controls":
   q.mode==="read"?"Read the number line":q.mode==="solve"?"Solve, then draw":
   q.artMode==="mirror-half"?"Draw the inequality":"Draw the interval";
 $("questionPrompt").textContent=q.prompt;
 $("modeTag").textContent=tutorial?"TUTORIAL":q.mode.toUpperCase();
 $("equationCard").hidden=q.mode==="read";
 $("equationText").textContent=q.equation||"";
 $("readArea").hidden=q.mode!=="read";$("drawArea").hidden=q.mode==="read";
 $("workingShell").hidden=q.mode!=="solve";
 $("checkButton").hidden=false;
 $("checkButton").disabled=false;
 $("checkButton").textContent="Check & paint →";
 $("hintButton").disabled=false;$("hintButton").textContent="✳ Give me a hint";
 $("skipPractice").hidden=!tutorial;
 $("hintPanel").hidden=true;$("hintPanel").replaceChildren();
 $("feedback").className="feedback";$("feedback").textContent="";
 $("canvasTip").textContent="✦ Light squares preview your answer. Orange means try again; green means correct.";
 $("playEyebrow").textContent=picture.clue.toUpperCase()+
   " / "+LEVELS[state.activeLevel].name.toUpperCase();
 $("playTitle").firstChild.textContent="Mystery Picture";
 $("playSubtitle").textContent=LEVELS[state.activeLevel].detail;
 if(q.mode==="read"){renderLine($("readLine"),q.answer,true);renderOptions();}
 else setDraft(draft,{preview:false});
 initProgress();
}
function selectLevel(level){
 if(!LEVELS[level])return;
 state.activeLevel=level;
 if(!picturesForLevel(level).some(p=>p.id===state.selectedPictures[level])){
   state.selectedPictures[level]=defaultPictureForLevel(level).id;
 }
 syncProgress();store();updateLevelSelector();
}
function selectPicture(id){
 if(!picturesForLevel(state.activeLevel).some(p=>p.id===id))return;
 state.selectedPictures[state.activeLevel]=id;
 syncProgress();store();updateLevelSelector();
}
function renderPicturePicker(){
 const level=state.activeLevel,core=progressionForLevel(level),
   extras=extraPicturesForLevel(level),
   picker=$("picturePicker"),bonus=$("extraPicturePicker");
 picker.replaceChildren();bonus.replaceChildren();
 $("picturePickerStatus").textContent="5 steps · "+extras.length+
   (extras.length===1?" more picture":" more pictures");
 $("pictureJourneyHelp").textContent=level==="paint"?
   "Start with two colours and work up to five. Every finished picture counts.":
   "Start with six quick questions. Each picture grows a little bigger.";
 const complete=core.filter(p=>
   state.progress[progressKey(level,p.id)]?.completed).length;
 const next=core.find(p=>!state.progress[progressKey(level,p.id)]?.completed);
 $("picturePathProgress").textContent=complete+" of 5 completed"+
   (next?" · Next: "+next.clue:" · All five finished!");
 const track=$("pictureStepTrack");
 track.replaceChildren();
 for(const [i,picture] of core.entries()){
   const progress=state.progress[progressKey(level,picture.id)]||blank();
   const dot=document.createElement("span");
   dot.className="picture-step"+(progress.completed?" picture-step--done":
     picture.id===next?.id?" picture-step--next":"");
   dot.textContent=progress.completed?"✓":String(i+1);
   dot.setAttribute("aria-label",PICTURE_TIERS[i]+": "+
     picture.clue+(progress.completed?", completed":", "+questionCount(picture)+" rows"));
   track.append(dot);
 }
 const cardFor=picture=>{
   const selected=activePicture().id===picture.id,
     progress=state.progress[progressKey(level,picture.id)]||blank(),
     step=progressionStep(picture,level),total=questionCount(picture),
     colours=picture.paint?Object.keys(picture.paint.colours).length:null;
   const meta=(step?PICTURE_TIERS[step-1]:"More pictures")+" · "+
     (colours===null?"":colours+" colours · ")+total+" rows";
   const card=document.createElement("button");
   card.type="button";
   card.className="picture-option"+(selected?" selected":"")+
     (picture.id===next?.id?" picture-option--next":"");
   card.setAttribute("aria-pressed",String(selected));
   card.setAttribute("aria-label",picture.clue+", "+meta+", "+
     (progress.completed?picture.name+" completed":
       progress.done+" of "+total+" rows finished"));
   const icon=document.createElement("span");
   icon.className="picture-option-icon";
   icon.setAttribute("aria-hidden","true");
   icon.textContent=progress.completed?"✓":step?String(step):"✦";
   const contents=document.createElement("span");
   contents.className="picture-option-copy";
   const title=document.createElement("strong");title.textContent=picture.clue;
   const caption=document.createElement("small");
   caption.textContent=progress.completed?picture.name+" — completed":
     progress.done?progress.done+" / "+total+" rows finished":
     step===1?"Quick win · Ready to start":!step?"Bonus picture":
     picture.id===next?.id?"Suggested next":"Not started";
   const detail=document.createElement("span");
   detail.className="picture-option-meta";detail.textContent=meta;
   contents.append(title,caption,detail);
   const status=document.createElement("span");
   status.className="picture-option-status";
   status.textContent=progress.completed?"✓":selected?"●":"○";
   card.append(icon,contents,status);
   card.addEventListener("click",()=>selectPicture(picture.id));
   return card;
 };
 for(const picture of core)picker.append(cardFor(picture));
 for(const picture of extras)bonus.append(cardFor(picture));
 $("morePicturesSection").hidden=extras.length===0;
 $("morePicturesToggle").textContent="More pictures ("+extras.length+")";
 if(extras.some(p=>p.id===activePicture().id))$("morePicturesSection").open=true;
}
function updateLevelSelector(){
 document.querySelectorAll("[data-level]").forEach(button=>{
   const chosen=button.dataset.level===state.activeLevel;
   button.classList.toggle("selected",chosen);
   button.setAttribute("aria-pressed",String(chosen));
 });
 const picture=activePicture(),total=questionCount(picture),count=save.done;
 $("levelProgress").textContent=save.completed?"Picture complete":
   count?count+" / "+total+" rows completed":"Ready to start";
 $("levelDescription").textContent=LEVELS[state.activeLevel].detail;
 const painting=state.activeLevel==="paint";
 $("introLead").textContent=painting?
   "Choose a colour for each inequality, then paint the integer-labelled squares directly. Every correct row stays coloured until your picture is complete.":
   "Represent inequalities on number lines. Each correct answer reveals more of a mystery picture. Finish to see it come together in full colour.";
 $("introStepOne").innerHTML=painting?
   "<b>Read</b> the colour inequalities for a row.":
   "<b>Read or solve</b> the inequality.";
 $("introStepTwo").innerHTML=painting?
   "<b>Tap or swipe</b> to colour the correct integer squares.":
   "<b>Plot the endpoints</b> with the right circles.";
 $("introStepThree").innerHTML=painting?
   "<b>Check each row</b> and watch the numbers disappear.":
   "<b>Finish the picture</b> to discover the colourful surprise.";
 $("introGridSize").textContent=pictureWidth(picture)+" × "+picture.height;
 $("introArtCaption").textContent="A picture in progress";
 const step=progressionStep(picture,state.activeLevel);
 const colours=picture.paint?Object.keys(picture.paint.colours).length:null;
 $("pictureSummary").textContent=(step?PICTURE_TIERS[step-1]:"More pictures")+
   " · "+(colours===null?"":colours+" colours · ")+total+
   " rows"+(step===1?" · Quick win":"")+" · No login needed";
 renderPicturePicker();
 sprite($("introPixelArt"),{intro:true});
 $("startButton").innerHTML=save.completed?"View completed picture ↗":
   count?"Continue "+(state.activeLevel==="paint"?"painting":"drawing")+" ↗":
   state.activeLevel==="paint"?"Start painting ↗":"Start drawing ↗";
 $("skipTutorialButton").hidden=state.activeLevel==="paint"||step===1;
}
function chooseLevel(){
 cancelPaintTimers();
 cancelRowAdvance();
 cancelPreviewFlash();
 clearRevealTimers();show("introScreen");
 updateLevelSelector();window.scrollTo({top:0,behavior:"instant"});
}
function start({skip=false}={}){
 cancelPaintTimers();
 cancelRowAdvance();
 cancelPreviewFlash();
 if(save.completed){finish({animate:true});return;}
 // Six real picture questions to the first celebration, not six plus a
 // compulsory two-question unrelated tutorial.
 if(progressionStep(activePicture(),state.activeLevel)===1&&!save.done){
   save.tutorialDone=true;
   save.tutorial=tutorialFor(state.activeLevel).length;
   store();
 }
 if(skip){
   save.tutorialDone=true;
   save.tutorial=tutorialFor(state.activeLevel).length;
   store();
 }
 if(state.activeLevel==="paint"){
   show("paintScreen");startPaintRow();
 }else{
   show("playScreen");question();
 }
 window.scrollTo({top:0,behavior:"instant"});
}
function feedback(msg,correct=false){const e=$("feedback");e.className="feedback"+(correct?" success":"");e.textContent=msg;}

// A separate, deliberately direct painting interaction. One row is editable;
// all previous rows are locked, and future rows contain no image clues.
// Each numbered square is the integer printed inside it, not an interval.
function paintColour(picture,key){
 return key==null?null:picture.paint.colours[key]?.hex||null;
}
function updatePaintProgress(){
 const count=save.done,total=questionCount(activePicture());
 $("paintProgressLabel").textContent="Row "+Math.min(count+1,total)+" of "+total;
 $("paintProgressFill").style.width=(count/total*100)+"%";
 $("paintRowsDone").textContent=count+" / "+total;
 $("paintStep").textContent="ROW "+Math.min(count+1,total)+" OF "+total;
}
function describePaintCell(col,colourKey){
 const value=activePicture().window.min+col;
 const swatch=activePicture().paint.colours[colourKey];
 return "Integer "+value+": "+(swatch?.name||"unpainted")+
   ". Select a brush, then tap or press Enter to paint.";
}
function paintCellStyle(button,key){
 const picture=activePicture();
 button.style.backgroundColor=paintColour(picture,key)||"#f4f2ee";
}
function drawPaintCanvas(){
 const picture=activePicture(),width=pictureWidth(picture),
   height=pictureHeight(picture),host=$("paintCanvas"),
   activeY=picture.paint.grid.length-save.done;
 host.replaceChildren();
 host.style.gridTemplateColumns="repeat("+width+",minmax(0,1fr))";
 host.style.aspectRatio=width+" / "+height;
 paintCells=[];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const finished=y>=1&&y<=picture.paint.grid.length&&y>activeY;
   const editable=y===activeY&&!paintLocked;
   const current=y===activeY;
   const key=finished?picture.paint.grid[y-1][x]:
     current?(save.paintDraft?.[x]??null):null;
   const cell=document.createElement("button");
   cell.type="button";
   cell.className="paint-cell "+(current?"paint-cell--active":
     finished?"paint-cell--finished":"paint-cell--waiting");
   cell.dataset.col=String(x);cell.dataset.row=String(y);
   cell.disabled=!editable;
   cell.tabIndex=editable?0:-1;
   cell.textContent=current?String(picture.window.min+x):"";
   paintCellStyle(cell,key);
   cell.setAttribute("aria-label",current?
     describePaintCell(x,key):finished?"Completed coloured square":"Not yet available");
   if(current){
     paintCells[x]=cell;
     cell.onclick=()=>paintSquare(x);
   }
   host.append(cell);
 }
 // The overview and enlarged row show the SAME draft, with shared values
 // and strict one-row locking. This avoids tiny touch targets on a phone.
 const focus=$("paintFocusRow");
 focus.replaceChildren();
 focus.style.gridTemplateColumns="repeat("+width+",minmax(0,1fr))";
 paintFocusCells=[];
 for(let x=0;x<width;x++){
   const key=save.paintDraft?.[x]??null;
   const cell=document.createElement("button");
   cell.type="button";
   cell.className="paint-cell paint-focus-cell paint-cell--active";
   cell.dataset.col=String(x);
   cell.dataset.row=String(activeY);
   cell.disabled=paintLocked;
   cell.textContent=String(picture.window.min+x);
   cell.setAttribute("aria-label",describePaintCell(x,key));
   paintCellStyle(cell,key);
   cell.onclick=()=>paintSquare(x);
   paintFocusCells[x]=cell;
   focus.append(cell);
 }
}
function showPaintFeedback(message,success=false){
 const el=$("paintFeedback");
 el.className="feedback paint-feedback"+(success?" success":"");
 el.textContent=message;
}
function updatePaintBrush(){
 const name=paintBrush===null?"Eraser":activePicture().paint.colours[paintBrush].name;
 const rule=paintSelectedRuleIndex===null?null:
   paintQuestion?.rules[paintSelectedRuleIndex];
 $("paintSelectedLabel").textContent="Selected brush: "+name+
   (rule?" · "+rule.inequality:"");
 $("paintEraser").classList.toggle("selected",paintBrush===null);
 $("paintEraser").setAttribute("aria-pressed",String(paintBrush===null));
 for(const b of $("paintRules").children){
   // Colours can repeat in different inequalities: visually select exactly
   // the rule the student tapped, never its same-colour neighbours.
   const selected=paintSelectedRuleIndex!==null&&
     Number(b.dataset.ruleIndex)===paintSelectedRuleIndex;
   b.classList.toggle("selected",selected);
   b.setAttribute("aria-pressed",String(selected));
 }
}
function selectPaintBrush(key,ruleIndex=null){
 if(paintLocked)return;
 paintBrush=key;
 if(key===null){
   paintSelectedRuleIndex=null;
 }else{
   const rules=paintQuestion?.rules||[];
   const index=Number.isInteger(ruleIndex)&&rules[ruleIndex]?.key===key?
     ruleIndex:rules.findIndex(rule=>rule.key===key);
   paintSelectedRuleIndex=index>=0?index:null;
 }
 updatePaintBrush();
}
function renderPaintRules(){
 const host=$("paintRules");
 host.replaceChildren();
 paintQuestion.rules.forEach((rule,index)=>{
   const button=document.createElement("button");
   button.type="button";button.className="paint-rule";
   button.dataset.colour=rule.key;
   button.dataset.ruleIndex=String(index);
   const swatch=document.createElement("span");
   swatch.className="paint-swatch";swatch.style.backgroundColor=rule.colour;
   swatch.setAttribute("aria-hidden","true");
   const copy=document.createElement("span");copy.className="paint-rule-copy";
   const colour=document.createElement("strong");colour.textContent=rule.name;
   const equation=document.createElement("span");
   equation.className="paint-equation";equation.textContent=rule.inequality;
   copy.append(colour,equation);
   button.append(swatch,copy);
   button.setAttribute("aria-label",rule.name+", "+rule.inequality);
   button.onclick=()=>selectPaintBrush(rule.key,index);
   host.append(button);
 });
 // Each inequality is an individual brush choice, even when colours repeat.
 updatePaintBrush();
}
function startPaintRow(){
 cancelPaintTimers();
 const picture=activePicture(),index=save.done,width=pictureWidth(picture);
 if(index===questionCount(picture)){finish({animate:true});return;}
 paintQuestion=makePaintQuestion(picture,index,save.replay);
 paintLocked=false;
 const valid=Array.isArray(save.paintDraft)&&save.paintDraft.length===width&&
   save.paintDraft.every(key=>key==null||picture.paint.colours[key]);
 if(!valid)save.paintDraft=Array(width).fill(null);
 paintBrush=paintQuestion.rules[0].key;
 paintSelectedRuleIndex=0;
 $("paintCheck").disabled=false;
 $("paintCheck").textContent="Check row →";
 showPaintFeedback("");
 updatePaintProgress();
 renderPaintRules();
 drawPaintCanvas();
 $("paintTitle").textContent=picture.clue+" — colour studio";
}
function paintSquare(col){
 if(screen!=="paintScreen"||paintLocked||!paintQuestion||
    !Number.isInteger(col)||col<0||col>=pictureWidth(activePicture()))return;
 const old=save.paintDraft[col];
 if(old===paintBrush)return;
 save.paintDraft[col]=paintBrush;
 for(const cell of [paintCells[col],paintFocusCells[col]]){
   if(!cell)continue;
   paintCellStyle(cell,paintBrush);
   cell.setAttribute("aria-label",describePaintCell(col,paintBrush));
 }
 if(paintErrorTimer!==null){
   clearTimeout(paintErrorTimer);paintErrorTimer=null;
   for(const c of [...paintCells,...paintFocusCells])c?.classList.remove("paint-cell--wrong");
 }
 showPaintFeedback("");
 store();
}
function clearPaintRow(){
 if(paintLocked||screen!=="paintScreen")return;
 save.paintDraft=Array(pictureWidth(activePicture())).fill(null);
 drawPaintCanvas();
 showPaintFeedback("");
 store();
}
function checkPaintAnswer(){
 if(paintLocked||screen!=="paintScreen")return;
 const picture=activePicture(),result=checkPaintRow(picture,save.done,save.paintDraft);
 if(!result.correct){
   save.attempts++;store();
   showPaintFeedback(result.unpainted.length?
     "Some squares are still unpainted. Check the inequalities and try again.":
     "Not quite. The orange squares need another look. Try again.");
   for(const col of result.wrong){
     paintCells[col]?.classList.add("paint-cell--wrong");
     paintFocusCells[col]?.classList.add("paint-cell--wrong");
   }
   if(paintErrorTimer!==null)clearTimeout(paintErrorTimer);
   paintErrorTimer=setTimeout(()=>{
     paintErrorTimer=null;
     for(const c of [...paintCells,...paintFocusCells])c?.classList.remove("paint-cell--wrong");
   },600);
   return;
 }
 paintLocked=true;
 if(save.attempts===0)save.firstTry++;
 save.attempts=0;
 save.done++;
 save.paintDraft=[];
 save.completed=save.done===questionCount(picture);
 store();
 updatePaintProgress();
 $("paintCheck").disabled=true;
 $("paintCheck").textContent=save.completed?"✓ Correct — revealing…":"✓ Correct — next row…";
 showPaintFeedback("Correct! Watch the numbers disappear and the colours stay.",true);
 for(const cell of [...paintCells,...paintFocusCells]){
   cell.disabled=true;
   cell.classList.add("paint-cell--correct");
 }
 const savedKey=activeKey(),nextCount=save.done,
   reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
 paintAdvanceTimer=setTimeout(()=>{
   paintAdvanceTimer=null;
   if(screen!=="paintScreen"||activeKey()!==savedKey||
      save.done!==nextCount)return;
   if(save.completed)finish({animate:true});
   else startPaintRow(); // New row activates in the same fixed workspace.
 },reduced?280:850);
}
// Paint on either the miniature overview or the larger integer-labelled row.
// Both use the same saved draft; swipes use pointer capture for mobile.
for(const boardId of ["paintCanvas","paintFocusRow"]){
 const board=$(boardId);
 board.addEventListener("pointerdown",event=>{
   if(screen!=="paintScreen"||paintLocked||
     event.pointerType==="mouse"&&event.button!==0)return;
   const square=event.target.closest?.(".paint-cell");
   if(!square||square.disabled||
      square.dataset.row!==String(paintQuestion?.row))return;
   paintPointer=event.pointerId;
   paintSquare(Number(square.dataset.col));
   board.setPointerCapture?.(event.pointerId);
   event.preventDefault();
 });
 board.addEventListener("pointermove",event=>{
   if(paintPointer!==event.pointerId||paintLocked)return;
   const square=document.elementFromPoint?.(event.clientX,event.clientY)
     ?.closest?.(".paint-cell");
   if(square&&!square.disabled&&
      square.dataset.row===String(paintQuestion?.row))
     paintSquare(Number(square.dataset.col));
 });
 for(const eventName of ["pointerup","pointercancel","lostpointercapture"])
   board.addEventListener(eventName,event=>{
     if(paintPointer===event.pointerId)paintPointer=null;
   });
}
$("paintCheck").onclick=checkPaintAnswer;
$("paintClear").onclick=clearPaintRow;
$("paintEraser").onclick=()=>selectPaintBrush(null);
$("paintBack").onclick=chooseLevel;
$("paintRestart").onclick=restart;

function renderOptions(){
 const host=$("readOptions");host.replaceChildren();
 q.options.forEach((opt,i)=>{
  const b=document.createElement("button");b.type="button";b.textContent=String.fromCharCode(65+i)+". "+opt.label;
  b.classList.toggle("selected",chosen===i);b.disabled=locked;
  b.onclick=()=>{chosen=i;renderOptions();previewStudentAnswer(opt.value);};host.append(b);
 });
}
// The number line has only conventional mathematical markings.
// Its visible limits depend on the picture's chosen window, never on a
// hidden pixel boundary or any extra endpoint added to the inequality.
const visibleAxis=()=>pictureAxis(activePicture());
const coord=n=>{
 const {min,max}=visibleAxis();
 return 26+(n-min)*608/(max-min);
};
function renderLine(svg,interval,readonly=false){
 svg.replaceChildren();
 const group=mk("g",{},svg),axisY=66;
 mk("line",{x1:26,x2:634,y1:axisY,y2:axisY,stroke:"#7c899b","stroke-width":2},group);
 const isBetween=interval.direction==="between",
   hasLeft=isBetween||interval.direction==="right",
   hasRight=isBetween||interval.direction==="left";
 const leftX=coord(isBetween?interval.lower:interval.at),
   rightX=coord(isBetween?interval.upper:interval.at);
 let from=hasLeft?leftX:26,to=hasRight?rightX:634;
 if(interval.direction==="left")from=26;
 if(interval.direction==="right")to=634;
 if(from<=to)mk("line",{x1:from,x2:to,y1:axisY,y2:axisY,
   stroke:"#538ca2","stroke-width":7,"stroke-linecap":"round"},group);
 if(interval.direction==="left")
   mk("path",{d:"M 26 66 l 14 -8 M 26 66 l 14 8",fill:"none",stroke:"#538ca2","stroke-width":3},group);
 if(interval.direction==="right")
   mk("path",{d:"M 634 66 l -14 -8 M 634 66 l -14 8",fill:"none",stroke:"#538ca2","stroke-width":3},group);
 const {min,max}=visibleAxis();
 for(let n=min;n<=max;n++){
   const x=coord(n);
   mk("line",{x1:x,x2:x,y1:60,y2:72,stroke:"#768497","stroke-width":1.8},group);
   const t=mk("text",{x,y:96,"text-anchor":"middle",fill:"#58647a",
     "font-size":15,"font-weight":600},group);
   t.textContent=fmt(n);
   if(!readonly){
     const tick=mk("rect",{x:x-13,y:35,width:26,height:65,fill:"transparent",
       role:"button","aria-label":"Move selected endpoint to "+n,tabindex:0},group);
     tick.style.cursor="pointer";
     tick.addEventListener("click",()=>setEndpoint(selected,n));
     tick.addEventListener("keydown",event=>{
       if(event.key==="Enter"||event.key===" "){
         event.preventDefault();setEndpoint(selected,n);
       }
     });
   }
 }
 const circle=(x,closed,side)=>{
   const endpointLabel=side==="left"?"Left":"Right";
   const value=interval.direction==="between"?
     (side==="left"?interval.lower:interval.upper):interval.at;
   const groupAttrs=readonly?{}:{
     role:"button",tabindex:0,"data-endpoint":side,
     "aria-pressed":String(closed),
     "aria-label":endpointLabel+" endpoint "+fmt(value)+", "+
       (closed?"closed":"open")+". Tap or press Enter to toggle. Drag to move."
   };
   const g=mk("g",groupAttrs,group);
   mk("circle",{cx:x,cy:axisY,r:readonly?10:11,
     fill:closed?"#538ca2":"#ffffff",stroke:"#538ca2","stroke-width":3},g);
   if(!readonly){
     const hit=mk("circle",{cx:x,cy:axisY,r:20,fill:"transparent",
       stroke:selected===side?"#8ebbac":"none","stroke-width":2},g);
     hit.style.cursor="pointer";
     g.addEventListener("pointerdown",event=>{
       if(locked||(event.pointerType==="mouse"&&event.button!==0))return;
       // Pointer capture stays on the stable SVG even while the circles redraw.
       drag={pointerId:event.pointerId,side,
         startX:event.clientX,startY:event.clientY,moved:false};
       selected=side;
       syncInputs();
       svg.setPointerCapture?.(event.pointerId);
       event.preventDefault();
     });
     g.addEventListener("keydown",event=>{
       if(locked||event.repeat)return;
       if(event.key==="Enter"||event.key===" "){
         event.preventDefault();
         toggleEndpoint(side,{restoreFocus:true});
       }
     });
   }
 };
 if(hasLeft)circle(leftX,isBetween?interval.lowerIncluded:interval.included,"left");
 if(hasRight)circle(rightX,isBetween?interval.upperIncluded:interval.included,
   isBetween?"right":"left");
 if(!readonly){
   const info=mk("text",{x:330,y:124,"text-anchor":"middle",
     fill:"#9ba2ae","font-size":13},group);
   info.textContent="Tap/click a circle to open or close it; drag to move";
 }
}
// Distinguish a quick tap/click from a drag. The threshold is measured in
// CSS pixels so the action feels the same on touchscreens and desktops.
const CIRCLE_DRAG_THRESHOLD=9;
function toggleEndpoint(side,{restoreFocus=false}={}){
 if(locked||!draft)return;
 if(draft.direction==="between"){
   const key=side==="left"?"lowerIncluded":"upperIncluded";
   draft[key]=!draft[key];
 }else{
   draft.included=!draft.included;
 }
 selected=side;
 syncInputs();
 renderLine($("drawLine"),draft);
 previewStudentAnswer(draft);
 if(restoreFocus)$("drawLine")
   .querySelector?.('[data-endpoint="'+side+'"]')?.focus?.({preventScroll:true});
}
$("drawLine").addEventListener("pointermove",event=>{
 const gesture=drag;
 if(!gesture||locked||event.pointerId!==gesture.pointerId)return;
 const distance=Math.hypot(event.clientX-gesture.startX,
   event.clientY-gesture.startY);
 if(distance>CIRCLE_DRAG_THRESHOLD)gesture.moved=true;
 if(gesture.moved)setEndpoint(gesture.side,nearest(event,$("drawLine")));
});
$("drawLine").addEventListener("pointerup",event=>{
 const gesture=drag;
 if(!gesture||event.pointerId!==gesture.pointerId)return;
 drag=null;
 const distance=Math.hypot(event.clientX-gesture.startX,
   event.clientY-gesture.startY);
 if(gesture.moved||distance>CIRCLE_DRAG_THRESHOLD){
   setEndpoint(gesture.side,nearest(event,$("drawLine")));
 }else{
   toggleEndpoint(gesture.side);
 }
});
$("drawLine").addEventListener("pointercancel",event=>{
 if(drag?.pointerId===event.pointerId)drag=null;
});
$("drawLine").addEventListener("lostpointercapture",event=>{
 if(drag?.pointerId===event.pointerId)drag=null;
});
function nearest(ev,svg){
 const pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;
 const transformed=pt.matrixTransform(svg.getScreenCTM().inverse());
 const {min,max}=visibleAxis();
 return Math.max(min,Math.min(max,Math.round(min+(transformed.x-26)*(max-min)/608)));
}
function setEndpoint(which,n){
 if(locked)return;
 if(!Number.isFinite(n))return;
 const {min,max}=visibleAxis();
 n=Math.max(min,Math.min(max,Math.round(n)));
 if(draft.direction==="between"){
  if(which==="left"){draft.lower=Math.min(n,draft.upper-1);}else{draft.upper=Math.max(n,draft.lower+1);}
 }else draft.at=n;
 selected=which;syncInputs();renderLine($("drawLine"),draft);
 previewStudentAnswer(draft);
}
function setDraft(d,{preview=true}={}){
 draft={...d};syncInputs();renderLine($("drawLine"),draft);
 if(preview)previewStudentAnswer(draft);
}
function syncInputs(){
 for(const side of ["left","right"]){
  const isLeft=side==="left", isBetween=draft.direction==="between";
  const shown=isBetween?(isLeft?draft.lower:draft.upper):draft.at;
  $(side+"Value").value=shown;
  const included=isBetween?(isLeft?draft.lowerIncluded:draft.upperIncluded):draft.included;
  $(side+"Open").classList.toggle("selected",!included);
  $(side+"Closed").classList.toggle("selected",included);
  $(side+"Editor").classList.toggle("active",selected===side);
 }
 $("rightEditor").hidden=draft.direction!=="between";
 $("leftEditorLabel").textContent=draft.direction==="between"?"Left endpoint":"Ray endpoint";
 document.querySelectorAll("[data-direction]").forEach(b=>{
   const active=b.dataset.direction===draft.direction;
   b.classList.toggle("selected",active);b.setAttribute("aria-pressed",String(active));
 });
 $("directionChooser").hidden=q.mode==="read";
}
function setDirection(direction){
 if(locked)return;
 if(direction==="between"){
   if(draft.direction==="between")return;
   const {min,max}=visibleAxis();
   const lower=Math.min(max-1,Math.max(min,draft.at));
   setDraft({direction,lower,upper:lower+1,lowerIncluded:false,
     upperIncluded:false,at:lower,included:false});
 }else{
   const at=draft.direction==="between"
     ? (direction==="left"?draft.upper:draft.lower) : draft.at;
   const included=draft.direction==="between"
     ? (direction==="left"?draft.upperIncluded:draft.lowerIncluded) : draft.included;
   setDraft({...draft,direction,at,included});
 }
 selected="left";
 syncInputs();renderLine($("drawLine"),draft);
}
document.querySelectorAll("[data-direction]").forEach(b=>b.onclick=()=>setDirection(b.dataset.direction));
for(const side of ["left","right"]){
 $(side+"Decrease").onclick=()=>setEndpoint(side,Number($(side+"Value").value)-1);
 $(side+"Increase").onclick=()=>setEndpoint(side,Number($(side+"Value").value)+1);
 $(side+"Value").onchange=()=>setEndpoint(side,Number($(side+"Value").value));
 for(const type of ["Open","Closed"])$(side+type).onclick=()=>{
  if(locked)return;
  const included=type==="Closed";
  if(draft.direction==="between")draft[side==="left"?"lowerIncluded":"upperIncluded"]=included;
  else draft.included=included;
  selected=side;syncInputs();renderLine($("drawLine"),draft);
  previewStudentAnswer(draft);
 };
}
function misconception(){
 const a=q.answer,d=draft;
 if(d.direction!==a.direction)return "Check which part of the number line should be shaded.";
 if(a.direction!=="between"){
  if(d.at!==a.at)return "Check the endpoint value. Where does the inequality become an equality?";
  return "Think about whether the endpoint is included. Should the circle be open or closed?";
 }
 if(d.lower!==a.lower)return "Check the left endpoint. Look carefully at the lower limit.";
 if(d.upper!==a.upper)return "Check the right endpoint. Look carefully at the upper limit.";
 if(d.lowerIncluded!==a.lowerIncluded)return "Almost! Should the left-hand circle be open or closed?";
 if(d.upperIncluded!==a.upperIncluded)return "Almost! Should the right-hand circle be open or closed?";
 return "Check your number line carefully.";
}
function check(){
 if(locked)return;
 let correct=false;
 if(q.mode==="read"){
  if(chosen===null){feedback("Choose an inequality before checking.");return;}
  correct=identicalSolution(q.options[chosen].value,q.answer);
 }else correct=identicalSolution(draft,q.answer);
 attempts++;
 if(!correct){
   if(q.mode==="read")feedback("Not quite. Check the endpoints and which circles are filled.");
   else feedback(misconception());
   flashWrongPreview();
   return;
 }
 locked=true;$("hintButton").disabled=true;
 if(q.mode==="read")renderOptions();else{
   document.querySelectorAll(".endpoint-card button,.endpoint-card input,.direction-chooser button")
     .forEach(e=>e.disabled=true);
 }
 if(q.mode==="tutorial"){
  feedback("Exactly right! You have drawn the full solution set.",true);
  save.tutorial++;if(save.tutorial>=2)save.tutorialDone=true;
 }else{
  feedback(q.artMode==="mirror-half"
    ?"Correct! Another row of your mystery picture is complete."
    :q.artMode==="mirror"
      ?"Correct! Another row is complete."
      :"Beautifully done! Your exact interval has painted this row.",true);
  if(attempts===1 && !assisted)save.firstTry++;
  save.done++;
 }
 if(assisted||hintsShown)save.hints+=hintsShown;
 save.attempts+=attempts;
 store();
 // Save correct progress immediately, but allow the student's preview to
 // flash green before we replace it with the accepted slate-blue ink.
 initProgress({animate:false,redraw:q.mode==="tutorial"});
 if(q.mode!=="tutorial")flashCorrectThenCommit();
 updateLevelSelector();
 $("checkButton").disabled=true;
 $("checkButton").textContent=q.mode==="tutorial"?"✓ Correct — continuing…":
   save.done===questionCount(activePicture())?"✓ Correct — revealing…":"✓ Correct — next row…";
 scheduleRowAdvance();
}
function hint(){
 if(locked)return;
 hintsShown=Math.min(hintsShown+1,3);
 const final=formatInterval(q.answer);
 let msg;
 if(hintsShown===1){
   if(q.artMode==="mirror-half")msg="Check the direction of the arrow. Does the inequality include its endpoint?";
   else if(q.artMode==="mirror")msg="Work out whether this one-sided solution points left or right.";
   else msg=q.mode==="solve"?"Rearrange all three parts. When dividing by a negative number, reverse both inequality signs."
     :q.mode==="read"?"Open circles exclude endpoints; closed circles include them."
     :"Identify both endpoints and consider whether each is included.";
 }else if(hintsShown===2){
   if(q.artMode==="mirror-half")msg="A filled circle means equality is included; an open circle means it is excluded. Check the endpoint number too.";
   else if(q.artMode==="mirror")msg="Check both the arrow direction and the circle type.";
   else msg=q.mode==="solve"?"Isolate x in the middle, then check both boundaries."
     :q.mode==="read"?"Compare both endpoints and both circle types with your options."
     :"Check the number and the circle type at each end.";
 }else {
   assisted=true;
   msg="Answer: "+(q.mode==="solve"?q.equation+" simplifies to ":"")+final+
     ("." );
 }
 $("hintPanel").hidden=false;$("hintPanel").textContent=msg;
 $("hintButton").textContent=hintsShown===3?"Solution shown":"✳ More help";
 $("hintButton").disabled=hintsShown===3;
}
// The student sees a full-screen celebration BEFORE the results page.
// Each question contributes one real row of ink. Mirror Mode unfolds only
// after every row; colour/background and character details follow separately.
let revealTimers=[];
function clearRevealTimers(){
  for(const timer of revealTimers)clearTimeout(timer);
  revealTimers=[];
}
function later(callback,delay){
  revealTimers.push(setTimeout(callback,delay));
}
function drawHalfPanel(svg,left=false){
  const picture=activePicture(),width=pictureWidth(picture),height=pictureHeight(picture);
  svg.replaceChildren();
  svg.setAttribute("viewBox","0 0 "+width+" "+height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const local=left?width-1-x:x;
    const filled=picturePixelAt(picture,local,y);
    mk("rect",{x,y,width:1,height:1,fill:filled?"#64738e":"#e9e5df",
      stroke:"#f7f3ed","stroke-width":0.035},svg);
  }
}
function appendFinalDetails(svg,picture){
  for(const stage of pictureDetailStages(picture)){
    const group=mk("g",{"data-detail-stage":stage,"aria-hidden":"true",opacity:0},svg);
    for(const mark of pictureFinalDetails(picture)){
      if(mark.group!==stage)continue;
      mk("rect",{x:mark.x,y:mark.y+(1-mark.height)/2,
        width:1,height:mark.height,fill:mark.color,
        "shape-rendering":"crispEdges"},group);
    }
  }
}
function setDetailsVisible(svg,visible){
  svg.querySelectorAll("[data-detail-stage]").forEach(group=>{
    group.style.transition="none";
    group.setAttribute("opacity",visible?"1":"0");
  });
}
function finishedArtwork(svg,picture){
  const width=fullPictureWidth(picture),height=pictureHeight(picture);
  svg.replaceChildren();
  svg.classList.remove("half-canvas");
  svg.setAttribute("viewBox","0 0 "+width+" "+height);
  svg.setAttribute("aria-label",picture.name+
    " with its colourful background and illustrated finishing details");
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const filled=picturePixelAt(picture,x,y,{full:true});
    mk("rect",{x,y,width:1,height:1,
      fill:filled?pictureColourAt(picture,x,y,{full:true}):
        pictureBackgroundAt(picture,x,y),
      stroke:filled?"none":"#f7f3ed","stroke-width":filled?0:0.035},svg);
  }
  appendFinalDetails(svg,picture);
}
function renderFinishedArt(){
  finishedArtwork($("finishedArt"),activePicture());
  setDetailsVisible($("finishedArt"),true);
}
function buildMonochromeRows(picture){
  const svg=$("revealBuildArt"),width=pictureWidth(picture),
    height=pictureHeight(picture),rows=[];
  svg.replaceChildren();
  svg.setAttribute("viewBox","0 0 "+width+" "+height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    mk("rect",{x,y,width:1,height:1,fill:"#e9e5df",
      stroke:"#f8f3ec","stroke-width":0.035},svg);
  }
  // The actual generated inequality decides every pixel in every row.
  // This works for read, draw, solve and mixed questions alike.
  for(let index=0;index<questionCount(picture);index++){
    const question=makePictureQuestion(picture,index,save.replay,state.activeLevel);
    const group=mk("g",{"class":"reveal-ink-row",opacity:0},svg);
    for(const value of picturePaintedValues(picture,question)){
      const column=value-picture.window.min;
      if(picture.paint&&!picturePixelAt(picture,column,question.row))continue;
      mk("rect",{x:column,y:question.row,
        width:1,height:1,fill:"#61748e",
        stroke:"#f8f3ec","stroke-width":0.025},group);
    }
    rows.push(group);
  }
  return rows;
}
function setupRevealStages(picture){
  const labels=picture.family==="half"?
    ["Build","Reflect","Colour","Details"]:["Build","Colour","Details"];
  const holder=$("revealSteps");
  holder.replaceChildren();
  for(const label of labels){
    const element=document.createElement("span");
    element.className="reveal-step";
    element.textContent=label;
    holder.append(element);
  }
}
function setRevealStage(index,message){
  const steps=Array.from($("revealSteps").children);
  steps.forEach((step,i)=>{
    step.classList.toggle("active",i===index);
    step.classList.toggle("done",i<index);
  });
  $("revealStageText").textContent=message;
}
function setRevealFinalArtVisible(visible){
  // SVGElement.hidden is not consistently implemented in mobile Safari.
  // Change the ACTUAL attribute: [hidden]{display:none!important} is
  // applied globally, so a property-only assignment can leave the
  // coloured SVG invisible even after all animation stages finish.
  const art=$("revealFinalArt");
  if(visible)art.removeAttribute("hidden");
  else art.setAttribute("hidden","");
  art.setAttribute("aria-hidden",visible?"false":"true");
}
function showRevealFinished(){
  if(!$("revealDialog").open)return;
  clearRevealTimers();
  const picture=activePicture(),board=$("revealBoard"),art=$("revealFinalArt");
  $("revealBuildLayer").hidden=true;
  $("revealMirrorLayer").hidden=true;
  setRevealFinalArtVisible(true);
  board.classList.add("has-colour");
  setDetailsVisible(art,true);
  $("revealHeading").textContent=picture.name+"!";
  setRevealStage($("revealSteps").children.length-1,
    "Your masterpiece is complete. Close this screen to see your results.");
  for(const step of $("revealSteps").children){
    step.classList.remove("active");
    step.classList.add("done");
  }
  $("revealRowCount").textContent="";
  $("skipReveal").hidden=true;
  $("revealDialog").classList.add("is-celebrated");
  board.classList.add("is-celebrated");
}
function playRevealRows(picture,rows){
  const total=rows.length,delay=370,between=155;
  setRevealStage(0,"Watch your correct answers create the picture, row by row.");
  for(let i=0;i<total;i++){
    later(()=>{
      const row=rows[i];
      row.style.transition="opacity .28s ease-out";
      row.setAttribute("opacity","1");
      row.classList.add("is-painted");
      $("revealRowCount").textContent=(i+1)+" of "+total+" rows";
    },delay+i*between);
  }
  const rowsFinished=delay+(total-1)*between+430;
  let colourTime=rowsFinished+430;
  if(picture.family==="half"){
    const unfoldTime=rowsFinished+250;
    later(()=>{
      $("revealBuildLayer").hidden=true;
      const layer=$("revealMirrorLayer");
      layer.hidden=false;
      setRevealStage(1,"Your completed half-picture is unfolding!");
      // Reflow makes the hinge animation reliable on Safari and iOS.
      void layer.getBoundingClientRect();
      layer.classList.add("is-unfolding");
      $("revealRowCount").textContent="";
    },unfoldTime);
    later(()=>$("revealMirrorLayer").classList.add("is-open"),
      unfoldTime+1150);
    colourTime=unfoldTime+1450;
  }
  const colourIndex=picture.family==="half"?2:1;
  later(()=>{
    setRevealStage(colourIndex,"Now the background and colours appear!");
    $("revealRowCount").textContent="";
    const art=$("revealFinalArt");
    setRevealFinalArtVisible(true);
    // Force Safari to paint the now-visible SVG at opacity 0 before
    // starting the colour cross-fade to opacity 1.
    void art.getBoundingClientRect();
    $("revealBoard").classList.add("has-colour");
  },colourTime);
  // Retire the monochrome artwork only after the colour has faded in.
  // This prevents any SVG stacking discrepancies on Safari from leaving
  // the completed reveal stuck displaying its first, grey layer.
  later(()=>{
    $("revealBuildLayer").hidden=true;
    $("revealMirrorLayer").hidden=true;
  },colourTime+1050);
  const detailTime=colourTime+1150,stages=pictureDetailStages(picture);
  later(()=>setRevealStage(colourIndex+1,
    "The finishing touches are bringing your picture to life!"),detailTime);
  stages.forEach((stage,i)=>{
    later(()=>{
      const group=Array.from($("revealFinalArt")
        .querySelectorAll("[data-detail-stage]"))
        .find(candidate=>candidate.getAttribute("data-detail-stage")===stage);
      if(!group)return;
      group.style.transition="opacity .38s ease-out";
      group.setAttribute("opacity","1");
    },detailTime+i*420);
  });
  later(()=>{
    $("revealHeading").textContent=picture.name+"!";
    setRevealStage(colourIndex+1,
      "Your masterpiece is complete. Close this screen to see your results.");
    for(const step of $("revealSteps").children){
      step.classList.remove("active");
      step.classList.add("done");
    }
    $("skipReveal").hidden=true;
    $("revealDialog").classList.add("is-celebrated");
    $("revealBoard").classList.add("is-celebrated");
  },detailTime+stages.length*420+250);
}
function openReveal({animate=true}={}){
  clearRevealTimers();
  const dialog=$("revealDialog"),picture=activePicture(),
    width=fullPictureWidth(picture),height=pictureHeight(picture),
    board=$("revealBoard"),half=picture.family==="half";
  if(dialog.open)dialog.close();
  board.className="reveal-board";
  board.classList.remove("has-colour","is-celebrated");
  $("revealDialog").classList.remove("is-celebrated");
  board.style.aspectRatio=width+" / "+height;
  $("revealBuildLayer").hidden=false;
  $("revealBuildLayer").style.width=half?"50%":"100%";
  $("revealBuildLayer").style.left=half?"50%":"0";
  $("revealMirrorLayer").className="reveal-mirror-layer";
  $("revealMirrorLayer").classList.remove("is-unfolding","is-open");
  $("revealMirrorLayer").hidden=true;
  setRevealFinalArtVisible(false);
  finishedArtwork($("revealFinalArt"),picture);
  setDetailsVisible($("revealFinalArt"),false);
  drawHalfPanel($("revealMirrorLeft"),true);
  drawHalfPanel($("revealMirrorRight"),false);
  setupRevealStages(picture);
  const rows=buildMonochromeRows(picture);
  $("revealHeading").textContent="Your picture is coming to life!";
  $("revealRowCount").textContent="0 of "+questionCount(picture)+" rows";
  $("skipReveal").hidden=false;
  setRevealStage(0,"Getting your picture ready…");
  document.activeElement?.blur?.();
  // Hide the results themselves, not just cover them with a translucent layer.
  show(null);
  document.body.classList.add("reveal-open");
  dialog.showModal();
  $("closeReveal").focus();
  if(!animate||window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches){
    showRevealFinished();
  }else playRevealRows(picture,rows);
}
function closeReveal(){
  clearRevealTimers();
  const dialog=$("revealDialog");
  if(dialog.open)dialog.close();
  document.body.classList.remove("reveal-open");
  // The results screen becomes available ONLY after the popup is dismissed.
  show("finishScreen");
  $("replayReveal").hidden=false;
  window.scrollTo({top:0,behavior:"instant"});
  $("replayReveal").focus?.({preventScroll:true});
}
function finish({animate=false}={}){
  cancelPaintTimers();
  cancelRowAdvance();
  cancelPreviewFlash();
  clearRevealTimers();
  const picture=activePicture();
  save.completed=true;store();
  $("finishLevelLabel").textContent=LEVELS[state.activeLevel].name;
  $("finishTitle").textContent=picture.name+"!";
  const step=progressionStep(picture,state.activeLevel),
   next=step?progressionForLevel(state.activeLevel)
     .find(p=>progressionStep(p,state.activeLevel)===step+1):null;
 $("finishNote").textContent=next?
   "Brilliant! Your next picture, "+next.clue+", is ready.":
   "You've completed "+picture.name+". Revisit your artwork whenever you like!";
 $("nextPictureButton").hidden=!next;
 if(next)$("nextPictureButton").textContent="Next: "+next.clue+" →";
  renderFinishedArt();
  $("firstTryStat").textContent=save.firstTry+"/"+questionCount(picture);
  $("hintsStat").textContent=save.hints;
  $("replayReveal").hidden=false;
  // Even on phones the picture occupies its OWN screen before any stats.
  openReveal({animate});
}
function restart(){
 cancelPaintTimers();
 cancelRowAdvance();
 cancelPreviewFlash();
 clearRevealTimers();
 if(!confirm("Start this picture again? Your progress on other pictures will be kept."))return;
 const replay=(save.replay||0)+1;
 state.progress[activeKey()]=blank();
 syncProgress();
 Object.assign(save,{replay,tutorial:tutorialFor(state.activeLevel).length,tutorialDone:true});
 store();start();
}
function saveArt(){
 const picture=activePicture(),width=fullPictureWidth(picture),
   height=pictureHeight(picture),scale=40;
 const sprite=$("finishedArt").cloneNode(true);
 sprite.removeAttribute("hidden");
 sprite.setAttribute("xmlns",SVG);
 sprite.setAttribute("width",width*scale);
 sprite.setAttribute("height",height*scale);
 sprite.querySelectorAll("[data-detail-stage]").forEach(g=>{
   g.style.transition="none";g.setAttribute("opacity","1");
 });
 const xml=new XMLSerializer().serializeToString(sprite),
   url=URL.createObjectURL(new Blob([xml],{type:"image/svg+xml"}));
 const img=new Image();
 img.onload=()=>{
   const canvas=document.createElement("canvas");
   canvas.width=width*scale;canvas.height=height*scale;
   const ctx=canvas.getContext("2d");ctx.imageSmoothingEnabled=false;
   ctx.drawImage(img,0,0,canvas.width,canvas.height);
   URL.revokeObjectURL(url);
   canvas.toBlob(blob=>{
     if(!blob)return;
     const link=document.createElement("a"),objectUrl=URL.createObjectURL(blob);
     link.href=objectUrl;link.download="inequality-ink-"+picture.id+".png";
     link.click();
     setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
   },"image/png");
 };
 img.onerror=()=>URL.revokeObjectURL(url);
 img.src=url;
}
document.querySelectorAll("[data-level]").forEach(button=>{
 button.addEventListener("click",()=>selectLevel(button.dataset.level));
});
$("startButton").onclick=()=>start();
$("skipTutorialButton").onclick=()=>start({skip:true});
$("skipPractice").onclick=()=>{save.tutorial=tutorialFor(state.activeLevel).length;save.tutorialDone=true;store();question();};
$("checkButton").onclick=check;
$("hintButton").onclick=hint;
$("restartButton").onclick=restart;
$("changeLevelButton").onclick=chooseLevel;
$("chooseLevelButton").onclick=chooseLevel;
$("nextPictureButton").onclick=()=>{
 const step=progressionStep(activePicture(),state.activeLevel);
 const next=progressionForLevel(state.activeLevel)
   .find(p=>progressionStep(p,state.activeLevel)===step+1);
 if(!next)return;
 selectPicture(next.id);
 chooseLevel();
};
$("playAgain").onclick=()=>{
 cancelPaintTimers();
 cancelRowAdvance();
 cancelPreviewFlash();
 clearRevealTimers();
 const replay=(save.replay||0)+1;
 state.progress[activeKey()]=blank();
 syncProgress();
 Object.assign(save,{replay,tutorial:tutorialFor(state.activeLevel).length,tutorialDone:true});
 store();start();
};
$("downloadArt").onclick=saveArt;
$("replayReveal").onclick=()=>openReveal({animate:true});
$("skipReveal").onclick=showRevealFinished;
$("closeReveal").onclick=closeReveal;
$("revealDialog").addEventListener("cancel",event=>{
  event.preventDefault();closeReveal();
});
$("revealDialog").addEventListener("close",()=>{
  // Native dismissal (for example, browser back) also reveals the summary.
  if(screen!=="finish")closeReveal();
});
$("helpButton").onclick=()=>$("helpDialog").showModal();
$("closeHelp").onclick=()=>$("helpDialog").close();
$("doneHelp").onclick=()=>$("helpDialog").close();
$("helpDialog").addEventListener("click",e=>{if(e.target===$("helpDialog"))$("helpDialog").close();});
updateLevelSelector();
show("introScreen");
