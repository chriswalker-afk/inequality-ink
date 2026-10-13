import test from "node:test";
import assert from "node:assert/strict";
import {
  QUEST_QUESTIONS,QUEST_TOTAL,QUEST_ART,QUEST_AXIS,QUEST_SAVE_KEY,
  quadraticValue,quadraticIsTrue,quadraticAnswer,
  quadraticAnswerContains,sameQuadraticAnswer,
  quadraticSolutionText,quadraticHints,quadraticExplanation,validateQuadraticQuest
} from "./quadratic-quest.mjs";

test("The first Quest is six ordered questions unlocking six decorative rows",()=>{
  assert.equal(validateQuadraticQuest(),true);
  assert.equal(QUEST_TOTAL,6);
  assert.equal(QUEST_ART.rows.length,6);
  assert.equal(new Set(QUEST_QUESTIONS.map(q=>q.id)).size,6);
  assert.ok(QUEST_ART.rows.every(row=>row.length===10));
  assert.ok(QUEST_SAVE_KEY.includes("quadratic"));
  assert.deepEqual(QUEST_QUESTIONS.map(q=>q.form),
    ["factorised","factorised","factorised","factorised","expanded","expanded"]);
});
test("The first two questions teach inside then outside with strict roots",()=>{
  assert.deepEqual(quadraticAnswer(QUEST_QUESTIONS[0]),{
    region:"between",lower:1,upper:3,
    lowerIncluded:false,upperIncluded:false
  });
  assert.deepEqual(quadraticAnswer(QUEST_QUESTIONS[1]),{
    region:"outside",lower:-2,upper:2,
    lowerIncluded:false,upperIncluded:false
  });
});
test("Inclusive quadratic roots are selected in both inside and outside cases",()=>{
  for(const index of [2,3,5]){
    const q=QUEST_QUESTIONS[index],answer=quadraticAnswer(q);
    assert.ok(quadraticAnswerContains(answer,q.roots[0]));
    assert.ok(quadraticAnswerContains(answer,q.roots[1]));
    assert.ok(quadraticIsTrue(q,q.roots[0]));
    assert.ok(quadraticIsTrue(q,q.roots[1]));
    assert.equal(answer.lowerIncluded,true);
    assert.equal(answer.upperIncluded,true);
  }
  for(const index of [0,1,4]){
    const q=QUEST_QUESTIONS[index],answer=quadraticAnswer(q);
    assert.ok(!quadraticAnswerContains(answer,q.roots[0]));
    assert.ok(!quadraticAnswerContains(answer,q.roots[1]));
  }
});
test("Every interval agrees with its quadratic for real—not just integer—values",()=>{
  for(const q of QUEST_QUESTIONS){
    const sol=quadraticAnswer(q);
    for(let x=QUEST_AXIS.min-5;x<=QUEST_AXIS.max+5;x+=0.125)
      assert.equal(quadraticIsTrue(q,x),quadraticAnswerContains(sol,x),
        q.id+" disagreement at "+x);
  }
});
test("Two unbounded rays must both be selected, and strictness marked exactly",()=>{
  const solution=quadraticAnswer(QUEST_QUESTIONS[3]);
  assert.equal(sameQuadraticAnswer(solution,{...solution}),true);
  for(const attempt of [
    {...solution,region:"between"},
    {...solution,lower:solution.lower-1},
    {...solution,upper:solution.upper+1},
    {...solution,lowerIncluded:false},
    {...solution,upperIncluded:false}
  ])assert.equal(sameQuadraticAnswer(solution,attempt),false);
  assert.equal(quadraticSolutionText(quadraticAnswer(QUEST_QUESTIONS[1])),
    "x < −2  or  x > 2");
  assert.equal(quadraticSolutionText(quadraticAnswer(QUEST_QUESTIONS[3])),
    "x ≤ −1  or  x ≥ 3");
});
test("The final question correctly reverses the usual upward parabola logic",()=>{
  const q=QUEST_QUESTIONS[5],answer=quadraticAnswer(q);
  assert.equal(quadraticValue(q,0),8);
  assert.equal(q.a,-1);
  assert.equal(answer.region,"between");
  assert.equal(answer.lower,-2);
  assert.equal(answer.upper,4);
  assert.equal(quadraticSolutionText(answer),"−2 ≤ x ≤ 4");
});
test("Hints and explanations follow the lesson without auto-filling an answer",()=>{
  for(const q of QUEST_QUESTIONS){
    const hints=quadraticHints(q);
    assert.equal(hints.length,3);
    assert.match(hints[0],/root|Factorise/i);
    assert.match(hints[1],/roots are/);
    assert.match(hints[2],/opens/);
    assert.ok(quadraticExplanation(q).includes(quadraticSolutionText(quadraticAnswer(q))));
  }
});
