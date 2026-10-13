import {
  WORLD,PICTURE,CURVE_DETAIL_STAGES,regionPaths,boundaryPoints,curvedCellAt,validatePicture
} from "./curved-engine.mjs";

const NS="http://www.w3.org/2000/svg",SIZE=620,PAD=52,GRID=SIZE-2*PAD;
const px=x=>PAD+(x-WORLD.xmin)*GRID/(WORLD.xmax-WORLD.xmin);
const py=y=>PAD+(WORLD.ymax-y)*GRID/(WORLD.ymax-WORLD.ymin);
const path=(points,close=false)=>points.map((p,i)=>
  (i?"L":"M")+px(p.x).toFixed(2)+" "+py(p.y).toFixed(2)).join(" ")+(close?" Z":"");
export const CURVE_SAVE_KEY="inequality-ink-curve-fill-prototype-v1";

export function readCurveSave(storage){
  try{
    const raw=JSON.parse(storage.getItem(CURVE_SAVE_KEY));
    if(raw&&Number.isInteger(raw.done)&&raw.done>=0&&raw.done<=PICTURE.pieces.length){
      return {done:raw.done,replays:Number.isInteger(raw.replays)&&raw.replays>=0?raw.replays:0};
    }
  }catch{}
  return {done:0,replays:0};
}

