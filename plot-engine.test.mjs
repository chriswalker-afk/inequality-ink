import test from "node:test";
import assert from "node:assert/strict";
import {
  snapPoint,samePoint,constructBoundary,checkConstruction,
  checkBoundaryStyle,previewPaths,validSavedPoints
} from "./regions/plot-engine.mjs";
import {PLOT_PICTURE,plotRule,validatePlotPicture} from "./regions/plot-pictures.mjs";
import {satisfiesAll,curvedCellAt,regionPaths} from "./regions/curved-engine.mjs";

const [canopy,puddle]=PLOT_PICTURE.pieces;
const rule=part=>plotRule(part);
const check=(part,points)=>checkConstruction({
  kind:part.plots[0].kind,rule:rule(part)
},points);

test("two-piece umbrella is real mathematical art and each plot target is valid",()=>{
  assert.equal(validatePlotPicture(),true);
  assert.deepEqual(PLOT_PICTURE.pieces.map(p=>p.id),["canopy","puddle"]);
  assert.ok(regionPaths(canopy.rules).length);
  assert.ok(regionPaths(puddle.rules).length);
  assert.equal(satisfiesAll(canopy.rules,0,2),true);
  assert.equal(satisfiesAll(canopy.rules,0,.5),false);
  assert.equal(satisfiesAll(puddle.rules,0,-3.5),true);
  assert.equal(satisfiesAll(puddle.rules,0,-3),false);
  assert.equal(satisfiesAll(puddle.rules,0,-4.25),false);
  assert.ok(PLOT_PICTURE.details.some(d=>d.id==="umbrella-handle"));
  assert.equal(new Set(PLOT_PICTURE.details.map(d=>d.id)).size,
    PLOT_PICTURE.details.length);
});
test("snapping to half coordinates is accurate, clamped and keyboard friendly",()=>{
  assert.deepEqual(snapPoint(1.23,-2.26),{x:1,y:-2.5});
  assert.deepEqual(snapPoint(6,-6),{x:5,y:-5});
  assert.deepEqual(snapPoint(.24,-.25),{x:0,y:-0});
  assert.equal(snapPoint(NaN,2),null);
  assert.ok(samePoint({x:1,y:2},{x:1,y:2}));
  assert.ok(!samePoint({x:1,y:2},{x:1.5,y:2}));
  assert.equal(validSavedPoints([{x:0,y:4},{x:2,y:2}]),true);
  assert.equal(validSavedPoints([{x:0,y:4.25}]),false);
  assert.equal(validSavedPoints([{x:0,y:4},{x:0,y:4},{x:2,y:2}]),false);
});
test("any correct parabola points are accepted, not just the authored example",()=>{
  assert.equal(check(canopy,[{x:0,y:4},{x:2,y:2}]).correct,true);
  assert.equal(check(canopy,[{x:0,y:4},{x:-2,y:2}]).correct,true);
  assert.equal(check(canopy,[{x:0,y:4},{x:1,y:3.5}]).correct,true);
  const construction=constructBoundary("parabola",[{x:0,y:4},{x:2,y:2}]);
  assert.equal(construction.a,-.5);
  assert.deepEqual(construction.rule.coeffs,[4,0,-.5]);
  assert.ok(previewPaths(construction)[0].length>100);
});
test("parabola errors explain turning point, width, direction and invalid data",()=>{
  assert.equal(check(canopy,[]).code,"incomplete");
  assert.equal(check(canopy,[{x:0,y:3},{x:2,y:1}]).code,"vertex");
  assert.equal(check(canopy,[{x:0,y:4},{x:2,y:5}]).code,"direction");
  assert.equal(check(canopy,[{x:0,y:4},{x:2,y:3}]).code,"width");
  assert.equal(check(canopy,[{x:0,y:4},{x:0,y:2}]).code,"vertex-axis");
  assert.equal(check(canopy,[{x:0,y:4},{x:1,y:4}]).code,"flat");
  assert.equal(check(canopy,[{x:0,y:4},{x:0,y:4}]).code,"duplicate");
});
test("any two correct line points work, including horizontal and vertical cases",()=>{
  assert.equal(check(puddle,[{x:-2,y:-3},{x:2,y:-3}]).correct,true);
  assert.equal(check(puddle,[{x:0,y:-3},{x:4,y:-3}]).correct,true);
  assert.equal(check(puddle,[{x:-4.5,y:-3},{x:.5,y:-3}]).correct,true);
  assert.equal(check(puddle,[{x:-2,y:-3},{x:2,y:-2}]).code,"slope");
  assert.equal(check(puddle,[{x:-2,y:-2},{x:2,y:-2}]).code,"intercept");
  assert.equal(check(puddle,[{x:2,y:-2},{x:2,y:2}]).code,"slope");
  const vertical=constructBoundary("line",[{x:2,y:-2},{x:2,y:3}]);
  assert.equal(vertical.vertical,true);
  assert.equal(vertical.x,2);
  assert.equal(previewPaths(vertical).length,1);
  const sloped=constructBoundary("line",[{x:-1,y:0},{x:1,y:2}]);
  assert.equal(sloped.m,1);assert.equal(sloped.b,1);
});
test("inclusive and strict boundaries are checked independently of the sketch",()=>{
  assert.equal(checkBoundaryStyle(rule(canopy),"solid").correct,true);
  assert.equal(checkBoundaryStyle(rule(canopy),"dashed").correct,false);
  assert.equal(checkBoundaryStyle(rule(puddle),"dashed").correct,true);
  assert.equal(checkBoundaryStyle(rule(puddle),"solid").correct,false);
  assert.match(checkBoundaryStyle(rule(puddle),"solid").message,/strict/);
  assert.match(checkBoundaryStyle(rule(canopy),"dashed").message,/includes equality/);
  assert.equal(checkBoundaryStyle(rule(puddle),null).correct,false);
});
test("the exact curved engine marks both correct and incorrect shaded cells",()=>{
  const correctCanopy=curvedCellAt(canopy.rules,0,2);
  const incorrectCanopy=curvedCellAt(canopy.rules,0,0);
  assert.equal(correctCanopy.correct,true);
  assert.equal(incorrectCanopy.correct,false);
  assert.ok(correctCanopy.paths[0].length>100);
  assert.ok(incorrectCanopy.paths[0].length>100);
  const correctPuddle=curvedCellAt(puddle.rules,0,-3.5);
  const incorrectPuddle=curvedCellAt(puddle.rules,0,-2.5);
  assert.equal(correctPuddle.correct,true);
  assert.equal(incorrectPuddle.correct,false);
  assert.equal(curvedCellAt(puddle.rules,0,-3),null);
});

