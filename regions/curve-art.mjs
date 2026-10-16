import {renderPieceMarkers,renderSummaryMetrics} from "./studio-ui.mjs";
import {pictureSkills,explainRegionChoice} from "./learning-guide.mjs";
import {
  WORLD,regionPaths,boundaryPoints,curvedCellAt,
  signedDifference,satisfiesAll
} from "./curved-engine.mjs";
import {
  CURVE_PICTURES,CURVE_PRACTICE_PICTURES,curveAllPictures,CURVE_STAGES,curvePicture,validateCurveGallery
} from "./curve-pictures.mjs?v=graph-advanced-v1";

const NS="http://www.w3.org/2000/svg",SIZE=620,PAD=52,GRID=SIZE-2*PAD;
const px=x=>PAD+(x-WORLD.xmin)*GRID/(WORLD.xmax-WORLD.xmin);
const py=y=>PAD+(WORLD.ymax-y)*GRID/(WORLD.ymax-WORLD.ymin);
const path=(points,close=false)=>points.map((p,i)=>
  (i?"L":"M")+px(p.x).toFixed(2)+" "+py(p.y).toFixed(2)).join(" ")+(close?" Z":"");

// Version one was the original two-wing butterfly. Never overwrite that save.
export const CURVE_SAVE_KEY="inequality-ink-curve-fill-prototype-v1";
export const CURVE_SAVE_KEY_V2="inequality-ink-curve-fill-v2";
const defaultRecord=()=>({done:0,replays:0});
function parseSave(storage,key){
  try{return JSON.parse(storage.getItem(key));}catch{return null;}
}
export function readCurveSave(storage){
  const raw=parseSave(storage,CURVE_SAVE_KEY_V2);
  const picture=curvePicture(raw?.picture)?.id||CURVE_PICTURES[0].id;
  const records={};
  for(const p of curveAllPictures){
    const r=raw?.records?.[p.id];
    if(r&&Number.isInteger(r.done)&&r.done>=0&&r.done<=p.pieces.length&&
        Number.isInteger(r.replays)&&r.replays>=0&&r.replays<=100000)
      records[p.id]={done:r.done,replays:r.replays};
  }
  // Copy first-generation progress into the named butterfly slot on first
  // reading. It is not deleted, and all subsequent saves go into v2.
  if(!records["parabola-butterfly"]){
    const legacy=parseSave(storage,CURVE_SAVE_KEY);
    if(legacy&&Number.isInteger(legacy.done)&&legacy.done>=0&&legacy.done<=2){
      records["parabola-butterfly"]={
        done:legacy.done,
        replays:Number.isInteger(legacy.replays)&&legacy.replays>=0?legacy.replays:0
      };
    }
  }
  const active=records[picture]||defaultRecord();
  return {picture,records,done:active.done,replays:active.replays};
}

