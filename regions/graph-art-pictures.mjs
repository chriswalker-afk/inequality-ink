// Graph Art: two distinct five-step paths. Every painted picture piece is the
// *actual* convex intersection of its displayed linear inequalities.
// We author convex vertices once, derive genuine bounding inequalities, and
// verify them. Decorative finish details never determine the solution.
import {
  REGION_FACETS,REGION_WORLD,evaluateRegionRule,intersectRegion,
  lineOnRegionGraph,polygonArea,pointSatisfiesAll
} from "./regions-engine.mjs";
import {LINEAR_QUICK_SPARKS} from "./linear-quick-sparks.mjs";
import {LINEAR_STEP_UPS} from "./linear-step-ups.mjs";
import {ADVANCED_LINEAR_PICTURES} from "./advanced-linear-pictures.mjs";

export const GRAPH_ART_STAGES=Object.freeze([
  Object.freeze({step:1,name:"Starter",summary:"Straight lines · an early win"}),
  Object.freeze({step:2,name:"Step Up",summary:"Add sloping boundaries"}),
  Object.freeze({step:3,name:"Building",summary:"Mixed slopes and strict signs"}),
  Object.freeze({step:4,name:"Challenge",summary:"Trickier intersections"}),
  Object.freeze({step:5,name:"Big Finish",summary:"More pieces and mixed forms"})
]);
const rule=(id,text,a,b,c,inclusive=true,form="slope")=>
  Object.freeze({id,text,a,b,c,inclusive,form});
const piece=(id,name,color,rules,vertices=null)=>
  Object.freeze({id,name,color,rules:Object.freeze(rules),vertices});
const picture=({id,name,mode,step,clue,description,focus,pieces,details})=>
  Object.freeze({id,name,mode,step,stage:GRAPH_ART_STAGES[step-1].name,
    clue,description,focus,pieces:Object.freeze(pieces),details});
