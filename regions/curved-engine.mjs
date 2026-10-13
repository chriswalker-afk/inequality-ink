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

/* Finishing touches are deliberately NOT used by inequality validation.
   The wings alone are mathematical intersections; these make the reveal a
   recognisable butterfly, and are withheld until the picture is complete. */
export const CURVE_DETAIL_STAGES=Object.freeze([
  Object.freeze({stage:1,label:"Patterns are appearing on the wings…"}),
  Object.freeze({stage:2,label:"The butterfly's body and antennae are taking shape…"}),
  Object.freeze({stage:3,label:"Final sparkles bring your butterfly to life…"})
]);
export const CURVE_DETAIL_COLORS=Object.freeze({
  plum:"#55425f",deepPlum:"#39354f",berry:"#8a5875",
  cream:"#ffe3b2",paleCream:"#fff1d2",gold:"#d79b58",
  goldOutline:"#986b50",lightTeal:"#d8f0db"
});
const detail=(id,stage,type,values)=>Object.freeze({id,stage,type,...values});
const ellipse=(id,stage,x,y,rx,ry,fill,stroke=null,width=.055)=>
  detail(id,stage,"ellipse",{x,y,rx,ry,fill,stroke,width});
const circle=(id,stage,x,y,r,fill,stroke=null,width=.055)=>
  detail(id,stage,"circle",{x,y,r,fill,stroke,width});
const curve=(id,stage,x1,y1,cx,cy,x2,y2,stroke,width=.065)=>
  detail(id,stage,"curve",{x1,y1,cx,cy,x2,y2,stroke,width});
const star=(id,stage,x,y,r,fill,stroke)=>
  detail(id,stage,"star",{x,y,r,fill,stroke,width:.04});
const DC=CURVE_DETAIL_COLORS;
const butterflyDetails=Object.freeze([
  // Stage 1: high-contrast paired wing markings. Their centres are strictly
  // inside the genuine quadratic regions, not floating on the ivory canvas.
  ellipse("upper-left-spot",1,-.91,1.71,.42,.47,DC.cream,DC.berry),
  ellipse("upper-right-spot",1,.91,1.71,.42,.47,DC.cream,DC.berry),
  ellipse("lower-left-spot",1,-.94,-1.58,.38,.44,DC.cream,DC.berry),
  ellipse("lower-right-spot",1,.94,-1.58,.38,.44,DC.cream,DC.berry),
  circle("left-wing-tip",1,-1.57,.05,.18,DC.plum,DC.paleCream,.035),
  circle("right-wing-tip",1,1.57,.05,.18,DC.plum,DC.paleCream,.035),
  ellipse("upper-left-glint",1,-.98,1.81,.13,.17,DC.paleCream,DC.goldOutline,.025),
  ellipse("upper-right-glint",1,.98,1.81,.13,.17,DC.paleCream,DC.goldOutline,.025),
  ellipse("lower-left-glint",1,-1.01,-1.47,.12,.14,DC.paleCream,DC.goldOutline,.025),
  ellipse("lower-right-glint",1,1.01,-1.47,.12,.14,DC.paleCream,DC.goldOutline,.025),

  // Stage 2: antennae first so the central body and head sit on top.
  curve("left-antenna",2,-.12,3.03,-.31,4.34,-.78,4.43,DC.deepPlum,.072),
  curve("right-antenna",2,.12,3.03,.31,4.34,.78,4.43,DC.deepPlum,.072),
  circle("left-antenna-tip",2,-.78,4.43,.13,DC.gold,DC.deepPlum,.045),
  circle("right-antenna-tip",2,.78,4.43,.13,DC.gold,DC.deepPlum,.045),
  ellipse("body",2,0,0,.31,2.78,DC.plum,DC.deepPlum,.055),
  ellipse("stripe-top",2,0,1.2,.19,.085,DC.gold,DC.plum,.02),
  ellipse("stripe-middle",2,0,.18,.19,.085,DC.gold,DC.plum,.02),
  ellipse("stripe-bottom",2,0,-.83,.19,.085,DC.gold,DC.plum,.02),
  circle("head",2,0,2.77,.45,DC.plum,DC.deepPlum,.055),
  circle("left-eye",2,-.15,2.82,.075,DC.paleCream,DC.deepPlum,.022),
  circle("right-eye",2,.15,2.82,.075,DC.paleCream,DC.deepPlum,.022),
  curve("smile",2,-.13,2.58,0,2.47,.13,2.58,DC.paleCream,.045),

  // Stage 3: darker outlined golden flourishes are visible on the ivory
  // background, unlike unoutlined white decorative accents.
  star("star-upper-left",3,-3.5,3.4,.31,DC.gold,DC.goldOutline),
  star("star-upper-right",3,3.5,3.4,.31,DC.gold,DC.goldOutline),
  star("star-lower-left",3,-3.65,-2.7,.25,DC.gold,DC.goldOutline),
  star("star-lower-right",3,3.65,-2.7,.25,DC.gold,DC.goldOutline),
  star("star-right",3,4.12,.55,.18,DC.gold,DC.goldOutline),
  star("star-left",3,-4.12,.55,.18,DC.gold,DC.goldOutline),
  circle("dust-1",3,-2.8,1.6,.075,DC.berry),
  circle("dust-2",3,2.8,1.6,.075,DC.berry),
  circle("dust-3",3,-2.98,-.95,.075,DC.goldOutline),
  circle("dust-4",3,2.98,-.95,.075,DC.goldOutline)
]);

export const PICTURE=Object.freeze({
  id:"parabola-butterfly",name:"Parabola Butterfly",clue:"Two wings from intersecting curves",
  details:butterflyDetails,
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
  const detailIds=new Set();
  for(const d of p.details||[]){
    if(detailIds.has(d.id)||!d.id||!Number.isInteger(d.stage)||
      d.stage<1||d.stage>CURVE_DETAIL_STAGES.length||
      !["ellipse","circle","curve","star"].includes(d.type)||
      !d.stroke&&!d.fill)throw Error("Invalid butterfly decoration "+d.id);
    detailIds.add(d.id);
    if(!Number.isFinite(d.width)||d.width<=0)throw Error("Invalid stroke width "+d.id);
    for(const n of ["x","y","rx","ry","r","x1","y1","x2","y2","cx","cy"]){
      if(n in d&&(!Number.isFinite(d[n])||
        (n==="x"||n==="cx"||n==="x1"||n==="x2" ? Math.abs(d[n])>5:
         n==="y"||n==="cy"||n==="y1"||n==="y2" ? Math.abs(d[n])>5:false)))
        throw Error("Invalid decoration coordinate "+d.id);
    }
    if(d.type==="circle"&&!(d.r>0)||d.type==="star"&&!(d.r>0)||
      d.type==="ellipse"&&!(d.rx>0&&d.ry>0))throw Error("Invalid decoration size "+d.id);
  }
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
