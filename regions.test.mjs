import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  REGION_WORLD,REGION_FACETS,validateRegionArt,
  intersectRegion,polygonArea,pointSatisfiesAll,regionSide,
  regionBoundaryStyle,regionCorrect,lineOnRegionGraph,evaluateRegionRule
} from "./regions/regions-engine.mjs";
import {
  GRAPH_ART_PICTURES,GRAPH_ART_MODES,GRAPH_ART_STAGES,
  GRAPH_ART_SAVE_KEY,graphPicture,graphModeGallery,graphLegacyExtras,
  graphTotalBoundaries,graphCellAt,graphArrow,validateGraphPictureLibrary
} from "./regions/graph-art-pictures.mjs";
import {initRegionsApp,readGraphArtSave} from "./regions/regions-app.mjs";

const modePictures=mode=>graphModeGallery(mode);
const centroid=polygon=>({
  x:polygon.reduce((s,p)=>s+p.x,0)/polygon.length,
  y:polygon.reduce((s,p)=>s+p.y,0)/polygon.length
});
const close=(a,b)=>Math.abs(a-b)<1e-6;

test("Each Graph Art mode has five UNIQUE staged pictures with increasing piece counts",()=>{
  assert.equal(validateRegionArt(),true);
  assert.equal(validateGraphPictureLibrary(),true);
  assert.deepEqual(GRAPH_ART_STAGES.map(s=>s.name),
    ["Starter","Step Up","Building","Challenge","Big Finish"]);
  assert.deepEqual(GRAPH_ART_MODES.map(m=>m.id),["fill","build"]);
  assert.deepEqual(modePictures("fill").map(p=>p.pieces.length),[2,3,4,6,9]);
  assert.deepEqual(modePictures("build").map(p=>p.pieces.length),[2,3,4,5,8]);
  assert.deepEqual(modePictures("fill").map(p=>p.id),[
    "signal-flag","little-house","sailboat-sunset","origami-fox","cosmic-rocket"]);
  assert.deepEqual(modePictures("build").map(p=>p.id),[
    "wrapped-gift","mountain-morning","friendly-robot",
    "aurora-crystal","moonlit-castle"]);
  const ids=GRAPH_ART_PICTURES.map(p=>p.id);
  assert.equal(ids.length,10);
  assert.equal(new Set(ids).size,10,"No picture may be shared by the two modes");
  assert.equal(graphPicture("nonexistent"),null);
  assert.equal(modePictures("nonexistent").length,0);
  assert.deepEqual(GRAPH_ART_PICTURES.map(p=>p.step).sort((a,b)=>a-b),
    [1,1,2,2,3,3,4,4,5,5]);
});

test("Mathematical challenge advances from axial to strict, sloped and mixed forms",()=>{
  const all=p=>p.pieces.flatMap(piece=>piece.rules);
  for(const mode of ["fill","build"]){
    const path=modePictures(mode);
    assert.ok(all(path[0]).every(r=>r.form==="axis"&&r.inclusive),
      "Stage 1 must contain simple solid axis-parallel boundaries");
    assert.ok(all(path[1]).some(r=>r.a!==0&&r.b!==0),
      "Stage 2 must introduce sloping boundaries");
    assert.ok(all(path[2]).some(r=>!r.inclusive),
      "Stage 3 must introduce strict (< or >) boundaries");
    if(mode==="fill"){
      assert.ok(all(path[3]).some(r=>r.form==="standard"),
        "Stage 4 must introduce x/y on one side");
      assert.ok(all(path[4]).filter(r=>r.form==="standard").length>=4);
    }else{
      assert.ok(all(path[3]).filter(r=>!r.inclusive).length>=4,
        "Crystal challenge must feature a strict inner diamond");
      assert.ok(all(path[4]).filter(r=>r.form==="standard").length>=3);
    }
    assert.ok(all(path[4]).some(r=>r.text.includes("≥")&&r.a*r.b!==0),
      "Big Finish should demand handling a flipped standard form");
    assert.ok(graphTotalBoundaries(path[4])>graphTotalBoundaries(path[0])*2,
      "Big Finish must substantially increase the mathematical workload");
  }
});

