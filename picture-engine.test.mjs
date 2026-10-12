import test from "node:test";
import assert from "node:assert/strict";
import {
 PICTURE_LIBRARY,pictureById,picturesForLevel,defaultPictureForLevel,
 progressionForLevel,extraPicturesForLevel,progressionStep,PICTURE_TIERS,
 pictureWidth,fullPictureWidth,pictureHeight,questionCount,picturedRow,
 picturePixelAt,pictureColourAt,pictureBackgroundAt,pictureFinalDetails,
 pictureDetailStages,makePictureQuestion,picturePaintedValues,
 validatePicture,validatePictureLibrary
} from "./picture-engine.mjs";
import {identicalSolution,isInInterval} from "./model.mjs";

test("All 24 artworks validate with a five-picture quick-win path in each mode",()=>{
 const reports=validatePictureLibrary();
 assert.equal(reports.length,24);
 for(const report of reports){
   assert.ok([6,8,10,12,14].includes(report.rows));
   assert.ok(report.width>=6);
   assert.ok(report.modes.length>0);
 }
 const primary={
   mirror:["mirror-star-starter","mirror-heart-step","mirror-ball-building",
     "mirror-flower-challenge","cat-cameo"],
   full:["full-star-starter","full-gift-step","full-ball-building",
     "full-flower-challenge","mushroom-mystery"],
   solve:["full-star-starter","full-gift-step","full-ball-building",
     "full-flower-challenge","rocket-launch"],
   mixed:["full-star-starter","full-gift-step","full-ball-building",
     "full-flower-challenge","enchanted-potion"],
   paint:["paint-heart-starter","paint-star-step","paint-daisy-building",
     "paint-rocket-challenge","paint-robot"]
 };
 assert.deepEqual(PICTURE_TIERS,["Starter","Step Up","Building","Challenge","Big Finish"]);
 for(const [level,ids] of Object.entries(primary)){
   const path=progressionForLevel(level);
   assert.deepEqual(path.map(p=>p.id),ids);
   assert.deepEqual(path.map(p=>questionCount(p)),[6,8,10,12,14]);
   assert.deepEqual(path.map(p=>progressionStep(p,level)),[1,2,3,4,5]);
   assert.deepEqual(picturesForLevel(level).slice(0,5).map(p=>p.id),ids);
   assert.equal(defaultPictureForLevel(level).id,ids[0]);
 }
 for(const [level,expected] of Object.entries({
   mirror:3,full:4,solve:4,mixed:4,paint:2
 })){
   assert.equal(extraPicturesForLevel(level).length,expected);
   assert.ok(extraPicturesForLevel(level).every(p=>!p.progression?.[level]));
 }
 assert.deepEqual(progressionForLevel("paint").map(p=>
   Object.keys(p.paint.colours).length),[2,2,3,4,5]);
 assert.throws(()=>pictureById("nonexistent"),/Unknown picture/);
});
test("Every picture has a unique playful clue which hides its final name",()=>{
  const expected={
    "mirror-star-starter":"Twinkle Time",
    "mirror-heart-step":"Heart in a Hurry",
    "mirror-ball-building":"Bounce Around",
    "mirror-flower-challenge":"Petal Pop",
    "full-star-starter":"Star in a Flash",
    "full-gift-step":"Wrapped with Wonder",
    "full-ball-building":"Bouncy Business",
    "full-flower-challenge":"Flower Burst",
    "paint-heart-starter":"Sweet Heart",
    "paint-star-step":"Star Splash",
    "paint-daisy-building":"Daisy Days",
    "paint-rocket-challenge":"Ready for Launch",
    "cat-cameo":"Whisker Wink",
    "heart-glow":"Full of Feeling",
    "coral-crab":"Seaside Sidestep",
    "twilight-owl":"Night Watch",
    "mushroom-mystery":"Woodland Wonder",
    "rocket-launch":"Blast Off",
    "flower-pot":"In Full Bloom",
    "enchanted-potion":"Bubbling Brew",
    "ice-cream-treat":"Sweet Scoop",
    "paint-rocket":"To the Moon",
    "paint-flower":"Petal Parade",
    "paint-robot":"Beep Beep Buddy"
  };
  assert.equal(Object.keys(expected).length,PICTURE_LIBRARY.length);
  for(const picture of PICTURE_LIBRARY){
    assert.equal(picture.clue,expected[picture.id]);
    assert.ok(picture.clue!==picture.name);
    assert.doesNotMatch(picture.clue,/mystery\s*\d+/i);
    assert.ok(picture.clue.length<=35);
    assert.equal(picture.mystery,undefined,"Do not retain old numbered labels");
  }
  for(const level of ["mirror","full","solve","mixed","paint"]){
    const clues=picturesForLevel(level).map(p=>p.clue.toLowerCase());
    assert.equal(new Set(clues).size,clues.length,
      "Clue names must be unique within each mode");
  }
  const cat=pictureById("cat-cameo");
  assert.throws(()=>validatePicture({...cat,clue:"Mystery 01"}),/clue must/);
  assert.throws(()=>validatePicture({...cat,clue:cat.name}),/clue must/);
  assert.throws(()=>validatePicture({...cat,clue:""}),/clue must/);
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
   assert.ok([6,8,10,12,14].includes(questionCount(picture)));
   assert.ok(baseWidth>0);
 }
});
test("Final details and their animation stages are picture data, not engine branches",()=>{
 for(const picture of PICTURE_LIBRARY){
   const stages=pictureDetailStages(picture),details=pictureFinalDetails(picture);
   assert.ok(stages.length>=2);
   assert.ok(details.length>=(questionCount(picture)<=8?4:6));
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


test("Five new pictures are registered with exactly the intended modes and dimensions",()=>{
  const expected=[
    ["coral-crab","half",10,20,["mirror"]],
    ["twilight-owl","half",9,18,["mirror"]],
    ["flower-pot","full",16,16,["full","solve","mixed"]],
    ["enchanted-potion","full",16,16,["full","solve","mixed"]],
    ["ice-cream-treat","full",16,16,["full","solve","mixed"]]
  ];
  assert.equal(PICTURE_LIBRARY.length,24);
  assert.equal(picturesForLevel("mirror").length,8);
  for(const mode of ["full","solve","mixed"])
    assert.equal(picturesForLevel(mode).length,9);
  for(const [id,family,halfWidth,fullWidth,levels] of expected){
    const picture=pictureById(id);
    assert.equal(picture.family,family);
    assert.equal(pictureWidth(picture),halfWidth);
    assert.equal(fullPictureWidth(picture),fullWidth);
    assert.deepEqual(picture.levels,levels);
    assert.equal(questionCount(picture),14);
    assert.ok(picture.detailStages.length>=4,
      id+" should have an appropriately layered colour finale");
    assert.ok(pictureFinalDetails(picture).length>=25,
      id+" needs visually meaningful finishing details");
  }
  const combinations=PICTURE_LIBRARY.reduce((sum,p)=>sum+p.levels.length,0);
  assert.equal(combinations,42);
});
test("New Mirror Mode pictures balance both ray directions and open/closed circles",()=>{
  for(const id of ["coral-crab","twilight-owl"]){
    const picture=pictureById(id);
    const questions=Array.from({length:14},(_,i)=>
      makePictureQuestion(picture,i,0,"mirror"));
    const left=questions.filter(q=>q.answer.direction==="left").length;
    const right=questions.filter(q=>q.answer.direction==="right").length;
    const open=questions.filter(q=>!q.answer.included).length;
    const closed=questions.filter(q=>q.answer.included).length;
    const uniqueRuns=new Set(picture.rows.map(([from,to])=>from+","+to));
    assert.ok(left>=5&&right>=5,id+" has unbalanced ray directions");
    assert.ok(open>=5&&closed>=5,id+" has unbalanced circle types");
    assert.ok(uniqueRuns.size>=6,id+" repeats too many identical rows");
    for(const q of questions){
      assert.ok(q.answer.at>=picture.window.min&&
        q.answer.at<=picture.window.max);
    }
  }
});
test("New full pictures offer distinct widths, varied endpoints, and solve/mixed replays",()=>{
  for(const id of ["flower-pot","enchanted-potion","ice-cream-treat"]){
    const picture=pictureById(id);
    const widths=new Set(picture.rows.map(([lo,hi])=>hi-lo+1));
    assert.ok(widths.size>=6,id+" lacks useful interval variety");
    const solve=Array.from({length:14},(_,i)=>
      makePictureQuestion(picture,i,0,"solve"));
    assert.ok(solve.every(q=>q.mode==="solve"));
    assert.ok(solve.some(q=>q.transformed.a<0),
      id+" should include at least one sign-reversing inequality");
    const mixed=Array.from({length:14},(_,i)=>
      makePictureQuestion(picture,i,0,"mixed"));
    assert.ok(mixed.some(q=>q.artMode==="mirror"));
    assert.ok(mixed.some(q=>q.artMode==="full"));
    assert.ok(mixed.some(q=>q.mode==="solve"));
    assert.ok(mixed.some(q=>q.mode==="draw"));
    assert.ok(mixed.some(q=>q.mode==="read"));
  }
});


test("Live previews use exactly the same projection as committed picture ink in all nine pictures",()=>{
  for(const picture of PICTURE_LIBRARY)for(const level of picture.levels){
    for(let index=0;index<questionCount(picture);index++){
      const q=makePictureQuestion(picture,index,0,level);
      assert.deepEqual(picturePaintedValues(picture,q,q.answer),
        picturePaintedValues(picture,q),
        picture.id+" "+level+" "+index+" preview differs from committed ink");
      const alternative=q.mode==="read"
        ?q.options.find(o=>!identicalSolution(o.value,q.answer)).value
        :q.answer.direction==="between"
          ?{...q.answer,lower:q.answer.lower+1}
          :{...q.answer,at:q.answer.at+(q.answer.direction==="right"?1:-1)};
      const actual=picturePaintedValues(picture,q,alternative);
      const expected=Array.from(
        {length:pictureWidth(picture)},(_,i)=>i+picture.window.min
      ).filter(value=>{
        if(q.artMode!=="mirror")return isInInterval(value,alternative);
        const centre=picture.window.min+pictureWidth(picture)/2;
        const chosenSide=q.mirrorSide==="right"?value>=centre:value<centre;
        if(!chosenSide)return false;
        return isInInterval(value,alternative);
      });
      if(q.artMode==="mirror"){
        const reflection=v=>picture.window.min+picture.window.max-1-v;
        const merged=[...new Set([...expected,...expected.map(reflection)])]
          .sort((a,b)=>a-b);
        assert.deepEqual(actual,merged);
      }else assert.deepEqual(actual,expected);
      assert.ok(actual.every(x=>x>=picture.window.min&&x<picture.window.max));
    }
  }
});
test("The ghost faithfully paints mistaken cells outside the secret silhouette",()=>{
  const cat=pictureById("cat-cameo");
  const q=makePictureQuestion(cat,6,0,"mirror");
  assert.equal(q.equation,"x < 3");
  const moreThanNeeded={direction:"left",at:5,included:false};
  const ghost=picturePaintedValues(cat,q,moreThanNeeded);
  assert.deepEqual(ghost,[-5,-4,-3,-2,-1,0,1,2,3,4]);
  assert.deepEqual(picturePaintedValues(cat,q),[-5,-4,-3,-2,-1,0,1,2]);
  assert.ok(ghost.some(v=>!picturePaintedValues(cat,q).includes(v)),
    "A wrong preview must NOT be silently clipped to the secret answer");
  assert.equal(identicalSolution(moreThanNeeded,q.answer),false);
});
test("Equivalent integer pixels do not make a wrong real inequality correct",()=>{
  const cat=pictureById("cat-cameo"),q=makePictureQuestion(cat,6,0,"mirror");
  const wrong={direction:"left",at:2,included:true};
  assert.deepEqual(picturePaintedValues(cat,q,wrong),
    picturePaintedValues(cat,q));
  assert.equal(identicalSolution(wrong,q.answer),false,
    "Open and closed real endpoints are marked mathematically, not pixelwise");
});


test("Invalid progression metadata is rejected without changing old pictures",()=>{
 const cat=pictureById("cat-cameo");
 assert.throws(()=>validatePicture({...cat,progression:{mirror:6}}),
   /invalid progression stage/);
 assert.throws(()=>validatePicture({...cat,progression:{paint:1}}),
   /invalid progression stage/);
 const p=pictureById("mushroom-mystery");
 assert.equal(questionCount(p),14);
 assert.equal(pictureWidth(p),16);
});
