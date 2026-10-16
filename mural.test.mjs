import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  PICTURE_LIBRARY,pictureById,picturePixelAt,fullPictureWidth,
  pictureFinalDetails,questionCount
} from "./picture-engine.mjs";
import {
  MURAL_ACHIEVEMENTS_KEY,MURAL_GAME_KEY,MURAL_WIDTH,MURAL_HEIGHT,
  MURAL_ZONES,muralHash,muralPreferredZone,muralPlacements,
  completedIdsFromProgress,muralDiscoveredIds,rememberMuralDiscoveries,muralModesFor
} from "./mural-model.mjs";
import {muralSpritePaths} from "./mural-art.mjs";

const load=name=>readFileSync(new URL(name,import.meta.url),"utf8");
function storage(initial={}){
  const map=new Map(Object.entries(initial));
  return {
    getItem:key=>map.get(key)??null,
    setItem:(key,value)=>map.set(key,String(value)),
    removeItem:key=>map.delete(key),
    dump:()=>Object.fromEntries(map)
  };
}
function progressRecord(p,{mode=p.levels[0],done=questionCount(p),completed=true}={}){
  return {[mode+":"+p.id]:{done,completed}};
}
test("All 125 original paintings have a fixed, valid position within the world",()=>{
  const placements=muralPlacements();
  assert.equal(PICTURE_LIBRARY.length,125);
  assert.equal(placements.size,125);
  assert.equal(MURAL_ZONES.length,5);
  const counts=Object.fromEntries(MURAL_ZONES.map(z=>[z.id,0]));
  for(const p of PICTURE_LIBRARY){
    const place=placements.get(p.id);
    assert.ok(place,p.id);
    assert.ok(MURAL_ZONES.some(z=>z.id===place.zone));
    counts[place.zone]++;
    assert.ok(Number.isFinite(place.x)&&Number.isFinite(place.y));
    assert.ok(place.x>=0&&place.x+place.width<=MURAL_WIDTH,p.id);
    assert.ok(place.y>=0&&place.y+place.height<=MURAL_HEIGHT,p.id);
    assert.equal(place.id,p.id);
  }
  for(const z of MURAL_ZONES)assert.ok(counts[z.id]>0&&counts[z.id]<=45,z.id);
  assert.deepEqual([...placements],[...muralPlacements()],
    "Discovering more art must never move an earlier piece");
  assert.equal(muralHash("star"),muralHash("star"));
  assert.equal(muralPreferredZone({id:"sky-rocket",name:"Moon Rocket"}),4);
  assert.equal(muralPreferredZone({id:"turtle",name:"Green Turtle"}),2);
});
test("Incomplete work, invalid IDs and unrelated records remain invisible",()=>{
  const heart=pictureById("mirror-heart-step");
  const ball=pictureById("mirror-ball-building");
  const memory=storage({
    [MURAL_GAME_KEY]:JSON.stringify({progress:{
      ...progressRecord(heart,{done:heart.rows.length-1,completed:false}),
      ...progressRecord(ball,{done:ball.rows.length,completed:true}),
      "mirror:totally-invented":{done:14,completed:true}
    }})
  });
  assert.deepEqual([...muralDiscoveredIds(memory)],[ball.id]);
  assert.ok(!muralDiscoveredIds(memory).has(heart.id));
  assert.ok(!muralDiscoveredIds(memory).has("totally-invented"));
  const malformed=storage({[MURAL_GAME_KEY]:"{not json", [MURAL_ACHIEVEMENTS_KEY]:"["});
  assert.equal(muralDiscoveredIds(malformed).size,0);
  assert.equal(completedIdsFromProgress(null).size,0);
});
test("The same picture finished in multiple modes occupies only one mural location",()=>{
  const shared=PICTURE_LIBRARY.find(p=>p.levels.length>1);
  assert.ok(shared);
  const records=Object.assign({},...shared.levels.map(mode=>
    progressRecord(shared,{mode})));
  const memory=storage({[MURAL_GAME_KEY]:JSON.stringify({progress:records})});
  const result=muralDiscoveredIds(memory);
  assert.equal(result.size,1);
  assert.ok(result.has(shared.id));
  assert.equal(muralModesFor(shared,memory).length,shared.levels.length);
});
test("Completed pictures survive game replay without changing the student's progress",()=>{
  const p=pictureById("mirror-heart-step");
  const game={activeLevel:"mirror",
    progress:progressRecord(p),selectedPictures:{mirror:p.id}};
  const memory=storage({[MURAL_GAME_KEY]:JSON.stringify(game)});
  const before=memory.getItem(MURAL_GAME_KEY);
  assert.equal(rememberMuralDiscoveries(memory,game.progress).has(p.id),true);
  assert.equal(memory.getItem(MURAL_GAME_KEY),before,
    "Archiving must never modify or overwrite the game save");
  // Play Again legitimately clears this one game record.
  game.progress["mirror:"+p.id]={done:0,completed:false};
  memory.setItem(MURAL_GAME_KEY,JSON.stringify(game));
  assert.deepEqual([...muralDiscoveredIds(memory)],[p.id],
    "Already discovered artwork remains in the mural during a replay");
  assert.ok(JSON.parse(memory.getItem(MURAL_ACHIEVEMENTS_KEY)).ids.includes(p.id));
  // A second mode's completion never duplicates the picture.
  assert.equal(rememberMuralDiscoveries(memory,{},p.id).size,1);
  const completed=PICTURE_LIBRARY.reduce((pict,p)=>{
    pict[p.levels[0]+":"+p.id]={done:p.rows.length,completed:true};
    return pict;
  },{});
  assert.equal(completedIdsFromProgress(completed).size,125);
});
test("Old saved completions are visible even before a student opens the homepage",()=>{
  const p=pictureById("cat-cameo");
  const memory=storage({"inequality-ink-v4":JSON.stringify({
    progress:{mirror:{done:p.rows.length,completed:true}}
  })});
  assert.ok(muralDiscoveredIds(memory).has(p.id));
  assert.equal(rememberMuralDiscoveries(memory).has(p.id),true);
  memory.removeItem("inequality-ink-v4");
  assert.equal(muralDiscoveredIds(memory).has(p.id),true);
});
test("Transparent murals render genuine finished art, not rectangular mystery frames",()=>{
  for(const p of PICTURE_LIBRARY){
    const paths=muralSpritePaths(p);
    assert.ok(paths.length>0,p.id);
    const truePixels=Array.from({length:p.height},(_,y)=>
      Array.from({length:fullPictureWidth(p)},(_,x)=>
        picturePixelAt(p,x,y,{full:true})?1:0).
      reduce((a,b)=>a+b,0)).reduce((a,b)=>a+b,0);
    const individualPainted=[...paths].reduce((n,path)=>
      n+(path.d.match(/M/g)||[]).length,0);
    assert.equal(individualPainted,truePixels+pictureFinalDetails(p).length,
      p.id+" must contain only real ink pixels and finishing details");
    for(const path of paths){
      assert.ok(typeof path.fill==="string"&&path.fill.length>0);
      assert.ok(path.d.startsWith("M"));
      assert.ok(!path.d.includes("NaN"));
    }
  }
});
test("Mural interface is optional, accessible, navigable and never exposes unearned artwork",()=>{
  const html=load("./mural.html"),game=load("./index.html"),
    js=load("./mural.mjs"),model=load("./mural-model.mjs"),
    css=load("./mural.css"),app=load("./app.mjs");
  assert.ok(html.includes('id="muralItems"></g>'),
    "All unrevealed items must be absent from the initial mural DOM");
  assert.equal([...html.matchAll(/data-mural-zone=/g)].length,5);
  assert.ok(html.includes('id="muralDetails"'));
  assert.ok(html.includes('id="muralViewport" tabindex="0"'));
  assert.ok(html.includes('href="./"'));
  assert.ok(js.includes('muralDiscoveredIds')||js.includes('rememberMuralDiscoveries'));
  assert.ok(js.includes('ids.map(id=>'));
  assert.ok(js.includes('role:"button",tabindex:"0"'));
  assert.ok(js.includes('event.key==="Enter"||event.key===" "'));
  assert.ok(js.includes('paintPaths(picture,sprite)'));
  assert.ok(model.includes("new Set("));
  assert.ok(css.includes("overflow-x:auto"));
  assert.ok(css.includes("@media(max-width:720px)"));
  assert.ok(css.includes("prefers-reduced-motion:reduce"));
  assert.ok(game.includes('href="./mural.html"'));
  assert.ok(game.includes('id="muralEarnedLink"'));
  assert.ok(app.includes('rememberMuralDiscoveries(localStorage,state.progress,picture.id)'));
  assert.ok(app.includes('muralParams.get("muralPicture")'));
  assert.ok(app.includes('selectedTier=mysteryTier(picture,requestedMuralMode)'));
});
