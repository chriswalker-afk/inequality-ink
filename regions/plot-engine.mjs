// Pure construction model for Plot & Shade. Drawing and marking use algebra,
// not distance between arbitrary SVG paths.
import {WORLD,boundaryPoints,functionValue} from "./curved-engine.mjs";

const EPS=1e-7;
export const POINT_STEP=.5;
export const requiredPoints=()=>2;

export function snapPoint(x,y,step=POINT_STEP,world=WORLD){
  if(![x,y,step].every(Number.isFinite)||step<=0)return null;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const snap=v=>Math.round(v/step)*step;
  return {x:clamp(snap(x),world.xmin,world.xmax),
    y:clamp(snap(y),world.ymin,world.ymax)};
}
export const samePoint=(a,b)=>!!a&&!!b&&
  Math.abs(a.x-b.x)<EPS&&Math.abs(a.y-b.y)<EPS;

export function constructBoundary(kind,points){
  if(!Array.isArray(points)||points.length!==2||
      points.some(p=>!p||![p.x,p.y].every(Number.isFinite)))
    return {valid:false,reason:"Place two points before checking your graph.",code:"incomplete"};
  const [p1,p2]=points;
  if(samePoint(p1,p2))
    return {valid:false,reason:"Choose two different points.",code:"duplicate"};
  if(kind==="parabola"){
    const dx=p2.x-p1.x;
    if(Math.abs(dx)<EPS)return {
      valid:false,code:"vertex-axis",
      reason:"Your second point needs a different x-coordinate from the vertex."
    };
    const a=(p2.y-p1.y)/(dx*dx);
    if(Math.abs(a)<EPS)return {
      valid:false,code:"flat",
      reason:"Both points have the same height. Choose a point away from the turning point."
    };
    const [h,k]=[p1.x,p1.y];
    return {valid:true,kind,vertex:{x:h,y:k},a,
      rule:{kind:"function",coeffs:[a*h*h+k,-2*a*h,a],side:"above",inclusive:true}};
  }
  if(kind==="line"){
    if(Math.abs(p2.x-p1.x)<EPS)
      return {valid:true,kind,vertical:true,x:p1.x,
        rule:{kind:"vertical",x:p1.x,side:"left",inclusive:true}};
    const m=(p2.y-p1.y)/(p2.x-p1.x),b=p1.y-m*p1.x;
    return {valid:true,kind,vertical:false,m,b,
      rule:{kind:"function",coeffs:[b,m],side:"above",inclusive:true}};
  }
  return {valid:false,code:"unsupported",reason:"This plotting tool is not supported."};
}
const close=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<EPS;
export function checkConstruction(target,points){
  const kind=target?.kind;
  const attempted=constructBoundary(kind,points);
  if(!attempted.valid)return {correct:false,...attempted,message:attempted.reason};
  const rule=target.rule;
  if(kind==="parabola"){
    const [c,b,a]=rule.coeffs;
    if(!close(attempted.vertex.x,-b/(2*a))||
       !close(attempted.vertex.y,c-b*b/(4*a)))
      return {correct:false,code:"vertex",rule:attempted.rule,
        message:"The turning point isn't correct yet. Check the vertex of the parabola."};
    if(Math.sign(attempted.a)!==Math.sign(a))
      return {correct:false,code:"direction",rule:attempted.rule,
        message:"The vertex is correct, but the parabola opens the wrong way."};
    if(!close(attempted.a,a))
      return {correct:false,code:"width",rule:attempted.rule,
        message:"The vertex is correct, but the curve is too wide or too narrow. Adjust your second point."};
  }else if(kind==="line"){
    if(rule.kind==="vertical"){
      if(!attempted.vertical)
        return {correct:false,code:"vertical",rule:attempted.rule,
          message:"This boundary must be vertical. Both points need the same x-coordinate."};
      if(!close(attempted.x,rule.x))
        return {correct:false,code:"position",rule:attempted.rule,
          message:"The vertical line is at the wrong x-coordinate."};
    }else{
      if(attempted.vertical)
        return {correct:false,code:"slope",rule:attempted.rule,
          message:"This graph is not vertical. Check the coordinates of your points."};
      const m=rule.coeffs[1]||0,b=rule.coeffs[0];
      if(!close(attempted.m,m))
        return {correct:false,code:"slope",rule:attempted.rule,
          message:close(m,0)?
            "This boundary should be horizontal. Try keeping both points at the same height.":
            "Check the gradient between the two points."};
      if(!close(attempted.b,b))
        return {correct:false,code:"intercept",rule:attempted.rule,
          message:"The gradient is correct, but the line is in the wrong position."};
    }
  }else return {correct:false,code:"type",message:"Unknown graph type."};
  return {correct:true,code:"correct",rule:attempted.rule,
    message:"Correct graph! Now choose whether its boundary is solid or dashed."};
}
export function checkBoundaryStyle(rule,style){
  if(style!=="solid"&&style!=="dashed")
    return {correct:false,message:"Choose solid or dashed for your boundary."};
  if((style==="solid")!==rule.inclusive)
    return {correct:false,message:rule.inclusive?
      "This inequality includes equality. Choose a solid boundary.":
      "This is a strict inequality. Choose a dashed boundary."};
  return {correct:true,message:"Correct boundary! Now fill the region that satisfies both inequalities."};
}
export function previewPaths(construction){
  if(!construction?.valid)return [];
  const raw=boundaryPoints(construction.rule);
  return construction.rule.kind==="vertical"?[raw]:raw;
}
export function validSavedPoints(points){
  if(!Array.isArray(points)||points.length>2)return false;
  return points.every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&
    p.x>=WORLD.xmin&&p.x<=WORLD.xmax&&p.y>=WORLD.ymin&&p.y<=WORLD.ymax&&
    samePoint(snapPoint(p.x,p.y),p));
}