const rect=(left,bottom,right,top)=>[
  [left,bottom],[right,bottom],[right,top],[left,top]
];
const diamond=(cx,cy,rx,ry)=>[
  [cx,cy+ry],[cx-rx,cy],[cx,cy-ry],[cx+rx,cy]
];
const gcd=(x,y)=>{
  let a=Math.abs(x),b=Math.abs(y);
  while(b){const r=a%b;a=b;b=r;}
  return a||1;
};
const rational=(numerator,denominator=1)=>{
  if(denominator<0){numerator=-numerator;denominator=-denominator;}
  const factor=gcd(numerator,denominator),n=numerator/factor,d=denominator/factor;
  if(!n)return "0";
  const minus=n<0?"−":"";
  const a=Math.abs(n);
  if(d===1)return minus+a;
  const symbols={"1/2":"½","1/3":"⅓","2/3":"⅔","1/4":"¼",
    "3/4":"¾","1/5":"⅕","2/5":"⅖","3/5":"⅗","4/5":"⅘"};
  return minus+(symbols[a+"/"+d]||(a+"/"+d));
};
const signedTerm=(n,v,first)=>{
  if(n===0)return "";
  const mag=Math.abs(n)===1?"":Math.abs(n);
  const body=mag+v;
  if(first)return (n<0?"−":"")+body;
  return (n<0?" − ":" + ")+body;
};
function readableRule(a,b,c,inclusive,form,flip){
  if(b===0){
    const less=a>0;
    return "x "+(less?(inclusive?"≤":"<"):(inclusive?"≥":">"))+
      " "+rational(c,a);
  }
  if(a===0){
    const less=b>0;
    return "y "+(less?(inclusive?"≤":"<"):(inclusive?"≥":">"))+
      " "+rational(c,b);
  }
  if(form==="standard"){
    const sign=flip?-1:1;
    const A=a*sign,B=b*sign,C=c*sign;
    return signedTerm(A,"x",true)+signedTerm(B,"y",false)+
      " "+(flip?(inclusive?"≥":">"):(inclusive?"≤":"<"))+
      " "+rational(C);
  }
  const less=b>0;
  const slope=-a/b,intercept=c/b;
  const slopeR=rational(-a,b);
  const m=Math.abs(slope)===1?(slope<0?"−":"")+"x":slopeR+"x";
  const interceptText=Math.abs(intercept)<1e-9?"":(
    intercept<0?" − "+rational(Math.abs(c),Math.abs(b)):
      " + "+rational(Math.abs(c),Math.abs(b)));
  return "y "+(less?(inclusive?"≤":"<"):(inclusive?"≥":">"))+
    " "+m+interceptText;
}
// All authored polygon vertices lie on the quarter-unit grid. After normalising
// the edge coefficients, even fractional gradients have exact integer rules.
function polygonPiece(id,name,color,points,{strict=[],standard=[],flip=[]}={}){
  if(points.length<3)throw Error("A picture piece needs three vertices: "+id);
  let vertices=points.map(p=>[...p]);
  const signed=vertices.reduce((sum,p,i)=>{
    const q=vertices[(i+1)%vertices.length];return sum+p[0]*q[1]-q[0]*p[1];
  },0);
  if(Math.abs(signed)<1e-8)throw Error("Flat polygon "+id);
  if(signed<0)vertices.reverse();
  const edges=vertices.map((v,i)=>{
    const next=vertices[(i+1)%vertices.length];
    const dx=Math.round((next[0]-v[0])*4);
    const dy=Math.round((next[1]-v[1])*4);
    if(Math.abs(dx/4-(next[0]-v[0]))>1e-8||
       Math.abs(dy/4-(next[1]-v[1]))>1e-8)
      throw Error("Vertices must sit on quarter-unit grid "+id);
    // Coefficients and edge constants must remain exact on the quarter grid.
    let a=dy*4,b=-dx*4,c=dy*4*v[0]-dx*4*v[1];
    if(!Number.isInteger(c))throw Error("Nonintegral edge constant "+id);
    const divisor=gcd(gcd(a,b),c);
    a/=divisor;b/=divisor;c/=divisor;
    const inclusive=!strict.includes(i);
    const form=a===0||b===0?"axis":standard.includes(i)?"standard":"slope";
    return rule(id+"-"+(i+1),readableRule(a,b,c,inclusive,form,
      flip.includes(i)),a,b,c,inclusive,form);
  });
  const frozenVertices=Object.freeze(vertices.map(p=>
    Object.freeze({x:p[0],y:p[1]})));
  return piece(id,name,color,edges,frozenVertices);
}
// Details must read both on the coloured geometry and on the ivory canvas.
// Keep delicate pale highlights on filled shapes, but use darker accents for
// elements floating outside the picture. The latter meet approximately 3:1
// non-text contrast against the graph's #fffcf8 canvas.
export const GRAPH_ART_DETAIL_COLORS=Object.freeze({
  gold:"#ac773d",
  amber:"#b78349",
  terracotta:"#ae7156",
  teal:"#4b8f9e",
  deepTeal:"#367c83",
  mintInk:"#2f6170",
  plum:"#8274b1",
  brown:"#885740",
  berry:"#a85970"
});
const DETAIL=GRAPH_ART_DETAIL_COLORS;
const D=(type,stage,attrs)=>Object.freeze({type,stage,...attrs});
const L=(stage,x1,y1,x2,y2,color=DETAIL.gold,width=.1,outline=null)=>
  D("line",stage,{x1,y1,x2,y2,color,width,outline});
const C=(stage,x,y,r,color)=>D("circle",stage,{x,y,r,color});
const S=(stage,x,y,r,color,outline=null)=>
  D("star",stage,{x,y,r,color,outline});
const R=(stage,x,y,w,h,color,outline=null)=>
  D("rect",stage,{x,y,w,h,color,outline});