export function initCurveArt({doc=document,storage=localStorage,win=window}={}){
  validateCurveGallery();
  const $=id=>doc.getElementById(id);
  const graph=$("graphArtGraph"),reveal=$("curveReveal"),revealSvg=$("graphRevealSvg");
  const start=readCurveSave(storage);
  let saved={picture:start.picture,records:start.records};
  const params=new URLSearchParams(win.location?.search||"");
  const requestedPicture=params.get("picture");
  const linkedPicture=curvePicture(requestedPicture)?.id||null;
  const fromMystery=params.get("from")==="mystery";
  function returnToHub(id=saved.picture){
    if(!linkedPicture||typeof win.location?.assign!=="function")return false;
    // Mystery-first journeys return to the selected difficulty, without
    // exposing another picture or accidentally turning on manual gallery mode.
    const query=fromMystery?"./?mode=curve&tier="+picture().step:
      "./?mode=curve&picture="+encodeURIComponent(id);
    win.location.assign(query);
    return true;
  }
  let screen="picker",selected=null,flash=null,why=null,cursor={x:0,y:0},
    message="",status="",hint="",hintStage=0,hintKey="",flashTimer=null,revealTimers=[];

  function picture(){return curvePicture(saved.picture);}
  function record(){
    if(!saved.records[saved.picture])saved.records[saved.picture]=defaultRecord();
    return saved.records[saved.picture];
  }
  function current(){return picture().pieces[record().done]||null;}
  function persist(){
    try{storage.setItem(CURVE_SAVE_KEY_V2,JSON.stringify(saved));}catch{}
  }
  function notify(text,type=""){message=text;status=type;}
  function setWhy(value){
    why=value;
    $("graphWhy").open=false;
  }
  function el(svg,tag,attrs={}){
    const node=doc.createElementNS(NS,tag);
    for(const [k,v]of Object.entries(attrs))node.setAttribute(k,String(v));
    svg.append(node);return node;
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
        label(svg,px(n),py(0)+18,String(n).replace("-","−"),
          {"font-size":13,"text-anchor":"middle",fill:"#8596a2"});
        label(svg,px(0)-12,py(n)+5,String(n).replace("-","−"),
          {"font-size":13,"text-anchor":"end",fill:"#8596a2"});
      }
    }
    label(svg,px(5)-8,py(0)-10,"x",{"font-size":17,fill:"#546f80"});
    label(svg,px(0)+11,py(5)+22,"y",{"font-size":17,fill:"#546f80"});
  }
  function drawPaths(svg,paths,attrs={},className=""){
    for(const pts of paths){
      const node=el(svg,"path",{d:path(pts,true),"pointer-events":"none",...attrs});
      if(className)node.classList?.add(className);
    }
  }
  function drawPiece(svg,part,attrs={},className=""){
    drawPaths(svg,regionPaths(part.rules),attrs,className);
  }
  function drawDetails(svg,p,maxStage=Infinity,enterStage=0){
    const unit=GRID/(WORLD.xmax-WORLD.xmin);
    for(const d of p.details||[]){
      if(d.stage>maxStage)continue;
      const props={"data-curve-detail":d.id,"data-detail-stage":d.stage,
        "pointer-events":"none"};
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
  function miniature(svg,p,progress){
    baseGraph(svg,{grid:false});
    for(const [i,part]of p.pieces.entries()){
      const painted=i<progress;
      // Like Find & Fill: a small early clue, not a spoiled completed image.
      const visible=painted||i<Math.min(2,p.pieces.length);
      drawPiece(svg,part,{
        fill:painted?part.color:"#bfcac7",
        "fill-opacity":painted?1:visible?.22:.075,
        stroke:painted?"#fff9ee":"#bfcac7",
        "stroke-dasharray":painted?"":"9 7","stroke-width":painted?3:1.5
      });
    }
    if(progress===p.pieces.length)drawDetails(svg,p);
  }
  function pickerView(){
    const completed=CURVE_PICTURES.filter(p=>
      saved.records[p.id]?.done===p.pieces.length).length;
    const recommended=CURVE_PICTURES.find(p=>
      saved.records[p.id]?.done!==p.pieces.length)||CURVE_PICTURES[4];
    $("curveGalleryProgress").textContent=completed+" of 5 completed · "+
      (completed===5?"All five stages complete!":"Next up: "+recommended.stage);
    const stages=$("curveStageTrack");stages.replaceChildren();
    for(const p of CURVE_PICTURES){
      const done=saved.records[p.id]?.done||0;
      const finished=done===p.pieces.length;
      const item=doc.createElement("div");
      item.className="graph-step-node"+
        (finished?" is-complete":"")+
        (p.id===recommended.id?" is-recommended":"");
      item.setAttribute("aria-label",p.stage+", "+
        (finished?"complete":done+" of "+p.pieces.length+" pieces"));
      const dot=doc.createElement("span");
      dot.className="graph-step-number";dot.textContent=finished?"✓":String(p.step);
      const caption=doc.createElement("span");
      caption.textContent=p.stage;
      item.append(dot,caption);stages.append(item);
    }
    const cards=$("curvePictureCards");cards.replaceChildren();
    const practiceCards=$("curvePracticeCards");practiceCards.replaceChildren();
    for(const p of curveAllPictures){
      const r=saved.records[p.id]||defaultRecord();
      const finished=r.done===p.pieces.length;
      const card=doc.createElement("button");
      card.type="button";card.className="graph-picture-card"+
        (finished?" is-complete":"")+
        (!p.practice&&p.id===recommended.id?" is-recommended":"");
      card.setAttribute("aria-label",finished?
        "View completed picture: "+p.name+", "+p.stage:
        (r.done?"Continue picture: ":"Start picture: ")+p.clue+", "+p.stage+
        ", "+r.done+" of "+p.pieces.length+" pieces completed");
      card.setAttribute("data-curve-picture",p.id);
      const svg=doc.createElementNS(NS,"svg");
      svg.setAttribute("viewBox","0 0 620 620");
      svg.setAttribute("aria-hidden","true");
      miniature(svg,p,r.done);
      const info=doc.createElement("span");info.className="graph-picture-info";
      const stage=doc.createElement("span");
      stage.className="graph-stage";
      stage.textContent=(p.practice?"PRACTISE · ":p.step+" · ")+p.stage.toUpperCase()+" · "+p.pieces.length+" pieces";
      const name=doc.createElement("strong");
      name.textContent=finished?p.name:p.clue;
      const description=doc.createElement("small");
      description.textContent=p.description;
      const focus=doc.createElement("span");
      focus.className="graph-card-maths";focus.textContent=pictureSkills(p,"curve").slice(0,3).join(" · ");
      const progress=doc.createElement("span");progress.className="graph-card-progress";
      const bar=doc.createElement("span");
      bar.style.width=(100*r.done/p.pieces.length)+"%";
      progress.append(bar);
      const go=doc.createElement("span");go.className="graph-card-go";
      go.textContent=finished?"✓ Completed · View picture →":
        r.done?"Continue picture →":"Start picture →";
      info.append(stage,name,description,focus,progress,go);
      card.append(svg,info);
      card.addEventListener("click",()=>choosePicture(p.id));
      (p.practice?practiceCards:cards).append(card);
    }
  }
  function choosePicture(id){
    const p=curvePicture(id);if(!p)return;
    stopFlash();stopReveal();
    saved.picture=p.id;
    const finished=record().done===p.pieces.length;
    persist();selected=null;setWhy(null);hint="";hintStage=0;hintKey="";cursor={x:0,y:0};
    if(finished){setScreen("summary");openReveal();}
    else{notify("Find the common region.");setScreen("play");}
  }
  function draw(){
    baseGraph(graph);
    const p=picture(),r=record();
    for(let i=0;i<r.done;i++){
      const f=p.pieces[i];
      drawPiece(graph,f,{fill:f.color,stroke:"#fff9ec","stroke-width":3,
        "data-region-layer":"finished-"+f.id});
    }
    const part=current();
    if(!part)return;
    drawBoundaries(graph,part);
    if(selected)drawPaths(graph,selected.paths,{
      fill:part.color,"fill-opacity":.52,stroke:part.color,"stroke-width":2,
      "data-region-layer":"selection"},"graph-good-flash");
    if(flash)drawPaths(graph,flash.paths,{
      fill:"#e65d65","fill-opacity":.55,stroke:"#ca343e","stroke-width":3,
      "data-region-layer":"wrong"},"graph-wrong-flash");
    el(graph,"circle",{cx:px(cursor.x),cy:py(cursor.y),r:7,
      fill:"none",stroke:"#408c7c","stroke-width":2,
      "stroke-dasharray":"3 2","pointer-events":"none"});
    graph.setAttribute("aria-label","Coordinate graph. "+r.done+
      " completed pieces. Use the arrow keys to move and Enter to fill the region under the keyboard cursor.");
  }
  function playView(){
    const p=picture(),r=record(),part=current();
    if(!part){setScreen("summary");return;}
    $("curveGameMode").textContent="CURVE & FILL · STEP "+p.step+" · "+p.stage.toUpperCase();
    $("curveGameTitle").textContent=p.name;
    $("curveGameFocus").textContent=p.focus;
    $("graphPieceCount").textContent="Piece "+(r.done+1)+" of "+p.pieces.length;
    $("graphCanvasCount").textContent=r.done+" / "+p.pieces.length;
    $("graphProgressFill").style.width=(100*r.done/p.pieces.length)+"%";
    renderPieceMarkers($("curvePieceMarkers"),doc,p.pieces.length,r.done);
    $("graphProgress").setAttribute("aria-valuenow",String(Math.round(100*r.done/p.pieces.length)));
    $("graphTaskKicker").textContent="PIECE "+(r.done+1)+" OF "+p.pieces.length;
    $("graphTaskTitle").textContent=part.name;
    $("graphPieceSwatch").style.background=part.color;
    $("graphRuleCount").textContent=part.rules.length+
      (part.rules.length===1?" inequality":" inequalities");
    const holder=$("graphRuleList");holder.replaceChildren();
    for(const rr of part.rules){
      const item=doc.createElement("div");
      item.className="graph-rule-item";
      const equation=doc.createElement("span");equation.textContent=rr.text;
      const state=doc.createElement("span");state.className="rule-state";
      state.textContent="AND";item.append(equation,state);holder.append(item);
    }
    $("graphFeedback").textContent=message||
      "Tap the region where all inequalities are true.";
    $("graphFeedback").className="graph-feedback"+(status?" "+status:"");
    $("graphWhy").hidden=!why;
    $("graphWhyText").textContent=why?.text||"";
    $("graphHintText").textContent=hint;
    $("graphHintText").hidden=!hint;
    const scope=saved.picture+":"+r.done;
    const stage=scope===hintKey?hintStage:0;
    $("graphHint").textContent=stage>=3?"✳ All hints shown":
      stage?"✳ More help ("+(stage+1)+"/3)":"✳ Give me a hint";
    $("graphHint").disabled=stage>=3;
    draw();
  }
  function summaryView(){
    const p=picture();
    $("curveSummaryTitle").textContent=p.name;
    $("curveSummaryText").textContent=
      "You created "+p.pieces.length+" coloured shapes by finding the intersection of their curved inequalities.";
    const boundaries=p.pieces.reduce((n,part)=>n+part.rules.length,0);
    $("curveSummaryStats").textContent=p.pieces.length+" regions · "+boundaries+
      " inequalities · "+p.stage;
    const art=$("curveSummaryArt");
    baseGraph(art,{grid:false});
    for(const part of p.pieces)
      drawPiece(art,part,{fill:part.color,stroke:"#fff9ec",
        "stroke-width":3.5,"pointer-events":"none"});
    drawDetails(art,p);
    art.setAttribute("aria-label","Completed curved inequality art: "+p.name);
    renderSummaryMetrics($("curveSummaryMetrics"),doc,[
      {value:p.pieces.length,label:"Picture pieces"},
      {value:boundaries,label:"Inequalities"},
      {value:p.step+" / 5",label:"Stage complete"}
    ]);
    $("curveNextPicture").hidden=!fromMystery&&
      (!!p.practice||p.step===CURVE_PICTURES.length);
    if(fromMystery)$("curveNextPicture").textContent="Explore more challenges →";
  }
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
    if(flashTimer!==null){
      win.clearTimeout?.(flashTimer);flashTimer=null;
    }
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
      setWhy(explainRegionChoice(current().rules,{x,y}));
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
    setWhy(selected?explainRegionChoice(current().rules,{x,y}):null);
    notify(selected?"Region filled. Press Check when you are ready.":
      "Fill removed. Choose a region again.");
    playView();
  }
  function clearSelection(){
    stopFlash();selected=null;setWhy(null);
    notify("Fill cleared. Choose a region.");
    if(screen==="play")playView();
  }
  function checkFill(){
    if(screen!=="play"||!current())return;
    if(!selected){
      notify("First fill the region satisfying all the inequalities.","error");
      playView();return;
    }
    if(!selected.correct){
      notify("Check which inequalities are true.","error");
      playView();return;
    }
    record().done++;
    persist();selected=null;setWhy(null);stopFlash();cursor={x:0,y:0};hint="";
    if(!current()){
      setScreen("summary");openReveal();
    }else{
      notify("Beautiful! That mathematical shape is now part of your picture.","success");
      playView();
    }
  }
  function restart(){
    if(typeof win.confirm==="function"&&!win.confirm(
      "Restart this picture? Only this picture's progress will be reset."))return;
    stopFlash();stopReveal();
    record().done=0;record().replays++;
    persist();selected=null;setWhy(null);cursor={x:0,y:0};hint="";hintStage=0;hintKey="";
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
    const p=picture(),n=p.pieces.length;
    baseGraph(revealSvg,{grid:false});
    for(const [i,part]of p.pieces.slice(0,count).entries()){
      const enter=!finished&&detailCount===0&&i===count-1;
      drawPiece(revealSvg,part,{
        fill:part.color,stroke:"#fff9ec","stroke-width":3.5,
        "data-reveal-wing":part.id},
        enter?"curve-piece-enter":"");
    }
    if(count===n&&detailCount>0)
      drawDetails(revealSvg,p,detailCount,finished?0:detailCount);
    $("graphRevealStatus").textContent=finished?
      "Your "+p.name+" is complete! Every coloured region is a real intersection of its inequalities.":
      count<n?"Mathematical shape "+count+" of "+n+" revealed":
      detailCount===0?"All the curved regions are complete. Finishing touches are appearing…":
      ["Patterns and highlights are appearing…",
       "More details are taking shape…",
       "Final touches bring your artwork to life…"][detailCount-1];
    $("graphRevealTitle").textContent=finished?p.name+" ✦":
      detailCount>0?"Your picture is coming to life!":"Your art is coming together!";
    $("curveRevealSkip").hidden=finished;
    $("curveRevealAgain").hidden=!finished;
    $("curveDownload").hidden=!finished;
    revealSvg.setAttribute("aria-label",count===n?
      "Curved inequality art: "+p.name:"Curved mathematical picture in progress");
  }
  function showFinished(){
    stopReveal();revealStage(picture().pieces.length,3,true);
  }
  function playReveal(){
    stopReveal();revealStage(0);
    if(win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches){
      showFinished();return;
    }
    const p=picture(),n=p.pieces.length;
    const pieceMs=n>5?450:580,detailMs=420;
    p.pieces.forEach((_,i)=>later(()=>revealStage(i+1),pieceMs*(i+1)));
    const start=pieceMs*(n+1);
    for(let stage=1;stage<=3;stage++)
      later(()=>revealStage(n,stage),start+detailMs*(stage-1));
    later(showFinished,start+detailMs*3+150);
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
    const ctx=canvas.getContext?.("2d");if(!ctx)return;
    const blob=new Blob([xml],{type:"image/svg+xml;charset=utf-8"});
    const url=URL.createObjectURL(blob),image=new Image();
    image.onload=()=>{
      ctx.fillStyle="#fffaf0";ctx.fillRect(0,0,1100,1100);
      ctx.drawImage(image,0,0,1100,1100);URL.revokeObjectURL(url);
      const a=doc.createElement("a");
      a.download="inequality-ink-"+picture().id+".png";
      a.href=canvas.toDataURL("image/png");a.click();
    };
    image.onerror=()=>URL.revokeObjectURL(url);
    image.src=url;
  }
  function hintPoint(part){
    const candidates=[];
    for(let x=-4.5;x<=4.5;x+=.5)for(let y=-4.5;y<=4.5;y+=.5){
      if(satisfiesAll(part.rules,x,y)){
        const score=Math.min(...part.rules.map(r=>{
          if(r.kind==="circle")
            return Math.abs(Math.hypot(x-r.cx,y-r.cy)-r.r);
          return Math.abs(signedDifference(r,x,y))/
            (r.kind==="vertical"?1:Math.abs(r.a||0)+1);
        }));
        candidates.push({x,y,score});
      }
    }
    candidates.sort((a,b)=>b.score-a.score);
    return candidates[0]||null;
  }
  function showHint(){
    if(screen!=="play"||!current())return;
    const part=current(),scope=saved.picture+":"+record().done;
    if(hintKey!==scope){hintKey=scope;hintStage=0;}
    hintStage=Math.min(3,hintStage+1);
    if(hintStage===1){
      hint="Look at each curved boundary in turn. Decide where the inequality is true before finding the overlap.";
    }else if(hintStage===2){
      hint="Start with "+part.rules[0].text+". Choose a simple point away from the curve and substitute its coordinates.";
    }else{
      const point=hintPoint(part);
      hint=point?"The point ("+point.x+", "+point.y+
        ") satisfies every displayed inequality. Fill the curved region containing it.":
        "Test a point away from all boundaries, and keep only a region where every inequality is true.";
    }
    notify("Hint "+hintStage+" of 3 is shown below.");playView();
  }

  $("curveBack").addEventListener("click",()=>{
    stopFlash();stopReveal();selected=null;
    if(!returnToHub())setScreen("picker");
  });
  $("graphUndoFill").addEventListener("click",clearSelection);
  $("graphCheckFill").addEventListener("click",checkFill);
  $("graphHint").addEventListener("click",showHint);
  $("curveRestart").addEventListener("click",restart);
  $("curveRestartPlaying").addEventListener("click",restart);
  $("curveChooseAgain").addEventListener("click",()=>{
    if(!returnToHub())setScreen("picker");
  });
  $("curveNextPicture").addEventListener("click",()=>{
    const next=CURVE_PICTURES[picture().step];
    if(!returnToHub(next?.id||saved.picture))setScreen("picker");
  });
  $("curveReplayReveal").addEventListener("click",openReveal);
  $("curveRevealClose").addEventListener("click",closeReveal);
  $("curveRevealSkip").addEventListener("click",showFinished);
  $("curveRevealAgain").addEventListener("click",playReveal);
  $("curveDownload").addEventListener("click",savePNG);
  $("curveSavePicture").addEventListener("click",()=>{showFinished();savePNG();});
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
  if(linkedPicture)choosePicture(linkedPicture);
  return {pickAt,checkFill,readProgress:()=>({
      ...saved,records:{...saved.records},done:record().done,replays:record().replays
    }),render:()=>setScreen(screen),choose:choosePicture,
    start:()=>choosePicture(saved.picture),showFinished};
}
if(typeof document!=="undefined"&&document.getElementById("curvePicker")){
  const params=new URLSearchParams(window.location?.search||"");
  // Old page links now open the unified difficulty-first Graph Art chooser.
  // Direct picture bookmarks and an explicit ?gallery=1 retain the older gallery.
  if(!params.has("picture")&&!params.has("gallery")&&
     typeof window.location?.replace==="function"){
    const tier=Number(params.get("tier"));
    window.location.replace("./?mode=curve"+
      (Number.isInteger(tier)&&tier>=1&&tier<=5?"&tier="+tier:""));
  }else initCurveArt();
}