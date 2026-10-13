import {
  WORLD,regionPaths,boundaryPoints,curvedCellAt,satisfiesAll
} from "./curved-engine.mjs";
import {PLOT_PICTURES,PLOT_PICTURE,plotPicture,plotSteps,plotRule,ruleSignature,previousBoundaries,validatePlotGallery} from "./plot-pictures.mjs";
import {
  POINT_STEP,snapPoint,samePoint,constructBoundary,checkConstruction,
  checkBoundaryStyle,previewPaths,validSavedPoints
} from "./plot-engine.mjs";

const NS="http://www.w3.org/2000/svg",SIZE=620,PAD=52,GRID=SIZE-2*PAD;
const px=x=>PAD+(x-WORLD.xmin)*GRID/(WORLD.xmax-WORLD.xmin);
const py=y=>PAD+(WORLD.ymax-y)*GRID/(WORLD.ymax-WORLD.ymin);
const path=(points,close=false)=>points.map((p,i)=>
  (i?"L":"M")+px(p.x).toFixed(2)+" "+py(p.y).toFixed(2)).join(" ")+(close?" Z":"");
const nice=n=>String(n).replace("-","−");
// Read-only prototype save imported on first use; never overwrite it.
export const PLOT_SAVE_KEY="inequality-ink-plot-shade-prototype-v1";
export const PLOT_SAVE_KEY_V2="inequality-ink-plot-shade-v2";
const fresh=()=>({done:0,phase:"plot",points:[],styleChoice:null,replays:0,
  plotIndex:0,verified:[]});
function safeJson(storage,key){
  try{return JSON.parse(storage.getItem(key));}catch{return null;}
}
function cleanRecord(raw,p,legacy=false){
  const r=fresh();
  if(!raw||!Number.isInteger(raw.done)||raw.done<0||raw.done>p.pieces.length)return r;
  r.done=raw.done;
  r.replays=Number.isInteger(raw.replays)&&raw.replays>=0&&raw.replays<1e6?
    raw.replays:0;
  if(r.done===p.pieces.length)return r;
  const part=p.pieces[r.done],steps=plotSteps(part);
  const verified=Array.isArray(raw.verified)?raw.verified:[];
  for(let i=0;i<Math.min(steps.length,verified.length);i++){
    const row=verified[i],step=steps[i],rule=plotRule(part,i);
    if(row?.ruleId!==step.ruleId||!validSavedPoints(row.points)||
      !checkConstruction({kind:step.kind,rule},row.points).correct||
      !checkBoundaryStyle(rule,row.style).correct)break;
    r.verified.push({ruleId:row.ruleId,points:row.points.map(pt=>({...pt})),style:row.style});
  }
  if(legacy&&raw.phase==="shade"&&steps.length===1&&
     !r.verified.length&&validSavedPoints(raw.points)&&
     checkConstruction({kind:steps[0].kind,rule:plotRule(part)},raw.points).correct&&
     checkBoundaryStyle(plotRule(part),raw.styleChoice).correct)
    r.verified.push({ruleId:steps[0].ruleId,
      points:raw.points.map(pt=>({...pt})),style:raw.styleChoice});
  r.plotIndex=r.verified.length;
  if(r.plotIndex===steps.length){r.phase="shade";return r;}
  r.points=validSavedPoints(raw.points)?raw.points.map(pt=>({...pt})):[];
  if(raw.phase==="style"&&r.points.length===2&&
     checkConstruction({kind:steps[r.plotIndex].kind,
       rule:plotRule(part,r.plotIndex)},r.points).correct){
    r.phase="style";
    r.styleChoice=["solid","dashed"].includes(raw.styleChoice)?
      raw.styleChoice:null;
  }
  return r;
}
export function readPlotSave(storage){
  const raw=safeJson(storage,PLOT_SAVE_KEY_V2),records={};
  for(const p of PLOT_PICTURES)if(raw?.records?.[p.id])
    records[p.id]=cleanRecord(raw.records[p.id],p);
  if(!records["little-umbrella"]){
    const legacy=safeJson(storage,PLOT_SAVE_KEY);
    if(legacy&&Number.isInteger(legacy.done)&&legacy.done>=0&&legacy.done<=2)
      records["little-umbrella"]=cleanRecord(legacy,PLOT_PICTURE,true);
  }
  const picture=plotPicture(raw?.picture)?.id||PLOT_PICTURES[0].id;
  return {picture,records,...(records[picture]||fresh())};
}