test("Every generated polygon is convex, visible, exactly clipped by its REAL inequalities",()=>{
  for(const picture of GRAPH_ART_PICTURES){
    const ids=new Set();
    for(const part of picture.pieces){
      assert.ok(!ids.has(part.id),picture.id+" has duplicate piece "+part.id);
      ids.add(part.id);
      const poly=intersectRegion(part.rules);
      assert.ok(polygonArea(poly)>.15,picture.id+" "+part.id+" is empty");
      if(part.vertices){
        assert.ok(close(polygonArea(poly),polygonArea(part.vertices)),
          picture.id+" "+part.id+" is not the drawn mathematics");
      }
      const middle=centroid(poly);
      assert.equal(pointSatisfiesAll(part.rules,middle.x,middle.y),true,
        picture.id+" "+part.id+" fails at its interior");
      const cell=graphCellAt(part,middle.x,middle.y,.005);
      assert.ok(cell?.correct,picture.id+" "+part.id+" cannot be found/filled");
      assert.ok(close(polygonArea(cell.polygon),polygonArea(poly)));
      for(const rule of part.rules){
        const segment=lineOnRegionGraph(rule);
        assert.equal(segment.length,2,rule.id+" boundary is not visible");
        assert.ok(poly.every(v=>evaluateRegionRule(rule,v.x,v.y)<1e-7));
        assert.ok(poly.filter(v=>Math.abs(evaluateRegionRule(rule,v.x,v.y))<1e-7).length>=2,
          rule.id+" does not form a genuine boundary");
        assert.ok(["above","below","left","right"].includes(regionSide(rule)));
        assert.ok(["solid","dashed"].includes(regionBoundaryStyle(rule)));
        assert.equal(regionCorrect(rule,regionSide(rule),regionBoundaryStyle(rule)),true);
        const arrow=graphArrow(rule,poly);
        assert.ok(arrow,"Missing direction arrow "+rule.id);
        assert.ok(evaluateRegionRule(rule,arrow.x2,arrow.y2)<
          evaluateRegionRule(rule,arrow.x1,arrow.y1),
          "Arrow points away from valid half-plane "+rule.id);
      }
    }
  }
});

test("The original Little House and Aurora Crystal mathematics is unchanged",()=>{
  const house=graphPicture("little-house"),crystal=graphPicture("aurora-crystal");
  assert.equal(house.pieces.length,3);
  assert.deepEqual(house.pieces.map(x=>x.id),["walls","roof","door"]);
  assert.equal(graphCellAt(house.pieces[0],1,0).correct,true);
  assert.equal(graphCellAt(house.pieces[0],4,0).correct,false);
  assert.equal(graphCellAt(house.pieces[1],0,2).correct,true);
  assert.equal(graphCellAt(house.pieces[1],0,-2).correct,false);
  assert.equal(graphCellAt(house.pieces[2],0,-2).correct,true);
  assert.equal(graphCellAt(house.pieces[2],2,-2).correct,false);
  assert.equal(graphCellAt(house.pieces[0],2.5,0),null);
  assert.equal(crystal.pieces.length,REGION_FACETS.length);
  for(let i=0;i<REGION_FACETS.length;i++)
    assert.deepEqual(crystal.pieces[i].rules,REGION_FACETS[i].rules);
});

