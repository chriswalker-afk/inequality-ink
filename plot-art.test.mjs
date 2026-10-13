import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {initPlotArt,PLOT_SAVE_KEY,PLOT_SAVE_KEY_V2,readPlotSave}
  from "./regions/plot-art.mjs";
import {PLOT_PICTURES,plotSteps,plotRule} from "./regions/plot-pictures.mjs";
import {satisfiesAll,curvedCellAt} from "./regions/curved-engine.mjs";

class Element{
  constructor(tag="div"){
    this.tagName=tag;this.attrs={};this.children=[];
    this.textContent="";this.className="";this.hidden=false;this.disabled=false;
    this.style={};this.listeners=new Map();this.names=new Set();
    this.classList={add:name=>this.names.add(name),
      contains:name=>this.names.has(name)};
  }
  setAttribute(name,val){this.attrs[name]=String(val);}
  getAttribute(name){return this.attrs[name]??null;}
  removeAttribute(name){delete this.attrs[name];}
  append(...nodes){this.children.push(...nodes.filter(Boolean));}
  replaceChildren(...nodes){this.children=[];this.append(...nodes);}
  addEventListener(name,fn){
    if(!this.listeners.has(name))this.listeners.set(name,[]);
    this.listeners.get(name).push(fn);
  }
  fire(name,props={}){
    for(const fn of this.listeners.get(name)||[])fn({
      target:this,clientX:0,clientY:0,pointerId:1,
      preventDefault(){},...props});
  }
  click(){if(!this.disabled)this.fire("click");}
  getBoundingClientRect(){return {left:0,top:0,width:620,height:620};}
  setPointerCapture(id){this.capturedId=id;}
  releasePointerCapture(id){if(this.capturedId===id)this.capturedId=null;}
  showModal(){this.setAttribute("open","");}
  close(){this.removeAttribute("open");}
}
function session(initial={},reduced=false){
  const html=readFileSync(new URL("./regions/plot.html",import.meta.url),"utf8");
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  const elements=new Map(ids.map(id=>[id,new Element(id)]));
  const doc={
    getElementById:id=>{
      if(!elements.has(id))throw Error("Missing "+id);
      return elements.get(id);
    },
    createElement:tag=>new Element(tag),
    createElementNS:(_ns,tag)=>new Element(tag)
  };
  const tracker=doc.getElementById("plotPhaseTrack");
  for(const step of ["plot","style","shade"]){
    const node=new Element("span");
    node.setAttribute("data-step",step);
    tracker.append(node);
  }
  const store=new Map([
    ["inequality-ink-graph-art-v2","keep graph art"],
    ["inequality-ink-curve-fill-v2","keep curve art"],
    ["inequality-ink-v5","keep pixel art"],
    ...Object.entries(initial)
  ]);
  const timers=new Map();let next=0;
  const win={
    setTimeout:(fn,ms)=>{const id=++next;timers.set(id,{fn,ms});return id;},
    clearTimeout:id=>timers.delete(id),
    matchMedia:()=>({matches:reduced})
  };
  const storage={getItem:key=>store.get(key)||null,
    setItem:(key,val)=>store.set(key,val)};
  const app=initPlotArt({doc,storage,win});
  return {doc,$:doc.getElementById,store,storage,app,timers,win};
}
const layers=(s,name)=>s.$("plotGraph").children.filter(el=>
  el.getAttribute("data-region-layer")===name);
const details=svg=>svg.children.filter(el=>
  el.getAttribute("data-plot-detail")!==null);
