import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  REGION_WORLD,REGION_FACETS,REGION_SAVE_KEY,validateRegionArt,
  intersectRegion,polygonArea,pointSatisfiesAll,regionSide,regionBoundaryStyle,
  regionCorrect,lineOnRegionGraph,evaluateRegionRule
} from "./regions/regions-engine.mjs";
import {
  GRAPH_ART_PICTURES,GRAPH_ART_MODES,GRAPH_ART_SAVE_KEY,graphCellAt,
  graphArrow,validateGraphPictureLibrary
} from "./regions/graph-art-pictures.mjs";
import {initRegionsApp,readGraphArtSave} from "./regions/regions-app.mjs";

test("Both galleries use genuine nonempty inequality intersections",()=>{
  assert.equal(validateRegionArt(),true);
  assert.equal(validateGraphPictureLibrary(),true);
  assert.deepEqual(GRAPH_ART_MODES.map(m=>m.id),["fill","build"]);
  assert.deepEqual(GRAPH_ART_PICTURES.map(p=>[p.id,p.pieces.length]),
    [["little-house",3],["aurora-crystal",5]]);
  assert.equal(GRAPH_ART_PICTURES[1].pieces.length,REGION_FACETS.length);
  for(const picture of GRAPH_ART_PICTURES)for(const part of picture.pieces){
    const polygon=intersectRegion(part.rules);
    assert.ok(polygonArea(polygon)>.1);
    const centroid={x:polygon.reduce((s,p)=>s+p.x,0)/polygon.length,
      y:polygon.reduce((s,p)=>s+p.y,0)/polygon.length};
    assert.equal(pointSatisfiesAll(part.rules,centroid.x,centroid.y),true,
      part.id+" centroid should satisfy every inequality");
    for(const r of part.rules){
      assert.equal(lineOnRegionGraph(r).length,2);
      for(const v of polygon)
        assert.ok(evaluateRegionRule(r,v.x,v.y)<1e-7);
      assert.ok(["above","below","left","right"].includes(regionSide(r)));
      assert.ok(["solid","dashed"].includes(regionBoundaryStyle(r)));
      assert.equal(regionCorrect(r,regionSide(r),regionBoundaryStyle(r)),true);
      const arrow=graphArrow(r,polygon);
      assert.ok(arrow,part.id+" missing arrow for "+r.text);
      assert.ok(evaluateRegionRule(r,arrow.x2,arrow.y2)<
        evaluateRegionRule(r,arrow.x1,arrow.y1),
        "Arrow should point into the satisfying half-plane: "+r.text);
    }
  }
});
test("Actual graph cells are classified by every inequality",()=>{
  const house=GRAPH_ART_PICTURES[0];
  const walls=house.pieces[0],roof=house.pieces[1],door=house.pieces[2];
  assert.equal(graphCellAt(walls,1,0).correct,true);
  assert.equal(graphCellAt(walls,4,0).correct,false);
  assert.equal(graphCellAt(roof,0,2).correct,true);
  assert.equal(graphCellAt(roof,0,-2).correct,false);
  assert.equal(graphCellAt(door,0,-2).correct,true);
  assert.equal(graphCellAt(door,2,-2).correct,false);
  assert.equal(graphCellAt(walls,2.5,0),null,"Boundary taps are not guesses");
  assert.equal(graphCellAt(roof,0,1),null);
  assert.equal(graphCellAt(roof,10,0),null);
  for(const part of [...house.pieces,...GRAPH_ART_PICTURES[1].pieces]){
    const points=intersectRegion(part.rules);
    const x=points.reduce((sum,p)=>sum+p.x,0)/points.length;
    const y=points.reduce((sum,p)=>sum+p.y,0)/points.length;
    const region=graphCellAt(part,x,y);
    assert.ok(region?.correct,part.id);
    assert.ok(Math.abs(polygonArea(region.polygon)-polygonArea(points))<1e-7);
  }
});
test("Saves are separate by picture and mode, and invalid data is discarded",()=>{
  const db=new Map();
  const storage={getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,v)};
  assert.deepEqual(readGraphArtSave(storage),{
    mode:"fill",picture:"little-house",records:{}});
  db.set(GRAPH_ART_SAVE_KEY,JSON.stringify({
    mode:"build",picture:"aurora-crystal",records:{
      "build:aurora-crystal":{done:2,line:2,replays:1},
      "fill:little-house":{done:3,line:0,replays:0},
      "build:little-house":{done:99,line:0,replays:0}
    }}));
  const saved=readGraphArtSave(storage);
  assert.equal(saved.mode,"build");
  assert.deepEqual(saved.records["build:aurora-crystal"],{done:2,line:2,replays:1});
  assert.equal(saved.records["fill:little-house"].done,3);
  assert.equal(saved.records["build:little-house"],undefined);
  db.set(GRAPH_ART_SAVE_KEY,"broken");
  assert.equal(readGraphArtSave(storage).mode,"fill");
});
test("Graph studio remains independent, responsive and self-contained",()=>{
  const page=readFileSync(new URL("./regions/index.html",import.meta.url),"utf8");
  const main=readFileSync(new URL("./index.html",import.meta.url),"utf8");
  const css=readFileSync(new URL("./regions/regions.css",import.meta.url),"utf8");
  const app=readFileSync(new URL("./regions/regions-app.mjs",import.meta.url),"utf8");
  assert.ok(main.includes('class="studio-tab" href="./regions/"'));
  assert.ok(page.includes('class="studio-tab is-active" href="./" aria-current="page"'));
  assert.match(page,/src="\.\/regions-app\.mjs(?:\?[^"]*)?"/);
  assert.match(page,/href="\.\/regions\.css(?:\?[^"]*)?"/);
  assert.ok(!page.includes('src="../app.mjs"'));
  const ids=[...page.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size);
  for(const id of ["graphPicker","graphPlay","graphArtGraph","graphModeFill",
    "graphModeBuild","graphPictureCards","graphRuleList","graphCheckFill",
    "graphUndoFill","graphSideA","graphSideB","graphSolid","graphDashed",
    "graphAddLine","graphFeedback","graphHint","graphHintText","graphReveal",
    "graphRevealSvg","graphRevealSkip","graphRevealClose","graphReplayReveal"]){
    assert.ok(ids.includes(id),"Missing "+id);
  }
  assert.ok(page.includes('aria-live="polite"'));
  assert.ok(page.includes('tabindex="0"'));
  assert.ok(app.includes('prefers-reduced-motion: reduce'));
  assert.ok(app.includes('a.download="inequality-ink-"+picture().id+".png"'));
  assert.ok(css.includes("@media(max-width:780px)"));
  assert.ok(css.includes("height:100dvh"));
  assert.ok(!/\b(Foundation|4MA1)\b/i.test(page));
});

