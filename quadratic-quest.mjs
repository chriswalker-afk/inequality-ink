import {QUEST_EXTRA_DEFINITIONS} from "./quadratic-quest-extra.mjs";

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

// Full five-picture journey. The original six Prism questions and artwork above
// are intentionally unchanged so a student's completed prototype can migrate.
export const QUEST_LEGACY_SAVE_KEY=QUEST_SAVE_KEY;
export const QUEST_SAVE_KEY_V2="inequality-ink-quadratic-quest-v2";
export const QUEST_STAGE_NAMES=Object.freeze([
  "Quick Spark","Step Up","Ink Builder","Brain Stretch","Masterpiece"
]);
const sign=n=>n<0?"− "+Math.abs(n):"+ "+n;
function quadraticTerm(coefficient,power,first=false){
  if(coefficient===0)return "";
  const absolute=Math.abs(coefficient),symbol=power===2?"x²":power===1?"x":"";
  const number=symbol&&absolute===1?"":String(absolute);
  const part=number+symbol;
  return (first?(coefficient<0?"−":""):(coefficient<0?" − ":" + "))+part;
}
function expandedPolynomial(a,b,c){
  const coefficients=[[a,2],[b,1],[c,0]];
  let result="";
  for(const [coeff,power] of coefficients){
    if(coeff)result+=quadraticTerm(coeff,power,result.length===0);
  }
  return result||"0";
}
function rootFactor(root){
  if(root===0)return "x";
  return "(x "+(root<0?"+ "+(-root):"− "+root)+")";
}
function factorForm(a,roots){
  const scalar=a===1?"":a===-1?"−":a<0?"−"+Math.abs(a):String(a);
  return scalar+rootFactor(roots[0])+rootFactor(roots[1]);
}
const signGlyph=Object.freeze({"<":"<",">":">","<=":"≤",">=":"≥"});
// Generate displayed equations from their exact mathematical coefficients:
// q(x) = a(x-r1)(x-r2). A rearranged question displays q(x)+rhs ? rhs.
export function formatQuadraticQuestion(q){
  const factor=factorForm(q.a,q.roots);
  const rhs=q.rhs||0;
  const b=-q.a*(q.roots[0]+q.roots[1]);
  const c=q.a*q.roots[0]*q.roots[1]+rhs;
  const expression=(q.form==="factorised"||q.form==="scaled")?factor:
    expandedPolynomial(q.a,b,c);
  return expression+" "+signGlyph[q.operator]+" "+rhs;
}
export function quadraticStandardForm(q){
  const b=-q.a*(q.roots[0]+q.roots[1]);
  const c=q.a*q.roots[0]*q.roots[1];
  return expandedPolynomial(q.a,b,c)+" "+signGlyph[q.operator]+" 0";
}
function makeQuestion(id,form,a,lower,upper,operator,rhs=0){
  const q={id,form,a,roots:Object.freeze([lower,upper]),operator,rhs};
  q.factor=factorForm(a,q.roots);
  q.expression=formatQuadraticQuestion(q);
  return Object.freeze(q);
}
function makePicture(id,name,stage,focus,axis,art,questions){
  return Object.freeze({
    id,name,stage,stageLabel:QUEST_STAGE_NAMES[stage-1],focus,
    axis:Object.freeze({...axis}),art:Object.freeze({
      rows:Object.freeze(art.rows),colours:Object.freeze(art.colours)
    }),questions:Object.freeze(questions)
  });
}
export const QUEST_CORE_PICTURES=Object.freeze([
  makePicture("prism","Prism of Possibilities",1,
    "Find the roots; choose between or outside",QUEST_AXIS,QUEST_ART,QUEST_QUESTIONS),
  makePicture("petals","Petal Parabola",2,
    "Factorise expanded monic quadratics",{min:-6,max:6},
    {rows:[
      ".....YY.....",
      "...PPPPPP...",
      "..PPYPPYPP..",
      "...PPYYPP...",
      "....GGGG....",
      "...GGGGGG...",
      "....GTTG....",
      "...TTTTTT..."
    ],colours:{Y:"#eeb65c",P:"#d687ad",G:"#72a57d",T:"#b17854"}},
    [
      makeQuestion("p2-01","expanded",1,-2,1,"<"),
      makeQuestion("p2-02","expanded",1,-1,3,">="),
      makeQuestion("p2-03","expanded",1,-4,2,">"),
      makeQuestion("p2-04","expanded",1,1,4,"<="),
      makeQuestion("p2-05","expanded",1,-3,1,"<="),
      makeQuestion("p2-06","expanded",1,-2,4,">"),
      makeQuestion("p2-07","expanded",1,-4,-1,">="),
      makeQuestion("p2-08","expanded",-1,-1,2,"<")
    ]),
  makePicture("skyline","Skyline Arc",3,
    "Rearrange to zero, then factorise",{min:-7,max:7},
    {rows:[
      "......YY......",
      "...Y..YY..Y...",
      "....BBBBBB....",
      "...BBBBBBBB...",
      "...BBBBBBBB...",
      ".B.BBBBBBBB.B.",
      ".B.BBBBBBBB.B.",
      ".BBBBBBBBBBBB.",
      ".BBBBWWBBBBBB.",
      "BBBBBWWBBBBBBB"
    ],colours:{Y:"#e9b96c",B:"#66859e",W:"#f5e7ce"}},
    [
      makeQuestion("p3-01","rearranged",1,-3,2,"<",6),
      makeQuestion("p3-02","rearranged",1,-1,4,">=",4),
      makeQuestion("p3-03","rearranged",1,2,3,"<",-6),
      makeQuestion("p3-04","rearranged",1,-3,-1,">",-3),
      makeQuestion("p3-05","rearranged",1,-3,3,">",9),
      makeQuestion("p3-06","rearranged",1,-3,4,"<=",12),
      makeQuestion("p3-07","rearranged",1,-5,2,">=",10),
      makeQuestion("p3-08","rearranged",-1,1,2,">",2),
      makeQuestion("p3-09","rearranged",1,-4,2,"<",8),
      makeQuestion("p3-10","rearranged",2,-2,3,">",12)
    ]),
  makePicture("crystal","Crystal Path",4,
    "Scaled factors and non-monic quadratics",{min:-8,max:8},
    {rows:[
      ".......TT.......",
      "......TTTT......",
      ".....TBBBBT.....",
      "....TBBBBBBT....",
      "...TBBBBBBBBT...",
      "..TBBBBGGBBBBT..",
      "..TBBBGGGGBBBT..",
      "...TBBGGGGBBT...",
      "....TBBGGBBT....",
      ".....TBBBBT.....",
      "......TTTT......",
      ".......TT......."
    ],colours:{T:"#9edac8",B:"#6a90cf",G:"#f1c885"}},
    [
      makeQuestion("p4-01","scaled",2,-3,1,">"),
      makeQuestion("p4-02","scaled",3,-2,2,"<="),
      makeQuestion("p4-03","scaled",-2,-4,1,">"),
      makeQuestion("p4-04","scaled",2,1,4,">="),
      makeQuestion("p4-05","scaled",-3,-1,3,"<="),
      makeQuestion("p4-06","expanded",2,-2,3,"<"),
      makeQuestion("p4-07","expanded",3,-3,-1,">="),
      makeQuestion("p4-08","rearranged",2,-3,2,">",12),
      makeQuestion("p4-09","scaled",-2,-2,4,"<"),
      makeQuestion("p4-10","expanded",-2,0,3,">="),
      makeQuestion("p4-11","rearranged",-2,-3,3,"<=",-18),
      makeQuestion("p4-12","scaled",3,-4,3,">=")
    ]),
  makePicture("nova","Nova Finale",5,
    "Full mixed quadratic challenge",{min:-8,max:8},
    {rows:[
      "........YY........",
      ".......YYYY.......",
      "......YYYYYY......",
      ".....YYBBBBYY.....",
      "....YYBBBBBBYY....",
      "...YYBBBBBBBBYY...",
      "..YYBBBBRRBBBBYY..",
      ".YYBBBBRRRRBBBBYY.",
      "..YYBBBBRRBBBBYY..",
      "...YYBBBBBBBBYY...",
      "....YYBBBBBBYY....",
      ".....YYBBBBYY.....",
      "......YYYYYY......",
      ".......YYYY......."
    ],colours:{Y:"#f3bb63",B:"#6a9acd",R:"#d877a3"}},
    [
      makeQuestion("p5-01","factorised",1,-2,5,"<"),
      makeQuestion("p5-02","expanded",1,-5,2,">="),
      makeQuestion("p5-03","rearranged",1,-6,1,">=",6),
      makeQuestion("p5-04","scaled",-2,-4,2,">"),
      makeQuestion("p5-05","expanded",2,-3,4,"<="),
      makeQuestion("p5-06","rearranged",2,-5,3,"<=",30),
      makeQuestion("p5-07","scaled",3,1,5,"<"),
      makeQuestion("p5-08","expanded",-3,-2,3,">="),
      makeQuestion("p5-09","rearranged",1,-7,-1,">=",-7),
      makeQuestion("p5-10","factorised",-1,-5,4,"<="),
      makeQuestion("p5-11","expanded",4,-2,5,">"),
      makeQuestion("p5-12","rearranged",-2,-3,6,">=",-36),
      makeQuestion("p5-13","scaled",-3,-6,1,">="),
      makeQuestion("p5-14","expanded",2,-5,6,"<")
    ])
]);
// Four additional original pictures in each stage. The original five stay at
// indices 0-4 with their exact authored questions, IDs and progress untouched.
export const QUEST_TIER_FOCUS=Object.freeze([
  "Factorised quadratics · roots, signs and endpoints",
  "Expanded monic quadratics · factorise first",
  "Rearrange inequalities to zero · choose the right region",
  "Scaled and non-monic quadratics · handle negative coefficients",
  "Mixed forms · decide your own method"
]);
const AXES=Object.freeze([
  {min:-5,max:5},{min:-6,max:6},{min:-7,max:7},
  {min:-8,max:8},{min:-8,max:8}
]);
const ROOT_PAIRS=Object.freeze([
  [-4,-2],[-4,-1],[-4,1],[-4,2],[-4,3],[-3,-2],[-3,0],
  [-3,2],[-3,4],[-2,-1],[-2,1],[-2,3],[-2,4],[-1,1],
  [-1,3],[-1,4],[0,2],[0,3],[1,3],[1,4],[-5,1],[-5,3],
  [-2,5],[-4,5],[-6,-2],[-6,3],[2,6],[-3,6]
]);
const SIGNS=Object.freeze(["<",">=","<=",">"]);
const MASTER_FORMS=Object.freeze([
  "factorised","expanded","rearranged","scaled","expanded",
  "rearranged","scaled","factorised","expanded","rearranged",
  "scaled","expanded","factorised","rearranged"
]);
function extraQuestions(definition,variant){
  const {stage,id}=definition,axis=AXES[stage-1];
  const candidates=ROOT_PAIRS.filter(([lo,hi])=>
    lo>axis.min&&hi<axis.max);
  const count=4+stage*2;
  return Array.from({length:count},(_,i)=>{
    const [lo,hi]=candidates[(i*11+variant*5+stage)%candidates.length];
    const operator=SIGNS[(i+variant*2)%SIGNS.length];
    let form="factorised",a=1,rhs=0;
    if(stage===2){
      form="expanded";a=i===count-1?-1:1;
    }else if(stage===3){
      form=i%4===3?"expanded":"rearranged";
      a=i>=count-2?-1:1;
      if(form==="rearranged")rhs=(i%2?-1:1)*(2+variant+i);
    }else if(stage===4){
      form=["scaled","expanded","rearranged","scaled"][i%4];
      a=[2,3,-2,2,-3,4,3,-2,-4,2,3,-3][i];
      if(form==="rearranged")rhs=(i%2?-1:1)*(4+i+variant);
    }else if(stage===5){
      form=MASTER_FORMS[i];
      a=[1,-1,2,-2,3,1,-3,4,-2,1,2,-3,-1,3][i];
      if(form==="rearranged")rhs=(i%2?-1:1)*(5+i+variant);
    }
    return makeQuestion(id+"-q"+String(i+1).padStart(2,"0"),
      form,a,lo,hi,operator,rhs);
  });
}
export const QUEST_EXTRA_PICTURES=Object.freeze(
  QUEST_EXTRA_DEFINITIONS.map(def=>{
    const variant=QUEST_EXTRA_DEFINITIONS.filter(p=>p.stage===def.stage)
      .findIndex(p=>p.id===def.id);
    return Object.freeze({
      ...makePicture(def.id,def.name,def.stage,def.focus,
        AXES[def.stage-1],def.art,extraQuestions(def,variant)),
      clue:def.clue
    });
  }));
