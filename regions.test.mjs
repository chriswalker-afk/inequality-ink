import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  REGION_SAVE_KEY,REGION_WORLD,REGION_FACETS,REGION_TOTAL,REGION_STEP_TOTAL,
  regionSide,regionSideOptions,otherRegionSide,regionBoundaryStyle,
  regionCorrect,previewSideRule,pointSatisfiesRegion,pointSatisfiesAll,
  evaluateRegionRule,samplePointForRule,regionHint,intersectRegion,
  polygonArea,clipRegionPolygon,lineOnRegionGraph,validateRegionArt
} from "./regions/regions-engine.mjs";
import {initRegionsApp,readRegionSave,regionProgressSteps} from "./regions/regions-app.mjs";

test("The five stained-glass facets are genuine convex region intersections",()=>{
  assert.equal(validateRegionArt(),true);
  assert.equal(REGION_TOTAL,5);
  assert.equal(REGION_STEP_TOTAL,15);
  assert.deepEqual(REGION_FACETS.map(f=>f.rules.length-f.given),[2,3,3,3,4]);
  assert.deepEqual(REGION_FACETS.map(f=>f.rules.length),[3,3,3,3,4]);
  assert.deepEqual(REGION_FACETS.map(f=>f.name),[
    "Sunlit facet","Golden facet","Ocean facet","Twilight facet","Crystal heart"
  ]);
  for(const [index,facet] of REGION_FACETS.entries()){
    const vertices=intersectRegion(facet.rules);
    assert.ok(vertices.length>=3);
    assert.ok(Math.abs(polygonArea(vertices)-(index===4?2:8))<1e-8,
      facet.id+" has wrong polygon area");
    for(const vertex of vertices)for(const rule of facet.rules)
      assert.ok(evaluateRegionRule(rule,vertex.x,vertex.y)<1e-8,
        facet.id+" vertex violates "+rule.id);
  }
});
test("Four mathematically shaded outer triangles exactly make a diamond",()=>{
  for(let x=-4.75;x<4.75;x+=.5){
    for(let y=-4.75;y<4.75;y+=.5){
      if(Math.abs(Math.abs(x)+Math.abs(y)-4)<.001)continue;
      const inside=REGION_FACETS.slice(0,4).some(f=>
        pointSatisfiesAll(f.rules,x,y));
      assert.equal(inside,Math.abs(x)+Math.abs(y)<4,
        "Diamond classification mismatch at "+x+", "+y);
    }
  }
  const inner=REGION_FACETS[4];
  assert.ok(pointSatisfiesAll(inner.rules,0,0));
  assert.ok(!pointSatisfiesAll(inner.rules,1,0),
    "The central small diamond is open at its boundary");
  assert.ok(pointSatisfiesAll(inner.rules,.5,0));
  assert.ok(!pointSatisfiesAll(inner.rules,2,0));
});
test("Clipping never depends on a hardcoded art mask",()=>{
  const north=REGION_FACETS[0];
  const first=intersectRegion(north.rules.slice(0,1));
  const second=intersectRegion(north.rules.slice(0,2));
  const final=intersectRegion(north.rules);
  assert.equal(polygonArea(first),50,"Top half-plane within 10x10 window");
  assert.equal(polygonArea(second),25,"Top-left quarter-plane");
  assert.equal(polygonArea(final),8,"Actual triangular art facet");
  assert.equal(polygonArea(clipRegionPolygon(first,north.rules[1])),25);
  assert.ok(final.some(p=>Math.abs(p.x+4)<1e-8&&Math.abs(p.y)<1e-8));
  assert.ok(final.some(p=>Math.abs(p.x)<1e-8&&Math.abs(p.y-4)<1e-8));
  assert.ok(final.some(p=>Math.abs(p.x)<1e-8&&Math.abs(p.y)<1e-8));
});
test("Vertical, horizontal and diagonal boundary equations stay in view",()=>{
  for(const f of REGION_FACETS)for(const r of f.rules){
    const segment=lineOnRegionGraph(r);
    assert.equal(segment?.length,2,r.id+" boundary missing");
    for(const p of segment){
      assert.ok(Math.abs(evaluateRegionRule(r,p.x,p.y))<1e-8);
      assert.ok(p.x>=REGION_WORLD.xmin-1e-8&&p.x<=REGION_WORLD.xmax+1e-8);
      assert.ok(p.y>=REGION_WORLD.ymin-1e-8&&p.y<=REGION_WORLD.ymax+1e-8);
    }
  }
});
test("Correct half-plane, solid/dashed decisions and pointer selection are exact",()=>{
  const examples=[
    {r:REGION_FACETS[0].rules[0],side:"above",options:["above","below"],style:"solid"},
    {r:REGION_FACETS[0].rules[1],side:"left",options:["left","right"],style:"solid"},
    {r:REGION_FACETS[1].rules[1],side:"right",options:["left","right"],style:"solid"},
    {r:REGION_FACETS[2].rules[2],side:"above",options:["above","below"],style:"solid"},
    {r:REGION_FACETS[4].rules[0],side:"below",options:["above","below"],style:"dashed"}
  ];
  for(const {r,side,options,style} of examples){
    assert.equal(regionSide(r),side);
    assert.deepEqual(regionSideOptions(r),options);
    assert.equal(regionBoundaryStyle(r),style);
    assert.equal(regionCorrect(r,side,style),true);
    assert.equal(regionCorrect(r,otherRegionSide(side),style),false);
    assert.equal(regionCorrect(r,side,style==="solid"?"dashed":"solid"),false);
    const opposite=previewSideRule(r,otherRegionSide(side));
    assert.ok(opposite);
    assert.equal(opposite.a,-r.a);
    assert.equal(opposite.b,-r.b);
    assert.equal(opposite.c,-r.c);
    assert.equal(previewSideRule(r,side),r);
    const [x,y]=samplePointForRule(r);
    assert.ok(Math.abs(evaluateRegionRule(r,x,y))>.25);
    assert.match(regionHint(r),/Try the test point/);
  }
  assert.equal(previewSideRule(examples[0].r,"right"),null);
});
test("Graph Art saves only completed decisions and keeps malformed records safe",()=>{
  const entries=new Map();
  const db={getItem:key=>entries.has(key)?entries.get(key):null,
    setItem:(key,v)=>entries.set(key,v)};
  assert.deepEqual(readRegionSave(db),{done:0,step:0,replays:0});
  entries.set(REGION_SAVE_KEY,JSON.stringify({done:1,step:2,replays:1}));
  assert.deepEqual(readRegionSave(db),{done:1,step:2,replays:1});
  assert.equal(regionProgressSteps(readRegionSave(db)),4);
  entries.set(REGION_SAVE_KEY,"{broken");
  assert.equal(readRegionSave(db).done,0);
  entries.set(REGION_SAVE_KEY,JSON.stringify({done:5,step:0,replays:2}));
  assert.equal(regionProgressSteps(readRegionSave(db)),15);
  for(const invalid of [{done:6,step:0,replays:0},
    {done:1,step:3,replays:0},{done:5,step:1,replays:0},
    {done:2,step:-1,replays:0}]){
    entries.set(REGION_SAVE_KEY,JSON.stringify(invalid));
    assert.deepEqual(readRegionSave(db),{done:0,step:0,replays:0});
  }
});
test("The two studio pages remain independent, navigable and accessible",()=>{
  const main=readFileSync(new URL("./index.html",import.meta.url),"utf8");
  const region=readFileSync(new URL("./regions/index.html",import.meta.url),"utf8");
  const css=readFileSync(new URL("./styles.css",import.meta.url),"utf8");
  const rgcss=readFileSync(new URL("./regions/regions.css",import.meta.url),"utf8");
  assert.ok(main.includes('class="studio-tab" href="./regions/"'));
  assert.ok(main.includes('class="studio-tab is-active" href="./" aria-current="page"'));
  assert.ok(region.includes('class="studio-tab" href="../"'));
  assert.ok(region.includes('class="studio-tab is-active" href="./" aria-current="page"'));
  assert.ok(region.includes('src="./regions-app.mjs"'));
  assert.match(region,/href="\.\.\/styles\.css(?:\?[^"]*)?"/);
  assert.ok(region.includes('href="./regions.css"'));
  assert.ok(!region.includes('src="../app.mjs"'));
  assert.ok(css.includes(".studio-switch{"));
  assert.ok(css.includes("body.paint-session .studio-switch{display:none}"));
  assert.ok(rgcss.includes(".region-workspace{"));
  const ids=[...region.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length);
  for(const id of ["regionGraph","regionSideA","regionSideB","regionSolid",
    "regionDashed","regionCheckButton","regionHintButton","regionFeedback",
    "regionProgressDots","regionFinishPanel","regionPlayAgain"]){
    assert.ok(ids.includes(id),"Missing Graph Art UI control "+id);
  }
  assert.ok(region.includes('aria-live="polite"'));
  assert.ok(!/\b(Foundation|4MA1)\b/i.test(region));
});

