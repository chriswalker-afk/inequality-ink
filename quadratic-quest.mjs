// A self-contained quadratic-inequality extension to Inequality Ink.
// A correct REAL solution unlocks a decorative row; its pixels are not an
// integer sampling of the quadratic solution set (which can be disconnected).
export const QUEST_SAVE_KEY="inequality-ink-quadratic-quest-v1";
export const QUEST_AXIS=Object.freeze({min:-5,max:5});
export const QUEST_ART=Object.freeze({
  name:"Prism of Possibilities",
  clue:"A Bright Discovery",
  rows:Object.freeze([
    "....TT....",
    "...TTTT...",
    "..TTBBTT..",
    "..TBBBBT..",
    "...TBBT...",
    "....TT...."
  ]),
  colours:Object.freeze({T:"#6eafa9",B:"#526fa5"})
});
export const QUEST_QUESTIONS=Object.freeze([
  {id:"simple-inside",form:"factorised",a:1,roots:[1,3],operator:"<",
    expression:"(x − 1)(x − 3) < 0",factor:"(x − 1)(x − 3)"},
  {id:"simple-outside",form:"factorised",a:1,roots:[-2,2],operator:">",
    expression:"(x + 2)(x − 2) > 0",factor:"(x + 2)(x − 2)"},
  {id:"included-inside",form:"factorised",a:1,roots:[-3,1],operator:"<=",
    expression:"(x + 3)(x − 1) ≤ 0",factor:"(x + 3)(x − 1)"},
  {id:"included-outside",form:"factorised",a:1,roots:[-1,3],operator:">=",
    expression:"(x + 1)(x − 3) ≥ 0",factor:"(x + 1)(x − 3)"},
  {id:"expanded-first",form:"expanded",a:1,roots:[-3,2],operator:"<",
    expression:"x² + x − 6 < 0",factor:"(x + 3)(x − 2)"},
  {id:"negative-leading",form:"expanded",a:-1,roots:[-2,4],operator:">=",
    expression:"−x² + 2x + 8 ≥ 0",factor:"−(x + 2)(x − 4)"}
]);
export const QUEST_TOTAL=QUEST_QUESTIONS.length;

export function quadraticValue(q,x){
  return q.a*(x-q.roots[0])*(x-q.roots[1]);
}
export function quadraticIsTrue(q,x){
  const v=quadraticValue(q,x);
  switch(q.operator){
    case "<":return v<0;
    case ">":return v>0;
    case "<=":return v<=0;
    case ">=":return v>=0;
    default:throw Error("Unrecognised quadratic comparator");
  }
}
export function quadraticAnswer(q){
  const [lower,upper]=q.roots;
  const asksNegative=q.operator[0]==="<";
  const inside=asksNegative===(q.a>0);
  const included=q.operator.endsWith("=");
  return {region:inside?"between":"outside",lower,upper,
    lowerIncluded:included,upperIncluded:included};
}
export function quadraticAnswerContains(answer,x){
  const above=x>answer.lower||(answer.lowerIncluded&&x===answer.lower);
  const below=x<answer.upper||(answer.upperIncluded&&x===answer.upper);
  return answer.region==="between"?above&&below:
    answer.region==="outside"?!above||!below:false;
}
export function sameQuadraticAnswer(expected,attempt){
  if(!attempt||!["between","outside"].includes(attempt.region))return false;
  return expected.region===attempt.region&&expected.lower===attempt.lower&&
    expected.upper===attempt.upper&&
    expected.lowerIncluded===attempt.lowerIncluded&&
    expected.upperIncluded===attempt.upperIncluded;
}
function num(n){return n<0?"−"+Math.abs(n):String(n);}
export function quadraticSolutionText(answer){
  const l=num(answer.lower),r=num(answer.upper);
  if(answer.region==="between")return l+(answer.lowerIncluded?" ≤ ":" < ")+
    "x"+(answer.upperIncluded?" ≤ ":" < ")+r;
  return "x "+(answer.lowerIncluded?"≤":"<")+" "+l+"  or  "+
    "x "+(answer.upperIncluded?"≥":">")+" "+r;
}
export function quadraticHints(q){
  const answer=quadraticAnswer(q);
  const sign=q.operator[0]==="<"?"below":"above";
  return [
    q.form==="factorised"?
      "Start by setting each bracket equal to zero. These give the roots.":
      "Factorise the quadratic first. Which two integer roots have the right sum and product?",
    "The roots are x = "+num(answer.lower)+" and x = "+num(answer.upper)+
      ". They split the number line into three regions.",
    "The parabola opens "+(q.a>0?"upwards":"downwards")+
      ". We want where it is "+sign+" the x-axis. Decide whether that is between or outside the roots; then check whether the roots are included."
  ];
}
export function quadraticExplanation(q){
  return "Factorise as "+q.factor+". The roots are x = "+
    num(q.roots[0])+" and x = "+num(q.roots[1])+
    ". The parabola opens "+(q.a>0?"upwards":"downwards")+
    ", so "+q.expression+" gives "+quadraticSolutionText(quadraticAnswer(q))+".";
}
export function validateQuadraticQuest(){
  if(QUEST_TOTAL!==6||QUEST_ART.rows.length!==QUEST_TOTAL)
    throw Error("The first Quest must have exactly six picture questions.");
  const width=QUEST_ART.rows[0].length;
  if(width<6||QUEST_ART.rows.some(row=>row.length!==width||
    [...row].some(c=>c!=="."&&!QUEST_ART.colours[c])))
    throw Error("Invalid Quadratic Quest pixel art.");
  const ids=new Set(),categories=new Set();
  for(const q of QUEST_QUESTIONS){
    if(ids.has(q.id))throw Error("Duplicate Quadratic Quest question");
    ids.add(q.id);
    if(!Number.isInteger(q.a)||q.a===0||!Array.isArray(q.roots)||
       q.roots.length!==2||q.roots[0]>=q.roots[1]||
       q.roots.some(r=>!Number.isInteger(r)||r<=QUEST_AXIS.min||r>=QUEST_AXIS.max))
      throw Error("Quadratic Quest needs two distinct, visible integer roots.");
    if(!["<",">","<=",">="].includes(q.operator)||
       !["factorised","expanded"].includes(q.form))
      throw Error("Unsupported quadratic inequality.");
    // Also verify the authored equation's stated a,b,c from its roots
    // against each exact real solution, not merely against pixel colours.
    const answer=quadraticAnswer(q);categories.add(answer.region);
    for(let n=-100;n<=100;n++){
      const x=n/8;
      if(quadraticIsTrue(q,x)!==quadraticAnswerContains(answer,x))
        throw Error("Incorrect quadratic solution: "+q.id+" at "+x);
    }
  }
  if(categories.size!==2)throw Error("The introduction needs both regions.");
  return true;
}
