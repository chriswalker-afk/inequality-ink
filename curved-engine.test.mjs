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