test("Saving and loading preserve progress across both modes and old picture IDs",()=>{
  const db=new Map();
  const storage={getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,v)};
  assert.deepEqual(readGraphArtSave(storage),
    {mode:"fill",picture:"signal-flag",records:{}});
  db.set(GRAPH_ART_SAVE_KEY,JSON.stringify({
    mode:"build",picture:"aurora-crystal",records:{
      "build:aurora-crystal":{done:2,line:2,replays:1},
      "fill:little-house":{done:3,line:0,replays:0},
      "build:little-house":{done:1,line:0,replays:0},
      "fill:aurora-crystal":{done:1,line:0,replays:0},
      "fill:signal-flag":{done:1,line:0,replays:0},
      "build:moonlit-castle":{done:99,line:0,replays:0}
    }}));
  const saved=readGraphArtSave(storage);
  assert.equal(saved.mode,"build");
  assert.equal(saved.picture,"aurora-crystal");
  assert.deepEqual(saved.records["build:aurora-crystal"],{done:2,line:2,replays:1});
  assert.equal(saved.records["fill:little-house"].done,3);
  assert.equal(saved.records["build:little-house"].done,1);
  assert.equal(saved.records["build:moonlit-castle"],undefined);
  assert.deepEqual(graphLegacyExtras("build",saved.records).map(p=>p.id),["little-house"]);
  assert.deepEqual(graphLegacyExtras("fill",saved.records).map(p=>p.id),
    ["aurora-crystal"]);
  db.set(GRAPH_ART_SAVE_KEY,JSON.stringify({
    mode:"build",picture:"aurora-crystal",records:{
      "build:aurora-crystal":{done:1,line:3,replays:0}
    }}));
  assert.deepEqual(readGraphArtSave(storage).records["build:aurora-crystal"],
    {done:1,line:3,replays:0});
  db.set(GRAPH_ART_SAVE_KEY,JSON.stringify({
    mode:"build",picture:"aurora-crystal",records:{
      "build:aurora-crystal":{done:4,line:4,replays:0}
    }}));
  assert.deepEqual(readGraphArtSave(storage).records["build:aurora-crystal"],
    {done:4,line:4,replays:0});
  db.set(GRAPH_ART_SAVE_KEY,JSON.stringify({
    mode:"build",picture:"aurora-crystal",records:{
      "build:aurora-crystal":{done:0,line:10,replays:0}
    }}));
  assert.equal(readGraphArtSave(storage).records["build:aurora-crystal"],undefined);
  db.set(GRAPH_ART_SAVE_KEY,"{bad");
  assert.equal(readGraphArtSave(storage).mode,"fill");
});

test("Graph page exposes a real five-step journey, accessible controls and reveal",()=>{
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
  assert.equal(new Set(ids).size,ids.length);
  for(const id of ["graphPicker","graphPlay","graphArtGraph",
    "graphModeFill","graphModeBuild","graphGalleryProgress","graphStageTrack",
    "graphPictureCards","graphMorePictures","graphExtraCards","graphGameFocus",
    "graphRuleList","graphCheckFill","graphUndoFill","graphSideA","graphSideB",
    "graphSolid","graphDashed","graphAddLine","graphNextPiece",
    "graphBuildWaiting","graphFeedback","graphOverlapText","graphHint",
    "graphHintText","graphReveal","graphRevealSvg","graphRevealSkip",
    "graphRevealClose","graphReplayReveal","graphNextPicture"])
    assert.ok(ids.includes(id),"Missing "+id);
  assert.ok(page.includes('aria-live="polite"'));
  assert.ok(page.includes('tabindex="0"'));
  assert.ok(app.includes('prefers-reduced-motion: reduce'));
  assert.ok(app.includes('a.download="inequality-ink-"+picture().id+".png"'));
  assert.ok(css.includes("@media(max-width:780px)"));
  assert.ok(css.includes("@media(max-width:480px)"));
  assert.ok(css.includes("height:100dvh"));
  assert.ok(!/\b(Foundation|4MA1)\b/i.test(page));
});

// Deterministic small DOM replaces browser packages in GitHub Actions.
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
  click(data={}){if(!this.disabled)this.fire("click",data);}
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
function session(initial={}){
  const doc=fakeDoc(),store=new Map([
    ["inequality-ink-v5","keep-pixel-save"],
    ["inequality-ink-quadratic-quest-v2","keep-quadratic-save"],
    ...Object.entries(initial)
  ]);
  const timers=[];
  const win={setTimeout:fn=>{timers.push(fn);return timers.length;},
    clearTimeout:()=>{},matchMedia:()=>({matches:false})};
  const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
  const app=initRegionsApp({doc,storage,win});
  return {doc,store,storage,timers,win,app,$:doc.getElementById};
}
function answerRules(s,part){
  const {$}=s;
  for(const rr of part.rules){
    const b=[$("graphSideA"),$("graphSideB")]
      .find(b=>b.dataset.side===regionSide(rr));
    assert.ok(b,"Missing side chooser "+rr.text);
    b.click();
    $(rr.inclusive?"graphSolid":"graphDashed").click();
    $("graphAddLine").click();
  }
}
function finishBuildPiece(s){
  s.timers.at(-1)();
  assert.equal(s.$("graphNextPiece").hidden,false);
  s.$("graphNextPiece").click();
}

