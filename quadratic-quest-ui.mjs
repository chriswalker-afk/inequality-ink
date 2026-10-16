import {
  QUEST_SAVE_KEY,QUEST_SAVE_KEY_V2,QUEST_PICTURES,QUEST_STAGE_NAMES,
  QUEST_TIER_FOCUS,questPicturesForTier,questPictureById,
  quadraticAnswer,sameQuadraticAnswer,quadraticSolutionText,
  quadraticHints,quadraticExplanation,quadraticValue,validateQuadraticQuest
} from "./quadratic-quest.mjs";
import {initWorkingPad} from "./working-space.mjs";

const SVG="http://www.w3.org/2000/svg";
const clamp=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
const shortNum=n=>n<0?"−"+Math.abs(n):String(n);
const fresh=()=>({done:0,firstTry:0,attempts:0,hints:0,replay:0});
function validProgress(raw,picture){
  const total=picture.questions.length;
  if(!raw||typeof raw!=="object"||
    !Number.isInteger(raw.done)||raw.done<0||raw.done>total||
    !Number.isInteger(raw.firstTry)||raw.firstTry<0||raw.firstTry>raw.done||
    !Number.isInteger(raw.attempts)||raw.attempts<0||
    !Number.isInteger(raw.hints)||raw.hints<0||
    !Number.isInteger(raw.replay)||raw.replay<0)return fresh();
  return {done:raw.done,firstTry:raw.firstTry,attempts:raw.attempts,
    hints:raw.hints,replay:raw.replay};
}
function initialState(){
  return {selectedPicture:"prism",selectedTier:1,
    progress:Object.fromEntries(QUEST_PICTURES.map(p=>[p.id,fresh()])),
    discoveries:[]};
}
function suggestedPicture(state,explicitSelection=false){
  const selected=questPictureById(state.selectedPicture);
  if(selected){
    const done=state.progress[selected.id].done;
    if(done<selected.questions.length&&(done>0||explicitSelection))
      return selected.id;
  }
  return QUEST_PICTURES.find(p=>
    state.progress[p.id].done<p.questions.length)?.id||
      state.selectedPicture;
}
export function readQuadraticSave(storage){
  const state=initialState();
  let explicitSelection=false,explicitTier=false;
  try{
    const current=storage.getItem(QUEST_SAVE_KEY_V2);
    if(current!==null){
      const parsed=JSON.parse(current);
      if(parsed&&typeof parsed==="object"&&parsed.progress&&
        typeof parsed.progress==="object"){
        for(const p of QUEST_PICTURES)
          state.progress[p.id]=validProgress(parsed.progress[p.id],p);
        if(questPictureById(parsed.selectedPicture)){
          state.selectedPicture=parsed.selectedPicture;
          explicitSelection=true;
        }
        if(Number.isInteger(parsed.selectedTier)&&
          parsed.selectedTier>=1&&parsed.selectedTier<=5){
          state.selectedTier=parsed.selectedTier;
          explicitTier=true;
        }
        if(Array.isArray(parsed.discoveries))
          state.discoveries=parsed.discoveries.filter(id=>
            typeof id==="string"&&!!questPictureById(id));
      }
    }else{
      // Preserve the original Prism progress and prototype save unmodified.
      const legacy=storage.getItem(QUEST_SAVE_KEY);
      if(legacy!==null)
        state.progress.prism=validProgress(JSON.parse(legacy),QUEST_PICTURES[0]);
    }
  }catch{
    // Corrupt or unavailable localStorage must never prevent play.
  }
  state.discoveries=[...new Set([...state.discoveries,
    ...QUEST_PICTURES.filter(p=>state.progress[p.id].done===p.questions.length)
      .map(p=>p.id)])];
  state.selectedPicture=suggestedPicture(state,explicitSelection);
  if(!explicitTier)
    state.selectedTier=questPictureById(state.selectedPicture)?.stage||1;
  return state;
}
// A separate, testable mystery-pool policy shared by the screen and next-step
// navigation. "Start" never silently replays a completed image.
export function quadraticMysteryStatus(pictures,progress,discovered=[]){
  const known=new Set(discovered);
  const completed=pictures.filter(p=>known.has(p.id)||
    progress[p.id]?.done===p.questions.length);
  const newPictures=pictures.filter(p=>!known.has(p.id)&&
    (progress[p.id]?.done||0)===0);
  const partial=pictures.filter(p=>(progress[p.id]?.done||0)>0&&
    progress[p.id].done<p.questions.length);
  return {total:pictures.length,completed,newPictures,partial};
}
export function pickQuadraticMystery(pictures,progress,discovered=[],random=Math.random){
  const {newPictures}=quadraticMysteryStatus(pictures,progress,discovered);
  if(!newPictures.length)return null;
  const n=Number(random());
  const i=Number.isFinite(n)?
    Math.max(0,Math.min(newPictures.length-1,Math.floor(n*newPictures.length))):0;
  return newPictures[i];
}
function mk(doc,tag,attributes={},parent=null){
  const node=doc.createElementNS(SVG,tag);
  for(const [key,value] of Object.entries(attributes))
    node.setAttribute(key,String(value));
  if(parent)parent.append(node);
  return node;
}

