import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {identicalSolution} from "./model.mjs";
import {pictureById,makePictureQuestion,questionCount} from "./picture-engine.mjs";

// Dependency-free miniature DOM for exercising the actual app module in Node.
// This is not a visual browser test, but it catches broken wiring, navigation,
// missing controls, and save-key collisions during complete student play-throughs.
class FakeElement {
  constructor(tag="div"){
    this.tagName=tag;this.children=[];this.attrs={};this.dataset={};
    this.listeners=new Map();this.style={};this.classNames=new Set();
    this.hidden=false;this.disabled=false;this.value="";this.textContent="";
    this.firstChild={textContent:""}; // minimal parsed title text node
    this.innerHTML="";this.className="";
    this.classList={
      add:(...items)=>items.forEach(name=>this.classNames.add(name)),
      remove:(...items)=>items.forEach(name=>this.classNames.delete(name)),
      toggle:(name,value)=>{
        const chosen=value===undefined?!this.classNames.has(name):value;
        chosen?this.classNames.add(name):this.classNames.delete(name);
        return chosen;
      },
      contains:name=>this.classNames.has(name)
    };
  }
  setAttribute(name,value){this.attrs[name]=String(value);}
  getAttribute(name){return this.attrs[name]??null;}
  append(...els){for(const el of els)if(el){this.children.push(el);el.parentElement=this;}}
  replaceChildren(...els){this.children=[];this.append(...els);}
  addEventListener(name,fn){
    if(!this.listeners.has(name))this.listeners.set(name,[]);
    this.listeners.get(name).push(fn);
  }
  click(){
    if(this.disabled)return;
    this.onclick?.();
    for(const listener of this.listeners.get("click")||[])listener();
  }
  change(){this.onchange?.(this.value);}
  focus(){}
  showModal(){this.open=true;}
  close(){this.open=false;}
  getBoundingClientRect(){return {width:300,height:250};}
  querySelector(selector){
    if(selector===".cat-flip-panels")return new FakeElement("div");
    return this.querySelectorAll(selector)[0]||null;
  }
  querySelectorAll(selector){
    if(selector==="[data-detail-stage]"){
      const found=[],walk=element=>{
        if(element.getAttribute("data-detail-stage"))found.push(element);
        for(const child of element.children)walk(child);
      };walk(this);
      return found;
    }
    return [];
  }
}
const html=readFileSync(new URL("./index.html",import.meta.url),"utf8");
const ids=[...new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]))];
const elements=new Map(ids.map(id=>[id,new FakeElement(id)]));
const levels=["mirror","full","solve","mixed"].map(id=>{
  const el=new FakeElement("button");el.dataset.level=id;return el;
});
const directions=["left","between","right"].map(id=>{
  const el=new FakeElement("button");el.dataset.direction=id;return el;
});
globalThis.document={
  getElementById:id=>{
    if(!elements.has(id))throw Error("Missing interface element "+id);
    return elements.get(id);
  },
  createElement:tag=>new FakeElement(tag),
  createElementNS:(_ns,tag)=>new FakeElement(tag),
  querySelectorAll:selector=>{
    if(selector==="[data-level]")return levels;
    if(selector==="[data-direction]")return directions;
    return [];
  },
  querySelector:selector=>{
    if(selector==='[data-direction="between"]')return directions[1];
    return null;
  }
};
globalThis.window={scrollTo(){},matchMedia(){return {matches:true};}};
globalThis.localStorage={
  state:new Map(),
  getItem(key){return this.state.has(key)?this.state.get(key):null;},
  setItem(key,value){this.state.set(key,value);}
};
globalThis.confirm=()=>true;
const $=id=>elements.get(id);

await import("./app.mjs?smoke");