test("Five unique cards switch between modes, track stage status and show saved legacy extras",()=>{
  const legacy={
    mode:"fill",picture:"little-house",records:{
      "build:little-house":{done:1,line:0,replays:0},
      "fill:little-house":{done:1,line:0,replays:0},
      "fill:signal-flag":{done:2,line:0,replays:0}
    }
  };
  const s=session({[GRAPH_ART_SAVE_KEY]:JSON.stringify(legacy)}),{$}=s;
  assert.equal($("graphPictureCards").children.length,5);
  assert.equal($("graphStageTrack").children.length,5);
  assert.match($("graphGalleryProgress").textContent,/1 of 5/);
  assert.ok($("graphStageTrack").children[0].className.includes("is-complete"));
  assert.equal($("graphPictureCards").children[1].children[1].children[1].textContent,
    "Home Sweet Home");
  $("graphModeBuild").click();
  assert.equal($("graphPictureCards").children.length,5);
  assert.equal($("graphStageTrack").children.length,5);
  assert.equal($("graphMorePictures").hidden,false);
  assert.equal($("graphExtraCards").children.length,1);
  assert.ok($("graphPictureCards").children[0].attrs["aria-label"].includes("Wrapped with Wonder"));
  assert.match($("graphExtraCards").children[0].children[1].children[1].textContent,/Home Sweet Home/);
  $("graphModeFill").click();
  assert.equal($("graphMorePictures").hidden,true);
});

test("Find & Fill completes its quick-win picture without changing other modes",()=>{
  const s=session(),{$,app,store}=s;
  assert.equal($("graphPicker").hidden,false);
  $("graphPictureCards").children[0].click();
  assert.equal($("graphPlay").hidden,false);
  assert.equal($("graphRuleList").children.length,4);
  app.pickAt(4,-1);
  assert.match($("graphFeedback").textContent,/Not quite/);
  assert.equal(app.readProgress().records["fill:signal-flag"].done,0);
  app.checkFill();
  assert.match($("graphFeedback").textContent,/First fill/);
  app.pickAt(-2.5,-1);
  assert.ok($("graphArtGraph").children.some(x=>
    x.getAttribute("data-region-layer")==="selection"));
  app.checkFill();
  assert.equal(app.readProgress().records["fill:signal-flag"].done,1);
  app.pickAt(0,1.5);app.checkFill();
  assert.equal($("graphSummary").hidden,false);
  assert.equal($("graphReveal").getAttribute("open"),"");
  app.showFinished();
  assert.equal($("graphRevealSkip").hidden,true);
  assert.equal($("graphDownload").hidden,false);
  assert.ok($("graphRevealSvg").children.length>2,
    "Finishing decoration should appear after mathematical pieces");
  $("graphRevealClose").click();
  assert.equal($("graphSummary").hidden,false);
  assert.equal($("graphNextPicture").hidden,false);
  $("graphNextPicture").click();
  assert.equal($("graphPicker").hidden,false);
  assert.equal($("graphPictureCards").children.length,5);
  assert.equal(store.get("inequality-ink-v5"),"keep-pixel-save");
  assert.equal(store.get("inequality-ink-quadratic-quest-v2"),"keep-quadratic-save");
});