const E=(stage,x,y,rx,ry,color)=>D("ellipse",stage,{x,y,rx,ry,color});

// Find & Fill: 2 → 3 → 4 → 6 → 9 regions.
const flag=picture({
  id:"signal-flag",name:"Signal Flag",mode:"fill",step:1,
  clue:"Flag in a Flash",description:"Two simple rectangles make a bright flag.",
  focus:"Vertical and horizontal inequalities; all boundaries are solid.",
  pieces:[
    polygonPiece("pole","The flagpole","#7098a4",rect(-3,-4,-2,3)),
    polygonPiece("banner","The colourful banner","#ef887f",rect(-2,0,3,3))
  ],
  details:[
    S(0,.45,1.5,.72,"#e7c86e",DETAIL.brown),
    S(1,3.65,3.75,.32,DETAIL.gold),
    L(1,-3.5,-4,-1.5,-4,"#58717c",.14)
  ]
});
// Keep original house ID, rule set, piece order, and saved progress unchanged.
const house=picture({
  id:"little-house",name:"Little House",mode:"fill",step:2,
  clue:"Home Sweet Home",description:"Three regions build a house and roof.",
  focus:"Meet diagonal boundaries: y ≤ x + c and y ≤ −x + c.",
  pieces:[
    piece("walls","Golden walls","#edbc73",[
      rule("wall-left","x ≥ −2.5",-1,0,2.5,true,"axis"),
      rule("wall-right","x ≤ 2.5",1,0,2.5,true,"axis"),
      rule("wall-floor","y ≥ −3",0,-1,3,true,"axis"),
      rule("wall-ceiling","y ≤ 1",0,1,1,true,"axis")
    ]),
    piece("roof","A red roof","#d6817a",[
      rule("roof-base","y ≥ 1",0,-1,-1,true,"axis"),
      rule("roof-left","y ≤ x + 4",-1,1,4),
      rule("roof-right","y ≤ −x + 4",1,1,4)
    ]),
    piece("door","The blue door","#7299c3",[
      rule("door-left","x ≥ −0.85",-1,0,.85,true,"axis"),
      rule("door-right","x ≤ 0.85",1,0,.85,true,"axis"),
      rule("door-bottom","y ≥ −3",0,-1,3,true,"axis"),
      rule("door-top","y ≤ −1",0,1,-1,true,"axis")
    ])
  ],
  details:"house"
});
const sail=picture({
  id:"sailboat-sunset",name:"Sailboat Sunset",mode:"fill",step:3,
  clue:"Catch the Breeze",description:"Four pieces reveal a boat at sunset.",
  focus:"Add steep gradients and a strict boundary (dashed line).",
  pieces:[
    polygonPiece("hull","The curved-looking hull","#437f9d",
      [[-4,-2],[3,-2],[2,-3],[-3,-3]],{strict:[2]}),
    polygonPiece("large-sail","The large sail","#f4b978",
      [[-3,-2],[0,1],[0,-2]]),
    polygonPiece("small-sail","The small sail","#ee8e87",
      [[0,-2],[0,2],[2,-2]],{strict:[1]}),
    polygonPiece("sun","The evening sun","#edc66f",
      diamond(3.25,3.25,.75,.75))
  ],
  details:[
    L(0,-4.5,-3.5,-2.9,-3.5,DETAIL.teal,.09),
    L(0,.2,-3.55,2.2,-3.55,DETAIL.teal,.09),
    L(0,-.08,-2,-.08,3.2,"#7a6a61",.1),
    S(1,-3.5,3.7,.32,DETAIL.gold),
    C(1,3.25,3.25,.3,DETAIL.amber)
  ]
});
const fox=picture({
  id:"origami-fox",name:"Origami Fox",mode:"fill",step:4,
  clue:"Forest Friend",description:"Six intersecting polygons make a friendly fox.",
  focus:"Interpret standard-form boundaries and fractional gradients.",
  pieces:[
    polygonPiece("fox-face","Amber face","#e9a26e",
      [[-3,0],[-2,-2],[0,-3],[2,-2],[3,0],[0,2]],
      {standard:[0,1,3,5],flip:[1,3],strict:[2]}),
    polygonPiece("fox-left-ear","Left ear","#c97864",
      [[-3,1],[-3,4],[-.75,2]],{standard:[1]}),
    polygonPiece("fox-right-ear","Right ear","#c97864",
      [[3,1],[3,4],[.75,2]],{standard:[1],flip:[1]}),
    polygonPiece("fox-left-eye","Left eye","#354561",
      [[-2,0],[-1,0],[-1.5,-1]],{strict:[2]}),
    polygonPiece("fox-right-eye","Right eye","#354561",
      [[1,0],[2,0],[1.5,-1]]),
    polygonPiece("fox-nose","Dark nose","#654c60",
      diamond(0,-1.75,.5,.5),{standard:[1,3]})
  ],
  details:[
    C(0,-2,-1.1,.24,DETAIL.berry),C(0,2,-1.1,.24,DETAIL.berry),
    L(1,-.45,-2.3,-1.8,-2.55,DETAIL.brown,.075),
    L(1,.45,-2.3,1.8,-2.55,DETAIL.brown,.075),
    S(1,3.65,3.8,.28,DETAIL.gold)
  ]
});
const rocket=picture({
  id:"cosmic-rocket",name:"Cosmic Rocket",mode:"fill",step:5,
  clue:"Launch Sequence",description:"Nine mathematical pieces launch into space.",
  focus:"Combine standard form, strict signs and fractional gradients.",
  pieces:[
    polygonPiece("rocket-body","The main body","#8ec5d1",
      rect(-1.5,-2,1.5,2),{strict:[2]}),
    polygonPiece("rocket-nose","The pointed nose","#eb9290",
      [[-1.5,2],[0,4],[1.5,2]],{standard:[0,1],flip:[1]}),
    polygonPiece("rocket-left-fin","Left fin","#cf677b",
      [[-1.5,-1],[-3,-3],[-1.5,-2.5]],{standard:[1],strict:[1]}),
    polygonPiece("rocket-right-fin","Right fin","#cf677b",
      [[1.5,-1],[3,-3],[1.5,-2.5]],{standard:[1]}),
    polygonPiece("rocket-window","Crystal window","#4b86aa",
      diamond(0,.75,.75,.75),{standard:[0,2],flip:[2]}),
    polygonPiece("rocket-engine","Engine casing","#687b96",
      rect(-.75,-2.75,.75,-2)),
    polygonPiece("rocket-flame","Blazing flame","#f5b96c",
      [[-.75,-2.75],[.75,-2.75],[0,-4.75]],
      {standard:[1],strict:[1]}),
    polygonPiece("rocket-core","Glowing centre","#f8da85",
      [[-.5,-2.75],[.5,-2.75],[0,-4]],
      {standard:[2]}),
    polygonPiece("rocket-star","Distant star","#f4d78a",
      diamond(3.25,3.25,.75,.75),{standard:[1,3],strict:[3]})
  ],
  details:[
    C(0,0,.75,.3,"#d3f7f7"),
    L(0,-1.2,-.2,1.2,-.2,DETAIL.deepTeal,.09),
    S(1,-3.65,2.9,.38,DETAIL.amber),
    S(1,3.65,-.7,.23,DETAIL.plum),
    S(2,-4,-3.8,.22,DETAIL.amber)
  ]
});