export const QUEST_PICTURES=Object.freeze([
  ...QUEST_CORE_PICTURES,...QUEST_EXTRA_PICTURES
]);
export const questPicturesForTier=step=>
  QUEST_PICTURES.filter(p=>p.stage===step);

export function questPictureById(id){
  return QUEST_PICTURES.find(p=>p.id===id)||null;
}
export function questPictureForStep(step){
  return QUEST_CORE_PICTURES[step-1]||null;
}
export function questQuestionCount(picture){return picture.questions.length;}


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
  const left=x<answer.lower||(answer.lowerIncluded&&x===answer.lower);
  const right=x>answer.upper||(answer.upperIncluded&&x===answer.upper);
  return answer.region==="between"?above&&below:
    answer.region==="outside"?left||right:false;
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
    q.form==="rearranged"?
      "First rearrange the inequality so one side is zero. Then factorise.":
      q.form==="factorised"||q.form==="scaled"?
        "The quadratic is factorised already. Set each bracket equal to zero to find the roots.":
        "Factorise the expanded quadratic first. Look for the roots that give the right coefficients.",
    "The roots are x = "+num(answer.lower)+" and x = "+num(answer.upper)+
      ". They split the number line into three regions.",
    "The parabola opens "+(q.a>0?"upwards":"downwards")+
      ". We want where it is "+sign+" the x-axis. Decide whether that is between or outside the roots; then check whether the roots are included."
  ];
}
export function quadraticExplanation(q){
  return (q.rhs?"Rearrange to "+quadraticStandardForm(q)+". ":"")+
    "Factorise as "+q.factor+". The roots are x = "+
    num(q.roots[0])+" and x = "+num(q.roots[1])+
    ". The parabola opens "+(q.a>0?"upwards":"downwards")+
    ", so "+q.expression+" gives "+quadraticSolutionText(quadraticAnswer(q))+".";
}
// Validate the authored mathematical journey and artwork rather than assuming
// that matching integer pixels is sufficient for a quadratic inequality.
export function validateQuadraticQuest(){
  if(QUEST_PICTURES.length!==25)throw Error("Quadratic Quest needs five pictures per difficulty.");
  for(let step=1;step<=5;step++)if(questPicturesForTier(step).length!==5)
    throw Error("Quadratic Quest tier "+step+" needs five pictures.");
  const ids=new Set(),questionIds=new Set();
  const counts=[6,8,10,12,14];
  for(const [index,picture] of QUEST_PICTURES.entries()){
    const {axis,art,questions}=picture,step=picture.stage-1;
    if(ids.has(picture.id)||!Number.isInteger(picture.stage)||
      picture.stage<1||picture.stage>5||
      (index<5&&picture.stage!==index+1)||
      questions.length!==counts[step]||art.rows.length!==counts[step])
      throw Error("Invalid picture progression at "+(step+1));
    ids.add(picture.id);
    const width=art.rows[0]?.length;
    if(!Number.isInteger(width)||width<10||art.rows.some(row=>
      row.length!==width||![...row].some(c=>c!==".")||
      [...row].some(c=>c!=="."&&!Object.hasOwn(art.colours,c))))
      throw Error("Invalid art rows for "+picture.id);
    if(!Number.isInteger(axis.min)||!Number.isInteger(axis.max)||
       axis.min>=axis.max||axis.max-axis.min>20)
      throw Error("Invalid number-line axis for "+picture.id);
    const categories=new Set(),inclusions=new Set();
    for(const q of questions){
      if(questionIds.has(q.id))throw Error("Duplicate question ID "+q.id);
      questionIds.add(q.id);
      if(!Number.isInteger(q.a)||q.a===0||!Array.isArray(q.roots)||
        q.roots.length!==2||q.roots[0]>=q.roots[1]||
        q.roots.some(r=>!Number.isInteger(r)||r<=axis.min||r>=axis.max)||
        !["<",">","<=",">="].includes(q.operator)||
        !["factorised","scaled","expanded","rearranged"].includes(q.form)||
        (q.rhs!==undefined&&!Number.isInteger(q.rhs))||
        ((q.form==="factorised"||q.form==="scaled")&&(q.rhs||0)!==0))
        throw Error("Invalid quadratic question "+q.id);
      if(picture.stage>1&&q.expression!==formatQuadraticQuestion(q))
        throw Error("Displayed polynomial doesn't match the roots: "+q.id);
      const answer=quadraticAnswer(q);
      categories.add(answer.region);inclusions.add(answer.lowerIncluded);
      for(let n=axis.min*8-64;n<=axis.max*8+64;n++){
        const x=n/8;
        if(quadraticIsTrue(q,x)!==quadraticAnswerContains(answer,x))
          throw Error("Incorrect real solution for "+q.id+" at "+x);
      }
    }
    if(categories.size!==2||inclusions.size!==2)
      throw Error("Each picture must teach both solution regions and endpoint types.");
  }
  if(QUEST_PICTURES[0].art.rows!==QUEST_ART.rows||
    QUEST_PICTURES[0].questions!==QUEST_QUESTIONS)
    throw Error("Prototype data must be preserved for save migration.");
  return true;
}
