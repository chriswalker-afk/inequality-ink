import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {identicalSolution} from "./model.mjs";
import {pictureById,pictureWidth,makePictureQuestion,questionCount,picturePaintedValues} from "./picture-engine.mjs";
import {paintTarget,makePaintQuestion} from "./paint-engine.mjs";
import {QUEST_QUESTIONS,QUEST_SAVE_KEY,quadraticAnswer} from "./quadratic-quest.mjs";

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
  change(){
    this.onchange?.(this.value);
    for(const listener of this.listeners.get("change")||[])listener({target:this});
  }
  focus(){}
  blur(){}
  setSelectionRange(start,end){this.selectionStart=start;this.selectionEnd=end;}
  contains(node){for(let next=node;next;next=next.parentElement)if(next===this)return true;return false;}
  showModal(){this.open=true;}
  close(){this.open=false;}
  getBoundingClientRect(){return {width:300,height:250};}
  setPointerCapture(id){this.capturedPointerId=id;}
  releasePointerCapture(id){if(this.capturedPointerId===id)this.capturedPointerId=null;}
  createSVGPoint(){
    return {x:0,y:0,matrixTransform(){return {x:this.x,y:this.y};}};
  }
  getScreenCTM(){return {inverse(){return {};}};}
  closest(selector){
    if(selector==="[data-math-key]"&&this.dataset.mathKey)return this;
    return selector===".paint-cell"&&this.className.includes("paint-cell")?this:null;
  }
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
const levels=["mirror","full","solve","mixed","paint"].map(id=>{
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
const LEGACY_ORDER={
 mirror:["cat-cameo","heart-glow","coral-crab","twilight-owl"],
 full:["mushroom-mystery","rocket-launch","flower-pot",
   "enchanted-potion","ice-cream-treat"],
 solve:["mushroom-mystery","rocket-launch","flower-pot",
   "enchanted-potion","ice-cream-treat"],
 mixed:["mushroom-mystery","rocket-launch","flower-pot",
   "enchanted-potion","ice-cream-treat"],
 paint:["paint-rocket","paint-flower","paint-robot"]
};
function select(level,index){
 const button=levels.find(el=>el.dataset.level===level);
 button.click();
 const options=$("picturePicker").children;
 assert.equal(options.length,5,"Every mode must present five ordered steps");
 const id=LEGACY_ORDER[level][index],picture=pictureById(id);
 const all=[...options,...$("extraPicturePicker").children];
 const card=all.find(el=>el.children[1]?.children[0]?.textContent===picture.clue);
 assert.ok(card,"Legacy picture not accessible after progression: "+id);
 card.click();
}
function selectStage(level,stage){
 const button=levels.find(el=>el.dataset.level===level);
 button.click();
 assert.equal($("picturePicker").children.length,5);
 $("picturePicker").children[stage-1].click();
}
function complete(level,index,id,{animated=false}={}){
  select(level,index);
  const picture=pictureById(id);
  $("startButton").click();
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

test("Choose a picture shows five quick-win steps with accurate row and colour counts",()=>{
 for(const level of ["mirror","full","solve","mixed","paint"]){
   selectStage(level,1);
   const first=$("picturePicker").children[0];
   const expected=pictureById(level==="mirror"?"mirror-star-starter":
     level==="paint"?"paint-heart-starter":"full-star-starter");
   const heading=first.children[1].children[0].textContent;
   const description=first.children[1].children[1].textContent;
   const meta=first.children[1].children[2].textContent;
   assert.equal(heading,expected.clue);
   assert.ok(first.getAttribute("aria-label").startsWith(expected.clue+", "));
   assert.ok(![heading,description,meta].join(" ").includes(expected.name));
   assert.ok(meta.includes("6 rows"));
   assert.ok(meta.includes("Starter"));
   if(level==="paint")assert.ok(meta.includes("2 colours"));
   assert.equal($("pictureStepTrack").children.length,5);
   assert.ok($("picturePathProgress").textContent.includes("0 of 5"));
   assert.ok($("pictureSummary").textContent.includes("Quick win"));
   const legacy=LEGACY_ORDER[level];
   assert.equal($("extraPicturePicker").children.length,
     level==="mirror"?3:level==="paint"?2:4);
   for(const id of legacy){
     const pic=pictureById(id);
     const selectable=[...$("picturePicker").children,
       ...$("extraPicturePicker").children];
     assert.ok(selectable.some(card=>
       card.children[1]?.children[0]?.textContent===pic.clue));
   }
 }
 select("mirror",0);
});
test("Student can complete seven distinct picture/difficulty journeys independently",()=>{
  assert.equal($("picturePicker").children.length,5);
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
  const finishedHeart=$("extraPicturePicker").children.find(card=>
    card.children[1]?.children[0]?.textContent===pictureById("heart-glow").clue);
  assert.equal(finishedHeart.children[1].children[0].textContent,
    pictureById("heart-glow").clue);
  assert.equal(finishedHeart.children[1].children[1].textContent,
    pictureById("heart-glow").name+" — completed");
  assert.ok(finishedHeart.getAttribute("aria-label")
    .includes(pictureById("heart-glow").name+" completed"));
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
  select("mirror",0); // Optional practice provides a drawing question.
  $("practiceButton").click();
  assert.equal($("questionStep").textContent,"PRACTICE 1 OF 2");
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
  select("full",1); // Unplayed Rocket in Full mode starts with real picture work.
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
    const first=makePictureQuestion(pictureById("rocket-launch"),0,0,"full");
    assert.equal(first.mode,"read");
    assert.equal($("questionStep").textContent,"ROW 1 OF 14");
    const correct=first.options.findIndex(option=>
      identicalSolution(option.value,first.answer));
    $("readOptions").children[correct].click();
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


test("iPhone-style SVG visibility lets the Mushroom Mystery reveal show its actual colours and details",()=>{
  select("full",0); // Completed mushroom, the picture in the reported screenshot.
  const picture=pictureById("mushroom-mystery");
  const originalMatchMedia=globalThis.window.matchMedia;
  const originalSetTimeout=globalThis.setTimeout;
  const originalClearTimeout=globalThis.clearTimeout;
  const queue=[];let serial=0;
  const cancelled=new Set();
  globalThis.window.matchMedia=()=>({matches:false});
  globalThis.setTimeout=(fn,delay=0)=>{
    const timer={id:++serial,delay,fn};queue.push(timer);return timer.id;
  };
  globalThis.clearTimeout=id=>cancelled.add(id);
  try{
    $("startButton").click();
    assert.equal($("revealDialog").open,true);
    assert.equal($("revealFinalArt").hasAttribute("hidden"),true,
      "Finished SVG is hidden at the start of the build");
    assert.equal($("revealBoard").classList.contains("has-colour"),false);
    const jobs=queue.slice().sort((a,b)=>a.delay-b.delay||a.id-b.id);
    let colourTime=-1,detailTime=-1;
    for(const item of jobs){
      if(cancelled.has(item.id))continue;
      item.fn();
      if(colourTime<0&&$("revealBoard").classList.contains("has-colour")){
        colourTime=item.delay;
        assert.equal($("revealFinalArt").hasAttribute("hidden"),false,
          "The colour-stage transition must explicitly unhide the SVG on iOS");
        assert.equal($("revealFinalArt").getAttribute("aria-hidden"),"false");
      }
      const visibleDetails=$("revealFinalArt")
        .querySelectorAll("[data-detail-stage]")
        .filter(group=>group.getAttribute("opacity")==="1").length;
      if(visibleDetails>0&&detailTime<0)detailTime=item.delay;
    }
    assert.ok(colourTime>=0,"Full Picture never reached the colour stage");
    assert.ok(detailTime>colourTime,"Face and spots appeared before the colour stage");
    assert.equal($("revealBuildLayer").hidden,true,
      "The grey picture must disappear after the coloured artwork fades in");
    assert.equal($("revealMirrorLayer").hidden,true);
    assert.equal($("revealFinalArt").hasAttribute("hidden"),false);
    assert.equal($("revealHeading").textContent,picture.name+"!");
    const finishedRects=$("finishedArt").children.filter(x=>x.tagName==="rect");
    const revealRects=$("revealFinalArt").children.filter(x=>x.tagName==="rect");
    assert.ok(revealRects.length>100);
    assert.deepEqual(
      revealRects.map(rect=>rect.getAttribute("fill")),
      finishedRects.map(rect=>rect.getAttribute("fill")),
      "The full-screen picture colours/background must match the summary picture"
    );
    for(const detail of $("revealFinalArt").querySelectorAll("[data-detail-stage]"))
      assert.equal(detail.getAttribute("opacity"),"1",
        "Every final mushroom detail should be visible before the results page");
    assert.equal($("finishScreen").hidden,true);
    $("closeReveal").click();
    assert.equal($("finishScreen").hidden,false);
  }finally{
    globalThis.window.matchMedia=originalMatchMedia;
    globalThis.setTimeout=originalSetTimeout;
    globalThis.clearTimeout=originalClearTimeout;
  }
});


function ghostLayer(svgId="pixelCanvas"){
  const svg=$(svgId);
  const layer=svg.children.filter(e=>e.tagName==="g"&&
    e.getAttribute("class")?.includes("ink-live-preview"));
  assert.equal(layer.length,1,"Expected exactly one ghost layer on "+svgId);
  return layer[0];
}
function ghostColumns(svgId="pixelCanvas"){
  return ghostLayer(svgId).children.map(rect=>Number(rect.getAttribute("x")));
}
function inspectGhost(picture,question,candidate,phase="ghost"){
  const expected=picturePaintedValues(picture,question,candidate)
    .map(value=>value-picture.window.min);
  assert.deepEqual(ghostColumns(),expected,
    "Ghost should match the student's projected inequality exactly");
  assert.deepEqual(ghostColumns("mobilePixelCanvas"),expected,
    "The sticky phone preview must match the main canvas");
  assert.ok(ghostLayer().getAttribute("class")?.includes("--"+phase),
    "Unexpected ghost feedback phase: "+ghostLayer().getAttribute("class"));
  for(const rect of ghostLayer().children)
    assert.equal(Number(rect.getAttribute("y")),question.row);
}
test("Reading options draw a live ghost, flash orange on rejection, then green and settle into ink",()=>{
  select("mirror",0); // Cat's original exercise has not been completed.
  $("startButton").click();
  const cat=pictureById("cat-cameo"),q=makePictureQuestion(cat,0,0,"mirror");
  assert.equal($("playScreen").hidden,false);
  assert.equal(ghostLayer().children.length,0,
    "No answer has been selected, so there should be no preview yet");
  const wrongIndex=q.options.findIndex(o=>!identicalSolution(o.value,q.answer)&&
    picturePaintedValues(cat,q,o.value).length>0);
  const correctIndex=q.options.findIndex(o=>identicalSolution(o.value,q.answer));
  assert.ok(wrongIndex>=0&&correctIndex>=0);
  $("readOptions").children[wrongIndex].click();
  inspectGhost(cat,q,q.options[wrongIndex].value);
  assert.equal($("progressText").textContent,"0 of 14",
    "The ghost must never count as completed pixels");
  const nativeSet=globalThis.setTimeout,nativeClear=globalThis.clearTimeout;
  const timers=[],cancelled=new Set();
  let nextId=7000;
  globalThis.setTimeout=(fn,delay)=>{
    if([580,130,340,820,1170].includes(delay)){
      const t={id:nextId++,fn,delay};timers.push(t);return t.id;
    }
    return nativeSet(fn,delay);
  };
  globalThis.clearTimeout=id=>{
    if(id>=7000){cancelled.add(id);return;}
    return nativeClear(id);
  };
  try{
    $("checkButton").click();
    assert.equal($("progressText").textContent,"0 of 14");
    assert.equal($("checkButton").disabled,false);
    inspectGhost(cat,q,q.options[wrongIndex].value,"incorrect");
    assert.equal($("canvasStage").classList.contains("ink-stage--incorrect"),true);
    assert.equal($("mobilePreviewStrip").classList.contains("ink-stage--incorrect"),true);
    const wrongTimer=timers.find(t=>t.delay===580);
    assert.ok(wrongTimer);
    wrongTimer.fn();
    inspectGhost(cat,q,q.options[wrongIndex].value,"ghost");
    assert.equal($("canvasStage").classList.contains("ink-stage--incorrect"),false);
    $("readOptions").children[correctIndex].click();
    inspectGhost(cat,q,q.answer,"ghost");
    $("checkButton").click();
    assert.equal($("checkButton").disabled,true);
    assert.equal($("progressText").textContent,"1 of 14");
    inspectGhost(cat,q,q.answer,"correct");
    assert.equal($("canvasStage").classList.contains("ink-stage--correct"),true);
    assert.equal($("mobilePreviewStrip").classList.contains("ink-stage--correct"),true);
    const accepted=timers.find(t=>t.delay===130);
    assert.ok(accepted,"Correct preview must settle before automatic advancement");
    const rowCells=$("pixelCanvas").children.filter(
      x=>x.tagName==="rect"&&Number(x.getAttribute("y"))===q.row);
    assert.ok(rowCells.some(rect=>rect.getAttribute("fill")==="#e9e5df"),
      "Green should appear before committing the accepted row");
    accepted.fn();
    assert.equal(ghostLayer().children.length,0,
      "The green overlay should disappear once accepted ink is painted");
    assert.equal(ghostLayer("mobilePixelCanvas").children.length,0);
    for(const value of picturePaintedValues(cat,q)){
      const x=value-cat.window.min;
      const rect=$("pixelCanvas").children.find(r=>r.tagName==="rect"&&
        Number(r.getAttribute("x"))===x&&Number(r.getAttribute("y"))===q.row);
      assert.equal(rect?.getAttribute("fill"),"#64738e",
        "Accepted green cells must settle to ordinary blue-grey ink");
    }
    assert.equal($("canvasStage").classList.contains("ink-stage--correct"),false);
    const advance=timers.find(t=>t.delay===340);
    assert.ok(advance,"Student should still advance after one Check press");
    advance.fn();
    assert.equal($("questionStep").textContent,"ROW 2 OF 14");
    assert.equal(ghostLayer().children.length,0,
      "Next question must not inherit the old candidate preview");
    assert.equal($("progressText").textContent,"1 of 14");
  }finally{
    globalThis.setTimeout=nativeSet;
    globalThis.clearTimeout=nativeClear;
    $("changeLevelButton").click();
  }
});
test("Endpoint steppers, circle toggles and number changes update both ghost boards",()=>{
  select("solve",0); // Mushroom has not been played in Solve & Paint.
  $("startButton").click();
  const mushroom=pictureById("mushroom-mystery"),q=makePictureQuestion(mushroom,0,0,"solve");
  assert.equal(q.mode,"solve");
  assert.equal(ghostLayer().children.length,0);
  $("leftDecrease").click(); // Starting [-0,1] → (-1,1)
  inspectGhost(mushroom,q,{
    direction:"between",lower:-1,upper:1,
    lowerIncluded:false,upperIncluded:false
  });
  $("leftClosed").click();
  inspectGhost(mushroom,q,{
    direction:"between",lower:-1,upper:1,
    lowerIncluded:true,upperIncluded:false
  });
  $("rightIncrease").click();
  $("rightClosed").click();
  inspectGhost(mushroom,q,{
    direction:"between",lower:-1,upper:2,
    lowerIncluded:true,upperIncluded:true
  });
  $("leftValue").value="-3";$("leftValue").change();
  inspectGhost(mushroom,q,{
    direction:"between",lower:-3,upper:2,
    lowerIncluded:true,upperIncluded:true
  });
  assert.equal($("progressText").textContent,"0 of 14");
  $("changeLevelButton").click();
});
test("Mixed Challenge ghosts reflect the attempted half-line rather than revealing the answer",()=>{
  select("mixed",0); // Unplayed mushroom in Mixed Challenge.
  $("startButton").click();
  const mushroom=pictureById("mushroom-mystery");
  const q=makePictureQuestion(mushroom,0,0,"mixed");
  assert.equal(q.mode,"read");
  assert.equal(q.artMode,"mirror");
  const wrong=q.options.findIndex(o=>!identicalSolution(o.value,q.answer));
  $("readOptions").children[wrong].click();
  inspectGhost(mushroom,q,q.options[wrong].value);
  const ghost=ghostColumns().map(x=>x+mushroom.window.min);
  const reflected=ghost.map(x=>mushroom.window.min+mushroom.window.max-1-x);
  assert.deepEqual([...new Set(ghost)].sort((a,b)=>a-b),
    [...new Set(reflected)].sort((a,b)=>a-b));
  assert.equal($("progressText").textContent,"0 of 14");
  $("changeLevelButton").click();
});


function paintCell(row,col){
 const square=$("paintCanvas").children.find(c=>
   c.dataset.row===String(row)&&c.dataset.col===String(col));
 assert.ok(square,"Missing pixel "+col+" on row "+row);
 return square;
}
function choosePaintKey(key){
 const brush=$("paintRules").children.find(b=>b.dataset.colour===key);
 assert.ok(brush,"No palette entry for "+key);
 brush.click();
}
test("Choosing one Sky inequality selects only that rule, not other Sky inequalities",()=>{
 select("paint",0); // Rainbow Rocket / To the Moon
 $("startButton").click();
 assert.equal($("paintScreen").hidden,false);
 const pic=pictureById("paint-rocket");
 const question=makePaintQuestion(pic,0,0);
 assert.deepEqual(question.rules.map(rule=>rule.key),["S","O","S"],
   "The rocket's first row must exercise two different Sky inequalities");
 const rules=$("paintRules").children;
 assert.equal(rules.length,3);
 const [leftSky,flame,rightSky]=rules;
 assert.equal(leftSky.dataset.colour,rightSky.dataset.colour);
 assert.notEqual(question.rules[0].inequality,question.rules[2].inequality);
 const selected=()=>rules.filter(b=>b.getAttribute("aria-pressed")==="true");
 assert.deepEqual(rules.map(b=>b.dataset.ruleIndex),["0","1","2"]);
 assert.deepEqual(selected(),[leftSky],"Only the initial inequality is selected");

 rightSky.click();
 assert.deepEqual(selected(),[rightSky],
   "Tapping the right Sky inequality must not highlight the left one");
 assert.equal(leftSky.classList.contains("selected"),false);
 assert.equal(rightSky.classList.contains("selected"),true);
 assert.equal(flame.classList.contains("selected"),false);
 assert.ok($("paintSelectedLabel").textContent.includes(question.rules[2].inequality));
 assert.ok($("paintSelectedLabel").textContent.includes("Sky"));
 const rightLabel=$("paintSelectedLabel").textContent;

 leftSky.click();
 assert.deepEqual(selected(),[leftSky]);
 assert.ok($("paintSelectedLabel").textContent.includes(question.rules[0].inequality));
 assert.notEqual($("paintSelectedLabel").textContent,rightLabel);
 flame.click();
 assert.deepEqual(selected(),[flame]);
 assert.ok($("paintSelectedLabel").textContent.includes("Flame orange"));

 $("paintEraser").click();
 assert.equal(selected().length,0,"The eraser must deselect all colour rules");
 assert.equal($("paintEraser").getAttribute("aria-pressed"),"true");
 assert.ok($("paintSelectedLabel").textContent.includes("Eraser"));

 rightSky.click();
 assert.deepEqual(selected(),[rightSky]);
 assert.equal($("paintEraser").getAttribute("aria-pressed"),"false");
 const col=$("paintFocusRow").children[8]; // x=3, belongs to right Sky interval
 col.click();
 assert.equal(col.style.backgroundColor,pic.paint.colours.S.hex,
   "Either Sky rule must still paint with the same Sky brush");
 assert.equal(paintCell(14,8).style.backgroundColor,pic.paint.colours.S.hex);
 $("paintClear").click();
 $("paintBack").click();
 assert.equal($("introScreen").hidden,false);
});
test("Paint students can swipe the active row, erase, clear and resume a partly painted row",()=>{
 select("paint",0);
 assert.equal($("picturePicker").children.length,5);
 $("startButton").click();
 assert.equal($("paintScreen").hidden,false);
 assert.equal($("paintTitle").textContent,
   pictureById("paint-rocket").clue+" — colour studio");
 assert.equal($("playScreen").hidden,true);
 assert.equal($("paintProgressLabel").textContent,"Row 1 of 14");
 const p=pictureById("paint-rocket"),row=14;
 assert.equal($("paintCanvas").children.length,160);
 assert.equal($("paintFocusRow").children.length,10,
   "A full-width enlarged row must be visible without zooming");
 assert.equal(document.body.classList.contains("paint-session"),true);
 for(let x=0;x<10;x++){
   const focus=$("paintFocusRow").children[x];
   assert.equal(focus.textContent,String(p.window.min+x));
   assert.equal(focus.disabled,false);
   assert.equal(focus.dataset.row,String(row));
   assert.equal(paintCell(row,x).disabled,false);
   assert.equal(paintCell(row,x).textContent,String(p.window.min+x));
   assert.equal(paintCell(row-1,x).disabled,true,"Future rows stay locked");
   assert.equal(paintCell(row-1,x).textContent,"","Future rows reveal no numbers");
 }
 const key=paintTarget(p,0)[0];
 choosePaintKey(key);
 const start=paintCell(row,0),end=paintCell(row,1),board=$("paintCanvas");
 const target={pointerId:14,pointerType:"touch",button:0,target:start,
   clientX:15,clientY:15,preventDefault(){this.prevented=true;}};
 const event=board.listeners.get("pointerdown")[0];
 event(target);
 assert.equal(target.prevented,true,"Touch painting should not scroll the page");
 assert.equal(start.getAttribute("aria-label").includes("unpainted"),false);
 const nativeElementFromPoint=globalThis.document.elementFromPoint;
 globalThis.document.elementFromPoint=()=>end;
 for(const fn of board.listeners.get("pointermove")||[])
   fn({...target,clientX:48});
 for(const fn of board.listeners.get("pointerup")||[])fn(target);
 assert.equal(end.getAttribute("aria-label").includes("unpainted"),false,
   "Swipe should paint multiple neighbouring squares");
 assert.equal($("paintFocusRow").children[0].style.backgroundColor,
   p.paint.colours[key].hex,"Focused row must mirror overview paint");
 assert.equal($("paintFocusRow").children[1].style.backgroundColor,
   p.paint.colours[key].hex);
 assert.equal(board.capturedPointerId,14);
 // Swiping the enlarged, accessible row should edit the same draft.
 const focusBoard=$("paintFocusRow");
 const cell2=focusBoard.children[2],cell3=focusBoard.children[3];
 const finger={pointerId:15,pointerType:"touch",button:0,target:cell2,
   clientX:85,clientY:15,preventDefault(){}};
 for(const fn of focusBoard.listeners.get("pointerdown")||[])fn(finger);
 globalThis.document.elementFromPoint=()=>cell3;
 for(const fn of focusBoard.listeners.get("pointermove")||[])
   fn({...finger,clientX:120});
 for(const fn of focusBoard.listeners.get("pointerup")||[])fn(finger);
 assert.equal(focusBoard.capturedPointerId,15);
 assert.equal(paintCell(row,2).style.backgroundColor,p.paint.colours[key].hex);
 assert.equal(paintCell(row,3).style.backgroundColor,p.paint.colours[key].hex);
 const saved=JSON.parse(localStorage.getItem("inequality-ink-v5"));
 assert.equal(saved.progress["paint:paint-rocket"].paintDraft[0],key);
 assert.equal(saved.progress["paint:paint-rocket"].paintDraft[1],key);
 assert.equal(saved.progress["paint:paint-rocket"].paintDraft[2],key);
 assert.equal(saved.progress["paint:paint-rocket"].paintDraft[3],key);
 $("paintEraser").click();
 end.click();
 assert.ok(end.getAttribute("aria-label").includes("unpainted"),
   "Eraser should remove only the chosen cell");
 $("paintClear").click();
 assert.ok(paintCell(row,0).getAttribute("aria-label").includes("unpainted"));
 $("paintBack").click();
 assert.equal($("introScreen").hidden,false);
 assert.equal(document.body.classList.contains("paint-session"),false);
 select("paint",0);
 $("startButton").click();
 assert.equal($("paintScreen").hidden,false);
 assert.equal($("paintProgressLabel").textContent,"Row 1 of 14");
 globalThis.document.elementFromPoint=nativeElementFromPoint;
 $("paintBack").click();
});
function completePaintPicture(index,id){
 select("paint",index);
 $("startButton").click();
 assert.equal($("paintScreen").hidden,false);
 const pic=pictureById(id),width=10,total=14;
 const oldSetTimeout=globalThis.setTimeout,oldClearTimeout=globalThis.clearTimeout;
 const timers=[],cancelled=new Set();
 let serial=10000;
 globalThis.setTimeout=(fn,delay)=>{
   if([280,850,600].includes(delay)){
     const item={id:serial++,fn,delay};timers.push(item);return item.id;
   }
   return oldSetTimeout(fn,delay);
 };
 globalThis.clearTimeout=id=>{
   if(id>=10000){cancelled.add(id);return;}
   return oldClearTimeout(id);
 };
 try{
  for(let row=0;row<total;row++){
   const target=paintTarget(pic,row),y=total-row;
   assert.equal($("paintStep").textContent,"ROW "+(row+1)+" OF "+total);
   assert.equal($("paintRules").children.length,
     makePaintQuestion(pic,row,0).rules.length);
   assert.ok(paintCell(y,0).textContent.length>0);
   assert.equal($("paintFocusRow").children.length,10);
   assert.equal($("paintFocusRow").children[0].textContent,
     String(pic.window.min));
   assert.equal($("paintFocusRow").children[0].disabled,false);
   if(row===0){
     $("paintCheck").click();
     assert.ok($("paintFeedback").textContent.includes("unpainted"));
     assert.equal($("paintRowsDone").textContent,"0 / 14");
     assert.ok(paintCell(y,0).classList.contains("paint-cell--wrong"));
     assert.equal(paintCell(y,0).disabled,false);
   }
   for(let x=0;x<width;x++){
     choosePaintKey(target[x]);
     paintCell(y,x).click();
   }
   for(let x=0;x<width;x++){
     assert.equal(paintCell(y,x).textContent,String(pic.window.min+x));
     assert.equal(paintCell(y,x).style.backgroundColor,pic.paint.colours[target[x]].hex);
     assert.equal($("paintFocusRow").children[x].style.backgroundColor,
       pic.paint.colours[target[x]].hex,"Focused strip and overview must match");
   }
   $("paintCheck").click();
   assert.equal($("paintRowsDone").textContent,(row+1)+" / 14");
   assert.ok($("paintFeedback").className.includes("success"));
   assert.equal($("paintCheck").disabled,true);
   assert.ok(paintCell(y,4).classList.contains("paint-cell--correct"));
   assert.ok($("paintFocusRow").children[4].classList.contains("paint-cell--correct"));
   assert.equal($("paintFocusRow").children[4].disabled,true);
   const upcoming=timers.findLast(t=>t.delay===280&&!cancelled.has(t.id));
   assert.ok(upcoming,"Each correctly coloured row auto-advances");
   upcoming.fn();
   if(row<total-1){
     assert.equal($("paintScreen").hidden,false);
     assert.equal(paintCell(y,4).textContent,"",
       "After checking, correct rows lose their integer labels");
     assert.equal(paintCell(y,4).disabled,true);
     assert.equal(paintCell(y,4).style.backgroundColor,pic.paint.colours[target[4]].hex);
     assert.equal(paintCell(y-1,4).disabled,false);
     assert.equal(paintCell(y-1,4).textContent,String(pic.window.min+4));
     assert.equal($("paintFocusRow").children[4].textContent,
       String(pic.window.min+4),"New enlarged row must display fresh integers");
   }
  }
  assert.equal($("revealDialog").open,true);
  assert.equal($("finishScreen").hidden,true);
  assert.equal($("revealFinalArt").hasAttribute("hidden"),false,
    "The completed painted picture should display in full colour");
  const finish=$("finishedArt");
  for(const [row,col] of [[1,4],[3,5],[8,3],[12,4]]){
    const r=finish.children.find(c=>c.tagName==="rect"&&
      c.getAttribute("x")===String(col)&&c.getAttribute("y")===String(row));
    assert.ok(r,"Final picture cell is missing");
    const key=pic.paint.grid[row-1][col];
    const expected=pic.paint.colours[key].hex;
    assert.equal(r.getAttribute("fill"),expected,
      "Completed art must preserve the EXACT painted colour grid");
  }
  $("closeReveal").click();
  assert.equal($("finishScreen").hidden,false);
  assert.equal($("firstTryStat").textContent,"13/14",
    "Only the first row's deliberate wrong check should affect first-time correct");
  const state=JSON.parse(localStorage.getItem("inequality-ink-v5"));
  assert.equal(state.progress["paint:"+id].completed,true);
  assert.equal(state.progress["paint:"+id].done,14);
  $("chooseLevelButton").click();
 }finally{
   globalThis.setTimeout=oldSetTimeout;
   globalThis.clearTimeout=oldClearTimeout;
 }
}
test("All three paint pictures complete end-to-end and animate to the existing summary",()=>{
 for(const [index,id] of ["paint-rocket","paint-flower","paint-robot"].entries())
  completePaintPicture(index,id);
 const saved=JSON.parse(localStorage.getItem("inequality-ink-v5"));
 for(const id of ["paint-rocket","paint-flower","paint-robot"])
  assert.equal(saved.progress["paint:"+id].completed,true);
 // Existing activities remain independently completed.
 assert.equal(saved.progress["mirror:heart-glow"].done,14);
 assert.equal(saved.progress["solve:rocket-launch"].done,14);
});


test("All four maths modes celebrate a real six-question Starter and offer the next step",()=>{
 const modes=["mirror","full","solve","mixed"];
 for(const level of modes){
   selectStage(level,1);
   const picture=pictureById(level==="mirror"?"mirror-star-starter":"full-star-starter");
   const completedBefore=Number($("picturePathProgress").textContent.split(" ")[0]);
   assert.ok(completedBefore>=0&&completedBefore<5);
   assert.ok($("pictureSummary").textContent.includes("6 rows"));
   assert.equal($("practiceButton").hidden,false,
     "Even the Starter offers optional practice, never a required tutorial");
   $("startButton").click();
   assert.equal($("playScreen").hidden,false);
   assert.equal($("questionStep").textContent,"ROW 1 OF 6",
     "Starter must begin with a real picture row, not two compulsory tutorials");
   for(let row=0;row<6;row++){
     answerCurrent(picture,row,level);
     assert.equal($("progressText").textContent,(row+1)+" of 6");
   }
   assert.equal($("revealDialog").open,true);
   assert.equal($("finishScreen").hidden,true);
   assert.equal($("revealFinalArt").hasAttribute("hidden"),false);
   if(level==="mirror"){
     const starArt=$("revealFinalArt");
     const colourAt=(x,y)=>{
       const square=starArt.children.find(el=>el.tagName==="rect"&&
         el.getAttribute("x")===String(x)&&
         el.getAttribute("y")===String(y));
       assert.ok(square,"The revealed star must contain every artwork cell");
       return square.getAttribute("fill");
     };
     // The upright upper tip must be central, not split between the edges
     // as in the original U-shaped iPhone screenshot.
     assert.notEqual(colourAt(5,1),colourAt(0,1));
     assert.equal(colourAt(5,1),colourAt(6,1));
     assert.equal(colourAt(0,3),colourAt(11,3));
     assert.notEqual(colourAt(0,6),colourAt(5,6));
     assert.equal(starArt.getAttribute("viewBox"),"0 0 12 8");
   }
   $("closeReveal").click();
   assert.equal($("firstTryStat").textContent,"6/6");
   assert.equal($("finishTitle").textContent,picture.name+"!");
   assert.equal($("nextPictureButton").hidden,false);
   const next=level==="mirror"?"mirror-heart-step":"full-gift-step";
   assert.ok($("nextPictureButton").textContent.includes(pictureById(next).clue));
   $("nextPictureButton").click();
   assert.equal($("introScreen").hidden,false);
   assert.equal(JSON.parse(localStorage.getItem("inequality-ink-v5"))
     .selectedPictures[level],next);
   assert.ok($("picturePathProgress").textContent.includes((completedBefore+1)+" of 5"));
   const first=$("picturePicker").children[0];
   assert.ok(first.children[1].children[1].textContent.includes("completed"));
   assert.equal(first.children[1].children[0].textContent,picture.clue);
 }
});
test("Paint Starter completes a two-colour six-row heart without scrolling or extra questions",()=>{
 selectStage("paint",1);
 const p=pictureById("paint-heart-starter"),width=8,rows=6;
 const completedBefore=Number($("picturePathProgress").textContent.split(" ")[0]);
 assert.ok($("pictureSummary").textContent.includes("2 colours"));
 assert.ok($("pictureSummary").textContent.includes("6 rows"));
 $("startButton").click();
 assert.equal($("paintScreen").hidden,false);
 assert.equal($("paintProgressLabel").textContent,"Row 1 of 6");
 assert.equal($("paintCanvas").children.length,width*p.height);
 assert.equal($("paintFocusRow").children.length,width);
 const set=globalThis.setTimeout,clear=globalThis.clearTimeout;
 const queue=[];let serial=30000;
 globalThis.setTimeout=(fn,delay)=>{
   if(delay===280){const item={id:serial++,fn};queue.push(item);return item.id;}
   return set(fn,delay);
 };
 globalThis.clearTimeout=id=>{if(id>=30000)return;return clear(id);};
 try{
   for(let row=0;row<rows;row++){
     const target=paintTarget(p,row),y=rows-row;
     assert.equal($("paintFocusRow").children.length,8);
     assert.equal($("paintStep").textContent,"ROW "+(row+1)+" OF 6");
     for(let x=0;x<width;x++){
       choosePaintKey(target[x]);
       $("paintFocusRow").children[x].click();
       assert.equal(paintCell(y,x).style.backgroundColor,
         p.paint.colours[target[x]].hex);
     }
     $("paintCheck").click();
     assert.equal($("paintRowsDone").textContent,(row+1)+" / 6");
     assert.equal($("paintCheck").disabled,true);
     const next=queue.shift();
     assert.ok(next,"Automatic paint progression timer missing");
     next.fn();
     if(row<rows-1){
       assert.equal(paintCell(y,0).textContent,"",
         "Accepted row must lose its integer labels");
       assert.equal(paintCell(y-1,0).textContent,String(p.window.min));
     }
   }
   assert.equal($("revealDialog").open,true);
   assert.equal($("finishScreen").hidden,true);
   $("closeReveal").click();
   assert.equal($("firstTryStat").textContent,"6/6");
   assert.equal($("nextPictureButton").hidden,false);
   assert.equal($("finishTitle").textContent,p.name+"!");
   $("nextPictureButton").click();
   assert.equal($("introScreen").hidden,false);
   assert.ok($("picturePathProgress").textContent.includes((completedBefore+1)+" of 5"));
   assert.equal(JSON.parse(localStorage.getItem("inequality-ink-v5"))
     .selectedPictures.paint,"paint-star-step");
   assert.equal(JSON.parse(localStorage.getItem("inequality-ink-v5"))
     .progress["paint:paint-heart-starter"].done,6);
 }finally{
   globalThis.setTimeout=set;
   globalThis.clearTimeout=clear;
 }
});


test("Eight, ten and twelve row inequality pictures all advance and reveal in full colour",()=>{
 for(const [level,stage,id] of [
   ["mirror",2,"mirror-heart-step"],
   ["full",3,"full-ball-building"],
   ["mixed",4,"full-flower-challenge"]
 ]){
   selectStage(level,stage);
   const picture=pictureById(id),n=questionCount(picture);
   assert.equal(n,stage*2+4);
   $("startButton").click(); // Later stages start directly with picture questions.
   assert.equal($("playScreen").hidden,false);
   assert.equal($("questionStep").textContent,"ROW 1 OF "+n);
   for(let index=0;index<n;index++){
     answerCurrent(picture,index,level);
     assert.equal($("progressText").textContent,(index+1)+" of "+n);
   }
   assert.equal($("revealDialog").open,true);
   assert.equal($("finishScreen").hidden,true);
   assert.equal($("finishedArt").getAttribute("viewBox"),
     "0 0 "+(level==="mirror"?pictureWidth(picture)*2:pictureWidth(picture))+
       " "+picture.height);
   $("closeReveal").click();
   assert.equal($("firstTryStat").textContent,n+"/"+n);
   assert.equal($("finishTitle").textContent,picture.name+"!");
   $("chooseLevelButton").click();
   assert.equal($("introScreen").hidden,false);
 }
});
test("The eight, ten and twelve row Paint stages colour and lock each integer square",()=>{
 for(const [stage,id,swatches] of [
   [2,"paint-star-step",2],
   [3,"paint-daisy-building",3],
   [4,"paint-rocket-challenge",4]
 ]){
   selectStage("paint",stage);
   const picture=pictureById(id),n=questionCount(picture),w=pictureWidth(picture);
   assert.equal(n,stage*2+4);
   assert.equal(Object.keys(picture.paint.colours).length,swatches);
   $("startButton").click();
   assert.equal($("paintScreen").hidden,false);
   assert.equal($("paintCanvas").children.length,w*picture.height);
   assert.equal($("paintFocusRow").children.length,w);
   const oldSetTimeout=globalThis.setTimeout,oldClearTimeout=globalThis.clearTimeout;
   const pending=[];let serial=40000;
   globalThis.setTimeout=(fn,delay)=>{
     if(delay===280){pending.push({id:serial++,fn});return serial-1;}
     return oldSetTimeout(fn,delay);
   };
   globalThis.clearTimeout=id=>id>=40000?undefined:oldClearTimeout(id);
   try{
     for(let index=0;index<n;index++){
       const target=paintTarget(picture,index),y=n-index;
       for(let x=0;x<w;x++){
         choosePaintKey(target[x]);
         $("paintFocusRow").children[x].click();
         assert.equal(paintCell(y,x).style.backgroundColor,
           picture.paint.colours[target[x]].hex);
       }
       $("paintCheck").click();
       assert.equal($("paintRowsDone").textContent,(index+1)+" / "+n);
       const timer=pending.shift();
       assert.ok(timer,id+" failed to advance row "+index);
       timer.fn();
       if(index<n-1){
         assert.equal(paintCell(y,0).textContent,"");
         assert.equal(paintCell(y-1,0).disabled,false);
       }
     }
     assert.equal($("revealDialog").open,true);
     assert.equal($("finishScreen").hidden,true);
     $("closeReveal").click();
     assert.equal($("firstTryStat").textContent,n+"/"+n);
     assert.equal($("finishTitle").textContent,picture.name+"!");
     assert.equal(JSON.parse(localStorage.getItem("inequality-ink-v5"))
       .progress["paint:"+id].done,n);
     $("chooseLevelButton").click();
   }finally{
     globalThis.setTimeout=oldSetTimeout;
     globalThis.clearTimeout=oldClearTimeout;
   }
 }
});

test("Solve & Paint lets students switch typed maths and handwritten working",()=>{
  selectStage("solve",2);
  const picture=pictureById("full-gift-step");
  $("startButton").click();
  assert.equal($("playScreen").hidden,false);
  assert.equal($("workingShell").hidden,false);
  assert.equal($("workTypePanel").hidden,false);
  assert.equal($("workDrawPanel").hidden,true);
  const input=$("workingArea");
  input.value="-5 < 2x+1 < 5";
  input.setSelectionRange(3,3);
  for(const fn of input.listeners.get("input")||[])fn({target:input});
  assert.ok($("workMathPreview").innerHTML.includes("<math "));
  // The keyboard must replace the selected symbol, not append at the end.
  const button=new FakeElement("button");
  button.dataset.mathKey="≤";
  $("workMathKeyboard").append(button);
  input.setSelectionRange(3,4);
  for(const fn of input.listeners.get("select")||[])fn();
  for(const fn of $("workMathKeyboard").listeners.get("click")||[])
    fn({target:button});
  assert.equal(input.value,"-5 ≤ 2x+1 < 5");
  assert.ok($("workMathPreview").innerHTML.includes("<mo>≤</mo>"));
  $("workDrawButton").click();
  assert.equal($("workTypePanel").hidden,true);
  assert.equal($("workDrawPanel").hidden,false);
  assert.equal($("workDrawButton").getAttribute("aria-pressed"),"true");
  const pad=$("workDrawing");
  const down={pointerId:171,button:0,isPrimary:true,clientX:30,clientY:40,
    preventDefault(){}};
  for(const fn of pad.listeners.get("pointerdown")||[])fn(down);
  for(const fn of pad.listeners.get("pointermove")||[])
    fn({...down,clientX:95,clientY:73});
  for(const fn of pad.listeners.get("pointerup")||[])
    fn({...down,clientX:95,clientY:73});
  assert.equal(pad.children.length,1);
  assert.ok(pad.children[0].getAttribute("d").includes(" L"));
  assert.equal($("workUndo").disabled,false);
  $("workEraser").click();
  for(const fn of pad.listeners.get("pointerdown")||[])fn({...down,pointerId:172});
  for(const fn of pad.listeners.get("pointerup")||[])fn({...down,pointerId:172});
  assert.equal(pad.children.length,0,"Eraser removes the indicated stroke");
  $("workUndo").click();
  assert.equal(pad.children.length,1,"Undo restores an erased stroke");
  $("workClear").click();
  assert.equal(pad.children.length,0);
  $("workUndo").click();
  assert.equal(pad.children.length,1,"Undo also restores a cleared sketch");
  $("workTypeButton").click();
  assert.equal(input.value,"-5 ≤ 2x+1 < 5",
    "Switching methods must not erase either draft");
  $("workDrawButton").click();
  assert.equal(pad.children.length,1);
  // Correct checking must still use the number line, not the scratchpad.
  answerCurrent(picture,0,"solve");
  assert.equal(input.value,"","Next row begins with fresh working");
  assert.equal(pad.children.length,0);
  assert.equal($("workTypePanel").hidden,false);
});


test("Direct picture entry, optional practice, and continuation do not interfere",()=>{
  selectStage("full",2);
  const picture=pictureById("full-gift-step");
  const beforePractice=localStorage.getItem("inequality-ink-v5");
  assert.equal($("practiceButton").hidden,false);
  assert.equal($("startButton").textContent,"Start picture ↗");
  $("practiceButton").click();
  assert.equal($("playScreen").hidden,false);
  assert.equal($("questionStep").textContent,"PRACTICE 1 OF 2");
  assert.equal($("checkButton").textContent,"Check practice →");
  assert.equal($("exitPracticeButton").hidden,false);
  assert.equal($("equationText").textContent,"x ≥ −2");
  function markPractice(solution){
    const direction=directions.find(d=>d.dataset.direction===solution.direction);
    direction.click();
    $("leftValue").value=String(solution.direction==="between"?solution.lower:solution.at);
    $("leftValue").change();
    if(solution.direction==="between"){
      $("rightValue").value=String(solution.upper);$("rightValue").change();
      $(solution.lowerIncluded?"leftClosed":"leftOpen").click();
      $(solution.upperIncluded?"rightClosed":"rightOpen").click();
    }else $(solution.included?"leftClosed":"leftOpen").click();
    const original=globalThis.setTimeout;
    let next=null;
    globalThis.setTimeout=(fn,delay)=>{
      if([340,820,1170].includes(delay)){next=fn;return -333;}
      return original(fn,delay);
    };
    try{
      $("checkButton").click();
      assert.ok($("feedback").className.includes("success"));
      assert.ok(next,"Practice should move to its next step automatically");
      next();
    }finally{globalThis.setTimeout=original;}
  }
  markPractice({direction:"right",at:-2,included:true});
  assert.equal($("questionStep").textContent,"PRACTICE 2 OF 2");
  assert.equal($("equationText").textContent,"−2 < x ≤ 3");
  markPractice({direction:"between",lower:-2,upper:3,
    lowerIncluded:false,upperIncluded:true});
  assert.equal($("introScreen").hidden,false);
  assert.equal($("practiceStatus").hidden,false);
  assert.match($("practiceStatus").textContent,/Practice complete/);
  assert.equal(localStorage.getItem("inequality-ink-v5"),beforePractice,
    "Optional practice must leave all saved progress and scores unchanged");
  $("startButton").click();
  assert.equal($("questionStep").textContent,"ROW 1 OF 8");
  assert.equal($("exitPracticeButton").hidden,true);
  answerCurrent(picture,0,"full");
  $("changeLevelButton").click();
  assert.equal($("startButton").textContent,"Continue picture ↗");
  const afterRow=localStorage.getItem("inequality-ink-v5");
  $("practiceButton").click();
  assert.equal($("questionStep").textContent,"PRACTICE 1 OF 2");
  $("exitPracticeButton").click();
  assert.equal($("introScreen").hidden,false);
  assert.equal(localStorage.getItem("inequality-ink-v5"),afterRow);
  $("startButton").click();
  assert.equal($("questionStep").textContent,"ROW 2 OF 8");
  assert.equal($("progressText").textContent,"1 of 8");
  $("changeLevelButton").click();
});
test("Optional practice stays within small picture number lines and excludes Paint mode",()=>{
  selectStage("mirror",1);
  assert.equal($("practiceButton").hidden,false);
  $("practiceButton").click();
  assert.equal($("questionStep").textContent,"PRACTICE 1 OF 2");
  assert.equal($("equationText").textContent,"x ≤ 2",
    "A tutorial x ≤ 4 would exceed the smallest Mirror picture axis");
  $("exitPracticeButton").click();
  assert.equal($("introScreen").hidden,false);
  for(const level of ["mirror","full","solve","mixed"]){
    selectStage(level,1);
    assert.equal($("practiceButton").hidden,false,level+" should allow optional practice");
  }
  selectStage("paint",1);
  assert.equal($("practiceButton").hidden,true,
    "Paint offers immediate picture play, not unrelated number-line tutorials");
  // The Paint Starter was already completed in an earlier end-to-end test.
  // Its primary action now correctly replays the reveal instead of practice.
});


test("Quadratic Quest is optional, resumes independently, and reveals its picture after six exact answers",()=>{
  // The original five mode saves and currently selected pictures are protected.
  $("chooseLevelButton").click();
  const baseSave=localStorage.getItem("inequality-ink-v5");
  assert.ok($("questInviteTitle"),"Optional extension card must exist");
  assert.equal($("questEnter").textContent,"Explore Quadratic Quest →");
  assert.equal($("quadraticScreen").hidden,true);
  $("questEnter").click();
  assert.equal($("quadraticScreen").hidden,false);
  assert.equal($("introScreen").hidden,true);
  assert.equal($("questQuestionStep").textContent,"QUESTION 1 OF 6");
  assert.equal($("questEquationText").textContent,QUEST_QUESTIONS[0].expression);
  assert.equal($("questProgressText").textContent,"0 of 6 rows revealed");
  assert.equal($("questArt").children.length,60);
  assert.equal($("questFinished").hidden,true);
  // Check and hints work, but an incorrect region must not reveal pixels.
  $("questOutside").click();
  $("questCheck").click();
  assert.match($("questFeedback").textContent,/parabola/);
  assert.equal($("questProgressText").textContent,"0 of 6 rows revealed");
  $("questHint").click();
  assert.equal($("questHintText").hidden,false);
  assert.match($("questHintText").textContent,/bracket/);
  $("questGraphToggle").click();
  assert.equal($("questGraphPanel").hidden,false);
  assert.equal($("questGraphToggle").getAttribute("aria-expanded"),"true");
  assert.ok($("questGraph").children.some(node=>node.tagName==="path"),
    "The helper must render an actual quadratic graph");
  $("questGraphToggle").click();
  assert.equal($("questGraphPanel").hidden,true);
  $("questWorkingDetails").open=true;
  $("questWorkingArea").value="(x-1)(x-3)<0";
  for(const fn of $("questWorkingArea").listeners.get("input")||[])fn();
  assert.ok($("questMathPreview").innerHTML.includes("<math "));
  $("questWorkDraw").click();
  assert.equal($("questDrawPanel").hidden,false);
  $("questWorkType").click();
  assert.equal($("questWorkingArea").value,"(x-1)(x-3)<0",
    "Switching working methods should retain typed maths");

  function solveQuestQuestion(index){
    const expected=quadraticAnswer(QUEST_QUESTIONS[index]);
    $(expected.region==="outside"?"questOutside":"questBetween").click();
    // Set the upper root first, allowing the lower root to cross zero.
    $("questUpper").value=String(expected.upper);
    $("questUpper").change();
    $("questLower").value=String(expected.lower);
    $("questLower").change();
    $(expected.lowerIncluded?"questLowerClosed":"questLowerOpen").click();
    $(expected.upperIncluded?"questUpperClosed":"questUpperOpen").click();
    assert.equal(Number($("questLower").value),expected.lower);
    assert.equal(Number($("questUpper").value),expected.upper);
    assert.equal($("questOutside").getAttribute("aria-pressed"),
      String(expected.region==="outside"));

    const original=globalThis.setTimeout;
    let next=null;
    globalThis.setTimeout=(fn,delay)=>{
      if(delay===320||delay===850){next=fn;return -890;}
      return original(fn,delay);
    };
    try{
      $("questCheck").click();
      assert.match($("questFeedback").textContent,/Correct!/);
      assert.ok(next,"Correct Quest solutions should advance without a second button");
      assert.equal($("questProgressText").textContent,
        (index+1)+" of 6 rows revealed");
      assert.equal($("questArtCount").textContent,(index+1)+" / 6");
      assert.equal(localStorage.getItem("inequality-ink-v5"),baseSave,
        "Quest must not change a normal picture score");
      next();
    }finally{globalThis.setTimeout=original;}
  }

  solveQuestQuestion(0);
  assert.equal($("questQuestionStep").textContent,"QUESTION 2 OF 6");
  assert.equal($("questWorkingArea").value,"",
    "New question must have fresh optional working");
  assert.equal($("questGraphPanel").hidden,true);
  $("questBack").click();
  assert.equal($("introScreen").hidden,false);
  assert.equal($("quadraticScreen").hidden,true);
  assert.match($("questEnter").textContent,/Continue Quadratic Quest/);
  const partiallySaved=JSON.parse(localStorage.getItem(QUEST_SAVE_KEY));
  assert.equal(partiallySaved.done,1);
  assert.equal(partiallySaved.firstTry,0,"Hints make the first question assisted");
  assert.equal(partiallySaved.hints,1);
  $("questEnter").click();
  assert.equal($("questQuestionStep").textContent,"QUESTION 2 OF 6");
  for(let i=1;i<6;i++)solveQuestQuestion(i);
  assert.equal($("questPlaying").hidden,true);
  assert.equal($("questFinished").hidden,false);
  assert.equal($("questReveal").open,true,"Successful Quest completes with full-screen reveal");
  assert.equal($("questRevealArt").children.length,60);
  assert.equal($("questSolutions").children.length,6);
  assert.match($("questFinalStats").textContent,/5\/6/);
  $("questRevealClose").click();
  assert.equal($("questReveal").open,false);
  $("questFinishBack").click();
  assert.equal($("introScreen").hidden,false);
  assert.equal($("questEntryProgress").textContent.includes("All 6"),true);
  assert.equal(localStorage.getItem("inequality-ink-v5"),baseSave);
  assert.equal(JSON.parse(localStorage.getItem(QUEST_SAVE_KEY)).done,6);
  // Completion is revisit-able, and replay affects Quest only.
  $("questEnter").click();
  assert.equal($("questFinished").hidden,false);
  $("questReplay").click();
  assert.equal($("questQuestionStep").textContent,"QUESTION 1 OF 6");
  assert.equal(JSON.parse(localStorage.getItem(QUEST_SAVE_KEY)).done,0);
  assert.equal(JSON.parse(localStorage.getItem(QUEST_SAVE_KEY)).replay,1);
  $("questBack").click();
  assert.equal(localStorage.getItem("inequality-ink-v5"),baseSave);
});

test("Quadratic Quest root circles allow precise keyboard toggling and pointer gestures",()=>{
  $("questEnter").click();
  const svg=$("questLine");
  const circles=svg.children.filter(e=>e.tagName==="g");
  assert.equal(circles.length,2);
  assert.equal(circles[0].getAttribute("role"),"button");
  assert.equal(circles[0].getAttribute("tabindex"),"0");
  const toggle={key:"Enter",preventDefault(){}};
  for(const listener of circles[0].listeners.get("keydown")||[])listener(toggle);
  assert.equal($("questLowerClosed").getAttribute("aria-pressed"),"true");
  const before=$("questLower").value;
  const gesture={pointerType:"touch",button:0,pointerId:700,
    clientX:100,clientY:56,preventDefault(){}};
  const current=svg.children.filter(e=>e.tagName==="g")[0];
  for(const listener of current.listeners.get("pointerdown")||[])listener(gesture);
  for(const listener of svg.listeners.get("pointerup")||[])listener(gesture);
  assert.equal($("questLowerOpen").getAttribute("aria-pressed"),"true");
  assert.equal($("questLower").value,before);
  const again=svg.children.filter(e=>e.tagName==="g")[0];
  for(const listener of again.listeners.get("pointerdown")||[])listener({...gesture,pointerId:701});
  for(const listener of svg.listeners.get("pointermove")||[])
    listener({...gesture,pointerId:701,clientX:50});
  for(const listener of svg.listeners.get("pointerup")||[])
    listener({...gesture,pointerId:701,clientX:50});
  assert.notEqual($("questLower").value,before,"Dragging a circle changes its root");
  $("questBack").click();
});
