// Region Lab prototype: every coloured facet is the actual intersection of
// its displayed linear inequalities. No bitmap masks or unrelated art unlocks.
export const REGION_SAVE_KEY="inequality-ink-graph-art-v1";
export const REGION_WORLD=Object.freeze({xmin:-5,xmax:5,ymin:-5,ymax:5});
const EPS=1e-9;
const rule=(id,text,a,b,c,inclusive=true)=>
  Object.freeze({id,text,a,b,c,inclusive});
const facet=(id,name,color,hint,given,rules)=>
  Object.freeze({id,name,color,hint,given,rules:Object.freeze(rules)});

export const REGION_FACETS=Object.freeze([
  facet("sunset","Sunlit facet","#eea287",
    "Begin with the top half-plane. Two more boundaries will form a triangle.",1,[
      rule("nw-ground","y ≥ 0",0,-1,0),
      rule("nw-left","x ≤ 0",1,0,0),
      rule("nw-slope","y ≤ x + 4",-1,1,4)
    ]),
  facet("sunrise","Golden facet","#e9c578",
    "This triangle meets the first one along the vertical axis.",0,[
      rule("ne-ground","y ≥ 0",0,-1,0),
      rule("ne-right","x ≥ 0",-1,0,0),
      rule("ne-slope","y ≤ −x + 4",1,1,4)
    ]),
  facet("ocean","Ocean facet","#7bb9b5",
    "Now combine a downward half-plane with a sloping boundary.",0,[
      rule("sw-ground","y ≤ 0",0,1,0),
      rule("sw-left","x ≤ 0",1,0,0),
      rule("sw-slope","y ≥ −x − 4",-1,-1,4)
    ]),
  facet("twilight","Twilight facet","#7397ca",
    "The fourth triangle completes the outer crystal shape.",0,[
      rule("se-ground","y ≤ 0",0,1,0),
      rule("se-right","x ≥ 0",-1,0,0),
      rule("se-slope","y ≥ x − 4",1,-1,4)
    ]),
  facet("heart","Crystal heart","#d7a1c8",
    "Four strict inequalities create a smaller open diamond in the centre.",0,[
      rule("c-nw","y < x + 1",-1,1,1,false),
      rule("c-ne","y < −x + 1",1,1,1,false),
      rule("c-se","y > x − 1",1,-1,1,false),
      rule("c-sw","y > −x − 1",-1,-1,1,false)
    ])
]);
export const REGION_NAME="Aurora Crystal";
export const REGION_TOTAL=REGION_FACETS.length;
export const REGION_STEP_TOTAL=REGION_FACETS.reduce((sum,f)=>
  sum+f.rules.length-f.given,0);