// Build & Shade: 2 → 3 → 4 → 5 → 8 regions, a separate art path.
const gift=picture({
  id:"wrapped-gift",name:"Wrapped Gift",mode:"build",step:1,
  clue:"Wrapped with Wonder",description:"Two solid-boundary regions wrap a gift.",
  focus:"Choose above/below or left/right, and use solid boundaries.",
  pieces:[
    polygonPiece("gift-box","The gift box","#db90a4",
      rect(-2.5,-3,2.5,1.5)),
    polygonPiece("gift-ribbon","The golden ribbon","#edc477",
      rect(-.5,-3,.5,1.5))
  ],
  details:[
    E(0,-.6,2.05,.9,.43,DETAIL.amber),
    E(0,.6,2.05,.9,.43,DETAIL.amber),
    C(1,0,2,.22,DETAIL.brown),S(1,3.4,3.2,.32,DETAIL.terracotta),
    L(1,-2.2,-2.55,-1.4,-2.55,DETAIL.berry,.1)
  ]
});
const mountains=picture({
  id:"mountain-morning",name:"Mountain Morning",mode:"build",step:2,
  clue:"Peak Performance",description:"Three regions form peaks and morning sunshine.",
  focus:"Rising and falling boundaries, plus your first strict (dashed) line.",
  pieces:[
    polygonPiece("mountain-left","The first mountain","#7ca9a5",
      [[-4.5,-3],[-.5,1],[3.5,-3]]),
    polygonPiece("mountain-right","The second mountain","#648fad",
      [[-1,-3],[2,0],[4,-3]]),
    polygonPiece("mountain-sun","The morning sun","#f3cb72",
      diamond(3,3,1,1),{strict:[1]})
  ],
  details:[
    L(0,-.5,1,-1.15,.35,"#b9ddd0",.10,DETAIL.mintInk),
    L(0,-.5,1,.15,.35,"#b9ddd0",.10,DETAIL.mintInk),
    C(1,-3.5,3.5,.22,DETAIL.amber),
    S(1,-2.5,3.9,.27,DETAIL.gold)
  ]
});
const robot=picture({
  id:"friendly-robot",name:"Friendly Robot",mode:"build",step:3,
  clue:"Hello, Human!",description:"Four regions assemble a charming robot.",
  focus:"Mix diagonal and straight boundaries, including strict signs.",
  pieces:[
    polygonPiece("robot-body","The robot body","#7baeba",
      rect(-2,-3,2,-.5)),
    polygonPiece("robot-head","The clever head","#99c4ca",
      [[-2.5,-.25],[2.5,-.25],[2.5,2],[1.75,2.75],[-1.75,2.75],[-2.5,2]],
      {strict:[1]}),
    polygonPiece("robot-arm-left","Left arm","#657fa2",
      [[-2,-1],[-4,-.5],[-3,-2.5]],{standard:[1]}),
    polygonPiece("robot-arm-right","Right arm","#657fa2",
      [[2,-1],[4,-.5],[3,-2.5]],{standard:[1],strict:[2]})
  ],
  details:[
    R(0,-1.45,.6,.85,.8,"#2b4f6e"),
    R(0,.6,.6,.85,.8,"#2b4f6e"),
    C(0,-1.05,1.1,.18,"#ddf9ec"),
    C(0,1.05,1.1,.18,"#ddf9ec"),
    L(1,-.75,.2,.75,.2,"#365771",.12),
    C(1,0,-1.8,.34,"#e6d097"),
    S(2,-3.55,3.8,.27,DETAIL.gold)
  ]
});
// Preserve Aurora Crystal's original five facet rules and progress exactly.
const crystal=picture({
  id:"aurora-crystal",name:"Aurora Crystal",mode:"build",step:4,
  clue:"A Flash of Colour",description:"Five facets meet around a dashed diamond.",
  focus:"Combine intersecting gradients and four strict inequalities.",
  pieces:REGION_FACETS.map(f=>piece(f.id,f.name,f.color,f.rules)),
  details:"crystal"
});
const castle=picture({
  id:"moonlit-castle",name:"Moonlit Castle",mode:"build",step:5,
  clue:"Castle in the Clouds",description:"Eight regions rise into an enchanted fortress.",
  focus:"Mixed standard forms, strict boundaries and sloping half-planes.",
  pieces:[
    polygonPiece("castle-keep","The great hall","#d1ae8e",
      rect(-2,-3,2,1)),
    polygonPiece("castle-left-tower","The left tower","#9c99b3",
      rect(-4,-3,-2,2),{strict:[1]}),
    polygonPiece("castle-right-tower","The right tower","#9c99b3",
      rect(2,-3,4,2),{strict:[3]}),
    polygonPiece("castle-left-roof","Left tower roof","#797fa6",
      [[-4.5,2],[-3,4],[-1.5,2]],{standard:[1],flip:[1]}),
    polygonPiece("castle-right-roof","Right tower roof","#797fa6",
      [[1.5,2],[3,4],[4.5,2]],{standard:[0,2],strict:[1]}),
    polygonPiece("castle-door","The arched doorway","#665471",
      rect(-.75,-3,.75,-.5)),
    polygonPiece("castle-flag","The royal pennant","#ef927f",
      [[-.25,1.5],[-.25,3.5],[1.5,2.5]],
      {standard:[1],flip:[1]}),
    polygonPiece("castle-moon","The moonlight","#f8d88b",
      diamond(0,4.25,.5,.5),{standard:[0,2],strict:[3]})
  ],
  details:[
    R(0,-3.6,.15,.85,.65,"#cfcfaf",DETAIL.brown),
    R(0,2.75,.15,.85,.65,"#cfcfaf",DETAIL.brown),
    R(0,-.6,-.1,1.2,.5,"#f2d6ad"),
    L(1,-4,-1.1,-2,-1.1,"#75637c",.06),
    L(1,2,-1.1,4,-1.1,"#75637c",.06),
    L(1,-.25,1.5,-.25,4,"#675b77",.075),
    S(2,-.5,4.2,.2,DETAIL.gold)
  ]
});

