import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  REGION_WORLD,REGION_FACETS,validateRegionArt,
  intersectRegion,polygonArea,pointSatisfiesAll,regionSide,
  regionBoundaryStyle,regionCorrect,lineOnRegionGraph,evaluateRegionRule
} from "./regions/regions-engine.mjs";
import {
  GRAPH_ART_PICTURES,GRAPH_PRACTICE_PICTURES,GRAPH_ART_MODES,GRAPH_ART_STAGES,GRAPH_ART_DETAIL_COLORS,
  GRAPH_ART_SAVE_KEY,graphPicture,graphModeGallery,graphLegacyExtras,
  graphTotalBoundaries,graphCellAt,graphArrow,validateGraphPictureLibrary,
  graphPracticeGallery,reverseInequalityOptions
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
      const strictCounts=path.map(p=>all(p).filter(r=>!r.inclusive).length);
      assert.equal(strictCounts[0],0,"Wrapped Gift should teach solid boundaries first");
      assert.equal(strictCounts[1],1,"Mountain Morning should introduce exactly one dashed boundary");
      for(let i=2;i<path.length;i++){
        assert.ok(strictCounts[i]>0,"Later stages should include dashed boundaries");
        assert.ok(strictCounts[i]<all(path[i]).length,
          "Later stages must continue to mix solid and dashed boundaries");
      }
      const sun=path[1].pieces.find(p=>p.id==="mountain-sun");
      const dashed=sun.rules.filter(r=>!r.inclusive);
      assert.deepEqual(dashed.map(r=>r.id),["mountain-sun-2"]);
      assert.equal(regionBoundaryStyle(dashed[0]),"dashed");
      assert.equal(regionCorrect(dashed[0],regionSide(dashed[0]),"solid"),false);
      assert.equal(regionCorrect(dashed[0],regionSide(dashed[0]),"dashed"),true);
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

test("Displayed inequality text agrees with the geometry at sample coordinates",()=>{
  const fractions={"½":"1/2","⅓":"1/3","⅔":"2/3","¼":"1/4",
    "¾":"3/4","⅕":"1/5","⅖":"2/5","⅗":"3/5","⅘":"4/5"};
  const evalLinear=(expression,x,y)=>{
    let expr=expression.replaceAll("−","-").replace(/\s+/g,"");
    for(const [v,n] of Object.entries(fractions))expr=expr.replaceAll(v,n);
    const terms=expr.match(/[+-]?[^+-]+/g)||[];
    return terms.reduce((sum,token)=>{
      const m=token.match(/^([+-]?)(\d+(?:\.\d+)?(?:\/\d+)?)?([xy])?$/);
      assert.ok(m,"Unparseable mathematical display term '"+token+"'");
      const sign=m[1]==="-"?-1:1;
      const k=m[2]?(m[2].includes("/")?
        m[2].split("/").map(Number).reduce((a,b)=>a/b):
        Number(m[2])):1;
      return sum+sign*k*(m[3]==="x"?x:m[3]==="y"?y:1);
    },0);
  };
  for(const pic of GRAPH_ART_PICTURES)for(const part of pic.pieces)
    for(const r of part.rules){
      const m=r.text.match(/^(.*?)\s*(≤|≥|<|>)\s*(.*?)$/);
      assert.ok(m,"Rule should have one mathematical relation: "+r.text);
      for(const x of [-4,-2.5,-1,0,1.5,3,4])
        for(const y of [-4,-2.5,-1,0,1.5,3,4]){
          const distance=evaluateRegionRule(r,x,y);
          if(Math.abs(distance)<1e-5)continue;
          const l=evalLinear(m[1],x,y),right=evalLinear(m[3],x,y);
          const displayed=m[2]==="≤"?l<=right:
            m[2]==="≥"?l>=right:m[2]==="<"?l<right:l>right;
          assert.equal(displayed,distance<0,
            "Misleading displayed inequality '"+r.text+"' at ("+x+","+y+")");
        }
    }
});

test("Decorations outside coloured regions remain visible on the ivory canvas",()=>{
  const luminance=color=>{
    assert.match(color,/^#[0-9a-fA-F]{6}$/);
    const channels=[1,3,5].map(i=>
      parseInt(color.slice(i,i+2),16)/255)
      .map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);
    return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
  };
  const contrast=(a,b)=>{
    const [bright,dark]=[luminance(a),luminance(b)].sort((a,b)=>b-a);
    return (bright+.05)/(dark+.05);
  };
  const canvas="#fffcf8";
  for(const [name,color] of Object.entries(GRAPH_ART_DETAIL_COLORS)){
    assert.ok(contrast(color,canvas)>=3,
      "Shared accent "+name+" must remain visible against the ivory canvas");
  }
  for(const picture of GRAPH_ART_PICTURES){
    if(!Array.isArray(picture.details))continue;
    for(const [index,d] of picture.details.entries()){
      // Decorations wholly outside any coloured region (stars, water, bows)
      // cannot use the near-white colours kept for in-shape highlights.
      const center=d.type==="line"?
        {x:(d.x1+d.x2)/2,y:(d.y1+d.y2)/2}:
        {x:d.x,y:d.y};
      const onArt=picture.pieces.some(part=>part.rules.every(rule=>
        evaluateRegionRule(rule,center.x,center.y)<=1e-7));
      if(!onArt){
        assert.ok(contrast(d.color,canvas)>=3,
          picture.id+" detail "+index+" ("+d.type+") "+
          d.color+" is too faint against the canvas");
      }
    }
  }
  const flag=graphPicture("signal-flag");
  assert.equal(flag.details[0].outline,GRAPH_ART_DETAIL_COLORS.brown,
    "Keep the sunny star distinct from its coral banner");
  const mountain=graphPicture("mountain-morning");
  assert.equal(mountain.details.filter(d=>d.type==="line"&&d.outline).length,2,
    "The snowcaps should remain legible over the mountains");
  const castle=graphPicture("moonlit-castle");
  assert.equal(castle.details.filter(d=>d.type==="rect"&&d.outline).length,2,
    "Castle windows should retain a darker outline");
});

test("Finished reveal renders decorative outlines and legacy artwork details",()=>{
  const s=session(),{$,app}=s;
  app.choose("mountain-morning","build");
  app.showFinished();
  const snowy=$("graphRevealSvg").children.filter(el=>el.tagName==="line"&&
    el.getAttribute("stroke")===GRAPH_ART_DETAIL_COLORS.mintInk);
  assert.equal(snowy.length,2,"A dark under-stroke must outline both snowy ridges");

  app.choose("moonlit-castle","build");
  app.showFinished();
  const castleWindows=$("graphRevealSvg").children.filter(el=>
    el.tagName==="rect"&&
    el.getAttribute("stroke")===GRAPH_ART_DETAIL_COLORS.brown);
  assert.equal(castleWindows.length,2);

  app.choose("signal-flag","fill");
  app.showFinished();
  const outlinedStars=$("graphRevealSvg").children.filter(el=>
    el.tagName==="polygon"&&
    el.getAttribute("stroke")===GRAPH_ART_DETAIL_COLORS.brown);
  assert.equal(outlinedStars.length,1);

  for(const [picture,mode,colour,expected] of [
    ["little-house","fill",GRAPH_ART_DETAIL_COLORS.gold,1],
    ["aurora-crystal","build",GRAPH_ART_DETAIL_COLORS.terracotta,3]
  ]){
    app.choose(picture,mode);app.showFinished();
    const sparkle=$("graphRevealSvg").children.filter(el=>
      el.tagName==="text"&&el.getAttribute("fill")===colour);
    assert.equal(sparkle.length,expected,picture+" exterior sparkles should stand out");
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
    "graphModeFill","graphModeBuild","graphModeCurve","graphModePlot",
    "graphStartPicture","graphPreviewSvg","graphPreviewStage",
    "graphGalleryProgress","graphStageTrack",
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
function session(initial={},query=""){
  const doc=fakeDoc(),store=new Map([
    ["inequality-ink-v5","keep-pixel-save"],
    ["inequality-ink-quadratic-quest-v2","keep-quadratic-save"],
    ...Object.entries(initial)
  ]);
  const timers=[];
  const redirects=[];
  const win={setTimeout:fn=>{timers.push(fn);return timers.length;},
    clearTimeout:()=>{},matchMedia:()=>({matches:false}),
    location:{search:query,href:"https://example.com/regions/"+query,
      assign:url=>redirects.push(url)}};
  const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
  const app=initRegionsApp({doc,storage,win});
  return {doc,store,storage,timers,redirects,win,app,$:doc.getElementById};
}
// Gallery cards choose a picture; the preview's primary button starts it.
function selectAndStart(s,index){
  s.$("graphPictureCards").children[index].click();
  s.$("graphStartPicture").click();
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
  assert.match($("graphGalleryProgress").textContent,/1 of 6 discovered/);
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
  selectAndStart(s,0);
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
  assert.deepEqual($("graphPieceMarkers").children.map(item=>item.className),
    ["is-done","is-current"],
    "Graph Art progress markers should reflect real painted regions");
  app.pickAt(0,1.5);app.checkFill();
  assert.equal($("graphSummary").hidden,false);
  assert.equal($("graphSummaryMetrics").children.length,3);
  assert.ok($("graphSummaryArt").children.some(node=>node.tagName==="path"),
    "Completion screen must show the actual inequality artwork");
  assert.ok($("graphSavePicture").listeners.get("click")?.length,
    "A save action should be available without reopening the reveal");
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
  selectAndStart(s,4);
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
  $("graphModeBuild").click();selectAndStart(s,0);
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
  $("graphModeBuild").click();selectAndStart(s,4);
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
  $("graphModeBuild").click();selectAndStart(s,3);
  const part=modePictures("build")[3].pieces[0];
  answerRules(s,part);
  const obsolete=timers.at(-1);
  $("graphBack").click();
  assert.equal($("graphPicker").hidden,false);
  assert.deepEqual(app.readProgress().records["build:aurora-crystal"],
    {done:0,line:3,replays:0});
  obsolete();
  assert.equal(app.readProgress().records["build:aurora-crystal"].done,0);
  selectAndStart(s,3);
  assert.equal($("graphNextPiece").hidden,false);
  assert.equal($("graphAddLine").hidden,true);
  $("graphNextPiece").click();
  assert.equal(app.readProgress().records["build:aurora-crystal"].done,1);
  $("graphBack").click();
  selectAndStart(s,4);
  assert.equal($("graphAddLine").disabled,false);
  const doc=fakeDoc(),fresh=initRegionsApp({doc,storage,win:s.win});
  assert.equal(fresh.readProgress().records["build:aurora-crystal"].done,1);
  assert.equal(doc.getElementById("graphPictureCards").children.length,5);
});

test("Keyboard fill navigation and incorrect Build choices remain usable",()=>{
  const s=session(),{$,app,store}=s;
  selectAndStart(s,1); // Original Little House.
  $("graphArtGraph").fire("keydown",{key:"ArrowRight"});
  assert.match($("graphFeedback").textContent,/Cursor at/);
  $("graphArtGraph").fire("keydown",{key:"Enter"});
  assert.ok($("graphArtGraph").children.some(x=>
    x.getAttribute("data-region-layer")==="selection"));
  $("graphBack").click();
  $("graphModeBuild").click();selectAndStart(s,0);
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
  $("graphModeBuild").click();selectAndStart(s,0);
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
  $("graphModeBuild").click();selectAndStart(s,0);
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
  assert.match($("graphGalleryProgress").textContent,/5 of 6 discovered/);
  assert.equal($("graphStageTrack").children.length,5);
  assert.equal($("graphStageTrack").children.filter(x=>
    x.className.includes("is-complete")).length,4,
    "The extra Step Up practice artwork remains undiscovered");
  $("graphModeBuild").click();
  assert.match($("graphGalleryProgress").textContent,/0 of 6 discovered/);
  assert.equal($("graphPictureCards").children.length,5);
});


test("Completed Graph Art cards open view-only; replay needs confirmation",()=>{
  const finished=modePictures("fill")[0];
  const other=modePictures("fill")[1];
  const initial={
    mode:"fill",picture:finished.id,records:{
      ["fill:"+finished.id]:{done:finished.pieces.length,line:0,replays:1},
      ["fill:"+other.id]:{done:1,line:0,replays:0}
    }
  };
  const s=session({[GRAPH_ART_SAVE_KEY]:JSON.stringify(initial)}),{$}=s;
  const card=$("graphPictureCards").children[0];
  assert.match(card.className,/is-complete/);
  assert.match(card.getAttribute("aria-label"),/Completed:/);
  assert.match(card.children[1].children.at(-1).textContent,/Completed/);
  card.click();
  assert.match($("graphStartPicture").textContent,/View completed picture/);
  $("graphStartPicture").click();
  assert.equal($("graphSummary").hidden,false);
  assert.equal($("graphReveal").getAttribute("open"),"");
  assert.equal(s.app.readProgress().records["fill:"+finished.id].done,
    finished.pieces.length,"Viewing must retain finished progress");
  $("graphRevealClose").click();
  s.win.confirm=()=>false;
  $("graphRestart").click();
  assert.equal(s.app.readProgress().records["fill:"+finished.id].done,
    finished.pieces.length,"Cancellation must not erase finished art");
  s.win.confirm=()=>true;
  $("graphRestart").click();
  assert.equal($("graphPlay").hidden,false);
  assert.equal(s.app.readProgress().records["fill:"+finished.id].done,0);
  assert.equal(s.app.readProgress().records["fill:"+other.id].done,1,
    "Restart must not clear progress on other pictures");
  assert.equal(s.app.readProgress().records["fill:"+finished.id].replays,2);
});

test("The in-game Restart control can be cancelled without losing progress",()=>{
  const s=session(),{$}=s;
  selectAndStart(s,0);
  const p=modePictures("fill")[0];
  // The button must work even before any piece is checked.
  let confirmations=0;
  s.win.confirm=()=>{confirmations++;return false;};
  $("graphRestartPlaying").click();
  assert.equal(confirmations,1);
  assert.equal(s.app.readProgress().records["fill:"+p.id].replays,0);
  s.win.confirm=()=>true;
  $("graphRestartPlaying").click();
  assert.equal(s.app.readProgress().records["fill:"+p.id].replays,1);
});


test("One Graph Art studio switches across four galleries without mixing progress",()=>{
  const curveRecord={picture:"parabola-butterfly",records:{
    "parabola-butterfly":{done:2,replays:0}
  }};
  const plotRecord={picture:"little-umbrella",records:{
    "little-umbrella":{done:1,phase:"plot",plotIndex:0,points:[],
      styleChoice:null,verified:[],replays:0}
  }};
  const initial={
    "inequality-ink-curve-fill-v2":JSON.stringify(curveRecord),
    "inequality-ink-plot-shade-v2":JSON.stringify(plotRecord)
  };
  const s=session(initial),{$}=s;
  const urls=[];
  s.win.location={href:"https://example.com/regions/",search:"",
    assign:url=>urls.push(url)};
  $("graphModeCurve").click();
  assert.equal($("graphModeCurve").getAttribute("aria-pressed"),"true");
  assert.equal($("graphPictureCards").children.length,5);
  assert.match($("graphGalleryProgress").textContent,/1 of 6 discovered/);
  assert.ok(!$("graphPreviewSvg").children.some(n=>n.tagName==="path"),
    "Difficulty-first start must hide unearned curved mystery art");
  assert.equal($("graphPreviewStage").textContent,"2 · Step Up",
    "Completed first stage should recommend the next challenge");
  $("graphPictureCards").children[0].click();
  assert.match($("graphStartPicture").textContent,/View completed picture/);
  assert.equal($("graphPicker").hidden,false,
    "Selecting a picture should preview it, not immediately start");
  $("graphStartPicture").click();
  assert.equal(urls.at(-1),"./curve.html?picture=parabola-butterfly");
  $("graphModePlot").click();
  assert.equal($("graphModePlot").getAttribute("aria-pressed"),"true");
  assert.equal($("graphPictureCards").children.length,5);
  assert.match($("graphGalleryProgress").textContent,/0 of 6 discovered/);
  $("graphPictureCards").children[0].click();
  assert.match($("graphStartPicture").textContent,/Continue picture/);
  $("graphStartPicture").click();
  assert.equal(urls.at(-1),"./plot.html?picture=little-umbrella");
  $("graphModeFill").click();
  assert.equal($("graphModeFill").getAttribute("aria-pressed"),"true");
  assert.equal($("graphPictureCards").children.length,5);
  assert.equal(s.store.get("inequality-ink-curve-fill-v2"),
    JSON.stringify(curveRecord),"Selecting other modes must preserve curve progress");
  assert.equal(s.store.get("inequality-ink-plot-shade-v2"),
    JSON.stringify(plotRecord),"Selecting other modes must preserve plot progress");
});

test("The hub needs a separate, visible Start action to open linear pictures",()=>{
  const s=session(),{$}=s;
  $("graphPictureCards").children[2].click();
  assert.equal($("graphPicker").hidden,false);
  assert.equal($("graphPictureCards").children[2].getAttribute("aria-pressed"),"true");
  assert.match($("graphPreviewStage").textContent,/3 · Building/);
  $("graphStartPicture").click();
  assert.equal($("graphPlay").hidden,false);
  $("graphBack").click();
  assert.equal($("graphPicker").hidden,false);
  assert.equal($("graphPictureCards").children[2].getAttribute("aria-pressed"),"true");
});

test("Hub query links restore the selected mode and picture",()=>{
  const s=session({},"?mode=curve&picture=rolling-hills"),{$}=s;
  assert.equal($("graphModeCurve").getAttribute("aria-pressed"),"true");
  assert.equal($("graphPreviewStage").textContent,"2 · Step Up");
  assert.equal($("graphPreviewName").textContent,"A sunny landscape",
    "Unfinished previews should show the mystery clue, not spoil the picture name");
  assert.equal($("graphPictureCards").children[1].getAttribute("aria-pressed"),"true");
  $("graphStartPicture").click();
  assert.equal(s.redirects.at(-1),"./curve.html?picture=rolling-hills");
  const plot=session({},"?mode=plot&picture=rocket-launch");
  assert.equal(plot.$("graphModePlot").getAttribute("aria-pressed"),"true");
  assert.equal(plot.$("graphPreviewStage").textContent,"5 · Big Finish");
});


test("Phase 6 leaves all five original stages untouched, with one fresh practice card per linear mode",()=>{
  assert.equal(validateGraphPictureLibrary(),true);
  assert.equal(GRAPH_ART_PICTURES.length,10,"Original gallery must stay at ten");
  assert.equal(GRAPH_PRACTICE_PICTURES.length,2);
  for(const mode of ["fill","build"]){
    const bonus=graphPracticeGallery(mode);
    assert.equal(bonus.length,1);
    assert.equal(bonus[0].step,2);
    assert.equal(bonus[0].pieces.length,3);
    assert.ok(bonus[0].practice);
    assert.ok(!GRAPH_ART_PICTURES.some(p=>p.id===bonus[0].id));
  }
  const s=session(),{$}=s;
  assert.equal($("graphPictureCards").children.length,5);
  assert.equal($("graphPracticeCards").children.length,1);
  assert.equal($("graphStageTrack").children.length,5);
  const tent=graphPracticeGallery("fill")[0];
  $("graphPracticeCards").children[0].click();
  assert.equal($("graphPreviewName").textContent,tent.clue);
  $("graphStartPicture").click();
  for(const part of tent.pieces){
    const pos=centroid(intersectRegion(part.rules));
    assert.equal(graphCellAt(part,pos.x,pos.y)?.correct,true,part.id);
    s.app.pickAt(pos.x,pos.y);
    $("graphCheckFill").click();
  }
  assert.equal($("graphSummary").hidden,false);
  assert.equal($("graphNextPicture").hidden,false,
    "An optional practice reveal can now return to the difficulty-first chooser");
  assert.equal(s.app.readProgress().records["fill:"+tent.id].done,3);
  assert.ok(s.store.get(GRAPH_ART_SAVE_KEY));
  const after=session(Object.fromEntries(s.store));
  assert.equal(after.app.readProgress().records["fill:"+tent.id].done,3);
  assert.equal(after.$("graphPictureCards").children.length,5);
});

test("Optional reverse Build & Shade reads the shaded graph rather than showing the answer",()=>{
  const picture=graphPracticeGallery("build")[0];
  const s=session({}, "?mode=build"),{$}=s;
  assert.equal($("graphPracticeCards").children.length,1);
  $("graphPracticeCards").children[0].click();
  $("graphStartPicture").click();
  assert.equal($("graphPlay").hidden,false);
  assert.equal($("graphBuildControls").hidden,true);
  assert.equal($("graphReverseControls").hidden,false);
  assert.equal($("graphRuleList").children[0].children[0].textContent,
    "Read the highlighted graph");
  const first=picture.pieces[0].rules[0];
  const options=reverseInequalityOptions(first);
  assert.equal(options.length,4);
  assert.equal(new Set(options).size,4);
  assert.ok(options.includes(first.text));
  assert.equal($("graphReverseChoices").children.length,4);
  const wrong=$("graphReverseChoices").children.find(b=>b.textContent!==first.text);
  wrong.click();
  assert.equal(s.app.readProgress().records["build:"+picture.id].line,0);
  assert.equal($("graphWhy").hidden,false);
  assert.equal($("graphWhy").open,false,"Explanation should not auto-open");
  for(const part of picture.pieces){
    for(const rule of part.rules){
      const choices=$("graphReverseChoices").children;
      assert.equal(choices.length,4,"Each line asks a genuinely new reverse question");
      const answer=choices.find(b=>b.textContent===rule.text);
      assert.ok(answer,"Correct mathematical relation must appear");
      answer.click();
    }
    assert.equal($("graphReverseNext").hidden,true,
      "Wait for the existing converge animation");
    s.timers.at(-1)();
    assert.equal($("graphReverseNext").hidden,false);
    $("graphReverseNext").click();
  }
  assert.equal($("graphSummary").hidden,false);
  assert.equal(s.app.readProgress().records["build:"+picture.id].done,3);
  assert.equal($("graphReveal").getAttribute("open"),"");
  const restored=session(Object.fromEntries(s.store),"?mode=build");
  assert.equal(restored.app.readProgress().records["build:"+picture.id].done,3);
  assert.equal(restored.$("graphPictureCards").children.length,5);
});


test("Difficulty-first hub keeps all unfinished artwork secret until the student begins",()=>{
  const s=session(),{$}=s;
  assert.equal($("graphDifficultyChoices").children.length,5);
  assert.equal($("graphDifficultyChoices").children[0].getAttribute("aria-pressed"),"true");
  assert.equal($("graphPreviewName").textContent,"Mystery artwork");
  assert.equal($("graphPictureGallery").open,undefined,
    "Gallery should not be expanded by the game");
  assert.ok(!$("graphPreviewSvg").children.some(n=>n.tagName==="path"),
    "A fresh mystery cannot preview its coloured art");
  assert.match($("graphMysteryHint").textContent,/1 new or unfinished mystery/);
  $("graphStartMystery").click();
  assert.equal($("graphPlay").hidden,false);
  assert.equal(s.app.readProgress().picture,"signal-flag");
  assert.equal($("graphReveal").getAttribute("open"),null);
  $("graphBack").click();
  assert.equal($("graphPreviewName").textContent,"Mystery artwork");
});
test("Difficulty selection restores per-mode levels and never alters student game saves",()=>{
  const s=session(),{$}=s,original=s.store.get("inequality-ink-v5");
  $("graphDifficultyChoices").children[4].click();
  assert.equal($("graphDifficultyChoices").children[4].getAttribute("aria-pressed"),"true");
  assert.match($("graphMysteryHint").textContent,/9 mathematical pieces/);
  const choices=JSON.parse(s.store.get("inequality-ink-graph-mystery-tiers-v1"));
  assert.equal(choices.fill,5);
  assert.equal(s.store.get("inequality-ink-v5"),original);
  $("graphModeBuild").click();
  $("graphDifficultyChoices").children[1].click();
  assert.equal(JSON.parse(s.store.get("inequality-ink-graph-mystery-tiers-v1")).build,2);
  const restored=session(Object.fromEntries(s.store));
  // The active Graph Art mode itself was saved as Build; preferences persist
  // independently and switching back to Fill restores its Masterpiece level.
  assert.equal(restored.$("graphDifficultyChoices").children[1].getAttribute("aria-pressed"),"true");
  restored.$("graphModeFill").click();
  assert.equal(restored.$("graphDifficultyChoices").children[4].getAttribute("aria-pressed"),"true");
});
test("Step Up mystery randomiser skips solved art; Continue resumes exact partial work",()=>{
  const core=graphModeGallery("fill")[1],bonus=graphPracticeGallery("fill")[0];
  const initial={mode:"fill",picture:core.id,records:{
    ["fill:"+core.id]:{done:1,line:0,replays:0}
  }};
  const s=session({[GRAPH_ART_SAVE_KEY]:JSON.stringify(initial)}),{$}=s;
  $("graphDifficultyChoices").children[1].click();
  assert.match($("graphMysteryHint").textContent,/2 new or unfinished mysteries/);
  assert.equal($("graphContinueMystery").hidden,false);
  $("graphStartMystery").click();
  assert.equal(s.app.readProgress().picture,bonus.id,
    "Untouched picture should be preferred to abandoning partially completed art");
  $("graphBack").click();
  $("graphContinueMystery").click();
  assert.equal(s.app.readProgress().picture,core.id);
  assert.equal(s.app.readProgress().records["fill:"+core.id].done,1);
  $("graphBack").click();
  // Completing the core cannot cause a repeated core picture via Start.
  s.app.readProgress(); 
  const done={mode:"fill",picture:core.id,records:{
    ["fill:"+core.id]:{done:core.pieces.length,line:0,replays:0}
  }};
  const next=session({[GRAPH_ART_SAVE_KEY]:JSON.stringify(done)}),$next=next.$;
  $next("graphDifficultyChoices").children[1].click();
  $next("graphStartMystery").click();
  assert.equal(next.app.readProgress().picture,bonus.id);
  const allDone={mode:"fill",picture:core.id,records:{
    ["fill:"+core.id]:{done:core.pieces.length,line:0,replays:0},
    ["fill:"+bonus.id]:{done:bonus.pieces.length,line:0,replays:0}
  }};
  const complete=session({[GRAPH_ART_SAVE_KEY]:JSON.stringify(allDone)}),$all=complete.$;
  $all("graphDifficultyChoices").children[1].click();
  assert.equal($all("graphStartMystery").disabled,true);
  assert.equal($all("graphContinueMystery").hidden,true);
  assert.match($all("graphPreviewProgress").textContent,/All discovered/);
  // A gallery replay remains available, but is never selected automatically.
  $all("graphPracticeCards").children[0].click();
  assert.match($all("graphStartPicture").textContent,/View completed picture/);
  $all("graphStartPicture").click();
  assert.equal($all("graphSummary").hidden,false);
});
test("Curve and Plot mystery routes carry the selected tier and preserve direct gallery links",()=>{
  for(const mode of ["curve","plot"]){
    const s=session({},"?mode="+mode),{$}=s;
    assert.equal($("graphDifficultyChoices").children.length,5);
    $("graphDifficultyChoices").children[1].click();
    $("graphStartMystery").click();
    assert.match(s.redirects.at(-1),new RegExp("^\\./"+mode+
      "\\.html\\?picture=[^&]+&from=mystery&tier=2$"));
    assert.equal($("graphPicker").hidden,false,
      "The destination page starts the lesson; the shared hub is preserved");
    const old=session({},"?mode="+mode+"&picture="+
      (mode==="curve"?"rolling-hills":"ice-cream-dream"));
    old.$("graphStartPicture").click();
    assert.ok(!old.redirects.at(-1).includes("from=mystery"),
      "Deliberately chosen gallery URLs must remain unchanged");
  }
});
