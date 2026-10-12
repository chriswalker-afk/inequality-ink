import {WIDTH,HEIGHT,COLUMN_MIN,CAT_HALF_WIDTH,CAT_FULL_WIDTH,CAT_WINDOW,AXIS_MIN,AXIS_MAX,SEQUENCE,LEVELS,LEVEL_IDS,tutorialFor,makeQuestion,paintedColumns,identicalSolution,formatInterval,fmt,pixelAt,colourAt,catHalfPixelAt,catPixelAt,catColourAt,validatePuzzle} from "./model.mjs";
validatePuzzle();
const $=id=>document.getElementById(id), SVG="http://www.w3.org/2000/svg";
const KEY="inequality-ink-v4", PREVIOUS_KEY="inequality-ink-v3", LEGACY_KEY="inequality-ink-v1";
const blank=()=>({tutorial:0,done:0,firstTry:0,hints:0,attempts:0,replay:0,tutorialDone:false,completed:false});
const defaults=()=>({activeLevel:"mirror",progress:Object.fromEntries(LEVEL_IDS.map(id=>[id,blank()]))});
let state=defaults();
try{
  const current=JSON.parse(localStorage.getItem(KEY));
  const previous=current||JSON.parse(localStorage.getItem(PREVIOUS_KEY))||JSON.parse(localStorage.getItem("inequality-ink-v2"));
  if(previous && LEVELS[previous.activeLevel] && previous.progress && typeof previous.progress==="object"){
    state.activeLevel=previous.activeLevel;
    for(const id of LEVEL_IDS){
      // The Mirror Mode art and number-line window have changed.
      // Reset only the previous Mirror Mode; retain the other three levels.
      if(!current && id==="mirror")continue;
      const p=previous.progress[id];
      if(p && Number.isInteger(p.done) && p.done>=0 && p.done<=14 &&
         Number.isInteger(p.tutorial) && p.tutorial>=0 && p.tutorial<=2){
        state.progress[id]={...blank(),...p};
      }
    }
  }else{
    const legacy=JSON.parse(localStorage.getItem(LEGACY_KEY));
    if(legacy && Number.isInteger(legacy.done) && legacy.done>=0 && legacy.done<=14)
      state.progress.mixed={...blank(),...legacy};
  }
}catch{}
let save=state.progress[state.activeLevel];
const store=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};
let screen="intro", q=null, draft=null, selected="left", chosen=null, locked=false, hintsShown=0, attempts=0, assisted=false, drag=false;
const mk=(tag,attrs={},parent=null)=>{const el=document.createElementNS(SVG,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));if(parent)parent.append(el);return el;};
const show=id=>{["introScreen","playScreen","finishScreen"].forEach(name=>$(name).hidden=name!==id);screen=id;};
function sprite(svg,{completed=0,colour=false,intro=false,animate=false}={}){
  svg.replaceChildren();
  const cat=state.activeLevel==="mirror",width=cat?CAT_HALF_WIDTH:WIDTH;
  svg.setAttribute("viewBox","0 0 "+width+" "+HEIGHT);
  svg.classList.toggle("half-canvas",cat);
  svg.setAttribute("aria-label",cat
    ?"A picture in progress. Each correct inequality adds one row."
    :"A sixteen by sixteen full pixel-art canvas.");
  const drawn=new Map();
  if(!intro){
    for(let i=0;i<completed;i++){
      const solvedQuestion=makeQuestion(i,save.replay,state.activeLevel);
      if(!solvedQuestion)continue;
      const columns=paintedColumns(solvedQuestion).map(v=>cat?v-CAT_WINDOW.min:v-COLUMN_MIN);
      drawn.set(solvedQuestion.row,new Set(columns));
    }
  }
  const newRow=animate&&q?.row;
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<width;x++){
    const active=cat?catHalfPixelAt(x,y):pixelAt(x,y);
    const solved=intro?active&&y>=7:active&&(colour||(drawn.get(y)?.has(x)??false));
    const fill=solved?(colour?(cat?catColourAt(x+CAT_HALF_WIDTH,y):colourAt(x,y)):"#64738e")
      :(intro&&active?"#d0d6dd":"#e9e5df");
    const attrs={x,y,width:1,height:1,fill,
      stroke:colour&&solved?"none":"#f7f3ed","stroke-width":0.035};
    if(animate&&solved&&y===newRow&&!colour)
      attrs.class=cat?"ink-new-primary":q.artMode==="mirror"
        ?((q.mirrorSide==="right"?x>=WIDTH/2:x<WIDTH/2)?"ink-new-primary":"ink-new-reflection")
        :"ink-new-full";
    mk("rect",attrs,svg);
  }
  // The existing Mixed Challenge retains its original reflective row style.
  if(!cat&&!intro&&!colour&&q?.artMode==="mirror"){
    mk("line",{x1:WIDTH/2,x2:WIDTH/2,y1:0,y2:HEIGHT,stroke:"#6ca69b",
      "stroke-width":.13,"stroke-dasharray":".32 .25",opacity:.95},svg);
  }
}
sprite($("introPixelArt"),{intro:true});
function initProgress({animate=false}={}){
 $("progressMarkers").replaceChildren();
 for(let n=0;n<14;n++){const el=document.createElement("span");if(n<save.done)el.classList.add("done");$("progressMarkers").append(el);}
 $("progressText").textContent=save.done+" of 14";
 $("canvasProgress").textContent=save.done+" / 14";
 $("progressFill").style.width=(save.done/14*100)+"%";
 $("phaseText").textContent=q?.mode==="read"?"READ THE LINE":q?.mode==="solve"?"SOLVE & DRAW":q?.mode==="tutorial"?"PRACTICE":"DRAW THE LINE";
 $("activeRowText").textContent=q?.mode==="tutorial"?"Practice — canvas unchanged":"Current row: "+q?.row;
 $("canvasProgress").setAttribute("aria-label",save.done+" of 14 picture rows finished");
 sprite($("pixelCanvas"),{completed:save.done,animate});
}
function question(){
 const practice=tutorialFor(state.activeLevel);
 const tutorial=!save.tutorialDone && save.tutorial<practice.length;
 q=tutorial?practice[save.tutorial]:makeQuestion(save.done,save.replay,state.activeLevel);
 if(!q){finish();return;}
 attempts=0;hintsShown=0;assisted=false;chosen=null;locked=false;selected="left";
 // No prefilled direction or endpoints: the student must construct the solution.
 draft={direction:state.activeLevel==="mirror"?"right":"between",lower:0,upper:1,lowerIncluded:false,upperIncluded:false,at:0,included:false};
 $("workingArea").value="";
 document.querySelectorAll(".endpoint-card button,.endpoint-card input,.direction-chooser button").forEach(e=>e.disabled=false);
 document.querySelector('[data-direction="between"]').hidden=state.activeLevel==="mirror";
 $("questionStep").textContent=tutorial?"LET'S PRACTISE":("ROW "+(save.done+1)+" OF 14");
 $("questionHeading").textContent=tutorial?"Learn the controls":q.mode==="read"?"Read the number line":q.mode==="solve"?"Solve, then draw":q.artMode==="mirror-half"?"Draw the inequality":"Draw the interval";
 $("questionPrompt").textContent=q.prompt;
 $("modeTag").textContent=tutorial?"TUTORIAL":q.mode.toUpperCase();
 $("equationCard").hidden=q.mode==="read";
 $("equationText").textContent=q.equation||"";
 $("readArea").hidden=q.mode!=="read";$("drawArea").hidden=q.mode==="read";
 $("workingShell").hidden=q.mode!=="solve";
 $("nextButton").hidden=true;$("checkButton").hidden=false;
 $("hintButton").disabled=false;$("hintButton").textContent="✳ Give me a hint";
 $("skipPractice").hidden=!tutorial;
 $("hintPanel").hidden=true;$("hintPanel").replaceChildren();
 $("feedback").className="feedback";$("feedback").textContent="";
 const cat=state.activeLevel==="mirror";
 $("canvasTip").textContent="✦ Keep solving inequalities to complete the mystery picture.";
 $("playEyebrow").textContent="MYSTERY 01 / "+LEVELS[state.activeLevel].name.toUpperCase();
 $("playTitle").firstChild.textContent=cat?"Mystery Picture":"Mushroom Mystery";
 $("playSubtitle").textContent=LEVELS[state.activeLevel].detail;
 if(q.mode==="read"){renderLine($("readLine"),q.answer,true);renderOptions();}
 else setDraft(draft);
 initProgress();
}
function selectLevel(level){
 if(!LEVELS[level])return;
 state.activeLevel=level;
 save=state.progress[level];
 store();updateLevelSelector();
}
function updateLevelSelector(){
 document.querySelectorAll("[data-level]").forEach(b=>{
   const chosen=b.dataset.level===state.activeLevel;
   b.classList.toggle("selected",chosen);
   b.setAttribute("aria-pressed",String(chosen));
 });
 const count=save.done;
 $("levelProgress").textContent=save.completed?"Artwork finished in this level":count?count+"/14 rows completed":"Fresh picture";
 $("levelDescription").textContent=LEVELS[state.activeLevel].detail;
 $("introGridSize").textContent=state.activeLevel==="mirror"?CAT_HALF_WIDTH+" × 16":"16 × 16";
 $("introArtCaption").textContent=state.activeLevel==="mirror"?"A picture in progress":"Solve to paint";
 sprite($("introPixelArt"),{intro:true});
 $("startButton").innerHTML=save.completed?"View completed picture ↗":count?"Continue drawing ↗":"Start drawing ↗";
}
function chooseLevel(){
 clearRevealTimers();
 show("introScreen");updateLevelSelector();window.scrollTo({top:0,behavior:"instant"});
}
function start({skip=false}={}){
 if(save.completed){finish();return;}
 if(skip){save.tutorialDone=true;save.tutorial=2;store();}
 show("playScreen");question();window.scrollTo({top:0,behavior:"instant"});
}
function feedback(msg,correct=false){const e=$("feedback");e.className="feedback"+(correct?" success":"");e.textContent=msg;}
function renderOptions(){
 const host=$("readOptions");host.replaceChildren();
 q.options.forEach((opt,i)=>{
  const b=document.createElement("button");b.type="button";b.textContent=String.fromCharCode(65+i)+". "+opt.label;
  b.classList.toggle("selected",chosen===i);b.disabled=locked;
  b.onclick=()=>{chosen=i;renderOptions();};host.append(b);
 });
}
const coord=n=>26+(n-AXIS_MIN)*((660-52)/(AXIS_MAX-AXIS_MIN));
function renderLine(svg,interval,readonly=false){
 svg.replaceChildren();
 const group=mk("g",{},svg),axisY=66;
 if(q?.artMode==="mirror"){
   const right=q.mirrorSide==="right";
   const x0=right?coord(-.5):26,x1=right?634:coord(-.5);
   mk("rect",{x:x0,y:23,width:x1-x0,height:66,rx:5,fill:"#e9f5ef"},group);
   mk("line",{x1:coord(-.5),x2:coord(-.5),y1:25,y2:80,stroke:"#7baeaa",
      "stroke-width":1.6,"stroke-dasharray":"4 4"},group);
   const note=mk("text",{x:(x0+x1)/2,y:18,"text-anchor":"middle",
      fill:"#458478","font-size":13,"font-weight":750},group);
   note.textContent=right?"RIGHT HALF FOR PIXELS":"LEFT HALF FOR PIXELS";
 }
 mk("line",{x1:26,x2:634,y1:axisY,y2:axisY,stroke:"#7c899b","stroke-width":2},group);
 const isBetween=interval.direction==="between",
   hasLeft=isBetween||interval.direction==="right",
   hasRight=isBetween||interval.direction==="left";
 const leftX=coord(isBetween?interval.lower:interval.at),
   rightX=coord(isBetween?interval.upper:interval.at);
 let from=hasLeft?leftX:26,to=hasRight?rightX:634;
 if(interval.direction==="left")from=26;
 if(interval.direction==="right")to=634;
 if(from<=to)mk("line",{x1:from,x2:to,y1:axisY,y2:axisY,stroke:"#538ca2","stroke-width":7,"stroke-linecap":"round"},group);
 if(interval.direction==="left")mk("path",{d:"M 26 66 l 14 -8 M 26 66 l 14 8",fill:"none",stroke:"#538ca2","stroke-width":3},group);
 if(interval.direction==="right")mk("path",{d:"M 634 66 l -14 -8 M 634 66 l -14 8",fill:"none",stroke:"#538ca2","stroke-width":3},group);
 for(let n=AXIS_MIN;n<=AXIS_MAX;n++){
   const x=coord(n);
   mk("line",{x1:x,x2:x,y1:60,y2:72,stroke:"#768497","stroke-width":1.8},group);
   const t=mk("text",{x,y:96,"text-anchor":"middle",fill:"#58647a","font-size":15,"font-weight":600},group);
   t.textContent=fmt(n);
   if(!readonly){
     const tick=mk("rect",{x:x-13,y:35,width:26,height:65,fill:"transparent",
       "data-number":n,role:"button","aria-label":"Move selected endpoint to "+n,tabindex:-1},group);
     tick.style.cursor="pointer";
     tick.addEventListener("click",()=>setEndpoint(selected,n));
   }
 }
 const circle=(x,closed,side)=>{
   const g=mk("g",{},group);
   mk("circle",{cx:x,cy:axisY,r:readonly?10:11,
     fill:closed?"#538ca2":"#ffffff",stroke:"#538ca2","stroke-width":3},g);
   if(!readonly){
     const e=mk("circle",{cx:x,cy:axisY,r:18,fill:"transparent",
       stroke:selected===side?"#8ebbac":"none","stroke-width":2},g);
     e.style.cursor="grab";
     e.addEventListener("pointerdown",ev=>{
       if(locked)return;
       selected=side;
       drag=true;
       svg.setPointerCapture(ev.pointerId);
       ev.preventDefault();
       syncInputs();
       renderLine(svg,draft);
     });
   }
 };
 if(hasLeft)circle(leftX,isBetween?interval.lowerIncluded:interval.included,"left");
 if(hasRight)circle(rightX,isBetween?interval.upperIncluded:interval.included,
   isBetween?"right":"left");
 if(!readonly){
   const info=mk("text",{x:330,y:124,"text-anchor":"middle",fill:"#9ba2ae","font-size":13},group);
   info.textContent="Tap a tick or drag a circle to change your answer";
 }
}
// SVG owns pointer capture, not transient endpoint elements, so a drag
// continues when the SVG children are replaced during movement.
$("drawLine").addEventListener("pointermove",ev=>{
 if(drag && !locked)setEndpoint(selected,nearest(ev,$("drawLine")));
});
for(const eventName of ["pointerup","pointercancel","lostpointercapture"]){
 $("drawLine").addEventListener(eventName,()=>drag=false);
}
function nearest(ev,svg){
 const pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;
 const transformed=pt.matrixTransform(svg.getScreenCTM().inverse());
 return Math.max(AXIS_MIN,Math.min(AXIS_MAX,Math.round(AXIS_MIN+(transformed.x-26)*(AXIS_MAX-AXIS_MIN)/608)));
}
function setEndpoint(which,n){
 if(locked)return;
 if(!Number.isFinite(n))return;
 n=Math.max(AXIS_MIN,Math.min(AXIS_MAX,Math.round(n)));
 if(draft.direction==="between"){
  if(which==="left"){draft.lower=Math.min(n,draft.upper-1);}else{draft.upper=Math.max(n,draft.lower+1);}
 }else draft.at=n;
 selected=which;syncInputs();renderLine($("drawLine"),draft);
}
function setDraft(d){draft={...d};syncInputs();renderLine($("drawLine"),draft);}
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
   const lower=Math.min(AXIS_MAX-1,Math.max(AXIS_MIN,draft.at));
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
    ?"Exactly right! This ray paints one row of your half-cat. The other half stays hidden until the finale."
    :q.artMode==="mirror"
      ?"Correct! The reflected part completes this Mixed Challenge row."
      :"Beautifully done! Your exact interval has painted this row.",true);
  if(attempts===1 && !assisted)save.firstTry++;
  save.done++;
 }
 if(assisted||hintsShown)save.hints+=hintsShown;
 save.attempts+=attempts;
 store();initProgress({animate:q.mode!=="tutorial"});updateLevelSelector();
 $("checkButton").hidden=true;$("nextButton").hidden=false;
 $("nextButton").textContent=save.done===14?"Reveal the artwork ✦":"Next row →";
 $("nextButton").focus();
}
function hint(){
 if(locked)return;
 hintsShown=Math.min(hintsShown+1,3);
 const final=formatInterval(q.answer);
 let msg;
 if(hintsShown===1){
   if(q.artMode==="mirror-half")msg="Represent a full one-sided ray with the correct arrow. Only the canvas edge limits the pixels, never the inequality itself.";
   else if(q.artMode==="mirror")msg="Work out whether this one-sided solution points left or right.";
   else msg=q.mode==="solve"?"Rearrange all three parts. When dividing by a negative number, reverse both inequality signs."
     :q.mode==="read"?"Open circles exclude endpoints; closed circles include them."
     :"Identify both endpoints and consider whether each is included.";
 }else if(hintsShown===2){
   if(q.artMode==="mirror-half")msg="Choose the correct arrow, endpoint number and circle. Do not add another circle at the canvas edge.";
   else if(q.artMode==="mirror")msg="Check both the arrow direction and the circle type.";
   else msg=q.mode==="solve"?"Isolate x in the middle, then check both boundaries."
     :q.mode==="read"?"Compare both endpoints and both circle types with your options."
     :"Check the number and the circle type at each end.";
 }else {
   assisted=true;
   msg="Answer: "+(q.mode==="solve"?q.equation+" simplifies to ":"")+final+
     (q.artMode==="mirror-half"?". Only the part of this ray inside the right-hand canvas is drawn.":q.artMode==="mirror"?". This mixed question uses a reflected half.":".");
 }
 $("hintPanel").hidden=false;$("hintPanel").textContent=msg;
 $("hintButton").textContent=hintsShown===3?"Solution shown":"✳ More help";
 $("hintButton").disabled=hintsShown===3;
}
// Mirror Mode never reflects during play; the finished half-cat unfolds only now.
let revealTimers=[];
function clearRevealTimers(){
  for(const timer of revealTimers)clearTimeout(timer);
  revealTimers=[];
}
function later(callback,delay){revealTimers.push(setTimeout(callback,delay));}
function drawCatPanel(svg,left=false){
  svg.replaceChildren();
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<CAT_HALF_WIDTH;x++){
    const halfX=left?CAT_HALF_WIDTH-1-x:x;
    const filled=catHalfPixelAt(halfX,y);
    mk("rect",{x,y,width:1,height:1,fill:filled?"#64738e":"#e9e5df",
      stroke:"#f7f3ed","stroke-width":0.035},svg);
  }
}
function renderFinishedArt(){
  if(state.activeLevel!=="mirror"){
    sprite($("finishedArt"),{colour:true,completed:14});
    $("finishedArt").setAttribute("aria-label","A completed full-colour mushroom.");
    return;
  }
  const svg=$("finishedArt");
  svg.replaceChildren();
  svg.setAttribute("viewBox","0 0 16 16");
  svg.classList.remove("half-canvas");
  svg.setAttribute("aria-label","A fully symmetrical coloured cat face, reflected from its right half.");
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
    const filled=catPixelAt(x,y);
    mk("rect",{x,y,width:1,height:1,
      fill:filled?catColourAt(x,y):"#e9e5df",
      stroke:filled?"none":"#f7f3ed","stroke-width":filled?0:0.035},svg);
  }
}
function playCatReveal(){
  if(state.activeLevel!=="mirror")return;
  clearRevealTimers();
  const stage=$("catFlipStage"),shell=$("finishedArtShell"),art=$("finishedArt");
  drawCatPanel($("catFlipLeft"),true);
  drawCatPanel($("catFlipRight"),false);
  stage.className="cat-flip-stage";
  shell.classList.remove("is-revealing","is-colouring");
  art.hidden=true;stage.hidden=false;
  $("catFlipStatus").textContent="Your finished half-cat…";
  $("replayReveal").hidden=true;
  // Reduced-motion users get the complete accessible artwork without any flip.
  if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches){
    stage.hidden=true;
    art.hidden=false;
    $("replayReveal").hidden=false;
    return;
  }
  later(()=>{
    $("catFlipStatus").textContent="Watch your drawing unfold!";
    stage.classList.add("is-flipping");
  },550);
  later(()=>{
    stage.classList.add("is-revealed");
    $("catFlipStatus").textContent="The whole cat! Still monochrome…";
  },1850);
  later(()=>{
    shell.classList.add("is-revealing");
    art.hidden=false;
    void art.getBoundingClientRect();
    shell.classList.add("is-colouring");
    $("catFlipStatus").textContent="Now add the colours!";
  },2390);
  later(()=>{
    $("replayReveal").hidden=false;
    $("catFlipStatus").textContent="Cat Cameo — complete!";
  },3500);
}
function finish({animate=false}={}){
  clearRevealTimers();
  save.completed=true;store();show("finishScreen");
  const cat=state.activeLevel==="mirror";
  $("finishLevelLabel").textContent=LEVELS[state.activeLevel].name;
  $("finishTitle").textContent=cat?"Your cat is complete!":"You painted it!";
  $("finishedArtShell").classList.remove("is-revealing","is-colouring");
  $("catFlipStage").hidden=true;
  $("finishedArt").hidden=false;
  $("replayReveal").hidden=!cat;
  renderFinishedArt();
  $("firstTryStat").textContent=save.firstTry+"/14";
  $("hintsStat").textContent=save.hints;
  $("finishNote").textContent=cat
    ?"Fourteen one-sided inequalities built a half-cat. Reflection made it whole!"
    :save.firstTry===14?"A perfect first-try picture — brilliant precision!"
     :"The whole picture is complete. Every mistake you corrected was part of the learning.";
  if(cat&&animate)playCatReveal();
  window.scrollTo({top:0,behavior:"instant"});
}
function restart(){
 clearRevealTimers();
 if(!confirm("Start a new picture? Your current row progress will be reset."))return;
 const replay=(save.replay||0)+1;
 state.progress[state.activeLevel]=blank();
 save=state.progress[state.activeLevel];
 Object.assign(save,{replay,tutorial:2,tutorialDone:true});
 store();start();
}
function saveArt(){
 const s=$("finishedArt").cloneNode(true);s.setAttribute("xmlns",SVG);s.setAttribute("width","512");s.setAttribute("height","512");
 const xml=new XMLSerializer().serializeToString(s),url=URL.createObjectURL(new Blob([xml],{type:"image/svg+xml"}));
 const img=new Image();img.onload=()=>{const c=document.createElement("canvas");c.width=c.height=512;const ctx=c.getContext("2d");ctx.imageSmoothingEnabled=false;ctx.drawImage(img,0,0,512,512);URL.revokeObjectURL(url);
 c.toBlob(blob=>{if(!blob)return;const link=document.createElement("a"),a=URL.createObjectURL(blob);link.href=a;link.download=state.activeLevel==="mirror"?"inequality-ink-cat-cameo.png":"inequality-ink-mushroom.png";link.click();setTimeout(()=>URL.revokeObjectURL(a),1000);},"image/png");};img.src=url;
}
document.querySelectorAll("[data-level]").forEach(button=>{
 button.addEventListener("click",()=>selectLevel(button.dataset.level));
});
$("startButton").onclick=()=>start();
$("skipTutorialButton").onclick=()=>start({skip:true});
$("skipPractice").onclick=()=>{save.tutorial=2;save.tutorialDone=true;store();question()};
$("checkButton").onclick=check;
$("nextButton").onclick=()=>{if(save.done===14)finish({animate:true});else question();};
$("hintButton").onclick=hint;
$("restartButton").onclick=restart;
$("changeLevelButton").onclick=chooseLevel;
$("chooseLevelButton").onclick=chooseLevel;
$("playAgain").onclick=()=>{
 clearRevealTimers();
 const replay=(save.replay||0)+1;
 state.progress[state.activeLevel]=blank();
 save=state.progress[state.activeLevel];
 Object.assign(save,{replay,tutorial:2,tutorialDone:true});
 store();start();
};
$("downloadArt").onclick=saveArt;
$("replayReveal").onclick=playCatReveal;
$("helpButton").onclick=()=>$("helpDialog").showModal();
$("closeHelp").onclick=()=>$("helpDialog").close();
$("doneHelp").onclick=()=>$("helpDialog").close();
$("helpDialog").addEventListener("click",e=>{if(e.target===$("helpDialog"))$("helpDialog").close();});
updateLevelSelector();
show("introScreen");
