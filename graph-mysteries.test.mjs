import test from "node:test";
import assert from "node:assert/strict";
import {
  GRAPH_MYSTERY_LEVELS,GRAPH_MYSTERY_MODES,GRAPH_MYSTERY_TIER_SAVE,
  graphMysteryPool,graphMysteryStatus,graphMysteryFinished,
  graphMysteryStarted,graphPickMystery,graphContinueMystery,
  readGraphMysteryTiers,saveGraphMysteryTiers
} from "./regions/graph-mysteries.mjs";
import {
  graphModeGallery,graphPracticeGallery
} from "./regions/graph-art-pictures.mjs";
import {CURVE_PICTURES,CURVE_PRACTICE_PICTURES} from "./regions/curve-pictures.mjs";
import {PLOT_PICTURES,PLOT_PRACTICE_PICTURES} from "./regions/plot-pictures.mjs";
const galleries=mode=>mode==="curve"?
  [CURVE_PICTURES,CURVE_PRACTICE_PICTURES]:mode==="plot"?
  [PLOT_PICTURES,PLOT_PRACTICE_PICTURES]:
  [graphModeGallery(mode),graphPracticeGallery(mode)];
function fakeStorage(initial={}){
  const map=new Map(Object.entries(initial));
  return {getItem:key=>map.get(key)||null,
    setItem:(key,value)=>map.set(key,String(value)),snapshot:()=>Object.fromEntries(map)};
}
test("Graph Art offers five freely accessible mathematical difficulties in four modes",()=>{
  assert.deepEqual(GRAPH_MYSTERY_LEVELS.map(t=>t.name),
    ["Quick Spark","Step Up","Ink Builder","Brain Stretch","Masterpiece"]);
  assert.deepEqual(GRAPH_MYSTERY_MODES,["fill","build","curve","plot"]);
  for(const mode of GRAPH_MYSTERY_MODES){
    const [core,practice]=galleries(mode);
    assert.equal(core.length,5);
    assert.equal(practice.length,mode==="build"?21:20);
    for(const tier of GRAPH_MYSTERY_LEVELS){
      const pool=graphMysteryPool(mode,tier.step,core,practice);
      assert.equal(pool.length,5,
        mode+" tier "+tier.step);
      assert.ok(pool.every(p=>p.step===tier.step&&p.mode===mode));
      assert.equal(new Set(pool.map(p=>p.id)).size,pool.length);
      if(tier.step===2&&mode!=="build")assert.ok(pool.some(p=>p.practice));
      if(tier.step===1)assert.equal(pool.filter(p=>p.quickSpark).length,4);
      assert.ok(pool.every(p=>p.practiceType!=="reverse"),
        "A reverse-reading challenge must remain an opt-in variation");
    }
  }
});
test("Step Up draws uncompleted art, preferring fresh pictures and keeping Continue separate",()=>{
  const [core,practice]=galleries("fill");
  const pool=graphMysteryPool("fill",2,core,practice);
  assert.equal(pool.length,5);
  const data=new Map(),record=p=>data.get(p.id)||{done:0,line:0};
  assert.equal(graphPickMystery(pool,record,()=>0),pool[0]);
  assert.equal(graphPickMystery(pool,record,()=>.9999),pool[4]);
  data.set(pool[0].id,{done:pool[0].pieces.length,line:0});
  assert.equal(graphPickMystery(pool,record,()=>0),pool[1],
    "The first solved art is not offered again");
  data.set(pool[1].id,{done:0,line:1});
  assert.equal(graphContinueMystery(pool,record),pool[1]);
  assert.equal(graphPickMystery(pool,record,()=>0),pool[2],
    "Unplayed Step Up artwork takes priority over partly finished art");
  for(const p of pool.slice(2))
    data.set(p.id,{done:p.pieces.length,line:0});
  assert.equal(graphPickMystery(pool,record,()=>.9),pool[1],
    "Partially completed art is still eligible if there are no fresh pictures");
  data.set(pool[1].id,{done:pool[1].pieces.length,line:0});
  assert.equal(graphPickMystery(pool,record,()=>0),null);
  assert.equal(graphContinueMystery(pool,record),null);
  assert.equal(graphMysteryStatus(pool,record).remaining,0);
});
test("Saved Plot drafts and partially added Build boundaries qualify for Continue",()=>{
  assert.equal(graphMysteryStarted({done:0,phase:"plot",points:[]}),false);
  assert.equal(graphMysteryStarted({done:0,phase:"plot",points:[{x:1,y:2}]}),true);
  assert.equal(graphMysteryStarted({done:0,phase:"style",points:[]}),true);
  assert.equal(graphMysteryStarted({done:0,verified:[{ruleId:"a"}]}),true);
  assert.equal(graphMysteryStarted({done:0,line:1}),true);
  assert.equal(graphMysteryStarted({done:1,line:0}),true);
  assert.equal(graphMysteryStarted({done:0,line:0}),false);
  assert.equal(graphMysteryStarted(null),false);
  const p={id:"a",pieces:[{},{}]};
  assert.equal(graphMysteryFinished(p,{done:1}),false);
  assert.equal(graphMysteryFinished(p,{done:2}),true);
});
test("Difficulty preferences remain separate from game progress and ignore malformed saves",()=>{
  const storage=fakeStorage({"inequality-ink-graph-art-v2":"old-progress",
    "inequality-ink-curve-fill-v2":"older-progress"});
  assert.deepEqual(readGraphMysteryTiers(storage),{});
  saveGraphMysteryTiers(storage,{fill:4,curve:2,build:5,plot:1,invalid:3});
  assert.deepEqual(readGraphMysteryTiers(storage),{
    fill:4,curve:2,build:5,plot:1});
  assert.equal(storage.getItem("inequality-ink-graph-art-v2"),"old-progress");
  assert.equal(storage.getItem("inequality-ink-curve-fill-v2"),"older-progress");
  assert.ok(storage.getItem(GRAPH_MYSTERY_TIER_SAVE));
  const broken=fakeStorage({[GRAPH_MYSTERY_TIER_SAVE]:"{"});
  assert.deepEqual(readGraphMysteryTiers(broken),{});
  broken.setItem(GRAPH_MYSTERY_TIER_SAVE,JSON.stringify({
    fill:5,build:-4,curve:"2",plot:99}));
  assert.deepEqual(readGraphMysteryTiers(broken),{fill:5});
});
