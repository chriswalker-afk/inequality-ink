import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  pictureById,picturePixelAt,fullPictureWidth,pictureFinalDetails,
  makePictureQuestion,picturePaintedValues,progressionForLevel,
  extraPicturesForLevel,validatePicture,validatePictureLibrary
} from "./picture-engine.mjs";
import {makePaintQuestion,validatePaintPicture} from "./paint-engine.mjs";
import {STUDENT_BONUS_PICTURES} from "./student-bonus-pictures.mjs";

// Compare the *finished reflected artwork*, not just whether both halves
// are technically symmetrical. Symmetrical bows are not balls or hearts!
function silhouette(id){
  const p=pictureById(id),w=fullPictureWidth(p);
  return p.rows.map((_,i)=>Array.from({length:w},(_,x)=>
    picturePixelAt(p,x,i+1,{full:true})?"#":".").join(""));
}
test("Little Heart now has two lobes, a united centre and a pointed bottom",()=>{
  assert.deepEqual(silhouette("mirror-heart-step"),[
    "######....######",
    "#######..#######",
    "################",
    "################",
    ".##############.",
    "...##########...",
    ".....######.....",
    ".......##......."
  ]);
});
test("Bouncy Ball is one connected circle, not two opposing bows",()=>{
  assert.deepEqual(silhouette("mirror-ball-building"),[
    ".....######.....",
    "...##########...",
    "..############..",
    ".##############.",
    "################",
    "################",
    ".##############.",
    "..############..",
    "...##########...",
    ".....######....."
  ]);
});
test("Tiny Flower visibly has a bloom, narrow stem, leaves and pot",()=>{
  assert.deepEqual(silhouette("mirror-flower-challenge"),[
    "......######......",
    "...############...",
    ".################.",
    "##################",
    "##################",
    "..##############..",
    "......######......",
    ".......####.......",
    "...############...",
    ".......####.......",
    "......######......",
    ".....########....."
  ]);
  assert.deepEqual(pictureById("mirror-flower-challenge").detailStages,
    ["petals","centre","leaves","pot"]);
});
test("Corrected mirror pictures keep eight/ten/twelve real questions and their IDs",()=>{
  const pairs=[
    ["mirror-heart-step",8],
    ["mirror-ball-building",10],
    ["mirror-flower-challenge",12]
  ];
  for(const [id,total] of pairs){
    const p=pictureById(id);
    assert.equal(p.rows.length,total);
    assert.equal(p.levels[0],"mirror");
    assert.equal(validatePicture(p).rows,total);
    for(const mark of pictureFinalDetails(p))
      assert.ok(picturePixelAt(p,mark.x,mark.y,{full:true}),id);
    for(let replay=0;replay<10;replay++){
      for(let i=0;i<total;i++){
        const task=makePictureQuestion(p,i,replay,"mirror");
        const values=picturePaintedValues(p,task);
        const row=p.rows[total-1-i];
        assert.equal(values.length,row[1]-row[0]+1,
          id+" row "+i+" replay "+replay);
      }
    }
  }
});
test("Paint Little Heart includes a notch without needing more than four rules",()=>{
  const p=pictureById("paint-heart-starter");
  assert.equal(p.paint.grid[0],"RRRSSRRR");
  assert.equal(validatePaintPicture(p).rows,6);
  const q=makePaintQuestion(p,5);
  assert.equal(q.rules.length,3);
  assert.deepEqual(q.target,[..."RRRSSRRR"]);
});
test("Every mode receives one original optional picture at a comparable maths stage",()=>{
  const expected={
    mirror:["mirror-evergreen-bonus",2,8],
    full:["full-sailboat-bonus",2,8],
    solve:["solve-balloon-bonus",3,10],
    mixed:["mixed-crystal-bonus",2,8],
    paint:["paint-kite-bonus",3,10]
  };
  assert.equal(STUDENT_BONUS_PICTURES.length,5);
  for(const [mode,[id,stage,rows]] of Object.entries(expected)){
    const p=pictureById(id);
    assert.equal(p.studentEncore,true);
    assert.deepEqual(p.levels,[mode]);
    assert.equal(p.legacyMathStage[mode],stage);
    assert.equal(p.rows.length,rows);
    assert.equal(validatePicture(p).rows,rows);
    assert.ok(extraPicturesForLevel(mode).some(x=>x.id===id));
    assert.ok(!progressionForLevel(mode).some(x=>x.id===id));
    const names=[...progressionForLevel(mode),...extraPicturesForLevel(mode)].map(x=>x.clue);
    assert.equal(new Set(names).size,names.length);
  }
  assert.equal(validatePictureLibrary().length,125);
});
test("Classroom help is always visible, but no new modal or answer gate is added",()=>{
  const html=readFileSync(new URL("./index.html",import.meta.url),"utf8");
  const styles=readFileSync(new URL("./styles.css",import.meta.url),"utf8");
  const app=readFileSync(new URL("./app.mjs",import.meta.url),"utf8");
  assert.equal([...html.matchAll(/class="endpoint-meaning/g)].length,2);
  assert.match(html,/<strong>Open:<\/strong> &lt; or &gt; \(not included\)/);
  assert.match(html,/<strong>Closed:<\/strong> ≤ or ≥ \(included\)/);
  assert.match(html,/Tap a circle to switch its type/);
  assert.match(styles,/#playScreen \.question-footer\s*\{\s*position:sticky/);
  assert.match(html,/id="surprisePictureButton"/);
  assert.match(html,/id="finishSurpriseButton"/);
  assert.match(app,/function surprisePicture\(\)/);
  assert.match(app,/selectPicture\(p.id\);\s*start\(\);/);
  assert.match(app,/function check\(\)/);
  assert.match(app,/g.addEventListener\("pointerdown"/);
  assert.match(app,/toggleEndpoint\(side,\{restoreFocus:true\}\)/);
});
