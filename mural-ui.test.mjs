import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {pictureById,PICTURE_LIBRARY,questionCount} from "./picture-engine.mjs";
import {MURAL_GAME_KEY,MURAL_ACHIEVEMENTS_KEY} from "./mural-model.mjs";

// Lightweight DOM exercise of the *real* mural module, not merely a static
// source check: it verifies rendered rewards, navigation and collection updates.
class El{
  constructor(tag="div"){
    this.tagName=tag;this.children=[];this.attrs={};this.listeners=new Map();
    this.dataset={};this.style={};this.textContent="";this.hidden=false;
    this.clientWidth=940;this.scrollWidth=4482;this.scrollLeft=0;
  }
  setAttribute(k,v){
    this.attrs[k]=String(v);
    if(k.startsWith("data-")){
      const camel=k.slice(5).replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());
      this.dataset[camel]=String(v);
    }
  }
  getAttribute(k){return this.attrs[k]??null;}
  removeAttribute(k){delete this.attrs[k];}
  append(...els){for(const e of els){this.children.push(e);e.parent=this;}}
  replaceChildren(...els){this.children=[];this.append(...els);}
  addEventListener(event,fn){
    if(!this.listeners.has(event))this.listeners.set(event,[]);
    this.listeners.get(event).push(fn);
  }
  dispatch(event,data={}){
    for(const fn of this.listeners.get(event)||[])fn(data);
  }
  click(){this.dispatch("click");}
  focus(){this.focused=true;}
  getBoundingClientRect(){return {width:this.tagName==="muralWorld"?4482:940};}
  scrollTo(options){this.scrollLeft=options.left;this.scrollOptions=options;}
  showModal(){this.open=true;}
  close(){this.open=false;}
}
const html=readFileSync(new URL("./mural.html",import.meta.url),"utf8");
const ids=[...new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]))];
const elements=new Map(ids.map(id=>[id,new El(id)]));
const zones=[...html.matchAll(/data-mural-zone="([^"]+)"/g)].map(m=>{
  const el=new El("button");el.setAttribute("data-mural-zone",m[1]);return el;
});
const memory=new Map();
const save={
  getItem:k=>memory.get(k)??null,
  setItem:(k,v)=>memory.set(k,String(v))
};
const shared=PICTURE_LIBRARY.find(p=>p.levels.length>1);
const another=pictureById("mirror-heart-step");
const unplayed=pictureById("mirror-ball-building");
const progress={
  [shared.levels[0]+":"+shared.id]:{completed:true,done:questionCount(shared)},
  [shared.levels[1]+":"+shared.id]:{completed:true,done:questionCount(shared)},
  ["mirror:"+another.id]:{completed:true,done:questionCount(another)},
  ["mirror:"+unplayed.id]:{completed:false,done:questionCount(unplayed)-1}
};
save.setItem(MURAL_GAME_KEY,JSON.stringify({progress}));
globalThis.document={
  getElementById:id=>elements.get(id)||null,
  createElementNS:(_ns,tag)=>new El(tag),
  querySelectorAll:selector=>selector==="[data-mural-zone]"?zones:[],
  addEventListener:()=>{},
  hidden:false
};
const windowListeners=new Map();
globalThis.window={
  localStorage:save,location:{search:""},
  matchMedia:()=>({matches:true}),
  addEventListener:(event,fn)=>windowListeners.set(event,fn)
};
globalThis.requestAnimationFrame=fn=>fn();
const $=id=>elements.get(id);
const mod=await import("./mural.mjs?ui-regression");

test("The live renderer mounts only completed and deduplicated picture objects",()=>{
  assert.equal($("muralCount").textContent,"2");
  assert.equal($("muralTotal").textContent,"125");
  assert.equal($("muralEmpty").hidden,true);
  assert.equal($("muralItems").children.length,2);
  const ids=$("muralItems").children.map(c=>c.getAttribute("data-picture-id")).sort();
  assert.deepEqual(ids,[shared.id,another.id].sort());
  assert.ok(!ids.includes(unplayed.id));
  for(const g of $("muralItems").children){
    assert.equal(g.getAttribute("role"),"button");
    assert.equal(g.getAttribute("tabindex"),"0");
    const sprite=g.children.find(c=>c.getAttribute("class")==="mural-sprite");
    assert.ok(sprite.children.every(c=>c.tagName==="path"),
      "Only transparent coloured artwork paths, never background frames");
  }
});
test("Tapping and keyboard activation open the correct discovered art and game link",()=>{
  const first=$("muralItems").children[0],id=first.getAttribute("data-picture-id");
  first.click();
  assert.equal($("muralDetails").open,true);
  assert.equal($("muralPictureName").textContent,pictureById(id).name);
  assert.equal($("muralDetailArt").children.length>0,true);
  assert.ok($("muralReplay").href.includes("muralPicture="+encodeURIComponent(id)));
  $("muralClose").click();assert.equal($("muralDetails").open,false);
  first.dispatch("keydown",{key:"Enter",preventDefault(){}});
  assert.equal($("muralDetails").open,true);
  $("muralDone").click();assert.equal($("muralDetails").open,false);
  assert.ok(mod.replayUrlFor(shared,"not-a-mode").includes(
    "muralMode="+encodeURIComponent(shared.levels[0])));
});
test("Region navigation scrolls horizontally without moving the pictures",()=>{
  const before=$("muralItems").children.map(g=>g.getAttribute("transform"));
  zones[4].click();
  assert.ok($("muralViewport").scrollLeft>0);
  $("muralViewport").dispatch("scroll");
  assert.equal(zones[4].getAttribute("aria-current"),"true");
  assert.deepEqual($("muralItems").children.map(g=>g.getAttribute("transform")),before);
});
test("New completions join the same world; game replay never removes older rewards",()=>{
  progress["mirror:"+unplayed.id]={completed:true,done:questionCount(unplayed)};
  save.setItem(MURAL_GAME_KEY,JSON.stringify({progress}));
  windowListeners.get("storage")();
  assert.equal($("muralCount").textContent,"3");
  assert.equal($("muralItems").children.length,3);
  const achieved=JSON.parse(save.getItem(MURAL_ACHIEVEMENTS_KEY));
  assert.ok(achieved.ids.includes(unplayed.id));
  progress["mirror:"+another.id]={completed:false,done:0};
  save.setItem(MURAL_GAME_KEY,JSON.stringify({progress}));
  windowListeners.get("storage")();
  assert.equal($("muralCount").textContent,"3");
  assert.equal($("muralItems").children.length,3);
});
