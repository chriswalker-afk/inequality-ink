import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  initPlotArt,PLOT_SAVE_KEY,readPlotSave
} from "./regions/plot-art.mjs";
import {PLOT_PICTURE} from "./regions/plot-pictures.mjs";

class Element{
  constructor(tag="div"){
    this.tagName=tag;this.attrs={};this.children=[];
    this.textContent="";this.className="";this.hidden=false;this.disabled=false;
    this.style={};this.listeners=new Map();this.names=new Set();
    this.classList={add:x=>this.names.add(x),contains:x=>this.names.has(x)};
  }
  setAttribute(k,v){this.attrs[k]=String(v);}
  getAttribute(k){return this.attrs[k]??null;}
  removeAttribute(k){delete this.attrs[k];}
  append(...nodes){this.children.push(...nodes.filter(Boolean));}
  replaceChildren(...nodes){this.children=[];this.append(...nodes);}
  addEventListener(name,fn){
    if(!this.listeners.has(name))this.listeners.set(name,[]);
    this.listeners.get(name).push(fn);
  }
  fire(name,data={}){
    for(const fn of this.listeners.get(name)||[])fn({
      target:this,clientX:0,clientY:0,pointerId:1,
      preventDefault(){},...data
    });
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
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const elements=new Map(ids.map(id=>[id,new Element(id)]));
  const doc={
    getElementById:id=>{
      if(!elements.has(id))throw Error("Missing element "+id);
      return elements.get(id);
    },
    createElement:tag=>new Element(tag),
    createElementNS:(_ns,tag)=>new Element(tag)
  };
  // Phase tracker spans are static in the actual HTML, but fake DOM starts
  // empty; add them as real mock child elements for stage-state inspection.
  const tracker=doc.getElementById("plotPhaseTrack");
  for(const step of ["plot","style","shade"]){
    const span=new Element("span");span.setAttribute("data-step",step);
    tracker.append(span);
  }
  const store=new Map([
    ["inequality-ink-graph-art-v2","keep graph art"],
    ["inequality-ink-curve-fill-v2","keep curve art"],
    ["inequality-ink-v5","keep pixel art"],
    ...Object.entries(initial)
  ]);
  const callbacks=new Map();let next=0;
  const win={
    setTimeout:(fn,ms)=>{const id=++next;callbacks.set(id,{fn,ms});return id;},
    clearTimeout:id=>callbacks.delete(id),
    matchMedia:()=>({matches:reduced})
  };
  const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
  const app=initPlotArt({doc,storage,win});
  return {doc,$:doc.getElementById,store,storage,app,callbacks,win};
}
const layers=(s,name)=>s.$("plotGraph").children.filter(
  el=>el.getAttribute("data-region-layer")===name);
const details=svg=>svg.children.filter(
  el=>el.getAttribute("data-plot-detail")!==null);
const constructed=s=>s.$("plotGraph").children.filter(
  el=>el.getAttribute("data-plot-boundary")==="constructed");
function constructCanopy(s){
  s.app.addPoint(0,4);
  s.app.addPoint(2,2);
  s.$("plotCheckGraph").click();
  assert.equal(s.app.readProgress().phase,"style");
  s.$("plotSolid").click();
  s.$("plotCheckStyle").click();
  assert.equal(s.app.readProgress().phase,"shade");
  return s;
}
function constructPuddle(s){
  s.app.addPoint(-2,-3);
  s.app.addPoint(2,-3);
  s.$("plotDockCheck").click();
  assert.equal(s.app.readProgress().phase,"style");
  s.$("plotDashed").click();
  s.$("plotDockCheck").click();
  assert.equal(s.app.readProgress().phase,"shade");
  return s;
}

test("prototype reuses Graph Art panels, feedback, mobile dock and reveal",()=>{
  const html=readFileSync(new URL("./regions/plot.html",import.meta.url),"utf8");
  const css=readFileSync(new URL("./regions/plot-art.css",import.meta.url),"utf8");
  const home=readFileSync(new URL("./regions/index.html",import.meta.url),"utf8");
  for(const marker of [
    'class="topbar"','class="region-workspace graph-workspace plot-workspace"',
    'id="plotGraph"','id="plotPhaseTrack"','class="graph-feedback"',
    'id="plotDockCheck"','id="plotNudgeUp"','id="plotReveal"'
  ])assert.ok(html.includes(marker),marker);
  assert.match(html,/regions\.css/);
  assert.match(home,/href="\.\/plot\.html"/);
  assert.match(css,/#plotGraph\{[^}]*touch-action:none/);
});
test("Plot & Shade starts with one unique picture and preserves all other save keys",()=>{
  const s=session();
  assert.equal(s.$("plotPicker").hidden,false);
  assert.match(s.$("plotGalleryProgress").textContent,/0 of 2/);
  assert.equal(s.$("plotPreviewGraph").children.filter(
    el=>el.getAttribute("data-plot-detail")).length,0);
  s.$("plotPictureCard").click();
  assert.equal(s.$("plotPlay").hidden,false);
  assert.equal(s.$("plotTaskTitle").textContent,"Coral canopy");
  assert.match(s.$("plotMobileEquation").textContent,/y ≤ 4 − 0.5x²/);
  assert.equal(s.$("plotPlotControls").hidden,false);
  assert.equal(s.$("plotStyleControls").hidden,true);
  assert.equal(s.$("plotShadeControls").hidden,true);
  assert.equal(s.store.get("inequality-ink-graph-art-v2"),"keep graph art");
  assert.equal(s.store.get("inequality-ink-curve-fill-v2"),"keep curve art");
  assert.equal(s.store.get("inequality-ink-v5"),"keep pixel art");
});
test("wrong vertex, wrong width and invalid second point produce repairable feedback",()=>{
  const s=session();s.$("plotPictureCard").click();
  s.app.addPoint(0,3);s.app.addPoint(2,1);
  s.$("plotCheckGraph").click();
  assert.match(s.$("plotFeedback").textContent,/turning point/);
  assert.equal(s.app.readProgress().phase,"plot");
  s.app.movePoint(0,0,4);
  s.app.movePoint(1,2,3);
  s.$("plotCheckGraph").click();
  assert.match(s.$("plotFeedback").textContent,/too wide or too narrow/);
  s.app.movePoint(1,0,2);
  s.$("plotCheckGraph").click();
  assert.match(s.$("plotFeedback").textContent,/different x-coordinate/);
  assert.ok(constructed(s).length===0);
  s.app.movePoint(1,2,2);
  s.$("plotCheckGraph").click();
  assert.equal(s.app.readProgress().phase,"style");
  assert.ok(constructed(s).length>0);
});
test("solid or dashed choice must match the inequality",()=>{
  const s=session();s.$("plotPictureCard").click();
  s.app.addPoint(0,4);s.app.addPoint(-2,2);
  s.$("plotCheckGraph").click();
  s.$("plotDashed").click();s.$("plotCheckStyle").click();
  assert.equal(s.app.readProgress().phase,"style");
  assert.match(s.$("plotFeedback").textContent,/solid boundary/);
  s.$("plotEditGraph").click();
  assert.equal(s.app.readProgress().phase,"plot");
  s.$("plotCheckGraph").click();
  s.$("plotSolid").click();s.$("plotCheckStyle").click();
  assert.equal(s.app.readProgress().phase,"shade");
});
test("red region flashes and clears; correct stays until Check; Undo works",()=>{
  const s=session();s.$("plotPictureCard").click();constructCanopy(s);
  s.app.pickAt(0,0);
  assert.ok(layers(s,"wrong").length>0);
  assert.ok(layers(s,"wrong")[0].classList.contains("graph-wrong-flash"));
  assert.match(s.$("plotFeedback").className,/error/);
  const expiry=[...s.callbacks.values()].find(t=>t.ms===950);
  assert.ok(expiry);
  expiry.fn();
  assert.equal(layers(s,"wrong").length,0);
  s.app.pickAt(0,2);
  assert.ok(layers(s,"selection").length>0);
  assert.ok(layers(s,"selection")[0].classList.contains("graph-good-flash"));
  assert.equal(readPlotSave(s.storage).done,0);
  s.$("plotUndoFill").click();
  assert.equal(layers(s,"selection").length,0);
  s.app.pickAt(0,2);
  s.$("plotCheckRegion").click();
  assert.equal(readPlotSave(s.storage).done,1);
  assert.ok(layers(s,"finished-canopy").length>0);
  assert.equal(s.app.readProgress().phase,"plot");
});
test("point placement handles pointer drag, point selection and half-step nudges",()=>{
  const s=session(),svg=s.$("plotGraph");s.$("plotPictureCard").click();
  const x=v=>52+(v+5)*516/10,y=v=>52+(5-v)*516/10;
  svg.fire("pointerdown",{clientX:x(0),clientY:y(4),pointerId:7,button:0});
  assert.deepEqual(s.app.readProgress().points,[{x:0,y:4}]);
  svg.fire("pointerup",{pointerId:7});
  svg.fire("pointerdown",{clientX:x(2),clientY:y(1.5),pointerId:8,button:0});
  svg.fire("pointerup",{pointerId:8});
  assert.deepEqual(s.app.readProgress().points[1],{x:2,y:1.5});
  svg.fire("pointerdown",{clientX:x(2),clientY:y(1.5),pointerId:9,button:0});
  svg.fire("pointermove",{clientX:x(2),clientY:y(2),pointerId:9});
  svg.fire("pointerup",{pointerId:9});
  assert.deepEqual(s.app.readProgress().points[1],{x:2,y:2});
  s.$("plotNudgeLeft").click();
  assert.equal(s.app.readProgress().points[1].x,1.5);
  s.$("plotNudgeRight").click();
  assert.equal(s.app.readProgress().points[1].x,2);
  s.$("plotDockCheck").click();
  assert.equal(s.app.readProgress().phase,"style");
});
test("keyboard plotting and dock actions work without mouse or touch",()=>{
  const s=session();s.$("plotPictureCard").click();
  const svg=s.$("plotGraph");
  for(let i=0;i<8;i++)svg.fire("keydown",{key:"ArrowUp"});
  svg.fire("keydown",{key:"Enter"});
  for(let i=0;i<4;i++)svg.fire("keydown",{key:"ArrowRight"});
  for(let i=0;i<4;i++)svg.fire("keydown",{key:"ArrowDown"});
  svg.fire("keydown",{key:"Enter"});
  assert.deepEqual(s.app.readProgress().points,[{x:0,y:4},{x:2,y:2}]);
  s.$("plotDockCheck").click();
  assert.equal(s.app.readProgress().phase,"style");
  s.$("plotDockUndo").click();
  assert.equal(s.app.readProgress().phase,"plot");
});
test("partial plotting and style selections survive reload, without trusting invalid saves",()=>{
  const s=session();s.$("plotPictureCard").click();
  s.app.addPoint(0,4);s.app.addPoint(2,2);
  s.$("plotCheckGraph").click();s.$("plotSolid").click();
  const after=session(Object.fromEntries(s.store));
  assert.equal(after.app.readProgress().phase,"style");
  assert.deepEqual(after.app.readProgress().points,[{x:0,y:4},{x:2,y:2}]);
  after.$("plotPictureCard").click();
  after.$("plotCheckStyle").click();
  assert.equal(after.app.readProgress().phase,"shade");
  const again=session(Object.fromEntries(after.store));
  again.$("plotPictureCard").click();
  assert.equal(again.app.readProgress().phase,"shade");
  const corrupted=session({[PLOT_SAVE_KEY]:JSON.stringify({
    done:0,phase:"shade",points:[{x:0,y:0},{x:1,y:1}],styleChoice:"solid"
  })});
  assert.equal(corrupted.app.readProgress().phase,"plot");
  assert.equal(corrupted.app.readProgress().done,0);
});
test("two plot–style–shade pieces lead to the full staged Big Reveal and PNG action",()=>{
  const s=session();s.$("plotPictureCard").click();
  constructCanopy(s);
  s.app.pickAt(0,2);s.$("plotCheckRegion").click();
  assert.equal(readPlotSave(s.storage).done,1);
  constructPuddle(s);
  // The strict horizontal boundary is dashed and remains visible.
  assert.ok(constructed(s).some(n=>n.getAttribute("stroke-dasharray")==="8 7"));
  s.app.pickAt(0,-3.5);s.$("plotDockCheck").click();
  assert.equal(readPlotSave(s.storage).done,2);
  assert.equal(s.$("plotSummary").hidden,false);
  assert.equal(s.$("plotReveal").getAttribute("open"),"");
  const board=s.$("plotRevealSvg");
  const staged=[...s.callbacks.values()].sort((a,b)=>a.ms-b.ms);
  assert.equal(staged.length,6);
  staged[0].fn();staged[1].fn();
  assert.equal(board.children.filter(n=>n.getAttribute("data-reveal-piece")).length,2);
  assert.equal(details(board).length,0);
  staged[2].fn();
  assert.ok(details(board).some(n=>n.getAttribute("data-plot-detail")==="canopy-rib-left"));
  assert.ok(!details(board).some(n=>n.getAttribute("data-plot-detail")==="umbrella-shaft"));
  staged[3].fn();
  assert.ok(details(board).some(n=>n.getAttribute("data-plot-detail")==="umbrella-shaft"));
  staged[4].fn();
  assert.ok(details(board).some(n=>n.getAttribute("data-plot-detail")==="spark-left"));
  s.$("plotRevealSkip").click();
  assert.equal(s.callbacks.size,0);
  assert.equal(s.$("plotDownload").hidden,false);
  s.$("plotRevealAgain").click();
  assert.equal(details(board).length,0);
  s.$("plotRevealClose").click();
  assert.equal(s.$("plotReveal").getAttribute("open"),null);
  assert.equal(s.$("plotSummary").hidden,false);
  s.$("plotChooseAgain").click();
  assert.ok(details(s.$("plotPreviewGraph")).length>=14);
  assert.match(s.$("plotCardAction").textContent,/Finished/);
  s.$("plotPictureCard").click();
  assert.equal(readPlotSave(s.storage).done,0);
});
test("reduced-motion users receive finished artwork immediately",()=>{
  const s=session({[PLOT_SAVE_KEY]:JSON.stringify({
    done:1,phase:"plot",points:[],styleChoice:null,replays:0
  })},true);
  s.$("plotPictureCard").click();
  constructPuddle(s);
  s.app.pickAt(0,-3.5);s.app.checkRegion();
  assert.equal(s.$("plotDownload").hidden,false);
  assert.ok(details(s.$("plotRevealSvg")).length>=14);
  assert.equal(s.callbacks.size,0);
});
