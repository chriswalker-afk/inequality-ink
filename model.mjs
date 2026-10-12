// Pure mathematics for Inequality Ink.
// All picture shapes, colours and per-row instructions live in pictures.mjs.
// The reusable picture engine (picture-engine.mjs) derives questions from them.
export const LEVELS=Object.freeze({
  mirror:{name:"Mirror Mode",subtitle:"Start here · one-sided inequalities",
    detail:"Read or represent ordinary one-sided inequalities to reveal a mystery picture."},
  full:{name:"Full Picture",subtitle:"Build both ends · bounded inequalities",
    detail:"Shade an exact interval across the whole picture."},
  solve:{name:"Solve & Paint",subtitle:"Algebra challenge · solve then draw",
    detail:"Rearrange inequalities before drawing their solutions."},
  mixed:{name:"Mixed Challenge",subtitle:"A little of everything",
    detail:"Switch between mirrored, bounded and algebra questions."},
  paint:{name:"Paint by Inequalities",subtitle:"Paint the pixels · one colour rule at a time",
    detail:"Choose a colour and paint the integer squares satisfying each inequality. One row at a time."}
});
export const LEVEL_IDS=Object.freeze(Object.keys(LEVELS));
export const isInInterval=(x,interval)=>{
  if(interval.direction==="right")
    return interval.included?x>=interval.at:x>interval.at;
  if(interval.direction==="left")
    return interval.included?x<=interval.at:x<interval.at;
  if(interval.direction==="between")
    return (interval.lowerIncluded?x>=interval.lower:x>interval.lower)&&
      (interval.upperIncluded?x<=interval.upper:x<interval.upper);
  throw Error("Unknown interval direction");
};
export function identicalSolution(a,b){
  if(!a||!b||a.direction!==b.direction)return false;
  if(a.direction==="between")
    return a.lower===b.lower&&a.upper===b.upper&&
      a.lowerIncluded===b.lowerIncluded&&a.upperIncluded===b.upperIncluded;
  if(a.direction==="left"||a.direction==="right")
    return a.at===b.at&&a.included===b.included;
  return false;
}
export const withDirection=i=>({...i,direction:i.direction||"between"});
export const fmt=n=>String(n).replace(/-/g,"−");
export function formatInterval(i){
  if(i.direction==="right")return `x ${i.included?"≥":">"} ${fmt(i.at)}`;
  if(i.direction==="left")return `x ${i.included?"≤":"<"} ${fmt(i.at)}`;
  if(i.direction==="between")
    return `${fmt(i.lower)} ${i.lowerIncluded?"≤":"<"} x ${i.upperIncluded?"≤":"<"} ${fmt(i.upper)}`;
  throw Error("Invalid interval");
}
export function formatLinear(i,a,b){
  if(i.direction!=="between"||!Number.isInteger(a)||a===0||
     !Number.isInteger(b))throw Error("Invalid linear transformation");
  const lower=a>0?a*i.lower+b:a*i.upper+b;
  const upper=a>0?a*i.upper+b:a*i.lower+b;
  const lowerIncluded=a>0?i.lowerIncluded:i.upperIncluded;
  const upperIncluded=a>0?i.upperIncluded:i.lowerIncluded;
  const term=Math.abs(a)===1?"x":`${Math.abs(a)}x`;
  const middle=a<0&&b!==0?
    `${fmt(b)} − ${term}`:
    `${a<0?"−":""}${term}${b>0?" + "+b:b<0?" − "+Math.abs(b):""}`;
  return `${fmt(lower)} ${lowerIncluded?"≤":"<"} ${middle} ${upperIncluded?"≤":"<"} ${fmt(upper)}`;
}
export const TUTORIAL=Object.freeze([
  {mode:"tutorial",prompt:"Shade every value greater than or equal to −2.",
    equation:"x ≥ −2",answer:{direction:"right",at:-2,included:true}},
  {mode:"tutorial",prompt:"Now shade the values between these endpoints.",
    equation:"−2 < x ≤ 3",answer:{direction:"between",
      lower:-2,upper:3,lowerIncluded:false,upperIncluded:true}}
]);
export const TUTORIAL_MIRROR=Object.freeze([
  {mode:"tutorial",prompt:"Draw the closed circle and shade left.",
    equation:"x ≤ 4",answer:{direction:"left",at:4,included:true}},
  {mode:"tutorial",prompt:"Now draw an open circle and shade right.",
    equation:"x > 3",answer:{direction:"right",at:3,included:false}}
]);
export const tutorialFor=level=>level==="mirror"?TUTORIAL_MIRROR:TUTORIAL;