export function initPlotArt({doc=document,storage=localStorage,win=window}={}){
  validatePlotGallery();
  const $=id=>doc.getElementById(id),svg=$("plotGraph"),
    reveal=$("plotReveal"),revealSvg=$("plotRevealSvg");
  const restored=readPlotSave(storage);
  let saved={picture:restored.picture,records:restored.records};
  let save=saved.records[saved.picture]||fresh();
  let screen="picker",selected=null,wrong=null,
    cursor={x:0,y:0},activePoint=save.points.length-1,drag=null,
    message="",status="",hint="",flashTimer=null,revealTimers=[];
  function picture(){return plotPicture(saved.picture);}
  function persist(){
    saved.records[saved.picture]=save;
    try{storage.setItem(PLOT_SAVE_KEY_V2,JSON.stringify(saved));}catch{}
  }
  function current(){return picture().pieces[save.done]||null;}
  function step(){return current()?plotSteps(current())[save.plotIndex]||null:null;}
  function targetRule(){return step()?plotRule(current(),save.plotIndex):null;}
  function notify(text,type=""){message=text;status=type;}
  function el(root,tag,attrs={}){
    const node=doc.createElementNS(NS,tag);
    for(const [k,v]of Object.entries(attrs))node.setAttribute(k,String(v));
    root.append(node);return node;
  }
  function label(root,x,y,value,attrs={}){
    const t=el(root,"text",{x,y,...attrs});t.textContent=value;return t;
  }
  function baseGraph(root,{grid=true}={}){
    root.replaceChildren();
    el(root,"rect",{x:PAD,y:PAD,width:GRID,height:GRID,rx:9,
      fill:"#fffcf8",stroke:"#d8dfd9","stroke-width":2});
    if(!grid)return;
    for(let n=-5;n<=5;n++){
      el(root,"line",{x1:px(n),y1:PAD,x2:px(n),y2:SIZE-PAD,stroke:"#7692a0",
        "stroke-opacity":n===0?.48:.15,"stroke-width":n===0?2:1});
      el(root,"line",{x1:PAD,y1:py(n),x2:SIZE-PAD,y2:py(n),stroke:"#7692a0",
        "stroke-opacity":n===0?.48:.15,"stroke-width":n===0?2:1});
      if(n!==0&&n%2===0){
        label(root,px(n),py(0)+18,nice(n),
          {"font-size":13,"text-anchor":"middle",fill:"#8596a2"});
        label(root,px(0)-12,py(n)+5,nice(n),
          {"font-size":13,"text-anchor":"end",fill:"#8596a2"});
      }
    }
    label(root,px(5)-8,py(0)-10,"x",{"font-size":17,fill:"#546f80"});
    label(root,px(0)+11,py(5)+22,"y",{"font-size":17,fill:"#546f80"});
  }
  function drawPolygons(root,paths,attrs={},animate=""){
    for(const pts of paths){
      const node=el(root,"path",{d:path(pts,true),"pointer-events":"none",...attrs});
      if(animate)node.classList?.add(animate);
    }
  }
  function drawPiece(root,part,attrs={},animate=""){
    drawPolygons(root,regionPaths(part.rules),attrs,animate);
  }
  function drawBoundary(root,rule,attrs={}){
    const runs=rule.kind==="vertical"?[boundaryPoints(rule)]:boundaryPoints(rule);
    for(const points of runs){
      if(points.length<2)continue;
      el(root,"path",{d:path(points),fill:"none",stroke:"#5b7890",
        "stroke-width":2.6,"stroke-opacity":.91,
        "stroke-dasharray":rule.inclusive?"":"8 7",
        "pointer-events":"none",...attrs});
    }
  }
  function drawDetails(root,p,maxStage=Infinity,enterStage=0){
    const unit=GRID/(WORLD.xmax-WORLD.xmin);
    for(const d of p.details){
      if(d.stage>maxStage)continue;
      const attrs={"data-plot-detail":d.id,"data-detail-stage":d.stage,
        "pointer-events":"none"};let node;
      if(d.type==="ellipse"){
        node=el(root,"ellipse",{...attrs,cx:px(d.x),cy:py(d.y),
          rx:d.rx*unit,ry:d.ry*unit,fill:d.fill,
          stroke:d.stroke,"stroke-width":d.width*unit});
      }else if(d.type==="circle"){
        node=el(root,"circle",{...attrs,cx:px(d.x),cy:py(d.y),
          r:d.r*unit,fill:d.fill,
          stroke:d.stroke,"stroke-width":d.width*unit});
      }else if(d.type==="curve"){
        node=el(root,"path",{...attrs,
          d:"M"+px(d.x1).toFixed(2)+" "+py(d.y1).toFixed(2)+
            " Q"+px(d.cx).toFixed(2)+" "+py(d.cy).toFixed(2)+
            " "+px(d.x2).toFixed(2)+" "+py(d.y2).toFixed(2),
          fill:"none",stroke:d.stroke,"stroke-width":d.width*unit,
          "stroke-linecap":"round","stroke-linejoin":"round"});
      }else if(d.type==="star"){
        const points=Array.from({length:10},(_,i)=>{
          const r=d.r*(i%2?.42:1),angle=-Math.PI/2+i*Math.PI/5;
          return [px(d.x+Math.cos(angle)*r),py(d.y+Math.sin(angle)*r)]
            .map(n=>n.toFixed(2)).join(",");
        }).join(" ");
        node=el(root,"polygon",{...attrs,points,fill:d.fill,
          stroke:d.stroke,"stroke-width":d.width*unit,
          "stroke-linejoin":"round"});
      }
      if(node&&d.stage===enterStage)node.classList?.add("plot-detail-enter");
    }
  }
  function miniature(svg,p,progress){
    baseGraph(svg,{grid:false});
    for(const [i,part]of p.pieces.entries()){
      const painted=i<progress;
      drawPiece(svg,part,{
        fill:painted?part.color:"#cbd5d2",
        "fill-opacity":painted?1:(i<2?.18:.06),
        stroke:painted?"#fff9ee":"#acbdb9",
        "stroke-dasharray":painted?"":"9 7",
        "stroke-width":painted?3:1.5
      });
    }
    if(progress===p.pieces.length)drawDetails(svg,p);
  }
  function renderPreview(){
    const completed=PLOT_PICTURES.filter(p=>
      saved.records[p.id]?.done===p.pieces.length).length;
    const recommended=PLOT_PICTURES.find(p=>
      saved.records[p.id]?.done!==p.pieces.length)||PLOT_PICTURES[4];
    $("plotGalleryProgress").textContent=completed+" of 5 pictures finished · "+
      (completed===5?"All five stages complete!":"Next: "+recommended.stage);
    const stages=$("plotStageTrack");stages.replaceChildren();
    for(const p of PLOT_PICTURES){
      const done=saved.records[p.id]?.done||0;
      const stage=doc.createElement("div");
      stage.className="graph-step-node"+
        (done===p.pieces.length?" is-complete":"")+
        (p.id===recommended.id?" is-recommended":"");
      stage.setAttribute("aria-label",p.stage+", "+done+" of "+p.pieces.length+" pieces");
      const dot=doc.createElement("span");dot.className="graph-step-number";
      dot.textContent=done===p.pieces.length?"✓":String(p.step);
      const caption=doc.createElement("span");caption.textContent=p.stage;
      stage.append(dot,caption);stages.append(stage);
    }
    const cards=$("plotPictureCards");cards.replaceChildren();
    for(const p of PLOT_PICTURES){
      const r=saved.records[p.id]||fresh();
      const finished=r.done===p.pieces.length;
      const card=doc.createElement("button");
      card.type="button";
      card.className="graph-picture-card"+(p.id===recommended.id?" is-recommended":"");
      card.setAttribute("data-plot-picture",p.id);
      card.setAttribute("aria-label",(finished?"Replay ":"Start or continue ")+p.name+
        ". "+r.done+" of "+p.pieces.length+" pieces complete.");
      const svgPreview=doc.createElementNS(NS,"svg");
      svgPreview.setAttribute("viewBox","0 0 620 620");
      svgPreview.setAttribute("aria-hidden","true");
      miniature(svgPreview,p,r.done);
      const info=doc.createElement("span");info.className="graph-picture-info";
      const badge=doc.createElement("span");badge.className="graph-stage";
      badge.textContent=p.step+" · "+p.stage.toUpperCase()+" · "+p.pieces.length+" PIECES";
      const name=doc.createElement("strong");
      name.textContent=finished?p.name:p.clue;
      const description=doc.createElement("small");description.textContent=p.description;
      const focus=doc.createElement("span");
      focus.className="graph-card-maths";focus.textContent=p.focus;
      const progress=doc.createElement("span");progress.className="graph-card-progress";
      const bar=doc.createElement("span");
      bar.style.width=(100*r.done/p.pieces.length)+"%";progress.append(bar);
      const go=doc.createElement("span");go.className="graph-card-go";
      go.textContent=finished?"✓ Finished · Play again":
        r.done?"Continue · "+r.done+"/"+p.pieces.length+" pieces →":"Start picture →";
      info.append(badge,name,description,focus,progress,go);
      card.append(svgPreview,info);
      card.addEventListener("click",()=>choosePicture(p.id));
      cards.append(card);
    }
  }
  function choosePicture(id){
    const p=plotPicture(id);if(!p)return;
    clearFlash();stopReveal();selected=null;drag=null;hint="";
    saved.picture=p.id;
    save=saved.records[p.id]||fresh();
    if(save.done===p.pieces.length){
      const replays=save.replays;
      save=fresh();save.replays=replays+1;
    }
    activePoint=save.points.length-1;cursor={x:0,y:0};
    persist();notify("Begin by plotting the next boundary.");setScreen("play");
  }
  function currentConstruction(){
    return constructBoundary(step()?.kind,save.points);
  }
  function drawCanvas(){
    baseGraph(svg);
    const p=picture(),part=current();
    for(let i=0;i<save.done;i++)
      drawPiece(svg,p.pieces[i],{fill:p.pieces[i].color,
        stroke:"#fff9ed","stroke-width":3,
        "data-region-layer":"finished-"+p.pieces[i].id});
    if(!part)return;
    const future=new Set(plotSteps(part).slice(save.plotIndex).map(t=>t.ruleId));
    for(const rule of part.rules){
      if(future.has(rule.id))continue;
      const verified=save.verified.find(v=>v.ruleId===rule.id);
      drawBoundary(svg,rule,{
        stroke:verified?"#388d80":"#5b7890",
        "stroke-width":verified?3.25:2.6,
        "data-plot-boundary":verified?"constructed":"given"
      });
    }
    if(save.points.length===2&&(save.phase==="plot"||save.phase==="style")){
      const made=currentConstruction();
      if(made.valid)drawBoundary(svg,made.rule,{
        stroke:save.phase==="plot"?"#d18b72":"#388d80",
        "stroke-width":save.phase==="plot"?3:3.3,
        "stroke-dasharray":save.phase==="plot"?"7 7":
          save.styleChoice==="solid"?"":"8 7",
        "data-plot-boundary":"constructed"
      });
    }
    if(save.phase==="shade"){
      if(selected)drawPolygons(svg,selected.paths,{
        fill:part.color,"fill-opacity":.54,stroke:part.color,
        "stroke-width":2,"data-region-layer":"selection"},"graph-good-flash");
      if(wrong)drawPolygons(svg,wrong.paths,{
        fill:"#e65d65","fill-opacity":.55,
        stroke:"#ca343e","stroke-width":3,
        "data-region-layer":"wrong"},"graph-wrong-flash");
    }
    if(save.phase==="plot"){
      for(const [index,pt]of save.points.entries()){
        const active=index===activePoint;
        const circle=el(svg,"circle",{cx:px(pt.x),cy:py(pt.y),
          r:active?9:7,fill:active?"#dc8b69":"#3f988c",
          stroke:"#fffcf8","stroke-width":3,
          "data-plot-point":index,"pointer-events":"none"});
        circle.classList?.add("plot-preview-point");
        const lx=Math.min(SIZE-PAD-8,px(pt.x)+13);
        const ly=Math.max(PAD+17,py(pt.y)-11);
        label(svg,lx,ly,(index+1)+": ("+nice(pt.x)+", "+nice(pt.y)+")",{
          fill:"#516a73","font-size":14,"font-weight":800,
          "paint-order":"stroke",stroke:"#fffcf8","stroke-width":4,
          "pointer-events":"none"});
      }
    }
    if(save.phase==="plot"||save.phase==="shade")
      el(svg,"circle",{cx:px(cursor.x),cy:py(cursor.y),r:7,
        stroke:"#3f8f7d",fill:"none","stroke-width":2,
        "stroke-dasharray":"3 3","pointer-events":"none"});
    svg.setAttribute("aria-label",save.phase==="plot"?
      "Plot boundary "+(save.plotIndex+1)+" of "+plotSteps(part).length+
      ". Arrow keys move a cursor, Enter places a point. Drag to edit.":
      save.phase==="style"?"Choose solid or dashed in the controls.":
      "Tap the region satisfying all inequalities, or use arrow keys and Enter.");
    svg.style.touchAction=save.phase==="plot"?"none":"manipulation";
  }
  function pointText(p){return p?"("+nice(p.x)+", "+nice(p.y)+")":"not placed";}
  function playView(){
    const p=picture(),part=current();
    if(!part){setScreen("summary");return;}
    const task=step(),total=plotSteps(part).length;
    $("plotGameMode").textContent="PLOT & SHADE · STEP "+p.step+" · "+p.stage.toUpperCase();
    $("plotGameTitle").textContent=p.name;
    $("plotGameFocus").textContent=p.focus;
    $("plotPieceCount").textContent="Piece "+(save.done+1)+" of "+p.pieces.length;
    $("plotCanvasCount").textContent=save.done+" / "+p.pieces.length;
    $("plotProgressFill").style.width=(100*save.done/p.pieces.length)+"%";
    $("plotProgress").setAttribute("aria-valuenow",
      String(Math.round(100*save.done/p.pieces.length)));
    $("plotTaskKicker").textContent="PIECE "+(save.done+1)+" OF "+p.pieces.length;
    $("plotTaskTitle").textContent=part.name;
    $("plotPieceSwatch").style.background=part.color;
    $("plotBoundaryCount").textContent=save.phase==="shade"?
      "All "+total+" plotted":"Boundary "+(save.plotIndex+1)+" of "+total;
    $("plotMobileEquation").textContent=save.phase==="shade"?
      "Fill the common region":(save.phase==="plot"?"Plot: ":"Boundary: ")+targetRule().text;
    $("plotCanvasTitle").textContent=save.phase==="plot"?"Plot the boundary":
      save.phase==="style"?"Choose its style":"Find the overlap";
    $("plotCanvasInstruction").textContent=save.phase==="plot"?
      "Tap or drag points. Coordinates snap to 0.5. Arrow keys + Enter work too.":
      save.phase==="style"?"Study your graph, then decide solid or dashed.":
      "Tap the common region. Correct fills stay until you check.";
    const tasks=plotSteps(part),built=new Set(save.verified.map(t=>t.ruleId));
    const reused=previousBoundaries(p,save.done);
    const rules=$("plotRuleList");rules.replaceChildren();
    for(const r of part.rules){
      const taskIndex=tasks.findIndex(t=>t.ruleId===r.id);
      const isTarget=taskIndex>=0,done=built.has(r.id);
      const active=isTarget&&taskIndex===save.plotIndex&&save.phase!=="shade";
      const item=doc.createElement("div");
      item.className="graph-rule-item "+(active?"plot-rule-plot":"plot-rule-given");
      const txt=doc.createElement("span");txt.textContent=r.text;
      const flag=doc.createElement("span");flag.className="rule-state";
      flag.textContent=done?"BUILT":active?"PLOT":
        isTarget?"NEXT":reused.has(ruleSignature(r))?"REUSED":"GIVEN";
      item.append(txt,flag);rules.append(item);
    }
    for(const name of ["plot","style","shade"]){
      const node=[...$("plotPhaseTrack").children].find(
        child=>child.getAttribute("data-step")===name);
      if(!node)continue;
      const index={plot:0,style:1,shade:2};
      node.className="plot-phase"+(name===save.phase?" is-current":
        index[name]<index[save.phase]?" is-done":"");
    }
    $("plotPlotControls").hidden=save.phase!=="plot";
    $("plotStyleControls").hidden=save.phase!=="style";
    $("plotShadeControls").hidden=save.phase!=="shade";
    const count=save.points.length,kind=task?.kind;
    const first={parabola:"Place the turning point first.",
      absolute:"Place the V's vertex first.",
      circle:"Place the circle's centre first.",
      line:"Place your first point on the line."};
    $("plotInstruction").textContent=count===0?(first[kind]||"Place the first point."):
      count===1?"Now place a second point on the boundary.":"Both points placed. Check your sketch.";
    $("plotGuidance").textContent=task?.guidance||"All boundaries built. Now shade.";
    $("plotPointReadout").textContent=
      (kind==="parabola"||kind==="absolute"?"Vertex: ":
       kind==="circle"?"Centre: ":"Point 1: ")+pointText(save.points[0])+
      " · "+(kind==="circle"?"Edge point: ":"Point 2: ")+pointText(save.points[1]);
    $("plotNudgeControls").hidden=count===0;
    $("plotNudgeLabel").textContent=activePoint<0?"Select a point to adjust":
      "Adjust point "+(activePoint+1)+" by 0.5";
    $("plotSolid").setAttribute("aria-pressed",String(save.styleChoice==="solid"));
    $("plotDashed").setAttribute("aria-pressed",String(save.styleChoice==="dashed"));
    $("plotFeedback").className="graph-feedback"+(status?" "+status:"");
    $("plotFeedback").textContent=message||"Place two points to construct the boundary.";
    $("plotHintText").hidden=!hint;
    $("plotHintText").textContent=hint;
    $("plotDockStep").textContent=save.phase==="plot"?"1 · Plot":
      save.phase==="style"?"2 · Style":"3 · Shade";
    $("plotDockUndo").textContent=save.phase==="plot"?"Undo point":
      save.phase==="style"?"Edit sketch":"Undo fill";
    $("plotDockCheck").textContent=save.phase==="plot"?"Check sketch →":
      save.phase==="style"?"Check boundary →":"Check region →";
    drawCanvas();
  }
  function summaryView(){
    const p=picture();
    $("plotSummaryTitle").textContent=p.name;
    $("plotSummaryText").textContent=
      "You constructed mathematical boundaries and found "+p.pieces.length+
      " real regions. Watch the artwork come to life!";
    $("plotSummaryStats").textContent=p.pieces.length+" regions · "+
      p.pieces.reduce((n,part)=>n+plotSteps(part).length,0)+
      " graph constructions · "+p.stage;
    $("plotNextPicture").hidden=p.step===PLOT_PICTURES.length;
  }
  function setScreen(next){
    screen=next;
    $("plotPicker").hidden=next!=="picker";
    $("plotPlay").hidden=next!=="play";
    $("plotSummary").hidden=next!=="summary";
    $("how-plot-works").hidden=next==="play";
    if(next==="picker")renderPreview();
    if(next==="play")playView();
    if(next==="summary")summaryView();
  }
  function clearFlash(){
    if(flashTimer!=null){win.clearTimeout?.(flashTimer);flashTimer=null;}
    wrong=null;
  }
  function addPoint(x,y){
    if(screen!=="play"||save.phase!=="plot")return false;
    const p=snapPoint(x,y);
    if(!p)return false;
    if(save.points.length>=2){
      notify("Drag an existing point, or use Undo point before adding another.");playView();
      return false;
    }
    save.points.push(p);activePoint=save.points.length-1;
    persist();notify(save.points.length===2?
      "Your sketch is ready. Press Check sketch or drag a point to adjust it.":
      "First point placed. Now place a different second point.");
    playView();return true;
  }
  function movePoint(index,x,y){
    if(screen!=="play"||save.phase!=="plot"||
      !Number.isInteger(index)||index<0||index>=save.points.length)return false;
    const p=snapPoint(x,y);
    if(!p)return false;
    activePoint=index;
    if(samePoint(p,save.points[index]))return true;
    save.points[index]=p;
    persist();notify("Point moved. Check the graph when you're ready.");
    playView();return true;
  }
  function nudgePoint(dx,dy){
    if(save.phase!=="plot"||activePoint<0||
       activePoint>=save.points.length)return;
    const point=save.points[activePoint];
    movePoint(activePoint,point.x+dx,point.y+dy);
  }
  function undoPoint(){
    if(save.phase!=="plot")return;
    if(save.points.length)save.points.pop();
    activePoint=save.points.length-1;
    persist();notify(save.points.length?"Point removed.":"Place the first point.");
    playView();
  }
  function checkPlot(){
    if(save.phase!=="plot"||screen!=="play")return;
    const checked=checkConstruction({kind:step().kind,
      rule:targetRule()},save.points);
    if(!checked.correct){
      notify(checked.message,"error");playView();return;
    }
    save.phase="style";save.styleChoice=null;hint="";
    persist();notify(checked.message,"success");playView();
  }
  function chooseStyle(value){
    if(save.phase!=="style")return;
    save.styleChoice=value;persist();notify("Boundary style selected. Press Check boundary.");
    playView();
  }
  function editPlot(){
    if(save.phase!=="style")return;
    save.phase="plot";save.styleChoice=null;persist();
    notify("Move either point to refine your sketch.");playView();
  }
  function checkStyle(){
    if(save.phase!=="style")return;
    const result=checkBoundaryStyle(targetRule(),save.styleChoice);
    if(!result.correct){notify(result.message,"error");playView();return;}
    save.verified.push({ruleId:step().ruleId,style:save.styleChoice,
      points:save.points.map(pt=>({...pt}))});
    save.plotIndex++;save.points=[];save.styleChoice=null;
    activePoint=-1;cursor={x:0,y:0};hint="";
    const total=plotSteps(current()).length;
    if(save.plotIndex<total){
      save.phase="plot";
      notify("Correct boundary! "+save.plotIndex+" of "+total+
        " built. Now plot the next missing graph.","success");
    }else{
      save.phase="shade";
      notify("All boundaries constructed! Now fill their common region.","success");
    }
    persist();playView();
  }
  function pickAt(x,y){
    if(screen!=="play"||save.phase!=="shade")return;
    const candidate=curvedCellAt(current().rules,x,y);
    if(!candidate){
      notify("Tap a little farther from the boundary. Try the centre of a region.");
      playView();return;
    }
    clearFlash();
    if(!candidate.correct){
      selected=null;wrong=candidate;
      notify("Not quite. That region fails at least one of the inequalities. Try another.","error");
      playView();
      const id=win.setTimeout?.(()=>{
        if(flashTimer!==id)return;
        wrong=null;flashTimer=null;
        if(screen==="play")playView();
      },950);
      flashTimer=id??null;
      return;
    }
    selected=selected?null:candidate;
    notify(selected?"Region filled. Press Check when you are ready.":
      "Fill removed. Choose a region again.");
    playView();
  }
  function undoFill(){
    if(save.phase!=="shade")return;
    clearFlash();selected=null;notify("Fill cleared. Choose a region.");
    playView();
  }
  function checkRegion(){
    if(save.phase!=="shade")return;
    if(!selected){
      notify("First fill the region satisfying all the inequalities.","error");
      playView();return;
    }
    if(!selected.correct){
      notify("Check which inequalities are true.","error");playView();return;
    }
    save.done++;save.phase="plot";save.points=[];
    save.styleChoice=null;save.plotIndex=0;save.verified=[];
    persist();selected=null;clearFlash();drag=null;
    activePoint=-1;cursor={x:0,y:0};hint="";
    if(!current()){setScreen("summary");openReveal();}
    else{
      notify("Beautiful! That mathematical region is now part of your picture.","success");
      playView();
    }
  }
  function restart(){
    clearFlash();stopReveal();drag=null;
    const replays=save.replays;
    save=fresh();save.replays=replays+1;
    selected=null;activePoint=-1;cursor={x:0,y:0};hint="";
    persist();notify("Begin by plotting the missing graph.");setScreen("play");
  }
  function begin(){choosePicture(saved.picture);}
  function stopReveal(){
    for(const id of revealTimers)win.clearTimeout?.(id);
    revealTimers=[];
  }
  function later(fn,ms){
    const id=win.setTimeout?.(fn,ms);
    if(id!=null)revealTimers.push(id);
  }
  function revealStage(count,detailsStage=0,finished=false){
    baseGraph(revealSvg,{grid:false});
    for(const [i,part]of PLOT_PICTURE.pieces.slice(0,count).entries()){
      drawPiece(revealSvg,part,{fill:part.color,
        stroke:"#fff9ed","stroke-width":3.5,
        "data-reveal-piece":part.id},
        !finished&&detailsStage===0&&i===count-1?"plot-piece-enter":"");
    }
    if(count===PLOT_PICTURE.pieces.length&&detailsStage)
      drawDetails(revealSvg,detailsStage,finished?0:detailsStage);
    $("plotRevealTitle").textContent=finished?"Little Umbrella ✦":
      detailsStage?"Your picture is coming to life!":"Your art is coming together!";
    $("plotRevealStatus").textContent=finished?
      "Your Little Umbrella is complete! Both coloured pieces came from your constructed mathematical boundaries.":
      count<2?"Mathematical region "+count+" of 2 revealed":
      detailsStage===1?"Umbrella patterns are appearing…":
      detailsStage===2?"The handle and puddle ripples are taking shape…":
      detailsStage===3?"Raindrops and finishing touches complete the scene!":
      "Both curved regions are complete. Here come the finishing details…";
    $("plotRevealSkip").hidden=finished;
    $("plotRevealAgain").hidden=!finished;
    $("plotDownload").hidden=!finished;
  }
  function showFinished(){stopReveal();revealStage(2,3,true);}
  function playReveal(){
    stopReveal();revealStage(0);
    if(win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches){
      showFinished();return;
    }
    later(()=>revealStage(1),610);
    later(()=>revealStage(2),1220);
    later(()=>revealStage(2,1),1810);
    later(()=>revealStage(2,2),2300);
    later(()=>revealStage(2,3),2790);
    later(showFinished,3280);
  }
  function openReveal(){
    if(reveal.showModal)reveal.showModal();
    else reveal.setAttribute("open","");
    playReveal();
  }
  function closeReveal(){
    stopReveal();
    if(reveal.close)reveal.close();
    else reveal.removeAttribute?.("open");
    setScreen("summary");
  }
  function savePNG(){
    const xml=new XMLSerializer().serializeToString(revealSvg);
    const canvas=doc.createElement("canvas");
    canvas.width=1100;canvas.height=1100;
    const context=canvas.getContext?.("2d");if(!context)return;
    const blob=new Blob([xml],{type:"image/svg+xml;charset=utf-8"});
    const url=URL.createObjectURL(blob),image=new Image();
    image.onload=()=>{
      context.fillStyle="#fffcf8";context.fillRect(0,0,1100,1100);
      context.drawImage(image,0,0,1100,1100);
      URL.revokeObjectURL(url);
      const a=doc.createElement("a");
      a.download="inequality-ink-little-umbrella.png";
      a.href=canvas.toDataURL("image/png");
      a.click();
    };
    image.onerror=()=>URL.revokeObjectURL(url);
    image.src=url;
  }
  function giveHint(){
    if(screen!=="play"||!current())return;
    if(save.phase==="plot")
      hint=save.points.length?current().plot.hints[1]:current().plot.hints[0];
    else if(save.phase==="style")
      hint="Use a solid boundary when equality is included (≤ or ≥). Use dashed for a strict inequality (< or >).";
    else hint=save.done===0?
      "Try the point (0, 2). Is it below the parabola and above the horizontal line?":
      "Try the point (0, −3.5). Is it above the lower parabola and below the line?";
    notify("A hint has appeared below.");playView();
  }
  function worldAt(ev){
    const rect=svg.getBoundingClientRect();
    if(!rect.width||!rect.height)return null;
    const sx=(ev.clientX-rect.left)/rect.width*SIZE;
    const sy=(ev.clientY-rect.top)/rect.height*SIZE;
    if(sx<PAD||sx>SIZE-PAD||sy<PAD||sy>SIZE-PAD)return null;
    const x=WORLD.xmin+(sx-PAD)/GRID*(WORLD.xmax-WORLD.xmin);
    const y=WORLD.ymax-(sy-PAD)/GRID*(WORLD.ymax-WORLD.ymin);
    return {x,y};
  }
  function pointNear(raw){
    const rect=svg.getBoundingClientRect();
    const xs=rect.width/(WORLD.xmax-WORLD.xmin);
    const ys=rect.height/(WORLD.ymax-WORLD.ymin);
    return save.points.findIndex(p=>
      Math.hypot((p.x-raw.x)*xs,(p.y-raw.y)*ys)<=21);
  }
  svg.addEventListener("pointerdown",ev=>{
    if(screen!=="play"||save.phase!=="plot"||
       (ev.button!==undefined&&ev.button!==0))return;
    const raw=worldAt(ev);if(!raw)return;
    const existing=pointNear(raw);
    if(existing>=0){
      activePoint=existing;playView();
    }else if(save.points.length<2){
      addPoint(raw.x,raw.y);
    }else{
      notify("To edit, drag a plotted point or choose Undo point.");
      playView();return;
    }
    drag={index:activePoint,id:ev.pointerId};
    svg.setPointerCapture?.(ev.pointerId);
  });
  svg.addEventListener("pointermove",ev=>{
    if(screen!=="play"||save.phase!=="plot"||!drag||
       drag.id!==ev.pointerId)return;
    const raw=worldAt(ev);
    if(raw)movePoint(drag.index,raw.x,raw.y);
  });
  const releasePointer=ev=>{
    if(drag&&drag.id===ev.pointerId){
      drag=null;svg.releasePointerCapture?.(ev.pointerId);
    }
  };
  svg.addEventListener("pointerup",releasePointer);
  svg.addEventListener("pointercancel",releasePointer);
  svg.addEventListener("click",ev=>{
    if(screen!=="play"||save.phase!=="shade")return;
    const raw=worldAt(ev);if(raw)pickAt(raw.x,raw.y);
  });
  svg.addEventListener("keydown",ev=>{
    if(screen!=="play")return;
    const movements={ArrowLeft:[-POINT_STEP,0],ArrowRight:[POINT_STEP,0],
      ArrowUp:[0,POINT_STEP],ArrowDown:[0,-POINT_STEP]};
    if(movements[ev.key]&&(save.phase==="plot"||save.phase==="shade")){
      ev.preventDefault?.();
      cursor=snapPoint(cursor.x+movements[ev.key][0],cursor.y+movements[ev.key][1]);
      notify("Cursor at "+pointText(cursor)+". Press Enter to "+
        (save.phase==="plot"?"place a point.":"select the region."));
      playView();
    }else if((ev.key==="Enter"||ev.key===" ")&&save.phase!=="style"){
      ev.preventDefault?.();
      if(save.phase==="plot"){
        if(save.points.length<2)addPoint(cursor.x,cursor.y);
        else{notify("Use the adjust-point arrows or Undo point to edit.");playView();}
      }else pickAt(cursor.x,cursor.y);
    }else if(ev.key==="Backspace"&&save.phase==="plot"){
      ev.preventDefault?.();undoPoint();
    }
  });
  $("plotPictureCard").addEventListener("click",begin);
  $("plotBack").addEventListener("click",()=>{
    clearFlash();drag=null;selected=null;setScreen("picker");
  });
  $("plotUndoPoint").addEventListener("click",undoPoint);
  $("plotCheckGraph").addEventListener("click",checkPlot);
  $("plotSolid").addEventListener("click",()=>chooseStyle("solid"));
  $("plotDashed").addEventListener("click",()=>chooseStyle("dashed"));
  $("plotEditGraph").addEventListener("click",editPlot);
  $("plotCheckStyle").addEventListener("click",checkStyle);
  $("plotUndoFill").addEventListener("click",undoFill);
  $("plotCheckRegion").addEventListener("click",checkRegion);
  $("plotHint").addEventListener("click",giveHint);
  $("plotNudgeLeft").addEventListener("click",()=>nudgePoint(-POINT_STEP,0));
  $("plotNudgeRight").addEventListener("click",()=>nudgePoint(POINT_STEP,0));
  $("plotNudgeUp").addEventListener("click",()=>nudgePoint(0,POINT_STEP));
  $("plotNudgeDown").addEventListener("click",()=>nudgePoint(0,-POINT_STEP));
  $("plotDockUndo").addEventListener("click",()=>{
    if(save.phase==="plot")undoPoint();
    else if(save.phase==="style")editPlot();
    else undoFill();
  });
  $("plotDockCheck").addEventListener("click",()=>{
    if(save.phase==="plot")checkPlot();
    else if(save.phase==="style")checkStyle();
    else checkRegion();
  });
  $("plotReplayReveal").addEventListener("click",openReveal);
  $("plotRestart").addEventListener("click",restart);
  $("plotChooseAgain").addEventListener("click",()=>setScreen("picker"));
  $("plotRevealClose").addEventListener("click",closeReveal);
  $("plotRevealSkip").addEventListener("click",showFinished);
  $("plotRevealAgain").addEventListener("click",playReveal);
  $("plotDownload").addEventListener("click",savePNG);
  reveal.addEventListener("cancel",ev=>{ev.preventDefault?.();closeReveal();});
  setScreen("picker");
  return {
    addPoint,movePoint,checkPlot,checkStyle,checkRegion,pickAt,undoPoint,
    chooseStyle,giveHint,readProgress:()=>({
      ...save,points:save.points.map(p=>({...p}))
    }),start:begin,render:()=>setScreen(screen),showFinished
  };
}
if(typeof document!=="undefined"&&document.getElementById("plotPicker"))initPlotArt();