export function initQuadraticQuest({doc,onShow,onReturn,storage=localStorage,win=window}){
  validateQuadraticQuest();
  const $=id=>doc.getElementById(id);
  const working=initWorkingPad(doc,{
    workingArea:"questWorkingArea",
    workMathPreview:"questMathPreview",
    workDrawing:"questDrawing",
    workTypeButton:"questWorkType",workDrawButton:"questWorkDraw",
    workTypePanel:"questTypePanel",workDrawPanel:"questDrawPanel",
    workMathKeyboard:"questMathKeyboard",
    workPen:"questPen",workEraser:"questEraser",
    workUndo:"questUndo",workClear:"questClear"
  });
  let state=readQuadraticSave(storage),
    picture=questPictureById(state.selectedPicture),
    progress=state.progress[state.selectedPicture],
    question=null,draft=null,
    locked=false,attempts=0,hintsShown=0,timer=null,pointer=null,
    view="picker",manualSelection=false;
  const axis=()=>picture.axis;
  const xFor=n=>50+(n-axis().min)*540/(axis().max-axis().min);
  const xOf=clientX=>{
    const rect=$("questLine").getBoundingClientRect();
    const x=(clientX-(rect.left||0))/Math.max(rect.width||0,1)*640;
    return clamp(Math.round(axis().min+(x-50)*(axis().max-axis().min)/540),
      axis().min,axis().max);
  };
  function store(){
    try{storage.setItem(QUEST_SAVE_KEY_V2,JSON.stringify(state));}catch{}
  }
  function cancelTimer(){
    if(timer!==null){clearTimeout(timer);timer=null;}
    pointer=null;
  }
  function discovered(p){
    return state.discoveries.includes(p.id)||
      state.progress[p.id].done===p.questions.length;
  }
  function completedCount(){return state.discoveries.length;}
  function tierPictures(){return questPicturesForTier(state.selectedTier);}
  function tierStatus(){
    return quadraticMysteryStatus(tierPictures(),state.progress,state.discoveries);
  }
  function updateEntry(){
    const finished=completedCount(),any=QUEST_PICTURES.some(p=>
      state.progress[p.id].done>0);
    $("questEnter").textContent=finished===QUEST_PICTURES.length?
      "View Quadratic Quest ↗":any?"Continue Quadratic Quest ↗":
      "Explore Quadratic Quest →";
    $("questEntryProgress").textContent=finished+" of "+
      QUEST_PICTURES.length+" pictures discovered · Five per difficulty";
  }
  function setPicture(id,{save=true,manual=true}={}){
    const next=questPictureById(id);
    if(!next)throw Error("Unknown Quadratic Quest picture "+id);
    picture=next;
    state.selectedPicture=id;
    state.selectedTier=next.stage;
    progress=state.progress[id];
    manualSelection=manual;
    if(save)store();
    renderPicker();
  }
  function selectTier(tier){
    if(!Number.isInteger(tier)||tier<1||tier>5)return;
    state.selectedTier=tier;
    manualSelection=false;
    store();
    renderPicker();
  }
  function continuedPicture(){
    const partial=tierStatus().partial;
    const newPartial=partial.filter(p=>!discovered(p));
    const available=newPartial.length?newPartial:partial;
    return available.find(p=>p.id===state.selectedPicture)||available[0]||null;
  }
  function renderPicker(){
    const done=completedCount(),tier=state.selectedTier;
    const status=tierStatus(),tierName=QUEST_STAGE_NAMES[tier-1];
    const chosen=manualSelection&&picture.stage===tier?picture:null;
    $("questJourneyProgress").textContent=done+" of "+
      QUEST_PICTURES.length+" discovered";
    const track=$("questStepTrack");
    track.replaceChildren();
    const levels=$("questDifficultyPicker");levels.replaceChildren();
    for(let step=1;step<=5;step++){
      const stats=quadraticMysteryStatus(questPicturesForTier(step),
        state.progress,state.discoveries);
      const allDone=stats.completed.length===stats.total;
      const selected=step===tier;
      const marker=doc.createElement("span");
      marker.className="picture-step"+
        (allDone?" picture-step--done":selected?" picture-step--next":"");
      marker.textContent=allDone?"✓":String(step);
      marker.setAttribute("title",QUEST_STAGE_NAMES[step-1]+
        ": "+stats.completed.length+" of "+stats.total+" discovered");
      track.append(marker);
      const button=doc.createElement("button");button.type="button";
      button.className="difficulty-card quest-difficulty-card"+
        (selected?" selected":"")+(allDone?" is-complete":"");
      button.setAttribute("aria-pressed",String(selected));
      button.setAttribute("aria-label",QUEST_STAGE_NAMES[step-1]+
        ", "+stats.completed.length+" of five discoveries");
      const stamp=doc.createElement("span");stamp.className="difficulty-stamp";
      stamp.textContent=allDone?"✓":String(step);
      const copy=doc.createElement("span");copy.className="difficulty-copy";
      const label=doc.createElement("strong");
      label.textContent=QUEST_STAGE_NAMES[step-1];
      const description=doc.createElement("small");
      description.textContent=(4+2*step)+" quadratic inequalities · "+
        QUEST_TIER_FOCUS[step-1];
      const progressLabel=doc.createElement("small");
      progressLabel.className="quest-difficulty-progress";
      progressLabel.textContent=stats.completed.length+" of 5 discovered";
      copy.append(label,description,progressLabel);
      const tick=doc.createElement("span");tick.className="difficulty-status";
      tick.textContent=allDone?"✓":selected?"●":"○";
      button.append(stamp,copy,tick);
      button.addEventListener("click",()=>selectTier(step));
      levels.append(button);
    }
    const gallery=$("questPicturePicker");
    gallery.replaceChildren();
    for(const p of tierPictures()){
      const save=state.progress[p.id],finished=discovered(p),
        selected=chosen?.id===p.id;
      const button=doc.createElement("button");button.type="button";
      button.className="quest-picture-choice"+(selected?" selected":"")+
        (finished?" quest-picture-choice--complete":"");
      button.setAttribute("aria-pressed",String(selected));
      button.setAttribute("aria-label",(finished?"Revisit completed picture: ":
        save.done?"Continue picture: ":"Select picture: ")+p.name);
      const number=doc.createElement("span");number.className="quest-picture-number";
      number.textContent=finished?"✓":"✦";
      const content=doc.createElement("span");content.className="quest-picture-content";
      const name=doc.createElement("strong");
      name.textContent=finished?p.name:p.clue||"Mystery artwork";
      const focus=doc.createElement("small");focus.textContent=p.focus;
      const note=doc.createElement("em");
      note.textContent=(4+2*tier)+" questions · "+(
        finished&&save.done===p.questions.length?"✓ Discovered":
        save.done?save.done+" of "+p.questions.length+" completed":
        finished?"Discovered · replay available":"Not started");
      content.append(name,focus,note);
      const hint=doc.createElement("span");hint.className="quest-picture-status";
      hint.textContent=finished?"✓":selected?"◉":"○";
      button.append(number,content,hint);
      button.addEventListener("click",()=>setPicture(p.id));
      gallery.append(button);
    }
    $("questTierStatus").textContent=status.completed.length+
      " of 5 pictures discovered · "+
      status.newPictures.length+" new mysteries waiting";
    if(chosen){
      $("questSelectedTitle").textContent=discovered(chosen)?
        chosen.name:chosen.clue||chosen.name;
      $("questSelectedSummary").textContent=tierName+" · "+
        chosen.questions.length+" questions · "+chosen.focus;
      $("questStart").disabled=false;
      $("questStart").textContent=discovered(chosen)&&
        state.progress[chosen.id].done===chosen.questions.length?
          "View completed picture ↗":
        state.progress[chosen.id].done?"Continue picture ↗":"Start picture ↗";
    }else{
      $("questSelectedTitle").textContent="Mystery artwork";
      $("questSelectedSummary").textContent=tierName+" · "+
        (4+2*tier)+" questions · Five pictures to discover";
      $("questStart").disabled=status.newPictures.length===0;
      $("questStart").textContent=status.newPictures.length?
        "Start a mystery →":"All new mysteries discovered ✓";
    }
    const continuing=continuedPicture();
    $("questContinueMystery").hidden=!continuing;
    if(continuing)$("questContinueMystery").textContent=
      "Continue your picture · "+state.progress[continuing.id].done+" of "+
      continuing.questions.length+" →";
    $("questNextPicture").hidden=false;
    updateEntry();
  }
  function renderArt(target,done,{final=false}={}){
    const svg=$(target),{art}=picture;
    svg.replaceChildren();
    const width=art.rows[0].length,h=art.rows.length;
    svg.setAttribute("viewBox","0 0 "+width+" "+h);
    for(let y=0;y<h;y++)for(let x=0;x<width;x++){
      const colour=art.colours[art.rows[y][x]];
      const show=final||y>=h-done;
      mk(doc,"rect",{x,y,width:1,height:1,
        fill:colour&&show?colour:"#e9e5df",
        stroke:colour&&show?"#ecf2f3":"#faf7f1",
        "stroke-width":0.05},svg);
    }
    svg.setAttribute("aria-label",final?
      "Completed "+picture.name+" pixel art":
      done+" of "+h+" rows of "+picture.name+" revealed");
  }
  function renderProgress(){
    const total=picture.questions.length;
    $("questProgressText").textContent=progress.done+" of "+total+" rows revealed";
    $("questProgressFill").style.width=(progress.done/total*100)+"%";
    $("questArtCount").textContent=progress.done+" / "+total;
    renderArt("questArt",progress.done);
    renderPicker();
  }
  function updateLine(){
    const svg=$("questLine"),y=58;
    svg.replaceChildren();
    // The highlighted rays reach the edges of the visible WINDOW, but remain
    // unbounded mathematically; arrowheads explicitly communicate infinity.
    mk(doc,"line",{x1:50,y1:y,x2:590,y2:y,stroke:"#8290a2","stroke-width":2},svg);
    for(let value=axis().min;value<=axis().max;value++){
      const x=xFor(value);
      mk(doc,"line",{x1:x,y1:51,x2:x,y2:65,stroke:"#8492a5","stroke-width":1.4},svg);
      const tick=mk(doc,"text",{x,y:83,"text-anchor":"middle",
        fill:"#56657a","font-size":15},svg);
      tick.textContent=shortNum(value);
    }
    const left=xFor(draft.lower),right=xFor(draft.upper);
    const segments=draft.region==="between"?[[left,right]]:
      [[50,left],[right,590]];
    for(const [from,to] of segments)
      mk(doc,"line",{x1:from,y1:y,x2:to,y2:y,
        stroke:"#2b8797","stroke-width":6,"stroke-linecap":"round"},svg);
    if(draft.region==="outside"){
      mk(doc,"path",{d:"M 50 58 l 12 -7 M 50 58 l 12 7 M 590 58 l -12 -7 M 590 58 l -12 7",
        fill:"none",stroke:"#2b8797","stroke-width":3,"stroke-linecap":"round"},svg);
    }
    for(const [side,x] of [["lower",left],["upper",right]]){
      const included=draft[side+"Included"];
      const label=(side==="lower"?"Left":"Right")+" root "+shortNum(draft[side])+
        (included?" included":" excluded")+". Tap to toggle or drag to move.";
      const group=mk(doc,"g",{"data-quest-root":side,role:"button",tabindex:0,
        "aria-label":label,"aria-pressed":String(included)},svg);
      mk(doc,"circle",{cx:x,cy:y,r:17,fill:"transparent"},group);
      mk(doc,"circle",{cx:x,cy:y,r:10,fill:included?"#2b8797":"#fff",
        stroke:"#2b8797","stroke-width":3},group);
      group.addEventListener("pointerdown",event=>{
        if((event.pointerType==="mouse"&&event.button!==0)||pointer)return;
        event.preventDefault?.();
        pointer={id:event.pointerId,side,startX:event.clientX,startY:event.clientY,moved:false};
        svg.setPointerCapture?.(event.pointerId);
      });
      group.addEventListener("keydown",event=>{
        if(event.key!=="Enter"&&event.key!==" ")return;
        event.preventDefault?.();
        if(!locked)updateDraft({[side+"Included"]:!draft[side+"Included"]});
      });
    }
    const foot=mk(doc,"text",{x:320,y:117,"text-anchor":"middle",
      "font-size":12,fill:"#758397"},svg);
    foot.textContent=draft.region==="outside"?
      "Both shaded rays continue indefinitely":"Shade only between the two roots";
  }
  function updateDraft(changes={}){
    if(locked)return;
    const next={...draft,...changes};
    next.lower=clamp(next.lower,axis().min,axis().max-1);
    next.upper=clamp(next.upper,axis().min+1,axis().max);
    if(next.lower>=next.upper){
      if(Object.hasOwn(changes,"lower"))next.lower=next.upper-1;
      else next.upper=next.lower+1;
    }
    draft=next;
    $("questLower").value=String(draft.lower);
    $("questUpper").value=String(draft.upper);
    for(const side of ["lower","upper"]){
      for(const kind of ["Open","Closed"]){
        const selected=draft[side+"Included"]===(kind==="Closed");
        const button=$("quest"+(side==="lower"?"Lower":"Upper")+kind);
        button.setAttribute("aria-pressed",String(selected));
        button.classList.toggle("selected",selected);
      }
    }
    for(const [region,id] of [["between","questBetween"],["outside","questOutside"]]){
      const selected=draft.region===region;
      $(id).classList.toggle("selected",selected);
      $(id).setAttribute("aria-pressed",String(selected));
    }
    renderLineSafely();
  }
  function renderLineSafely(){if(draft)updateLine();}
  function setEndpoint(side,value){
    if(!Number.isInteger(value))return updateDraft();
    updateDraft({[side]:value});
  }
  const line=$("questLine");
  line.addEventListener("pointermove",event=>{
    if(!pointer||event.pointerId!==pointer.id||locked)return;
    const movement=Math.hypot(event.clientX-pointer.startX,event.clientY-pointer.startY);
    if(movement>8){pointer.moved=true;setEndpoint(pointer.side,xOf(event.clientX));}
  });
  function finishPointer(event){
    if(!pointer||event.pointerId!==pointer.id)return;
    const gesture=pointer;pointer=null;
    if(line.hasPointerCapture?.(event.pointerId))line.releasePointerCapture?.(event.pointerId);
    if(locked)return;
    const distance=Math.hypot(event.clientX-gesture.startX,event.clientY-gesture.startY);
    if(gesture.moved||distance>8)setEndpoint(gesture.side,xOf(event.clientX));
    else updateDraft({[gesture.side+"Included"]:!draft[gesture.side+"Included"]});
  }
  line.addEventListener("pointerup",finishPointer);
  line.addEventListener("pointercancel",()=>{pointer=null;});
  line.addEventListener("lostpointercapture",()=>{pointer=null;});
  for(const [id,region] of [["questBetween","between"],["questOutside","outside"]])
    $(id).addEventListener("click",()=>updateDraft({region}));
  for(const [side,prefix] of [["lower","questLower"],["upper","questUpper"]]){
    const input=$(prefix);
    input.addEventListener("change",()=>setEndpoint(side,Number(input.value)));
    for(const [suffix,step] of [["Minus",-1],["Plus",1]])
      $(prefix+suffix).addEventListener("click",()=>setEndpoint(side,draft[side]+step));
    for(const [suffix,included] of [["Open",false],["Closed",true]])
      $(prefix+suffix).addEventListener("click",()=>updateDraft({[side+"Included"]:included}));
  }
  function drawGraph(q){
    const svg=$("questGraph");svg.replaceChildren();
    const xScale=x=>45+(x-axis().min)*550/(axis().max-axis().min);
    const axisY=116;
    const sampled=[];
    for(let i=0;i<=200;i++){
      const x=axis().min+i*(axis().max-axis().min)/200;
      sampled.push({x,y:quadraticValue(q,x)});
    }
    // Scale around the turning point rather than extreme window values.
    // Otherwise the relevant arch between roots looks almost flat.
    const vertex=(q.roots[0]+q.roots[1])/2;
    const amplitude=Math.max(2.5,Math.abs(quadraticValue(q,vertex)))*1.35;
    const yScale=y=>clamp(axisY-y*90/amplitude,13,217);
    mk(doc,"rect",{x:45,y:20,width:550,height:96,fill:"#eaf5f4",opacity:.7},svg);
    mk(doc,"rect",{x:45,y:116,width:550,height:100,fill:"#f9ebe8",opacity:.55},svg);
    mk(doc,"line",{x1:45,y1:axisY,x2:595,y2:axisY,
      stroke:"#67778b","stroke-width":2},svg);
    mk(doc,"line",{x1:xScale(0),y1:13,x2:xScale(0),y2:217,
      stroke:"#a1a9b3","stroke-width":1},svg);
    const d=sampled.map((p,i)=>(i?"L":"M")+xScale(p.x).toFixed(1)+
      " "+yScale(p.y).toFixed(1)).join(" ");
    mk(doc,"path",{d,fill:"none",stroke:"#5475ab","stroke-width":3.5,
      "stroke-linejoin":"round","stroke-linecap":"round"},svg);
    for(const root of q.roots){
      mk(doc,"circle",{cx:xScale(root),cy:axisY,r:5.5,fill:"#fdfdfb",
        stroke:"#496a9e","stroke-width":2},svg);
      const label=mk(doc,"text",{x:xScale(root),y:axisY+19,
        "text-anchor":"middle",fill:"#344b65","font-size":15},svg);
      label.textContent=shortNum(root);
    }
    for(const [y,title] of [[33,"ABOVE = POSITIVE"],[211,"BELOW = NEGATIVE"]]){
      const text=mk(doc,"text",{x:51,y,"font-size":12,fill:"#526879",
        "font-weight":"bold"},svg);
      text.textContent=title;
    }
    $("questGraphCaption").textContent="The graph crosses the x-axis at "+
      "x = "+q.roots.map(shortNum).join(" and x = ")+
      ". Look for where the curve is "+(q.operator[0]==="<"?"below":"above")+
      " the axis; the sign tells you whether each root is included.";
  }
  function loadQuestion(){
    cancelTimer();
    const total=picture.questions.length;
    if(progress.done>=total){finish(false);return;}
    question=picture.questions[progress.done];
    draft={region:"between",lower:0,upper:1,
      lowerIncluded:false,upperIncluded:false};
    locked=false;attempts=0;hintsShown=0;
    $("questQuestionStep").textContent="QUESTION "+(progress.done+1)+" OF "+total;
    $("questEquationText").textContent=question.expression;
    $("questFeedback").textContent="";
    $("questFeedback").className="feedback";
    $("questHintText").hidden=true;$("questHintText").textContent="";
    $("questHint").textContent="✳ Give me a hint";
    $("questHint").disabled=false;
    $("questGraphPanel").hidden=true;
    $("questGraphToggle").setAttribute("aria-expanded","false");
    $("questGraphToggle").textContent="⌁ Explore the parabola";
    $("questWorkingDetails").open=false;
    $("questCheck").disabled=false;
    $("questCheck").textContent="Check and reveal row →";
    for(const id of ["questBetween","questOutside","questLowerOpen","questLowerClosed",
      "questUpperOpen","questUpperClosed","questLowerMinus","questLowerPlus",
      "questUpperMinus","questUpperPlus","questLower","questUpper"]){
      $(id).disabled=false;
    }
    working.reset();updateDraft();renderProgress();
  }
  function feedback(text,success=false){
    const box=$("questFeedback");
    box.textContent=text;box.className="feedback"+(success?" success":"");
  }
  function check(){
    if(locked||!question)return;
    attempts++;
    const expected=quadraticAnswer(question);
    if(!sameQuadraticAnswer(expected,draft)){
      if(draft.region!==expected.region)
        feedback("Check whether the parabola is above or below the axis between its roots.");
      else if(draft.lower!==expected.lower||draft.upper!==expected.upper)
        feedback("Check both roots carefully. Where does the quadratic equal zero?");
      else feedback("Check the inequality sign. Should the roots be included or excluded?");
      return;
    }
    locked=true;
    progress.done++;
    progress.attempts+=attempts;
    progress.hints+=hintsShown;
    if(attempts===1&&hintsShown===0)progress.firstTry++;
    if(progress.done===picture.questions.length&&!state.discoveries.includes(picture.id))
      state.discoveries.push(picture.id);
    store();renderProgress();
    feedback("Correct! "+quadraticSolutionText(expected)+
      ". Another picture row is revealed.",true);
    $("questCheck").disabled=true;
    $("questCheck").textContent=progress.done===picture.questions.length?
      "✓ Quest complete — revealing…":"✓ Correct — next quadratic…";
    for(const id of ["questBetween","questOutside","questLowerOpen","questLowerClosed",
      "questUpperOpen","questUpperClosed","questLowerMinus","questLowerPlus",
      "questUpperMinus","questUpperPlus","questLower","questUpper"]){
      $(id).disabled=true;
    }
    timer=setTimeout(()=>{
      timer=null;
      if(progress.done===picture.questions.length){finish(true);}
      else{
        loadQuestion();
        if(win.matchMedia?.("(max-width:740px)")?.matches)
          $("questQuestionStep").scrollIntoView?.({behavior:"smooth",block:"start"});
      }
    },win.matchMedia?.("(prefers-reduced-motion:reduce)")?.matches?320:850);
  }
  function hint(){
    if(locked||!question||hintsShown===3)return;
    $("questHintText").hidden=false;
    $("questHintText").textContent=quadraticHints(question)[hintsShown];
    hintsShown++;
    $("questHint").textContent=hintsShown===3?
      "All hints shown":"✳ Next hint ("+(hintsShown+1)+" of 3)";
    $("questHint").disabled=hintsShown===3;
  }
  function graph(){
    if(!question)return;
    const showing=$("questGraphPanel").hidden;
    $("questGraphPanel").hidden=!showing;
    $("questGraphToggle").setAttribute("aria-expanded",String(showing));
    $("questGraphToggle").textContent=showing?
      "Hide the parabola":"⌁ Explore the parabola";
    if(showing)drawGraph(question);
  }
  function renderFinishContent(){
    $("questPlaying").hidden=true;$("questSelect").hidden=true;
    $("questFinished").hidden=false;$("questProgress").hidden=true;
    $("questRestart").hidden=false;
    $("questBack").textContent="↶ Quest pictures";
    renderArt("questFinishedArt",picture.questions.length,{final:true});
    renderArt("questRevealArt",picture.questions.length,{final:true});
    $("questFinishTitle").textContent=picture.name+"!";
    $("questRevealTitle").textContent=picture.name+"!";
    $("questFinishMessage").textContent="You solved "+picture.questions.length+
      " quadratic inequalities and revealed your "+picture.stageLabel+" picture.";
    $("questRevealCaption").textContent=picture.questions.length+
      " quadratic inequalities. One bright discovery.";
    $("questFinalStats").textContent=progress.firstTry+"/"+picture.questions.length+
      " questions correct first time without hints · "+progress.hints+" hints used";
    $("questNextPicture").hidden=false;
    const waiting=quadraticMysteryStatus(tierPictures(),
      state.progress,state.discoveries).newPictures;
    $("questNextPicture").textContent=waiting.length?
      "Another mystery →":"Choose another difficulty →";
    const list=$("questSolutions");list.replaceChildren();
    for(const q of picture.questions){
      const li=doc.createElement("li");
      li.textContent=q.expression+"  →  "+quadraticSolutionText(quadraticAnswer(q))+
        "  ("+q.factor+")";
      list.append(li);
    }
    renderPicker();
  }
  function reveal(){
    const dialog=$("questReveal");
    if(!dialog.open)dialog.showModal();
  }
  function finish(withReveal){
    cancelTimer();renderFinishContent();
    updateEntry();
    if(withReveal)reveal();
  }
  function showPicker(){
    cancelTimer();closeReveal();
    view="picker";
    $("questSelect").hidden=false;
    $("questPlaying").hidden=true;
    $("questFinished").hidden=true;
    $("questProgress").hidden=true;
    $("questRestart").hidden=true;
    $("questBack").textContent="↶ Main challenges";
    renderPicker();
    win.scrollTo?.({top:0,behavior:"instant"});
  }
  function startSelectedPicture(){
    cancelTimer();closeReveal();
    view="playing";
    $("questSelect").hidden=true;
    $("questPlaying").hidden=false;
    $("questFinished").hidden=true;
    $("questProgress").hidden=false;
    $("questRestart").hidden=false;
    $("questBack").textContent="↶ Quest pictures";
    // All five picture stages have their own visible endpoint ranges.
    $("questLower").setAttribute("min",axis().min);
    $("questLower").setAttribute("max",axis().max-1);
    $("questUpper").setAttribute("min",axis().min+1);
    $("questUpper").setAttribute("max",axis().max);
    if(progress.done===picture.questions.length)finish(false);
    else loadQuestion();
    win.scrollTo?.({top:0,behavior:"instant"});
  }
  function beginPicture(){
    const chosen=manualSelection&&picture.stage===state.selectedTier?
      picture:pickQuadraticMystery(tierPictures(),
        state.progress,state.discoveries);
    if(!chosen)return;
    setPicture(chosen.id,{manual:manualSelection});
    startSelectedPicture();
  }
  function continueMystery(){
    const chosen=continuedPicture();
    if(!chosen)return;
    setPicture(chosen.id,{manual:false});
    startSelectedPicture();
  }
  function open(){
    cancelTimer();onShow();showPicker();
  }
  function closeReveal(){
    if($("questReveal").open)$("questReveal").close();
  }
  function back(){
    if(view==="picker"){cancelTimer();closeReveal();onReturn();updateEntry();}
    else showPicker();
  }
  function restart({confirmFirst=true}={}){
    if(confirmFirst&&!(win.confirm||globalThis.confirm)(
      "Restart "+picture.name+"? Only this picture's progress will reset."
    ))return;
    cancelTimer();closeReveal();
    state.progress[picture.id]={...fresh(),replay:progress.replay+1};
    progress=state.progress[picture.id];
    store();
    beginPicture();
  }
  function nextPicture(){
    const next=pickQuadraticMystery(tierPictures(),
      state.progress,state.discoveries);
    if(next){
      setPicture(next.id,{manual:false});
      startSelectedPicture();
    }else{
      manualSelection=false;
      showPicker();
    }
  }
  $("questEnter").addEventListener("click",open);
  $("questBack").addEventListener("click",back);
  $("questStart").addEventListener("click",beginPicture);
  $("questContinueMystery").addEventListener("click",continueMystery);
  $("questNextPicture").addEventListener("click",nextPicture);
  $("questRestart").addEventListener("click",()=>restart());
  $("questFinishBack").addEventListener("click",showPicker);
  $("questReplay").addEventListener("click",()=>restart({confirmFirst:false}));
  $("questRevealClose").addEventListener("click",closeReveal);
  $("questRevealAgain").addEventListener("click",reveal);
  $("questReveal").addEventListener("cancel",event=>{
    event.preventDefault?.();closeReveal();
  });
  $("questCheck").addEventListener("click",check);
  $("questHint").addEventListener("click",hint);
  $("questGraphToggle").addEventListener("click",graph);
  store();renderPicker();showPicker();
  return {open,back,restart,updateEntry};
}
