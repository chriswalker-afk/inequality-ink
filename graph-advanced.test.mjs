import test from "node:test";
import assert from "node:assert/strict";
import {
  GRAPH_ART_PICTURES,GRAPH_PRACTICE_PICTURES,
  graphModeGallery,graphPracticeGallery,graphPicture,graphCellAt,
  validateGraphPictureLibrary
} from "./regions/graph-art-pictures.mjs";
import {
  CURVE_PICTURES,CURVE_PRACTICE_PICTURES,curvePicture,validateCurveGallery
} from "./regions/curve-pictures.mjs";
import {
  PLOT_PICTURES,PLOT_PRACTICE_PICTURES,plotPicture,plotSteps,
  plotRule,validatePlotPicture,validatePlotGallery
} from "./regions/plot-pictures.mjs";
import {ADVANCED_LINEAR_PICTURES} from "./regions/advanced-linear-pictures.mjs";
import {ADVANCED_CURVE_PICTURES,ADVANCED_PLOT_PICTURES}
  from "./regions/advanced-curved-pictures.mjs";
import {graphMysteryPool,graphMysteryStatus,graphPickMystery}
  from "./regions/graph-mysteries.mjs";
import {intersectRegion,polygonArea,pointSatisfiesAll}
  from "./regions/regions-engine.mjs";
import {regionPaths,satisfiesAll,curvedCellAt,validatePicture}
  from "./regions/curved-engine.mjs";
import {checkConstruction,snapPoint,checkBoundaryStyle}
  from "./regions/plot-engine.mjs";

const MODES=["fill","build","curve","plot"];
const ALL=[...ADVANCED_LINEAR_PICTURES,...ADVANCED_CURVE_PICTURES,
  ...ADVANCED_PLOT_PICTURES];
