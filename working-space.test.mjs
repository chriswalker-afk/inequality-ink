import test from "node:test";
import assert from "node:assert/strict";
import {
  renderMathWorking,insertMathWorking,workingPoint,workingPath,nearestWorkingStroke
} from "./working-space.mjs";

test("Math working typesets inequalities with genuine MathML",()=>{
  const markup=renderMathWorking("-5 < 2x + 1 <= 5\n-3 < x <= 2");
  assert.equal((markup.match(/<math /g)||[]).length,2);
  assert.match(markup,/<mo>−<\/mo><mn>5<\/mn><mo>&lt;<\/mo>/);
  assert.match(markup,/<mn>2<\/mn><mi>x<\/mi>/);
  assert.match(markup,/<mo>≤<\/mo>/);
  assert.match(renderMathWorking("x >= -2"),/<mo>≥<\/mo><mo>−<\/mo>/);
});
test("Math working renders stacked fractions, powers and roots",()=>{
  const markup=renderMathWorking("(x+1)/2 = x^2\nsqrt(4) = 2");
  assert.match(markup,/<mfrac>/);
  assert.match(markup,/<msup>/);
  assert.match(markup,/<msqrt>/);
  assert.ok(!markup.includes('<mo>/</mo>'),"Division slash is a fraction");
});
test("Math preview escapes untrusted input and supports blank drafts",()=>{
  const markup=renderMathWorking('<img src=x onerror="alert(1)"> &');
  assert.ok(!markup.includes("<img"),"Text must never become a real HTML element");
  assert.ok(!markup.includes('<script'));
  assert.match(markup,/&lt;img/);
  assert.match(markup,/&amp;/);
  assert.match(renderMathWorking(""),/Your maths appears here/);
});
test("Toolbar keys insert at the cursor without deleting other working",()=>{
  assert.deepEqual(insertMathWorking("x < 3",2,3,"≤"),
    {value:"x ≤ 3",start:3,end:3});
  assert.deepEqual(insertMathWorking("x",1,1,"square"),
    {value:"x^2",start:3,end:3});
  assert.deepEqual(insertMathWorking("",0,0,"fraction"),
    {value:"()/()",start:1,end:1});
  assert.deepEqual(insertMathWorking("x+1",0,3,"fraction"),
    {value:"(x+1)/()",start:7,end:7});
  assert.deepEqual(insertMathWorking("abc",3,3,"backspace"),
    {value:"ab",start:2,end:2});
  assert.deepEqual(insertMathWorking("abc",1,3,"newline"),
    {value:"a\n",start:2,end:2});
});
test("Draw pad maps pointer positions, captures strokes and erases nearest ink",()=>{
  const rect={left:10,top:20,width:200,height:100};
  assert.deepEqual(workingPoint({clientX:110,clientY:70},rect),{x:500,y:200});
  assert.deepEqual(workingPoint({clientX:0,clientY:500},rect),{x:0,y:400});
  const line=[{x:100,y:100},{x:300,y:100}];
  const strokes=[{points:line},{points:[{x:900,y:300}]}];
  assert.equal(workingPath(line),"M100 100 L300 100");
  assert.equal(nearestWorkingStroke(strokes,{x:200,y:111}),0);
  assert.equal(nearestWorkingStroke(strokes,{x:902,y:299}),1);
  assert.equal(nearestWorkingStroke(strokes,{x:500,y:300}),-1);
});