const cards=s=>s.$("plotPictureCards").children;
function spotFor(part){
  for(let x=-4.5;x<=4.5;x+=.25)
    for(let y=-4.5;y<=4.5;y+=.25)
      if(satisfiesAll(part.rules,x,y)&&curvedCellAt(part.rules,x,y)?.correct)
        return {x,y};
  throw Error("No selectable point for "+part.id);
}
function plotBoundary(s,part,stepIndex,viaDock=false){
  const task=plotSteps(part)[stepIndex],rule=plotRule(part,stepIndex);
  assert.equal(s.app.readProgress().phase,"plot");
  assert.equal(s.app.readProgress().plotIndex,stepIndex);
  for(const point of task.samplePoints)
    s.app.addPoint(point.x,point.y);
  (viaDock?s.$("plotDockCheck"):s.$("plotCheckGraph")).click();
  assert.equal(s.app.readProgress().phase,"style",
    "Expected style step for "+task.ruleId);
  s.$(rule.inclusive?"plotSolid":"plotDashed").click();
  (viaDock?s.$("plotDockCheck"):s.$("plotCheckStyle")).click();
  const progress=s.app.readProgress();
  assert.equal(progress.plotIndex,stepIndex+1);
  assert.equal(progress.verified.length,stepIndex+1);
}
function completePicture(s,p){
  for(const [index,part]of p.pieces.entries()){
    assert.equal(s.app.readProgress().done,index);
    for(let stepIndex=0;stepIndex<plotSteps(part).length;stepIndex++)
      plotBoundary(s,part,stepIndex,index%2===1);
    assert.equal(s.app.readProgress().phase,"shade");
    const spot=spotFor(part);
    s.app.pickAt(spot.x,spot.y);
    assert.ok(layers(s,"selection").length>0,
      "Correct region should stay filled for "+part.id);
    s.$("plotCheckRegion").click();
  }
  assert.equal(s.app.readProgress().done,p.pieces.length);
  assert.equal(s.$("plotSummary").hidden,false);
  assert.equal(s.$("plotReveal").getAttribute("open"),"");
  s.$("plotRevealSkip").click();
  assert.equal(s.$("plotDownload").hidden,false);
  assert.ok(details(s.$("plotRevealSvg")).length>=10);
  s.$("plotRevealClose").click();
}

