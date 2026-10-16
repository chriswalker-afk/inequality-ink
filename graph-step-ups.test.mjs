import test from "node:test";
import assert from "node:assert/strict";
import {
  GRAPH_ART_PICTURES,GRAPH_PRACTICE_PICTURES,graphModeGallery,
  graphPracticeGallery,graphPicture,graphCellAt,validateGraphPictureLibrary
} from "./regions/graph-art-pictures.mjs";
import {
  CURVE_PICTURES,CURVE_PRACTICE_PICTURES,curvePicture,validateCurveGallery
} from "./regions/curve-pictures.mjs";
import {
  PLOT_PICTURES,PLOT_PRACTICE_PICTURES,plotPicture,plotSteps,
  plotRule,validatePlotPicture,validatePlotGallery
} from "./regions/plot-pictures.mjs";
import {LINEAR_STEP_UPS} from "./regions/linear-step-ups.mjs";
import {CURVE_STEP_UPS} from "./regions/curve-step-ups.mjs";
import {PLOT_STEP_UPS} from "./regions/plot-step-ups.mjs";
import {intersectRegion,polygonArea,pointSatisfiesAll,evaluateRegionRule}
  from "./regions/regions-engine.mjs";
import {regionPaths,satisfiesAll,curvedCellAt}
  from "./regions/curved-engine.mjs";
import {checkConstruction,checkBoundaryStyle,snapPoint}
  from "./regions/plot-engine.mjs";
import {graphMysteryPool,graphPickMystery,graphMysteryStatus}
  from "./regions/graph-mysteries.mjs";

const modes=["fill","build","curve","plot"];
const allNew=[...LINEAR_STEP_UPS,...CURVE_STEP_UPS,...PLOT_STEP_UPS];
const allByMode=m=>m==="fill"||m==="build"?
  [graphModeGallery(m),graphPracticeGallery(m)]:
  m==="curve"?[CURVE_PICTURES,CURVE_PRACTICE_PICTURES]:
  [PLOT_PICTURES,PLOT_PRACTICE_PICTURES];
function pixelShape(p){
  const isLinear=p.mode==="fill"||p.mode==="build";
  let signature="";
  for(let y=4.8;y>=-4.8;y-=.4){
    for(let x=-4.8;x<=4.8;x+=.4){
      let pixel=".";
      for(let i=0;i<p.pieces.length;i++){
        if((isLinear?pointSatisfiesAll:satisfiesAll)(p.pieces[i].rules,x,y))
          pixel=String.fromCharCode(65+i);
      }
      signature+=pixel;
    }
    signature+="/";
  }
  return signature;
}

test("Step Up now offers five different standard mysteries per Graph Art mode",()=>{
  assert.equal(LINEAR_STEP_UPS.length,7);
  assert.equal(LINEAR_STEP_UPS.filter(p=>p.mode==="fill").length,3);
  assert.equal(LINEAR_STEP_UPS.filter(p=>p.mode==="build").length,4);
  assert.equal(CURVE_STEP_UPS.length,3);
  assert.equal(PLOT_STEP_UPS.length,3);
  assert.equal(allNew.length,13);
  const all=[
    ...GRAPH_ART_PICTURES,...GRAPH_PRACTICE_PICTURES,
    ...CURVE_PICTURES,...CURVE_PRACTICE_PICTURES,
    ...PLOT_PICTURES,...PLOT_PRACTICE_PICTURES
  ];
  assert.equal(all.length,53);
  assert.equal(new Set(all.map(p=>p.id)).size,53,"New IDs must preserve all older saves");
  assert.deepEqual(modes.map(m=>allByMode(m).flat().length),[13,14,13,13]);
  for(const m of modes){
    const [core,practice]=allByMode(m);
    const step=graphMysteryPool(m,2,core,practice);
    assert.equal(step.length,5,m+" must offer five automatic Step Up options");
    assert.ok(step.every(p=>p.mode===m&&p.step===2&&p.pieces.length===3));
    assert.equal(new Set(step.map(p=>p.id)).size,5);
    assert.equal(step.filter(p=>p.stepUpVariety).length,m==="build"?4:3);
    assert.equal(graphMysteryStatus(step,()=>({done:0})).remaining,5);
    const alreadyDone=new Set(step.slice(0,4).map(p=>p.id));
    const record=p=>({done:alreadyDone.has(p.id)?p.pieces.length:0});
    assert.equal(graphPickMystery(step,record,()=>.99).id,step[4].id,
      "Students see new Step Up paintings instead of solved pictures");
    assert.equal(graphPickMystery(step,p=>({done:p.pieces.length}),()=>.99),null);
  }
  const [,extraBuild]=allByMode("build");
  assert.ok(extraBuild.some(p=>p.id==="diamond-kite"&&p.practiceType==="reverse"));
  assert.ok(!graphMysteryPool("build",2,...allByMode("build")).some(p=>p.id==="diamond-kite"),
    "Reverse-reading is still an explicit gallery-only option");
});