function modeCollection(mode){
  return mode==="curve"?[CURVE_PICTURES,CURVE_PRACTICE_PICTURES]:
    mode==="plot"?[PLOT_PICTURES,PLOT_PRACTICE_PICTURES]:
      [graphModeGallery(mode),graphPracticeGallery(mode)];
}
function imageSignature(p){
  const linear=p.mode==="fill"||p.mode==="build";
  const parts=p.pieces.map((part,index)=>[part,index]);
  let key="";
  for(let y=-4.8;y<4.8;y+=.4){
    for(let x=-4.8;x<4.8;x+=.4){
      let cell=".";
      for(const [part,i] of parts)
        if((linear?pointSatisfiesAll:satisfiesAll)(part.rules,x,y))
          cell=String.fromCharCode(65+i);
      key+=cell;
    }
  }
  return key;
}
test("All twenty advanced pools now offer five unique automatically selectable mysteries",()=>{
  assert.equal(ADVANCED_LINEAR_PICTURES.length,24);
  assert.equal(ADVANCED_CURVE_PICTURES.length,12);
  assert.equal(ADVANCED_PLOT_PICTURES.length,12);
  assert.equal(ALL.length,48);
  const all=[...GRAPH_ART_PICTURES,...GRAPH_PRACTICE_PICTURES,
    ...CURVE_PICTURES,...CURVE_PRACTICE_PICTURES,
    ...PLOT_PICTURES,...PLOT_PRACTICE_PICTURES];
  assert.equal(all.length,101,"One optional reverse-reading challenge is extra");
  assert.equal(new Set(all.map(p=>p.id)).size,101);
  assert.deepEqual(MODES.map(mode=>modeCollection(mode).flat().length),
    [25,26,25,25]);
  for(const mode of MODES)for(const step of [1,2,3,4,5]){
    const [core,practice]=modeCollection(mode);
    const group=graphMysteryPool(mode,step,core,practice);
    assert.equal(group.length,5,mode+" difficulty "+step);
    assert.equal(new Set(group.map(p=>p.id)).size,5);
    assert.equal(group.filter(p=>p.advancedVariety).length,step>=3?4:0);
    const sizes=mode==="fill"?[2,3,4,6,9]:
      mode==="build"?[2,3,4,5,8]:[2,3,4,5,7];
    assert.ok(group.every(p=>p.pieces.length===sizes[step-1]),
      mode+" difficulty "+step+" needs substantive piece progression");
    assert.equal(graphMysteryStatus(group,()=>({done:0})).remaining,5);
    const solved=new Set(group.slice(0,4).map(p=>p.id));
    const record=p=>({done:solved.has(p.id)?p.pieces.length:0});
    assert.equal(graphPickMystery(group,record,()=>.2).id,group[4].id);
    assert.equal(graphPickMystery(group,p=>({done:p.pieces.length}),()=>.2),null);
    assert.equal(new Set(group.map(imageSignature)).size,5,
      "Same mathematical silhouettes do not count as distinct puzzles: "+mode+" tier "+step);
  }
  const [core,bonus]=modeCollection("build");
  assert.ok(bonus.some(p=>p.id==="diamond-kite"&&p.practiceType==="reverse"));
  assert.ok(!graphMysteryPool("build",2,core,bonus).some(p=>p.id==="diamond-kite"));
});
test("Original picture IDs, completed saves and mathematical libraries remain unchanged",()=>{
  for(const [id,lookup] of [
    ["signal-flag",graphPicture],["little-house",graphPicture],
    ["origami-fox",graphPicture],["moonlit-castle",graphPicture],
    ["diamond-kite",graphPicture],["parabola-butterfly",curvePicture],
    ["cosmic-jellyfish",curvePicture],["little-umbrella",plotPicture],
    ["rocket-launch",plotPicture]
  ])assert.ok(lookup(id),id+" is a previous student picture");
  assert.equal(validateGraphPictureLibrary(),true);
  assert.equal(validateCurveGallery(),true);
  assert.equal(validatePlotGallery(),true);
});
test("Advanced linear artwork comprises genuine convex polygons with active complex edges",()=>{
  let slope=0,standard=0,strict=0;
  for(const p of ADVANCED_LINEAR_PICTURES){
    assert.ok(p.practice&&p.advancedVariety);
    const target=p.step===3?4:p.step===4?(p.mode==="fill"?6:5):
      (p.mode==="fill"?9:8);
    assert.equal(p.pieces.length,target);
    for(const part of p.pieces){
      const poly=intersectRegion(part.rules);
      assert.ok(polygonArea(poly)>.15,p.id+" "+part.id);
      assert.ok(Math.abs(polygonArea(poly)-polygonArea(part.vertices))<1e-6,
        "Shading must match the declared polygon vertices");
      const at={
        x:part.vertices.reduce((n,v)=>n+v.x,0)/part.vertices.length,
        y:part.vertices.reduce((n,v)=>n+v.y,0)/part.vertices.length
      };
      assert.equal(graphCellAt(part,at.x,at.y)?.correct,true,
        "Every hard piece should admit a correct, touch-safe selection");
      for(const r of part.rules){
        if(r.a!==0&&r.b!==0)slope++;
        if(r.form==="standard")standard++;
        if(!r.inclusive)strict++;
      }
    }
  }
  assert.ok(slope>=100);
  assert.ok(standard>=45,"Higher tiers should meaningfully exercise standard form");
  assert.ok(strict>=22,"Higher tiers must practise dashed boundaries");
});
test("Every advanced curved region has touch-selectable non-linear solution area",()=>{
  const kinds={circle:0,absolute:0,function:0,vertical:0},perTier={};
  for(const p of ADVANCED_CURVE_PICTURES){
    assert.equal(validatePicture(p),true);
    assert.ok(p.pieces.length>3);
    for(const part of p.pieces){
      assert.ok(regionPaths(part.rules).length>0,p.id+" "+part.id);
      let found=false;
      for(let x=-4.5;x<=4.5&&!found;x+=.25)
        for(let y=-4.5;y<=4.5;y+=.25){
          if(curvedCellAt(part.rules,x,y)?.correct){found=true;break;}
        }
      assert.equal(found,true,"Small invisible non-linear patch "+part.id);
      for(const r of part.rules){
        kinds[r.kind]=(kinds[r.kind]||0)+1;
        perTier[p.step]??={circle:0,absolute:0};
        if(r.kind==="absolute")perTier[p.step].absolute++;
        if(r.kind==="circle")perTier[p.step].circle++;
      }
    }
  }
  assert.ok(kinds.circle>=20&&kinds.absolute>=8&&kinds.function>=30);
  assert.ok(perTier[4].absolute>=4&&perTier[5].absolute>=4);
});
test("All new plotted graphs pass the exact real graph-construction and boundary-style marker",()=>{
  const kinds={line:0,parabola:0,circle:0,absolute:0};
  let multiTarget=0;
  for(const p of ADVANCED_PLOT_PICTURES){
    assert.equal(validatePlotPicture(p),true);
    for(const part of p.pieces){
      assert.ok(plotSteps(part).length>=1);
      if(plotSteps(part).length>1)multiTarget++;
      for(const step of plotSteps(part)){
        const rule=part.rules.find(r=>r.id===step.ruleId);
        assert.ok(rule);
        kinds[step.kind]++;
        for(const q of step.samplePoints)
          assert.deepEqual(snapPoint(q.x,q.y),q,rule.id+" is not on the snapped graph grid");
        assert.equal(checkConstruction({kind:step.kind,rule},step.samplePoints).correct,
          true,rule.id);
        assert.equal(checkBoundaryStyle(rule,rule.inclusive?"solid":"dashed").correct,true);
      }
    }
  }
  assert.ok(kinds.line>=8&&kinds.parabola>=20&&kinds.circle>=15&&kinds.absolute>=6,
    "Advanced graph construction should mix genuinely different graph types");
  assert.ok(multiTarget>=4,
    "Upper-tier students should sometimes construct more than one boundary per piece");
});
test("48 new artworks have unique identities, meaningful finishing details and recognisable silhouettes",()=>{
  const ids=new Set(),names=new Set();
  for(const p of ALL){
    assert.ok(!ids.has(p.id));ids.add(p.id);
    assert.ok(!names.has(p.name),"Duplicate picture name "+p.name);names.add(p.name);
    assert.ok(p.name!==p.clue&&p.focus.length>40&&p.description.length>55);
    assert.ok(p.details.length>=12);
    assert.equal(new Set(p.details.map(d=>d.id)).size,p.details.length);
    for(const stage of p.mode==="fill"||p.mode==="build"?[0,1,2]:[1,2,3])
      assert.ok(p.details.some(d=>d.stage===stage),p.id+" missing reveal stage "+stage);
  }
  for(const mode of MODES)for(const step of [3,4,5]){
    const pics=ALL.filter(p=>p.mode===mode&&p.step===step);
    assert.equal(pics.length,4);
    assert.equal(new Set(pics.map(imageSignature)).size,4,
      mode+" stage "+step+" repeats an identical mathematical artwork");
  }
});


