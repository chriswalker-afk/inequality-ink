import test from "node:test";import assert from "node:assert/strict";
import {PICTURE,functionValue,satisfies,satisfiesAll,rangeAtX,regionPaths,boundaryPoints,validatePicture} from "./regions/curved-engine.mjs";
test("two parabola wings are genuine intersections",()=>{
 assert.equal(validatePicture(),true);
 const [left,right]=PICTURE.pieces;
 assert.equal(satisfiesAll(left.rules,-1,0),true);
 assert.equal(satisfiesAll(left.rules,1,0),false);
 assert.equal(satisfiesAll(right.rules,1,0),true);
 assert.equal(satisfiesAll(right.rules,-1,0),false);
 assert.equal(satisfiesAll(left.rules,-1,4),false);
 assert.equal(satisfiesAll(right.rules,1,-4),false);
 assert.equal(satisfies(right.rules[2],0,0),false);
 assert.equal(satisfies(left.rules[2],0,0),true);
});
test("boundaries and rendered regions match quadratic intersection",()=>{
 const [left,right]=PICTURE.pieces;
 assert.equal(functionValue(left.rules[0],2),0);
 assert.equal(functionValue(left.rules[1],2),0);
 assert.deepEqual(rangeAtX(left.rules,-1),{lo:-3,hi:3});
 assert.equal(rangeAtX(left.rules,1),null);
 assert.equal(rangeAtX(right.rules,-1),null);
 assert.ok(regionPaths(left.rules)[0].length>100);
 assert.ok(regionPaths(right.rules)[0].length>100);
 assert.ok(boundaryPoints(left.rules[0])[0].length>100);
 assert.equal(boundaryPoints(right.rules[2]).length,2);
});
test("strict side is excluded without removing interior area",()=>{
 assert.ok(satisfiesAll(PICTURE.pieces[1].rules,0.001,0));
 assert.ok(!satisfiesAll(PICTURE.pieces[1].rules,0,0));
});

test("a wrong tap returns its full curved sign cell, rather than only a point",async()=>{
  const {curvedCellAt}=await import("./regions/curved-engine.mjs");
  const left=PICTURE.pieces[0];
  const correct=curvedCellAt(left.rules,-1,0);
  assert.equal(correct.correct,true);
  assert.ok(correct.paths[0].length>100);
  const wrong=curvedCellAt(left.rules,1,0);
  assert.equal(wrong.correct,false);
  assert.ok(wrong.paths[0].length>100);
  const above=curvedCellAt(left.rules,-1,4.5);
  assert.equal(above.correct,false);
  assert.ok(above.paths.length>0);
  assert.equal(curvedCellAt(left.rules,0,0),null);
  assert.equal(curvedCellAt(left.rules,-1,-3),null);
  assert.equal(curvedCellAt(left.rules,Infinity,0),null);
});
test("strict boundaries are visually closed when filling, but excluded in mathematics",()=>{
  assert.ok(rangeAtX(PICTURE.pieces[1].rules,0));
  assert.equal(satisfiesAll(PICTURE.pieces[1].rules,0,0),false);
});
