import test from "node:test";
import assert from "node:assert/strict";
import {
  PICTURE_LIBRARY,pictureById,mysteryPool,mysteryTier,
  progressionForLevel,picturePixelAt,fullPictureWidth,pictureFinalDetails,
  questionCount,validatePicture,validatePictureLibrary
} from "./picture-engine.mjs";
import {mathematicalStage} from "./math-progression.mjs";
import {CRAFTED_MYSTERIES,CRAFTED_MYSTERY_COUNTS} from "./crafted-mysteries.mjs";
import {makePaintQuestion} from "./paint-engine.mjs";

const MODES=["mirror","full","solve","mixed","paint"];
const ROWS=[6,8,10,12,14];
const EXPECTED_ADDITIONS={
  mirror:[2,1,2,2,2],
  full:[2,1,2,2,2],
  solve:[2,2,1,2,2],
  mixed:[1,0,1,1,2],
  paint:[2,2,1,2,2]
};
function mask(picture){
  const width=fullPictureWidth(picture);
  return Array.from({length:questionCount(picture)},(_,row)=>
    Array.from({length:width},(_,x)=>
      picturePixelAt(picture,x,row+1,{full:true})?"#":".").join("")).join("/");
}
test("At least five real, mathematically matched pictures in every mode/difficulty pool",()=>{
  assert.equal(CRAFTED_MYSTERIES.length,41);
  assert.equal(PICTURE_LIBRARY.length,125);
  const unique=new Set(PICTURE_LIBRARY.map(p=>p.id));
  assert.equal(unique.size,PICTURE_LIBRARY.length);
  for(const mode of MODES){
    assert.deepEqual([...CRAFTED_MYSTERY_COUNTS[mode]],EXPECTED_ADDITIONS[mode]);
    assert.equal(progressionForLevel(mode).length,5,
      "The five main stage pictures must not be replaced");
    for(let stage=1;stage<=5;stage++){
      const pool=mysteryPool(mode,stage);
      assert.ok(pool.length>=5,
        mode+" "+stage+" has "+pool.length+" pictures; needs five");
      assert.ok(pool.some(p=>p.progression?.[mode]===stage),
        "Core progression artwork must remain in "+mode+" "+stage);
      for(const p of pool){
        assert.equal(mysteryTier(p,mode),stage);
        assert.equal(questionCount(p),ROWS[stage-1]);
        assert.equal(mathematicalStage(p,mode),stage,
          p.id+" must use exactly this difficulty's mathematical profile");
      }
      assert.equal(new Set(pool.map(p=>p.id)).size,pool.length);
      assert.equal(new Set(pool.map(p=>p.clue.toLowerCase())).size,pool.length,
        "Every mystery clue must be unique within a difficulty");
    }
  }
  assert.equal(PICTURE_LIBRARY.reduce((sum,p)=>sum+p.levels.length,0),143);
});
test("New silhouettes are individually authored, distinct, connected and embellished",()=>{
  const signatures=new Set();
  for(const p of CRAFTED_MYSTERIES){
    const key=p.levels[0]+"/"+questionCount(p)+"/"+mask(p);
    assert.ok(!signatures.has(key),"Repeated silhouette "+p.id);
    signatures.add(key);
    assert.equal(p.craftedMystery,true);
    assert.match(p.id,/^gallery-(mirror|full|solve|mixed|paint)-[1-5]-/);
    assert.equal(p.levels.length,1,
      "New images have independently saved per-mode progress");
    assert.equal(p.height,p.rows.length+2);
    assert.ok(p.detailStages.length>=3);
    assert.ok(pictureFinalDetails(p).length>=12);
    for(const detail of pictureFinalDetails(p)){
      assert.ok(picturePixelAt(p,detail.x,detail.y,{full:true}),
        p.id+" detail would appear outside the artwork");
    }
    assert.equal(validatePicture(p).rows,questionCount(p));
  }
});
test("All new Paint pictures use exactly the promised colours and genuine intervals",()=>{
  for(const p of CRAFTED_MYSTERIES.filter(p=>p.levels[0]==="paint")){
    const stage=p.legacyMathStage.paint;
    const expected=[2,2,3,4,5][stage-1];
    assert.equal(Object.keys(p.paint.colours).length,expected);
    for(let i=0;i<p.rows.length;i++){
      const q=makePaintQuestion(p,i);
      assert.ok(q.rules.length>=1&&q.rules.length<=4,p.id);
      assert.equal(q.target.length,p.window.max-p.window.min);
    }
  }
});
test("Finished art silhouettes stay recognizable after mirrored unfolding",()=>{
  const bee=pictureById("gallery-mirror-1-honey-bee");
  assert.deepEqual(mask(bee).split("/"),[
    "...######...",
    ".##########.",
    "############",
    "############",
    ".##########.",
    "...######..."
  ]);
  const evergreen=pictureById("gallery-mirror-1-pine-sapling");
  assert.deepEqual(mask(evergreen).split("/"),[
    ".....##.....",
    "...######...",
    ".##########.",
    "############",
    "....####....",
    "....####...."
  ]);
  const house=pictureById("gallery-full-1-little-house");
  assert.deepEqual(mask(house).split("/"),[
    "...##...",
    "..####..",
    ".######.",
    "########",
    "########",
    "########"
  ]);
  const sun=pictureById("gallery-paint-1-smiling-sun");
  assert.deepEqual(mask(sun).split("/"),[
    "...##...",
    "..####..",
    ".######.",
    ".######.",
    "..####..",
    "...##..."
  ]);
});
test("Every original artwork remains present and the complete library validates",()=>{
  for(const id of [
    "mirror-heart-step","mirror-ball-building","mirror-flower-challenge",
    "full-star-starter","mixed-dragon-finale","paint-heart-starter",
    "mirror-evergreen-bonus","solve-balloon-bonus","bank-mirror-1-1"
  ])assert.ok(pictureById(id),"Existing progress key "+id+" must remain");
  assert.equal(validatePictureLibrary().length,125);
});
