import test from "node:test";
import assert from "node:assert/strict";
import {pictureById,pictureWidth,picturePixelAt,pictureColourAt,
 pictureBackgroundAt,makePictureQuestion,picturePaintedValues,
 validatePictureLibrary} from "./picture-engine.mjs";
import {makePaintQuestion,paintTarget,checkPaintRow,validatePaintPicture} from "./paint-engine.mjs";
import {isInInterval} from "./model.mjs";

const ids=["paint-rocket","paint-flower","paint-robot"];
test("Three colour puzzles validate and work with the existing picture registry",()=>{
 assert.equal(validatePictureLibrary().length,84);
 for(const id of ids){
  const p=pictureById(id);
  assert.deepEqual(p.levels,["paint"]);
  assert.equal(pictureWidth(p),10);
  assert.equal(p.paint.grid.length,14);
  assert.equal(validatePaintPicture(p).rows,14);
  const colors=new Set();
  for(let y=1;y<=14;y++)for(let x=0;x<10;x++){
   const key=p.paint.grid[y-1][x];colors.add(key);
   const painted=picturePixelAt(p,x,y);
   assert.equal(painted,key!==p.paint.backgroundId);
   if(painted)assert.equal(pictureColourAt(p,x,y),p.paint.colours[key].hex);
   else assert.equal(pictureBackgroundAt(p,x,y),p.paint.colours[key].hex);
  }
  assert.ok(colors.size>=4,id+" should have multiple meaningful paint colours");
 }
});
test("Every row is covered by two to four real inequalities without overlap",()=>{
 for(const id of ids){
  const p=pictureById(id);
  for(let replay=0;replay<10;replay++)for(let index=0;index<14;index++){
   const q=makePaintQuestion(p,index,replay);
   assert.equal(q.row,14-index);
   assert.ok(q.rules.length>=2&&q.rules.length<=4);
   const target=paintTarget(p,index);
   assert.deepEqual(q.target,target);
   const mapped=Array(10).fill(null);
   for(const rule of q.rules){
    assert.match(rule.inequality,/x|≤|≥|<|>/);
    assert.ok(rule.inequality.includes("x"));
    assert.equal(rule.colour,p.paint.colours[rule.key].hex);
    for(let x=0;x<10;x++){
     const integer=p.window.min+x;
     if(isInInterval(integer,rule.solution)){
      assert.equal(mapped[x],null,"Overlapping rules for "+id+" row "+index);
      mapped[x]=rule.key;
     }
    }
   }
   assert.deepEqual(mapped,target,id+" / row "+index+" / replay "+replay);
   const generic=makePictureQuestion(p,index,replay,"paint");
   assert.equal(generic.mode,"paint");
   assert.deepEqual(generic.target,q.target);
   assert.equal(picturePaintedValues(p,generic).length,10);
  }
 }
});
test("Colour row checking requires all squares and never silently corrects an attempt",()=>{
 for(const id of ids){
  const p=pictureById(id),target=paintTarget(p,0);
  const input=[...target];
  assert.equal(checkPaintRow(p,0,input).correct,true);
  const first=target[0],different=Object.keys(p.paint.colours).find(k=>k!==first);
  input[0]=different;
  assert.deepEqual(checkPaintRow(p,0,input).wrong,[0]);
  assert.equal(checkPaintRow(p,0,input).correct,false);
  input[0]=null;
  assert.deepEqual(checkPaintRow(p,0,input).unpainted,[0]);
  assert.equal(checkPaintRow(p,0,input).correct,false);
  assert.deepEqual(paintTarget(p,0),target,"Wrong check must not mutate answers");
 }
});
test("The generated rules alternate strict and inclusive symbols across replays",()=>{
 const p=pictureById("paint-rocket");
 const first=makePaintQuestion(p,0,0),next=makePaintQuestion(p,0,1);
 assert.deepEqual(first.target,next.target);
 assert.notDeepEqual(first.rules.map(r=>r.inequality),
   next.rules.map(r=>r.inequality));
 const inequalities=ids.flatMap(id=>{
  const pic=pictureById(id);
  return Array.from({length:14},(_,i)=>
    makePaintQuestion(pic,i,0).rules.map(r=>r.inequality)).flat();
 });
 assert.ok(inequalities.some(s=>s.includes("<")));
 assert.ok(inequalities.some(s=>s.includes("≤")));
 assert.ok(inequalities.some(s=>s.includes(">")));
 assert.ok(inequalities.some(s=>s.includes("≥")));
});
test("Invalid grids are rejected before publishing",()=>{
 const p=pictureById("paint-flower");
 const grid=p.paint.grid.slice();
 grid[2]="SSSZXZZSSS";
 assert.throws(()=>validatePaintPicture({...p,paint:{...p.paint,grid}}),
   /invalid colour grid/);
 const five=[...p.paint.grid];
 five[0]="SPGPYPGPSS";
 assert.throws(()=>validatePaintPicture({...p,paint:{...p.paint,grid:five}}),
   /one to four colour intervals/);
 const short=p.paint.grid.slice(0,5);
 assert.throws(()=>validatePaintPicture({...p,paint:{...p.paint,grid:short}}),
   /six to fourteen painted rows/);
});


test("Quick-win Paint by Inequalities pictures grow from six to twelve rows and two to four colours",()=>{
 const starters=[
  ["paint-heart-starter",6,8,2],
  ["paint-star-step",8,8,2],
  ["paint-daisy-building",10,10,3],
  ["paint-rocket-challenge",12,10,4]
 ];
 for(const [id,rows,width,colours] of starters){
  const p=pictureById(id);
  assert.equal(p.levels[0],"paint");
  assert.equal(p.paint.grid.length,rows);
  assert.equal(pictureWidth(p),width);
  assert.equal(Object.keys(p.paint.colours).length,colours);
  assert.equal(validatePaintPicture(p).rows,rows);
  for(let replay=0;replay<12;replay++)for(let i=0;i<rows;i++){
   const q=makePaintQuestion(p,i,replay);
   const expected=paintTarget(p,i),assigned=Array(width).fill(null);
   assert.equal(q.row,rows-i);
   assert.ok(q.rules.length>=1&&q.rules.length<=4);
   for(const rule of q.rules)for(let j=0;j<width;j++){
    if(isInInterval(p.window.min+j,rule.solution)){
     assert.equal(assigned[j],null,id+": rules overlap at "+i+","+j);
     assigned[j]=rule.key;
    }
   }
   assert.deepEqual(assigned,expected,id+": incorrect rule coverage");
   assert.equal(checkPaintRow(p,i,expected).correct,true);
   const unfinished=expected.slice();unfinished[0]=null;
   assert.equal(checkPaintRow(p,i,unfinished).correct,false);
   assert.equal(checkPaintRow(p,i,unfinished).unpainted[0],0);
  }
 }
});
test("A full single-colour integer row uses one genuine inequality rule",()=>{
 const p=pictureById("paint-heart-starter");
 const index=p.paint.grid.length-1-p.paint.grid.indexOf("RRRRRRRR");
 const q=makePaintQuestion(p,index);
 assert.equal(q.rules.length,1);
 assert.equal(q.rules[0].key,"R");
 for(let x=p.window.min;x<p.window.max;x++)
  assert.equal(isInInterval(x,q.rules[0].solution),true);
});
