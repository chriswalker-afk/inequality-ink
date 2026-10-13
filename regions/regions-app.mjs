import {
  REGION_SAVE_KEY,REGION_WORLD,REGION_NAME,REGION_FACETS,
  REGION_TOTAL,REGION_STEP_TOTAL,intersectRegion,lineOnRegionGraph,
  evaluateRegionRule,polygonArea,regionSide,otherRegionSide,
  regionSideOptions,regionBoundaryStyle,regionCorrect,previewSideRule,
  regionHint,validateRegionArt
} from "./regions-engine.mjs";

// A separate application: no dependency on app.mjs, main picture generators,
// Quadratic Quest or any of their localStorage keys.
const SVG="http://www.w3.org/2000/svg";
const VIEW=620,PAD=52;
const GRID=VIEW-2*PAD;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const $default=id=>document.getElementById(id);
const label=side=>side.charAt(0).toUpperCase()+side.slice(1);
const clean=()=>({done:0,step:0,replays:0});
export function readRegionSave(storage){
  let record;
  try{record=JSON.parse(storage.getItem(REGION_SAVE_KEY));}catch{return clean();}
  if(!record||typeof record!=="object"||
    !Number.isInteger(record.done)||record.done<0||record.done>REGION_TOTAL||
    !Number.isInteger(record.step)||record.step<0||
    !Number.isInteger(record.replays)||record.replays<0)return clean();
  const remaining=record.done===REGION_TOTAL?0:
    REGION_FACETS[record.done].rules.length-REGION_FACETS[record.done].given;
  if(record.step>=remaining&&record.done<REGION_TOTAL||
    record.done===REGION_TOTAL&&record.step!==0)return clean();
  return {done:record.done,step:record.step,replays:record.replays};
}
function el(doc,tag,attributes={},parent=null){
  const node=doc.createElementNS(SVG,tag);
  for(const [key,value] of Object.entries(attributes))
    node.setAttribute(key,String(value));
  if(parent)parent.append(node);
  return node;
}
function xPixel(n){return PAD+(n-REGION_WORLD.xmin)*GRID/
  (REGION_WORLD.xmax-REGION_WORLD.xmin);}
function yPixel(n){return PAD+(REGION_WORLD.ymax-n)*GRID/
  (REGION_WORLD.ymax-REGION_WORLD.ymin);}
