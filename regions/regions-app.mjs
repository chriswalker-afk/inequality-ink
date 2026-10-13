import {
  REGION_WORLD,intersectRegion,lineOnRegionGraph,regionSide,regionSideOptions,
  regionBoundaryStyle,regionCorrect,regionHint,pointSatisfiesAll
} from "./regions-engine.mjs";
import {
  GRAPH_ART_PICTURES,GRAPH_ART_MODES,GRAPH_ART_SAVE_KEY,GRAPH_ART_LEGACY_SAVE_KEY,
  graphPicture,graphCellAt,graphArrow,validateGraphPictureLibrary
} from "./graph-art-pictures.mjs";

const NS="http://www.w3.org/2000/svg",SIZE=620,PAD=52,GRID=SIZE-2*PAD;
const px=x=>PAD+(x-REGION_WORLD.xmin)*GRID/(REGION_WORLD.xmax-REGION_WORLD.xmin);
const py=y=>PAD+(REGION_WORLD.ymax-y)*GRID/(REGION_WORLD.ymax-REGION_WORLD.ymin);
const path=points=>points.map((p,i)=>(i?"L":"M")+px(p.x).toFixed(2)+" "+py(p.y).toFixed(2)).join(" ")+" Z";
const blank=()=>({done:0,line:0,replays:0});
const key=(mode,id)=>mode+":"+id;
const clean=()=>({mode:"fill",picture:"little-house",records:{}});
const number=n=>Number.isInteger(n)&&n>=0&&n<=10000;
const validRecord=(r,p)=>r&&number(r.done)&&r.done<=p.pieces.length&&number(r.line)&&
  // A refresh during the final green pulse used to save the completed last
  // boundary before advancing to the next piece. Preserve that success.
  (r.done===p.pieces.length?r.line===0:r.line<=p.pieces[r.done].rules.length)&&
  number(r.replays);