test("five pictures have mathematically valid 2–3–4–5–7 progression",async()=>{
  const {PLOT_PICTURES,PLOT_STAGES,plotSteps,validatePlotGallery}=await import("./regions/plot-pictures.mjs");
  assert.equal(validatePlotGallery(),true);
  assert.deepEqual(PLOT_PICTURES.map(p=>p.pieces.length),[2,3,4,5,7]);
  assert.deepEqual(PLOT_STAGES.map(s=>s.name),
    ["Starter","Step Up","Building","Challenge","Big Finish"]);
  assert.equal(new Set(PLOT_PICTURES.map(p=>p.id)).size,5);
  assert.ok(PLOT_PICTURES[2].pieces.some(part=>plotSteps(part).length>1));
  assert.ok(PLOT_PICTURES[3].pieces.some(part=>plotSteps(part).length>1));
  assert.ok(PLOT_PICTURES[4].pieces.some(part=>plotSteps(part).length>1));
});
test("circles accept any circumference point at the correct radius",async()=>{
  const {PLOT_PICTURES,plotSteps,plotRule}=await import("./regions/plot-pictures.mjs");
  const ice=PLOT_PICTURES[1].pieces[1],rule=plotRule(ice),step=plotSteps(ice)[0];
  assert.equal(step.kind,"circle");
  const testPoints=[[{x:-.5,y:1.5},{x:-1.5,y:1.5}],
    [{x:-.5,y:1.5},{x:-.5,y:2.5}]];
  for(const points of testPoints)
    assert.equal(checkConstruction({kind:"circle",rule},points).correct,true);
  assert.equal(checkConstruction({kind:"circle",rule},[
    {x:0,y:1.5},{x:-1,y:1.5}]).code,"centre");
  assert.equal(checkConstruction({kind:"circle",rule},[
    {x:-.5,y:1.5},{x:1.5,y:1.5}]).code,"radius");
  assert.ok(previewPaths(constructBoundary("circle",testPoints[0]))[0].length>300);
});
test("V-shaped graphs give specific vertex, reflection and gradient feedback",async()=>{
  const {PLOT_PICTURES,plotRule}=await import("./regions/plot-pictures.mjs");
  const lantern=PLOT_PICTURES[3].pieces[0];
  const rule=plotRule(lantern,1);
  const okay=[{x:0,y:3},{x:-1,y:2}];
  assert.equal(checkConstruction({kind:"absolute",rule},okay).correct,true);
  assert.equal(checkConstruction({kind:"absolute",rule},
    [{x:0,y:2},{x:1,y:1}]).code,"vertex");
  assert.equal(checkConstruction({kind:"absolute",rule},
    [{x:0,y:3},{x:1,y:4}]).code,"direction");
  assert.equal(checkConstruction({kind:"absolute",rule},
    [{x:0,y:3},{x:1,y:1.5}]).code,"gradient");
  assert.equal(constructBoundary("absolute",[{x:0,y:3},{x:0,y:2}]).code,"vertex-axis");
});
test("all 21 picture regions support exact touch selection and strict styles",async()=>{
  const {PLOT_PICTURES,plotSteps,plotRule}=await import("./regions/plot-pictures.mjs");
  let count=0,targets=0,strict=0;
  for(const picture of PLOT_PICTURES)for(const part of picture.pieces){
    let spot=null;
    for(let x=-4.5;x<=4.5&&!spot;x+=.25)
      for(let y=-4.5;y<=4.5;y+=.25){
        if(!satisfiesAll(part.rules,x,y))continue;
        if(curvedCellAt(part.rules,x,y,.06)?.correct){spot={x,y};break;}
      }
    assert.ok(spot,picture.id+" / "+part.id);
    const steps=plotSteps(part);
    for(let i=0;i<steps.length;i++){
      const rule=plotRule(part,i),t=steps[i];targets++;
      assert.equal(checkConstruction({kind:t.kind,rule},t.samplePoints).correct,true);
      assert.equal(checkBoundaryStyle(rule,rule.inclusive?"solid":"dashed").correct,true);
      if(!rule.inclusive)strict++;
    }
    count++;
  }
  assert.equal(count,21);
  assert.ok(targets>=25);
  assert.ok(strict>=3);
});
test("reused rainbow boundary really is the curve previously plotted",async()=>{
  const {PLOT_PICTURES,previousBoundaries,ruleSignature}=await import("./regions/plot-pictures.mjs");
  const p=PLOT_PICTURES[2],built=previousBoundaries(p,1);
  assert.ok(built.has(ruleSignature(p.pieces[1].rules[0])));
  assert.ok(!built.has(ruleSignature(p.pieces[1].rules[1])));
});