test("Previous Graph Art pictures and mathematical rules are all still registered",()=>{
  for(const [id,lookup]of[
    ["little-house",graphPicture],["mountain-morning",graphPicture],
    ["camping-tent",graphPicture],["diamond-kite",graphPicture],
    ["parabola-butterfly",curvePicture],["balloon-parade",curvePicture],
    ["ice-cream-dream",plotPicture],["snow-globe",plotPicture]
  ])assert.ok(lookup(id),"Old student progress refers to "+id);
  assert.equal(validateGraphPictureLibrary(),true);
  assert.equal(validateCurveGallery(),true);
  assert.equal(validatePlotGallery(),true);
});

test("Every new linear artwork uses mathematically valid active sloping boundaries",()=>{
  let sloped=0,strict=0;
  for(const p of LINEAR_STEP_UPS){
    assert.equal(p.pieces.length,3);
    assert.equal(p.step,2);
    let pictureSlope=0;
    for(const part of p.pieces){
      assert.equal(part.vertices.length,part.rules.length,
        "Each convex polygon should have exactly its active edge rules");
      const region=intersectRegion(part.rules);
      assert.ok(polygonArea(region)>.15,p.id+" "+part.id);
      assert.ok(Math.abs(polygonArea(region)-polygonArea(part.vertices))<1e-6);
      const point={
        x:part.vertices.reduce((n,v)=>n+v.x,0)/part.vertices.length,
        y:part.vertices.reduce((n,v)=>n+v.y,0)/part.vertices.length
      };
      assert.ok(pointSatisfiesAll(part.rules,point.x,point.y));
      assert.equal(graphCellAt(part,point.x,point.y)?.correct,true,
        p.id+" "+part.id+" is selectable by an actual correct tap");
      for(const r of part.rules){
        if(r.a&&r.b){pictureSlope++;sloped++;}
        if(!r.inclusive)strict++;
        assert.equal(r.inclusive,!/[<>]/.test(r.text),
          "Visible < / > notation must match dashed style: "+r.id);
        assert.ok(Number.isFinite(evaluateRegionRule(r,point.x,point.y)));
      }
    }
    assert.ok(pictureSlope>=1,
      p.id+" should develop sloping-boundary skills beyond Quick Spark");
  }
  assert.ok(sloped>25,"Step Up must offer meaningful gradient practice");
  assert.ok(strict>=4,"Step Up Build & Shade needs mixed dashed/solid boundaries");
});

test("Every curved Step Up piece contains an actual circle or translated parabola",()=>{
  let circles=0,shifted=0;
  for(const p of CURVE_STEP_UPS){
    assert.equal(p.pieces.length,3);
    for(const part of p.pieces){
      const curves=part.rules.filter(r=>r.kind==="circle"||
        r.kind==="function"&&r.coeffs.length===3);
      assert.ok(curves.length>0,p.id+" "+part.id);
      circles+=curves.filter(r=>r.kind==="circle").length;
      shifted+=curves.filter(r=>r.kind==="function"&&
        Math.abs(r.coeffs[1])>1e-7).length;
      assert.ok(regionPaths(part.rules).length>0,p.id+" "+part.id);
      let chosen=null;
      for(let x=-4.25;x<=4.25&&!chosen;x+=.25)
        for(let y=-4.25;y<=4.25;y+=.25){
          if(!satisfiesAll(part.rules,x,y))continue;
          const hit=curvedCellAt(part.rules,x,y);
          if(hit?.correct){chosen={x,y};break;}
        }
      assert.ok(chosen,p.id+" "+part.id+" needs a tappable positive area");
    }
  }
  assert.ok(circles>=3,"Step Up needs circle centres and radii");
  assert.ok(shifted>=3,"Step Up needs translations of curved graphs");
});

