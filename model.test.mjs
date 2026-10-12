import test from "node:test";
import assert from "node:assert/strict";
import {
 LEVELS,LEVEL_IDS,isInInterval,identicalSolution,withDirection,
 fmt,formatInterval,formatLinear,TUTORIAL,TUTORIAL_MIRROR,tutorialFor
} from "./model.mjs";

test("Mathematical modes and tutorials are independent from pictures",()=>{
 assert.deepEqual([...LEVEL_IDS],["mirror","full","solve","mixed","paint"]);
 assert.equal(tutorialFor("mirror"),TUTORIAL_MIRROR);
 assert.equal(tutorialFor("full"),TUTORIAL);
 assert.equal(tutorialFor("solve"),TUTORIAL);
 assert.equal(LEVELS.paint.name,"Paint by Inequalities");
 assert.ok(Object.keys(LEVELS).length===5);
 assert.equal(TUTORIAL.length,2);
 assert.equal(TUTORIAL_MIRROR.length,2);
});
test("Open and closed endpoints are assessed as different real solutions",()=>{
 const a={direction:"left",at:3,included:false}; // x < 3
 const b={direction:"left",at:2,included:true};  // x <= 2
 assert.equal(isInInterval(2,a),true);
 assert.equal(isInInterval(3,a),false);
 assert.equal(isInInterval(-10000,a),true);
 assert.equal(identicalSolution(a,b),false);
 const c={direction:"right",at:3,included:false};
 const d={direction:"right",at:3,included:true};
 assert.equal(isInInterval(3,c),false);
 assert.equal(isInInterval(3,d),true);
 assert.equal(identicalSolution(c,d),false);
 assert.equal(identicalSolution(d,{...d}),true);
});
test("Double-ended intervals and strictness are exact over the real numbers",()=>{
 const i={direction:"between",lower:-4,upper:3,
   lowerIncluded:false,upperIncluded:true};
 assert.equal(isInInterval(-4,i),false);
 assert.equal(isInInterval(-3.999,i),true);
 assert.equal(isInInterval(3,i),true);
 assert.equal(isInInterval(3.001,i),false);
 assert.equal(identicalSolution(i,{...i}),true);
 assert.equal(identicalSolution(i,{...i,upperIncluded:false}),false);
 assert.equal(identicalSolution(i,{direction:"left",at:3,included:true}),false);
 assert.equal(withDirection({lower:-4,upper:3}).direction,"between");
});
test("Inequality strings have correct open/closed endpoints and mathematical notation",()=>{
 assert.equal(formatInterval({direction:"left",at:3,included:false}),"x < 3");
 assert.equal(formatInterval({direction:"right",at:-2,included:true}),"x ≥ −2");
 assert.equal(formatInterval({direction:"between",lower:-4,upper:3,
   lowerIncluded:false,upperIncluded:true}),"−4 < x ≤ 3");
 assert.equal(fmt(-9),"−9");
 assert.throws(()=>formatInterval({direction:"weird"}),/Invalid/);
});
test("Negative-coefficient algebra correctly reverses both signs",()=>{
 const i={direction:"between",lower:-3,upper:2,
   lowerIncluded:false,upperIncluded:false};
 assert.equal(formatLinear(i,-2,1),"−3 < 1 − 2x < 7");
 const j={direction:"between",lower:-4,upper:3,
   lowerIncluded:true,upperIncluded:false};
 assert.equal(formatLinear(j,-1,1),"−2 < 1 − x ≤ 5");
 assert.equal(formatLinear(j,2,1),"−7 ≤ 2x + 1 < 7");
 assert.throws(()=>formatLinear(i,0,1),/Invalid/);
 assert.throws(()=>formatLinear({direction:"left",at:3,included:true},2,1),/Invalid/);
});
