import {
  QUEST_SAVE_KEY,QUEST_AXIS,QUEST_ART,QUEST_QUESTIONS,QUEST_TOTAL,
  quadraticAnswer,sameQuadraticAnswer,quadraticSolutionText,quadraticHints,
  quadraticExplanation,quadraticValue,validateQuadraticQuest
} from "./quadratic-quest.mjs";
import {initWorkingPad} from "./working-space.mjs";

const SVG="http://www.w3.org/2000/svg";
const clamp=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
const shortNum=n=>n<0?"−"+Math.abs(n):String(n);
const fresh=()=>({done:0,firstTry:0,attempts:0,hints:0,replay:0});
export function readQuadraticSave(storage){
  try{
    const data=JSON.parse(storage.getItem(QUEST_SAVE_KEY));
    if(!data||typeof data!=="object"||
       !Number.isInteger(data.done)||data.done<0||data.done>QUEST_TOTAL||
       !Number.isInteger(data.firstTry)||data.firstTry<0||data.firstTry>data.done||
       !Number.isInteger(data.attempts)||data.attempts<0||
       !Number.isInteger(data.hints)||data.hints<0||
       !Number.isInteger(data.replay)||data.replay<0)return fresh();
    return {done:data.done,firstTry:data.firstTry,attempts:data.attempts,
      hints:data.hints,replay:data.replay};
  }catch{return fresh();}
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
  let progress=readQuadraticSave(storage),question=null,draft=null,
    locked=false,attempts=0,hintsShown=0,timer=null,pointer=null;
  const totalWidth=QUEST_ART.rows[0].length;
  const xFor=n=>50+(n-QUEST_AXIS.min)*54;
  const xOf=clientX=>{
    const rect=$("questLine").getBoundingClientRect();
    return clamp(QUEST_AXIS.min+Math.round(
      ((clientX-(rect.left||0))/Math.max(rect.width||0,1)*640-50)/54),
      QUEST_AXIS.min,QUEST_AXIS.max);
  };
  function store(){
    try{storage.setItem(QUEST_SAVE_KEY,JSON.stringify(progress));}catch{}
  }
  function cancelTimer(){
    if(timer!==null){clearTimeout(timer);timer=null;}
    pointer=null;
  }
  function updateEntry(){
    $("questEnter").textContent=progress.done===QUEST_TOTAL?
      "View completed Quest ↗":progress.done?
      "Continue Quadratic Quest ↗":"Explore Quadratic Quest →";
    $("questEntryProgress").textContent=progress.done===QUEST_TOTAL?
      "All 6 questions completed · Play again whenever you like":
      progress.done?progress.done+" of 6 bonus rows revealed · Progress saved separately":
      "6 questions · A separate adventure";
  }
  function renderArt(target,done,{final=false}={}){
    const svg=$(target);svg.replaceChildren();
    svg.setAttribute("viewBox","0 0 "+totalWidth+" "+QUEST_ART.rows.length);
    const h=QUEST_ART.rows.length;
    for(let y=0;y<h;y++)for(let x=0;x<totalWidth;x++){
      const colour=QUEST_ART.colours[QUEST_ART.rows[y][x]];
      const show=final||y>=h-done;
      mk(doc,"rect",{x,y,width:1,height:1,
        fill:colour&&show?colour:"#e9e5df",
        stroke:colour&&show?"#ecf2f3":"#faf7f1",
        "stroke-width":0.05},svg);
    }
    svg.setAttribute("aria-label",final?
      "Completed prism picture with blue and turquoise pixel facets":
      done+" of 6 rows of a hidden pixel picture revealed");
  }
  function renderProgress(){
    $("questProgressText").textContent=progress.done+" of "+QUEST_TOTAL+" rows revealed";
    $("questProgressFill").style.width=(progress.done/QUEST_TOTAL*100)+"%";
    $("questArtCount").textContent=progress.done+" / "+QUEST_TOTAL;
    renderArt("questArt",progress.done);
    updateEntry();
  }
  function updateLine(){
    const svg=$("questLine"),y=58;
    svg.replaceChildren();
    // The highlighted rays reach the edges of the visible WINDOW, but remain
    // unbounded mathematically; arrowheads explicitly communicate infinity.
    mk(doc,"line",{x1:50,y1:y,x2:590,y2:y,stroke:"#8290a2","stroke-width":2},svg);
    for(let value=QUEST_AXIS.min;value<=QUEST_AXIS.max;value++){
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
    next.lower=clamp(next.lower,QUEST_AXIS.min,QUEST_AXIS.max-1);
    next.upper=clamp(next.upper,QUEST_AXIS.min+1,QUEST_AXIS.max);
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
    const xScale=x=>45+(x-QUEST_AXIS.min)*55;
    const axisY=116;
    const sampled=[];
    for(let i=0;i<=200;i++){
      const x=QUEST_AXIS.min+i*(QUEST_AXIS.max-QUEST_AXIS.min)/200;
      sampled.push({x,y:quadraticValue(q,x)});
    }
    const high=Math.max(1,...sampled.map(p=>Math.abs(p.y)));
    const yScale=y=>clamp(axisY-y*90/high,13,217);
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
  function question(){
    cancelTimer();
    if(progress.done>=QUEST_TOTAL){finish(false);return;}
    question=QUEST_QUESTIONS[progress.done];
    draft={region:"between",lower:0,upper:1,
      lowerIncluded:false,upperIncluded:false};
    locked=false;attempts=0;hintsShown=0;
    $("questQuestionStep").textContent="QUESTION "+(progress.done+1)+" OF "+QUEST_TOTAL;
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
    store();renderProgress();
    feedback("Correct! "+quadraticSolutionText(expected)+
      ". Another picture row is revealed.",true);
    $("questCheck").disabled=true;
    $("questCheck").textContent=progress.done===QUEST_TOTAL?
      "✓ Quest complete — revealing…":"✓ Correct — next quadratic…";
    for(const id of ["questBetween","questOutside","questLowerOpen","questLowerClosed",
      "questUpperOpen","questUpperClosed","questLowerMinus","questLowerPlus",
      "questUpperMinus","questUpperPlus","questLower","questUpper"]){
      $(id).disabled=true;
    }
    timer=setTimeout(()=>{
      timer=null;
      if(progress.done===QUEST_TOTAL){finish(true);}
      else{
        question();
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
    $("questPlaying").hidden=true;$("questFinished").hidden=false;
    renderArt("questFinishedArt",QUEST_TOTAL,{final:true});
    renderArt("questRevealArt",QUEST_TOTAL,{final:true});
    $("questFinalStats").textContent=progress.firstTry+"/"+QUEST_TOTAL+
      " questions correct first time without hints · "+progress.hints+" hints used";
    const list=$("questSolutions");list.replaceChildren();
    for(const q of QUEST_QUESTIONS){
      const li=doc.createElement("li");
      li.textContent=q.expression+"  →  "+quadraticSolutionText(quadraticAnswer(q))+
        "  ("+q.factor+")";
      list.append(li);
    }
  }
  function reveal(){
    const dialog=$("questReveal");
    if(!dialog.open)dialog.showModal();
  }
  function finish(withReveal){
    cancelTimer();renderFinishContent();renderProgress();
    if(withReveal)reveal();
  }
  function open(){
    cancelTimer();onShow();
    $("questPlaying").hidden=progress.done===QUEST_TOTAL;
    $("questFinished").hidden=progress.done!==QUEST_TOTAL;
    if(progress.done===QUEST_TOTAL)finish(false);
    else question();
    win.scrollTo?.({top:0,behavior:"instant"});
  }
  function closeReveal(){
    if($("questReveal").open)$("questReveal").close();
  }
  function back(){
    cancelTimer();closeReveal();onReturn();updateEntry();
  }
  function restart({confirmFirst=true}={}){
    if(confirmFirst&&!win.confirm?.(
      "Restart Quadratic Quest? Its bonus picture progress will reset; other pictures are safe."
    ))return;
    cancelTimer();closeReveal();
    progress={...fresh(),replay:progress.replay+1};store();
    $("questFinished").hidden=true;$("questPlaying").hidden=false;
    question();
    win.scrollTo?.({top:0,behavior:"instant"});
  }
  $("questEnter").addEventListener("click",open);
  $("questBack").addEventListener("click",back);
  $("questRestart").addEventListener("click",()=>restart());
  $("questFinishBack").addEventListener("click",back);
  $("questReplay").addEventListener("click",()=>restart({confirmFirst:false}));
  $("questRevealClose").addEventListener("click",closeReveal);
  $("questRevealAgain").addEventListener("click",reveal);
  $("questReveal").addEventListener("cancel",event=>{
    event.preventDefault?.();closeReveal();
  });
  $("questCheck").addEventListener("click",check);
  $("questHint").addEventListener("click",hint);
  $("questGraphToggle").addEventListener("click",graph);
  updateEntry();
  return {open,back,restart,updateEntry};
}