test("Fill mode completes challenging 9-piece rocket from actual region centroids",()=>{
  const s=session(),{$,app}=s;
  $("graphPictureCards").children[4].click();
  const p=modePictures("fill")[4];
  assert.equal(p.pieces.length,9);
  for(const [i,part] of p.pieces.entries()){
    const point=centroid(intersectRegion(part.rules));
    app.pickAt(point.x,point.y);
    assert.ok($("graphArtGraph").children.some(x=>
      x.getAttribute("data-region-layer")==="selection"),
      "Cannot select "+part.id);
    app.checkFill();
    assert.equal(app.readProgress().records["fill:cosmic-rocket"].done,i+1);
  }
  assert.equal($("graphSummary").hidden,false);
  app.showFinished();
  assert.ok($("graphRevealSvg").children.length>p.pieces.length+4);
});

test("Build & Shade teaches and pauses after each of its first two regions",()=>{
  const s=session(),{$,app,timers}=s;
  $("graphModeBuild").click();$("graphPictureCards").children[0].click();
  const gift=modePictures("build")[0];
  for(const [i,part] of gift.pieces.entries()){
    answerRules(s,part);
    assert.equal(app.readProgress().records["build:wrapped-gift"].done,i);
    assert.equal($("graphBuildWaiting").hidden,false);
    assert.equal($("graphNextPiece").hidden,true);
    assert.equal($("graphAddLine").hidden,true);
    timers.at(-1)();
    assert.equal(app.readProgress().records["build:wrapped-gift"].done,i);
    assert.equal($("graphBuildWaiting").hidden,true);
    assert.equal($("graphNextPiece").hidden,false);
    assert.ok($("graphArtGraph").children.some(x=>
      x.getAttribute("data-region-layer")==="completed-build-piece"));
    assert.match($("graphOverlapText").textContent,/correct side of EVERY boundary/);
    timers.at(-1)();
    assert.equal(app.readProgress().records["build:wrapped-gift"].done,i);
    $("graphNextPiece").click();
  }
  assert.equal($("graphSummary").hidden,false);
  assert.equal($("graphReveal").getAttribute("open"),"");
});

test("All eight big-finish castle pieces re-enable the controls after Next",()=>{
  const s=session(),{$,app}=s;
  $("graphModeBuild").click();$("graphPictureCards").children[4].click();
  const castle=modePictures("build")[4];
  for(const [i,part] of castle.pieces.entries()){
    assert.equal($("graphAddLine").disabled,false);
    assert.equal($("graphActiveEquation").textContent,part.rules[0].text);
    answerRules(s,part);
    assert.equal($("graphNextPiece").hidden,true);
    const arrows=$("graphArtGraph").children.filter(x=>
      x.getAttribute("data-direction-arrow")!==null);
    assert.equal(arrows.length,part.rules.length);
    assert.ok(arrows.every(x=>x.getAttribute("class")==="graph-arrow-converge"));
    finishBuildPiece(s);
    assert.equal(app.readProgress().records["build:moonlit-castle"].done,i+1);
    if(i<castle.pieces.length-1){
      assert.equal($("graphAddLine").disabled,false);
      assert.equal($("graphSideA").disabled,false);
      assert.equal($("graphSideB").disabled,false);
      assert.equal($("graphHint").disabled,false);
    }
  }
  assert.equal($("graphSummary").hidden,false);
});

test("Interrupted and reloaded Build review retains the completed boundary",()=>{
  const s=session(),{$,app,timers,storage}=s;
  $("graphModeBuild").click();$("graphPictureCards").children[3].click();
  const part=modePictures("build")[3].pieces[0];
  answerRules(s,part);
  const obsolete=timers.at(-1);
  $("graphBack").click();
  assert.equal($("graphPicker").hidden,false);
  assert.deepEqual(app.readProgress().records["build:aurora-crystal"],
    {done:0,line:3,replays:0});
  obsolete();
  assert.equal(app.readProgress().records["build:aurora-crystal"].done,0);
  $("graphPictureCards").children[3].click();
  assert.equal($("graphNextPiece").hidden,false);
  assert.equal($("graphAddLine").hidden,true);
  $("graphNextPiece").click();
  assert.equal(app.readProgress().records["build:aurora-crystal"].done,1);
  $("graphBack").click();
  $("graphPictureCards").children[4].click();
  assert.equal($("graphAddLine").disabled,false);
  const doc=fakeDoc(),fresh=initRegionsApp({doc,storage,win:s.win});
  assert.equal(fresh.readProgress().records["build:aurora-crystal"].done,1);
  assert.equal(doc.getElementById("graphPictureCards").children.length,5);
});

