import {intersectRegion} from "./regions-engine.mjs";
import {regionPaths} from "./curved-engine.mjs";
const NS="http://www.w3.org/2000/svg", PAD=52,SCALE=51.6;
const px=x=>PAD+(x+5)*SCALE, py=y=>PAD+(5-y)*SCALE;
const round=x=>Number(x).toFixed(2);
function node(root,tag,attrs){
  const el=document.createElementNS(NS,tag);
  for(const [k,v] of Object.entries(attrs))if(v!==undefined&&v!==null)
    el.setAttribute(k,String(v));
  root.append(el);return el;
}
const path=points=>points.length?points.map((p,i)=>
  (i?"L":"M")+round(px(p.x??p[0]))+" "+round(py(p.y??p[1]))).join(" ")+" Z":"";
function details(root,p,linear=false){
  for(const d of Array.isArray(p.details)?p.details:[]){
    const color=linear?d.color:d.fill,stroke=d.stroke,unit=SCALE;
    if(d.type==="circle"||d.type==="ellipse")
      node(root,"ellipse",{cx:px(d.x),cy:py(d.y),rx:(d.rx??d.r)*unit,
        ry:(d.ry??d.r)*unit,fill:color,stroke:stroke||"none",
        "stroke-width":(d.width||.04)*unit});
    else if(d.type==="line")
      node(root,"line",{x1:px(d.x1),y1:py(d.y1),x2:px(d.x2),y2:py(d.y2),
        stroke:color,"stroke-width":Math.max(2,(d.width||.05)*unit),
        "stroke-linecap":"round"});
    else if(d.type==="rect")
      node(root,"rect",{x:px(d.x),y:py(d.y+d.h),width:d.w*unit,
        height:d.h*unit,rx:4,fill:color,stroke:d.outline||"none"});
    else if(d.type==="curve")
      node(root,"path",{d:"M"+round(px(d.x1))+" "+round(py(d.y1))+
        " Q"+round(px(d.cx))+" "+round(py(d.cy))+" "+
        round(px(d.x2))+" "+round(py(d.y2)),fill:"none",
        stroke:stroke,"stroke-width":(d.width||.05)*unit,
        "stroke-linecap":"round"});
    else if(d.type==="star"){
      const pts=Array.from({length:10},(_,i)=>{
        const r=d.r*(i%2?.42:1),a=-Math.PI/2+i*Math.PI/5;
        return {x:d.x+r*Math.cos(a),y:d.y+r*Math.sin(a)};
      });
      node(root,"path",{d:path(pts),fill:color,stroke:stroke||"none",
        "stroke-width":(d.width||.04)*unit});
    }
  }
}
// Render only the finished picture; no axis, grid or surrounding rectangular card.
export function drawGraphMuralArt(root,entry){
  const p=entry.picture,linear=entry.mode==="fill"||entry.mode==="build";
  for(const part of p.pieces){
    const regions=linear?[intersectRegion(part.rules)]:regionPaths(part.rules,undefined,125);
    for(const polygon of regions)if(polygon.length>=3)
      node(root,"path",{d:path(polygon),fill:part.color,stroke:"#fff9f0",
        "stroke-width":3.2,"stroke-linejoin":"round"});
  }
  details(root,p,linear);
  if(linear&&!Array.isArray(p.details)&&p.details==="house"){
    for(const x of [-1.72,1.03]){
      node(root,"rect",{x:px(x),y:py(.1),width:.7*SCALE,height:.75*SCALE,
        rx:3,fill:"#b9dfe5",stroke:"#42646a","stroke-width":3});
      node(root,"line",{x1:px(x+.35),y1:py(-.65),x2:px(x+.35),y2:py(.1),
        stroke:"#42646a","stroke-width":2});
    }
    node(root,"circle",{cx:px(.47),cy:py(-2.13),r:4,fill:"#f7e7a5"});
  }else if(linear&&!Array.isArray(p.details)){
    for(const [x,y] of [[-3.9,4.1],[3.8,3.7],[-3.4,-4.2]])
      node(root,"text",{x:px(x),y:py(y),"font-size":25,
        "text-anchor":"middle",fill:"#d88d74"}).textContent="✧";
    node(root,"circle",{cx:px(0),cy:py(0),r:9,fill:"#f5e3be",
      "fill-opacity":.65});
  }
}
