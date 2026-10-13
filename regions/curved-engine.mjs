// Phase 1 curved-region engine. Strictness changes boundary strokes, not area.
export const WORLD=Object.freeze({xmin:-5,xmax:5,ymin:-5,ymax:5});
const tol=1e-8;
export const q=(id,text,coeffs,side,inclusive=true)=>
  Object.freeze({id,text,kind:"function",coeffs:Object.freeze([...coeffs]),side,inclusive});
export const vertical=(id,text,x,side,inclusive=true)=>
  Object.freeze({id,text,kind:"vertical",x,side,inclusive});
export const absolute=(id,text,h,k,a,side,inclusive=true)=>
  Object.freeze({id,text,kind:"absolute",h,k,a,side,inclusive});
export const circleRule=(id,text,cx,cy,r,side="inside",inclusive=true)=>
  Object.freeze({id,text,kind:"circle",cx,cy,r,side,inclusive});
// Vertex form is useful when authoring translated parabolas; the displayed
// equation remains an independently authored, student-readable inequality.
export const parabola=(id,text,a,h,k,side,inclusive=true)=>
  q(id,text,[a*h*h+k,-2*a*h,a],side,inclusive);

export function functionValue(rule,x){
  if(rule.kind==="absolute")return rule.k+rule.a*Math.abs(x-rule.h);
  if(rule.kind==="function")return rule.coeffs.reduce((sum,c,i)=>sum+c*x**i,0);
  throw Error("Not a y=f(x) boundary");
}
export function signedDifference(rule,x,y){
  if(rule.kind==="function"||rule.kind==="absolute"){
    const delta=y-functionValue(rule,x);
    return rule.side==="above"?delta:-delta;
  }
  if(rule.kind==="vertical")return rule.side==="right"?x-rule.x:rule.x-x;
  if(rule.kind==="circle"){
    const d=rule.r**2-(x-rule.cx)**2-(y-rule.cy)**2;
    return rule.side==="inside"?d:-d;
  }
  throw Error("Unsupported curve rule");
}
export function satisfies(rule,x,y){
  const d=signedDifference(rule,x,y);
  return rule.inclusive?d>=-tol:d>tol;
}
export const satisfiesAll=(rules,x,y)=>rules.every(r=>satisfies(r,x,y));
const clipped=(lo,hi,world)=>({
  lo:Math.max(lo,world.ymin),hi:Math.min(hi,world.ymax)
});
function allowedIntervals(rule,x,world){
  if(rule.kind==="vertical")
    return signedDifference(rule,x,0)>=-tol?[{lo:world.ymin,hi:world.ymax}]:[];
  if(rule.kind==="function"||rule.kind==="absolute"){
    const y=functionValue(rule,x);
    return [clipped(rule.side==="above"?y:world.ymin,
      rule.side==="above"?world.ymax:y,world)];
  }
  if(rule.kind==="circle"){
    const dx=x-rule.cx,radicand=rule.r*rule.r-dx*dx;
    if(radicand<0)return rule.side==="outside"?
      [{lo:world.ymin,hi:world.ymax}]:[];
    const dy=Math.sqrt(Math.max(0,radicand));
    if(rule.side==="inside")return [clipped(rule.cy-dy,rule.cy+dy,world)];
    // Complement of a disk may have two bands at a single x. Keeping them
    // separate prevents incorrectly painting a hole in a curved region.
    return [clipped(world.ymin,rule.cy-dy,world),
      clipped(rule.cy+dy,world.ymax,world)];
  }
  throw Error("Unsupported curve rule");
}
// Vertical cross-sections can now contain multiple disjoint intervals. This
// supports exact point membership and the visual complement of circles.
export function rangeIntervalsAtX(rules,x,world=WORLD){
  if(!Number.isFinite(x)||x<world.xmin-tol||x>world.xmax+tol)return [];
  let intervals=[{lo:world.ymin,hi:world.ymax}];
  for(const rule of rules){
    const permitted=allowedIntervals(rule,x,world),next=[];
    for(const a of intervals)for(const b of permitted){
      const lo=Math.max(a.lo,b.lo),hi=Math.min(a.hi,b.hi);
      if(hi-lo>tol)next.push({lo,hi});
    }
    intervals=next;
    if(!intervals.length)break;
  }
  return intervals.sort((a,b)=>a.lo-b.lo);
}
// Retained for Phase 1 callers that expect one vertical interval.
export function rangeAtX(rules,x,world=WORLD){
  return rangeIntervalsAtX(rules,x,world)[0]||null;
}
// Visual polygons are sampled slices; the inequalities themselves remain the
// source of truth for marking, including strict/dashed boundaries.
export function regionPaths(rules,world=WORLD,steps=700){
  if(!Number.isInteger(steps)||steps<10)throw Error("Invalid resolution");
  const finished=[];let running=[];
  function close(){
    for(const run of running)if(run.length>1){
      const top=run.map(p=>({x:p.x,y:p.hi}));
      const bottom=[...run].reverse().map(p=>({x:p.x,y:p.lo}));
      finished.push([...top,...bottom]);
    }
    running=[];
  }
  for(let i=0;i<=steps;i++){
    const x=world.xmin+(world.xmax-world.xmin)*i/steps;
    const spans=rangeIntervalsAtX(rules,x,world);
    if(spans.length!==running.length){
      close();running=spans.map(span=>[{x,...span}]);
    }else spans.forEach((span,j)=>running[j].push({x,...span}));
  }
  close();
  return finished;
}
export function boundaryPoints(rule,world=WORLD,steps=360){
  if(rule.kind==="vertical")return rule.x>=world.xmin&&rule.x<=world.xmax?
    [{x:rule.x,y:world.ymin},{x:rule.x,y:world.ymax}]:[];
  if(rule.kind==="circle"){
    // Circular boundaries are plotted as a closed SVG path. Every authored
    // Phase 2 circle lies entirely within the graph window.
    return [Array.from({length:steps+1},(_,i)=>{
      const angle=i/steps*Math.PI*2;
      return {x:rule.cx+rule.r*Math.cos(angle),
        y:rule.cy+rule.r*Math.sin(angle)};
    })];
  }
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
export function curvedCellAt(rules,x,y,tolerance=.09,world=WORLD){
  if(!Number.isFinite(x)||!Number.isFinite(y)||
    x<=world.xmin||x>=world.xmax||y<=world.ymin||y>=world.ymax)return null;
  const near=rules.some(r=>{
    if(r.kind==="vertical")return Math.abs(x-r.x)<tolerance;
    if(r.kind==="circle")
      return Math.abs(Math.hypot(x-r.cx,y-r.cy)-r.r)<tolerance;
    const derivative=r.kind==="absolute"?
      r.a*Math.sign(x-r.h):
      r.coeffs.reduce((sum,c,i)=>i?sum+i*c*x**(i-1):sum,0);
    return Math.abs(y-functionValue(r,x))/Math.hypot(1,derivative)<tolerance;
  });
  if(near)return null;
  const cellRules=rules.map(r=>{
    const positive=signedDifference(r,x,y)>0;
    if(positive)return r;
    const side=r.kind==="vertical"?(r.side==="left"?"right":"left"):
      r.kind==="circle"?(r.side==="inside"?"outside":"inside"):
      (r.side==="above"?"below":"above");
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
  curve("left-wing-vein",1,-.28,.22,-1.02,-.12,-1.87,0,DC.berry,.055),
  curve("right-wing-vein",1,.28,.22,1.02,-.12,1.87,0,DC.berry,.055),
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
  if(!Array.isArray(p.pieces)||p.pieces.length<2)throw Error("Expected at least two pieces");
  for(const part of p.pieces){
    if(!part.rules.length||!regionPaths(part.rules).length)throw Error("Empty curved region");
    for(const r of part.rules){
      if(!r.id||!r.text||!["function","vertical","absolute","circle"].includes(r.kind))throw Error("Invalid rule");
      if(r.kind==="function"&&(!Array.isArray(r.coeffs)||r.coeffs.length>3||
         r.coeffs.some(c=>!Number.isFinite(c))))throw Error("Invalid polynomial");
      if(r.kind==="vertical"&&(!Number.isFinite(r.x)||!["left","right"].includes(r.side)))
        throw Error("Invalid vertical boundary");
      if(r.kind==="absolute"&&(![r.h,r.k,r.a].every(Number.isFinite)||
         !["above","below"].includes(r.side)))throw Error("Invalid absolute-value rule");
      if(r.kind==="circle"&&(![r.cx,r.cy,r.r].every(Number.isFinite)||
         !(r.r>0)||!["inside","outside"].includes(r.side)))
        throw Error("Invalid circle rule");
      if(r.kind==="function"&&!["above","below"].includes(r.side))
        throw Error("Invalid parabola orientation");
    }
  }
  return true;
}
