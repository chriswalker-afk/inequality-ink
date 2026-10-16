import {rememberGraphMuralDiscoveries} from "./graph-mural-model.mjs";
import {renderPieceMarkers,renderSummaryMetrics} from "./studio-ui.mjs";
import {pictureSkills,explainRegionChoice} from "./learning-guide.mjs";
import {
  REGION_WORLD,intersectRegion,lineOnRegionGraph,regionSide,regionSideOptions,
  regionBoundaryStyle,regionCorrect,regionHint,pointSatisfiesAll
} from "./regions-engine.mjs";
import {
  GRAPH_ART_PICTURES,GRAPH_PRACTICE_PICTURES,GRAPH_ART_MODES,GRAPH_ART_STAGES,
  GRAPH_ART_DETAIL_COLORS,GRAPH_ART_SAVE_KEY,GRAPH_ART_LEGACY_SAVE_KEY,
  graphPicture,graphModeGallery,graphPracticeGallery,graphLegacyExtras,graphTotalBoundaries,reverseInequalityOptions,
  graphCellAt,graphArrow,validateGraphPictureLibrary
} from "./graph-art-pictures.mjs?v=graph-mural-v1";
import {CURVE_PICTURES,CURVE_PRACTICE_PICTURES} from "./curve-pictures.mjs?v=graph-advanced-v1";
import {PLOT_PICTURES,PLOT_PRACTICE_PICTURES} from "./plot-pictures.mjs?v=graph-advanced-v1";
import {regionPaths} from "./curved-engine.mjs";
import {readCurveSave} from "./curve-art.mjs?v=graph-advanced-v1";
import {readPlotSave} from "./plot-art.mjs?v=graph-advanced-v1";
import {
  GRAPH_MYSTERY_LEVELS,graphMysteryPool,graphMysteryStatus,
  graphMysteryFinished,graphMysteryStarted,graphPickMystery,
  graphContinueMystery,readGraphMysteryTiers,saveGraphMysteryTiers
} from "./graph-mysteries.mjs";

const NS="http://www.w3.org/2000/svg",SIZE=620,PAD=52,GRID=SIZE-2*PAD;
const px=x=>PAD+(x-REGION_WORLD.xmin)*GRID/(REGION_WORLD.xmax-REGION_WORLD.xmin);
const py=y=>PAD+(REGION_WORLD.ymax-y)*GRID/(REGION_WORLD.ymax-REGION_WORLD.ymin);
const path=points=>points.map((p,i)=>(i?"L":"M")+px(p.x).toFixed(2)+" "+py(p.y).toFixed(2)).join(" ")+" Z";
const blank=()=>({done:0,line:0,replays:0});
const key=(mode,id)=>mode+":"+id;
const clean=()=>({mode:"fill",picture:"signal-flag",records:{}});
const number=n=>Number.isInteger(n)&&n>=0&&n<=10000;
const validRecord=(r,p)=>r&&number(r.done)&&r.done<=p.pieces.length&&number(r.line)&&
  // The final answered boundary remains on screen until the student chooses
  // Next piece. Preserve that state if the page is reloaded.
  (r.done===p.pieces.length?r.line===0:r.line<=p.pieces[r.done].rules.length)&&
  number(r.replays);