// Deterministic small DOM avoids browser/third-party dependencies in CI.
class Element{
  constructor(tag="div"){
    this.tagName=tag;this.attrs={};this.children=[];
    this.textContent="";this.className="";this.hidden=false;this.dataset={};
    this.disabled=false;this.style={setProperty:(name,v)=>{this.style[name]=v}};
    this.listeners=new Map();this.names=new Set();
    this.classList={add:x=>this.names.add(x),remove:x=>this.names.delete(x),
      contains:x=>this.names.has(x),
      toggle:(x,on)=>{on?this.names.add(x):this.names.delete(x);return !!on}};
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
      target:this,clientX:0,clientY:0,preventDefault(){},...data});
  }
  click(data={}){this.fire("click",data);}
  getBoundingClientRect(){return {left:0,top:0,width:620,height:620};}
  querySelectorAll(selector){
    if(selector==="[data-direction-arrow]")
      return this.children.filter(n=>n.getAttribute("data-direction-arrow")!==null);
    return [];
  }
  showModal(){this.setAttribute("open","");}
  close(){this.removeAttribute("open");}
}
function fakeDoc(){
  const html=readFileSync(new URL("./regions/index.html",import.meta.url),"utf8");
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  const elements=new Map(ids.map(id=>[id,new Element(id)]));
  return {getElementById:id=>{
      if(!elements.has(id))throw Error("Missing element "+id);
      return elements.get(id);
    },
    createElement:tag=>new Element(tag),
    createElementNS:(_ns,tag)=>new Element(tag)
  };
}
function session(){
  const doc=fakeDoc(),store=new Map([
    ["inequality-ink-v5","keep-pixel-save"],
    ["inequality-ink-quadratic-quest-v2","keep-quadratic-save"]
  ]);
  const timers=[];
  const win={setTimeout:fn=>{timers.push(fn);return timers.length;},
    clearTimeout:()=>{},matchMedia:()=>({matches:false})};
  const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
  const app=initRegionsApp({doc,storage,win});
  const $=doc.getElementById;
  return {doc,store,storage,timers,win,app,$};
}
test("Find & Fill rejects wrong regions and checks provisional correct fills",()=>{
  const s=session(),{$,app,store}=s;
  assert.equal($("graphPicker").hidden,false);
  $("graphPictureCards").children[0].click();
  assert.equal($("graphPlay").hidden,false);
  assert.equal($("graphRuleList").children.length,4);
  app.pickAt(4,0);
  assert.match($("graphFeedback").textContent,/Not quite/);
  assert.equal(app.readProgress().records["fill:little-house"].done,0);
  app.checkFill();
  assert.match($("graphFeedback").textContent,/First fill/);
  app.pickAt(1,0);
  assert.ok($("graphArtGraph").children.some(x=>
    x.getAttribute("data-region-layer")==="selection"));
  app.checkFill();
  assert.equal(app.readProgress().records["fill:little-house"].done,1);
  app.pickAt(0,2);app.checkFill();
  app.pickAt(0,-2);app.checkFill();
  assert.equal($("graphSummary").hidden,false);
  assert.equal($("graphReveal").getAttribute("open"),"");
  app.showFinished();
  assert.equal($("graphRevealSkip").hidden,true);
  assert.equal($("graphDownload").hidden,false);
  $("graphRevealClose").click();
  assert.equal($("graphSummary").hidden,false);
  assert.equal(store.get("inequality-ink-v5"),"keep-pixel-save");
  assert.equal(store.get("inequality-ink-quadratic-quest-v2"),"keep-quadratic-save");
});
test("Build & Shade requires correct sides and styles, commits whole pieces",()=>{
  const s=session(),{$,app,timers}=s;
  $("graphModeBuild").click();
  $("graphPictureCards").children[0].click();
  assert.equal($("graphBuildControls").hidden,false);
  const p=GRAPH_ART_PICTURES[0];
  for(const [pi,part] of p.pieces.entries()){
    for(const rr of part.rules){
      const side=regionSide(rr),button=[$("graphSideA"),$("graphSideB")]
        .find(b=>b.dataset.side===side);
      assert.ok(button,"Missing correct direction for "+rr.text);
      button.click();
      $(rr.inclusive?"graphSolid":"graphDashed").click();
      $("graphAddLine").click();
    }
    // Timed green pulse must finish before the next region begins.
    timers.at(-1)();
    assert.equal(app.readProgress().records["build:little-house"].done,pi+1);
  }
  assert.equal($("graphSummary").hidden,false);
  assert.equal($("graphReveal").getAttribute("open"),"");
});
test("Keyboard can navigate the fill canvas and saved partial build resumes",()=>{
  const s=session(),{$,app,store}=s;
  $("graphPictureCards").children[0].click();
  $("graphArtGraph").fire("keydown",{key:"ArrowRight"});
  assert.match($("graphFeedback").textContent,/Cursor at/);
  $("graphArtGraph").fire("keydown",{key:"Enter"});
  assert.ok($("graphArtGraph").children.some(x=>
    x.getAttribute("data-region-layer")==="selection"));
  $("graphBack").click();
  $("graphModeBuild").click();
  $("graphPictureCards").children[0].click();
  $("graphSideB").click();$("graphSolid").click();$("graphAddLine").click();
  // If incorrect there is no false progress.
  assert.equal(app.readProgress().records["build:little-house"].line,0);
  $("graphSideA").click();$("graphAddLine").click();
  assert.equal(app.readProgress().records["build:little-house"].line,1);
  assert.equal(JSON.parse(store.get(GRAPH_ART_SAVE_KEY)).records["build:little-house"].line,1);
});
