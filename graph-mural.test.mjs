import test from "node:test";
import assert from "node:assert/strict";
import {
  GRAPH_MURAL_PICTURES,GRAPH_MURAL_ZONES,GRAPH_MURAL_ACHIEVEMENTS_KEY,
  graphMuralPlacements,graphMuralDiscoveredIds,rememberGraphMuralDiscoveries,
  graphMuralReplayUrl,graphMuralEntry
} from "./regions/graph-mural-model.mjs";
function memory(seed={}){
  const values=new Map(Object.entries(seed));
  return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
}
const entry=(mode,step=1)=>GRAPH_MURAL_PICTURES.find(e=>e.mode===mode&&e.step===step);
test("Graph Art mural uses stable five-zone slots for every original and extra picture",()=>{
  assert.equal(GRAPH_MURAL_ZONES.length,5);
  const keys=GRAPH_MURAL_PICTURES.map(p=>p.key);
  assert.equal(new Set(keys).size,keys.length);
  const places=graphMuralPlacements();
  assert.equal(places.size,keys.length);
  for(const e of GRAPH_MURAL_PICTURES){
    const p=places.get(e.key);
    assert.ok(p,"Missing location for "+e.key);
    assert.equal(p.step,e.step);
    assert.ok(p.x>=GRAPH_MURAL_ZONES[e.step-1].x);
  }
});
test("Only truly completed artwork is discovered across all four modes",()=>{
  const [fill,build,curve,plot]=["fill","build","curve","plot"].map(m=>entry(m));
  const store=memory({
    "inequality-ink-graph-art-v2":JSON.stringify({records:{
      [fill.key]:{done:fill.picture.pieces.length,line:0,replays:0},
      [build.key]:{done:1,line:0,replays:0}
    }}),
    "inequality-ink-curve-fill-v2":JSON.stringify({records:{
      [curve.picture.id]:{done:curve.picture.pieces.length,replays:0}
    }}),
    "inequality-ink-plot-shade-v2":JSON.stringify({records:{
      [plot.picture.id]:{done:plot.picture.pieces.length-1,replays:0}
    }})
  });
  const done=graphMuralDiscoveredIds(store);
  assert.ok(done.has(fill.key));
  assert.ok(done.has(curve.key));
  assert.ok(!done.has(build.key));
  assert.ok(!done.has(plot.key));
  const archived=rememberGraphMuralDiscoveries(store);
  assert.equal(archived.size,2);
  assert.ok(JSON.parse(store.getItem(GRAPH_MURAL_ACHIEVEMENTS_KEY)).ids.includes(fill.key));
  store.setItem("inequality-ink-graph-art-v2",JSON.stringify({records:{}}));
  assert.ok(graphMuralDiscoveredIds(store).has(fill.key),"Restart must preserve discovery");
});
test("Graph mural supports legacy originals and valid direct replay links",()=>{
  const fill=entry("fill"),curve=graphMuralEntry("curve:parabola-butterfly"),
    plot=graphMuralEntry("plot:little-umbrella");
  assert.ok(curve&&plot&&fill);
  const store=memory({
    "inequality-ink-curve-fill-prototype-v1":JSON.stringify({done:curve.picture.pieces.length}),
    "inequality-ink-plot-shade-prototype-v1":JSON.stringify({done:plot.picture.pieces.length}),
    "inequality-ink-graph-art-v1":JSON.stringify({done:5})
  });
  const finished=graphMuralDiscoveredIds(store);
  assert.ok(finished.has(curve.key));
  assert.ok(finished.has(plot.key));
  assert.ok(finished.has("build:aurora-crystal"));
  for(const m of ["fill","build","curve","plot"]){
    const e=entry(m);
    const url=graphMuralReplayUrl(e);
    assert.ok(url.includes("picture="+encodeURIComponent(e.picture.id)));
    assert.ok(url.includes(m==="curve"?"curve.html":m==="plot"?"plot.html":"mode="+m));
  }
});
