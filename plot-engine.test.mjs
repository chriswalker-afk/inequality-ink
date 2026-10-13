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
  kind:part.plot.kind,rule:rule(part)
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