export function readGraphArtSave(storage){
  let raw;
  try{raw=JSON.parse(storage.getItem(GRAPH_ART_SAVE_KEY));}catch{return clean();}
  if(!raw||typeof raw!=="object")return clean();
  const output=clean();
  if(GRAPH_ART_MODES.some(m=>m.id===raw.mode))output.mode=raw.mode;
  if(graphPicture(raw.picture))output.picture=raw.picture;
  for(const mode of GRAPH_ART_MODES)for(const p of [...GRAPH_ART_PICTURES,...GRAPH_PRACTICE_PICTURES]){
    const id=key(mode.id,p.id),record=raw.records?.[id];
    if(validRecord(record,p)){
      output.records[id]={
        done:record.done,
        line:mode.id==="build"?record.line:0,
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
function decorationStages(p){
  return Array.isArray(p.details)?p.details.reduce((n,d)=>Math.max(n,d.stage+1),0):1;
}
function decorations(doc,svg,p,stages=Infinity){
  if(stages<=0)return;
  if(Array.isArray(p.details)){
    const unit=GRID/(REGION_WORLD.xmax-REGION_WORLD.xmin);
    for(const d of p.details){
      if(d.stage>=stages)continue;
      if(d.type==="line"){
        const points={x1:px(d.x1),y1:py(d.y1),
          x2:px(d.x2),y2:py(d.y2)};
        const width=Math.max(2,d.width*unit);
        // The narrow dark under-stroke keeps pale snowcaps legible on green
        // mountains and on the near-white canvas.
        if(d.outline)el(doc,"line",{...points,stroke:d.outline,
          "stroke-width":width+3,"stroke-linecap":"round",
          "pointer-events":"none"},svg);
        el(doc,"line",{...points,stroke:d.color,"stroke-width":width,
          "stroke-linecap":"round","pointer-events":"none"},svg);
      }else if(d.type==="circle"||d.type==="ellipse"){
        el(doc,"ellipse",{cx:px(d.x),cy:py(d.y),
          rx:(d.rx??d.r)*unit,ry:(d.ry??d.r)*unit,
          fill:d.color,"pointer-events":"none"},svg);
      }else if(d.type==="rect"){
        el(doc,"rect",{x:px(d.x),y:py(d.y+d.h),
          width:d.w*unit,height:d.h*unit,rx:4,fill:d.color,
          ...(d.outline?{stroke:d.outline,"stroke-width":2.5}:{}),
          "pointer-events":"none"},svg);
      }else if(d.type==="star"){
        const nodes=[];
        for(let i=0;i<10;i++){
          const r=d.r*(i%2?.42:1);
          const theta=-Math.PI/2+i*Math.PI/5;
          nodes.push([px(d.x+Math.cos(theta)*r),py(d.y+Math.sin(theta)*r)]);
        }
        el(doc,"polygon",{points:nodes.map(pair=>pair.join(",")).join(" "),
          fill:d.color,
          ...(d.outline?{stroke:d.outline,"stroke-width":2.5,
            "stroke-linejoin":"round"}:{}),
          "pointer-events":"none"},svg);
      }
    }
    return;
  }
  if(p.details==="house"){
    const rectangle=(x1,y1,x2,y2,fill,attrs={})=>
      el(doc,"rect",{x:px(x1),y:py(y2),width:px(x2)-px(x1),
        height:py(y1)-py(y2),rx:3,fill,...attrs},svg);
    for(const x of [-1.72,1.03]){
      rectangle(x,-.65,x+.7,.1,"#b9dfe5",{
        stroke:GRAPH_ART_DETAIL_COLORS.deepTeal,"stroke-width":3});
      el(doc,"line",{x1:px(x+.35),y1:py(-.65),x2:px(x+.35),y2:py(.1),
        stroke:GRAPH_ART_DETAIL_COLORS.deepTeal,"stroke-width":2},svg);
    }
    el(doc,"circle",{cx:px(.47),cy:py(-2.13),r:4,fill:"#f7e7a5"},svg);
    textSvg(doc,svg,px(3.4),py(3.4),"✦",{"text-anchor":"middle",
      "font-size":32,fill:GRAPH_ART_DETAIL_COLORS.gold},svg);
  }else{
    for(const [x,y] of [[-3.9,4.1],[3.8,3.7],[-3.4,-4.2]]){
      textSvg(doc,svg,px(x),py(y),"✧",{"font-size":25,"text-anchor":"middle",
        fill:GRAPH_ART_DETAIL_COLORS.terracotta});
    }
    el(doc,"circle",{cx:px(0),cy:py(0),r:9,fill:"#f5e3be","fill-opacity":.65},svg);
  }
}
export function initRegionsApp({doc=document,storage=localStorage,win=window}={}){
  validateGraphPictureLibrary();
  const $=id=>doc.getElementById(id);
  const graph=$("graphArtGraph"),reveal=$("graphReveal"),revealSvg=$("graphRevealSvg");
  let saved=readGraphArtSave(storage),screen="picker",choiceSide=null,
    choiceStyle=null,selected=null,flash=null,why=null,message="",status="",hint="",
    hintStage=0,hintKey="",revealTimers=[],cursor={x:0,y:0},activeReveal=false,
    pendingPieceTimer=null,lastAddedArrow=null,buildRevealPhase="idle";
  const HUB_MODES=[
    {id:"fill",button:"graphModeFill",description:"Read all the inequalities, then fill the region they share."},
    {id:"build",button:"graphModeBuild",description:"Choose the side and the boundary style of each inequality; watch their overlap appear."},
    {id:"curve",button:"graphModeCurve",description:"Find the region common to parabolas, circles and other curved boundaries."},
    {id:"plot",button:"graphModePlot",description:"Plot each missing line or curve before deciding its style and shading."}
  ];
  const requestedMode=new URLSearchParams(win.location?.search||"").get("mode");
  let hubMode=HUB_MODES.some(m=>m.id===requestedMode)?requestedMode:saved.mode;
  const hubSelections={},hubManual={};
  const hubTiers=readGraphMysteryTiers(storage);
  const params=new URLSearchParams(win.location?.search||"");
  const requestedPicture=params.get("picture"),requestedTier=Number(params.get("tier"));
  if(Number.isInteger(requestedTier)&&requestedTier>=1&&requestedTier<=5)
    hubTiers[hubMode]=requestedTier;
  if(requestedPicture&&hubGalleryAvailable(hubMode,requestedPicture)){
    hubSelections[hubMode]=requestedPicture;
    hubManual[hubMode]=true;
    const linked=[...(hubMode==="curve"?CURVE_PICTURES:hubMode==="plot"?PLOT_PICTURES:
      graphModeGallery(hubMode)),...(hubMode==="curve"?CURVE_PRACTICE_PICTURES:
      hubMode==="plot"?PLOT_PRACTICE_PICTURES:graphPracticeGallery(hubMode))].
      find(p=>p.id===requestedPicture);
    if(linked)hubTiers[hubMode]=linked.step;
  }
  function hubGalleryAvailable(m,id){
    return [...(m==="curve"?CURVE_PICTURES:m==="plot"?PLOT_PICTURES:
      graphModeGallery(m)),
      ...(m==="curve"?CURVE_PRACTICE_PICTURES:m==="plot"?PLOT_PRACTICE_PICTURES:
        graphPracticeGallery(m))].some(p=>p.id===id)||
      ((m==="fill"||m==="build")&&
        graphLegacyExtras(m,saved.records).some(p=>p.id===id));
  }
  function persist(){try{storage.setItem(GRAPH_ART_SAVE_KEY,JSON.stringify(saved));}catch{}}
  function picture(){return graphPicture(saved.picture);}
  function mode(){return saved.mode;}
  function isReverse(){return mode()==="build"&&picture()?.practiceType==="reverse";}
  function record(){
    const k=key(mode(),saved.picture);
    if(!saved.records[k])saved.records[k]=blank();
    return saved.records[k];
  }
  function current(){return picture().pieces[record().done]||null;}
  function rule(){return current()?.rules[record().line]||null;}
  function notify(s,type=""){message=s;status=type;}
  function setWhy(value){
    why=value;
    // An attempt never opens an explanation by itself.
    $("graphWhy").open=false;
  }
  function resetChoices(){
    choiceSide=null;choiceStyle=null;selected=null;hint="";setWhy(null);
    hintStage=0;hintKey="";
    lastAddedArrow=null;
  }
  function setScreen(next){
    screen=next;
    $("graphPicker").hidden=next!=="picker";
    $("graphPlay").hidden=next!=="play";
    $("graphSummary").hidden=next!=="summary";
    $("how-graph-art-works").hidden=next==="play";
    if(next==="picker")pickerView();
    if(next==="play"){
      // A saved finished boundary resumes on its review, while selecting a
      // different, unfinished picture must restore fully working controls.
      const p=current();
      buildRevealPhase=mode()==="build"&&p&&
        record().line===p.rules.length?"ready":"idle";
      playView();
    }
    if(next==="summary")summaryView();
  }
  function miniature(svg,p,progress=0){
    baseGraph(svg,doc,{grid:false});
    p.pieces.forEach((f,i)=>{
      const painted=i<progress;
      const visible=painted||i<Math.min(2,p.pieces.length);
      polygon(svg,doc,intersectRegion(f.rules),{
        fill:painted?f.color:"#bfcac7",
        "fill-opacity":painted?1:visible?.22:.075,
        stroke:painted?"#fff9ee":"#bfcac7",
        "stroke-dasharray":painted?"":"9 7","stroke-width":3
      });
    });
    if(progress===p.pieces.length)decorations(doc,svg,p);
  }
  // The hub lets all four modes share a single three-decision starting screen.
  // Each activity still owns its own independent save data and mathematical code.
  function hubGallery(m){
    return m==="curve"?CURVE_PICTURES:
      m==="plot"?PLOT_PICTURES:graphModeGallery(m);
  }
  function hubPracticeGallery(m){
    return m==="curve"?CURVE_PRACTICE_PICTURES:
      m==="plot"?PLOT_PRACTICE_PICTURES:graphPracticeGallery(m);
  }
  function hubRecord(m,p,curve,plot){
    if(m==="curve")return curve.records[p.id]||{done:0,replays:0};
    if(m==="plot")return plot.records[p.id]||{done:0,replays:0};
    return saved.records[key(m,p.id)]||blank();
  }
  function hubMiniature(svg,p,done,m){
    if(m==="fill"||m==="build"){miniature(svg,p,done);return;}
    baseGraph(svg,doc,{grid:false});
    p.pieces.forEach((part,i)=>{
      const painted=i<done;
      for(const points of regionPaths(part.rules,undefined,125))
        polygon(svg,doc,points,{
          fill:painted?part.color:"#c1cfca",
          "fill-opacity":painted?1:i<2?.22:.055,
          stroke:painted?"#fff9eb":"#b3c2bc",
          "stroke-dasharray":painted?"":"9 7",
          "stroke-width":painted?3:1.7
        });
    });
    if(done===p.pieces.length){
      const scale=GRID/(REGION_WORLD.xmax-REGION_WORLD.xmin);
      for(const d of p.details||[]){
        const common={"pointer-events":"none"};
        if(d.type==="circle"||d.type==="ellipse"){
          const attrs={...common,cx:px(d.x),cy:py(d.y),fill:d.fill,
            stroke:d.stroke||"none","stroke-width":(d.width||.04)*scale};
          if(d.type==="circle")el(doc,"circle",{...attrs,r:d.r*scale},svg);
          else el(doc,"ellipse",{...attrs,rx:d.rx*scale,ry:d.ry*scale},svg);
        }else if(d.type==="curve"){
          el(doc,"path",{...common,d:"M"+px(d.x1)+" "+py(d.y1)+
            " Q"+px(d.cx)+" "+py(d.cy)+" "+px(d.x2)+" "+py(d.y2),
            fill:"none",stroke:d.stroke,"stroke-width":(d.width||.04)*scale,
            "stroke-linecap":"round","stroke-linejoin":"round"},svg);
        }else if(d.type==="star"){
          const vertices=Array.from({length:10},(_,i)=>{
            const r=d.r*(i%2?.42:1),a=-Math.PI/2+i*Math.PI/5;
            return px(d.x+Math.cos(a)*r)+","+py(d.y+Math.sin(a)*r);
          }).join(" ");
          el(doc,"polygon",{...common,points:vertices,fill:d.fill,
            stroke:d.stroke||"none","stroke-width":(d.width||.04)*scale},svg);
        }
      }
    }
  }
  function updateHubPreview(p,m,r){
    const done=r.done||0,finished=done===p.pieces.length;
    const selected=p.clue||p.name;
    const label=finished?p.name:selected;
    $("graphPreviewStage").textContent=p.step+" · "+p.stage;
    $("graphPreviewName").textContent=label;
    $("graphPreviewFocus").textContent=p.focus||p.description;
    $("graphPreviewSkills").textContent="Skills · "+pictureSkills(p,m).join(" · ");
    const pending=m==="build"&&done<p.pieces.length&&
      r.line===p.pieces[done].rules.length;
    const stages=finished?"✓ Completed — revisit your artwork":
      pending?"Ready to review the finished region":
      done?done+" of "+p.pieces.length+" pieces complete · Continue where you left off":
      p.step===1?"Quick win · Ready to start":"Not started · Pick any stage";
    $("graphPreviewProgress").textContent=stages;
    $("graphStartPicture").textContent=finished?"View completed picture ↗":
      done||r.line?"Continue picture ↗":"Start picture ↗";
    $("graphPreviewSvg").setAttribute("aria-label",
      "Mathematical preview of "+label+", "+done+" of "+p.pieces.length+" pieces complete");
    hubMiniature($("graphPreviewSvg"),p,done,m);
  }
  function allHubPictures(m,includeLegacy=false){
    return [...hubGallery(m),...hubPracticeGallery(m),
      ...(includeLegacy&&(m==="fill"||m==="build")?
        graphLegacyExtras(m,saved.records):[])];
  }
  function hubTierFor(m,records=null){
    if(hubTiers[m])return hubTiers[m];
    const curve=records?.curve||readCurveSave(storage);
    const plot=records?.plot||readPlotSave(storage);
    // New same-difficulty pictures count too: a pupil who completed the old
    // five-stage path should still be offered their unexplored starter art.
    const next=GRAPH_MYSTERY_LEVELS.find(level=>{
      const pool=graphMysteryPool(m,level.step,hubGallery(m),hubPracticeGallery(m));
      return graphMysteryStatus(pool,p=>hubRecord(m,p,curve,plot)).remaining>0;
    });
    hubTiers[m]=next?.step||5;
    return hubTiers[m];
  }
  function currentHubRecord(p){
    return hubRecord(hubMode,p,readCurveSave(storage),readPlotSave(storage));
  }
  function currentMysteryPool(){
    return graphMysteryPool(hubMode,hubTierFor(hubMode),
      hubGallery(hubMode),hubPracticeGallery(hubMode));
  }
  function syncHubUrl(){
    try{
      if(win.history?.replaceState&&win.location){
        const url=new URL(win.location.href);
        url.searchParams.set("mode",hubMode);
        url.searchParams.set("tier",String(hubTierFor(hubMode)));
        if(hubManual[hubMode]&&hubSelections[hubMode])
          url.searchParams.set("picture",hubSelections[hubMode]);
        else url.searchParams.delete("picture");
        win.history.replaceState(null,"",url.pathname+url.search+url.hash);
      }
    }catch{}
  }
  function launchHubPicture(p,{fromMystery=false}={}){
    if(!p)return;
    hubSelections[hubMode]=p.id;
    if(hubMode==="curve"||hubMode==="plot"){
      const url="./"+(hubMode==="curve"?"curve.html":"plot.html")+
        "?picture="+encodeURIComponent(p.id)+
        (fromMystery?"&from=mystery&tier="+p.step:"");
      if(typeof win.location?.assign==="function")win.location.assign(url);
      else if(win.location)win.location.href=url;
    }else choosePicture(p.id,hubMode);
  }
  function startHubPicture(){
    const requested=hubManual[hubMode]&&hubSelections[hubMode]?
      allHubPictures(hubMode,true).find(p=>p.id===hubSelections[hubMode]):null;
    const p=requested||graphPickMystery(currentMysteryPool(),currentHubRecord);
    if(!p){pickerView();return;}
    launchHubPicture(p,{fromMystery:!requested});
  }
  function continueHubMystery(){
    const p=graphContinueMystery(currentMysteryPool(),currentHubRecord);
    if(p)launchHubPicture(p,{fromMystery:true});
  }
  function changeHubTier(tier){
    if(!GRAPH_MYSTERY_LEVELS.some(t=>t.step===tier))return;
    hubTiers[hubMode]=tier;hubManual[hubMode]=false;
    saveGraphMysteryTiers(storage,hubTiers);
    syncHubUrl();pickerView();
  }
  function changeHubMode(next){
    if(!HUB_MODES.some(x=>x.id===next))return;
    hubMode=next;
    if(next==="fill"||next==="build"){saved.mode=next;persist();}
    hubTierFor(next);
    syncHubUrl();pickerView();
  }
  function pickerView(){
    for(const m of HUB_MODES)
      $(m.button).setAttribute("aria-pressed",String(hubMode===m.id));
    const curveSave=readCurveSave(storage),plotSave=readPlotSave(storage);
    const gallery=hubGallery(hubMode);
    const practice=hubPracticeGallery(hubMode);
    const extras=hubMode==="fill"||hubMode==="build"?
      graphLegacyExtras(hubMode,saved.records):[];
    const all=[...gallery,...practice];
    const getRecord=p=>hubRecord(hubMode,p,curveSave,plotSave);
    const tier=hubTierFor(hubMode,{curve:curveSave,plot:plotSave});
    const pool=graphMysteryPool(hubMode,tier,gallery,practice);
    const stats=graphMysteryStatus(pool,getRecord);
    const overall=graphMysteryStatus(all,getRecord);
    const level=GRAPH_MYSTERY_LEVELS[tier-1];
    const manual=!!hubManual[hubMode];
    $("graphModeDescription").textContent=
      HUB_MODES.find(m=>m.id===hubMode).description;
    $("graphGalleryProgress").textContent=
      overall.solved.length+" of "+overall.total+" discovered";
    const track=$("graphStageTrack");
    track.replaceChildren();
    const levels=$("graphDifficultyChoices");levels.replaceChildren();
    for(const p of gallery){
      const tierPool=graphMysteryPool(hubMode,p.step,gallery,practice);
      const tierStats=graphMysteryStatus(tierPool,getRecord);
      const finished=tierStats.remaining===0;
      const currentTier=p.step===tier;
      const item=doc.createElement("span");
      item.className="graph-step-node"+
        (finished?" is-complete":"")+(currentTier?" is-recommended":"");
      item.setAttribute("aria-label",GRAPH_MYSTERY_LEVELS[p.step-1].name+
        " difficulty, "+tierStats.solved.length+" of "+
        tierStats.total+" discovered");
      const dot=doc.createElement("span");dot.className="graph-step-number";
      dot.textContent=finished?"✓":String(p.step);
      const caption=doc.createElement("span");
      caption.textContent=GRAPH_MYSTERY_LEVELS[p.step-1].name;
      item.append(dot,caption);track.append(item);
      const button=doc.createElement("button");
      button.type="button";
      button.className="graph-difficulty-card"+
        (currentTier?" is-selected":"")+
        (finished?" is-complete":"");
      button.setAttribute("aria-pressed",String(currentTier));
      button.setAttribute("aria-label",GRAPH_MYSTERY_LEVELS[p.step-1].name+
        ", "+tierStats.solved.length+" of "+tierStats.total+" discovered");
      const stamp=doc.createElement("span");stamp.className="graph-difficulty-stamp";
      stamp.textContent=finished?"✓":String(p.step);
      const info=doc.createElement("span");info.className="graph-difficulty-info";
      const title=doc.createElement("strong");
      title.textContent=GRAPH_MYSTERY_LEVELS[p.step-1].name;
      const details=doc.createElement("small");
      details.textContent=p.pieces.length+" pieces · "+
        tierStats.solved.length+" of "+tierStats.total+" discovered";
      info.append(title,details);
      const tick=doc.createElement("span");
      tick.className="graph-difficulty-tick";
      tick.textContent=currentTier?"●":"○";
      button.append(stamp,info,tick);
      button.addEventListener("click",()=>changeHubTier(p.step));
      levels.append(button);
    }
    const selectedPicture=allHubPictures(hubMode,true).find(p=>
      p.id===hubSelections[hubMode]);
    if(manual&&!selectedPicture)hubManual[hubMode]=false;
    const actualManual=!!hubManual[hubMode];
    function highlightSelected(){
      syncHubUrl();
      for(const card of [...$("graphPictureCards").children,
        ...$("graphPracticeCards").children,...$("graphExtraCards").children]){
        const active=actualManual&&
          card.getAttribute("data-hub-picture")===hubSelections[hubMode];
        card.setAttribute("aria-pressed",String(active));
        card.classList.toggle("is-selected",active);
      }
      if(hubManual[hubMode]&&selectedPicture){
        $("graphStartPicture").disabled=false;
        updateHubPreview(selectedPicture,hubMode,getRecord(selectedPicture));
      }else{
        $("graphPreviewStage").textContent=tier+" · "+level.name;
        $("graphPreviewName").textContent="Mystery artwork";
        $("graphPreviewFocus").textContent=
          "Choose a "+level.name+" challenge. The picture is a surprise.";
        $("graphPreviewSkills").textContent="Maths · "+
          (pictureSkills(gallery[tier-1],hubMode).slice(0,3).join(" · "));
        $("graphPreviewProgress").textContent=stats.remaining?
          stats.remaining+" mystery "+(stats.remaining===1?"picture":"pictures")+
            " still to discover":
          "All discovered at this difficulty. Explore another level or replay.";
        $("graphStartPicture").disabled=stats.remaining===0;
        $("graphStartPicture").textContent=stats.remaining?
          "Start a "+level.name+" mystery ↗":"All discovered ✓";
        $("graphPreviewSvg").setAttribute("aria-label",
          "Empty coordinate canvas; the next mathematical picture is hidden");
        const mysteryCanvas=$("graphPreviewSvg");
        baseGraph(mysteryCanvas,doc);
        textSvg(doc,mysteryCanvas,SIZE/2,SIZE/2+29,"?",{
          "text-anchor":"middle","font-size":142,"font-weight":900,
          fill:"#86bcae","fill-opacity":.53,"pointer-events":"none"
        });
        textSvg(doc,mysteryCanvas,SIZE/2,SIZE/2+75,"MYSTERY",{
          "text-anchor":"middle","font-size":15,"font-weight":850,
          "letter-spacing":4,fill:"#718d86","pointer-events":"none"
        });
      }
    }
    $("graphMysteryHint").textContent=stats.remaining?
      stats.remaining+" new or unfinished "+(stats.remaining===1?"mystery":"mysteries")+
        " · "+gallery[tier-1].pieces.length+" mathematical pieces each":
      "All "+stats.total+" discovered! Choose another difficulty or replay from the gallery.";
    $("graphStartMystery").disabled=stats.remaining===0;
    $("graphStartMystery").textContent=stats.remaining?
      "Start a "+level.name+" mystery →":"All discovered ✓";
    const unfinished=graphContinueMystery(pool,getRecord);
    $("graphContinueMystery").hidden=!unfinished;
    $("graphContinueMystery").textContent=unfinished?
      "Continue your picture · "+getRecord(unfinished).done+" of "+
        unfinished.pieces.length+" →":"Continue your picture →";
    const recommended=gallery.find(p=>!graphMysteryFinished(p,getRecord(p)))||
      gallery[gallery.length-1];
    function makeCard(p,extra=false,practise=false){
      const r=getRecord(p),finished=graphMysteryFinished(p,r);
      const selected=hubManual[hubMode]&&p.id===hubSelections[hubMode];
      const card=doc.createElement("button");card.type="button";
      card.className="graph-picture-card"+(finished?" is-complete":"")+
        (selected?" is-selected":"")+
        (!extra&&p.id===recommended.id?" is-recommended":"");
      card.setAttribute("data-hub-picture",p.id);
      card.setAttribute("aria-pressed",String(!!selected));
      card.setAttribute("aria-label",(finished?"Completed: ":
        graphMysteryStarted(r)?"Continue: ":"Start: ")+
        (finished?p.name:p.clue)+", "+p.stage+
        ", "+r.done+" of "+p.pieces.length+" pieces. Select to preview.");
      const svg=doc.createElementNS(NS,"svg");
      svg.setAttribute("viewBox","0 0 620 620");
      svg.setAttribute("aria-hidden","true");
      hubMiniature(svg,p,r.done,hubMode);
      const info=doc.createElement("span");info.className="graph-picture-info";
      const stage=doc.createElement("span");stage.className="graph-stage";
      stage.textContent=(practise?"PRACTISE · ":extra?"BONUS · ":p.step+" · ")+
        p.stage.toUpperCase()+" · "+p.pieces.length+" pieces";
      const name=doc.createElement("strong");
      name.textContent=finished?p.name:p.clue;
      const desc=doc.createElement("small");desc.textContent=p.description;
      const focus=doc.createElement("span");focus.className="graph-card-maths";
      focus.textContent=pictureSkills(p,hubMode).slice(0,3).join(" · ");
      const go=doc.createElement("span");go.className="graph-card-go";
      go.textContent=finished?"✓ Completed":graphMysteryStarted(r)?
        "Continue picture":"Ready to start";
      const progress=doc.createElement("span");progress.className="graph-card-progress";
      progress.setAttribute("aria-hidden","true");
      const filled=doc.createElement("span");
      filled.style.width=(100*r.done/p.pieces.length)+"%";
      progress.append(filled);
      info.append(stage,name,desc,focus,progress,go);card.append(svg,info);
      card.addEventListener("click",()=>{
        hubSelections[hubMode]=p.id;
        hubManual[hubMode]=true;
        hubTiers[hubMode]=p.step;
        saveGraphMysteryTiers(storage,hubTiers);
        pickerView();
      });
      return card;
    }
    const cards=$("graphPictureCards");cards.replaceChildren();
    for(const p of gallery)cards.append(makeCard(p));
    $("graphPracticeSection").hidden=practice.length===0;
    const practiceCards=$("graphPracticeCards");practiceCards.replaceChildren();
    for(const p of practice)practiceCards.append(makeCard(p,false,true));
    $("graphMorePictures").hidden=extras.length===0;
    const extraCards=$("graphExtraCards");extraCards.replaceChildren();
    for(const p of extras)extraCards.append(makeCard(p,true));
    highlightSelected();
  }

  function draw(){
    baseGraph(graph,doc);
    const p=picture(),r=record(),part=current();
    // Preview the overlap of accepted half-planes BEHIND the already painted
    // pieces, so it never tints or visually changes completed artwork.
    if(part&&isReverse()&&rule()){
      // The highlighted half-plane is the question; never print its rule
      // until the player selects a matching inequality.
      polygon(graph,doc,intersectRegion([rule()]),{
        fill:"#61c2a7","fill-opacity":.2,
        stroke:"#459c82","stroke-width":1.5,"stroke-opacity":.72,
        "data-region-layer":"reverse-target","pointer-events":"none"
      });
    }
    if(part&&mode()==="build"&&r.line>0){
      const candidate=intersectRegion(part.rules.slice(0,r.line));
      polygon(graph,doc,candidate,{fill:"#72c5ac","fill-opacity":.11,
        stroke:"#39a186","stroke-width":1.5,"stroke-opacity":.64,
        "stroke-dasharray":"6 6","data-region-layer":"running-intersection",
        "pointer-events":"none"});
    }
    for(let i=0;i<r.done;i++){
      const f=p.pieces[i];
      polygon(graph,doc,intersectRegion(f.rules),{fill:f.color,
        stroke:"#fff9ec","stroke-width":3,
        "data-region-layer":"finished-"+f.id});
    }
    if(!part)return;
    const points=intersectRegion(part.rules);
    const allBuilt=mode()==="build"&&r.line===part.rules.length;
    if(allBuilt){
      const converging=buildRevealPhase==="converging";
      const completed=polygon(graph,doc,points,{
        fill:converging?"#48b98c":part.color,
        "fill-opacity":converging?.35:1,
        stroke:converging?"#20976f":"#fff9ec",
        "stroke-width":converging?4:3,
        "data-region-layer":converging?"intersection-celebration":"completed-build-piece",
        "pointer-events":"none"});
      if(completed)completed.classList?.add(converging?
        "graph-common-pulse":"graph-build-settled");
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
          agree:r.line===part.rules.length&&buildRevealPhase==="converging"
        });
      }
      if(rule())boundary(doc,graph,rule(),{stroke:"#304f78",
        "stroke-width":4,"stroke-opacity":1});
    }
    lastAddedArrow=null;
    graph.setAttribute("aria-label",mode()==="fill"?
      "Coordinate graph. "+r.done+" completed pieces. Move with arrow keys and press Enter to fill the region under the keyboard cursor.":
      isReverse()&&rule()?
        "Coordinate graph. "+(rule().inclusive?"Solid":"Dashed")+
        " highlighted boundary, with the "+regionSide(rule())+
        " half-plane shaded. Choose its matching inequality.":
      "Coordinate graph. "+r.line+" of "+part.rules.length+" boundaries correctly added to this piece.");
  }
  function playView(){
    const p=picture(),r=record(),part=current();
    if(!part){setScreen("summary");return;}
    const allBuilt=mode()==="build"&&r.line===part.rules.length;
    const converging=allBuilt&&buildRevealPhase==="converging";
    const awaitingNext=allBuilt&&!converging;
    $("graphGameMode").textContent=
      (mode()==="fill"?"FIND & FILL":"BUILD & SHADE")+
      " · STEP "+p.step+" · "+p.stage.toUpperCase();
    $("graphGameFocus").textContent=p.focus;
    $("graphPictureName").textContent=p.name;
    $("graphPieceCount").textContent="Piece "+(r.done+1)+" of "+p.pieces.length;
    $("graphCanvasCount").textContent=r.done+" / "+p.pieces.length;
    $("graphProgressFill").style.width=(100*r.done/p.pieces.length)+"%";
    renderPieceMarkers($("graphPieceMarkers"),doc,p.pieces.length,r.done);
    $("graphProgress").setAttribute("aria-valuenow",String(Math.round(100*r.done/p.pieces.length)));
    $("graphTaskKicker").textContent="PIECE "+(r.done+1)+" OF "+p.pieces.length;
    $("graphTaskTitle").textContent=part.name;
    $("graphPieceSwatch").style.background=part.color;
    $("graphCanvasHeading").textContent=mode()==="fill"?"Find the overlap":
      isReverse()?"Read the shaded region":"Build the region";
    $("graphTaskLead").textContent=mode()==="fill"?
      "All these inequalities must be true together. Fill their common region.":
      isReverse()?"Read each highlighted line and shaded half-plane. Choose the matching inequality.":
      "For each inequality, choose the correct side and boundary style. All the arrows will point into the common region.";
    $("graphCanvasInstruction").textContent=mode()==="fill"?
      "Tap the correct region, then press Check. Keyboard: arrows + Enter.":
      isReverse()&&!allBuilt?
        "The dark boundary and pale green shading form the question. Choose its inequality.":
      allBuilt?
        (converging?
          "Watch the arrows meet: the green overlap satisfies ALL the inequalities.":
          "This coloured piece is the intersection. Follow the arrows before moving on."):
        r.line>0?"The faint teal area is the overlap of your "+r.line+
          " completed "+(r.line===1?"inequality":"inequalities")+".": 
          "Each arrow points towards the half-plane satisfying that inequality.";
    $("graphRuleCount").textContent=part.rules.length+" inequalities";
    $("graphFillControls").hidden=mode()!=="fill";
    $("graphBuildControls").hidden=mode()!=="build"||isReverse();
    $("graphReverseControls").hidden=!isReverse();
    const holder=$("graphRuleList");holder.replaceChildren();
    part.rules.forEach((rr,i)=>{
      const item=doc.createElement(mode()==="build"?"button":"div");
      item.className="graph-rule-item"+(mode()==="build"&&i===r.line?" selected":"")+
        (mode()==="build"&&i<r.line?" done":"");
      const eq=doc.createElement("span");
      eq.textContent=isReverse()&&i>=r.line?
        (i===r.line?"Read the highlighted graph":"Upcoming graph"):rr.text;
      const state=doc.createElement("span");state.className="rule-state";
      state.textContent=mode()==="fill"?"AND":i<r.line?"✓ Added":i===r.line?"● Now":"○ Next";
      item.append(eq,state);
      if(mode()==="build"){
        item.type="button";item.disabled=i!==r.line||pendingPieceTimer!==null;
        item.addEventListener("click",()=>{
          notify(isReverse()?"Choose the inequality matching the shaded side.":
            "Choose a side and a line style.");playView();
        });
      }
      holder.append(item);
    });
    if(isReverse()){
      const options=$("graphReverseChoices");options.replaceChildren();
      if(rule()&&!allBuilt){
        for(const option of reverseInequalityOptions(rule())){
          const button=doc.createElement("button");
          button.type="button";button.textContent=option;
          button.addEventListener("click",()=>chooseReverseOption(option));
          options.append(button);
        }
      }
      $("graphReverseWaiting").hidden=!converging;
      $("graphReverseNext").hidden=!awaitingNext;
      $("graphReverseNext").disabled=!awaitingNext;
      $("graphReverseNext").textContent=r.done===p.pieces.length-1?
        "Finish picture ✦":"Next piece →";
    }
    if(mode()==="build"){
      $("graphBuildControls").classList.toggle("is-solved",allBuilt);
      $("graphAddLine").hidden=allBuilt;
      $("graphBuildWaiting").hidden=!converging;
      $("graphNextPiece").hidden=!awaitingNext;
      $("graphNextPiece").disabled=!awaitingNext;
      $("graphNextPiece").textContent=r.done===p.pieces.length-1?
        "Finish picture ✦":"Next piece →";
      const rr=rule();
      $("graphActiveEquation").textContent=rr?.text||"All boundaries added ✓";
      const sides=rr?regionSideOptions(rr):["above","below"];
      for(const [i,id] of ["graphSideA","graphSideB"].entries()){
        const b=$(id),value=sides[i];
        b.textContent=value[0].toUpperCase()+value.slice(1);
        b.dataset.side=value;
        b.disabled=allBuilt||!rr;
        b.setAttribute("aria-pressed",String(choiceSide===value));
      }
      for(const [id,style] of [["graphSolid","solid"],["graphDashed","dashed"]]){
        $(id).disabled=allBuilt||!rr;
        $(id).setAttribute("aria-pressed",String(choiceStyle===style));
      }
      $("graphAddLine").disabled=allBuilt||!rr;
      $("graphHint").disabled=allBuilt;
      $("graphOverlapText").textContent=allBuilt?
        (converging?
          "The green region is where all "+part.rules.length+
          " half-planes overlap. Every arrow points into this shared solution.":
          "Why this coloured shape? It lies on the correct side of EVERY boundary. "+
          "Any point outside fails at least one inequality. Review the arrows, then continue."):
        r.line===0?
          "Each arrow shows one inequality's valid half-plane. Only their shared overlap will be shaded.":
          r.line+" of "+part.rules.length+" lines added. The faint teal area satisfies the "+r.line+
            " inequalities so far; the next one will narrow it.";
    }
    $("graphFeedback").textContent=message||
      (mode()==="fill"?"Tap the region where all inequalities are true.":
        "Choose a side and a line style for the highlighted inequality.");
    $("graphFeedback").className="graph-feedback"+(status?" "+status:"");
    $("graphWhy").hidden=!why;
    $("graphWhyText").textContent=why?.text||"";
    $("graphHintText").textContent=hint;
    $("graphHintText").hidden=!hint;
    const scope=mode()+":"+saved.picture+":"+r.done+":"+(mode()==="build"?r.line:0);
    const stage=scope===hintKey?hintStage:0;
    $("graphHint").textContent=stage>=3?"✳ All hints shown":
      stage?"✳ More help ("+(stage+1)+"/3)":"✳ Give me a hint";
    $("graphHint").disabled=(mode()==="build"&&allBuilt)||stage>=3;
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
      setWhy(explainRegionChoice(current().rules,{x,y}));
      notify("Not quite. That region fails at least one of the inequalities. Try another.","error");
      playView();
      if(flashTimer)win.clearTimeout?.(flashTimer);
      flashTimer=win.setTimeout?.(()=>{flash=null;if(screen==="play")playView();},950);
      return;
    }
    flash=null;
    selected=selected?"":candidate;
    setWhy(selected?explainRegionChoice(current().rules,{x,y}):null);
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
    if(screen!=="play"||mode()!=="build"||isReverse()||
      pendingPieceTimer!==null||buildRevealPhase==="ready")return;
    const rr=rule();if(!rr)return;
    if(!choiceSide||!choiceStyle){
      setWhy(null);
      notify("Choose both the direction and whether the line is solid or dashed.","error");
      playView();return;
    }
    if(!regionCorrect(rr,choiceSide,choiceStyle)){
      setWhy({text:choiceSide!==regionSide(rr)?
        "For "+rr.text+", the satisfying side is "+regionSide(rr)+
        ". Choose a test point to check which side is true.":
        "For "+rr.text+", use a "+regionBoundaryStyle(rr)+
        " boundary because equality is "+(rr.inclusive?"included.":"excluded.")});
      notify(choiceSide!==regionSide(rr)?
        "Not quite. Try substituting a point on the side you selected.":
        rr.inclusive?"Equality is included: use a solid boundary.":
          "Strict inequalities need a dashed boundary.","error");
      playView();return;
    }
    acceptBuildBoundary();
  }
  function chooseReverseOption(option){
    if(screen!=="play"||!isReverse()||pendingPieceTimer!==null||
      buildRevealPhase==="ready"||!rule())return;
    const rr=rule();
    if(option!==rr.text){
      setWhy({text:"The dark line has a "+regionBoundaryStyle(rr)+
        " boundary. The green side is "+regionSide(rr)+
        ". The inequality represented is "+rr.text+"."});
      notify("Not quite. Compare the shaded side and the boundary style.","error");
      playView();return;
    }
    acceptBuildBoundary();
  }
  function acceptBuildBoundary(){
    const rr=rule();if(!rr)return;
    setWhy(null);
    record().line++;
    persist();
    lastAddedArrow=rr.id;
    choiceSide=null;choiceStyle=null;
    if(record().line===current().rules.length){
      // Pause on the ACTUAL solution rather than jumping to the next question.
      // Arrows converge, green overlap pulses, then the picture's real colour
      // appears. Only the student's Next piece action can advance the puzzle.
      buildRevealPhase="converging";
      notify("Every arrow points into the shared region. Watch the overlap appear!","success");
      playView();
      if(win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches){
        settleBuildReveal();
      }else{
        const id=win.setTimeout?.(()=>{
          if(pendingPieceTimer!==id||screen!=="play"||mode()!=="build")return;
          pendingPieceTimer=null;
          settleBuildReveal();
        },2600);
        pendingPieceTimer=id??null;
        if(id==null)settleBuildReveal();
      }
    }else{
      notify("Correct! The new arrow shows one more valid half-plane.","success");
      playView();
    }
  }
  function settleBuildReveal(){
    if(screen!=="play"||mode()!=="build"||!current()||
      record().line!==current().rules.length)return;
    buildRevealPhase="ready";
    notify("That coloured region satisfies every inequality. Study the arrows, then choose Next piece.","success");
    playView();
  }
  function cancelBuildRevealTimer(){
    if(pendingPieceTimer!==null){
      win.clearTimeout?.(pendingPieceTimer);
      pendingPieceTimer=null;
    }
    if(buildRevealPhase==="converging")buildRevealPhase="ready";
  }
  function finishPiece(){
    const r=record(),part=current();
    if(!part)return;
    if(mode()==="build"&&
      (r.line!==part.rules.length||buildRevealPhase==="converging"))return;
    cancelBuildRevealTimer();
    r.done++;r.line=0;
    persist();
    if(r.done===picture().pieces.length)rememberGraphMuralDiscoveries(storage);resetChoices();flash=null;cursor={x:0,y:0};
    buildRevealPhase="idle";
    if(r.done===picture().pieces.length){
      setScreen("summary");
      openReveal();
    }else{
      notify("Beautiful! That mathematical shape is now part of your picture.","success");
      playView();
    }
  }
  // Selecting a finished picture is view-only; progress changes only on Restart.
  function choosePicture(id,chosenMode=mode()){
    const p=graphPicture(id);
    if(!p||!GRAPH_ART_MODES.some(item=>item.id===chosenMode))return;
    cancelBuildRevealTimer();
    saved.mode=chosenMode;saved.picture=p.id;
    hubMode=chosenMode;hubSelections[chosenMode]=p.id;
    resetChoices();persist();
    const r=saved.records[key(chosenMode,p.id)];
    if(r?.done===p.pieces.length){
      setScreen("summary");openReveal();
    }else{
      notify(chosenMode==="build"?
        "Choose the correct side and line style.":"Find the common region.");
      setScreen("play");
    }
  }
  function summaryView(){
    const p=picture();
    $("graphMuralLink").href="./graph-mural.html?found="+encodeURIComponent(mode()+":"+p.id);
    $("graphSummaryTitle").textContent=p.name+" ✦";
    $("graphSummaryText").textContent="You created every piece from the common solutions of simultaneous inequalities.";
    $("graphSummaryStats").textContent="Stage "+p.step+" · "+p.stage+" · "+
      p.pieces.length+" real regions · "+graphTotalBoundaries(p)+
      " inequalities · "+GRAPH_ART_MODES.find(m=>m.id===mode()).name;
    const art=$("graphSummaryArt");
    baseGraph(art,doc,{grid:false});
    for(const part of p.pieces)
      polygon(art,doc,intersectRegion(part.rules),{
        fill:part.color,stroke:"#fff9ec","stroke-width":3.5,
        "pointer-events":"none"
      });
    decorations(doc,art,p);
    art.setAttribute("aria-label","Completed inequality art: "+p.name);
    renderSummaryMetrics($("graphSummaryMetrics"),doc,[
      {value:p.pieces.length,label:"Picture pieces"},
      {value:graphTotalBoundaries(p),label:"Inequalities"},
      {value:p.step+" / 5",label:"Stage complete"}
    ]);
    $("graphNextPicture").hidden=false;
    const sameLevel=graphMysteryPool(mode(),p.step,
      hubGallery(mode()),hubPracticeGallery(mode()));
    const remaining=graphMysteryStatus(sameLevel,q=>
      saved.records[key(mode(),q.id)]||blank()).remaining;
    $("graphNextPicture").textContent=remaining?
      "Another mystery →":"Choose another difficulty →";
  }
  function restart(){
    if(typeof win.confirm==="function"&&!win.confirm(
      "Restart this picture? Only this picture's progress will be reset."))return;
    cancelBuildRevealTimer();
    const r=record();
    if(r.done===picture().pieces.length)rememberGraphMuralDiscoveries(storage);
    saved.records[key(mode(),saved.picture)]={done:0,line:0,replays:r.replays+1};
    persist();resetChoices();notify("Start your picture again.");setScreen("play");
  }
  function stopReveal(){for(const id of revealTimers)win.clearTimeout?.(id);revealTimers=[];}
  function later(fn,ms){const id=win.setTimeout?.(fn,ms);if(id!=null)revealTimers.push(id);}
  function revealStage(count,finish=false,detailCount=0){
    const p=picture();baseGraph(revealSvg,doc,{grid:false});
    for(let i=0;i<count;i++){
      const f=p.pieces[i];
      polygon(revealSvg,doc,intersectRegion(f.rules),{
        fill:f.color,stroke:"#fff9ec","stroke-width":3.5});
    }
    if(count===p.pieces.length&&detailCount>0)
      decorations(doc,revealSvg,p,detailCount);
    $("graphRevealStatus").textContent=finish?
      "Your "+p.name+" is complete! All "+p.pieces.length+
        " coloured regions are real inequality intersections.":
      count<p.pieces.length?
        "Mathematical shape "+count+" of "+p.pieces.length+" revealed":
        "All the regions are complete. Finishing touches are appearing…";
    $("graphRevealTitle").textContent=finish?p.name+" ✦":"Your picture is coming to life!";
    $("graphRevealSkip").hidden=finish;
    $("graphRevealAgain").hidden=!finish;
    $("graphDownload").hidden=!finish;
  }
  function showFinished(){
    stopReveal();revealStage(picture().pieces.length,true,Infinity);
  }
  function playReveal(){
    stopReveal();revealStage(0);
    const p=picture();
    if(win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches){
      showFinished();return;
    }
    const pieceMs=p.pieces.length>6?480:600;
    p.pieces.forEach((_,i)=>later(()=>revealStage(i+1),
      pieceMs*(i+1)));
    const start=pieceMs*(p.pieces.length+1);
    const details=decorationStages(p);
    for(let stage=1;stage<=details;stage++)
      later(()=>revealStage(p.pieces.length,false,stage),
        start+410*(stage-1));
    later(()=>showFinished(),start+410*details);
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
    if(screen!=="play"||pendingPieceTimer!==null||
      (mode()==="build"&&current()&&record().line===current().rules.length))return;
    const part=current(),rr=mode()==="build"?rule():part.rules[0],r=record();
    const key=mode()+":"+saved.picture+":"+r.done+":"+(mode()==="build"?r.line:0);
    if(key!==hintKey){hintKey=key;hintStage=0;}
    hintStage=Math.min(3,hintStage+1);
    if(isReverse()){
      hint=hintStage===1?"Check which side of the highlighted boundary is shaded.":
        hintStage===2?"Use < or > for dashed lines and ≤ or ≥ for solid lines. Combine this with the shaded direction.":
          "The displayed graph represents "+rr.text+".";
    }else if(mode()==="build"){
      hint=hintStage===1?"First find the direction of the solution from the inequality. Then decide if equality is included.":
        hintStage===2?regionHint(rr):
          "For "+rr.text+", choose "+regionSide(rr)+" and a "+regionBoundaryStyle(rr)+" boundary.";
    }else if(hintStage===1){
      hint="Read every inequality, then find the area where all their allowed sides overlap.";
    }else if(hintStage===2){
      hint="Check one boundary at a time. For the first inequality: "+regionHint(rr);
    }else{
      let answer=null,best=-1;
      for(let x=-4.5;x<=4.5;x+=.5)for(let y=-4.5;y<=4.5;y+=.5){
        if(!pointSatisfiesAll(part.rules,x,y))continue;
        const distance=Math.min(...part.rules.map(b=>
          Math.abs(b.a*x+b.b*y-b.c)/Math.hypot(b.a,b.b)));
        if(distance>best){best=distance;answer={x,y};}
      }
      hint=answer?"The point ("+answer.x+", "+answer.y+
        ") satisfies every inequality. Fill the region containing it.":
        "Find a point away from every line, and check it in all the inequalities.";
    }
    notify("Hint "+hintStage+" of 3 is shown below.");
    playView();
  }

  $("graphModeFill").addEventListener("click",()=>changeHubMode("fill"));
  $("graphModeBuild").addEventListener("click",()=>changeHubMode("build"));
  $("graphModeCurve").addEventListener("click",()=>changeHubMode("curve"));
  $("graphModePlot").addEventListener("click",()=>changeHubMode("plot"));
  $("graphStartPicture").addEventListener("click",startHubPicture);
  $("graphStartMystery").addEventListener("click",()=>{
    hubManual[hubMode]=false;startHubPicture();
  });
  $("graphContinueMystery").addEventListener("click",continueHubMystery);
  $("graphBack").addEventListener("click",()=>{
    // All answered inequalities are saved; revisit the completed region later.
    cancelBuildRevealTimer();
    setScreen("picker");
  });
  $("graphUndoFill").addEventListener("click",()=>{selected=null;flash=null;setWhy(null);notify("Fill cleared. Choose a region.");playView();});
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
  $("graphNextPiece").addEventListener("click",()=>{
    if(screen!=="play"||mode()!=="build"||
       buildRevealPhase==="converging")return;
    finishPiece();
  });
  $("graphReverseNext").addEventListener("click",()=>{
    if(screen!=="play"||!isReverse()||
      buildRevealPhase==="converging")return;
    finishPiece();
  });
  $("graphHint").addEventListener("click",showHint);
  $("graphRestart").addEventListener("click",restart);
  $("graphRestartPlaying").addEventListener("click",restart);
  $("graphChooseAgain").addEventListener("click",()=>setScreen("picker"));
  $("graphNextPicture").addEventListener("click",()=>{
    // Next offers another unfinished mystery at this same difficulty.
    // If the pool is complete, the picker invites another difficulty or replay.
    hubMode=mode();
    hubTiers[hubMode]=picture().step;
    hubManual[hubMode]=false;
    saveGraphMysteryTiers(storage,hubTiers);
    syncHubUrl();
    setScreen("picker");
  });
  $("graphReplayReveal").addEventListener("click",openReveal);
  $("graphRevealClose").addEventListener("click",closeReveal);
  $("graphRevealSkip").addEventListener("click",showFinished);
  $("graphRevealAgain").addEventListener("click",playReveal);
  $("graphDownload").addEventListener("click",savePNG);
  $("graphSavePicture").addEventListener("click",()=>{showFinished();savePNG();});
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
    choose:(id,m)=>choosePicture(id,m),
    pickAt,checkFill,addLine,finishPiece,showFinished,render:()=>setScreen(screen)};
}
if(typeof document!=="undefined"&&document.getElementById("graphArtGraph"))initRegionsApp();
