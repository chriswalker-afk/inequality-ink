import {COMPLEX_WORLD,complexTarget} from "./complex-quest-model.mjs";

export const COMPLEX_SVG_SIZE=620;
export const COMPLEX_SVG_PAD=52;
export const COMPLEX_GRID=COMPLEX_SVG_SIZE-2*COMPLEX_SVG_PAD;
export const complexPx=x=>COMPLEX_SVG_PAD+
  (x-COMPLEX_WORLD.min)*COMPLEX_GRID/(COMPLEX_WORLD.max-COMPLEX_WORLD.min);
export const complexPy=y=>COMPLEX_SVG_PAD+
  (COMPLEX_WORLD.max-y)*COMPLEX_GRID/(COMPLEX_WORLD.max-COMPLEX_WORLD.min);
const rad=degrees=>degrees*Math.PI/180;
export function complexRayToWindow(centre,degrees,world=COMPLEX_WORLD){
  const theta=rad(degrees),dx=Math.cos(theta),dy=Math.sin(theta);
  const tx=Math.abs(dx)<1e-10?Infinity:
    ((dx>0?world.max:world.min)-centre.re)/dx;
  const ty=Math.abs(dy)<1e-10?Infinity:
    ((dy>0?world.max:world.min)-centre.im)/dy;
  const t=Math.max(0,Math.min(tx,ty));
  return {re:centre.re+t*dx,im:centre.im+t*dy};
}
// A translated argument sector is unbounded. Its outer visual boundary comes
// ONLY from the viewport clipping rectangle, never an invented circular arc.
export function complexSectorPolygon(centre,from,to,world=COMPLEX_WORLD){
  const slices=Math.max(12,Math.ceil((to-from)/2));
  const points=[{...centre}];
  for(let i=0;i<=slices;i++)
    points.push(complexRayToWindow(centre,from+(to-from)*i/slices,world));
  return points;
}
// A bounded sector really does have a circular arc: modulus AND argument
// constrain the same region. The arc is sampled for smooth SVG rendering.
export function complexBoundedPolygon(centre,radius,from,to){
  const slices=Math.max(32,Math.ceil((to-from)*2));
  const points=[{...centre}];
  for(let i=0;i<=slices;i++){
    const angle=rad(from+(to-from)*i/slices);
    points.push({re:centre.re+radius*Math.cos(angle),
      im:centre.im+radius*Math.sin(angle)});
  }
  return points;
}
export function complexSvgPath(points,close=true){
  return points.map((p,i)=>(i?"L":"M")+complexPx(p.re).toFixed(2)+" "+
    complexPy(p.im).toFixed(2)).join(" ")+(close?" Z":"");
}
export function pointInComplexLocus(piece,point,tolerance=1e-8){
  if(!["disc","sector","bounded"].includes(piece.kind))return false;
  const d={re:point.re-piece.centre.re,im:point.im-piece.centre.im};
  const distance=Math.hypot(d.re,d.im);
  if(piece.kind!=="sector"){
    if(piece.strict?!(distance<piece.radius-tolerance):
      !(distance<=piece.radius+tolerance))return false;
  }
  if(piece.kind!=="disc"){
    if(distance<tolerance)return false; // arg(0) is undefined
    const argument=Math.atan2(d.im,d.re)*180/Math.PI;
    if(piece.strict)
      return argument>piece.from+tolerance&&argument<piece.to-tolerance;
    return argument>=piece.from-tolerance&&argument<=piece.to+tolerance;
  }
  return true;
}
export function complexGeometry(piece,candidate=complexTarget(piece)){
  if(piece.kind==="point"||piece.kind==="transform")
    return {kind:"point",at:{re:Number(candidate.re),im:Number(candidate.im)}};
  const centre={re:Number(candidate.re),im:Number(candidate.im)};
  const radius=Number(candidate.radius),from=Number(candidate.from),
    to=Number(candidate.to);
  if(piece.kind==="disc")return {kind:"disc",centre,radius,strict:piece.strict};
  if(piece.kind==="sector")return {kind:"sector",centre,from,to,
    strict:piece.strict,points:complexSectorPolygon(centre,from,to)};
  return {kind:"bounded",centre,radius,from,to,strict:piece.strict,
    points:complexBoundedPolygon(centre,radius,from,to)};
}