test("Displayed standard-form, slope-form and fractional inequalities are mathematically equivalent to each new region edge",()=>{
  const fractions={"½":.5,"⅓":1/3,"⅔":2/3,"¼":.25,"¾":.75,
    "⅕":.2,"⅖":.4,"⅗":.6,"⅘":.8};
  const value=raw=>{
    let v=raw.trim().replaceAll("−","-"),sign=1;
    if(v.startsWith("-")){sign=-1;v=v.slice(1);}
    else if(v.startsWith("+"))v=v.slice(1);
    if(v===""||v==="+")return sign;
    if(Object.hasOwn(fractions,v))return sign*fractions[v];
    if(v.includes("/")){
      const [n,d]=v.split("/").map(Number);
      return sign*n/d;
    }
    return sign*Number(v);
  };
  const displayed=rule=>{
    const t=rule.text.replaceAll("−","-").replaceAll("≤","<=").replaceAll("≥",">=");
    const standard=/^(-?\d*)x\s+([+-])\s+(\d*)y\s+(<=|>=|<|>)\s+(.+)$/.exec(t);
    const slope=/^y\s+(<=|>=|<|>)\s+(.+?)x(?:\s+([+-])\s+(.+))?$/.exec(t);
    const axis=/^([xy])\s+(<=|>=|<|>)\s+(.+)$/.exec(t);
    if(standard){
      const A=value(standard[1]),C=value(standard[3])*(standard[2]==="-"?-1:1);
      const rhs=value(standard[5]);
      return (x,y)=>[A*x+C*y,standard[4],rhs];
    }
    if(slope){
      const m=value(slope[2]),k=slope[3]?value(slope[4])*
        (slope[3]==="-"?-1:1):0;
      return (x,y)=>[y,slope[1],m*x+k];
    }
    if(axis)return (x,y)=>[axis[1]==="x"?x:y,axis[2],value(axis[3])];
    throw Error("Unparseable student-facing advanced inequality: "+rule.text);
  };
  let checked=0;
  for(const p of ADVANCED_LINEAR_PICTURES)for(const part of p.pieces)
    for(const rule of part.rules){
      const truth=displayed(rule);
      for(const [x,y]of [[-3.83,-3.11],[-2.71,1.23],[.35,2.81],
        [3.27,-1.63],[1.46,.79],[-.69,-.47]]){
        const [lhs,operator,rhs]=truth(x,y);
        assert.ok([lhs,rhs].every(Number.isFinite),rule.text);
        if(Math.abs(lhs-rhs)<1e-8)continue;
        const said=operator==="<"||operator==="<="?lhs<rhs:lhs>rhs;
        const real=pointSatisfiesAll([rule],x,y);
        assert.equal(said,real,rule.id+": "+rule.text+
          " must accurately tell the student which side to shade");
        checked++;
      }
    }
  assert.ok(checked>2500);
});