test("Keyboard fill navigation and incorrect Build choices remain usable",()=>{
  const s=session(),{$,app,store}=s;
  $("graphPictureCards").children[1].click(); // Original Little House.
  $("graphArtGraph").fire("keydown",{key:"ArrowRight"});
  assert.match($("graphFeedback").textContent,/Cursor at/);
  $("graphArtGraph").fire("keydown",{key:"Enter"});
  assert.ok($("graphArtGraph").children.some(x=>
    x.getAttribute("data-region-layer")==="selection"));
  $("graphBack").click();
  $("graphModeBuild").click();$("graphPictureCards").children[0].click();
  const rr=modePictures("build")[0].pieces[0].rules[0];
  const wrong=[$("graphSideA"),$("graphSideB")]
    .find(b=>b.dataset.side!==regionSide(rr));
  const correct=[$("graphSideA"),$("graphSideB")]
    .find(b=>b.dataset.side===regionSide(rr));
  wrong.click();$("graphSolid").click();$("graphAddLine").click();
  assert.equal(app.readProgress().records["build:wrapped-gift"].line,0);
  correct.click();$("graphAddLine").click();
  assert.equal(app.readProgress().records["build:wrapped-gift"].line,1);
  assert.equal(JSON.parse(store.get(GRAPH_ART_SAVE_KEY)).
    records["build:wrapped-gift"].line,1);
});

test("Real arrowheads and stage-specific finishing details remain visible",()=>{
  const s=session(),{$,app}=s;
  $("graphModeBuild").click();$("graphPictureCards").children[0].click();
  const rr=modePictures("build")[0].pieces[0].rules[0];
  [$("graphSideA"),$("graphSideB")].find(b=>
    b.dataset.side===regionSide(rr)).click();
  $("graphSolid").click();$("graphAddLine").click();
  const graph=$("graphArtGraph");
  const arrows=graph.children.filter(x=>
    x.getAttribute("data-direction-arrow")!==null);
  assert.equal(arrows.length,1);
  assert.equal(arrows[0].getAttribute("class"),"graph-arrow-enter");
  assert.deepEqual(arrows[0].children.map(child=>child.tagName),["line","polygon"]);
  assert.equal(arrows[0].children[1].getAttribute("points").split(" ").length,3);
  assert.ok(graph.children.some(x=>
    x.getAttribute("data-region-layer")==="running-intersection"));
  assert.match($("graphOverlapText").textContent,/1 of 4 lines added/);
});

test("Reduced-motion users can review finished regions without waiting",()=>{
  const s=session(),{$,app,win,timers}=s;
  win.matchMedia=()=>({matches:true});
  $("graphModeBuild").click();$("graphPictureCards").children[0].click();
  answerRules(s,modePictures("build")[0].pieces[0]);
  assert.equal(timers.length,0);
  assert.equal(app.readProgress().records["build:wrapped-gift"].done,0);
  assert.equal($("graphBuildWaiting").hidden,true);
  assert.equal($("graphNextPiece").hidden,false);
  $("graphNextPiece").click();
  assert.equal(app.readProgress().records["build:wrapped-gift"].done,1);
});

test("Completing the full stage preserves a 5-of-5 milestone independently per mode",()=>{
  const records={};
  for(const p of modePictures("fill"))
    records["fill:"+p.id]={done:p.pieces.length,line:0,replays:0};
  const s=session({[GRAPH_ART_SAVE_KEY]:JSON.stringify({
    mode:"fill",picture:"cosmic-rocket",records
  })}),{$}=s;
  assert.match($("graphGalleryProgress").textContent,/5 of 5 pictures finished/);
  assert.equal($("graphStageTrack").children.length,5);
  assert.ok($("graphStageTrack").children.every(x=>
    x.className.includes("is-complete")));
  $("graphModeBuild").click();
  assert.match($("graphGalleryProgress").textContent,/0 of 5 pictures finished/);
  assert.equal($("graphPictureCards").children.length,5);
});