test("Plot & Shade Step Up tasks are constructible with only snapped points",()=>{
  let line=0,circle=0,parabola=0,dashed=0;
  for(const p of PLOT_STEP_UPS){
    assert.equal(validatePlotPicture(p),true);
    for(const part of p.pieces){
      assert.equal(plotSteps(part).length,1,p.id+" must have one target per piece");
      const step=plotSteps(part)[0],target=plotRule(part);
      assert.ok(target&&target.id===step.ruleId);
      assert.ok(["line","circle","parabola"].includes(step.kind));
      if(step.kind==="line")line++;
      if(step.kind==="circle")circle++;
      if(step.kind==="parabola")parabola++;
      for(const at of step.samplePoints){
        assert.deepEqual(snapPoint(at.x,at.y),at,
          "Suggested points must sit exactly on the graph editor's half-unit grid");
      }
      assert.equal(checkConstruction({kind:step.kind,rule:target},
        step.samplePoints).correct,true,step.ruleId);
      assert.equal(checkBoundaryStyle(target,target.inclusive?"solid":"dashed").correct,
        true);
      if(!target.inclusive)dashed++;
    }
  }
  assert.ok(line>=4&&circle>=2&&parabola>=2,
    "Students must practise different graph constructions at Step Up");
  assert.ok(dashed>=1,"Some Step Up line constructions should be dashed");
});

test("Completed Step Up artworks have distinct silhouettes and meaningful staged details",()=>{
  for(const mode of modes){
    const designs=allNew.filter(p=>p.mode===mode);
    const fingerprints=designs.map(pixelShape);
    assert.equal(new Set(fingerprints).size,designs.length,
      "Repeating the same shaded silhouette is not additional variety: "+mode);
  }
  for(const p of allNew){
    assert.ok(p.practice&&p.stepUpVariety,p.id);
    assert.ok(p.name!==p.clue,p.id+" must remain a mystery");
    assert.ok(p.description.length>=45&&p.focus.length>=40,p.id);
    assert.equal(p.pieces.length,3);
    assert.ok(p.details.length>=12,p.id+" needs a satisfying big reveal");
    assert.equal(new Set(p.details.map(d=>d.id)).size,p.details.length);
    const levels=p.mode==="fill"||p.mode==="build"?[0,1,2]:[1,2,3];
    for(const level of levels)
      assert.ok(p.details.filter(d=>d.stage===level).length>=2,
        p.id+" missing finishing details at stage "+level);
    for(const d of p.details){
      for(const n of ["x","y","x1","y1","x2","y2","r","rx","ry","width"])
        if(n in d)assert.ok(Number.isFinite(d[n]),p.id+" "+d.id+" "+n);
    }
  }
});


test("Every new displayed linear inequality has exactly the mathematical meaning it claims",()=>{
  const fractions={"½":.5,"⅓":1/3,"⅔":2/3,"¼":.25,"¾":.75,
    "⅕":.2,"⅖":.4,"⅗":.6,"⅘":.8};
  function number(token){
    let t=token.replaceAll("−","-").trim();
    if(t===""||t==="+")return 1;
    if(t==="-")return -1;
    const sign=t.startsWith("-")?-1:1;
    if(t.startsWith("-")||t.startsWith("+"))t=t.slice(1);
    if(Object.hasOwn(fractions,t))return sign*fractions[t];
    if(t.includes("/")){
      const [num,den]=t.split("/").map(Number);
      return sign*num/den;
    }
    return sign*Number(t);
  }
  for(const p of LINEAR_STEP_UPS)for(const piece of p.pieces)
    for(const rule of piece.rules){
      const match=/^([xy])\s*([<>≤≥])\s*(.+)$/.exec(rule.text);
      assert.ok(match,"Unreadable mathematical inequality: "+rule.text);
      const [,varName,sign,rhs]=match;
      assert.equal(rule.inclusive,sign==="≤"||sign==="≥");
      const compact=rhs.replaceAll(" ","");
      function threshold(x){
        const pos=compact.indexOf("x");
        if(pos<0)return number(compact);
        const slope=number(compact.slice(0,pos));
        const tail=compact.slice(pos+1);
        const intercept=tail?number(tail):0;
        return slope*x+intercept;
      }
      for(const [x,y]of[[0.15,.33],[-1.65,2.3],[3.45,-2.6],
          [-3.85,-3.35],[.72,3.61],[2.17,.86]]){
        const value=varName==="x"?x:y,expected=threshold(x);
        assert.ok(Number.isFinite(expected),rule.text);
        const dist=Math.abs(evaluateRegionRule(rule,x,y))/
          Math.hypot(rule.a,rule.b);
        if(dist<1e-6)continue;
        const displayed=(sign==="≤"||sign==="<")?
          value<expected:value>expected;
        assert.equal(pointSatisfiesAll([rule],x,y),displayed,
          "Displayed "+rule.text+" contradicts its stored coefficients at ("+
            x+", "+y+")");
      }
    }
});