// Minimal browser-like elements to exercise the actual Graph Art entrypoint
// without modifying or booting Inequality Ink's existing Pixel Art scripts.
class Element{
  constructor(tag="div"){
    this.tagName=tag;this.attrs={};this.children=[];
    this.textContent="";this.className="";this.hidden=false;this.dataset={};
    this.style={setProperty:(name,v)=>{this.style[name]=v}};
    this.listeners=new Map();this.names=new Set();
    this.classList={
      add:x=>this.names.add(x),
      remove:x=>this.names.delete(x),
      contains:x=>this.names.has(x),
      toggle:(x,on)=>{on?this.names.add(x):this.names.delete(x);return !!on}
    };
  }
  setAttribute(k,v){this.attrs[k]=String(v);}
  getAttribute(k){return this.attrs[k]??null;}
  append(...nodes){for(const n of nodes)if(n)this.children.push(n);}
  replaceChildren(...nodes){this.children=[];this.append(...nodes);}
  addEventListener(name,fn){
    if(!this.listeners.has(name))this.listeners.set(name,[]);
    this.listeners.get(name).push(fn);
  }
  click(data={}){
    for(const fn of this.listeners.get("click")||[])fn({
      target:this,clientX:0,clientY:0,...data
    });
  }
  getBoundingClientRect(){return {left:0,top:0,width:620,height:620};}
}
function fakeDoc(){
  const html=readFileSync(new URL("./regions/index.html",import.meta.url),"utf8");
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  const elems=new Map(ids.map(id=>[id,new Element(id)]));
  return {
    getElementById:id=>{
      if(!elems.has(id))throw Error("Missing element "+id);
      return elems.get(id);
    },
    createElement:tag=>new Element(tag),
    createElementNS:(_ns,tag)=>new Element(tag),
    elems
  };
}
test("Graph Art lets students shade, preview, finish five true facets and replay",()=>{
  const doc=fakeDoc(),store=new Map([
    ["inequality-ink-v5","keep-pixel-save"],
    ["inequality-ink-quadratic-quest-v2","keep-quadratic-save"]
  ]);
  const storage={getItem:k=>store.has(k)?store.get(k):null,
    setItem:(k,v)=>store.set(k,v)};
  const win={confirm:()=>true,scrollTo(){}};
  const app=initRegionsApp({doc,storage,win});
  const $=doc.getElementById;
  assert.equal($("regionFacetTitle").textContent,"Sunlit facet");
  assert.equal($("regionEquation").textContent,"x ≤ 0");
  assert.equal($("regionGiven").textContent,"Already shaded: y ≥ 0");
  assert.equal($("regionStepCount").textContent,"0 of 15 decisions");
  const preview=()=>$("regionGraph").children
    .filter(node=>node.getAttribute("data-region-layer")==="preview");
  const coloured=()=>$("regionGraph").children
    .filter(node=>node.getAttribute("data-region-layer")?.startsWith("finished-"));
  assert.ok(preview().length===1);
  // Incorrect sides and styles must never complete a decision.
  $("regionSideB").click(); // Right, but x <= 0 needs Left.
  $("regionSolid").click();
  assert.ok(preview().length===1);
  $("regionCheckButton").click();
  assert.match($("regionFeedback").textContent,/Not quite/);
  assert.equal(app.readProgress().step,0);
  $("regionHintButton").click();
  assert.equal($("regionHintBox").hidden,false);
  // Actual graph tapping should choose the left half-plane, not just a button.
  const x=52+(-2+5)/10*516, y=52+(5-2)/10*516;
  $("regionGraph").click({clientX:x,clientY:y});
  assert.equal($("regionSideA").getAttribute("aria-pressed"),"true");
  $("regionCheckButton").click();
  assert.equal(app.readProgress().step,1);
  assert.equal($("regionEquation").textContent,"y ≤ x + 4");
  assert.equal($("regionGiven").textContent,"Already shaded: y ≥ 0  ∩  x ≤ 0");
  assert.equal(regionProgressSteps(app.readProgress()),1);
  assert.equal(JSON.parse(storage.getItem(REGION_SAVE_KEY)).step,1);

  let solved=1;
  for(const [index,facet] of REGION_FACETS.entries()){
    const start=index===0?facet.given+1:facet.given;
    for(let i=start;i<facet.rules.length;i++){
      const rule=facet.rules[i],expectSide=regionSide(rule);
      const target=regionSideOptions(rule).indexOf(expectSide)===0?
        "regionSideA":"regionSideB";
      $(target).click();
      $(rule.inclusive?"regionSolid":"regionDashed").click();
      $("regionCheckButton").click();
      solved++;
      const snapshot=app.readProgress();
      assert.equal(regionProgressSteps(snapshot),solved,
        "Decision "+solved+" should be saved");
      assert.equal(coloured().length,snapshot.done);
      assert.equal(store.get("inequality-ink-v5"),"keep-pixel-save");
      assert.equal(store.get("inequality-ink-quadratic-quest-v2"),"keep-quadratic-save");
    }
    assert.equal(app.readProgress().done,index+1);
  }
  assert.equal(solved,REGION_STEP_TOTAL);
  assert.equal($("regionTaskPanel").hidden,true);
  assert.equal($("regionFinishPanel").hidden,false);
  assert.equal(coloured().length,5);
  assert.equal($("regionProgressFill").style.width,"100%");
  assert.equal($("regionCanvasCount").textContent,"5 / 5 facets");
  assert.equal($("regionReviewContent").children.length,10);
  $("regionPlayAgain").click();
  assert.deepEqual(app.readProgress(),{done:0,step:0,replays:1});
  assert.equal(coloured().length,0);
  assert.equal($("regionTaskPanel").hidden,false);
  assert.equal(store.get("inequality-ink-v5"),"keep-pixel-save");
  assert.equal(store.get("inequality-ink-quadratic-quest-v2"),"keep-quadratic-save");
});
test("Reloading Graph Art resumes within a facet, preserving real inequality intersections",()=>{
  const doc=fakeDoc(),storage=new Map();
  storage.set(REGION_SAVE_KEY,JSON.stringify({done:3,step:2,replays:1}));
  const app=initRegionsApp({
    doc,
    storage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    win:{confirm:()=>true,scrollTo(){}}
  });
  assert.deepEqual(app.readProgress(),{done:3,step:2,replays:1});
  assert.equal(doc.getElementById("regionFacetTitle").textContent,"Twilight facet");
  assert.equal(doc.getElementById("regionEquation").textContent,"y ≥ x − 4");
  const graph=doc.getElementById("regionGraph");
  assert.equal(graph.children.filter(n=>n.getAttribute("data-region-layer")?.startsWith("finished-")).length,3);
  assert.equal(graph.children.filter(n=>n.getAttribute("data-region-layer")==="preview").length,1);
  assert.equal(doc.getElementById("regionStepCount").textContent,"10 of 15 decisions");
});