test("Graph Art appearance, five-stage cards, and mobile dock are present",()=>{
  const page=readFileSync(new URL("./regions/plot.html",import.meta.url),"utf8");
  const css=readFileSync(new URL("./regions/plot-art.css",import.meta.url),"utf8");
  const home=readFileSync(new URL("./regions/index.html",import.meta.url),"utf8");
  for(const id of ["plotPictureCards","plotStageTrack","plotGameMode",
    "plotBoundaryCount","plotGraph","plotDockCheck","plotReveal",
    "plotNextPicture","plotNudgeUp"])
    assert.ok(page.includes('id="'+id+'"'),"Missing "+id);
  assert.match(page,/regions\.css/);
  assert.match(page,/class="region-workspace graph-workspace plot-workspace"/);
  assert.match(page,/class="graph-feedback"/);
  assert.match(home,/href="\.\/plot\.html"/);
  assert.match(css,/#plotGraph\{[^}]*touch-action:none/);
  assert.ok(!page.includes("STARTER PROTOTYPE"));
  const s=session();
  assert.equal(cards(s).length,5);
  assert.equal(s.$("plotStageTrack").children.length,5);
  assert.match(s.$("plotGalleryProgress").textContent,/0 of 5/);
  assert.equal(cards(s)[4].getAttribute("data-plot-picture"),"rocket-launch");
});

test("all five unique picture galleries, progress and switch/resume work",()=>{
  const s=session();
  cards(s)[0].click();
  assert.equal(s.$("plotPlay").hidden,false);
  assert.equal(s.$("plotGameTitle").textContent,"Little Umbrella");
  const part=PLOT_PICTURES[0].pieces[0];
  s.app.addPoint(0,4);s.app.addPoint(2,2);
  s.$("plotCheckGraph").click();s.$("plotSolid").click();
  s.$("plotCheckStyle").click();
  s.app.pickAt(0,2);s.$("plotCheckRegion").click();
  s.$("plotBack").click();
  assert.match(cards(s)[0].children[1].children.at(-1).textContent,/Continue/);
  cards(s)[1].click();
  assert.equal(s.$("plotGameTitle").textContent,"Ice Cream Dream");
  assert.match(s.$("plotGameMode").textContent,/STEP 2/);
  assert.equal(s.$("plotTaskTitle").textContent,"Waffle cone");
  assert.equal(s.app.readProgress().done,0);
  s.$("plotBack").click();
  cards(s)[0].click();
  assert.equal(s.app.readProgress().done,1);
  assert.equal(s.$("plotTaskTitle").textContent,part.id==="canopy"?"Blue puddle":"Blue puddle");
});
test("wrong plot errors remain editable; a solid/dashed error is actionable",()=>{
  const s=session();cards(s)[0].click();
  s.app.addPoint(0,3);s.app.addPoint(2,1);
  s.$("plotCheckGraph").click();
  assert.match(s.$("plotFeedback").textContent,/turning point/);
  assert.equal(s.app.readProgress().phase,"plot");
  s.app.movePoint(0,0,4);s.app.movePoint(1,2,3);
  s.$("plotCheckGraph").click();
  assert.match(s.$("plotFeedback").textContent,/too wide or too narrow/);
  s.app.movePoint(1,2,2);
  s.$("plotCheckGraph").click();
  assert.equal(s.app.readProgress().phase,"style");
  s.$("plotDashed").click();s.$("plotCheckStyle").click();
  assert.equal(s.app.readProgress().phase,"style");
  assert.match(s.$("plotFeedback").textContent,/solid boundary/);
  s.$("plotSolid").click();s.$("plotCheckStyle").click();
  assert.equal(s.app.readProgress().phase,"shade");
});
test("wrong shaded sign cells flash red and clear; correct stays until Check",()=>{
  const s=session();cards(s)[0].click();
  plotBoundary(s,PLOT_PICTURES[0].pieces[0],0);
  s.app.pickAt(0,0);
  assert.ok(layers(s,"wrong").length>0);
  assert.ok(layers(s,"wrong")[0].classList.contains("graph-wrong-flash"));
  assert.match(s.$("plotFeedback").className,/error/);
  const expiry=[...s.timers.values()].find(t=>t.ms===950);
  assert.ok(expiry);expiry.fn();
  assert.equal(layers(s,"wrong").length,0);
  s.app.pickAt(0,2);
  assert.ok(layers(s,"selection")[0].classList.contains("graph-good-flash"));
  s.$("plotUndoFill").click();
  assert.equal(layers(s,"selection").length,0);
  s.app.pickAt(0,2);s.$("plotCheckRegion").click();
  assert.equal(s.app.readProgress().done,1);
  assert.ok(layers(s,"finished-canopy").length>0);
});
test("point dragging, nudge controls and keyboard stay available",()=>{
  const s=session();cards(s)[0].click();
  const svg=s.$("plotGraph");
  const px=x=>52+(x+5)*516/10,py=y=>52+(5-y)*516/10;
  svg.fire("pointerdown",{clientX:px(0),clientY:py(4),pointerId:7,button:0});
  svg.fire("pointerup",{pointerId:7});
  svg.fire("pointerdown",{clientX:px(2),clientY:py(1.5),pointerId:8,button:0});
  svg.fire("pointerup",{pointerId:8});
  assert.deepEqual(s.app.readProgress().points[1],{x:2,y:1.5});
  svg.fire("pointerdown",{clientX:px(2),clientY:py(1.5),pointerId:9,button:0});
  svg.fire("pointermove",{clientX:px(2),clientY:py(2),pointerId:9});
  svg.fire("pointerup",{pointerId:9});
  assert.deepEqual(s.app.readProgress().points[1],{x:2,y:2});
  s.$("plotNudgeLeft").click();
  assert.equal(s.app.readProgress().points[1].x,1.5);
  s.$("plotNudgeRight").click();
  assert.equal(s.app.readProgress().points[1].x,2);
  s.$("plotDockCheck").click();
  assert.equal(s.app.readProgress().phase,"style");
  s.$("plotDockUndo").click();
  assert.equal(s.app.readProgress().phase,"plot");
});
test("multi-boundary pieces progress plot → style → plot → style → shade",()=>{
  const s=session();
  s.app.choose("rainbow-gate");
  const part=PLOT_PICTURES[2].pieces[0];
  assert.equal(plotSteps(part).length,2);
  assert.match(s.$("plotBoundaryCount").textContent,/Boundary 1 of 2/);
  plotBoundary(s,part,0);
  assert.equal(s.app.readProgress().phase,"plot");
  assert.match(s.$("plotBoundaryCount").textContent,/Boundary 2 of 2/);
  assert.match(s.$("plotRuleList").children[0].children[1].textContent,/BUILT/);
  plotBoundary(s,part,1);
  assert.equal(s.app.readProgress().phase,"shade");
  assert.equal(s.app.readProgress().verified.length,2);
  const spot=spotFor(part);s.app.pickAt(spot.x,spot.y);
  s.$("plotCheckRegion").click();
  assert.equal(s.app.readProgress().done,1);
  assert.match(s.$("plotRuleList").children[0].children[1].textContent,/REUSED/);
});
test("partial completed boundary and style choice survive a reload",()=>{
  const s=session();s.app.choose("moonlight-lantern");
  const part=PLOT_PICTURES[3].pieces[0];
  plotBoundary(s,part,0);
  assert.equal(s.app.readProgress().verified.length,1);
  const second=plotSteps(part)[1];
  for(const point of second.samplePoints)s.app.addPoint(point.x,point.y);
  s.$("plotCheckGraph").click();s.$("plotSolid").click();
  const reloaded=session(Object.fromEntries(s.store));
  assert.equal(reloaded.app.readProgress().picture,"moonlight-lantern");
  assert.equal(reloaded.app.readProgress().plotIndex,1);
  assert.equal(reloaded.app.readProgress().phase,"style");
  reloaded.app.start();reloaded.$("plotCheckStyle").click();
  assert.equal(reloaded.app.readProgress().phase,"shade");
  assert.equal(reloaded.app.readProgress().verified.length,2);
  assert.equal(reloaded.store.get("inequality-ink-v5"),"keep pixel art");
  assert.equal(reloaded.store.get("inequality-ink-curve-fill-v2"),"keep curve art");
  assert.equal(reloaded.store.get("inequality-ink-graph-art-v2"),"keep graph art");
});
test("original Umbrella save migrates without erasure, including shade mode",()=>{
  const previous=JSON.stringify({done:1,phase:"shade",
    points:[{x:-2,y:-3},{x:2,y:-3}],styleChoice:"dashed",replays:4});
  const s=session({[PLOT_SAVE_KEY]:previous});
  assert.equal(s.app.readProgress().picture,"little-umbrella");
  assert.equal(s.app.readProgress().done,1);
  assert.equal(s.app.readProgress().phase,"shade");
  s.app.start();
  s.app.pickAt(0,-3.5);s.$("plotCheckRegion").click();
  assert.equal(s.app.readProgress().done,2);
  assert.equal(s.store.get(PLOT_SAVE_KEY),previous);
  assert.equal(JSON.parse(s.store.get(PLOT_SAVE_KEY_V2)).
    records["little-umbrella"].done,2);
});
test("complete five-picture journey includes 21 regions and unique big reveals",()=>{
  const s=session();let total=0;
  for(let i=0;i<PLOT_PICTURES.length;i++){
    const p=PLOT_PICTURES[i];
    s.app.choose(p.id);
    assert.equal(s.$("plotGameTitle").textContent,p.name);
    completePicture(s,p);
    total+=p.pieces.length;
    assert.equal(s.$("plotNextPicture").hidden,i===4);
    s.$("plotChooseAgain").click();
    assert.ok(details(cards(s)[i].children[0]).length>=10);
    assert.match(s.$("plotGalleryProgress").textContent,
      new RegExp((i+1)+" of 5"));
  }
  assert.equal(total,21);
  assert.match(s.$("plotGalleryProgress").textContent,/All five stages complete/);
  const saved=readPlotSave(s.storage);
  assert.equal(Object.keys(saved.records).length,5);
  cards(s)[4].click();
  assert.equal(s.app.readProgress().done,PLOT_PICTURES[4].pieces.length);
  assert.equal(s.$("plotSummary").hidden,false);
  assert.equal(s.$("plotReveal").getAttribute("open"),"");
  s.$("plotRevealClose").click();
  s.win.confirm=()=>false;
  s.$("plotRestart").click();
  assert.equal(s.app.readProgress().done,PLOT_PICTURES[4].pieces.length,
    "Cancelling Restart must not discard finished artwork");
  s.win.confirm=()=>true;
  s.$("plotRestart").click();
  assert.equal(s.app.readProgress().done,0);
  assert.equal(s.$("plotPlay").hidden,false);
  assert.equal(s.app.readProgress().records["little-umbrella"].done,2);
});
test("staged final reveal animates details and supports replay, skip and reduced motion",()=>{
  const s=session({[PLOT_SAVE_KEY_V2]:JSON.stringify({
    picture:"little-umbrella",records:{"little-umbrella":{
      done:1,phase:"plot",plotIndex:0,verified:[],points:[],
      styleChoice:null,replays:0}}
  })});
  s.app.start();
  plotBoundary(s,PLOT_PICTURES[0].pieces[1],0);
  s.app.pickAt(0,-3.5);s.$("plotCheckRegion").click();
  const event=[...s.timers.values()].sort((a,b)=>a.ms-b.ms);
  assert.equal(event.length,6);
  const board=s.$("plotRevealSvg");
  event[0].fn();event[1].fn();
  assert.equal(board.children.filter(n=>n.getAttribute("data-reveal-piece")).length,2);
  assert.equal(details(board).length,0);
  event[2].fn();
  assert.ok(details(board).some(n=>n.getAttribute("data-plot-detail")==="canopy-rib-left"));
  event[3].fn();
  assert.ok(details(board).some(n=>n.getAttribute("data-plot-detail")==="umbrella-shaft"));
  event[4].fn();
  assert.ok(details(board).some(n=>n.getAttribute("data-plot-detail")==="spark-left"));
  s.$("plotRevealSkip").click();
  assert.equal(s.timers.size,0);
  s.$("plotRevealAgain").click();
  assert.equal(details(board).length,0);
  s.$("plotRevealClose").click();
  assert.equal(s.$("plotReveal").getAttribute("open"),null);
  const reduced=session({[PLOT_SAVE_KEY_V2]:JSON.stringify({
    picture:"little-umbrella",records:{"little-umbrella":{
      done:1,phase:"plot",plotIndex:0,verified:[],points:[],
      styleChoice:null,replays:0}}
  })},true);
  reduced.app.start();
  plotBoundary(reduced,PLOT_PICTURES[0].pieces[1],0);
  reduced.app.pickAt(0,-3.5);reduced.$("plotCheckRegion").click();
  assert.equal(reduced.$("plotDownload").hidden,false);
  assert.ok(details(reduced.$("plotRevealSvg")).length>=10);
  assert.equal(reduced.timers.size,0);
});
test("corrupted save cannot skip mathematical plotting or shade",()=>{
  const bad={picture:"rocket-launch",records:{"rocket-launch":{
    done:0,phase:"shade",plotIndex:2,verified:[],
    points:[{x:0,y:4},{x:1,y:2}],styleChoice:"solid",replays:1
  }}};
  const s=session({[PLOT_SAVE_KEY_V2]:JSON.stringify(bad)});
  assert.equal(s.app.readProgress().phase,"plot");
  assert.equal(s.app.readProgress().plotIndex,0);
  assert.equal(s.app.readProgress().verified.length,0);
});
