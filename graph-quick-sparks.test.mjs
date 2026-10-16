import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  GRAPH_ART_PICTURES,GRAPH_PRACTICE_PICTURES,graphPicture,
  graphModeGallery,graphPracticeGallery,validateGraphPictureLibrary
} from "./regions/graph-art-pictures.mjs";
import {
  CURVE_PICTURES,CURVE_PRACTICE_PICTURES,curvePicture,
  validateCurveGallery
} from "./regions/curve-pictures.mjs";
import {
  PLOT_PICTURES,PLOT_PRACTICE_PICTURES,plotPicture,plotSteps,plotRule,
  validatePlotGallery,validatePlotPicture
} from "./regions/plot-pictures.mjs";
import {LINEAR_QUICK_SPARKS} from "./regions/linear-quick-sparks.mjs";
import {CURVE_QUICK_SPARKS} from "./regions/curve-quick-sparks.mjs";
import {PLOT_QUICK_SPARKS} from "./regions/plot-quick-sparks.mjs";
import {pointSatisfiesAll} from "./regions/regions-engine.mjs";
import {
  satisfiesAll as curvedInside,regionPaths
} from "./regions/curved-engine.mjs";
import {checkConstruction} from "./regions/plot-engine.mjs";
import {graphMysteryPool,graphPickMystery,graphMysteryStatus}
  from "./regions/graph-mysteries.mjs";

const MODES=["fill","build","curve","plot"];
const NEW=[...LINEAR_QUICK_SPARKS,...CURVE_QUICK_SPARKS,...PLOT_QUICK_SPARKS];
const allByMode=mode=>mode==="fill"||mode==="build"?
  [graphModeGallery(mode),graphPracticeGallery(mode)]:
  mode==="curve"?[CURVE_PICTURES,CURVE_PRACTICE_PICTURES]:
  [PLOT_PICTURES,PLOT_PRACTICE_PICTURES];
const detailsByStage=p=>[1,2,3].map(stage=>
  p.details.filter(d=>d.stage===stage).length);
const canvasMask=p=>{
  const inside=p.mode==="fill"||p.mode==="build"?pointSatisfiesAll:curvedInside;
  const mask=[];
  for(let y=4.8;y>=-4.8;y-=.4){
    let row="";
    for(let x=-4.8;x<=4.8;x+=.4){
      let cell=".";
      for(const [i,part] of p.pieces.entries())
        if(inside(part.rules,x,y))cell=String.fromCharCode(65+i);
      row+=cell;
    }
    mask.push(row);
  }
  return mask.join("/");
};

test("Graph Art begins Pass 2 with exactly five independent Quick Spark pictures in every mode",()=>{
  assert.equal(GRAPH_ART_PICTURES.length,10);
  assert.equal(CURVE_PICTURES.length,5);
  assert.equal(PLOT_PICTURES.length,5);
  assert.equal(LINEAR_QUICK_SPARKS.length,8);
  assert.equal(CURVE_QUICK_SPARKS.length,4);
  assert.equal(PLOT_QUICK_SPARKS.length,4);
  assert.equal(NEW.length,16);
  const all=[...GRAPH_ART_PICTURES,...GRAPH_PRACTICE_PICTURES,
    ...CURVE_PICTURES,...CURVE_PRACTICE_PICTURES,
    ...PLOT_PICTURES,...PLOT_PRACTICE_PICTURES];
  assert.equal(all.length,40);
  assert.equal(new Set(all.map(p=>p.id)).size,40,"Independent progress IDs cannot collide");
  for(const mode of MODES){
    const [core,practice]=allByMode(mode);
    assert.equal(core.length,5);
    assert.equal(practice.length,5);
    assert.equal(practice.filter(p=>p.step===1&&p.quickSpark).length,4);
    const starter=graphMysteryPool(mode,1,core,practice);
    assert.equal(starter.length,5,mode+" has fewer than five first challenges");
    assert.equal(new Set(starter.map(p=>p.id)).size,5);
    assert.ok(starter.every(p=>p.pieces.length===2&&p.step===1&&p.mode===mode));
    assert.equal(graphMysteryStatus(starter,()=>({done:0})).remaining,5);
    assert.equal(graphPickMystery(starter,()=>({done:0}),()=>.999),starter[4]);
    const finished=new Set(starter.slice(0,4).map(p=>p.id));
    assert.equal(graphPickMystery(starter,p=>({
      done:finished.has(p.id)?p.pieces.length:0
    }),()=>0),starter[4]);
    assert.equal(graphPickMystery(starter,p=>({done:p.pieces.length}),()=>0),null);
  }
  assert.deepEqual(MODES.map(m=>allByMode(m).flat().length),[10,10,10,10]);
});

test("All twenty-five old mathematical artworks and saved picture identifiers remain intact",()=>{
  for(const [id,find] of [
    ["signal-flag",graphPicture],["wrapped-gift",graphPicture],
    ["little-house",graphPicture],["aurora-crystal",graphPicture],
    ["camping-tent",graphPicture],["diamond-kite",graphPicture],
    ["parabola-butterfly",curvePicture],["rolling-hills",curvePicture],
    ["balloon-parade",curvePicture],["little-umbrella",plotPicture],
    ["ice-cream-dream",plotPicture],["snow-globe",plotPicture]
  ])assert.ok(find(id),"Missing previous picture "+id);
  assert.ok(graphPracticeGallery("build").some(p=>
    p.id==="diamond-kite"&&p.practiceType==="reverse"),
    "Reverse-only Build & Shade remains opt-in");
  assert.equal(validateGraphPictureLibrary(),true);
  assert.equal(validateCurveGallery(),true);
  assert.equal(validatePlotGallery(),true);
});