/* Phase 6: optional same-level practice, separate from the five-stage path.
   These pictures are independent mathematical polygons, not copies of art
   whose answers have already been seen. */
const campTent=Object.freeze({...picture({
  id:"camping-tent",name:"Mountain Tent",mode:"fill",step:2,
  clue:"Under the Stars",description:"Build a tent, doorway and glowing campfire.",
  focus:"Three genuine intersections · straight lines · changing gradients",
  pieces:[
    polygonPiece("camp-canvas","Turquoise tent","#7dbbb3",
      [[-3,-3],[0,2.5],[3,-3]]),
    polygonPiece("camp-entrance","Tent doorway","#597f9f",
      [[-.75,-3],[0,-1.5],[.75,-3]]),
    polygonPiece("camp-fire","Firelight","#efad70",
      diamond(3.75,-2.25,.75,.75))
  ],
  details:[
    L(0,0,2.55,0,3.5,DETAIL.brown,.085),
    S(1,-3.9,3.5,.3,DETAIL.gold),
    S(1,3.65,3.75,.22,DETAIL.terracotta),
    L(1,3.2,-3.45,4.3,-3.45,DETAIL.brown,.13),
    C(2,3.75,-2.2,.2,"#e6d18b"),
    S(2,-4,-.5,.22,DETAIL.amber),
    L(2,-3.8,-3.3,-2.9,-3.3,DETAIL.mintInk,.08)
  ]
}),practice:true});
const diamondKite=Object.freeze({...picture({
  id:"diamond-kite",name:"Diamond Kite",mode:"build",step:2,
  clue:"Catch the Wind",description:"Read the shaded sides to assemble a kite and bows.",
  focus:"Reverse-reading inequalities · gradients · solid and dashed lines",
  pieces:[
    polygonPiece("kite-sail","The diamond sail","#83b7cc",
      diamond(0,1.5,2,2.25),{strict:[1]}),
    polygonPiece("kite-bow-left","Left ribbon","#efa0ac",
      diamond(-1,-2.25,.75,.5)),
    polygonPiece("kite-bow-right","Right ribbon","#eabf79",
      diamond(1,-2.25,.75,.5),{strict:[2]})
  ],
  details:[
    L(0,0,-.75,0,-4.2,DETAIL.mintInk,.09),
    L(0,-1.1,1.5,1.1,1.5,"#e2f0e9",.06,DETAIL.deepTeal),
    L(0,0,-.25,0,3.3,"#e2f0e9",.06,DETAIL.deepTeal),
    C(1,0,-2.35,.2,DETAIL.brown),
    S(1,3.6,3.4,.27,DETAIL.gold),
    S(2,-3.65,2.9,.2,DETAIL.amber),
    L(2,-.4,-3.8,.35,-3.5,DETAIL.mintInk,.065)
  ]
}),practice:true,practiceType:"reverse"});
export const GRAPH_PRACTICE_PICTURES=Object.freeze([campTent,diamondKite,...LINEAR_QUICK_SPARKS,...LINEAR_STEP_UPS,...ADVANCED_LINEAR_PICTURES]);
export const graphPracticeGallery=mode=>GRAPH_PRACTICE_PICTURES.filter(p=>p.mode===mode);
// Graph-to-inequality multiple choice: four genuinely different boundary
// relations. No hidden wording gives away the answer before a choice is made.
export function reverseInequalityOptions(rule){
  if(!rule?.text)throw Error("Missing reverse inequality");
  const match=rule.text.match(/[≤≥<>]/g);
  if(!match||match.length!==1)throw Error("A single inequality sign is required");
  const options=["<","≤",">","≥"].map(sign=>rule.text.replace(match[0],sign));
  const seed=[...rule.id].reduce((n,ch)=>n+ch.charCodeAt(0),0);
  const turn=seed%4;
  return Object.freeze([...options.slice(turn),...options.slice(0,turn)]);
}