export function initCurveArt({doc=document,storage=localStorage,win=window}={}){
  validatePicture();
  const $=id=>doc.getElementById(id);
  const graph=$("graphArtGraph"),preview=$("curvePreviewGraph"),reveal=$("curveReveal"),revealSvg=$("graphRevealSvg");
  let saved=readCurveSave(storage),screen="picker",selected=null,flash=null,
    cursor={x:0,y:0},message="",status="",hint="",flashTimer=null,revealTimers=[];

  function persist(){try{storage.setItem(CURVE_SAVE_KEY,JSON.stringify(saved));}catch{}}
  function notify(text,type=""){message=text;status=type;}
  function current(){return PICTURE.pieces[saved.done]||null;}
  function el(svg,tag,attrs={}){
    const node=doc.createElementNS(NS,tag);
    for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));
    svg.append(node);
    return node;
  }
  function label(svg,x,y,value,attrs={}){
    const t=el(svg,"text",{x,y,...attrs});
    t.textContent=value;return t;
  }
  function baseGraph(svg,{grid=true}={}){
    svg.replaceChildren();
    el(svg,"rect",{x:PAD,y:PAD,width:GRID,height:GRID,rx:9,
      fill:"#fffcf8",stroke:"#d8dfd9","stroke-width":2});
    if(!grid)return;
    for(let n=-5;n<=5;n++){
      el(svg,"line",{x1:px(n),y1:PAD,x2:px(n),y2:SIZE-PAD,stroke:"#7692a0",
        "stroke-opacity":n===0?.48:.15,"stroke-width":n===0?2:1});
      el(svg,"line",{x1:PAD,y1:py(n),x2:SIZE-PAD,y2:py(n),stroke:"#7692a0",
        "stroke-opacity":n===0?.48:.15,"stroke-width":n===0?2:1});
      if(n!==0&&n%2===0){
        label(svg,px(n),py(0)+18,String(n).replace("-","−"),{
          "font-size":13,"text-anchor":"middle",fill:"#8596a2"});
        label(svg,px(0)-12,py(n)+5,String(n).replace("-","−"),{
          "font-size":13,"text-anchor":"end",fill:"#8596a2"});
      }
    }
    label(svg,px(5)-8,py(0)-10,"x",{"font-size":17,fill:"#546f80"});
    label(svg,px(0)+11,py(5)+22,"y",{"font-size":17,fill:"#546f80"});
  }
  function drawPaths(svg,paths,attrs={},className=""){
    for(const points of paths){
      const node=el(svg,"path",{d:path(points,true),"pointer-events":"none",...attrs});
      if(className)node.classList?.add(className);
    }
  }
  function drawPiece(svg,part,attrs={},className=""){
    drawPaths(svg,regionPaths(part.rules),attrs,className);
  }
  // Coordinate-based decorations share the real mathematical viewBox. SVG
  // attributes are self-contained, so PNG downloads retain every detail.
  function drawDetails(svg,maxStage=Infinity,enterStage=0){
    const unit=GRID/(WORLD.xmax-WORLD.xmin);
    for(const d of PICTURE.details||[]){
      if(d.stage>maxStage)continue;
      const props={
        "data-curve-detail":d.id,"data-detail-stage":d.stage,
        "pointer-events":"none"
      };
      let node;
      if(d.type==="ellipse"){
        node=el(svg,"ellipse",{...props,cx:px(d.x),cy:py(d.y),
          rx:d.rx*unit,ry:d.ry*unit,fill:d.fill,
          ...(d.stroke?{stroke:d.stroke,"stroke-width":d.width*unit}:{})});
      }else if(d.type==="circle"){
        node=el(svg,"circle",{...props,cx:px(d.x),cy:py(d.y),
          r:d.r*unit,fill:d.fill,
          ...(d.stroke?{stroke:d.stroke,"stroke-width":d.width*unit}:{})});
      }else if(d.type==="curve"){
        node=el(svg,"path",{...props,
          d:"M"+px(d.x1).toFixed(2)+" "+py(d.y1).toFixed(2)+
            " Q"+px(d.cx).toFixed(2)+" "+py(d.cy).toFixed(2)+
            " "+px(d.x2).toFixed(2)+" "+py(d.y2).toFixed(2),
          fill:"none",stroke:d.stroke,"stroke-width":d.width*unit,
          "stroke-linecap":"round","stroke-linejoin":"round"});
      }else if(d.type==="star"){
        const vertices=Array.from({length:10},(_,i)=>{
          const r=d.r*(i%2?.42:1),a=-Math.PI/2+i*Math.PI/5;
          return [px(d.x+Math.cos(a)*r),py(d.y+Math.sin(a)*r)]
            .map(n=>n.toFixed(2)).join(",");
        }).join(" ");
        node=el(svg,"polygon",{...props,points:vertices,fill:d.fill,
          stroke:d.stroke,"stroke-width":d.width*unit,"stroke-linejoin":"round"});
      }
      if(node&&d.stage===enterStage)node.classList?.add("curve-detail-enter");
    }
  }
  function drawBoundaries(svg,part){
    for(const rule of part.rules){
      const raw=boundaryPoints(rule);
      const runs=rule.kind==="vertical"?[raw]:raw;
      for(const points of runs){
        if(points.length<2)continue;
        el(svg,"path",{d:path(points),fill:"none",stroke:"#5b7890",
          "stroke-width":2.6,"stroke-opacity":.91,
          "stroke-dasharray":rule.inclusive?"":"8 7",
          "pointer-events":"none"});
      }
    }
  }
  function miniature(){
    baseGraph(preview,{grid:false});
    for(const [i,part] of PICTURE.pieces.entries()){
      const finished=i<saved.done;
      drawPiece(preview,part,{fill:finished?part.color:"#bfcac7",
        "fill-opacity":finished?1:.22,stroke:finished?"#fff9ee":"#bfcac7",
        "stroke-dasharray":finished?"":"9 7","stroke-width":3});
    }
    if(saved.done===PICTURE.pieces.length)drawDetails(preview);
  }
  function pickerView(){
    miniature();
    const done=saved.done,total=PICTURE.pieces.length;
    $("curveGalleryProgress").textContent=(done===total?"1 of 1":"0 of 1")+" pictures finished";
    $("curveCardTitle").textContent=done===total?PICTURE.name:PICTURE.clue;
    $("curveCardProgressFill").style.width=(100*done/total)+"%";
    $("curveCardAction").textContent=done===total?"✓ Finished · Play again":
      done?"Continue · "+done+"/"+total+" pieces →":"Start picture →";
    $("curvePictureCard").setAttribute("aria-label",(done===total?"Replay ":"Start or continue ")+PICTURE.name);
  }
  function draw(){
    baseGraph(graph);
    for(let i=0;i<saved.done;i++){
      const part=PICTURE.pieces[i];
      drawPiece(graph,part,{fill:part.color,stroke:"#fff9ec","stroke-width":3,
        "data-region-layer":"finished-"+part.id});
    }
    const part=current();
    if(!part)return;
    drawBoundaries(graph,part);
    if(selected)drawPaths(graph,selected.paths,{fill:part.color,"fill-opacity":.52,
      stroke:part.color,"stroke-width":2,"data-region-layer":"selection"},"graph-good-flash");
    if(flash)drawPaths(graph,flash.paths,{fill:"#e65d65","fill-opacity":.55,
      stroke:"#ca343e","stroke-width":3,"data-region-layer":"wrong"},"graph-wrong-flash");
    el(graph,"circle",{cx:px(cursor.x),cy:py(cursor.y),r:7,
      fill:"none",stroke:"#408c7c","stroke-width":2,
      "stroke-dasharray":"3 2","pointer-events":"none"});
    graph.setAttribute("aria-label","Coordinate graph. "+saved.done+
      " completed pieces. Move with arrow keys and press Enter to fill the region under the keyboard cursor.");
  }
  function playView(){
    const part=current();
    if(!part){setScreen("summary");return;}
    $("graphPieceCount").textContent="Piece "+(saved.done+1)+" of "+PICTURE.pieces.length;
    $("graphCanvasCount").textContent=saved.done+" / "+PICTURE.pieces.length;
    $("graphProgressFill").style.width=(100*saved.done/PICTURE.pieces.length)+"%";
    $("graphProgress").setAttribute("aria-valuenow",String(Math.round(100*saved.done/PICTURE.pieces.length)));
    $("graphTaskKicker").textContent="PIECE "+(saved.done+1)+" OF "+PICTURE.pieces.length;
    $("graphTaskTitle").textContent=part.name;
    $("graphPieceSwatch").style.background=part.color;
    $("graphRuleCount").textContent=part.rules.length+" inequalities";
    const holder=$("graphRuleList");holder.replaceChildren();
    for(const rr of part.rules){
      const item=doc.createElement("div");
      item.className="graph-rule-item";
      const eq=doc.createElement("span");eq.textContent=rr.text;
      const state=doc.createElement("span");state.className="rule-state";state.textContent="AND";
      item.append(eq,state);holder.append(item);
    }
    $("graphFeedback").textContent=message||"Tap the region where all inequalities are true.";
    $("graphFeedback").className="graph-feedback"+(status?" "+status:"");
    $("graphHintText").textContent=hint;
    $("graphHintText").hidden=!hint;
    draw();
  }
  function summaryView(){ $("curveSummaryTitle").textContent=PICTURE.name; }
  function setScreen(next){
    screen=next;
    $("curvePicker").hidden=next!=="picker";
    $("curvePlay").hidden=next!=="play";
    $("curveSummary").hidden=next!=="summary";
    $("how-graph-art-works").hidden=next==="play";
    if(next==="picker")pickerView();
    if(next==="play")playView();
    if(next==="summary")summaryView();
  }
  function stopFlash(){
    if(flashTimer!==null){win.clearTimeout?.(flashTimer);flashTimer=null;}
    flash=null;
  }
  function pickAt(x,y){
    if(screen!=="play"||!current())return;
    const candidate=curvedCellAt(current().rules,x,y);
    if(!candidate){
      notify("Tap a little farther from a boundary. Try the centre of a region.");
      playView();return;
    }
    stopFlash();
    if(!candidate.correct){
      flash=candidate;selected=null;
      notify("Not quite. That region fails at least one of the inequalities. Try another.","error");
      playView();
      const id=win.setTimeout?.(()=>{
        if(flashTimer!==id)return;
        flashTimer=null;flash=null;
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
  function clearSelection(){
    stopFlash();selected=null;
    notify("Fill cleared. Choose a region.");
    if(screen==="play")playView();
  }
  function checkFill(){
    if(screen!=="play"||!current())return;
    if(!selected){notify("First fill the region satisfying all the inequalities.","error");playView();return;}
    if(!selected.correct){notify("Check which inequalities are true.","error");playView();return;}
    saved.done++;persist();selected=null;stopFlash();
    cursor={x:0,y:0};hint="";
    if(saved.done===PICTURE.pieces.length){
      setScreen("summary");openReveal();
    }else{
      notify("Beautiful! That mathematical shape is now part of your picture.","success");
      playView();
    }
  }
  function restart(){
    stopFlash();stopReveal();selected=null;cursor={x:0,y:0};hint="";
    saved.done=0;saved.replays++;persist();
    notify("Find the common region.");setScreen("play");
  }
  function stopReveal(){
    for(const id of revealTimers)win.clearTimeout?.(id);
    revealTimers=[];
  }
  function later(fn,ms){
    const id=win.setTimeout?.(fn,ms);
    if(id!=null)revealTimers.push(id);
  }
  function revealStage(count,detailCount=0,finished=false){
    baseGraph(revealSvg,{grid:false});
    for(const [i,part] of PICTURE.pieces.slice(0,count).entries()){
      const enter=!finished&&detailCount===0&&i===count-1;
      drawPiece(revealSvg,part,{fill:part.color,stroke:"#fff9ec",
        "stroke-width":3.5,"data-reveal-wing":part.id},
        enter?"curve-wing-enter":"");
    }
    if(count===PICTURE.pieces.length&&detailCount>0)
      drawDetails(revealSvg,detailCount,finished?0:detailCount);
    $("graphRevealStatus").textContent=finished?
      "Your "+PICTURE.name+" is complete! Real curved regions, beautiful finishing details.":
      count<PICTURE.pieces.length?
        "Mathematical wing "+count+" of "+PICTURE.pieces.length+" revealed":
        detailCount>0?
          CURVE_DETAIL_STAGES[detailCount-1].label:
          "Both real quadratic regions have been filled. Here come the finishing touches…";
    $("graphRevealTitle").textContent=finished?PICTURE.name+" ✦":
      detailCount>0?"Your butterfly is coming to life!":"Your art is coming together!";
    $("curveRevealSkip").hidden=finished;
    $("curveRevealAgain").hidden=!finished;
    $("curveDownload").hidden=!finished;
  }
  function showFinished(){
    stopReveal();revealStage(PICTURE.pieces.length,CURVE_DETAIL_STAGES.length,true);
  }
  function playReveal(){
    stopReveal();revealStage(0);
    if(win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches){
      showFinished();return;
    }
    const n=PICTURE.pieces.length,pieceMs=630,detailMs=490;
    PICTURE.pieces.forEach((_,i)=>later(()=>revealStage(i+1),pieceMs*(i+1)));
    const start=pieceMs*(n+1);
    for(const stage of CURVE_DETAIL_STAGES)
      later(()=>revealStage(n,stage.stage),start+detailMs*(stage.stage-1));
    later(showFinished,start+detailMs*CURVE_DETAIL_STAGES.length+300);
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
    const canvas=doc.createElement("canvas");canvas.width=1100;canvas.height=1100;
    const ctx=canvas.getContext?.("2d");
    if(!ctx)return;
    const blob=new Blob([xml],{type:"image/svg+xml;charset=utf-8"});
    const url=URL.createObjectURL(blob),image=new Image();
    image.onload=()=>{
      ctx.fillStyle="#fffaf0";ctx.fillRect(0,0,1100,1100);
      ctx.drawImage(image,0,0,1100,1100);URL.revokeObjectURL(url);
      const a=doc.createElement("a");a.download="inequality-ink-"+PICTURE.id+".png";
      a.href=canvas.toDataURL("image/png");a.click();
    };
    image.onerror=()=>URL.revokeObjectURL(url);
    image.src=url;
  }
  function showHint(){
    if(screen!=="play"||!current())return;
    hint=saved.done===0?
      "Try the test point (−1, 0). Check that it lies above the first parabola, below the second, and to the left of the y-axis.":
      "Try the test point (1, 0). Check both parabolas and remember that the vertical boundary is strict.";
    notify("A hint has appeared below.");
    playView();
  }
  $("curvePictureCard").addEventListener("click",()=>{
    stopFlash();selected=null;cursor={x:0,y:0};hint="";
    if(saved.done===PICTURE.pieces.length){
      saved.done=0;saved.replays++;persist();
    }
    notify("Find the common region.");setScreen("play");
  });
  $("curveBack").addEventListener("click",()=>{stopFlash();selected=null;setScreen("picker");});
  $("graphUndoFill").addEventListener("click",clearSelection);
  $("graphCheckFill").addEventListener("click",checkFill);
  $("graphHint").addEventListener("click",showHint);
  $("curveRestart").addEventListener("click",restart);
  $("curveChooseAgain").addEventListener("click",()=>setScreen("picker"));
  $("curveReplayReveal").addEventListener("click",openReveal);
  $("curveRevealClose").addEventListener("click",closeReveal);
  $("curveRevealSkip").addEventListener("click",showFinished);
  $("curveRevealAgain").addEventListener("click",playReveal);
  $("curveDownload").addEventListener("click",savePNG);
  reveal.addEventListener("cancel",e=>{e.preventDefault?.();closeReveal();});
  graph.addEventListener("click",ev=>{
    const box=graph.getBoundingClientRect();
    if(!box.width||!box.height)return;
    const sx=(ev.clientX-box.left)/box.width*SIZE;
    const sy=(ev.clientY-box.top)/box.height*SIZE;
    const x=WORLD.xmin+(sx-PAD)/GRID*(WORLD.xmax-WORLD.xmin);
    const y=WORLD.ymax-(sy-PAD)/GRID*(WORLD.ymax-WORLD.ymin);
    pickAt(x,y);
  });
  graph.addEventListener("keydown",ev=>{
    if(screen!=="play")return;
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
  setScreen("picker");
  return {pickAt,checkFill,readProgress:()=>({...saved}),render:()=>setScreen(screen),
    start:()=>{$("curvePictureCard").click();},showFinished};
}
if(typeof document!=="undefined"&&document.getElementById("curvePicker"))initCurveArt();