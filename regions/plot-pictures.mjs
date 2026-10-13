// Phase 3 playable prototype: two true inequality regions become one umbrella.
import {q,regionPaths,satisfiesAll} from "./curved-engine.mjs";
import {checkConstruction} from "./plot-engine.mjs";
const rule=(id,text,coeffs,side,inclusive=true)=>q(id,text,coeffs,side,inclusive);
const piece=(id,name,color,rules,plot)=>Object.freeze({
  id,name,color,rules:Object.freeze(rules),plot:Object.freeze({
    ...plot,samplePoints:Object.freeze(plot.samplePoints.map(p=>Object.freeze(p)))
  })
});
const decoration=(id,stage,type,values)=>Object.freeze({id,stage,type,...values});
const Q=(id,stage,x1,y1,cx,cy,x2,y2,stroke,width=.07)=>
  decoration(id,stage,"curve",{x1,y1,cx,cy,x2,y2,stroke,width});
const C=(id,stage,x,y,r,fill,stroke="#886b66",width=.05)=>
  decoration(id,stage,"circle",{x,y,r,fill,stroke,width});
const E=(id,stage,x,y,rx,ry,fill,stroke="#886b66",width=.04)=>
  decoration(id,stage,"ellipse",{x,y,rx,ry,fill,stroke,width});
const S=(id,stage,x,y,r,fill="#e2aa68",stroke="#896957",width=.05)=>
  decoration(id,stage,"star",{x,y,r,fill,stroke,width});
export const PLOT_PICTURE=Object.freeze({
  id:"little-umbrella",name:"Little Umbrella",
  clue:"A little shelter from the rain",
  focus:"Plot a parabola · plot a line · select curved regions",
  description:"Sketch two boundaries and find the coloured umbrella and puddle.",
  pieces:Object.freeze([
    piece("canopy","Coral canopy","#e9a2a0",[
      rule("canopy-arch","y ≤ 4 − 0.5x²",[4,0,-.5],"below"),
      rule("canopy-rim","y ≥ 1",[1],"above")
    ],{
      ruleId:"canopy-arch",kind:"parabola",
      guidance:"Place the turning point, then any second point on the parabola.",
      hints:[
        "The parabola reaches its maximum at (0, 4). Place that as your first point.",
        "A point on this parabola is (2, 2), but any other correct point also works."
      ],
      samplePoints:[{x:0,y:4},{x:2,y:2}]
    }),
    piece("puddle","Blue puddle","#83c6cd",[
      rule("puddle-bottom","y ≥ −4 + 0.25x²",[-4,0,.25],"above"),
      rule("puddle-top","y < −3",[-3],"below",false)
    ],{
      ruleId:"puddle-top",kind:"line",
      guidance:"Place any two different points on the straight boundary.",
      hints:[
        "The graph of y = −3 is a horizontal line.",
        "Both (−2, −3) and (2, −3) lie on this boundary. Other correct points work too."
      ],
      samplePoints:[{x:-2,y:-3},{x:2,y:-3}]
    })
  ]),
  details:Object.freeze([
    Q("canopy-rib-left",1,-2.1,1.18,-1.5,2.6,-.4,3.72,"#ad667f",.055),
    Q("canopy-rib-right",1,2.1,1.18,1.5,2.6,.4,3.72,"#ad667f",.055),
    C("canopy-top",1,0,4.12,.15,"#e4b76d","#915d69"),
    E("canopy-spot-left",1,-1.43,2.1,.17,.13,"#ffdfb8","#bd777f"),
    E("canopy-spot-right",1,1.43,2.1,.17,.13,"#ffdfb8","#bd777f"),
    Q("canopy-trim-left",1,-2.28,1.03,-1.14,1.32,0,1.04,"#9c5d75",.075),
    Q("canopy-trim-right",1,0,1.04,1.14,1.32,2.28,1.03,"#9c5d75",.075),
    Q("umbrella-shaft",2,0,1.04,.02,-.88,0,-2.75,"#4d677a",.115),
    Q("umbrella-handle",2,0,-2.75,.16,-3.48,.79,-3.20,"#4d677a",.115),
    Q("puddle-ripple-a",2,-1.35,-3.48,-.9,-3.32,-.46,-3.47,"#3d899b",.055),
    Q("puddle-ripple-b",2,.59,-3.50,1.04,-3.33,1.48,-3.51,"#3d899b",.055),
    C("rain-left-a",3,-3.62,.57,.10,"#7fc2d8","#48768f"),
    C("rain-left-b",3,-3.01,-1.38,.10,"#7fc2d8","#48768f"),
    C("rain-right-a",3,3.55,.60,.11,"#7fc2d8","#48768f"),
    C("rain-right-b",3,3.13,-1.34,.10,"#7fc2d8","#48768f"),
    S("spark-left",3,-4.05,3.35,.19),
    S("spark-right",3,4.06,3.35,.19),
    C("water-dot-l",3,-2.58,-3.70,.068,"#6b9eab","#56798b"),
    C("water-dot-r",3,2.56,-3.70,.068,"#6b9eab","#56798b")
  ])
});
export function plotRule(part){return part.rules.find(r=>r.id===part.plot.ruleId);}
export function validatePlotPicture(p=PLOT_PICTURE){
  if(p.pieces.length!==2||p.details.length<12)throw Error("Invalid prototype picture");
  const ids=new Set();
  for(const part of p.pieces){
    if(ids.has(part.id))throw Error("Duplicate picture piece");
    ids.add(part.id);
    const target=plotRule(part);
    if(!target||!regionPaths(part.rules).length||
      !part.rules.every(r=>r.kind==="function"))
      throw Error("Plot picture must contain real mathematical regions");
    if(!checkConstruction({kind:part.plot.kind,rule:target},part.plot.samplePoints).correct)
      throw Error("Example construction does not match actual inequality: "+part.id);
    let found=false;
    for(let x=-4.5;x<=4.5&&!found;x+=.5)
      for(let y=-4.5;y<=4.5;y+=.5)
        if(satisfiesAll(part.rules,x,y)){found=true;break;}
    if(!found)throw Error("Picture piece has no tappable area");
  }
  if(new Set(p.details.map(d=>d.id)).size!==p.details.length)
    throw Error("Decorations need unique IDs");
  return true;
}