const galleries=Object.freeze({
  fill:Object.freeze([flag,house,sail,fox,rocket]),
  build:Object.freeze([gift,mountains,robot,crystal,castle])
});
export const GRAPH_ART_PICTURES=Object.freeze([
  ...galleries.fill,...galleries.build
]);
export const GRAPH_ART_MODES=Object.freeze([
  Object.freeze({id:"fill",name:"Find & Fill",
    description:"Read every inequality, then fill the region they share."}),
  Object.freeze({id:"build",name:"Build & Shade",
    description:"Choose each side and line style, then reveal their intersection."})
]);
export const GRAPH_ART_SAVE_KEY="inequality-ink-graph-art-v2";
export const GRAPH_ART_LEGACY_SAVE_KEY="inequality-ink-graph-art-v1";
export const graphPicture=id=>[...GRAPH_ART_PICTURES,...GRAPH_PRACTICE_PICTURES].find(p=>p.id===id)||null;
export const graphMode=id=>GRAPH_ART_MODES.some(m=>m.id===id);
export const graphModeGallery=mode=>galleries[mode]||[];
export const graphLegacyExtras=(mode,records={})=>
  GRAPH_ART_PICTURES.filter(p=>p.mode!==mode&&records?.[mode+":"+p.id]);
export const pictureProgressTotal=p=>p.pieces.length;
export const graphTotalBoundaries=p=>p.pieces.reduce((n,part)=>n+part.rules.length,0);

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
export function graphArrow(ruleDef,polygon){
  const onEdge=polygon.filter(p=>
    Math.abs(evaluateRegionRule(ruleDef,p.x,p.y))<1e-7);
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
    x2:middle.x+nx*.44,y2:middle.y+ny*.44,nx,ny};
}
export function validateGraphPictureLibrary(){
  const pictureIds=new Set(),stageLabels=GRAPH_ART_STAGES.map(s=>s.name);
  for(const mode of GRAPH_ART_MODES){
    const gallery=graphModeGallery(mode.id);
    if(gallery.length!==5)throw Error("Each mode needs exactly five pictures");
    if(gallery.some((p,i)=>p.step!==i+1||p.mode!==mode.id||
      p.stage!==stageLabels[i]))throw Error("Mode gallery has incorrect order");
    if(gallery.some((p,i)=>i>0&&p.pieces.length<=gallery[i-1].pieces.length))
      throw Error("Picture piece counts must increase strictly");
  }
  for(const p of [...GRAPH_ART_PICTURES,...GRAPH_PRACTICE_PICTURES]){
    if(pictureIds.has(p.id)||!p.pieces.length||!p.focus)
      throw Error("Invalid picture "+p.id);
    pictureIds.add(p.id);
    const pieceIds=new Set();
    for(const part of p.pieces){
      if(pieceIds.has(part.id)||part.rules.length<3)
        throw Error("Invalid picture piece "+part.id);
      pieceIds.add(part.id);
      const poly=intersectRegion(part.rules);
      if(polygonArea(poly)<.15)throw Error("Empty piece "+part.id);
      if(part.vertices){
        const authoredArea=polygonArea(part.vertices);
        if(Math.abs(authoredArea-polygonArea(poly))>1e-6)
          throw Error("Wrong polygon intersection "+part.id);
        // A concave polygon would cause the intersection to differ from the
        // original path, or leave redundant edge inequalities.
        const v=part.vertices;
        for(let i=0;i<v.length;i++){
          const a=v[i],b=v[(i+1)%v.length],c=v[(i+2)%v.length];
          if((b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x)<1e-9)
            throw Error("Non-strictly-convex piece "+part.id);
        }
      }
      const ruleIds=new Set();
      for(const r of part.rules){
        if(ruleIds.has(r.id)||!r.id||!r.text||
          !Number.isFinite(r.a)||!Number.isFinite(r.b)||
          !Number.isFinite(r.c)||(r.a===0&&r.b===0)||
          !lineOnRegionGraph(r))
          throw Error("Invalid boundary "+r.id);
        ruleIds.add(r.id);
        if(poly.filter(v=>
          Math.abs(evaluateRegionRule(r,v.x,v.y))<1e-7).length<2)
          throw Error("Redundant or inactive boundary "+r.id);
      }
    }
  }
  if(GRAPH_ART_PICTURES.length!==10||GRAPH_PRACTICE_PICTURES.length!==41)
    throw Error("Expected ten core and forty-one practice pictures");
  for(const mode of GRAPH_ART_MODES){
    const bonus=graphPracticeGallery(mode.id),starter=bonus.filter(p=>p.step===1);
    if(bonus.length!==(mode.id==="fill"?20:21)||starter.length!==4||starter.some(p=>
      !p.quickSpark||p.pieces.length!==2||p.stage!=="Starter"||
      p.pieces.some(part=>part.rules.some(r=>r.a!==0&&r.b!==0))))
      throw Error("Quick Spark practice must use two solid mathematical regions");
    const stepUp=bonus.filter(p=>p.step===2);
    if(stepUp.length!==(mode.id==="fill"?4:5)||stepUp.some(p=>
      p.stage!=="Step Up"||p.pieces.length!==3))
      throw Error("Step Up practice must match core difficulty");
    for(const [step,count] of [[3,4],[4,4],[5,4]]){
      const group=bonus.filter(p=>p.step===step);
      if(group.length!==count||group.some(p=>!p.advancedVariety||
        p.stage!==GRAPH_ART_STAGES[step-1].name||
        p.pieces.length!==(step===3?4:step===4?
          (mode.id==="fill"?6:5):(mode.id==="fill"?9:8))))
        throw Error("Advanced linear art missing from "+mode.id+" stage "+step);
    }
  }
  return true;
}
