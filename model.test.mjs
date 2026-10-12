import test from "node:test";
import assert from "node:assert/strict";
import {
 WIDTH,HEIGHT,COLUMN_MIN,COLUMN_MAX,AXIS_MIN,AXIS_MAX,
 ROWS,SEQUENCE,LEVELS,LEVEL_IDS,TUTORIAL,TUTORIAL_MIRROR,tutorialFor,
 columnsFor,isInInterval,identicalSolution,paintedColumns,reflectColumn,
 makeQuestion,pixelAt,colourAt,validatePuzzle,formatLinear
} from "./model.mjs";

test("master sprite is connected and exactly symmetric, including its colours",()=>{
 const validated=validatePuzzle();
 assert.equal(validated.connected,true);
 assert.equal(validated.symmetric,true);
 assert.equal(ROWS.length,14);
 assert.equal(WIDTH,16);assert.equal(HEIGHT,16);
 assert.equal(SEQUENCE[0].y,14);assert.equal(SEQUENCE.at(-1).y,1);
 for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
   assert.equal(pixelAt(x,y),pixelAt(WIDTH-1-x,y),"Silhouette differs at "+x+","+y);
   assert.equal(colourAt(x,y),colourAt(WIDTH-1-x,y),"Colour differs at "+x+","+y);
   if(colourAt(x,y)!==null)assert.equal(pixelAt(x,y),true);
 }
 for(const row of ROWS){
   const xs=columnsFor(row);
   assert.ok(xs.length>0);
   for(let j=1;j<xs.length;j++)assert.equal(xs[j],xs[j-1]+1);
   assert.deepEqual(xs.map(reflectColumn).sort((a,b)=>a-b),xs);
 }
});
test("reflecting a half-interval draws exact target columns",()=>{
 const rightRay={artMode:"mirror",mirrorSide:"right",
   answer:{direction:"left",at:3,included:true}};
 const leftRay={artMode:"mirror",mirrorSide:"left",
   answer:{direction:"right",at:-4,included:true}};
 assert.deepEqual(paintedColumns(rightRay),[-4,-3,-2,-1,0,1,2,3]);
 assert.deepEqual(paintedColumns(leftRay),[-4,-3,-2,-1,0,1,2,3]);
 assert.deepEqual(paintedColumns({...rightRay,answer:{direction:"left",at:4,included:false}}),
    [-4,-3,-2,-1,0,1,2,3]);
 assert.deepEqual(paintedColumns({...leftRay,answer:{direction:"right",at:-5,included:false}}),
    [-4,-3,-2,-1,0,1,2,3]);
 assert.equal(isInInterval(-100,rightRay.answer),true,"The ray still means an entire half-line");
 assert.equal(isInInterval(100,leftRay.answer),true,"The ray still means an entire half-line");
});
test("integer pixels do not replace correct real-number endpoint marking",()=>{
 const a={direction:"between",lower:-4,upper:2,lowerIncluded:false,upperIncluded:true};
 const b={direction:"between",lower:-3,upper:2,lowerIncluded:true,upperIncluded:true};
 assert.deepEqual(columnsFor(a),columnsFor(b));
 assert.equal(identicalSolution(a,b),false);
 const oneSidedA={direction:"left",at:3,included:true};
 const oneSidedB={direction:"left",at:4,included:false};
 assert.deepEqual(columnsFor(oneSidedA),columnsFor(oneSidedB));
 assert.equal(identicalSolution(oneSidedA,oneSidedB),false);
});
test("every mode and replay paints the same exact connected sprite",()=>{
 assert.deepEqual([...LEVEL_IDS].sort(),["full","mirror","mixed","solve"]);
 const mirrorMarks={left:0,right:0,strict:0,closed:0};
 for(const level of LEVEL_IDS){
   assert.ok(LEVELS[level].name);
   const types=new Set();
   for(let i=0;i<14;i++){
     const row=SEQUENCE[i],target=columnsFor(row);
     for(let replay=0;replay<40;replay++){
       const q=makeQuestion(i,replay,level);
       assert.equal(q.row,row.y);
       assert.deepEqual(paintedColumns(q),target,level+" row "+q.row+" replay "+replay);
       types.add(q.mode);
       if(q.mode==="read"){
         assert.equal(q.options.length,4);
         assert.equal(q.options.filter(o=>identicalSolution(o.value,q.answer)).length,1);
       }else assert.ok(q.equation.length>0);
       if(q.artMode==="mirror"){
         assert.ok(["left","right"].includes(q.mirrorSide));
         assert.notEqual(q.answer.direction,"between");
         if(level==="mirror"){
           mirrorMarks[q.mirrorSide]++;
           mirrorMarks[q.answer.included?"closed":"strict"]++;
         }
       }else assert.equal(q.answer.direction,"between");
       const bounds=q.answer.direction==="between"
         ? [q.answer.lower,q.answer.upper] : [q.answer.at];
       for(const endpoint of bounds){
         assert.ok(endpoint>=AXIS_MIN && endpoint<=AXIS_MAX);
       }
     }
   }
   if(level==="solve")assert.deepEqual([...types],["solve"]);
   if(level==="full"||level==="mirror")assert.deepEqual([...types].sort(),["draw","read"]);
   if(level==="mixed")assert.deepEqual([...types].sort(),["draw","read","solve"]);
 }
 assert.ok(Object.values(mirrorMarks).every(v=>v>0));
});
test("tutorials teach true rays in Mirror Mode, bounded lines elsewhere",()=>{
 assert.equal(tutorialFor("mirror"),TUTORIAL_MIRROR);
 assert.equal(tutorialFor("full"),TUTORIAL);
 assert.equal(TUTORIAL_MIRROR.length,2);
 for(const q of TUTORIAL_MIRROR)assert.notEqual(q.answer.direction,"between");
 assert.deepEqual(columnsFor(TUTORIAL_MIRROR[0].answer),
   [-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3]);
 assert.deepEqual(columnsFor(TUTORIAL_MIRROR[1].answer),
   [-1,0,1,2,3,4,5,6,7]);
});
test("a negative linear coefficient correctly reverses both inequalities",()=>{
 const i={direction:"between",lower:-3,upper:2,lowerIncluded:false,upperIncluded:false};
 assert.equal(formatLinear(i,-2,1),"−3 < 1 − 2x < 7");
 const j={direction:"between",lower:-4,upper:3,lowerIncluded:true,upperIncluded:false};
 assert.equal(formatLinear(j,-1,1),"−2 < 1 − x ≤ 5");
});
