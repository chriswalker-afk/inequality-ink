import test from "node:test";
import assert from "node:assert/strict";
import {
  QUEST_PICTURES,QUEST_QUESTIONS,QUEST_TOTAL,QUEST_ART,QUEST_AXIS,
  QUEST_SAVE_KEY,QUEST_SAVE_KEY_V2,
  questPictureById,questPictureForStep,questQuestionCount,
  formatQuadraticQuestion,quadraticStandardForm,
  quadraticValue,quadraticIsTrue,quadraticAnswer,
  quadraticAnswerContains,sameQuadraticAnswer,
  quadraticSolutionText,quadraticHints,quadraticExplanation,
  validateQuadraticQuest
} from "./quadratic-quest.mjs";
import {readQuadraticSave} from "./quadratic-quest-ui.mjs";

test("All five pictures and fifty question rows follow the intended progression",()=>{
  assert.equal(validateQuadraticQuest(),true);
  assert.equal(QUEST_PICTURES.length,5);
  assert.deepEqual(QUEST_PICTURES.map(p=>p.questions.length),[6,8,10,12,14]);
  assert.deepEqual(QUEST_PICTURES.map(p=>p.stageLabel),
    ["Starter","Step Up","Building","Challenge","Big Finish"]);
  assert.deepEqual(QUEST_PICTURES.map(p=>p.name),[
    "Prism of Possibilities","Petal Parabola","Skyline Arc",
    "Crystal Path","Nova Finale"]);
  assert.equal(QUEST_PICTURES.reduce((n,p)=>n+p.questions.length,0),50);
  for(const p of QUEST_PICTURES){
    assert.equal(questPictureById(p.id),p);
    assert.equal(questPictureForStep(p.stage),p);
    assert.equal(questQuestionCount(p),p.art.rows.length);
    assert.ok(p.art.rows.every(row=>row.length===p.art.rows[0].length));
    assert.ok(p.art.rows.every(row=>/[A-Z]/.test(row)));
    for(const q of p.questions){
      assert.ok(q.roots[0]>p.axis.min&&q.roots[1]<p.axis.max);
      assert.equal(q.factor.includes("undefined"),false);
    }
  }
  assert.equal(questPictureForStep(6),null);
  assert.equal(questPictureById("missing"),null);
});
test("The existing Prism prototype, artwork, question IDs and answers are unchanged",()=>{
  const prism=QUEST_PICTURES[0];
  assert.equal(prism.art.rows,QUEST_ART.rows);
  assert.equal(prism.questions,QUEST_QUESTIONS);
  assert.equal(QUEST_TOTAL,6);
  assert.deepEqual(prism.axis,QUEST_AXIS);
  assert.deepEqual(prism.questions.map(q=>q.id),[
    "simple-inside","simple-outside","included-inside",
    "included-outside","expanded-first","negative-leading"]);
  assert.deepEqual(quadraticAnswer(prism.questions[0]),{
    region:"between",lower:1,upper:3,
    lowerIncluded:false,upperIncluded:false
  });
  assert.deepEqual(quadraticAnswer(prism.questions[1]),{
    region:"outside",lower:-2,upper:2,
    lowerIncluded:false,upperIncluded:false
  });
});
test("Mathematics escalates from expanded monic to rearranging and non-monic",()=>{
  const [first,petals,skyline,crystal,nova]=QUEST_PICTURES;
  assert.equal(petals.questions.length,8);
  assert.ok(petals.questions.slice(0,7).every(q=>q.form==="expanded"&&q.a===1));
  assert.ok(petals.questions.at(-1).a<0);
  assert.ok(skyline.questions.every(q=>q.form==="rearranged"));
  assert.ok(skyline.questions.every(q=>q.rhs!==0));
  assert.ok(crystal.questions.some(q=>q.form==="scaled"));
  assert.ok(crystal.questions.filter(q=>Math.abs(q.a)>1).length>=10);
  assert.ok(nova.questions.some(q=>q.form==="factorised"));
  assert.ok(nova.questions.some(q=>q.form==="scaled"));
  assert.ok(nova.questions.some(q=>q.form==="expanded"));
  assert.ok(nova.questions.some(q=>q.form==="rearranged"));
  assert.ok(nova.questions.some(q=>q.a<0));
  assert.equal(first.questions.length,6);
});
test("Authored display is generated from roots, leading coefficient and RHS",()=>{
  const skyline=QUEST_PICTURES[2],crystal=QUEST_PICTURES[3];
  assert.equal(skyline.questions[0].expression,"x² + x < 6");
  assert.equal(skyline.questions[1].expression,"x² − 3x ≥ 4");
  assert.equal(skyline.questions[4].expression,"x² > 9");
  assert.equal(skyline.questions[7].expression,"−x² + 3x > 2");
  assert.equal(crystal.questions[0].expression,"2(x + 3)(x − 1) > 0");
  assert.equal(crystal.questions[5].expression,"2x² − 2x − 12 < 0");
  assert.equal(crystal.questions[9].factor,"−2x(x − 3)");
  assert.equal(quadraticStandardForm(skyline.questions[0]),"x² + x − 6 < 0");
  for(const p of QUEST_PICTURES.slice(1))for(const q of p.questions)
    assert.equal(q.expression,formatQuadraticQuestion(q),q.id);
});
test("All displayed quadratic answer regions agree with the real polynomial",()=>{
  for(const p of QUEST_PICTURES)for(const q of p.questions){
    const solution=quadraticAnswer(q);
    assert.ok(quadraticValue(q,q.roots[0])===0,q.id);
    assert.ok(quadraticValue(q,q.roots[1])===0,q.id);
    for(let x=p.axis.min-10;x<=p.axis.max+10;x+=0.125)
      assert.equal(quadraticIsTrue(q,x),quadraticAnswerContains(solution,x),
        q.id+" disagrees at x="+x);
  }
});
test("Both unbounded rays and excluded or included roots are marked precisely",()=>{
  for(const p of QUEST_PICTURES)for(const q of p.questions){
    const solution=quadraticAnswer(q),included=q.operator.includes("=");
    assert.equal(quadraticAnswerContains(solution,q.roots[0]),included);
    assert.equal(quadraticAnswerContains(solution,q.roots[1]),included);
    assert.equal(sameQuadraticAnswer(solution,{...solution}),true);
    for(const incorrect of [
      {...solution,region:solution.region==="outside"?"between":"outside"},
      {...solution,lower:solution.lower-1},
      {...solution,upper:solution.upper+1},
      {...solution,lowerIncluded:!solution.lowerIncluded},
      {...solution,upperIncluded:!solution.upperIncluded}
    ])assert.equal(sameQuadraticAnswer(solution,incorrect),false,q.id);
  }
  assert.equal(quadraticSolutionText(quadraticAnswer(QUEST_QUESTIONS[1])),
    "x < −2  or  x > 2");
  assert.equal(quadraticSolutionText(quadraticAnswer(QUEST_QUESTIONS[3])),
    "x ≤ −1  or  x ≥ 3");
});
test("Hint sequences and full worked explanations suit all fifty questions",()=>{
  for(const p of QUEST_PICTURES)for(const q of p.questions){
    const hints=quadraticHints(q),explanation=quadraticExplanation(q);
    assert.equal(hints.length,3);
    assert.match(hints[0],/root|Factorise|rearrange/i);
    assert.match(hints[1],/roots are/i);
    assert.match(hints[2],/opens/i);
    assert.ok(explanation.includes(q.factor),q.id+" missing factorisation");
    assert.ok(explanation.includes(quadraticSolutionText(quadraticAnswer(q))));
    if(q.form==="rearranged")
      assert.ok(explanation.includes("Rearrange to"));
  }
});
test("Existing v1 completed Prism progress migrates to independent v2 saves",()=>{
  const old={done:6,firstTry:4,attempts:8,hints:2,replay:1};
  const db=new Map([[QUEST_SAVE_KEY,JSON.stringify(old)]]);
  const storage={getItem:key=>db.has(key)?db.get(key):null,
    setItem:(key,value)=>db.set(key,value)};
  const migrated=readQuadraticSave(storage);
  assert.deepEqual(migrated.progress.prism,old);
  assert.equal(migrated.selectedPicture,"petals",
    "Completed prototype should suggest the next unfinished picture");
  assert.deepEqual(QUEST_PICTURES.slice(1).map(p=>migrated.progress[p.id].done),
    [0,0,0,0]);
  assert.deepEqual(JSON.parse(storage.getItem(QUEST_SAVE_KEY)),old,
    "Legacy key is left untouched during migration");
  const partial={done:3,firstTry:2,attempts:5,hints:1,replay:0};
  const db2=new Map([[QUEST_SAVE_KEY,JSON.stringify(partial)]]);
  assert.equal(readQuadraticSave({getItem:k=>db2.get(k)||null}).progress.prism.done,3);
  assert.equal(readQuadraticSave({getItem:k=>db2.get(k)||null}).selectedPicture,"prism");
});
test("Version-two selections and progress remain independent and validate corrupt values",()=>{
  const save={selectedPicture:"crystal",progress:{
    prism:{done:6,firstTry:5,attempts:8,hints:0,replay:0},
    petals:{done:8,firstTry:8,attempts:8,hints:0,replay:2},
    skyline:{done:10,firstTry:8,attempts:12,hints:1,replay:1},
    crystal:{done:4,firstTry:3,attempts:7,hints:1,replay:0},
    nova:{done:999,firstTry:999,attempts:0,hints:0,replay:0}
  }};
  const storage={getItem:key=>key===QUEST_SAVE_KEY_V2?JSON.stringify(save):null};
  const restored=readQuadraticSave(storage);
  assert.equal(restored.selectedPicture,"crystal");
  assert.equal(restored.progress.crystal.done,4);
  assert.equal(restored.progress.petals.replay,2);
  assert.equal(restored.progress.nova.done,0);
  assert.equal(readQuadraticSave({getItem:()=>"{bad"}).progress.prism.done,0);
});
