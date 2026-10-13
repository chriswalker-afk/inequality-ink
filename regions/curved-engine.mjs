// Phase 1 curved-region engine. Strictness changes boundary strokes, not area.
export const WORLD=Object.freeze({xmin:-5,xmax:5,ymin:-5,ymax:5});
const tol=1e-8;
export const q=(id,text,coeffs,side,inclusive=true)=>Object.freeze({id,text,kind:"function",coeffs,side,inclusive});
export const vertical=(id,text,x,side,inclusive=true)=>Object.freeze({id,text,kind:"vertical",x,side,inclusive});
export function functionValue(rule,x){return rule.coeffs.reduce((sum,c,i)=>sum+c*x**i,0);}
export function signedDifference(rule,x,y){
  if(rule.kind==="function")return rule.side==="above"?y-functionValue(rule,x):functionValue(rule,x)-y;
  if(rule.kind==="vertical")return rule.side==="right"?x-rule.x:rule.x-x;
  throw Error("Unsupported curve rule");
}
export function satisfies(rule,x,y){
  const d=signedDifference(rule,x,y);
  return rule.inclusive?d>=-tol:d>tol;
}
export const satisfiesAll=(rules,x,y)=>rules.every(r=>satisfies(r,x,y));
export function rangeAtX(rules,x,world=WORLD){
  let lo=world.ymin,hi=world.ymax;
  for(const r of rules){
    if(r.kind==="vertical"){
      // Boundary membership is checked exactly by satisfies(); fills remain closed geometrically.
      if(signedDifference(r,x,0)<-tol)return null;
    }else if(r.kind==="function"){
      const y=functionValue(r,x);
      if(r.side==="above")lo=Math.max(lo,y);
      else hi=Math.min(hi,y);
    }else throw Error("Unsupported curve rule");
  }
  return hi-lo>tol?{lo,hi}:null;
}
// A slice boundary is clipped at its exact y values; sampled x only controls
// display smoothness. Mathematics and hit-testing always use the original rules.
export function regionPaths(rules,world=WORLD,steps=700){
  if(!Number.isInteger(steps)||steps<10)throw Error("Invalid resolution");
  const runs=[];let run=[];
  function finish(){if(run.length>1)runs.push(run);run=[];}
  for(let i=0;i<=steps;i++){
    const x=world.xmin+(world.xmax-world.xmin)*i/steps;
    const interval=rangeAtX(rules,x,world);
    if(interval)run.push({x,...interval});
    else finish();
  }
  finish();
  return runs.map(points=>{
    const top=points.map(p=>({x:p.x,y:p.hi}));
    const bottom=[...points].reverse().map(p=>({x:p.x,y:p.lo}));
    return [...top,...bottom];
  });
}
export function boundaryPoints(rule,world=WORLD,steps=320){
  if(rule.kind==="vertical")return rule.x>=world.xmin&&rule.x<=world.xmax?
    [{x:rule.x,y:world.ymin},{x:rule.x,y:world.ymax}]:[];
  const runs=[];let run=[];
  for(let i=0;i<=steps;i++){
    const x=world.xmin+(world.xmax-world.xmin)*i/steps;
    const y=functionValue(rule,x);
    if(y>=world.ymin&&y<=world.ymax)run.push({x,y});
    else if(run.length){if(run.length>1)runs.push(run);run=[];}
  }
  if(run.length>1)runs.push(run);
  return runs;
}
// The curved analogue of graphCellAt() in graph-art-pictures.mjs.
// Every selection is a whole sign cell, never just a point. Wrong cells can
// flash red with precisely the same feedback as linear Find & Fill.
export function curvedCellAt(rules,x,y,tolerance=.09,world=WORLD){
  if(!Number.isFinite(x)||!Number.isFinite(y)||
    x<=world.xmin||x>=world.xmax||y<=world.ymin||y>=world.ymax)return null;
  const near=rules.some(r=>{
    if(r.kind==="vertical")return Math.abs(x-r.x)<tolerance;
    const derivative=r.coeffs.reduce((sum,c,i)=>i?sum+i*c*x**(i-1):sum,0);
    return Math.abs(y-functionValue(r,x))/Math.hypot(1,derivative)<tolerance;
  });
  if(near)return null;
  const cellRules=rules.map(r=>{
    const positive=signedDifference(r,x,y)>0;
    const side=positive?r.side:r.kind==="vertical"?
      (r.side==="left"?"right":"left"):(r.side==="above"?"below":"above");
    return {...r,side,inclusive:true};
  });
  const paths=regionPaths(cellRules,world);
  if(!paths.length)return null;
  return {x,y,paths,correct:satisfiesAll(rules,x,y)};
}
export const PICTURE=Object.freeze({
  id:"parabola-butterfly",name:"Parabola Butterfly",clue:"Two wings from intersecting curves",
  pieces:Object.freeze([
    Object.freeze({id:"left-wing",name:"Left wing",color:"#e99a92",
      rules:Object.freeze([
        q("lower-left","y ≥ x² − 4",[-4,0,1],"above"),
        q("upper-left","y ≤ 4 − x²",[4,0,-1],"below"),
        vertical("mid-left","x ≤ 0",0,"left")
      ])}),
    Object.freeze({id:"right-wing",name:"Right wing",color:"#86bcb8",
      rules:Object.freeze([
        q("lower-right","y ≥ x² − 4",[-4,0,1],"above"),
        q("upper-right","y ≤ 4 − x²",[4,0,-1],"below"),
        vertical("mid-right","x ≥ 0",0,"right",false)
      ])})
  ])
});
export function validatePicture(p=PICTURE){
  if(p.pieces.length!==2)throw Error("Expected two pieces");
  for(const part of p.pieces){
    if(!part.rules.length||!regionPaths(part.rules).length)throw Error("Empty curved region");
    for(const r of part.rules){
      if(!r.id||!r.text||!["function","vertical"].includes(r.kind))throw Error("Invalid rule");
      if(r.kind==="function"&&(!Array.isArray(r.coeffs)||r.coeffs.some(c=>!Number.isFinite(c))))throw Error("Invalid polynomial");
    }
  }
  return true;
}