test("New linear regions are four exact axis-aligned half-planes with no hidden slopes",()=>{
  for(const p of LINEAR_QUICK_SPARKS){
    assert.equal(p.pieces.length,2);
    assert.equal(p.step,1);
    for(const piece of p.pieces){
      assert.equal(piece.rules.length,4,p.id+" "+piece.id);
      for(const r of piece.rules){
        assert.ok((r.a===0&&Math.abs(r.b)===1)||
          (r.b===0&&Math.abs(r.a)===1),r.id);
        assert.match(r.text,/^[xy] [≤≥<>] [−]?\d+(\.\d+)?$/);
        assert.ok(r.inclusive||p.mode==="build",
          "Find & Fill Quick Spark should keep solid edges");
      }
    }
  }
  const build=LINEAR_QUICK_SPARKS.filter(p=>p.mode==="build");
  assert.ok(build.some(p=>p.pieces.some(part=>
    part.rules.some(r=>!r.inclusive))),
    "Some Build & Shade Quick Sparks should exercise dashed edges");
});

test("New curved starter pictures use actual simple parabolas and touch-selectable regions",()=>{
  for(const p of CURVE_QUICK_SPARKS){
    assert.equal(p.pieces.length,2);
    for(const part of p.pieces){
      assert.ok(part.rules.some(r=>r.kind==="function"&&r.coeffs.length===3),
        "Each region must have a genuine parabola: "+part.id);
      assert.ok(part.rules.every(r=>r.kind==="function"||r.kind==="vertical"),
        "Circles and absolute value curves belong to later levels");
      for(const r of part.rules){
        if(r.kind==="function"&&r.coeffs.length===3){
          assert.equal(r.coeffs[1],0,
            "Beginner parabolas remain centred on the y-axis");
        }
      }
      assert.ok(regionPaths(part.rules).length>0,
        "Every new shaded mathematical region must exist");
      let selectable=false;
      for(let x=-4.5;x<=4.5&&!selectable;x+=.25)
        for(let y=-4.5;y<=4.5;y+=.25)
          if(curvedInside(part.rules,x,y)){selectable=true;break;}
      assert.equal(selectable,true,p.id+" "+part.id);
    }
  }
});

test("Every new Plot & Shade boundary can be constructed with two correct snapped points",()=>{
  let lines=0,parabolas=0,strict=0;
  for(const p of PLOT_QUICK_SPARKS){
    assert.equal(validatePlotPicture(p),true);
    for(const part of p.pieces){
      assert.equal(plotSteps(part).length,1,
        "Quick Spark should require one new graph per piece");
      const step=plotSteps(part)[0];
      const target=plotRule(part,0);
      assert.ok(target&&["line","parabola"].includes(step.kind));
      assert.ok(step.samplePoints.every(v=>
        Number.isInteger(v.x*2)&&Number.isInteger(v.y*2)));
      assert.equal(checkConstruction({kind:step.kind,rule:target},
        step.samplePoints).correct,true,p.id+" "+part.id);
      if(step.kind==="parabola")parabolas++;else lines++;
      if(!target.inclusive)strict++;
    }
  }
  assert.ok(lines>=4&&parabolas>=3,
    "Mix introductory line and parabola plotting rather than repeating one skill");
  assert.ok(strict>=1,"Include a dashed line example at starter level");
});

test("The sixteen reveals have distinctive mathematical silhouettes and staged finishing touches",()=>{
  const ids=new Set();
  for(const p of NEW){
    assert.ok(p.practice&&p.quickSpark);
    assert.ok(p.clue!==p.name,"Mystery clue cannot reveal the answer "+p.id);
    assert.ok(p.description.length>40&&p.focus.length>25);
    assert.ok(p.details.length>=10,"Each work needs substantial final detailing");
    const stages=detailsByStage(p);
    assert.ok(stages.every(n=>n>=1),p.id+" lacks one reveal stage");
    assert.equal(new Set(p.details.map(d=>d.id)).size,p.details.length,
      p.id+" has duplicate SVG detail IDs");
    for(const d of p.details)
      for(const n of ["x","y","r","rx","ry","width"])
        if(n in d)assert.ok(Number.isFinite(d[n]),p.id+" "+d.id);
    assert.ok(!ids.has(p.name));ids.add(p.name);
  }
  for(const mode of MODES){
    const signatures=NEW.filter(p=>p.mode===mode).map(canvasMask);
    assert.equal(new Set(signatures).size,4,
      "Quick Spark variants must NOT reuse identical mathematical silhouettes: "+mode);
  }
});

test("All picture collections are imported by the existing art engine without changing progress keys",()=>{
  const files=[
    "graph-art-pictures.mjs","curve-pictures.mjs","plot-pictures.mjs"
  ];
  for(const file of files){
    const text=readFileSync(new URL("./regions/"+file,import.meta.url),"utf8");
    assert.match(text,/QUICK_SPARKS/);
  }
  const hub=readFileSync(new URL("./regions/regions-app.mjs",import.meta.url),"utf8");
  assert.ok(hub.includes("hubPracticeGallery"));
  assert.ok(hub.includes("graphPickMystery"));
  assert.ok(!hub.includes("Math.random()*16"),
    "Leave the real unfinished-only selection system untouched");
});
