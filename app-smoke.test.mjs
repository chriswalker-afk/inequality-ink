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
  removeAttribute(name){delete this.attrs[name];}
  hasAttribute(name){return Object.hasOwn(this.attrs,name);}
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
  setPointerCapture(id){this.capturedPointerId=id;}
  releasePointerCapture(id){if(this.capturedPointerId===id)this.capturedPointerId=null;}
  createSVGPoint(){
    return {x:0,y:0,matrixTransform(){return {x:this.x,y:this.y};}};
  }
  getScreenCTM(){return {inverse(){return {};}};}
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
// Model iPhone Safari's inconsistent support for SVGElement.hidden:
// assigning the property may be ignored even though the SVG retains its
// literal hidden attribute. Code must call removeAttribute("hidden").
const finalSvg=elements.get("revealFinalArt");
finalSvg.setAttribute("hidden","");
Object.defineProperty(finalSvg,"hidden",{
  get(){return this.hasAttribute("hidden");},
  set(_value){ /* deliberate no-op like WebKit on an SVG element */ }
});
const levels=["mirror","full","solve","mixed"].map(id=>{
  const el=new FakeElement("button");el.dataset.level=id;return el;
});
const directions=["left","between","right"].map(id=>{
  const el=new FakeElement("button");el.dataset.direction=id;return el;
});
globalThis.document={
  body:new FakeElement("body"),
  activeElement:null,
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
  // Intercept only the short automatic row-transition timer. The test
  // proves that a single Check & paint press moves to the next question.
  const nativeSetTimeout=globalThis.setTimeout;
  let advance=null;
  globalThis.setTimeout=(fn,delay)=>{
    if(delay===340||delay===820){advance=fn;return -913;}
    return nativeSetTimeout(fn,delay);
  };
  try{
    $("checkButton").click();
    assert.ok($("feedback").className.includes("success"),
      picture.id+" "+level+" row "+index+" did not mark correctly: "+
      $("feedback").textContent);
    assert.equal($("checkButton").disabled,true);
    assert.ok($("checkButton").textContent.includes("Correct"));
    assert.ok(advance,"A correct answer must schedule the next row");
    assert.equal($("nextButton"),undefined,"There must be no second Next button");
    assert.equal($("progressText").textContent,
      (index+1)+" of "+questionCount(picture));
    advance();
  }finally{
    globalThis.setTimeout=nativeSetTimeout;
  }
}
function select(level,index){
  const button=levels.find(el=>el.dataset.level===level);
  button.click();
  const options=$("picturePicker").children;
  assert.equal(options.length,level==="mirror"?4:5,
    "Each difficulty should list all of its available mystery pictures");
  options[index].click();
}
function complete(level,index,id,{animated=false}={}){
  select(level,index);
  const picture=pictureById(id);
  $("skipTutorialButton").click();
  assert.equal($("playScreen").hidden,false);
  const normalMatchMedia=globalThis.window.matchMedia;
  if(animated)globalThis.window.matchMedia=()=>({matches:false});
  for(let q=0;q<questionCount(picture);q++){
    answerCurrent(picture,q,level);
    assert.equal($("progressText").textContent,(q+1)+" of "+questionCount(picture));
  }
  assert.equal($("revealDialog").open,true,
    "Completing the last question should open the celebration");
  assert.equal($("finishScreen").hidden,true,
    "Results must remain hidden while artwork is being revealed");
  assert.equal($("revealBoard").getBoundingClientRect().width>0,true);
  assert.equal($("revealFinalArt").querySelectorAll("[data-detail-stage]").length,
    picture.detailStages.length);
  if(animated){
    assert.equal($("revealFinalArt").hasAttribute("hidden"),true,
      "An uncoloured animation must initially hide the finished SVG");
    assert.equal($("revealBuildLayer").hidden,false,
      "The non-reduced-motion animation should start with ink rows");
    assert.equal($("revealFinalArt").hidden,true,
      "Full colour must not appear before the rows");
    $("skipReveal").click();
    assert.equal($("revealFinalArt").hidden,false);
    assert.equal($("revealFinalArt").hasAttribute("hidden"),false,
      "Skipping to the final picture must remove the SVG hidden attribute");
    assert.equal($("revealRowCount").textContent,"");
    assert.equal($("finishScreen").hidden,true,
      "Skipping animation must not skip the X-to-results step");
  }else{
    assert.equal($("revealFinalArt").hidden,false,
      "Reduced-motion students should see the finished art immediately");
  }
  assert.equal($("revealFinalArt").hasAttribute("hidden"),false,
    "Completed colour picture MUST remove the SVG hidden attribute, including on iOS");
  assert.equal($("revealFinalArt").getAttribute("aria-hidden"),"false");
  assert.equal($("skipReveal").hidden,true,
    "Show-finished-picture control disappears when artwork is fully revealed");
  $("closeReveal").click();
  globalThis.window.matchMedia=normalMatchMedia;
  assert.equal($("revealDialog").open,false);
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
  complete("full",2,"flower-pot",{animated:true});
  complete("full",0,"mushroom-mystery",{animated:true});
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


test("The live animation reveals row-by-row, then reflection, colour, and details in order",()=>{
  select("mirror",2); // Coral Crab was completed in the earlier play-through.
  const picture=pictureById("coral-crab");
  const originalMatchMedia=globalThis.window.matchMedia;
  const originalSetTimeout=globalThis.setTimeout;
  const originalClearTimeout=globalThis.clearTimeout;
  let serial=0;
  const queue=[];
  const cancelled=new Set();
  globalThis.window.matchMedia=()=>({matches:false});
  globalThis.setTimeout=(fn,delay=0)=>{
    const item={id:++serial,fn,delay};queue.push(item);return item.id;
  };
  globalThis.clearTimeout=id=>cancelled.add(id);
  try{
    $("startButton").click(); // An already completed picture reopens its reveal.
    assert.equal($("revealDialog").open,true);
    assert.equal($("finishScreen").hidden,true);
    const rows=$("revealBuildArt").children.filter(child=>child.tagName==="g");
    assert.equal(rows.length,questionCount(picture));
    assert.ok(rows.every(row=>row.getAttribute("opacity")==="0"),
      "Every ink row should begin invisible");
    const phase=(key)=>queue.find(item=>!cancelled.has(item.id)&&item.fn.toString().includes(key));
    const first=queue.find(item=>item.delay===370);
    assert.ok(first,"First ink row has its own animation step");
    first.fn();
    assert.equal(rows[0].getAttribute("opacity"),"1");
    assert.equal(rows[1].getAttribute("opacity"),"0",
      "Ink must build one row at a time");
    const sorted=queue.filter(item=>item.id!==first.id)
      .sort((a,b)=>a.delay-b.delay||a.id-b.id);
    let sawFold=false,sawColour=false,sawDetails=false;
    for(const item of sorted){
      if(cancelled.has(item.id))continue;
      item.fn();
      if($("revealMirrorLayer").classList.contains("is-unfolding")){
        sawFold=true;
        assert.ok(rows.every(row=>row.getAttribute("opacity")==="1"),
          "Reflection must wait for all monochrome rows");
      }
      if($("revealBoard").classList.contains("has-colour")){
        sawColour=true;
        assert.ok(sawFold,"Mirror Mode must reflect before colour");
        assert.equal($("revealFinalArt").hasAttribute("hidden"),false,
          "Colour SVG must be unhidden through its actual attribute");
      }
      if($("revealFinalArt").querySelectorAll("[data-detail-stage]")
        .some(group=>group.getAttribute("opacity")==="1")){
        sawDetails=true;
        assert.ok(sawColour,"Details must appear after the colour layer");
      }
    }
    assert.ok(sawFold&&sawColour&&sawDetails);
    assert.equal($("revealBuildLayer").hidden,true,
      "Monochrome artwork must retire when colour finishes fading in");
    assert.equal($("revealMirrorLayer").hidden,true);
    assert.equal($("revealFinalArt").hasAttribute("hidden"),false);
    assert.equal($("revealFinalArt").getAttribute("aria-hidden"),"false");
    assert.equal($("revealHeading").textContent,picture.name+"!");
    assert.equal($("finishScreen").hidden,true,
      "The summary must stay hidden even after the completed animation");
    $("closeReveal").click();
    assert.equal($("revealDialog").open,false);
    assert.equal($("finishScreen").hidden,false);
  }finally{
    globalThis.window.matchMedia=originalMatchMedia;
    globalThis.setTimeout=originalSetTimeout;
    globalThis.clearTimeout=originalClearTimeout;
  }
});


function svgEndpoint(side){
  const nodes=[];
  const walk=node=>{
    if(node.getAttribute?.("data-endpoint")===side)nodes.push(node);
    for(const child of node.children||[])walk(child);
  };
  walk($("drawLine"));
  assert.equal(nodes.length,1,"Expected exactly one visible "+side+" endpoint");
  return nodes[0];
}
function pointer(kind,side,pointerId,startX,endX,{y=66,button=0}={}){
  const svg=$("drawLine"),target=svgEndpoint(side);
  const pointerType=kind==="tap"?"touch":"mouse";
  const gesture={
    pointerId,pointerType,button,clientX:startX,clientY:y,
    preventDefault(){this.prevented=true;}
  };
  for(const fn of target.listeners.get("pointerdown")||[])fn(gesture);
  if(kind==="drag"){
    const movement={...gesture,clientX:endX};
    for(const fn of svg.listeners.get("pointermove")||[])fn(movement);
  }
  for(const fn of svg.listeners.get("pointerup")||[])
    fn({...gesture,clientX:endX});
}
test("Single mouse click and quick mobile tap toggle open/closed without moving the endpoint",()=>{
  select("mirror",0); // Unplayed original Cat Cameo, uses a one-sided tutorial.
  $("startButton").click();
  assert.equal($("playScreen").hidden,false);
  assert.equal($("leftOpen").classList.contains("selected"),true);
  const initialValue=Number($("leftValue").value);
  pointer("click","left",101,330,330);
  assert.equal($("leftClosed").classList.contains("selected"),true,
    "One left-click should produce a filled circle");
  assert.equal(Number($("leftValue").value),initialValue,
    "Clicking the circle must not move it");
  pointer("tap","left",102,330,332);
  assert.equal($("leftOpen").classList.contains("selected"),true,
    "A mobile tap should make the circle open again");
  assert.equal(Number($("leftValue").value),initialValue);
  // Right mouse clicks must NOT toggle a mathematical endpoint.
  pointer("click","left",103,330,330,{button:2});
  assert.equal($("leftOpen").classList.contains("selected"),true);
  const endpoint=svgEndpoint("left");
  assert.equal(endpoint.getAttribute("role"),"button");
  assert.equal(endpoint.getAttribute("tabindex"),"0");
  assert.ok(endpoint.getAttribute("aria-label").includes("toggle"));
});
test("Dragging a circle still moves the endpoint but never toggles its inclusion",()=>{
  const before=Number($("leftValue").value);
  const closedBefore=$("leftClosed").classList.contains("selected");
  pointer("drag","left",201,330,390);
  assert.notEqual(Number($("leftValue").value),before,
    "Dragging should move the numerical endpoint");
  assert.equal($("leftClosed").classList.contains("selected"),closedBefore,
    "Dragging should not change open versus closed");
  const keyEvent={key:"Enter",repeat:false,preventDefault(){}};
  for(const fn of svgEndpoint("left").listeners.get("keydown")||[])fn(keyEvent);
  assert.equal($("leftClosed").classList.contains("selected"),!closedBefore,
    "Keyboard Enter should toggle the circle");
  $("changeLevelButton").click();
});
test("Incorrect checks never auto-advance, and pending timers are cancelled on navigation",()=>{
  select("full",0); // Unplayed mushroom, first tutorial asks for x >= -2.
  $("startButton").click();
  const nativeSetTimeout=globalThis.setTimeout;
  const nativeClearTimeout=globalThis.clearTimeout;
  let advance=null,cancelled=null;
  globalThis.setTimeout=(fn,delay)=>{
    if(delay===340||delay===820){advance=fn;return -920;}
    return nativeSetTimeout(fn,delay);
  };
  globalThis.clearTimeout=id=>{
    if(id===-920){cancelled=id;return;}
    return nativeClearTimeout(id);
  };
  try{
    $("checkButton").click(); // Default interval is wrong.
    assert.equal(advance,null,"Incorrect answer must not schedule navigation");
    assert.equal($("checkButton").disabled,false);
    const answer=$("leftValue"); // Fill a correct one-sided tutorial ray.
    // Use the normal direction/endpoint/circle controls.
    directions.find(d=>d.dataset.direction==="right").click();
    answer.value="-2";answer.change();
    $("leftClosed").click();
    $("checkButton").click();
    assert.ok(advance,"Correct answer should schedule auto-advance");
    $("changeLevelButton").click();
    assert.equal(cancelled,-920,"Leaving the activity must cancel queued advancement");
    advance();
    assert.equal($("introScreen").hidden,false,
      "Stale auto-advance callback must not reopen a game");
  }finally{
    globalThis.setTimeout=nativeSetTimeout;
    globalThis.clearTimeout=nativeClearTimeout;
  }
});