export function regionSide(rule){
  if(rule.b===0)return rule.a>0?"left":"right";
  return rule.b>0?"below":"above";
}
export function otherRegionSide(side){
  return {above:"below",below:"above",left:"right",right:"left"}[side]||null;
}
export function regionSideOptions(rule){
  return rule.b===0?["left","right"]:["above","below"];
}
export function regionBoundaryStyle(rule){return rule.inclusive?"solid":"dashed";}
export function evaluateRegionRule(rule,x,y){return rule.a*x+rule.b*y-rule.c;}
export function pointSatisfiesRegion(rule,x,y){
  const v=evaluateRegionRule(rule,x,y);
  return rule.inclusive?v<=EPS:v<-EPS;
}
export function pointSatisfiesAll(rules,x,y){
  return rules.every(rule=>pointSatisfiesRegion(rule,x,y));
}
export function samplePointForRule(rule){
  // Choose an integer coordinate away from the boundary so the hint is
  // unambiguous (the origin lies on many of the early boundary lines).
  const candidates=[[0,0],[1,1],[0,2],[2,0],[-1,1],[1,-2],[-2,-2]];
  const point=candidates.find(([x,y])=>Math.abs(evaluateRegionRule(rule,x,y))>.25);
  return point||[3,3];
}
export function regionHint(rule){
  const [x,y]=samplePointForRule(rule);
  const inside=pointSatisfiesRegion(rule,x,y);
  return "Try the test point ("+x+", "+y+"). It "+
    (inside?"satisfies":"does not satisfy")+
    " "+rule.text+". Shade the half-plane that "+
    (inside?"contains":"does not contain")+" that point.";
}
export function polygonArea(points){
  if(points.length<3)return 0;
  return Math.abs(points.reduce((sum,p,i)=>{
    const q=points[(i+1)%points.length];
    return sum+p.x*q.y-q.x*p.y;
  },0))/2;
}
export function fullRegionPolygon(world=REGION_WORLD){
  return [
    {x:world.xmin,y:world.ymin},
    {x:world.xmax,y:world.ymin},
    {x:world.xmax,y:world.ymax},
    {x:world.xmin,y:world.ymax}
  ];
}
// Clip an existing convex polygon against a*x+b*y <= c. The topological
// inclusion of the boundary is represented by solid/dashed strokes; SVG's
// area fill is identical for strict and inclusive boundaries.
export function clipRegionPolygon(polygon,rule){
  if(!polygon.length)return [];
  const result=[];
  for(let i=0;i<polygon.length;i++){
    const p=polygon[i],q=polygon[(i+1)%polygon.length];
    const u=evaluateRegionRule(rule,p.x,p.y);
    const v=evaluateRegionRule(rule,q.x,q.y);
    const inP=u<=EPS,inQ=v<=EPS;
    if(inP)result.push({...p});
    if(inP!==inQ){
      const t=u/(u-v);
      if(Number.isFinite(t))result.push({
        x:p.x+t*(q.x-p.x),y:p.y+t*(q.y-p.y)
      });
    }
  }
  // Avoid zero-length edges caused by a boundary passing through a vertex.
  const distinct=[];
  for(const p of result)if(!distinct.some(q=>
    Math.hypot(p.x-q.x,p.y-q.y)<EPS))distinct.push(p);
  return distinct.length>=3&&polygonArea(distinct)>EPS?distinct:[];
}
export function intersectRegion(rules,world=REGION_WORLD){
  return rules.reduce((polygon,rule)=>clipRegionPolygon(polygon,rule),
    fullRegionPolygon(world));
}
export function lineOnRegionGraph(rule,world=REGION_WORLD){
  const {xmin,xmax,ymin,ymax}=world;
  const candidates=[];
  if(Math.abs(rule.b)>EPS)for(const x of [xmin,xmax]){
    const y=(rule.c-rule.a*x)/rule.b;
    if(y>=ymin-EPS&&y<=ymax+EPS)candidates.push({x,y});
  }
  if(Math.abs(rule.a)>EPS)for(const y of [ymin,ymax]){
    const x=(rule.c-rule.b*y)/rule.a;
    if(x>=xmin-EPS&&x<=xmax+EPS)candidates.push({x,y});
  }
  const unique=candidates.filter((p,i)=>!candidates.slice(0,i).some(q=>
    Math.hypot(p.x-q.x,p.y-q.y)<EPS));
  if(unique.length<2)return null;
  let pair=[unique[0],unique[1]],distance=-1;
  for(let i=0;i<unique.length;i++)for(let j=i+1;j<unique.length;j++){
    const d=Math.hypot(unique[i].x-unique[j].x,
      unique[i].y-unique[j].y);
    if(d>distance){pair=[unique[i],unique[j]];distance=d;}
  }
  return pair;
}
export function previewSideRule(rule,side){
  if(!regionSideOptions(rule).includes(side))return null;
  if(side===regionSide(rule))return rule;
  return {...rule,a:-rule.a,b:-rule.b,c:-rule.c};
}
export function regionCorrect(rule,side,boundary){
  return side===regionSide(rule)&&boundary===regionBoundaryStyle(rule);
}
export function validateRegionArt(){
  if(REGION_FACETS.length!==5||REGION_STEP_TOTAL!==15)throw Error("Wrong art progression");
  const ids=new Set(),allRules=new Set();
  for(const [index,f] of REGION_FACETS.entries()){
    if(ids.has(f.id)||f.rules.length<3||f.given<0||
      f.given>=f.rules.length)throw Error("Invalid facet "+f.id);
    ids.add(f.id);
    for(const r of f.rules){
      if(allRules.has(r.id)||!r.text||!Number.isFinite(r.a)||
        !Number.isFinite(r.b)||!Number.isFinite(r.c)||
        (r.a===0&&r.b===0))throw Error("Invalid region rule "+r.id);
      allRules.add(r.id);
      if(!lineOnRegionGraph(r))throw Error("Invisible boundary "+r.id);
    }
    const polygon=intersectRegion(f.rules),area=polygonArea(polygon);
    if(!polygon.length||Math.abs(area-(index===4?2:8))>EPS)
      throw Error("Facet area doesn't match its inequalities: "+f.id);
    if(index===4&&!pointSatisfiesAll(f.rules,0,0))
      throw Error("Crystal centre must include the origin");
  }
  return true;
}
