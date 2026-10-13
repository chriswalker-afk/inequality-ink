// Graph Art picture catalogue. Every painted piece is precisely an intersection
// of its displayed inequalities: no image mask determines the correct answer.
import {
  REGION_FACETS,REGION_WORLD,evaluateRegionRule,intersectRegion,
  lineOnRegionGraph,polygonArea,pointSatisfiesAll
} from "./regions-engine.mjs";

const rule=(id,text,a,b,c,inclusive=true)=>Object.freeze({id,text,a,b,c,inclusive});
const piece=(id,name,color,rules)=>Object.freeze({
  id,name,color,rules:Object.freeze(rules)
});
const picture=(id,name,stage,clue,description,pieces,details)=>Object.freeze({
  id,name,stage,clue,description,details,pieces:Object.freeze(pieces)
});

// Each of the three Little House pieces has real, finite edges. The door is a
// third mathematical piece, not an unrelated decoration.
const house=picture("little-house","Little House","Starter",
  "Home sweet home","Three simple pieces make a house.",[
  piece("walls","Golden walls","#edbc73",[
    rule("wall-left","x ≥ −2.5",-1,0,2.5),
    rule("wall-right","x ≤ 2.5",1,0,2.5),
    rule("wall-floor","y ≥ −3",0,-1,3),
    rule("wall-ceiling","y ≤ 1",0,1,1)
  ]),
  piece("roof","A red roof","#d6817a",[
    rule("roof-base","y ≥ 1",0,-1,-1),
    rule("roof-left","y ≤ x + 4",-1,1,4),
    rule("roof-right","y ≤ −x + 4",1,1,4)
  ]),
  piece("door","The blue door","#7299c3",[
    rule("door-left","x ≥ −0.85",-1,0,.85),
    rule("door-right","x ≤ 0.85",1,0,.85),
    rule("door-bottom","y ≥ −3",0,-1,3),
    rule("door-top","y ≤ −1",0,1,-1)
  ])
  ],"house");

const crystal=picture("aurora-crystal","Aurora Crystal","Challenge",
  "A flash of colour","Five intersecting facets create a luminous crystal.",
  REGION_FACETS.map(f=>piece(f.id,f.name,f.color,f.rules)),"crystal");

export const GRAPH_ART_PICTURES=Object.freeze([house,crystal]);
export const GRAPH_ART_MODES=Object.freeze([
  Object.freeze({id:"fill",name:"Find & Fill",
    description:"Read every inequality, then fill the region they share."}),
  Object.freeze({id:"build",name:"Build & Shade",
    description:"Choose each side and line style, then reveal their intersection."})
]);
export const GRAPH_ART_SAVE_KEY="inequality-ink-graph-art-v2";
export const GRAPH_ART_LEGACY_SAVE_KEY="inequality-ink-graph-art-v1";
export const graphPicture=id=>GRAPH_ART_PICTURES.find(p=>p.id===id)||null;
export const graphMode=id=>GRAPH_ART_MODES.some(m=>m.id===id);
export const pictureProgressTotal=p=>p.pieces.length;

// Sign cells partition the entire graph by ALL current boundaries. Clicking
// the wrong cell paints that mathematically defined cell, not a random shape.
export function graphCellAt(pieceDef,x,y,tolerance=.09){
  if(!Number.isFinite(x)||!Number.isFinite(y))return null;
  const w=REGION_WORLD;
  if(x<=w.xmin||x>=w.xmax||y<=w.ymin||y>=w.ymax)return null;
  if(pieceDef.rules.some(r=>
    Math.abs(evaluateRegionRule(r,x,y))/Math.hypot(r.a,r.b)<tolerance))return null;
  const candidateRules=pieceDef.rules.map(r=>
    evaluateRegionRule(r,x,y)<0?r:{...r,a:-r.a,b:-r.b,c:-r.c,inclusive:true});
  const polygon=intersectRegion(candidateRules);
  if(polygonArea(polygon)<1e-8)return null;
  return {polygon,correct:pointSatisfiesAll(pieceDef.rules,x,y),x,y};
}

export function regionCentroid(points){
  if(!points.length)return null;
  const sum=points.reduce((acc,p)=>({x:acc.x+p.x,y:acc.y+p.y}),{x:0,y:0});
  return {x:sum.x/points.length,y:sum.y/points.length};
}

// Position one inward-pointing arrow at the piece-facing edge of each line.
// The end of every arrow is inside the satisfying half-plane.
export function graphArrow(ruleDef,polygon){
  const onEdge=polygon.filter(p=>Math.abs(evaluateRegionRule(ruleDef,p.x,p.y))<1e-7);
  let middle;
  if(onEdge.length>=2){
    middle={x:(onEdge[0].x+onEdge[1].x)/2,
      y:(onEdge[0].y+onEdge[1].y)/2};
  }else{
    const center=regionCentroid(polygon);
    if(!center)return null;
    const t=evaluateRegionRule(ruleDef,center.x,center.y)/
      (ruleDef.a*ruleDef.a+ruleDef.b*ruleDef.b);
    middle={x:center.x-t*ruleDef.a,y:center.y-t*ruleDef.b};
  }
  const size=Math.hypot(ruleDef.a,ruleDef.b);
  const nx=-ruleDef.a/size,ny=-ruleDef.b/size;
  return {x1:middle.x-nx*.15,y1:middle.y-ny*.15,
    x2:middle.x+nx*.44,y2:middle.y+ny*.44,
    nx,ny};
}

export function validateGraphPictureLibrary(){
  const pictureIds=new Set();
  for(const p of GRAPH_ART_PICTURES){
    if(pictureIds.has(p.id)||!p.pieces.length)throw Error("Invalid picture "+p.id);
    pictureIds.add(p.id);
    const pieceIds=new Set();
    for(const part of p.pieces){
      if(pieceIds.has(part.id)||part.rules.length<3)
        throw Error("Invalid picture piece "+part.id);
      pieceIds.add(part.id);
      const polygon=intersectRegion(part.rules);
      if(polygonArea(polygon)<.15)throw Error("Empty piece "+part.id);
      for(const r of part.rules){
        if(!r.id||!r.text||!Number.isFinite(r.a)||!Number.isFinite(r.b)||
          !Number.isFinite(r.c)||(r.a===0&&r.b===0)||!lineOnRegionGraph(r))
          throw Error("Invalid boundary "+r.id);
        const contact=polygon.filter(v=>
          Math.abs(evaluateRegionRule(r,v.x,v.y))<1e-7);
        if(contact.length<2)throw Error("Redundant or inactive boundary "+r.id);
      }
    }
  }
  return true;
}
