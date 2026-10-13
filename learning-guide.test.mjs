import test from "node:test";
import assert from "node:assert/strict";
import {pictureSkills,explainRegionChoice} from "./regions/learning-guide.mjs";
import {GRAPH_ART_PICTURES} from "./regions/graph-art-pictures.mjs";
import {CURVE_PICTURES} from "./regions/curve-pictures.mjs";
import {PLOT_PICTURES} from "./regions/plot-pictures.mjs";
import {satisfiesAll} from "./regions/curved-engine.mjs";
import {pointSatisfiesAll} from "./regions/regions-engine.mjs";
import {readFileSync} from "node:fs";

function firstPoint(rules,valid,curved){
  for(let x=-4.5;x<=4.5;x+=.25)for(let y=-4.5;y<=4.5;y+=.25){
    const pass=curved?satisfiesAll(rules,x,y):pointSatisfiesAll(rules,x,y);
    if(pass===valid)return {x,y};
  }
  throw Error("Could not find a test point, valid="+valid);
}
test("Pure explanations use the user's region truth, never artwork masks",()=>{
  const straight=[
    {id:"a",text:"x ≤ 2",a:1,b:0,c:2,inclusive:true},
    {id:"b",text:"y > 0",a:0,b:-1,c:0,inclusive:false}
  ];
  const good=explainRegionChoice(straight,{x:1,y:1});
  assert.equal(good.correct,true);
  assert.match(good.text,/x ≤ 2/);
  assert.match(good.text,/\(true\)/);
  assert.match(good.text,/all 2 inequalities/);
  const bad=explainRegionChoice(straight,{x:3,y:1});
  assert.equal(bad.correct,false);
  assert.match(bad.text,/x ≤ 2/);
  assert.match(bad.text,/\(false\)/);
  assert.equal(explainRegionChoice([], {x:2,y:1}),null);
  assert.equal(explainRegionChoice(straight,{x:NaN,y:1}),null);
});
test("Strictness and reversed linear signs are evaluated, not guessed from text",()=>{
  const rules=[
    {id:"under",text:"y ≥ 1",a:0,b:-1,c:-1,inclusive:true},
    {id:"open",text:"x < 3",a:1,b:0,c:3,inclusive:false}
  ];
  assert.equal(explainRegionChoice(rules,{x:1,y:2}).correct,true);
  assert.equal(explainRegionChoice(rules,{x:4,y:2}).correct,false);
  const phrase=explainRegionChoice(rules,{x:4,y:2}).text;
  assert.match(phrase,/x < 3/);
  assert.match(phrase,/\(false\)/);
});
test("Every original Graph Art picture supports concise mathematical skills",()=>{
  for(const p of GRAPH_ART_PICTURES){
    const skills=pictureSkills(p,p.mode);
    assert.ok(skills.length>0,p.id);
    assert.ok(skills.includes("Coordinate regions"),p.id);
    for(const part of p.pieces){
      const good=explainRegionChoice(part.rules,firstPoint(part.rules,true,false));
      const bad=explainRegionChoice(part.rules,firstPoint(part.rules,false,false));
      assert.equal(good.correct,true,p.id+"/"+part.id);
      assert.equal(bad.correct,false,p.id+"/"+part.id);
      assert.match(good.text,/\(true\)/);
      assert.match(bad.text,/\(false\)/);
    }
  }
});
test("Every curved and plotted region has accurate opt-in reasoning",()=>{
  for(const [mode,pictures] of [["curve",CURVE_PICTURES],["plot",PLOT_PICTURES]]){
    for(const p of pictures){
      const skills=pictureSkills(p,mode);
      assert.ok(skills.length>0,p.id);
      if(mode==="plot")assert.ok(skills.includes("Sketching graphs"));
      for(const part of p.pieces){
        const good=explainRegionChoice(part.rules,firstPoint(part.rules,true,true));
        const bad=explainRegionChoice(part.rules,firstPoint(part.rules,false,true));
        assert.equal(good.correct,true,p.id+"/"+part.id);
        assert.equal(bad.correct,false,p.id+"/"+part.id);
        assert.match(good.text,/\(true\)/);
        assert.match(bad.text,/\(false\)/);
      }
    }
  }
});
test("Phase 4 is opt-in across all modes and never blocks checking",()=>{
  for(const [path,whyId] of [
    ["regions/index.html","graphWhy"],
    ["regions/curve.html","graphWhy"],
    ["regions/plot.html","plotWhy"]
  ]){
    const html=readFileSync(new URL(path,import.meta.url),"utf8");
    assert.match(html,new RegExp('<details id="'+whyId+'"[^>]*hidden'));
    assert.match(html,/<summary>Why this choice\?<\/summary>/);
    assert.match(html,/Give me a hint/);
    assert.match(html,/Check region/);
  }
  const hub=readFileSync(new URL("regions/index.html",import.meta.url),"utf8");
  assert.match(hub,/<details class="graph-learning-route">/);
  assert.match(hub,/Start anywhere/);
  const app=readFileSync(new URL("regions/regions-app.mjs",import.meta.url),"utf8");
  const curve=readFileSync(new URL("regions/curve-art.mjs",import.meta.url),"utf8");
  const plot=readFileSync(new URL("regions/plot-art.mjs",import.meta.url),"utf8");
  for(const [src,id]of [[app,"graphWhy"],[curve,"graphWhy"],[plot,"plotWhy"]]){
    assert.match(src,new RegExp('\\$\\("'+id+'"\\)\\.open=false'));
    assert.match(src,new RegExp('\\$\\("'+id+'"\\)\\.hidden=!why'));
  }
});
