import test from "node:test";
import assert from "node:assert/strict";
import {ROWS,SEQUENCE,TUTORIAL,WIDTH,HEIGHT,COLUMN_MIN,COLUMN_MAX,AXIS_MIN,AXIS_MAX,columnsFor,isInInterval,identicalSolution,makeQuestion,pixelAt,colourAt,validatePuzzle,formatLinear} from "./model.mjs";
test("sprite is connected, 14 contiguous rows",()=>assert.deepEqual(validatePuzzle().connected,true));
test("sprite size, rows and columns are fixed",()=>{
 assert.equal(WIDTH,16);assert.equal(HEIGHT,16);assert.equal(ROWS.length,14);
 assert.equal(COLUMN_MIN,-8);assert.equal(COLUMN_MAX,7);
 assert.equal(SEQUENCE[0].y,14);assert.equal(SEQUENCE.at(-1).y,1);
 for(const row of ROWS){
  const xs=columnsFor(row);
  assert.ok(xs.length>0);
  for(let i=1;i<xs.length;i++)assert.equal(xs[i],xs[i-1]+1);
  for(const x of xs)assert.equal(pixelAt(x-COLUMN_MIN,row.y),true);
 }
});
test("open and closed endpoints differ mathematically even if they paint same pixels",()=>{
 const a={direction:"between",lower:-4,upper:2,lowerIncluded:false,upperIncluded:true};
 const b={direction:"between",lower:-3,upper:2,lowerIncluded:true,upperIncluded:true};
 assert.deepEqual(columnsFor(a),columnsFor(b));
 assert.equal(identicalSolution(a,b),false);
});
test("one-sided tutorial uses the true half-line",()=>{
 assert.deepEqual(columnsFor(TUTORIAL[0].answer),[-2,-1,0,1,2,3,4,5,6,7]);
 assert.equal(isInInterval(-2,TUTORIAL[0].answer),true);
 assert.equal(isInInterval(-2.5,TUTORIAL[0].answer),false);
});
test("all published and replay row variants produce the same pixels",()=>{
 for(let i=0;i<14;i++){
  const row=SEQUENCE[i], target=columnsFor(row);
  for(let replay=0;replay<30;replay++){
   const q=makeQuestion(i,replay);
   assert.deepEqual(columnsFor(q.answer),target,`Question ${i}, replay ${replay}`);
   assert.ok(q.mode==="read"||q.mode==="draw"||q.mode==="solve");
   if(q.mode==="read"){
    assert.equal(q.options.length,4);
    assert.equal(q.options.filter(o=>identicalSolution(o.value,q.answer)).length,1);
   } else assert.ok(q.equation.length>0);
  }
 }
});
test("every colored pixel is a real silhouette pixel",()=>{
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){
  if(colourAt(x,y)!==null)assert.equal(pixelAt(x,y),true);
  if(pixelAt(x,y))assert.equal(typeof colourAt(x,y),"string");
 }
});
test("reversing a negative multiplier produces the correct transformed inequality",()=>{
 const i={direction:"between",lower:-3,upper:2,lowerIncluded:false,upperIncluded:false};
 assert.equal(formatLinear(i,-2,1),"−3 < 1 − 2x < 7");
});
test("endpoints must remain inside the number-line range",()=>{
 assert.ok(AXIS_MIN<=-8);assert.ok(AXIS_MAX>=7);
});