function answerCurrent(picture,index,level,replay=0){
  const question=makePictureQuestion(picture,index,replay,level);
  assert.ok(question,"No question "+index);
  if(question.mode==="read"){
    const indexOfCorrect=question.options.findIndex(option=>
      identicalSolution(option.value,question.answer));
    assert.ok(indexOfCorrect>=0);
    const option=$("readOptions").children[indexOfCorrect];
    assert.ok(option,"Missing multiple-choice option");
    option.click();
  }else{
    const solution=question.answer;
    const direction=directions.find(d=>d.dataset.direction===solution.direction);
    assert.ok(direction);
    direction.click();
    if(solution.direction==="between"){
      $("leftValue").value=String(solution.lower);
      $("leftValue").change();
      $("rightValue").value=String(solution.upper);
      $("rightValue").change();
      $(solution.lowerIncluded?"leftClosed":"leftOpen").click();
      $(solution.upperIncluded?"rightClosed":"rightOpen").click();
    }else{
      $("leftValue").value=String(solution.at);
      $("leftValue").change();
      $(solution.included?"leftClosed":"leftOpen").click();
    }
  }
  $("checkButton").click();
  assert.ok($("feedback").className.includes("success"),
    picture.id+" "+level+" row "+index+" did not mark correctly: "+
    $("feedback").textContent);
  assert.ok($("nextButton").hidden===false);
}
function select(level,index){
  const button=levels.find(el=>el.dataset.level===level);
  button.click();
  const options=$("picturePicker").children;
  assert.equal(options.length,level==="mirror"?4:5,
    "Each difficulty should list all of its available mystery pictures");
  options[index].click();
}
function complete(level,index,id){
  select(level,index);
  const picture=pictureById(id);
  $("skipTutorialButton").click();
  assert.equal($("playScreen").hidden,false);
  for(let q=0;q<questionCount(picture);q++){
    answerCurrent(picture,q,level);
    assert.equal($("progressText").textContent,(q+1)+" of "+questionCount(picture));
    $("nextButton").click();
  }
  assert.equal($("finishScreen").hidden,false);
  assert.ok($("finishTitle").textContent.includes(picture.name),
    "Wrong picture was revealed");
  assert.equal($("firstTryStat").textContent,questionCount(picture)+
    "/"+questionCount(picture));
  assert.equal($("finishedArt").getAttribute("viewBox"),
    "0 0 "+(picture.family==="half"?
      (picture.window.max-picture.window.min)*2:
      (picture.window.max-picture.window.min))+" "+picture.height);
  assert.equal($("finishedArt").querySelectorAll("[data-detail-stage]").length,
    picture.detailStages.length);
  $("chooseLevelButton").click();
  assert.equal($("introScreen").hidden,false);
}

test("Student can complete seven distinct picture/difficulty journeys independently",()=>{
  assert.equal($("picturePicker").children.length,4);
  complete("mirror",1,"heart-glow");
  complete("solve",1,"rocket-launch");
  // Five new picture definitions must work end-to-end, including read,
  // draw and solve questions, the final art reveal, and independent saves.
  complete("mirror",2,"coral-crab");
  complete("mirror",3,"twilight-owl");
  complete("full",2,"flower-pot");
  complete("solve",3,"enchanted-potion");
  complete("mixed",4,"ice-cream-treat");
  select("mirror",1);
  assert.ok($("levelProgress").textContent.includes("complete"),
    "Switching pictures lost heart progress");
  select("mirror",0);
  assert.ok($("levelProgress").textContent.includes("Ready"),
    "The original cat incorrectly inherited the heart's progress");
  select("solve",1);
  assert.ok($("levelProgress").textContent.includes("complete"));
  const saved=JSON.parse(globalThis.localStorage.getItem("inequality-ink-v5"));
  assert.ok(saved.progress["mirror:heart-glow"].completed);
  assert.ok(saved.progress["solve:rocket-launch"].completed);
  for(const key of [
    "mirror:coral-crab","mirror:twilight-owl","full:flower-pot",
    "solve:enchanted-potion","mixed:ice-cream-treat"
  ])assert.ok(saved.progress[key]?.completed,"Missing saved completion: "+key);
  assert.ok(!saved.progress["mirror:cat-cameo"]?.completed);
});

test("Previously completed progress is not overwritten by visiting another level",()=>{
  select("full",0);
  const saved=JSON.parse(globalThis.localStorage.getItem("inequality-ink-v5"));
  assert.equal(saved.progress["mirror:heart-glow"].done,14);
  assert.equal(saved.progress["solve:rocket-launch"].done,14);
  assert.equal(saved.progress["mirror:coral-crab"].done,14);
  assert.equal(saved.progress["mirror:twilight-owl"].done,14);
  assert.equal(saved.progress["full:flower-pot"].done,14);
  assert.equal(saved.progress["solve:enchanted-potion"].done,14);
  assert.equal(saved.progress["mixed:ice-cream-treat"].done,14);
  assert.equal(saved.selectedPictures.full,"mushroom-mystery");
});
