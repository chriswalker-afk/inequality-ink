import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {HOW_TO_PLAY_GUIDES} from "./help/how-to-play.mjs";

const required=["mirror","full","solve","mixed","paint","quadratic","find","build","reverse","curve","plot"];

test("Every Inequality Ink mode has its own full help guide",()=>{
  assert.deepEqual(Object.keys(HOW_TO_PLAY_GUIDES).sort(),required.slice().sort());
  for(const mode of required){
    const guide=HOW_TO_PLAY_GUIDES[mode];
    assert.ok(guide.title&&guide.subtitle&&guide.example,mode);
    assert.equal(guide.steps.length,3,mode+" should have three steps");
    for(const tab of ["steps","maths","controls"]){
      assert.ok(guide[tab].length>=2,mode+" must explain "+tab);
      for(const [title,body] of guide[tab]){
        assert.ok(typeof title==="string"&&title.length>3,mode+" heading");
        assert.ok(typeof body==="string"&&body.length>15,mode+" content");
      }
    }
  }
});

test("Both studios and every Graph Art page use shared, accessible help",()=>{
  for(const path of ["index.html","regions/index.html","regions/curve.html","regions/plot.html"]){
    const html=readFileSync(new URL(path,import.meta.url),"utf8");
    assert.match(html,/data-how-to-play/,path+" has help action");
    assert.match(html,/how-to-play\.mjs/,path+" loads common interaction");
    assert.match(html,/how-to-play\.css/,path+" loads common styling");
    assert.match(html,/>How to play </,path+" uses consistent title");
    assert.doesNotMatch(html,/href="#how-(?:plot|graph-art)-works"/,path+" cannot link to a hidden help section");
  }
  const pixel=readFileSync(new URL("index.html",import.meta.url),"utf8");
  assert.doesNotMatch(pixel,/id="helpDialog"/,"Legacy Pixel Art dialog has been removed");
});

test("The site retains accessible in-game help beside the unified guide",()=>{
  const pageAndHelp=[
    ["index.html","id=\"hintButton\""],
    ["regions/index.html","id=\"graphHint\""],
    ["regions/curve.html","id=\"graphHint\""],
    ["regions/plot.html","id=\"plotHint\""]
  ];
  for(const [path,marker] of pageAndHelp){
    assert.ok(readFileSync(new URL(path,import.meta.url),"utf8").includes(marker),path);
  }
  assert.match(readFileSync(new URL("help/how-to-play.mjs",import.meta.url),"utf8"),/aria-selected/);
  assert.match(readFileSync(new URL("help/how-to-play.mjs",import.meta.url),"utf8"),/showModal/);
});
