import {
  COMPLEX_SAVE_KEY,COMPLEX_WORLD,COMPLEX_ANGLES,COMPLEX_STAGES,
  COMPLEX_PICTURES,complexPicture,complexTarget,complexTransform,
  complexLabel,complexAngleLabel,complexQuestion,complexHint,
  matchesComplexTarget,validateComplexQuest
} from "./complex-quest-model.mjs";
import {
  COMPLEX_SVG_SIZE,COMPLEX_SVG_PAD,COMPLEX_GRID,complexPx,complexPy,
  complexRayToWindow,complexSvgPath,complexGeometry
} from "./complex-quest-geometry.mjs";

const SVG_NS="http://www.w3.org/2000/svg";
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
const recordBlank=()=>({done:0,attempts:0,hints:0,replays:0});
export function readComplexQuestSave(storage){
  let old=null;
  try{old=JSON.parse(storage?.getItem(COMPLEX_SAVE_KEY)||"null");}catch{}
  const picture=complexPicture(old?.picture)?.id||COMPLEX_PICTURES[0].id;
  const records={};
  for(const p of COMPLEX_PICTURES){
    const r=old?.records?.[p.id];
    records[p.id]=r&&Number.isInteger(r.done)&&r.done>=0&&
      r.done<=p.pieces.length&&
      ["attempts","hints","replays"].every(key=>
        Number.isInteger(r[key])&&r[key]>=0&&r[key]<1000000)?
      {done:r.done,attempts:r.attempts,hints:r.hints,replays:r.replays}:
      recordBlank();
  }
  const allowed=new Set(COMPLEX_PICTURES.map(p=>p.id));
  const discoveries=new Set(Array.isArray(old?.discoveries)?
    old.discoveries.filter(id=>allowed.has(id)):[]);
  for(const p of COMPLEX_PICTURES)
    if(records[p.id].done===p.pieces.length)discoveries.add(p.id);
  return {picture,records,discoveries:[...discoveries]};
}
export function initComplexQuest({doc=document,storage=localStorage,win=window}={}){
  validateComplexQuest();
  const $=id=>doc.getElementById(id);
  let save=readComplexQuestSave(storage);
  const params=new URLSearchParams(win.location?.search||"");
  const requested=complexPicture(params.get("picture"))||
    COMPLEX_PICTURES.find(p=>p.step===Number(params.get("tier")));
  if(requested)save.picture=requested.id;
  let picture=complexPicture(save.picture),screen="picker",
    confirmed=false,hintIndex=0,changedAttempts=0;
  const graph=$("complexGraph"),reveal=$("complexReveal");
  function persist(){
    try{storage?.setItem(COMPLEX_SAVE_KEY,JSON.stringify(save));}catch{}
  }
  function record(){return save.records[picture.id];}
  function current(){return picture.pieces[record().done]||null;}
  function discovered(p){return save.discoveries.includes(p.id);}
  function el(tag,attrs={},parent){
    const node=doc.createElementNS(SVG_NS,tag);
    for(const [name,value] of Object.entries(attrs))
      if(value!==undefined&&value!==null)node.setAttribute(name,String(value));
    if(parent)parent.append(node);
    return node;
  }
  function label(parent,x,y,value,attrs={}){
    const item=el("text",{x,y,fill:"#81949b","font-size":14,
      "font-family":"inherit",...attrs},parent);
    item.textContent=value;return item;
  }
  function dot(parent,z,color="#dc8f7c",size=5){
    el("circle",{cx:complexPx(z.re),cy:complexPy(z.im),r:size,
      fill:color,stroke:"#fffdf6","stroke-width":2},parent);
  }
  function drawGrid(svg){
    const first=COMPLEX_SVG_PAD,last=COMPLEX_SVG_SIZE-COMPLEX_SVG_PAD;
    for(let n=COMPLEX_WORLD.min;n<=COMPLEX_WORLD.max;n++){
      const x=complexPx(n),y=complexPy(n),axis=n===0;
      el("line",{x1:x,y1:first,x2:x,y2:last,stroke:axis?"#648997":"#b6d1ca",
        "stroke-width":axis?2:1,"stroke-opacity":axis?.72:.4},svg);
      el("line",{x1:first,y1:y,x2:last,y2:y,stroke:axis?"#648997":"#b6d1ca",
        "stroke-width":axis?2:1,"stroke-opacity":axis?.72:.4},svg);
      if(n%2===0&&n!==0){
        label(svg,x,complexPy(0)+19,String(n).replace("-","−"),
          {"text-anchor":"middle","font-size":12});
        label(svg,complexPx(0)-10,y+4,String(n).replace("-","−"),
          {"text-anchor":"end","font-size":12});
      }
    }
    label(svg,last+6,complexPy(0)-9,"Re",{"font-size":18,fill:"#446b7c","font-weight":850});
    label(svg,complexPx(0)+11,first-13,"Im",{"font-size":18,fill:"#446b7c","font-weight":850});
    el("rect",{x:first,y:first,width:COMPLEX_GRID,height:COMPLEX_GRID,
      fill:"none",stroke:"#c2d7ce","stroke-width":1.8},svg);
  }
  function drawShape(layer,piece,candidate,{preview=false}={}){
    const geometry=complexGeometry(piece,candidate);
    const stroke=preview?"#bd796e":piece.color;
    const fill=preview?"#e59b81":piece.color;
    const dash=preview?"10 7":piece.strict?"8 7":"";
    const common={"pointer-events":"none"};
    if(geometry.kind==="point"){
      if(preview){
        el("circle",{cx:complexPx(geometry.at.re),cy:complexPy(geometry.at.im),
          r:13,fill:"#fffaf5",stroke:"#d98975","stroke-width":3,
          "stroke-dasharray":"5 4",...common},layer);
        el("line",{x1:complexPx(geometry.at.re)-17,y1:complexPy(geometry.at.im),
          x2:complexPx(geometry.at.re)+17,y2:complexPy(geometry.at.im),
          stroke:"#d98975","stroke-width":1.5,...common},layer);
      }else dot(layer,geometry.at,piece.color,6);
      return;
    }
    if(geometry.kind==="disc"){
      el("circle",{cx:complexPx(geometry.centre.re),cy:complexPy(geometry.centre.im),
        r:geometry.radius*COMPLEX_GRID/10,fill,
        "fill-opacity":preview?.18:.68,stroke,"stroke-width":preview?3:2.8,
        "stroke-dasharray":dash,...common},layer);
      if(!preview)dot(layer,geometry.centre,"#355a69",2.5);
      return;
    }
    const area=el("path",{d:complexSvgPath(geometry.points),
      fill,"fill-opacity":preview?.18:.72,stroke:"none",...common},layer);
    if(!area)return;
    // Only the rays (and for bounded sectors the true circular arc) are
    // mathematical boundaries. The viewport edge is NEVER a locus boundary.
    const centre=geometry.centre;
    const distance=geometry.kind==="bounded"?geometry.radius:null;
    const edgePoint=degree=>{
      if(distance===null)return complexRayToWindow(centre,degree);
      const radians=degree*Math.PI/180;
      return {re:centre.re+distance*Math.cos(radians),
        im:centre.im+distance*Math.sin(radians)};
    };
    for(const angle of [geometry.from,geometry.to]){
      const end=edgePoint(angle);
      el("line",{x1:complexPx(centre.re),y1:complexPy(centre.im),
        x2:complexPx(end.re),y2:complexPy(end.im),
        stroke,"stroke-width":preview?3.5:2.5,"stroke-dasharray":dash,
        ...common},layer);
    }
    if(geometry.kind==="bounded"){
      el("path",{d:complexSvgPath(geometry.points.slice(1),false),
        fill:"none",stroke,"stroke-width":preview?3.5:2.5,
        "stroke-dasharray":dash,...common},layer);
    }
    if(!preview)dot(layer,centre,"#355a69",2.5);
  }
  function drawCompleted(layer,count,p){
    const tasks=p.pieces;
    if(p.step===1){
      const plotted=tasks.slice(0,count).map(complexTarget);
      if(plotted.length>=2){
        if(count===tasks.length)
          el("path",{d:complexSvgPath(plotted),fill:"#e6bc74",
            "fill-opacity":.24,stroke:"#d4a056","stroke-width":5,
            "stroke-linejoin":"round","pointer-events":"none"},layer);
        else el("path",{d:complexSvgPath(plotted,false),fill:"none",
          stroke:"#d4a056","stroke-width":5,"stroke-linejoin":"round",
          "stroke-linecap":"round","pointer-events":"none"},layer);
      }
      for(const point of plotted)dot(layer,point,"#d9a24c",7);
    }else if(p.step===2){
      for(let i=0;i<count;i+=2){
        const one=complexTarget(tasks[i]);
        if(i+1<count){
          const two=complexTarget(tasks[i+1]);
          el("path",{d:complexSvgPath([{re:0,im:0},one,two]),
            fill:tasks[i].color,"fill-opacity":.82,stroke:"#fffdf5",
            "stroke-width":3,"stroke-linejoin":"round",
            "pointer-events":"none"},layer);
          dot(layer,two,tasks[i].color,5);
        }
        dot(layer,one,tasks[i].color,5);
      }
      if(count>0)dot(layer,{re:0,im:0},"#576d80",7);
    }else{
      for(let i=0;i<count;i++)drawShape(layer,tasks[i],complexTarget(tasks[i]));
    }
  }
  function candidate(){
    const reText=$("complexRe").value,imText=$("complexIm").value;
    const re=Number(reText),im=Number(imText);
    if(reText===""||imText===""||!Number.isInteger(re)||!Number.isInteger(im)||
      re<COMPLEX_WORLD.min||re>COMPLEX_WORLD.max||
      im<COMPLEX_WORLD.min||im>COMPLEX_WORLD.max)return null;
    const result={re,im},task=current();
    if(!task)return result;
    if(task.kind==="disc"||task.kind==="bounded"){
      result.radius=Number($("complexRadius").value);
      if(!Number.isInteger(result.radius)||result.radius<1||
        result.radius>4)return null;
    }
    if(task.kind==="sector"||task.kind==="bounded"){
      result.from=Number($("complexFrom").value);
      result.to=Number($("complexTo").value);
      if(!COMPLEX_ANGLES.includes(result.from)||
        !COMPLEX_ANGLES.includes(result.to)||result.from>=result.to)return null;
    }
    return result;
  }
  function renderCanvas(target="complexGraph",{final=false}={}){
    const svg=$(target);
    svg.replaceChildren();
    el("rect",{x:0,y:0,width:620,height:620,fill:final?"#fffefa":"#faf8f2"},svg);
    const clipId="complex-clip-"+target;
    const defs=el("defs",{},svg),clip=el("clipPath",{id:clipId},defs);
    el("rect",{x:COMPLEX_SVG_PAD,y:COMPLEX_SVG_PAD,
      width:COMPLEX_GRID,height:COMPLEX_GRID},clip);
    if(!final)drawGrid(svg);
    const paper=el("g",{"clip-path":"url(#"+clipId+")"},svg);
    drawCompleted(paper,final?picture.pieces.length:record().done,picture);
    if(!final&&current()&&!confirmed){
      const task=current();
      if(task.kind==="transform"){
        const seed=task.seed;
        dot(paper,seed,"#8c9bad",5);
        label(paper,complexPx(seed.re)+10,complexPy(seed.im)-9,"given z",
          {"font-size":12,fill:"#7c8a9c","font-weight":800});
      }
      const selected=candidate();
      if(selected)drawShape(paper,task,selected,{preview:true});
    }
    if(!final)svg.setAttribute("aria-label","Argand diagram with "+
      record().done+" completed mathematical pieces; tap to set a point or centre");
  }
  function renderPicker(){
    const levels=$("complexLevelList");levels.replaceChildren();
    for(const p of COMPLEX_PICTURES){
      const selected=p.id===picture.id,done=discovered(p),
        r=save.records[p.id];
      const button=doc.createElement("button");
      button.type="button";
      button.className="complex-level-card";
      button.setAttribute("aria-pressed",String(selected));
      button.setAttribute("aria-label",COMPLEX_STAGES[p.step-1].name+
        ": "+(done?"discovered":r.done?"in progress":"not started")+
        ", "+COMPLEX_STAGES[p.step-1].focus);
      const number=doc.createElement("span");number.className="complex-level-number";
      number.textContent=done?"✓":String(p.step);
      const body=doc.createElement("span");body.className="complex-level-description";
      const title=doc.createElement("strong");
      title.textContent=COMPLEX_STAGES[p.step-1].name;
      const focus=doc.createElement("small");
      focus.textContent=COMPLEX_STAGES[p.step-1].focus;
      const status=doc.createElement("em");
      status.textContent=done?"✦ Discovered":r.done?
        r.done+" of "+p.pieces.length+" pieces complete":
        p.pieces.length+" mathematical pieces";
      body.append(title,focus,status);
      const mark=doc.createElement("span");mark.className="complex-level-symbol";
      mark.textContent=selected?"●":"○";
      button.append(number,body,mark);
      button.addEventListener("click",()=>choosePicture(p.id));
      levels.append(button);
    }
    $("complexCount").innerHTML=save.discoveries.length+
      ' <small>/ 5</small>';
    $("complexMeter").style.width=(save.discoveries.length/5*100)+"%";
    $("complexSelectedName").textContent=discovered(picture)&&
      record().done===picture.pieces.length?picture.name:picture.clue;
    $("complexSelectedSummary").textContent=picture.stage+" · "+
      picture.pieces.length+" pieces · "+(record().done?
        record().done+" already completed · ":"")+picture.description;
    $("complexStart").textContent=record().done===picture.pieces.length?
      "View my artwork →":record().done?
      "Continue my picture →":"Start this mystery →";
  }
  function choosePicture(id){
    const selected=complexPicture(id);
    if(!selected)return;
    picture=selected;save.picture=selected.id;persist();
    renderPicker();
  }
  function showScreen(next){
    screen=next;
    $("complexPicker").hidden=next!=="picker";
    $("complexPlay").hidden=next!=="play";
    $("complexFinished").hidden=next!=="finished";
    if(next==="picker")renderPicker();
    if(next==="play"){
      renderTask();
    }
    if(next==="finished")renderFinished();
    win.scrollTo?.({top:0,behavior:"instant"});
  }
  function renderTask(){
    const task=current();
    if(!task)return;
    confirmed=false;hintIndex=0;changedAttempts=0;
    $("complexModeLabel").textContent=picture.stage.toUpperCase();
    $("complexPictureTitle").textContent=discovered(picture)?
      picture.name:picture.clue;
    $("complexPictureDescription").textContent=picture.description;
    $("complexPieceCount").textContent=(record().done+1)+" / "+picture.pieces.length;
    $("complexProgressFill").style.width=(record().done/picture.pieces.length*100)+"%";
    $("complexQuestionNumber").textContent="PIECE "+(record().done+1)+
      " OF "+picture.pieces.length;
    $("complexQuestionTitle").textContent=task.kind==="point"?
      "Plot the complex number":task.kind==="transform"?
      "Transform and plot":task.kind==="disc"?"Construct a modulus disc":
      task.kind==="sector"?"Shade an argument sector":"Intersect two loci";
    $("complexTaskTag").textContent={
      point:"PLOT",transform:"TRANSFORM",disc:"MODULUS",
      sector:"ARGUMENT",bounded:"INTERSECTION"
    }[task.kind];
    $("complexQuestion").textContent=complexQuestion(task);
    $("complexPrompt").textContent=task.kind==="point"?
      "Enter Re(z) and Im(z), or tap the matching point on the Argand diagram.":
      task.kind==="transform"?
        "Work out the transformed complex number, then plot its new position.":
      task.kind==="disc"?
        "Identify the centre and radius. Your shaded disc must match this locus.":
      task.kind==="sector"?
        "Find the translated vertex and both argument boundaries.":
        "Construct the shared region: centre, radius and both argument bounds.";
    $("complexReLabel").textContent=task.kind==="point"||
      task.kind==="transform"?"Real part":"Centre: real";
    $("complexImLabel").textContent=task.kind==="point"||
      task.kind==="transform"?"Imaginary part":"Centre: imaginary";
    $("complexRadiusGroup").hidden=
      task.kind!=="disc"&&task.kind!=="bounded";
    $("complexAnglesGroup").hidden=
      task.kind!=="sector"&&task.kind!=="bounded";
    $("complexRe").value="0";$("complexIm").value="0";
    $("complexRadius").value="1";
    $("complexFrom").value="0";$("complexTo").value="45";
    $("complexFeedback").textContent="";
    $("complexFeedback").className="complex-feedback";
    $("complexHintText").hidden=true;
    $("complexHintText").textContent="";
    $("complexHint").disabled=false;
    $("complexHint").textContent="✳ Give me a hint";
    $("complexCheck").hidden=false;
    $("complexNext").hidden=true;
    candidateChanged();
  }
  function candidateChanged(){
    if(screen!=="play"||!current()||confirmed)return;
    const draft=candidate(),task=current();
    $("complexCandidateText").textContent=!draft?
      "Choose valid integer coordinates and an increasing argument interval.":
      (task.kind==="point"||task.kind==="transform"?
        "Your proposal: "+complexLabel(draft):
        "Your centre: "+complexLabel(draft)+
          (task.kind==="disc"||task.kind==="bounded"?
            " · radius "+draft.radius:"")+
          (task.kind==="sector"||task.kind==="bounded"?
            " · "+complexAngleLabel(draft.from)+" to "+
              complexAngleLabel(draft.to):""));
    renderCanvas();
  }
  function setFeedback(message,type=""){
    $("complexFeedback").textContent=message;
    $("complexFeedback").className="complex-feedback"+
      (type?" is-"+type:"");
  }
  function check(){
    if(screen!=="play"||confirmed||!current())return;
    const task=current(),draft=candidate();
    if(!draft){
      setFeedback("Choose a valid point or centre and check that the first angle is smaller than the second.","incorrect");
      return;
    }
    changedAttempts++;
    record().attempts++;
    if(!matchesComplexTarget(task,draft)){
      const answer=complexTarget(task);
      if(draft.re!==answer.re||draft.im!==answer.im)
        setFeedback(task.kind==="transform"?
          "Not yet. Recheck the rotation or conjugation, then plot its new real and imaginary parts.":
          task.kind==="point"?
            "Not quite. Re(z) is the horizontal coordinate and Im(z) is the vertical coordinate.":
            "Not quite. Check the centre of the locus: which complex number is being subtracted from z?",
          "incorrect");
      else if("radius" in answer&&draft.radius!==answer.radius)
        setFeedback("The centre is correct. Now check the radius in the modulus condition.","incorrect");
      else setFeedback("The centre is correct. Recheck the two argument bounds measured anticlockwise.","incorrect");
      persist();return;
    }
    confirmed=true;
    record().done++;
    if(record().done===picture.pieces.length&&!discovered(picture))
      save.discoveries.push(picture.id);
    persist();
    $("complexCheck").hidden=true;
    $("complexHint").disabled=true;
    $("complexNext").hidden=record().done===picture.pieces.length;
    setFeedback("Correct! Your exact mathematical "+
      (task.kind==="point"||task.kind==="transform"?"point":
        task.kind==="disc"?"modulus region":
        task.kind==="sector"?"argument sector":"intersection")+
      " has become part of the artwork. ✦","correct");
    $("complexProgressFill").style.width=
      (record().done/picture.pieces.length*100)+"%";
    $("complexPieceCount").textContent=record().done+" / "+picture.pieces.length;
    renderCanvas();
    if(record().done===picture.pieces.length){
      showScreen("finished");openReveal();
    }
  }
  function hint(){
    if(screen!=="play"||confirmed||hintIndex>=2)return;
    $("complexHintText").hidden=false;
    $("complexHintText").textContent=complexHint(current(),hintIndex);
    hintIndex++;
    record().hints++;
    $("complexHint").textContent=hintIndex===2?
      "Both hints shown":"✳ Another hint";
    $("complexHint").disabled=hintIndex===2;
    persist();
  }
  function start(){
    if(record().done===picture.pieces.length){
      showScreen("finished");return;
    }
    showScreen("play");
  }
  function nextPiece(){
    if(screen==="play"&&confirmed&&current())showScreen("play");
  }
  function renderFinished(){
    $("complexFinishedTitle").textContent=picture.name+" ✦";
    $("complexFinishedDescription").textContent=picture.description;
    $("complexFinishedStats").textContent=picture.pieces.length+
      " mathematical pieces · "+record().attempts+" checks · "+
      record().hints+" hints used";
    renderCanvas("complexFinishedArt",{final:true});
    $("complexRevealTitle").textContent=picture.name+" ✦";
    $("complexRevealDescription").textContent="You used "+
      COMPLEX_STAGES[picture.step-1].focus.toLowerCase()+
      " to create every part of this artwork.";
    renderCanvas("complexRevealArt",{final:true});
    $("complexFinishedNext").textContent=picture.step===5?
      "Choose another challenge →":"Next difficulty →";
  }
  function openReveal(){
    renderCanvas("complexRevealArt",{final:true});
    if(!reveal.open){
      if(typeof reveal.showModal==="function")reveal.showModal();
      else reveal.setAttribute("open","");
    }
  }
  function closeReveal(){
    if(!reveal.open)return;
    if(typeof reveal.close==="function")reveal.close();
    else reveal.removeAttribute("open");
  }
  function restart(){
    if(typeof win.confirm==="function"&&!win.confirm(
      "Replay "+picture.name+"? Its current progress will reset. Your discovery will remain saved."))return;
    closeReveal();
    save.records[picture.id]={...recordBlank(),replays:record().replays+1};
    persist();showScreen("play");
  }
  function nextStage(){
    closeReveal();
    const next=COMPLEX_PICTURES[picture.step];
    if(next)choosePicture(next.id);
    showScreen("picker");
  }
  function gridPoint(ev){
    const rect=graph.getBoundingClientRect();
    if(!rect.width||!rect.height)return null;
    const x=(ev.clientX-rect.left)/rect.width*COMPLEX_SVG_SIZE;
    const y=(ev.clientY-rect.top)/rect.height*COMPLEX_SVG_SIZE;
    const re=COMPLEX_WORLD.min+(x-COMPLEX_SVG_PAD)/
      COMPLEX_GRID*(COMPLEX_WORLD.max-COMPLEX_WORLD.min);
    const im=COMPLEX_WORLD.max-(y-COMPLEX_SVG_PAD)/
      COMPLEX_GRID*(COMPLEX_WORLD.max-COMPLEX_WORLD.min);
    if(re<COMPLEX_WORLD.min-.5||re>COMPLEX_WORLD.max+.5||
      im<COMPLEX_WORLD.min-.5||im>COMPLEX_WORLD.max+.5)return null;
    return {re:clamp(Math.round(re),COMPLEX_WORLD.min,COMPLEX_WORLD.max),
      im:clamp(Math.round(im),COMPLEX_WORLD.min,COMPLEX_WORLD.max)};
  }
  graph.addEventListener("click",ev=>{
    if(screen!=="play"||confirmed||!current())return;
    const p=gridPoint(ev);if(!p)return;
    $("complexRe").value=String(p.re);$("complexIm").value=String(p.im);
    candidateChanged();
  });
  graph.addEventListener("keydown",ev=>{
    if(screen!=="play"||confirmed||!current())return;
    const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],
      ArrowUp:[0,1],ArrowDown:[0,-1]}[ev.key];
    if(delta){
      ev.preventDefault?.();
      const re=Number($("complexRe").value)||0,im=Number($("complexIm").value)||0;
      $("complexRe").value=String(clamp(re+delta[0],-5,5));
      $("complexIm").value=String(clamp(im+delta[1],-5,5));
      candidateChanged();
    }else if(ev.key==="Enter"||ev.key===" "){
      ev.preventDefault?.();check();
    }
  });
  for(const id of ["complexRe","complexIm","complexRadius","complexFrom","complexTo"]){
    $(id).addEventListener("input",candidateChanged);
    $(id).addEventListener("change",candidateChanged);
  }
  for(const angle of COMPLEX_ANGLES){
    for(const id of ["complexFrom","complexTo"]){
      const option=doc.createElement("option");
      option.value=String(angle);
      option.textContent=complexAngleLabel(angle);
      $(id).append(option);
    }
  }
  $("complexStart").addEventListener("click",start);
  $("complexBack").addEventListener("click",()=>showScreen("picker"));
  $("complexCheck").addEventListener("click",check);
  $("complexHint").addEventListener("click",hint);
  $("complexNext").addEventListener("click",nextPiece);
  $("complexFinishedBack").addEventListener("click",()=>{
    closeReveal();showScreen("picker");
  });
  $("complexReplay").addEventListener("click",restart);
  $("complexFinishedNext").addEventListener("click",nextStage);
  $("complexRevealAgain").addEventListener("click",openReveal);
  $("complexRevealClose").addEventListener("click",closeReveal);
  reveal.addEventListener("cancel",ev=>{ev.preventDefault?.();closeReveal();});
  persist();showScreen("picker");
  return {readProgress:()=>readComplexQuestSave(storage),choose:choosePicture,
    start,check,hint,render:()=>showScreen(screen)};
}
if(typeof document!=="undefined"&&document.getElementById("complexPicker"))
  initComplexQuest();