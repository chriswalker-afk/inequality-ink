import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {initCurveArt,CURVE_SAVE_KEY,CURVE_SAVE_KEY_V2,readCurveSave} from "./regions/curve-art.mjs";
import {CURVE_PICTURES,CURVE_PRACTICE_PICTURES,validateCurveGallery} from "./regions/curve-pictures.mjs";
import {satisfiesAll,curvedCellAt} from "./regions/curved-engine.mjs";

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
  fire(name,props={}){
    for(const fn of this.listeners.get(name)||[])fn({
      target:this,clientX:0,clientY:0,preventDefault(){},...props
    });
  }
  click(){if(!this.disabled)this.fire("click");}
  getBoundingClientRect(){return {left:0,top:0,width:620,height:620};}
  showModal(){this.setAttribute("open","");}
  close(){this.removeAttribute("open");}
}
function session(initial={},reduced=false,query=""){
  const html=readFileSync(new URL("./regions/curve.html",import.meta.url),"utf8");
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const elements=new Map(ids.map(id=>[id,new Element(id)]));
  const doc={
    getElementById:id=>{
      if(!elements.has(id))throw Error("Missing "+id);
      return elements.get(id);
    },
    createElement:tag=>new Element(tag),
    createElementNS:(_ns,tag)=>new Element(tag)
  };
  const store=new Map([
    ["inequality-ink-graph-art-v2","keep existing progress"],
    ["inequality-ink-v5","keep pixel progress"],...Object.entries(initial)
  ]);
  const callbacks=new Map(),redirects=[];let next=0;
  const win={
    setTimeout:(fn,ms)=>{const id=++next;callbacks.set(id,{fn,ms});return id;},
    clearTimeout:id=>callbacks.delete(id),
    matchMedia:()=>({matches:reduced}),
    location:{search:query,assign:url=>redirects.push(url)}
  };
  const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
  const app=initCurveArt({doc,storage,win});
  return {doc,store,storage,callbacks,redirects,win,app,$:doc.getElementById};
}
const layer=(s,name)=>s.$("graphArtGraph").children.filter(n=>n.getAttribute("data-region-layer")===name);
const details=svg=>svg.children.filter(n=>n.getAttribute("data-curve-detail")!==null);
const card=(s,i)=>s.$("curvePictureCards").children[i];
function interior(part){
  for(let x=-4.5;x<=4.5;x+=.25)for(let y=-4.5;y<=4.5;y+=.25){
    if(!satisfiesAll(part.rules,x,y))continue;
    if(curvedCellAt(part.rules,x,y,.08)?.correct)return {x,y};
  }
  throw Error("No tappable interior point for "+part.id);
}
function finish(s,p){
  for(const part of p.pieces){
    const {x,y}=interior(part);
    s.app.pickAt(x,y);
    assert.ok(layer(s,"selection").length,part.id+" should show a correct green selection");
    s.$("graphCheckFill").click();
  }
  assert.equal(s.$("curveSummary").hidden,false);
  assert.equal(s.$("curveSummaryMetrics").children.length,3);
  assert.equal(s.$("curvePieceMarkers").children.length,p.pieces.length);
  assert.ok(s.$("curveSummaryArt").children.some(node=>node.tagName==="path"),
    "Completed curve artwork should be visible on the summary screen");
  assert.ok(s.$("curveSavePicture").listeners.get("click")?.length);
  assert.equal(s.$("curveReveal").getAttribute("open"),"");
  s.$("curveRevealSkip").click();
  assert.ok(details(s.$("graphRevealSvg")).length>=8);
  assert.equal(s.$("curveDownload").hidden,false);
  s.$("curveRevealClose").click();
}
test("full Curve & Fill page shares Find & Fill interface, steps and reveal",()=>{
  const page=readFileSync(new URL("./regions/curve.html",import.meta.url),"utf8");
  const css=readFileSync(new URL("./regions/curve-art.css",import.meta.url),"utf8");
  for(const marker of [
    'class="topbar"','class="region-workspace graph-workspace"',
    'class="graph-feedback"','id="curveStageTrack"','id="curvePictureCards"',
    'id="curveReveal"','id="curveNextPicture"'
  ])assert.ok(page.includes(marker),marker);
  assert.match(page,/regions\.css/);
  assert.ok(!page.includes("prototype"));
  assert.doesNotMatch(css,/(^|\n)\s*\.graph-feedback\s*\{/);
});
test("five unique staged picture cards show individual progress and clues",()=>{
  const s=session();
  assert.equal(s.$("curvePictureCards").children.length,5);
  assert.equal(s.$("curveStageTrack").children.length,5);
  assert.match(s.$("curveGalleryProgress").textContent,/0 of 5/);
  assert.equal(card(s,4).getAttribute("data-curve-picture"),"cosmic-jellyfish");
  card(s,0).click();
  assert.equal(s.$("curvePlay").hidden,false);
  assert.equal(s.$("curveGameTitle").textContent,"Parabola Butterfly");
  assert.equal(s.$("graphTaskTitle").textContent,"Left wing");
  s.app.pickAt(-1,0);s.$("graphCheckFill").click();
  s.$("curveBack").click();
  assert.match(card(s,0).children[1].children.at(-1).textContent,/Continue/);
  card(s,1).click();
  assert.equal(s.$("curveGameTitle").textContent,"Rolling Hills");
  assert.equal(s.$("graphTaskTitle").textContent,"Emerald hill");
  assert.match(s.$("graphRuleCount").textContent,/3 inequalities/);
  s.$("curveBack").click();
  assert.match(card(s,0).children[1].children.at(-1).textContent,/Continue/);
});
test("wrong curved region flashes red then clears, correct region toggles and persists",()=>{
  const s=session();card(s,0).click();
  s.app.pickAt(1,0);
  assert.ok(layer(s,"wrong").length);
  assert.ok(layer(s,"wrong")[0].classList.contains("graph-wrong-flash"));
  assert.match(s.$("graphFeedback").className,/error/);
  const timeout=[...s.callbacks.values()].find(t=>t.ms===950);
  assert.ok(timeout);timeout.fn();
  assert.equal(layer(s,"wrong").length,0);
  s.app.pickAt(-1,0);
  assert.ok(layer(s,"selection")[0].classList.contains("graph-good-flash"));
  assert.equal(readCurveSave(s.storage).done,0);
  s.app.pickAt(-1,0);
  assert.equal(layer(s,"selection").length,0);
  s.app.pickAt(-1,0);s.$("graphUndoFill").click();
  assert.equal(layer(s,"selection").length,0);
  s.app.pickAt(-1,0);s.$("graphCheckFill").click();
  assert.equal(readCurveSave(s.storage).done,1);
  assert.ok(layer(s,"finished-left-wing").length);
});
test("v1 butterfly save migrates into independent per-picture records without deletion",()=>{
  const old=JSON.stringify({done:1,replays:3});
  const s=session({[CURVE_SAVE_KEY]:old});
  assert.equal(readCurveSave(s.storage).done,1);
  assert.equal(readCurveSave(s.storage).replays,3);
  card(s,1).click();
  const p=CURVE_PICTURES[1];
  const point=interior(p.pieces[0]);
  s.app.pickAt(point.x,point.y);s.$("graphCheckFill").click();
  assert.equal(s.store.get(CURVE_SAVE_KEY),old);
  const v2=JSON.parse(s.store.get(CURVE_SAVE_KEY_V2));
  assert.equal(v2.records["parabola-butterfly"].done,1);
  assert.equal(v2.records["rolling-hills"].done,1);
  assert.equal(s.store.get("inequality-ink-v5"),"keep pixel progress");
  assert.equal(s.store.get("inequality-ink-graph-art-v2"),"keep existing progress");
});
test("each five-picture path is playable, with an accurate finished reveal",()=>{
  const s=session();
  for(let i=0;i<CURVE_PICTURES.length;i++){
    card(s,i).click();
    const p=CURVE_PICTURES[i];
    assert.equal(s.$("curveGameTitle").textContent,p.name);
    assert.match(s.$("curveGameMode").textContent,new RegExp(p.stage.toUpperCase()));
    finish(s,p);
    if(i<4)assert.equal(s.$("curveNextPicture").hidden,false);
    else assert.equal(s.$("curveNextPicture").hidden,true);
    s.$("curveChooseAgain").click();
    const thumb=card(s,i).children[0];
    assert.ok(details(thumb).length>=8,"Completed thumbnail should include details");
    assert.match(s.$("curveGalleryProgress").textContent,new RegExp((i+1)+" of 5"));
  }
  assert.match(s.$("curveGalleryProgress").textContent,/All five stages complete/);
  card(s,4).click();
  assert.equal(s.$("curveSummary").hidden,false);
  assert.equal(s.$("curveReveal").getAttribute("open"),"");
  assert.equal(readCurveSave(s.storage).records["cosmic-jellyfish"].done,
    CURVE_PICTURES[4].pieces.length,"Opening a completed picture must not clear it");
  assert.equal(readCurveSave(s.storage).records["parabola-butterfly"].done,2);
  s.$("curveRevealClose").click();
  s.win.confirm=()=>false;
  s.$("curveRestart").click();
  assert.equal(readCurveSave(s.storage).records["cosmic-jellyfish"].done,
    CURVE_PICTURES[4].pieces.length,"Cancelling Restart must keep completion");
  s.win.confirm=()=>true;
  s.$("curveRestart").click();
  assert.equal(readCurveSave(s.storage).records["cosmic-jellyfish"].done,0);
  assert.equal(s.$("curvePlay").hidden,false);
  assert.equal(readCurveSave(s.storage).records["parabola-butterfly"].done,2);
});
test("stage-specific decoration timing and reduced motion match the other modes",()=>{
  const s=session({[CURVE_SAVE_KEY_V2]:JSON.stringify({
    picture:"parabola-butterfly",
    records:{"parabola-butterfly":{done:1,replays:0}}
  })});
  card(s,0).click();
  s.app.pickAt(1,0);s.$("graphCheckFill").click();
  const board=s.$("graphRevealSvg");
  assert.equal(details(board).length,0);
  const events=[...s.callbacks.values()].sort((a,b)=>a.ms-b.ms);
  assert.equal(events.length,6);
  events[0].fn();events[1].fn();
  assert.equal(details(board).length,0);
  events[2].fn();
  assert.ok(details(board).some(d=>d.getAttribute("data-curve-detail")==="upper-left-spot"));
  assert.ok(!details(board).some(d=>d.getAttribute("data-curve-detail")==="head"));
  events[3].fn();
  assert.ok(details(board).some(d=>d.getAttribute("data-curve-detail")==="head"));
  events[4].fn();
  assert.ok(details(board).some(d=>d.getAttribute("data-curve-detail")==="star-upper-left"));
  s.$("curveRevealSkip").click();
  assert.equal(s.callbacks.size,0);
  s.$("curveRevealAgain").click();
  assert.equal(details(board).length,0);
  s.$("curveRevealClose").click();
  assert.equal(s.callbacks.size,0);

  const reduce=session({[CURVE_SAVE_KEY_V2]:JSON.stringify({
    picture:"rolling-hills",records:{"rolling-hills":{done:2,replays:0}}
  })},true);
  card(reduce,1).click();
  const p=CURVE_PICTURES[1].pieces.at(-1);
  const pt=interior(p);
  reduce.app.pickAt(pt.x,pt.y);
  reduce.$("graphCheckFill").click();
  assert.equal(reduce.$("curveDownload").hidden,false);
  assert.ok(details(reduce.$("graphRevealSvg")).length>=8);
});
test("keyboard selection, hints and retry remain usable on all modes",()=>{
  const s=session();card(s,0).click();
  const graph=s.$("graphArtGraph");
  graph.fire("keydown",{key:"ArrowLeft"});graph.fire("keydown",{key:"ArrowLeft"});
  graph.fire("keydown",{key:"Enter"});
  assert.ok(layer(s,"selection").length);
  s.$("graphHint").click();
  assert.equal(s.$("graphHintText").hidden,false);
  s.$("curveBack").click();
  card(s,3).click();
  assert.equal(s.$("curveGameTitle").textContent,"Orbit Flower");
  s.$("graphHint").click();
  assert.equal(s.$("graphHintText").hidden,false);
});

test("Curve picture deep links launch directly and return to unified Graph Art",()=>{
  const s=session({},true,"?picture=rolling-hills");
  assert.equal(s.$("curvePlay").hidden,false);
  assert.equal(s.$("curveGameTitle").textContent,"Rolling Hills");
  s.$("curveBack").click();
  assert.equal(s.redirects.at(-1),"./?mode=curve&picture=rolling-hills");
  const direct=session({},false,"?picture=invalid-picture");
  assert.equal(direct.$("curvePicker").hidden,false);
});


test("Optional Balloon Parade gives same-level curved practice without changing the five core stages",()=>{
  assert.equal(validateCurveGallery(),true);
  assert.equal(CURVE_PRACTICE_PICTURES.length,1);
  const bonus=CURVE_PRACTICE_PICTURES[0];
  assert.equal(bonus.step,2);
  assert.equal(bonus.pieces.length,3);
  const s=session(),{$}=s;
  assert.equal($("curvePictureCards").children.length,5);
  assert.equal($("curvePracticeCards").children.length,1);
  $("curvePracticeCards").children[0].click();
  assert.equal($("curveGameTitle").textContent,"Balloon Parade");
  let first=interior(bonus.pieces[0]);
  s.app.pickAt(first.x,first.y);
  $("graphCheckFill").click();
  assert.equal(s.app.readProgress().records[bonus.id].done,1);
  const restored=session(Object.fromEntries(s.store));
  restored.app.choose(bonus.id);
  assert.equal(restored.$("graphPieceCount").textContent,"Piece 2 of 3");
  for(const part of bonus.pieces.slice(1)){
    const at=interior(part);
    restored.app.pickAt(at.x,at.y);
    restored.$("graphCheckFill").click();
  }
  assert.equal(restored.$("curveSummary").hidden,false);
  assert.equal(restored.$("curveNextPicture").hidden,true);
  assert.equal(restored.$("curveReveal").getAttribute("open"),"");
  assert.equal(restored.app.readProgress().records[bonus.id].done,3);
  assert.equal(restored.$("curvePictureCards").children.length,5);
});
