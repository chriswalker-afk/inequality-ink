import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  COMPLEX_PICTURES,COMPLEX_SAVE_KEY,COMPLEX_STAGES,COMPLEX_ANGLES,
  complexPicture,complexTarget,complexTransform,complexQuestion,complexHint,
  complexAngleLabel,complexLabel,matchesComplexTarget,validateComplexQuest
} from "./regions/complex-quest-model.mjs";
import {
  complexRayToWindow,complexSectorPolygon,complexBoundedPolygon,
  complexSvgPath,pointInComplexLocus
} from "./regions/complex-quest-geometry.mjs";
import {readComplexQuestSave,initComplexQuest} from "./regions/complex-quest-app.mjs";

const approx=(a,b,tol=1e-6)=>Math.abs(a-b)<=tol;
const makeStore=(initial={})=>{
  const memory=new Map(Object.entries(initial));
  return {getItem:key=>memory.get(key)??null,
    setItem:(key,value)=>memory.set(key,value)};
};
test("Five real mathematics pictures cover points, transforms and loci",()=>{
  assert.equal(validateComplexQuest(),true);
  assert.equal(COMPLEX_PICTURES.length,5);
  assert.deepEqual(COMPLEX_PICTURES.map(p=>p.pieces.length),[5,8,6,5,6]);
  assert.deepEqual(COMPLEX_STAGES.map(s=>s.name),
    ["Quick Spark","Step Up","Ink Builder","Brain Stretch","Masterpiece"]);
  assert.deepEqual(COMPLEX_PICTURES.map(p=>p.pieces[0].kind),
    ["point","transform","disc","sector","bounded"]);
  const ids=new Set();
  for(const p of COMPLEX_PICTURES){
    assert.equal(complexPicture(p.id),p);
    for(const task of p.pieces){
      const answer=complexTarget(task);
      assert.ok(!ids.has(task.id));ids.add(task.id);
      assert.ok(matchesComplexTarget(task,answer),task.id);
      assert.ok(!matchesComplexTarget(task,{...answer,re:answer.re+1}));
      if(answer.radius!==undefined)
        assert.ok(!matchesComplexTarget(task,{...answer,radius:answer.radius+1}));
      if(answer.from!==undefined)
        assert.ok(!matchesComplexTarget(task,{...answer,to:answer.to+45}));
      assert.ok(!complexQuestion(task).includes("undefined"),task.id);
      assert.ok(complexHint(task,0).length>20);
    }
  }
  assert.equal(complexPicture("not-there"),null);
});
test("Complex multiplication and conjugation produce authentic transformations",()=>{
  const z={re:2,im:-3};
  assert.deepEqual(complexTransform(z,"conjugate"),{re:2,im:3});
  assert.deepEqual(complexTransform(z,"i"),{re:3,im:2});
  assert.deepEqual(complexTransform(z,"-i"),{re:-3,im:-2});
  assert.deepEqual(complexTransform(z,"negate"),{re:-2,im:3});
  assert.deepEqual(complexTransform(complexTransform(z,"i"),"-i"),z);
  assert.deepEqual(complexTransform(complexTransform(z,"conjugate"),"conjugate"),z);
  assert.throws(()=>complexTransform(z,"bad"),/Unknown/);
  const tasks=COMPLEX_PICTURES[1].pieces;
  for(let i=0;i<4;i++){
    const a=complexTarget(tasks[2*i]),b=complexTarget(tasks[2*i+1]);
    assert.ok(Math.abs(a.re*b.im-a.im*b.re)>=2);
    assert.equal(a.re*a.re+a.im*a.im,10);
    assert.equal(b.re*b.re+b.im*b.im,10);
  }
});
test("Modulus, argument, arcs and canvas clipping describe the actual loci",()=>{
  const discs=COMPLEX_PICTURES[2].pieces;
  const inside=discs.find(t=>!t.strict),strict=discs.find(t=>t.strict);
  assert.equal(pointInComplexLocus(inside,inside.centre),true);
  assert.equal(pointInComplexLocus(inside,{
    re:inside.centre.re+inside.radius,im:inside.centre.im}),true);
  assert.equal(pointInComplexLocus(strict,{
    re:strict.centre.re+strict.radius,im:strict.centre.im}),false);
  const wedge=COMPLEX_PICTURES[3].pieces[0];
  assert.equal(pointInComplexLocus(wedge,wedge.centre),false);
  assert.equal(pointInComplexLocus(wedge,{
    re:wedge.centre.re+1,im:wedge.centre.im+2}),true);
  assert.equal(pointInComplexLocus(wedge,{
    re:wedge.centre.re+1,im:wedge.centre.im-2}),false);
  const wing=COMPLEX_PICTURES[4].pieces[0];
  assert.equal(pointInComplexLocus(wing,{
    re:wing.centre.re-1,im:wing.centre.im+1}),true);
  assert.equal(pointInComplexLocus(wing,{
    re:wing.centre.re-4,im:wing.centre.im+1}),false);
  assert.deepEqual(complexRayToWindow({re:0,im:0},0),{re:5,im:0});
  const sector=complexSectorPolygon({re:1,im:-1},45,90);
  for(const p of sector.slice(1))
    assert.ok(approx(Math.abs(p.re),5)||approx(Math.abs(p.im),5));
  const arc=complexBoundedPolygon({re:0,im:0},2,-90,0);
  for(const p of arc.slice(1))assert.ok(approx(Math.hypot(p.re,p.im),2));
  assert.ok(complexSvgPath(arc).startsWith("M"));
  assert.equal(COMPLEX_ANGLES.length,9);
  assert.equal(complexAngleLabel(-135),"−3π/4");
  assert.equal(complexLabel({re:-2,im:1}),"-2 + i");
});
test("Progress saves per picture and archives discovery after replay",()=>{
  const store=makeStore();
  assert.equal(readComplexQuestSave(store).discoveries.length,0);
  const first=COMPLEX_PICTURES[0],third=COMPLEX_PICTURES[2];
  store.setItem(COMPLEX_SAVE_KEY,JSON.stringify({
    picture:third.id,records:{
      [first.id]:{done:5,attempts:7,hints:1,replays:0},
      [third.id]:{done:3,attempts:5,hints:1,replays:1}
    },discoveries:[]
  }));
  const restored=readComplexQuestSave(store);
  assert.deepEqual(restored.discoveries,[first.id]);
  assert.equal(restored.records[third.id].done,3);
  restored.records[first.id].done=0;
  store.setItem(COMPLEX_SAVE_KEY,JSON.stringify(restored));
  assert.deepEqual(readComplexQuestSave(store).discoveries,[first.id]);
  assert.equal(readComplexQuestSave(makeStore({[COMPLEX_SAVE_KEY]:"broken"})).
    picture,first.id);
  assert.equal(store.getItem("inequality-ink-graph-art-v2"),null);
});
class FakeElement{
  constructor(tag="div"){
    this.tagName=tag;this.children=[];this.attrs={};this.style={};
    this.hidden=false;this.disabled=false;this.open=false;this.value="";
    this.textContent="";this.innerHTML="";this.listeners=new Map();
    this.className="";
  }
  append(...items){for(const item of items)if(item)this.children.push(item);}
  replaceChildren(...items){this.children=[];this.append(...items);}
  setAttribute(key,v){this.attrs[key]=String(v);}
  removeAttribute(key){delete this.attrs[key];}
  getAttribute(key){return this.attrs[key]??null;}
  addEventListener(type,fn){
    if(!this.listeners.has(type))this.listeners.set(type,[]);
    this.listeners.get(type).push(fn);
  }
  dispatch(type,event={}){for(const fn of this.listeners.get(type)||[])fn(event);}
  click(){if(!this.disabled)this.dispatch("click");}
  change(){this.dispatch("change");}
  input(){this.dispatch("input");}
  showModal(){this.open=true;}
  close(){this.open=false;}
  getBoundingClientRect(){return {left:0,top:0,width:620,height:620};}
}
const html=readFileSync(new URL("./regions/complex.html",import.meta.url),"utf8");
function session(){
  const ids=[...new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]))];
  const elements=new Map(ids.map(id=>[id,new FakeElement(id)]));
  const doc={
    getElementById:id=>{
      if(!elements.has(id))throw Error("Missing interface element "+id);
      return elements.get(id);
    },
    createElement:tag=>new FakeElement(tag),
    createElementNS:(_ns,tag)=>new FakeElement(tag)
  };
  const storage=makeStore();
  const win={location:{search:""},scrollTo(){},confirm(){return true}};
  const app=initComplexQuest({doc,storage,win});
  return {$:id=>elements.get(id),app,storage};
}
test("Complete student interactions reveal all five artworks and save independently",()=>{
  const s=session(),{$,app,storage}=s;
  assert.equal($("complexLevelList").children.length,5);
  for(const p of COMPLEX_PICTURES){
    app.choose(p.id);
    $("complexStart").click();
    assert.equal($("complexPlay").hidden,false);
    assert.ok($("complexGraph").children.length>25);
    for(const [index,task] of p.pieces.entries()){
      const answer=complexTarget(task);
      assert.equal($("complexQuestion").textContent,complexQuestion(task));
      $("complexRe").value=String(answer.re);
      $("complexIm").value=String(answer.im);
      if(answer.radius!==undefined)$("complexRadius").value=String(answer.radius);
      if(answer.from!==undefined){
        $("complexFrom").value=String(answer.from);
        $("complexTo").value=String(answer.to);
      }
      $("complexRe").input();
      $("complexCheck").click();
      assert.match($("complexFeedback").textContent,/Correct!/);
      if(index<p.pieces.length-1){
        assert.equal($("complexNext").hidden,false);
        $("complexNext").click();
      }
    }
    assert.equal($("complexFinished").hidden,false);
    assert.equal($("complexReveal").open,true);
    assert.equal($("complexFinishedTitle").textContent,p.name+" ✦");
    $("complexRevealClose").click();
    $("complexFinishedBack").click();
  }
  assert.equal(app.readProgress().discoveries.length,5);
  assert.ok(COMPLEX_PICTURES.every(p=>app.readProgress().records[p.id].done===
    p.pieces.length));
  assert.ok(storage.getItem(COMPLEX_SAVE_KEY));
});
test("Incorrect choices, hints, pointer and keyboard actions do not grant progress",()=>{
  const {$,app}=session();
  $("complexStart").click();
  $("complexRe").value="0";$("complexIm").value="0";
  $("complexCheck").click();
  assert.match($("complexFeedback").textContent,/Not quite/);
  assert.equal(app.readProgress().records["star-trail"].done,0);
  $("complexGraph").dispatch("keydown",{key:"ArrowUp",preventDefault(){}});
  assert.equal($("complexIm").value,"1");
  $("complexHint").click();
  assert.equal($("complexHintText").hidden,false);
  assert.equal(app.readProgress().records["star-trail"].hints,1);
  $("complexGraph").dispatch("click",{clientX:362,clientY:258});
  assert.equal($("complexRe").value,"1");
  assert.equal($("complexIm").value,"1");
});
test("Graph Art landing page shows Complex Quest rather than redundant instructions",()=>{
  const hub=readFileSync(new URL("./regions/index.html",import.meta.url),"utf8");
  assert.ok(!hub.includes('id="how-graph-art-works"'));
  assert.ok(!hub.includes('<footer class="region-footer">'));
  assert.ok(hub.includes('href="./complex.html"'));
  assert.ok(hub.includes("Complex Quest"));
  assert.ok(html.includes("complex-quest-app.mjs"));
});
