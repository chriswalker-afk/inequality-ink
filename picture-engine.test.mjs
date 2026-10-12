import test from "node:test";
import assert from "node:assert/strict";
import {
 PICTURE_LIBRARY,pictureById,picturesForLevel,defaultPictureForLevel,
 pictureWidth,fullPictureWidth,pictureHeight,questionCount,picturedRow,
 picturePixelAt,pictureColourAt,pictureBackgroundAt,pictureFinalDetails,
 pictureDetailStages,makePictureQuestion,picturePaintedValues,
 validatePicture,validatePictureLibrary
} from "./picture-engine.mjs";
import {identicalSolution,isInInterval} from "./model.mjs";

test("Four authored pictures validate automatically against their mathematical modes",()=>{
 const reports=validatePictureLibrary();
 assert.deepEqual(reports.map(r=>r.id),
   ["cat-cameo","heart-glow","mushroom-mystery","rocket-launch"]);
 for(const report of reports){
   assert.equal(report.rows,14);
   assert.ok(report.width>=8);
   assert.ok(report.modes.length>0);
 }
 assert.deepEqual(picturesForLevel("mirror").map(p=>p.id),
   ["cat-cameo","heart-glow"]);
 for(const level of ["full","solve","mixed"]){
   assert.deepEqual(picturesForLevel(level).map(p=>p.id),
     ["mushroom-mystery","rocket-launch"]);
 }
 assert.equal(defaultPictureForLevel("mirror").id,"cat-cameo");
 assert.equal(defaultPictureForLevel("solve").id,"mushroom-mystery");
 assert.throws(()=>pictureById("nonexistent"),/Unknown picture/);
});
test("New pictures can have different number-line windows and separate dimensions",()=>{
 const cat=pictureById("cat-cameo"),heart=pictureById("heart-glow");
 const mushroom=pictureById("mushroom-mystery"),rocket=pictureById("rocket-launch");
 assert.deepEqual(cat.window,{min:-5,max:5});
 assert.deepEqual(heart.window,{min:-4,max:4});
 assert.equal(pictureWidth(cat),10);
 assert.equal(pictureWidth(heart),8);
 assert.equal(fullPictureWidth(cat),20);
 assert.equal(fullPictureWidth(heart),16);
 assert.equal(fullPictureWidth(mushroom),16);
 assert.equal(fullPictureWidth(rocket),16);
 assert.equal(pictureHeight(heart),16);
});
test("Exact classroom x < 3 example paints -5 through 2 without bounding the ray",()=>{
 const cat=pictureById("cat-cameo"),q=makePictureQuestion(cat,6,0,"mirror");
 assert.equal(q.row,8);
 assert.equal(q.equation,"x < 3");
 assert.deepEqual(picturePaintedValues(cat,q),[-5,-4,-3,-2,-1,0,1,2]);
 assert.equal(isInInterval(-1000,q.answer),true);
 assert.equal(isInInterval(3,q.answer),false);
 const edge=makePictureQuestion(cat,13,0,"mirror");
 assert.equal(edge.equation,"x > 3");
 assert.deepEqual(picturePaintedValues(cat,edge),[4]);
});
test("All picture / mode / question / replay combinations shade exactly the authored rows",()=>{
 for(const picture of PICTURE_LIBRARY)for(const level of picture.levels){
   for(let i=0;i<questionCount(picture);i++){
     const row=picturedRow(picture,i);
     const expected=Array.from({length:pictureWidth(picture)},(_,x)=>picture.window.min+x)
       .filter((_,x)=>x>=row.from&&x<=row.to);
     for(let replay=0;replay<30;replay++){
       const q=makePictureQuestion(picture,i,replay,level);
       assert.deepEqual(picturePaintedValues(picture,q),expected,
         picture.id+" "+level+" row "+row.y+" replay "+replay);
       if(q.mode==="read"){
         assert.equal(q.options.length,4);
         assert.equal(q.options.filter(o=>identicalSolution(o.value,q.answer)).length,1);
       }
       if(level==="solve")assert.equal(q.mode,"solve");
       if(level==="mirror")assert.ok(q.answer.direction!=="between");
       if(level==="full"&&q.mode==="draw")assert.equal(q.answer.direction,"between");
     }
   }
 }
});
test("Pictures have connected, correctly reflected masks and isolated backgrounds",()=>{
 for(const picture of PICTURE_LIBRARY){
   const baseWidth=pictureWidth(picture);
   const width=fullPictureWidth(picture);
   for(let y=0;y<picture.height;y++)for(let x=0;x<width;x++){
     const filled=picturePixelAt(picture,x,y,{full:true});
     const colour=pictureColourAt(picture,x,y,{full:true});
     if(filled)assert.match(colour,/^#[0-9a-f]{6}$/i);
     else assert.equal(colour,null);
     const background=pictureBackgroundAt(picture,x,y);
     assert.match(background,/^#[0-9a-f]{6}$/i);
     if(picture.family==="half"){
       assert.equal(filled,picturePixelAt(picture,width-1-x,y,{full:true}));
       assert.equal(colour,pictureColourAt(picture,width-1-x,y,{full:true}));
     }
   }
   assert.equal(questionCount(picture),14);
   assert.ok(baseWidth>0);
 }
});
test("Final details and their animation stages are picture data, not engine branches",()=>{
 for(const picture of PICTURE_LIBRARY){
   const stages=pictureDetailStages(picture),details=pictureFinalDetails(picture);
   assert.ok(stages.length>=2);
   assert.ok(details.length>=6);
   for(const stage of stages)assert.ok(details.some(d=>d.group===stage));
   for(const d of details){
     assert.ok(picturePixelAt(picture,d.x,d.y,{full:true}));
     assert.ok(details.some(other=>
       other.x===fullPictureWidth(picture)-1-d.x&&other.y===d.y&&
       other.group===d.group&&other.color===d.color));
   }
 }
});
test("Invalid picture definitions are rejected with helpful diagnostics",()=>{
 const p=pictureById("heart-glow");
 assert.throws(()=>validatePicture({...p,id:"bad",rows:p.rows.map((r,i)=>
   i===6?[2,4]:r)}),/cannot be drawn with one ray/);
 assert.throws(()=>validatePicture({...p,id:"bad",rows:p.rows.map((r,i)=>
   i===4?[0,20]:r)}),/invalid row/);
 assert.throws(()=>validatePicture({...p,id:"bad",details:[[-1,0,"#ffaaaa","eyes"]]}),
   /invalid detail/);
 assert.throws(()=>makePictureQuestion(p,0,0,"solve"),/does not support/);
});