function polygonPath(points){
  if(points.length<3)return "";
  return points.map((p,i)=>(i?"L":"M")+
    xPixel(p.x).toFixed(2)+" "+yPixel(p.y).toFixed(2)).join(" ")+" Z";
}
export function regionProgressSteps(save){
  let total=0;
  for(let i=0;i<save.done;i++)
    total+=REGION_FACETS[i].rules.length-REGION_FACETS[i].given;
  return total+(save.done<REGION_TOTAL?save.step:0);
}
export function initRegionsApp({
  doc=document,storage=localStorage,win=window
}={}){
  validateRegionArt();
  const $=id=>doc.getElementById(id);
  const svg=$("regionGraph");
  let progress=readRegionSave(storage),side=null,boundary=null,
    announcement="",kind="",hintVisible=false;

  function save(){
    try{storage.setItem(REGION_SAVE_KEY,JSON.stringify(progress));}catch{}
  }
  function currentFacet(){return REGION_FACETS[progress.done]||null;}
  function currentRule(){
    const facet=currentFacet();
    return facet?facet.rules[facet.given+progress.step]:null;
  }
  function completedRules(){
    const facet=currentFacet();
    return facet?facet.rules.slice(0,facet.given+progress.step):[];
  }
  function setMessage(message,type=""){
    announcement=message;kind=type;
    const target=$("regionFeedback");
    target.textContent=message;
    target.className=type;
  }
  function svgShade(points,fill,opacity,stroke,strokeWidth,dash="",name=""){
    if(!points.length)return;
    const p=el(doc,"path",{d:polygonPath(points),fill,
      "fill-opacity":opacity,stroke,
      "stroke-width":strokeWidth,
      "stroke-dasharray":dash,
      "stroke-linejoin":"round",
      "data-region-layer":name},svg);
    p.setAttribute("aria-hidden","true");
  }
  function drawGraph(){
    svg.replaceChildren();
    const defs=el(doc,"defs",{},svg);
    for(const facet of REGION_FACETS){
      const gradient=el(doc,"linearGradient",{
        id:"graph-gradient-"+facet.id,x1:"0%",y1:"0%",x2:"90%",y2:"100%"
      },defs);
      el(doc,"stop",{offset:"0%","stop-color":"#ffffff","stop-opacity":".12"},gradient);
      el(doc,"stop",{offset:"30%","stop-color":facet.color,"stop-opacity":"1"},gradient);
      el(doc,"stop",{offset:"100%","stop-color":facet.color,"stop-opacity":".77"},gradient);
    }
    el(doc,"rect",{x:PAD,y:PAD,width:GRID,height:GRID,
      rx:11,fill:"#fffcf8",stroke:"#d8dedb","stroke-width":2},svg);
    for(let n=REGION_WORLD.xmin;n<=REGION_WORLD.xmax;n++){
      const x=xPixel(n),y=yPixel(n);
      el(doc,"line",{x1:x,y1:PAD,x2:x,y2:VIEW-PAD,stroke:"#879eb2",
        "stroke-opacity":n===0?".47":".15","stroke-width":n===0?2:1},svg);
      el(doc,"line",{x1:PAD,y1:y,x2:VIEW-PAD,y2:y,stroke:"#879eb2",
        "stroke-opacity":n===0?".47":".15","stroke-width":n===0?2:1},svg);
      if(n%2===0){
        if(n!==0){
          const tx=el(doc,"text",{x:x,y:yPixel(0)+18,
            "font-size":13,"text-anchor":"middle",fill:"#8995a1"},svg);
          tx.textContent=String(n).replace("-","−");
          const ty=el(doc,"text",{x:xPixel(0)-14,y:y+4,
            "font-size":13,"text-anchor":"end",fill:"#8995a1"},svg);
          ty.textContent=String(n).replace("-","−");
        }
      }
    }
    const xAxis=el(doc,"text",{x:VIEW-PAD-10,y:yPixel(0)-11,
      "font-size":16,"font-weight":800,fill:"#597187"},svg);
    xAxis.textContent="x";
    const yAxis=el(doc,"text",{x:xPixel(0)+10,y:PAD+24,
      "font-size":16,"font-weight":800,fill:"#597187"},svg);
    yAxis.textContent="y";

    // Finished artwork is computed afresh from the exact half-plane clipping.
    for(const facet of REGION_FACETS.slice(0,progress.done)){
      const points=intersectRegion(facet.rules);
      svgShade(points,"url(#graph-gradient-"+facet.id+")",.97,
        "#fff9ee",3,facet.rules.some(r=>!r.inclusive)?"6 5":"",
        "finished-"+facet.id);
    }

    const facet=currentFacet(),rule=currentRule();
    if(facet&&rule){
      const accepted=completedRules();
      // A candidate half-plane genuinely intersects the already-confirmed
      // mathematical half-planes, rather than revealing a separate art mask.
      const candidate=side?previewSideRule(rule,side):null;
      if(accepted.length||candidate){
        const preview=intersectRegion(
          candidate?[...accepted,candidate]:accepted);
        svgShade(preview,facet.color,.23,"#4c9a8d",2,"7 5","preview");
      }
      for(const acceptedRule of accepted){
        const points=lineOnRegionGraph(acceptedRule);
        if(!points)continue;
        el(doc,"line",{
          x1:xPixel(points[0].x),y1:yPixel(points[0].y),
          x2:xPixel(points[1].x),y2:yPixel(points[1].y),
          stroke:"#568d87","stroke-width":1.8,
          "stroke-dasharray":acceptedRule.inclusive?"":"7 5",
          "stroke-opacity":.7,
          "pointer-events":"none"
        },svg);
      }
      const points=lineOnRegionGraph(rule);
      if(points){
        el(doc,"line",{
          x1:xPixel(points[0].x),y1:yPixel(points[0].y),
          x2:xPixel(points[1].x),y2:yPixel(points[1].y),
          stroke:"#304f78","stroke-width":3.6,
          "stroke-dasharray":boundary==="dashed"?"9 8":
            boundary==="solid"?"":"3 4",
          "pointer-events":"none",
          "data-active-boundary":rule.id
        },svg);
      }
    }
    if(progress.done===REGION_TOTAL){
      const sparkle=el(doc,"text",{x:xPixel(0),y:yPixel(4.4),
        "font-size":30,"text-anchor":"middle",fill:"#e4a66d",
        "aria-hidden":"true"},svg);
      sparkle.textContent="✧";
    }
    svg.setAttribute("aria-label",progress.done===REGION_TOTAL?
      "Completed Aurora Crystal made from five true inequality intersections":
      progress.done+" of 5 crystal facets completed. Coordinate graph from "+
      "minus five to five. Tap a side of the highlighted boundary or use the buttons.");
  }

  function progressView(){
    const solved=regionProgressSteps(progress),facet=currentFacet();
    $("regionStepCount").textContent=solved+" of "+REGION_STEP_TOTAL+" decisions";
    $("regionProgressFill").style.width=(100*solved/REGION_STEP_TOTAL)+"%";
    $("regionJourneyLabel").textContent=facet?
      "Facet "+(progress.done+1)+" of "+REGION_TOTAL+" · "+facet.name:
      "Crystal complete ✦";
    $("regionCanvasCount").textContent=progress.done+" / "+REGION_TOTAL+" facets";
    const dots=$("regionProgressDots");dots.replaceChildren();
    for(let i=0;i<REGION_TOTAL;i++){
      const node=doc.createElement("span");
      node.className="region-progress-dot"+
        (i<progress.done?" complete":i===progress.done?" active":"");
      node.style.setProperty?.("--facet-color",REGION_FACETS[i].color);
      node.setAttribute("title",REGION_FACETS[i].name+
        (i<progress.done?" completed":i===progress.done?" in progress":" upcoming"));
      dots.append(node);
    }
  }

  function taskView(){
    if(progress.done>=REGION_TOTAL){
      $("regionTaskPanel").hidden=true;
      $("regionFinishPanel").hidden=false;
      $("regionGraph").style.cursor="default";
      const review=$("regionReviewContent");review.replaceChildren();
      for(const facet of REGION_FACETS){
        const heading=doc.createElement("h3");
        heading.textContent=facet.name;
        const list=doc.createElement("ul");
        for(const rule of facet.rules){
          const li=doc.createElement("li");
          li.textContent=rule.text;
          list.append(li);
        }
        review.append(heading,list);
      }
      $("regionFinishStats").textContent=
        REGION_TOTAL+" facets · "+REGION_STEP_TOTAL+" correct shading decisions";
      return;
    }
    $("regionTaskPanel").hidden=false;
    $("regionFinishPanel").hidden=true;
    $("regionGraph").style.cursor="crosshair";
    const facet=currentFacet(),rule=currentRule();
    const count=facet.rules.length-facet.given,step=progress.step;
    $("regionFacetStep").textContent="FACET "+(progress.done+1)+" OF "+REGION_TOTAL;
    $("regionFacetTitle").textContent=facet.name;
    $("regionFacetIntro").textContent=facet.hint;
    $("regionFacetSwatch").style.background=facet.color;
    $("regionEquation").textContent=rule.text;
    $("regionRuleLabel").textContent="BOUNDARY "+(step+1)+" OF "+count;
    const accepted=completedRules();
    $("regionGiven").textContent=accepted.length?
      "Already shaded: "+accepted.map(r=>r.text).join("  ∩  "):
      "Start by choosing a side for the highlighted line.";
    const trail=$("regionRuleTrail");trail.replaceChildren();
    for(let i=facet.given;i<facet.rules.length;i++){
      const chip=doc.createElement("span");
      chip.className="region-rule-chip"+
        (i<facet.given+progress.step?" done":
          i===facet.given+progress.step?" current":"");
      chip.textContent=i<facet.given+progress.step?"✓ "+facet.rules[i].text:
        i===facet.given+progress.step?"● Now":"○ Next";
      trail.append(chip);
    }
    const options=regionSideOptions(rule);
    for(const [index,id] of ["regionSideA","regionSideB"].entries()){
      const button=$(id);
      button.textContent=label(options[index]);
      button.dataset.side=options[index];
      button.classList.toggle("selected",side===options[index]);
      button.setAttribute("aria-pressed",String(side===options[index]));
    }
    for(const [id,mode] of [["regionSolid","solid"],["regionDashed","dashed"]]){
      const button=$(id),selected=boundary===mode;
      button.classList.toggle("selected",selected);
      button.setAttribute("aria-pressed",String(selected));
    }
    $("regionHintBox").hidden=!hintVisible;
    if(!hintVisible)$("regionHintBox").textContent="";
    $("regionFeedback").textContent=announcement||
      "Choose a side and boundary style to get started.";
    $("regionFeedback").className=kind;
  }

  function render(){progressView();drawGraph();taskView();}
  function choicesReset(){
    side=null;boundary=null;hintVisible=false;
  }
  function sideSelect(value){
    const rule=currentRule();
    if(!rule||!regionSideOptions(rule).includes(value))return;
    side=value;
    setMessage(label(value)+" selected. Choose solid or dashed, then check.");
    render();
  }
  function boundarySelect(value){
    if(!currentRule()||!["solid","dashed"].includes(value))return;
    boundary=value;
    setMessage(label(value)+" boundary selected. Ready to check your shading.");
    render();
  }
  function clickGraph(event){
    const rule=currentRule();if(!rule)return;
    const rect=svg.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const xPx=(event.clientX-rect.left)/rect.width*VIEW;
    const yPx=(event.clientY-rect.top)/rect.height*VIEW;
    if(xPx<PAD||xPx>VIEW-PAD||yPx<PAD||yPx>VIEW-PAD)return;
    const x=REGION_WORLD.xmin+(xPx-PAD)/GRID*
      (REGION_WORLD.xmax-REGION_WORLD.xmin);
    const y=REGION_WORLD.ymax-(yPx-PAD)/GRID*
      (REGION_WORLD.ymax-REGION_WORLD.ymin);
    const value=evaluateRegionRule(rule,x,y);
    const distance=Math.abs(value)/Math.hypot(rule.a,rule.b);
    if(distance<.16){
      setMessage("Tap a little farther away from the boundary line.");
      return;
    }
    sideSelect(value<0?regionSide(rule):otherRegionSide(regionSide(rule)));
  }
  function showHint(){
    const rule=currentRule();if(!rule)return;
    hintVisible=true;
    $("regionHintBox").textContent=regionHint(rule);
    $("regionHintBox").hidden=false;
    setMessage("Try the test point, then decide which side contains the solution.");
  }
  function check(){
    const rule=currentRule();if(!rule)return;
    if(!side||!boundary){
      setMessage("Choose both a shading side and a solid/dashed boundary.","error");
      return;
    }
    if(!regionCorrect(rule,side,boundary)){
      if(side!==regionSide(rule))
        setMessage("Not quite. Test a point on that side in the inequality.","error");
      else setMessage(
        rule.inclusive?"This inequality includes equality. Use a solid boundary.":
          "This is a strict inequality. Use a dashed boundary.","error");
      return;
    }
    const facet=currentFacet(),oldName=facet.name;
    progress.step++;
    let finishedFacet=false;
    if(progress.step>=facet.rules.length-facet.given){
      progress.done++;
      progress.step=0;
      finishedFacet=true;
    }
    save();choicesReset();
    const message=progress.done===REGION_TOTAL?
      "You've made the whole Aurora Crystal from real shaded regions!":
      finishedFacet?oldName+" complete! The coloured region is part of your crystal.":
        "Correct! The overlapping shaded region is taking shape.";
    setMessage(message,"success");
    render();
  }
  function restart(){
    if(!(win.confirm?.("Start the crystal again? This resets only Graph Art progress.")??true))
      return;
    progress={done:0,step:0,replays:progress.replays+1};
    save();choicesReset();setMessage(
      "A fresh crystal awaits. Start by choosing which side to shade.");
    render();win.scrollTo?.({top:0,behavior:"instant"});
  }
  for(const id of ["regionSideA","regionSideB"])
    $(id).addEventListener("click",()=>sideSelect($(id).dataset.side));
  $("regionSolid").addEventListener("click",()=>boundarySelect("solid"));
  $("regionDashed").addEventListener("click",()=>boundarySelect("dashed"));
  $("regionCheckButton").addEventListener("click",check);
  $("regionHintButton").addEventListener("click",showHint);
  $("regionPlayAgain").addEventListener("click",restart);
  svg.addEventListener("click",clickGraph);
  setMessage(progress.done?"Welcome back! Your finished facets are saved.":
    "Start with the highlighted boundary. Choose a side and line style.");
  render();
  return {check,render,restart,readProgress:()=>({...progress})};
}
if(typeof document!=="undefined"&&document.getElementById("regionGraph")){
  initRegionsApp();
}
