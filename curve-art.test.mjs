import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {initCurveArt,CURVE_SAVE_KEY,readCurveSave} from "./regions/curve-art.mjs";

class Element {
  constructor(tag="div"){
    this.tagName=tag;this.attrs={};this.children=[];
    this.textContent="";this.className="";this.hidden=false;
    this.disabled=false;this.style={};this.listeners=new Map();
    const names=new Set();
    this.classList={add:name=>names.add(name),contains:name=>names.has(name)};
  }
  setAttribute(name,value){this.attrs[name]=String(value);}
  getAttribute(name){return this.attrs[name]??null;}
  removeAttribute(name){delete this.attrs[name];}
  append(...nodes){this.children.push(...nodes);}
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
function session(initial={}){
  const html=readFileSync(new URL("./regions/curve.html",import.meta.url),"utf8");
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const elements=new Map(ids.map(id=>[id,new Element(id)]));
  const doc={
    getElementById:id=>{if(!elements.has(id))throw Error("Missing "+id);return elements.get(id);},
    createElement:tag=>new Element(tag),
    createElementNS:(_ns,tag)=>new Element(tag)
  };
  const store=new Map([["inequality-ink-graph-art-v2","keep existing progress"],...Object.entries(initial)]);
  const callbacks=new Map();let nextId=0;
  const win={
    setTimeout:(fn,ms)=>{const id=++nextId;callbacks.set(id,{fn,ms});return id;},
    clearTimeout:id=>callbacks.delete(id),
    matchMedia:()=>({matches:false})
  };
  const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
  const app=initCurveArt({doc,win,storage});
  return {$:doc.getElementById,store,storage,app,callbacks,win};
}
const layers=(s,name)=>s.$("graphArtGraph").children.filter(e=>e.getAttribute("data-region-layer")===name);
test("Curve & Fill shares Graph Art's markup, CSS, instructions and reveal",()=>{
  const page=readFileSync(new URL("./regions/curve.html",import.meta.url),"utf8");
  const css=readFileSync(new URL("./regions/curve-art.css",import.meta.url),"utf8");
  assert.match(page,/regions\.css/);
  assert.match(page,/class="topbar"/);
  assert.match(page,/class="region-workspace graph-workspace"/);
  assert.match(page,/class="graph-feedback"/);
  assert.match(page,/graph-good-flash|graph-wrong-flash|wrong region flashes red/);
  assert.match(page,/id="curveReveal"/);
  assert.doesNotMatch(css,/(^|\n)\s*\.graph-feedback\s*\{/);
  assert.ok(!page.includes("class=\"hero\""));
});
test("wrong curved cell flashes RED, clears, and can be retried",()=>{
  const s=session();s.$("curvePictureCard").click();
  assert.equal(s.$("curvePlay").hidden,false);
  s.app.pickAt(1,0);
  assert.ok(layers(s,"wrong").length>0);
  assert.ok(layers(s,"wrong")[0].classList.contains("graph-wrong-flash"));
  assert.ok(s.$("graphFeedback").className.includes("error"));
  assert.equal(layers(s,"selection").length,0);
  const expiry=[...s.callbacks.values()].find(x=>x.ms===950);
  assert.ok(expiry);
  expiry.fn();
  assert.equal(layers(s,"wrong").length,0);
  assert.equal(s.$("graphFeedback").textContent,
    "Not quite. That region fails at least one of the inequalities. Try another.");
});
test("correct curved cell stays filled until Check; Undo and toggle match Find & Fill",()=>{
  const s=session();s.$("curvePictureCard").click();
  s.app.pickAt(-1,0);
  assert.ok(layers(s,"selection").length>0);
  assert.ok(layers(s,"selection")[0].classList.contains("graph-good-flash"));
  assert.match(s.$("graphFeedback").textContent,/Region filled.*Check/);
  assert.equal(readCurveSave(s.storage).done,0);
  s.app.pickAt(-1,0);
  assert.equal(layers(s,"selection").length,0);
  s.$("graphCheckFill").click();
  assert.ok(s.$("graphFeedback").className.includes("error"));
  s.app.pickAt(-1,0);
  s.$("graphUndoFill").click();
  assert.equal(layers(s,"selection").length,0);
  s.app.pickAt(-1,0);
  s.$("graphCheckFill").click();
  assert.equal(readCurveSave(s.storage).done,1);
  assert.ok(layers(s,"finished-left-wing").length>0);
  assert.equal(s.store.get("inequality-ink-graph-art-v2"),"keep existing progress");
});
test("full butterfly, summary, reveal and replay work with previous saves",()=>{
  const s=session({[CURVE_SAVE_KEY]:JSON.stringify({done:1})});
  assert.match(s.$("curveCardAction").textContent,/Continue/);
  s.$("curvePictureCard").click();
  s.app.pickAt(1,0);s.$("graphCheckFill").click();
  assert.equal(readCurveSave(s.storage).done,2);
  assert.equal(s.$("curveSummary").hidden,false);
  assert.equal(s.$("curveReveal").getAttribute("open"),"");
  s.$("curveRevealSkip").click();
  assert.equal(s.$("curveDownload").hidden,false);
  s.$("curveRevealClose").click();
  assert.equal(s.$("curveReveal").getAttribute("open"),null);
  s.$("curveChooseAgain").click();
  assert.match(s.$("curveCardAction").textContent,/Finished/);
  s.$("curvePictureCard").click();
  assert.equal(readCurveSave(s.storage).done,0);
});
test("keyboard can choose a region and hints appear separately from feedback",()=>{
  const s=session();s.$("curvePictureCard").click();
  const svg=s.$("graphArtGraph");
  svg.fire("keydown",{key:"ArrowLeft"});svg.fire("keydown",{key:"ArrowLeft"});
  svg.fire("keydown",{key:"Enter"});
  assert.ok(layers(s,"selection").length>0);
  s.$("graphHint").click();
  assert.equal(s.$("graphHintText").hidden,false);
  assert.match(s.$("graphFeedback").textContent,/hint has appeared/);
  s.$("curveBack").click();
  assert.equal(s.$("curvePicker").hidden,false);
  assert.equal(s.$("curvePlay").hidden,true);
});

const decorations=svg=>svg.children.filter(e=>e.getAttribute("data-curve-detail")!==null);
test("butterfly decorations are a completion reward, not shown during play",()=>{
  const s=session();
  assert.equal(decorations(s.$("curvePreviewGraph")).length,0);
  s.$("curvePictureCard").click();
  s.app.pickAt(-1,0);s.$("graphCheckFill").click();
  assert.equal(decorations(s.$("graphArtGraph")).length,0);
  s.$("curveBack").click();
  assert.equal(decorations(s.$("curvePreviewGraph")).length,0);
  const completed=session({[CURVE_SAVE_KEY]:JSON.stringify({done:2})});
  assert.ok(decorations(completed.$("curvePreviewGraph")).length>=25);
  assert.ok(decorations(completed.$("curvePreviewGraph")).some(
    e=>e.getAttribute("data-curve-detail")==="head"));
});
test("big reveal adds both wings, patterns, body and sparkles in ordered stages",()=>{
  const s=session({[CURVE_SAVE_KEY]:JSON.stringify({done:1})});
  s.$("curvePictureCard").click();
  s.app.pickAt(1,0);s.$("graphCheckFill").click();
  const board=s.$("graphRevealSvg");
  assert.equal(decorations(board).length,0);
  const ordered=[...s.callbacks.values()].sort((a,b)=>a.ms-b.ms);
  assert.equal(ordered.length,6);
  ordered[0].fn();
  assert.equal(board.children.filter(e=>e.getAttribute("data-reveal-wing")).length,1);
  ordered[1].fn();
  assert.equal(board.children.filter(e=>e.getAttribute("data-reveal-wing")).length,2);
  assert.equal(decorations(board).length,0);
  ordered[2].fn();
  assert.ok(decorations(board).some(e=>e.getAttribute("data-curve-detail")==="upper-left-spot"));
  assert.equal(decorations(board).some(e=>e.getAttribute("data-curve-detail")==="head"),false);
  assert.ok(decorations(board).some(e=>e.classList.contains("curve-detail-enter")));
  ordered[3].fn();
  assert.ok(decorations(board).some(e=>e.getAttribute("data-curve-detail")==="head"));
  assert.equal(decorations(board).some(e=>e.getAttribute("data-curve-detail")==="star-upper-left"),false);
  ordered[4].fn();
  assert.ok(decorations(board).some(e=>e.getAttribute("data-curve-detail")==="star-upper-left"));
  ordered[5].fn();
  assert.equal(s.$("curveDownload").hidden,false);
  assert.match(s.$("graphRevealTitle").textContent,/Parabola Butterfly/);
});
test("skipping, replaying and closing reveal cancel pending decorations",()=>{
  const s=session({[CURVE_SAVE_KEY]:JSON.stringify({done:1})});
  s.$("curvePictureCard").click();
  s.app.pickAt(1,0);s.$("graphCheckFill").click();
  const board=s.$("graphRevealSvg");
  s.$("curveRevealSkip").click();
  assert.equal(s.callbacks.size,0);
  assert.ok(decorations(board).some(e=>e.getAttribute("data-curve-detail")==="star-upper-left"));
  s.$("curveRevealAgain").click();
  assert.equal(decorations(board).length,0);
  assert.equal(s.callbacks.size,6);
  s.$("curveRevealClose").click();
  assert.equal(s.callbacks.size,0);
  assert.equal(s.$("curveSummary").hidden,false);
});
test("reveal decorations remain clear on an ivory background",async()=>{
  const {PICTURE,CURVE_DETAIL_STAGES}=await import("./regions/curved-engine.mjs");
  assert.equal(CURVE_DETAIL_STAGES.length,3);
  const ids=new Set(PICTURE.details.map(d=>d.id));
  assert.equal(ids.size,PICTURE.details.length);
  const outside=PICTURE.details.filter(d=>d.type==="star");
  assert.ok(outside.length>=4);
  assert.ok(outside.every(d=>d.stroke&&d.stroke!=="#ffffff"&&d.fill!=="#ffffff"));
  assert.ok(PICTURE.details.some(d=>d.id==="left-wing-vein"));
  assert.ok(PICTURE.details.some(d=>d.id==="right-wing-vein"));
  assert.ok(PICTURE.details.some(d=>d.id==="left-antenna"));
  assert.ok(PICTURE.details.some(d=>d.id==="right-antenna"));
});
