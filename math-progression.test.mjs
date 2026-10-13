import test from "node:test";
import assert from "node:assert/strict";
import {mathematicalStage,solveTransformation,paintStrictPreference} from "./math-progression.mjs";
import {PICTURE_LIBRARY,progressionForLevel,extraPicturesForLevel,
  pictureWidth,picturedRow,makePictureQuestion,picturePaintedValues} from "./picture-engine.mjs";
import {makePaintQuestion,checkPaintRow} from "./paint-engine.mjs";

test("Five math stages in all modes; bonus pictures retain advanced generators",()=>{
  for(const level of ["mirror","full","solve","mixed","paint"]){
    assert.deepEqual(progressionForLevel(level).map(p=>mathematicalStage(p,level)),
      [1,2,3,4,5]);
    assert.ok(extraPicturesForLevel(level).every(p=>
      level==="mixed"&&p.legacyMathStage?.mixed?
        mathematicalStage(p,level)===p.legacyMathStage.mixed:
        mathematicalStage(p,level)===5),
      "Historical Mixed quick-win questions retain their original maths");
  }
});

test("Previous Mixed starter bonuses keep their original 1–4 stage maths",()=>{
 const ids=["full-star-starter","full-gift-step",
   "full-ball-building","full-flower-challenge"];
 const bonuses=extraPicturesForLevel("mixed");
 for(const [i,id] of ids.entries()){
   const picture=bonuses.find(p=>p.id===id);
   assert.ok(picture,id+" must stay accessible as a Mixed bonus");
   assert.equal(picture.progression?.mixed,undefined);
   assert.equal(picture.legacyMathStage.mixed,i+1);
   assert.equal(mathematicalStage(picture,"mixed"),i+1);
   assert.deepEqual(picture.levels,["full","solve","mixed"]);
   for(let replay=0;replay<8;replay++){
     const q=makePictureQuestion(picture,0,replay,"mixed");
     if(i<3)assert.equal(q.answer.included,true,
       id+" should retain its gentle first mirrored inequality");
     assert.equal(q.mode,"read");
     assert.equal(q.artMode,"mirror");
   }
 }
 const p=bonuses.find(x=>x.id==="full-star-starter");
 assert.deepEqual(makePictureQuestion(p,3,0,"mixed").transformed,{a:1,b:-2});
 // The legacy finale remains Stage 5 without becoming a main-path image.
 const potion=bonuses.find(p=>p.id==="enchanted-potion");
 assert.equal(mathematicalStage(potion,"mixed"),5);
});

test("Mirror and Full starters introduce strict endpoints late",()=>{
  for(let replay=0;replay<12;replay++){
    for(const level of ["mirror","full"]){
      const p=progressionForLevel(level)[0];
      for(let i=0;i<4;i++){
        const q=makePictureQuestion(p,i,replay,level);
        if(level==="mirror")assert.equal(q.answer.included,true);
        else{
          assert.equal(q.answer.lowerIncluded,true);
          assert.equal(q.answer.upperIncluded,true);
        }
      }
    }
  }
});
test("Solve starter builds from addition to a single simple sign reversal",()=>{
  const p=progressionForLevel("solve")[0];
  for(let replay=0;replay<12;replay++){
    const qs=p.rows.map((_,i)=>makePictureQuestion(p,i,replay,"solve"));
    assert.deepEqual(qs.map(q=>q.transformed.a),[1,1,2,1,2,-1]);
    assert.equal(qs[5].transformed.b,0);
    assert.ok(qs.every(q=>Math.max(
      Math.abs(q.answer.lower*q.transformed.a+q.transformed.b),
      Math.abs(q.answer.upper*q.transformed.a+q.transformed.b))<=12));
  }
});
test("Higher stages increase sign-reversal algebra",()=>{
  for(const [step,n] of [[1,1],[2,2],[3,3],[4,5]]){
    const p=progressionForLevel("solve")[step-1];
    const qs=p.rows.map((_,i)=>makePictureQuestion(p,i,0,"solve"));
    assert.equal(qs.filter(q=>q.transformed.a<0).length,n);
  }
});
test("Mixed starter still includes reading, drawing and solving",()=>{
  const p=progressionForLevel("mixed")[0];
  const qs=p.rows.map((_,i)=>makePictureQuestion(p,i,0,"mixed"));
  for(const mode of ["read","draw","solve"])assert.ok(qs.some(q=>q.mode===mode));
  assert.deepEqual(qs.find(q=>q.mode==="solve").transformed,{a:1,b:-2});
});
test("Paint starter introduces open colour boundaries gently",()=>{
  const p=progressionForLevel("paint")[0];
  for(let replay=0;replay<12;replay++){
    for(let i=0;i<3;i++)for(const rule of makePaintQuestion(p,i,replay).rules)
      if(rule.solution.direction==="between"){
        assert.equal(rule.solution.lowerIncluded,true);
        assert.equal(rule.solution.upperIncluded,true);
      }
  }
  assert.equal(paintStrictPreference(1,0,0,1,"upper"),false);
});
test("Big Finish and extra picture solve transformations are unchanged",()=>{
  const old=[[2,1],[2,-3],[-2,1],[3,2],[-3,-2],[1,4],[-1,1]];
  for(const p of PICTURE_LIBRARY.filter(p=>p.levels.includes("solve")&&
    mathematicalStage(p,"solve")===5)){
    for(let replay=0;replay<12;replay++)for(let i=0;i<p.rows.length;i++){
      const row=picturedRow(p,i);
      const preferred=p.initial?.[row.y-1]?.transform;
      const [a,b]=preferred&&replay===0?[preferred.a,preferred.b]:old[(i+replay)%old.length];
      assert.deepEqual(makePictureQuestion(p,i,replay,"solve").transformed,{a,b});
    }
  }
});
test("All question variants still paint exactly their authored silhouettes",()=>{
  for(const p of PICTURE_LIBRARY)for(const level of p.levels){
    for(let index=0;index<p.rows.length;index++){
      const row=picturedRow(p,index);
      const expected=Array.from({length:pictureWidth(p)},(_,i)=>p.window.min+i)
        .filter((_,i)=>i>=row.from&&i<=row.to);
      for(let replay=0;replay<20;replay++){
        const q=makePictureQuestion(p,index,replay,level);
        assert.deepEqual(picturePaintedValues(p,q),expected,
          p.id+" "+level+" "+index+" "+replay);
        if(level==="paint"){
          assert.equal(checkPaintRow(p,index,q.target).correct,true);
        }
      }
    }
  }
});
