// Phase 4 learning helpers. Pure maths and short, *on-request* explanations.
// Nothing in this module opens help, changes an answer, or alters saved progress.
import {pointSatisfiesRegion} from "./regions-engine.mjs";
import {satisfies,functionValue,signedDifference} from "./curved-engine.mjs";

const addOnce=(items,value)=>{if(!items.includes(value))items.push(value);};
export function pictureSkills(picture,mode){
  const rules=(picture?.pieces||[]).flatMap(part=>part.rules||[]);
  const labels=[];
  if(mode==="plot")addOnce(labels,"Sketching graphs");
  if(mode==="fill"||mode==="build")addOnce(labels,"Coordinate regions");
  if(rules.some(r=>r.kind==="function"&&r.coeffs.some((c,i)=>i>=2&&c!==0)))
    addOnce(labels,"Parabolas");
  if(rules.some(r=>r.kind==="absolute"))addOnce(labels,"V-shaped graphs");
  if(rules.some(r=>r.kind==="circle"))addOnce(labels,"Circles");
  if(rules.some(r=>r.kind==="function"&&r.coeffs.every((c,i)=>i<2||c===0)))
    addOnce(labels,"Straight lines");
  if(rules.some(r=>r.kind==="vertical"))addOnce(labels,"Vertical boundaries");
  if(rules.some(r=>r.kind==null&&(r.a===0||r.b===0)))
    addOnce(labels,"Horizontal & vertical lines");
  if(rules.some(r=>r.kind==null&&r.a!==0&&r.b!==0))
    addOnce(labels,"Gradients");
  if(rules.some(r=>r.form==="standard"))addOnce(labels,"Standard form");
  if(rules.some(r=>!r.inclusive))addOnce(labels,"Strict inequalities");
  return labels.length?labels:["Simultaneous inequalities"];
}

const allowed=(rule,x,y)=>rule.kind?satisfies(rule,x,y):pointSatisfiesRegion(rule,x,y);
const format=n=>{
  const rounded=Number(n.toFixed(4));
  return String(Object.is(rounded,-0)?0:rounded).replace(/-/g,"−");
};
const relation=(greater,inclusive)=>greater?
  (inclusive?"≥":">"):(inclusive?"≤":"<");
function comparison(rule,x,y){
  if(!rule.kind){
    // All stored linear rules are a*x+b*y <= c. Rearrange as x or y
    // so the substitution matches the student-facing variable.
    if(rule.b!==0)return format(y)+" "+relation(rule.b<0,rule.inclusive)+
      " "+format((rule.c-rule.a*x)/rule.b);
    return format(x)+" "+relation(rule.a<0,rule.inclusive)+
      " "+format(rule.c/rule.a);
  }
  if(rule.kind==="vertical")
    return format(x)+" "+relation(rule.side==="right",rule.inclusive)+" "+format(rule.x);
  if(rule.kind==="circle"){
    const distance=(x-rule.cx)**2+(y-rule.cy)**2;
    return format(distance)+" "+relation(rule.side==="outside",rule.inclusive)+
      " "+format(rule.r**2);
  }
  return format(y)+" "+relation(rule.side==="above",rule.inclusive)+
    " "+format(functionValue(rule,x));
}
function awayFromBoundary(rule,x,y){
  if(!rule.kind)
    return Math.abs(rule.a*x+rule.b*y-rule.c)/Math.hypot(rule.a,rule.b);
  if(rule.kind==="vertical")return Math.abs(x-rule.x);
  if(rule.kind==="circle")
    return Math.abs(Math.hypot(x-rule.cx,y-rule.cy)-rule.r);
  return Math.abs(signedDifference(rule,x,y))/
    (1+Math.abs(rule.kind==="absolute"?rule.a:
      rule.coeffs.reduce((s,c,i)=>i?s+i*c*x**(i-1):s,0)));
}
function representative(rules,x,y){
  // Choose an easy half-integer test point from the *same sign cell*
  // whenever one exists. Otherwise keep the original tap position.
  const signs=rules.map(rule=>allowed(rule,x,y));
  let best=null,bestDistance=Infinity;
  for(let a=-4.5;a<=4.5;a+=.5)for(let b=-4.5;b<=4.5;b+=.5){
    if(!rules.every((rule,i)=>allowed(rule,a,b)===signs[i]&&
      awayFromBoundary(rule,a,b)>.12))continue;
    const distance=(a-x)**2+(b-y)**2;
    if(distance<bestDistance){bestDistance=distance;best={x:a,y:b};}
  }
  return best||{x:Number(x.toFixed(6)),y:Number(y.toFixed(6))};
}
export function explainRegionChoice(rules,coordinate){
  if(!Array.isArray(rules)||!rules.length||
    !Number.isFinite(coordinate?.x)||!Number.isFinite(coordinate?.y))return null;
  const {x,y}=representative(rules,coordinate.x,coordinate.y);
  const failed=rules.find(rule=>!allowed(rule,x,y));
  const example=failed||rules[0];
  const point="("+format(x)+", "+format(y)+")";
  if(failed)return {
    correct:false,title:"Why not this region?",
    text:"Test "+point+". The rule “"+example.text+"” becomes "+
      comparison(example,x,y)+" (false). This inequality rules out that region."
  };
  return {
    correct:true,title:"Why does this region work?",
    text:"Test "+point+". For example, “"+example.text+"” becomes "+
      comparison(example,x,y)+" (true). This point satisfies all "+
      rules.length+" inequalities; the coloured region is their common solution."
  };
}