export function readGraphArtSave(storage){
  let raw;
  try{raw=JSON.parse(storage.getItem(GRAPH_ART_SAVE_KEY));}catch{return clean();}
  if(!raw||typeof raw!=="object")return clean();
  const output=clean();
  if(GRAPH_ART_MODES.some(m=>m.id===raw.mode))output.mode=raw.mode;
  if(graphPicture(raw.picture))output.picture=raw.picture;
  for(const mode of GRAPH_ART_MODES)for(const p of GRAPH_ART_PICTURES){
    const id=key(mode.id,p.id),record=raw.records?.[id];
    if(validRecord(record,p)){
      const finishedBoundary=mode.id==="build"&&record.done<p.pieces.length&&
        record.line===p.pieces[record.done].rules.length;
      output.records[id]={
        done:record.done+(finishedBoundary?1:0),
        line:mode.id==="build"&&!finishedBoundary?record.line:0,
        replays:record.replays
      };
    }
  }
  return output;
}
function el(doc,tag,attrs={},parent){
  const node=doc.createElementNS(NS,tag);
  for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));
  if(parent)parent.append(node);
  return node;
}
function polygon(svg,doc,points,attrs={}){
  if(!points.length)return null;
  return el(doc,"path",{d:path(points),...attrs},svg);
}
function textSvg(doc,svg,x,y,content,attrs={}){
  const t=el(doc,"text",{x,y,...attrs},svg);t.textContent=content;return t;
}
function baseGraph(svg,doc,{grid=true}={}){
  svg.replaceChildren();
  el(doc,"rect",{x:PAD,y:PAD,width:GRID,height:GRID,rx:9,
    fill:"#fffcf8",stroke:"#d8dfd9","stroke-width":2},svg);
  if(!grid)return;
  for(let n=-5;n<=5;n++){
    el(doc,"line",{x1:px(n),y1:PAD,x2:px(n),y2:SIZE-PAD,stroke:"#7692a0",
      "stroke-opacity":n===0?.48:.15,"stroke-width":n===0?2:1},svg);
    el(doc,"line",{x1:PAD,y1:py(n),x2:SIZE-PAD,y2:py(n),stroke:"#7692a0",
      "stroke-opacity":n===0?.48:.15,"stroke-width":n===0?2:1},svg);
    if(n!==0&&n%2===0){
      textSvg(doc,svg,px(n),py(0)+18,String(n).replace("-","−"),{
        "font-size":13,"text-anchor":"middle",fill:"#8596a2"});
      textSvg(doc,svg,px(0)-12,py(n)+5,String(n).replace("-","−"),{
        "font-size":13,"text-anchor":"end",fill:"#8596a2"});
    }
  }
  textSvg(doc,svg,px(5)-8,py(0)-10,"x",{"font-size":17,fill:"#546f80"});
  textSvg(doc,svg,px(0)+11,py(5)+22,"y",{"font-size":17,fill:"#546f80"});
}
function boundary(doc,svg,r,attrs={}){
  const points=lineOnRegionGraph(r);if(!points)return null;
  return el(doc,"line",{x1:px(points[0].x),y1:py(points[0].y),
    x2:px(points[1].x),y2:py(points[1].y),stroke:"#607d94",
    "stroke-width":2.2,"stroke-dasharray":r.inclusive?"":"8 7",
    "pointer-events":"none",...attrs},svg);
}
// A shaft plus a REAL triangular polygon, rather than an external SVG marker.
// This remains a visible arrowhead in Chromium, Firefox, Safari and exported SVG.
function directionArrow(doc,svg,ruleDef,region,{enter=false,agree=false}={}){
  const a=graphArrow(ruleDef,region);
  if(!a)return null;
  const x1=px(a.x1),y1=py(a.y1),x2=px(a.x2),y2=py(a.y2);
  const len=Math.hypot(x2-x1,y2-y1);
  if(len<1)return null;
  const ux=(x2-x1)/len,uy=(y2-y1)/len;
  const headLength=12,headHalfWidth=7.5;
  const baseX=x2-ux*headLength,baseY=y2-uy*headLength;
  const points=[
    [x2,y2],
    [baseX-uy*headHalfWidth,baseY+ux*headHalfWidth],
    [baseX+uy*headHalfWidth,baseY-ux*headHalfWidth]
  ];
  const group=el(doc,"g",{
    "data-direction-arrow":ruleDef.id,
    "data-arrow-tip-x":x2.toFixed(2),
    "data-arrow-tip-y":y2.toFixed(2),
    "class":agree?"graph-arrow-converge":enter?"graph-arrow-enter":"",
    "style":"--graph-enter-x:"+(-ux*14).toFixed(1)+
      "px;--graph-enter-y:"+(-uy*14).toFixed(1)+"px",
    "aria-hidden":"true","pointer-events":"none"
  },svg);
  el(doc,"line",{x1,y1,x2:x2-ux*5,y2:y2-uy*5,stroke:"#187f67",
    "stroke-width":4,"stroke-linecap":"round"},group);
  el(doc,"polygon",{points:points.map(([x,y])=>x.toFixed(2)+
    ","+y.toFixed(2)).join(" "),fill:"#147d64",stroke:"#fffef8",
    "stroke-width":1.25,"stroke-linejoin":"round"},group);
  return group;
}
function decorations(doc,svg,p){
  if(p.details==="house"){
    const rectangle=(x1,y1,x2,y2,fill,attrs={})=>
      el(doc,"rect",{x:px(x1),y:py(y2),width:px(x2)-px(x1),
        height:py(y1)-py(y2),rx:3,fill,...attrs},svg);
    for(const x of [-1.72,1.03]){
      rectangle(x,-.65,x+.7,.1,"#b9dfe5",{stroke:"#f8f6eb","stroke-width":3});
      el(doc,"line",{x1:px(x+.35),y1:py(-.65),x2:px(x+.35),y2:py(.1),
        stroke:"#e3f8f4","stroke-width":2},svg);
    }
    el(doc,"circle",{cx:px(.47),cy:py(-2.13),r:4,fill:"#f7e7a5"},svg);
    textSvg(doc,svg,px(3.4),py(3.4),"✦",{"text-anchor":"middle",
      "font-size":32,fill:"#e6af6c"},svg);
  }else{
    for(const [x,y] of [[-3.9,4.1],[3.8,3.7],[-3.4,-4.2]]){
      textSvg(doc,svg,px(x),py(y),"✧",{"font-size":25,"text-anchor":"middle",
        fill:"#d6a77d"});
    }
    el(doc,"circle",{cx:px(0),cy:py(0),r:9,fill:"#f5e3be","fill-opacity":.65},svg);
  }
}
export function initRegionsApp({doc=document,storage=localStorage,win=window}={}){
  validateGraphPictureLibrary();
  const $=id=>doc.getElementById(id);
  const graph=$("graphArtGraph"),reveal=$("graphReveal"),revealSvg=$("graphRevealSvg");
  let saved=readGraphArtSave(storage),screen="picker",choiceSide=null,
    choiceStyle=null,selected=null,flash=null,message="",status="",hint="",
    revealTimers=[],cursor={x:0,y:0},activeReveal=false,
    pendingPieceTimer=null,lastAddedArrow=null;
  function persist(){try{storage.setItem(GRAPH_ART_SAVE_KEY,JSON.stringify(saved));}catch{}}
  function picture(){return graphPicture(saved.picture);}
  function mode(){return saved.mode;}
  function record(){
    const k=key(mode(),saved.picture);
    if(!saved.records[k])saved.records[k]=blank();
    return saved.records[k];
  }
  function current(){return picture().pieces[record().done]||null;}
  function rule(){return current()?.rules[record().line]||null;}
  function notify(s,type=""){message=s;status=type;}
  function resetChoices(){
    choiceSide=null;choiceStyle=null;selected=null;hint="";
    lastAddedArrow=null;
  }
  function setScreen(next){
    screen=next;
    $("graphPicker").hidden=next!=="picker";
    $("graphPlay").hidden=next!=="play";
    $("graphSummary").hidden=next!=="summary";
    $("how-graph-art-works").hidden=next==="play";
    if(next==="picker")pickerView();
    if(next==="play")playView();
    if(next==="summary")summaryView();
  }
  function miniature(svg,p){
    baseGraph(svg,doc,{grid:false});
    p.pieces.forEach(f=>polygon(svg,doc,intersectRegion(f.rules),{
      fill:f.color,stroke:"#fff9ee","stroke-width":3}));
    decorations(doc,svg,p);
  }
  function pickerView(){
    for(const m of GRAPH_ART_MODES){
      const b=$(m.id==="fill"?"graphModeFill":"graphModeBuild");
      b.setAttribute("aria-pressed",String(mode()===m.id));
    }
    $("graphModeDescription").textContent=mode()==="fill"?
      "Choose the regions shared by each set of inequalities.":
      "Build every boundary and reveal its common region.";
    const cards=$("graphPictureCards");cards.replaceChildren();
    for(const p of GRAPH_ART_PICTURES){
      const r=saved.records[key(mode(),p.id)]||blank();
      const card=doc.createElement("button");card.type="button";
      card.className="graph-picture-card";card.setAttribute("aria-label",
        p.clue+", "+p.stage+", "+p.pieces.length+" mathematical pieces");
      const svg=doc.createElementNS(NS,"svg");
      svg.setAttribute("viewBox","0 0 620 620");
      svg.setAttribute("aria-hidden","true");
      miniature(svg,p);
      const info=doc.createElement("span");
      const stage=doc.createElement("span");stage.className="graph-stage";
      stage.textContent=p.stage+" · "+p.pieces.length+" pieces";
      const name=doc.createElement("strong");
      name.textContent=r.done===p.pieces.length?p.name:p.clue;
      const desc=doc.createElement("small");desc.textContent=p.description;
      const go=doc.createElement("span");go.className="graph-card-go";
      go.textContent=r.done===p.pieces.length?"✓ Completed · Play again":
        r.done?"Continue picture · "+r.done+"/"+p.pieces.length+" pieces":
          "Start picture →";
      info.append(stage,name,desc,go);card.append(svg,info);
      card.addEventListener("click",()=>{
        saved.picture=p.id;
        if(r.done===p.pieces.length)saved.records[key(mode(),p.id)]={
          done:0,line:0,replays:r.replays+1};
        persist();resetChoices();notify("Find the common region.");
        setScreen("play");
      });
      cards.append(card);
    }
  }
  function draw(){
    baseGraph(graph,doc);
    const p=picture(),r=record(),part=current();
    for(let i=0;i<r.done;i++){
      const f=p.pieces[i];
      polygon(graph,doc,intersectRegion(f.rules),{fill:f.color,
        stroke:"#fff9ec","stroke-width":3,
        "data-region-layer":"finished-"+f.id});
    }
    if(!part)return;
    const points=intersectRegion(part.rules);
    // Each correctly interpreted inequality reduces the candidate solution.
    // This translucent INTERSECTION is computed from those rules, never from art.
    if(mode()==="build"&&r.line>0){
      const candidate=intersectRegion(part.rules.slice(0,r.line));
      polygon(graph,doc,candidate,{fill:"#72c5ac","fill-opacity":.11,
        stroke:"#39a186","stroke-width":1.5,"stroke-opacity":.64,
        "stroke-dasharray":"6 6","data-region-layer":"running-intersection",
        "pointer-events":"none"});
    }
    for(const rr of part.rules){
      boundary(doc,graph,rr,{stroke:mode()==="fill"?"#5b7890":"#a5b7bf",
        "stroke-width":mode()==="fill"?2.6:1.65,
        "stroke-opacity":mode()==="fill"?.91:.53});
    }
    if(mode()==="fill"){
      if(selected){
        const candidate=polygon(graph,doc,selected.polygon,{
          fill:part.color,"fill-opacity":.52,stroke:part.color,
          "stroke-width":2,"data-region-layer":"selection"});
        if(candidate)candidate.classList?.add("graph-good-flash");
      }
      if(flash){
        const wrong=polygon(graph,doc,flash.polygon,{fill:"#e65d65",
          "fill-opacity":.55,stroke:"#ca343e","stroke-width":3,
          "data-region-layer":"wrong"});
        if(wrong)wrong.classList?.add("graph-wrong-flash");
      }
      // Always make keyboard position discoverable.
      el(doc,"circle",{cx:px(cursor.x),cy:py(cursor.y),r:7,
        fill:"none",stroke:"#408c7c","stroke-width":2,
        "stroke-dasharray":"3 2","pointer-events":"none"},graph);
    }else{
      for(let i=0;i<r.line;i++){
        const rr=part.rules[i];
        boundary(doc,graph,rr,{stroke:"#3b8175","stroke-width":3.2,
          "stroke-opacity":1});
        directionArrow(doc,graph,rr,points,{
          enter:r.line<part.rules.length&&lastAddedArrow===rr.id,
          agree:r.line===part.rules.length
        });
      }
      if(rule())boundary(doc,graph,rule(),{stroke:"#304f78",
        "stroke-width":4,"stroke-opacity":1});
    }
    lastAddedArrow=null;
    graph.setAttribute("aria-label",mode()==="fill"?
      "Coordinate graph. "+r.done+" completed pieces. Move with arrow keys and press Enter to fill the region under the keyboard cursor.":
      "Coordinate graph. "+r.line+" of "+part.rules.length+" boundaries correctly added to this piece.");
  }
  function playView(){
    const p=picture(),r=record(),part=current();
    if(!part){setScreen("summary");return;}
    $("graphGameMode").textContent=mode()==="fill"?"FIND & FILL":"BUILD & SHADE";
    $("graphPictureName").textContent=p.name;
    $("graphPieceCount").textContent="Piece "+(r.done+1)+" of "+p.pieces.length;
    $("graphCanvasCount").textContent=r.done+" / "+p.pieces.length;
    $("graphProgressFill").style.width=(100*r.done/p.pieces.length)+"%";
    $("graphProgress").setAttribute("aria-valuenow",String(Math.round(100*r.done/p.pieces.length)));
    $("graphTaskKicker").textContent="PIECE "+(r.done+1)+" OF "+p.pieces.length;
    $("graphTaskTitle").textContent=part.name;
    $("graphPieceSwatch").style.background=part.color;
    $("graphCanvasHeading").textContent=mode()==="fill"?"Find the overlap":"Build the region";
    $("graphTaskLead").textContent=mode()==="fill"?
      "All these inequalities must be true together. Fill their common region.":
      "For each inequality, choose the correct side and boundary style. All the arrows will point into the common region.";
    $("graphCanvasInstruction").textContent=mode()==="fill"?
      "Tap the correct region, then press Check. Keyboard: arrows + Enter.":
      r.line===part.rules.length?
        "The glowing region is the overlap: ALL the inequalities are true here.":
        r.line>0?"The faint teal area is the overlap of your "+r.line+
          " completed "+(r.line===1?"inequality":"inequalities")+".": 
          "Each arrow points towards the half-plane satisfying that inequality.";
    $("graphRuleCount").textContent=part.rules.length+" inequalities";
    $("graphFillControls").hidden=mode()!=="fill";
    $("graphBuildControls").hidden=mode()!=="build";
    const holder=$("graphRuleList");holder.replaceChildren();
    part.rules.forEach((rr,i)=>{
      const item=doc.createElement(mode()==="build"?"button":"div");
      item.className="graph-rule-item"+(mode()==="build"&&i===r.line?" selected":"")+
        (mode()==="build"&&i<r.line?" done":"");
      const eq=doc.createElement("span");eq.textContent=rr.text;
      const state=doc.createElement("span");state.className="rule-state";
      state.textContent=mode()==="fill"?"AND":i<r.line?"✓ Added":i===r.line?"● Now":"○ Next";
      item.append(eq,state);
      if(mode()==="build"){
        item.type="button";item.disabled=i!==r.line||pendingPieceTimer!==null;
        item.addEventListener("click",()=>{notify("Choose a side and a line style.");playView();});
      }
      holder.append(item);
    });
    if(mode()==="build"){
      const rr=rule();
      $("graphActiveEquation").textContent=rr?.text||"All boundaries added ✓";
      const sides=rr?regionSideOptions(rr):["above","below"];
      for(const [i,id] of ["graphSideA","graphSideB"].entries()){
        const b=$(id),value=sides[i];
        b.textContent=value[0].toUpperCase()+value.slice(1);
        b.dataset.side=value;
        b.disabled=pendingPieceTimer!==null||!rr;
        b.setAttribute("aria-pressed",String(choiceSide===value));
      }
      for(const [id,style] of [["graphSolid","solid"],["graphDashed","dashed"]]){
        $(id).disabled=pendingPieceTimer!==null||!rr;
        $(id).setAttribute("aria-pressed",String(choiceStyle===style));
      }
      $("graphAddLine").disabled=pendingPieceTimer!==null||!rr;
      $("graphHint").disabled=pendingPieceTimer!==null;
      $("graphOverlapText").textContent=r.line===part.rules.length?
        "All "+part.rules.length+" arrows point to the same overlap. This is the region satisfying EVERY inequality.":
        r.line===0?
          "Each arrow shows one inequality's valid half-plane. Only their shared overlap will be shaded.":
          r.line+" of "+part.rules.length+" lines added. The faint teal area satisfies the "+r.line+
            " inequalities so far; the next one will narrow it.";
    }
    $("graphFeedback").textContent=message||
      (mode()==="fill"?"Tap the region where all inequalities are true.":
        "Choose a side and a line style for the highlighted inequality.");
    $("graphFeedback").className="graph-feedback"+(status?" "+status:"");
    $("graphHintText").textContent=hint;
    $("graphHintText").hidden=!hint;
    draw();
  }
  function pickAt(x,y){
    if(screen!=="play"||mode()!=="fill")return;
    const candidate=graphCellAt(current(),x,y);
    if(!candidate){
      notify("Tap a little farther from a boundary. Try the centre of a region.");
      playView();return;
    }
    if(!candidate.correct){
      flash=candidate;selected=null;
      notify("Not quite. That region fails at least one of the inequalities. Try another.","error");
      playView();
      if(flashTimer)win.clearTimeout?.(flashTimer);
      flashTimer=win.setTimeout?.(()=>{flash=null;if(screen==="play")playView();},950);
      return;
    }
    flash=null;
    selected=selected?"":candidate;
    notify(selected?"Region filled. Press Check when you are ready.":
      "Fill removed. Choose a region again.");
    playView();
  }
  let flashTimer=null;
  function checkFill(){
    if(screen!=="play"||mode()!=="fill")return;
    if(!selected){notify("First fill the region satisfying all the inequalities.","error");playView();return;}
    if(!selected.correct){notify("Check which inequalities are true.","error");playView();return;}
    finishPiece();
  }
  function addLine(){
    if(screen!=="play"||mode()!=="build"||pendingPieceTimer!==null)return;
    const rr=rule();if(!rr)return;
    if(!choiceSide||!choiceStyle){
      notify("Choose both the direction and whether the line is solid or dashed.","error");
      playView();return;
    }
    if(!regionCorrect(rr,choiceSide,choiceStyle)){
      notify(choiceSide!==regionSide(rr)?
        "Not quite. Try substituting a point on the side you selected.":
        rr.inclusive?"Equality is included: use a solid boundary.":
          "Strict inequalities need a dashed boundary.","error");
      playView();return;
    }
    record().line++;
    persist();
    lastAddedArrow=rr.id;
    choiceSide=null;choiceStyle=null;
    if(record().line===current().rules.length){
      notify("Every inequality is satisfied in the common overlap. Watch the arrows meet!","success");
      draw();
      const shape=polygon(graph,doc,intersectRegion(current().rules),{
        fill:"#48b98c","fill-opacity":.35,
        stroke:"#20976f","stroke-width":4,
        "data-region-layer":"intersection-celebration",
        "pointer-events":"none"});
      shape?.classList?.add("graph-common-pulse");
      lockDuringIntersection();
      const delay=win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches?
        140:1600;
      const id=win.setTimeout?.(()=>{
        // A stale animation must never advance a different piece.
        if(pendingPieceTimer!==id)return;
        pendingPieceTimer=null;
        finishPiece();
      },delay);
      pendingPieceTimer=id??null;
      if(id==null)finishPiece();
    }else{
      notify("Correct! The new arrow shows one more valid half-plane.","success");
      playView();
    }
  }
  function lockDuringIntersection(){
    $("graphFeedback").textContent=message;
    $("graphFeedback").className="graph-feedback success";
    $("graphAddLine").disabled=true;
    $("graphHint").disabled=true;
    $("graphActiveEquation").textContent="All boundaries added ✓";
    $("graphOverlapText").textContent="All "+current().rules.length+
      " arrows agree only in the glowing region. This is where ALL inequalities are true.";
    $("graphCanvasInstruction").textContent=
      "The glowing region is the overlap: ALL the inequalities are true here.";
    for(const id of ["graphSideA","graphSideB","graphSolid","graphDashed"])
      $(id).disabled=true;
    for(const row of $("graphRuleList").children){
      row.disabled=true;
      row.classList?.remove("selected");
      row.classList?.add("done");
      if(row.children[1])row.children[1].textContent="✓ Added";
    }
    $("graphRuleList").setAttribute("aria-label","All boundaries correctly added");
  }
  function finishPiece({navigate=true}={}){
    if(pendingPieceTimer!==null){
      win.clearTimeout?.(pendingPieceTimer);pendingPieceTimer=null;
    }
    const r=record();
    if(r.done>=picture().pieces.length)return;
    r.done++;r.line=0;
    persist();resetChoices();flash=null;cursor={x:0,y:0};
    // Students can leave during the success animation without losing the piece.
    if(!navigate)return;
    if(r.done===picture().pieces.length){
      setScreen("summary");
      openReveal();
    }else{
      notify("Beautiful! That mathematical shape is now part of your picture.","success");
      playView();
    }
  }
  function summaryView(){
    const p=picture();
    $("graphSummaryTitle").textContent=p.name+" ✦";
    $("graphSummaryText").textContent="You created every piece from the common solutions of simultaneous inequalities.";
    $("graphSummaryStats").textContent=p.pieces.length+" real regions · "+
      p.pieces.reduce((n,f)=>n+f.rules.length,0)+" inequalities · "+
      GRAPH_ART_MODES.find(m=>m.id===mode()).name;
  }
  function restart(){
    const r=record();
    saved.records[key(mode(),saved.picture)]={done:0,line:0,replays:r.replays+1};
    persist();resetChoices();notify("Start your picture again.");setScreen("play");
  }
  function stopReveal(){for(const id of revealTimers)win.clearTimeout?.(id);revealTimers=[];}
  function later(fn,ms){const id=win.setTimeout?.(fn,ms);if(id!=null)revealTimers.push(id);}
  function revealStage(count,finish=false){
    const p=picture();baseGraph(revealSvg,doc,{grid:false});
    for(let i=0;i<count;i++){
      const f=p.pieces[i];
      polygon(revealSvg,doc,intersectRegion(f.rules),{
        fill:f.color,stroke:"#fff9ec","stroke-width":3.5});
    }
    if(finish)decorations(doc,revealSvg,p);
    $("graphRevealStatus").textContent=finish?
      "Your "+p.name+" is complete! Every painted shape came from inequalities.":
      count+" of "+p.pieces.length+" mathematical regions revealed";
    $("graphRevealTitle").textContent=finish?p.name+" ✦":"Your picture is coming to life!";
    $("graphRevealSkip").hidden=finish;
    $("graphRevealAgain").hidden=!finish;
    $("graphDownload").hidden=!finish;
  }
  function showFinished(){stopReveal();revealStage(picture().pieces.length,true);}
  function playReveal(){
    stopReveal();revealStage(0);
    const p=picture();
    if(win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches){
      showFinished();return;
    }
    p.pieces.forEach((_,i)=>later(()=>revealStage(i+1),570*(i+1)));
    later(()=>showFinished(),570*(p.pieces.length+1));
  }
  function openReveal(){
    activeReveal=true;
    if(reveal.showModal)reveal.showModal();
    else reveal.setAttribute("open","");
    playReveal();
  }
  function closeReveal(){
    stopReveal();activeReveal=false;
    if(reveal.close)reveal.close();
    else reveal.removeAttribute?.("open");
    setScreen("summary");
  }
  function savePNG(){
    const serializer=new XMLSerializer();
    const xml=serializer.serializeToString(revealSvg);
    const canvas=doc.createElement("canvas");canvas.width=1100;canvas.height=1100;
    const context=canvas.getContext?.("2d");
    if(!context){notify("PNG export is unavailable in this browser.");return;}
    const blob=new Blob([xml],{type:"image/svg+xml;charset=utf-8"});
    const url=URL.createObjectURL(blob),image=new Image();
    image.onload=()=>{
      context.fillStyle="#fffaf0";context.fillRect(0,0,1100,1100);
      context.drawImage(image,0,0,1100,1100);
      URL.revokeObjectURL(url);
      const a=doc.createElement("a");a.download="inequality-ink-"+picture().id+".png";
      a.href=canvas.toDataURL("image/png");a.click();
    };
    image.onerror=()=>URL.revokeObjectURL(url);
    image.src=url;
  }
  function showHint(){
    if(screen!=="play"||pendingPieceTimer!==null)return;
    const part=current(),rr=mode()==="build"?rule():part.rules[0];
    hint=mode()==="build"?regionHint(rr):
      "Try a point in a candidate region. Check it against every inequality. "+regionHint(rr);
    notify("A hint has appeared below.");
    playView();
  }

  $("graphModeFill").addEventListener("click",()=>{saved.mode="fill";persist();pickerView();});
  $("graphModeBuild").addEventListener("click",()=>{saved.mode="build";persist();pickerView();});
  $("graphBack").addEventListener("click",()=>{
    if(pendingPieceTimer!==null)finishPiece({navigate:false});
    setScreen("picker");
  });
  $("graphUndoFill").addEventListener("click",()=>{selected=null;flash=null;notify("Fill cleared. Choose a region.");playView();});
  $("graphCheckFill").addEventListener("click",checkFill);
  for(const id of ["graphSideA","graphSideB"])$(id).addEventListener("click",()=>{
    if(pendingPieceTimer!==null)return;
    choiceSide=$(id).dataset.side;notify("Now choose a boundary style.");playView();
  });
  $("graphSolid").addEventListener("click",()=>{
    if(pendingPieceTimer!==null)return;
    choiceStyle="solid";notify("Ready to add the line.");playView();
  });
  $("graphDashed").addEventListener("click",()=>{
    if(pendingPieceTimer!==null)return;
    choiceStyle="dashed";notify("Ready to add the line.");playView();
  });
  $("graphAddLine").addEventListener("click",addLine);
  $("graphHint").addEventListener("click",showHint);
  $("graphRestart").addEventListener("click",restart);
  $("graphChooseAgain").addEventListener("click",()=>setScreen("picker"));
  $("graphReplayReveal").addEventListener("click",openReveal);
  $("graphRevealClose").addEventListener("click",closeReveal);
  $("graphRevealSkip").addEventListener("click",showFinished);
  $("graphRevealAgain").addEventListener("click",playReveal);
  $("graphDownload").addEventListener("click",savePNG);
  reveal.addEventListener("cancel",event=>{event.preventDefault?.();closeReveal();});
  graph.addEventListener("click",ev=>{
    const box=graph.getBoundingClientRect();
    if(!box.width||!box.height)return;
    const sx=(ev.clientX-box.left)/box.width*SIZE;
    const sy=(ev.clientY-box.top)/box.height*SIZE;
    const x=REGION_WORLD.xmin+(sx-PAD)/GRID*10;
    const y=REGION_WORLD.ymax-(sy-PAD)/GRID*10;
    pickAt(x,y);
  });
  graph.addEventListener("keydown",ev=>{
    if(screen!=="play"||mode()!=="fill")return;
    const dirs={ArrowLeft:[-.5,0],ArrowRight:[.5,0],
      ArrowUp:[0,.5],ArrowDown:[0,-.5]};
    if(dirs[ev.key]){
      ev.preventDefault?.();
      cursor.x=Math.max(-4.5,Math.min(4.5,cursor.x+dirs[ev.key][0]));
      cursor.y=Math.max(-4.5,Math.min(4.5,cursor.y+dirs[ev.key][1]));
      notify("Cursor at ("+cursor.x+", "+cursor.y+"). Press Enter to fill.");
      playView();
    }else if(ev.key==="Enter"||ev.key===" "){
      ev.preventDefault?.();pickAt(cursor.x,cursor.y);
    }
  });
  // Preserve old crystal completions as an independently archived record;
  // no assumptions about an unfinished legacy line are made.
  try{
    const old=JSON.parse(storage.getItem(GRAPH_ART_LEGACY_SAVE_KEY));
    if(old?.done===5&&!saved.records["build:aurora-crystal"]){
      saved.records["build:aurora-crystal"]={done:5,line:0,replays:old.replays||0};
      persist();
    }
  }catch{}
  pickerView();
  return {readProgress:()=>({...saved,records:{...saved.records}}),
    choose:(id,m)=>{if(graphPicture(id)&&GRAPH_ART_MODES.some(x=>x.id===m)){
      saved.picture=id;saved.mode=m;resetChoices();setScreen("play");}},
    pickAt,checkFill,addLine,finishPiece,showFinished,render:()=>setScreen(screen)};
}
if(typeof document!=="undefined"&&document.getElementById("graphArtGraph"))initRegionsApp();
