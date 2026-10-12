import test from "node:test";
import assert from "node:assert/strict";
import {
  WIDTH,HEIGHT,COLUMN_MIN,COLUMN_MAX,AXIS_MIN,AXIS_MAX,
  ROWS,SEQUENCE,LEVELS,LEVEL_IDS,TUTORIAL,TUTORIAL_MIRROR,tutorialFor,
  CAT_WINDOW,CAT_HALF_WIDTH,CAT_FULL_WIDTH,CAT_HALF_ROWS,CAT_SEQUENCE,
  pixelsInWindow,catHalfColumns,catHalfPixelAt,catPixelAt,catColourAt,
  reflectColumn,paintedColumns,columnsFor,isInInterval,identicalSolution,
  makeQuestion,pixelAt,colourAt,validatePuzzle,formatLinear
} from "./model.mjs";

test("two independent artworks remain connected and valid",()=>{
 const stats=validatePuzzle();
 assert.equal(stats.connected,true);
 assert.equal(stats.symmetric,true);
 assert.equal(stats.catConnected,true);
 assert.deepEqual(stats.catWindow,{min:-5,max:5});
 assert.equal(CAT_HALF_WIDTH,10);
 assert.equal(CAT_FULL_WIDTH,20);
 assert.equal(WIDTH,16);
 assert.equal(HEIGHT,16);
 assert.equal(ROWS.length,14);
 assert.equal(CAT_HALF_ROWS.length,14);
 assert.equal(CAT_SEQUENCE[0].y,14);
 assert.equal(CAT_SEQUENCE.at(-1).y,1);
 assert.equal(SEQUENCE[0].y,14);
});
test("a normal -5 to 5 number line produces exactly the requested pixels",()=>{
 const solution={direction:"left",at:3,included:false}; // x < 3
 assert.deepEqual(pixelsInWindow(solution,CAT_WINDOW),[-5,-4,-3,-2,-1,0,1,2]);
 assert.deepEqual(catHalfColumns(solution),[-5,-4,-3,-2,-1,0,1,2]);
 assert.equal(isInInterval(-1000,solution),true,"The mathematical ray is unbounded");
 assert.equal(isInInterval(3,solution),false,"The endpoint must be open");
 const right={direction:"right",at:3,included:false};
 assert.deepEqual(catHalfColumns(right),[4]);
 assert.equal(isInInterval(1000,right),true,"The arrow is still unbounded");
});
test("other pictures can choose smaller number-line windows without changing the algorithm",()=>{
 const small={min:-3,max:3};
 assert.deepEqual(pixelsInWindow({direction:"left",at:1,included:false},small),
   [-3,-2,-1,0]);
 assert.deepEqual(pixelsInWindow({direction:"right",at:1,included:true},small),
   [1,2]);
 assert.deepEqual(pixelsInWindow({direction:"left",at:-3,included:false},small),[]);
 assert.throws(()=>pixelsInWindow({direction:"left",at:1,included:true},{min:1,max:1}));
});
test("cat silhouette uses contiguous, unreflected half-row pixels throughout play",()=>{
 const shapes=[[9,9],[8,9],[7,9],[0,9],[0,9],[0,8],[0,8],
   [0,7],[0,7],[0,6],[0,6],[0,5],[0,4],[0,3]];
 for(let i=0;i<14;i++){
   const row=CAT_HALF_ROWS[i], [lo,hi]=shapes[i];
   assert.deepEqual([row.from,row.to],[lo,hi]);
   assert.deepEqual(Array.from({length:CAT_HALF_WIDTH},(_,x)=>x).filter(x=>catHalfPixelAt(x,row.y)),
     Array.from({length:hi-lo+1},(_,j)=>lo+j));
   assert.ok(lo===0||hi===CAT_HALF_WIDTH-1,"Half-row should be a clipped ray");
 }
});
test("both requested examples occur as exact student questions",()=>{
 const less=makeQuestion(6,0,"mirror");
 assert.equal(less.row,8);
 assert.equal(less.equation,"x < 3");
 assert.deepEqual(paintedColumns(less),[-5,-4,-3,-2,-1,0,1,2]);
 const greater=makeQuestion(13,0,"mirror");
 assert.equal(greater.row,1);
 assert.equal(greater.equation,"x > 3");
 assert.deepEqual(paintedColumns(greater),[4]);
 assert.equal(less.prompt,"Represent this inequality on the number line.");
 assert.equal(greater.artMode,"mirror-half");
});
test("identical pixel patterns do not make distinct real inequalities equivalent",()=>{
 const a={direction:"left",at:3,included:false};
 const b={direction:"left",at:2,included:true};
 assert.deepEqual(catHalfColumns(a),catHalfColumns(b));
 assert.equal(identicalSolution(a,b),false);
 const c={direction:"right",at:3,included:false};
 const d={direction:"right",at:4,included:true};
 assert.deepEqual(catHalfColumns(c),catHalfColumns(d));
 assert.equal(identicalSolution(c,d),false);
});
test("every level, question and replay paints the intended sprite",()=>{
 assert.deepEqual([...LEVEL_IDS].sort(),["full","mirror","mixed","solve"]);
 const seen={read:0,draw:0,left:0,right:0,open:0,closed:0};
 for(const level of LEVEL_IDS){
   assert.ok(LEVELS[level].name);
   const kinds=new Set();
   for(let i=0;i<14;i++)for(let replay=0;replay<40;replay++){
     const q=makeQuestion(i,replay,level);
     const intended=level==="mirror"
       ?Array.from({length:CAT_HALF_WIDTH},(_,j)=>j)
         .filter(x=>catHalfPixelAt(x,q.row)).map(j=>j+CAT_WINDOW.min)
       :columnsFor(ROWS.find(r=>r.y===q.row));
     assert.deepEqual(paintedColumns(q),intended,
       level+" question "+i+" replay "+replay);
     kinds.add(q.mode);
     if(q.mode==="read"){
       assert.equal(q.options.length,4);
       assert.equal(q.options.filter(option=>identicalSolution(option.value,q.answer)).length,1);
     }else assert.ok(q.equation.length);
     if(level==="mirror"){
       assert.equal(q.artMode,"mirror-half");
       assert.notEqual(q.answer.direction,"between");
       seen[q.mode]++;
       seen[q.answer.direction]++;
       seen[q.answer.included?"closed":"open"]++;
     }
     const endpoints=q.answer.direction==="between"
       ?[q.answer.lower,q.answer.upper]:[q.answer.at];
     for(const n of endpoints){
       assert.ok(n>= (level==="mirror"?CAT_WINDOW.min:AXIS_MIN));
       assert.ok(n<= (level==="mirror"?CAT_WINDOW.max:AXIS_MAX));
     }
   }
   if(level==="solve")assert.deepEqual([...kinds],["solve"]);
   if(level==="full"||level==="mirror")assert.deepEqual([...kinds].sort(),["draw","read"]);
   if(level==="mixed")assert.deepEqual([...kinds].sort(),["draw","read","solve"]);
 }
 assert.ok(Object.values(seen).every(n=>n>0));
});
test("completed 20-column cat is symmetric, continuous and coloured only within its outline",()=>{
 const cells=new Set();
 for(let y=0;y<HEIGHT;y++)for(let x=0;x<CAT_FULL_WIDTH;x++){
   assert.equal(catPixelAt(x,y),catPixelAt(CAT_FULL_WIDTH-1-x,y));
   assert.equal(catColourAt(x,y),catColourAt(CAT_FULL_WIDTH-1-x,y));
   if(catPixelAt(x,y))cells.add(x+","+y);
   else assert.equal(catColourAt(x,y),null);
 }
 const seen=new Set(),queue=[cells.values().next().value];
 while(queue.length){
   const key=queue.pop();if(seen.has(key))continue;seen.add(key);
   const [x,y]=key.split(",").map(Number);
   for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
     const next=(x+dx)+","+(y+dy);
     if(cells.has(next)&&!seen.has(next))queue.push(next);
   }
 }
 assert.equal(seen.size,cells.size);
 assert.ok(cells.size>150);
});
test("mushroom picture and other modes retain their original mathematical model",()=>{
 assert.equal(COLUMN_MIN,-8);assert.equal(COLUMN_MAX,7);
 for(const row of ROWS){
   const values=columnsFor(row);
   for(let j=1;j<values.length;j++)assert.equal(values[j],values[j-1]+1);
   assert.deepEqual(values.map(reflectColumn).sort((a,b)=>a-b),values);
 }
 for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
   assert.equal(pixelAt(x,y),pixelAt(WIDTH-1-x,y));
   assert.equal(colourAt(x,y),colourAt(WIDTH-1-x,y));
 }
});
test("tutorials teach full mathematical half-lines, never bounded pixel ranges",()=>{
 assert.equal(tutorialFor("mirror"),TUTORIAL_MIRROR);
 assert.equal(tutorialFor("full"),TUTORIAL);
 assert.deepEqual(catHalfColumns(TUTORIAL_MIRROR[0].answer),[-5,-4,-3,-2,-1,0,1,2,3,4]);
 assert.deepEqual(catHalfColumns(TUTORIAL_MIRROR[1].answer),[4]);
 assert.equal(isInInterval(-150,TUTORIAL_MIRROR[0].answer),true);
 assert.equal(isInInterval(150,TUTORIAL_MIRROR[1].answer),true);
});
test("negative coefficients in Solve & Paint still reverse both inequality signs",()=>{
 const i={direction:"between",lower:-3,upper:2,lowerIncluded:false,upperIncluded:false};
 assert.equal(formatLinear(i,-2,1),"−3 < 1 − 2x < 7");
});
