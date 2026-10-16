// Quick Spark — sixteen? No: four individually drawn early-win designs in
// each linear mode. Every coloured piece is an actual axis-aligned intersection,
// and finishing details are staged separately from mathematical regions.
//
// Two-piece pictures deliberately use only x>=c, x<=c, y>=c and y<=c.
// A couple of Build & Shade boundaries are strict so the solid/dashed control
// stays relevant without introducing rearranging or sloping lines.
const colors=Object.freeze({
  ink:"#415c70",light:"#fff2d5",line:"#496c75",
  gold:"#b8874d",berry:"#aa6173",leaf:"#3f8270",rose:"#c67f83",
  blue:"#4a8095",purple:"#7e70a5"
});
const detail=(type,stage,props)=>Object.freeze({type,stage,...props});
const C=(stage,x,y,r,color)=>detail("circle",stage,{x,y,r,color});
const E=(stage,x,y,rx,ry,color)=>detail("ellipse",stage,{x,y,rx,ry,color});
const R=(stage,x,y,w,h,color)=>detail("rect",stage,{x,y,w,h,color});
const L=(stage,x1,y1,x2,y2,color=colors.line,width=.1)=>
  detail("line",stage,{x1,y1,x2,y2,color,width});
const S=(stage,x,y,r,color=colors.gold)=>detail("star",stage,{x,y,r,color});
const notation=n=>String(n).replace("-", "−");
const edge=(id,letter,sign,n,inclusive=true)=>{
  const isX=letter==="x",less=sign==="≤";
  const a=isX?(less?1:-1):0,b=isX?0:(less?1:-1);
  const value=less?n:-n;
  return Object.freeze({id,
    text:letter+" "+(inclusive?sign:(less?"<":">"))+" "+notation(n),
    a,b,c:value,inclusive,form:"axis"});
};
function box(id,name,color,left,bottom,right,top,strict=[]){
  if(!(left<right&&bottom<top))throw Error("Invalid Quick Spark box "+id);
  return Object.freeze({id,name,color,rules:Object.freeze([
    edge(id+"-left","x","≥",left,!strict.includes("left")),
    edge(id+"-right","x","≤",right,!strict.includes("right")),
    edge(id+"-bottom","y","≥",bottom,!strict.includes("bottom")),
    edge(id+"-top","y","≤",top,!strict.includes("top"))
  ])});
}
function make(mode,id,name,clue,description,focus,parts,details){
  return Object.freeze({
    id,name,mode,step:1,stage:"Starter",clue,description,focus,
    pieces:Object.freeze(parts),
    details:Object.freeze(details.map((d,i)=>Object.freeze({
      id:id+"-detail-"+(i+1),...d
    }))),
    practice:true,quickSpark:true
  });
}
export const LINEAR_QUICK_SPARKS=Object.freeze([
  make("fill","quick-treehouse-sapling","Apple Tree","A Little Orchard",
    "Grow a friendly tree from a trunk and a wide, leafy crown.",
    "Just x and y limits · four straight boundaries per region · solid lines",[
      box("tree-trunk","The tree trunk","#b99677",-.65,-3.5,.65,-.35),
      box("tree-crown","A leafy crown","#7cbb94",-2.8,-.35,2.8,2.75)
    ],[
      C(1,-1.5,1.4,.30,"#e59b8c"),C(1,1.3,1.7,.28,"#df8d87"),
      C(1,.25,.75,.25,"#f4bb88"),C(1,-.6,2.4,.25,"#d48e8f"),
      R(1,-.30,-2.3,.18,.48,"#805e4e"),L(1,-.4,-.9,.35,-1.5,colors.ink,.065),
      L(2,-3.5,-3.6,3.5,-3.6,colors.leaf,.12),
      C(2,3.55,-3.5,.15,"#eec987"),C(2,-3.5,-3.5,.13,"#e7ad8e"),
      S(3,3.7,3.55,.22),S(3,-3.65,3.2,.17),
      C(3,2.9,3.4,.10,colors.berry)
    ]),
  make("fill","quick-cocoa-mug","Hot Cocoa","Something Warm",
    "Two rectangular regions become a cocoa mug and its foamy topping.",
    "Bounded x and y inequalities · solid boundaries · small numbers",[
      box("mug-cup","Warm mug","#80b9bb",-2.4,-2.6,2.3,1.25),
      box("mug-froth","A creamy top","#f2cc97",-2.35,1.05,2.25,1.8)
    ],[
      E(1,2.55,-.15,.65,1.2,"#a1cfc6"),
      E(1,2.65,-.15,.30,.8,"#fffcf8"),
      C(1,-.7,-.2,.14,colors.ink),C(1,.7,-.2,.14,colors.ink),
      L(1,-.6,-.9,.55,-.9,colors.ink,.11),C(1,-1.5,.65,.18,colors.light),
      L(2,-1.3,2.0,-1.45,2.65,colors.ink,.08),
      L(2,.05,2.0,-.10,2.85,colors.ink,.08),
      L(2,1.4,2.0,1.25,2.55,colors.ink,.08),
      C(3,-3.75,-2.8,.13,colors.gold),S(3,3.65,3.0,.25),
      C(3,3.6,-2.4,.10,colors.berry)
    ]),
  make("fill","quick-village-bus","Little Bus","All Aboard",
    "A colourful bus body and roof, with windows and wheels at the reveal.",
    "Read x ≥ and x ≤ together with y ≥ and y ≤",[
      box("bus-body","The bus body","#e9a288",-3.7,-1.8,3.7,.65),
      box("bus-roof","The cabin","#f0c489",-2.85,.65,2.55,2.0)
    ],[
      R(1,-2.4,.98,1.08,.66,"#5b8ca4"),R(1,-1.0,.98,1.08,.66,"#5b8ca4"),
      R(1,.40,.98,1.08,.66,"#5b8ca4"),R(1,1.8,.98,.44,.66,"#5b8ca4"),
      C(1,-2.4,-1.82,.55,colors.ink),C(1,2.35,-1.82,.55,colors.ink),
      C(1,-2.4,-1.82,.20,"#c4d7cf"),C(1,2.35,-1.82,.20,"#c4d7cf"),
      R(2,3.05,-.7,.35,.28,colors.light),R(2,-3.5,-.7,.25,.28,colors.berry),
      L(2,-3.4,-.1,3.35,-.1,colors.rose,.07),
      S(3,-4.2,3.3,.21),S(3,4.15,2.9,.26)
    ]),
  make("fill","quick-birthday-cake","Birthday Cake","Make a Wish",
    "Two layers, candles and colourful icing form a tiny celebration.",
    "Easy vertical/horizontal inequalities · four solid edges",[
      box("cake-base","Vanilla cake","#e9bb80",-2.15,-2.75,2.15,-.55),
      box("cake-icing","Icing layer","#e99fac",-2.4,-.55,2.4,1.20)
    ],[
      R(1,-1.22,.1,.45,.32,"#ffe9b7"),R(1,.88,.07,.42,.35,"#ffe9b7"),
      C(1,-.45,.44,.13,"#f4c987"),C(1,.68,.48,.14,"#f9d7af"),
      L(1,-1.0,1.2,-1.0,2.6,colors.blue,.12),
      L(1,0,1.2,0,2.85,colors.blue,.12),
      L(1,1.0,1.2,1.0,2.6,colors.blue,.12),
      C(2,-1.0,2.8,.16,"#e7a66e"),C(2,0,3.05,.16,"#e7a66e"),
      C(2,1.0,2.8,.16,"#e7a66e"),
      L(2,-2.3,-2.9,2.3,-2.9,colors.berry,.13),
      S(3,-3.9,3.4,.23),S(3,3.8,3.3,.28)
    ]),
  make("build","quick-little-robot","Pocket Robot","Hello, Earth!",
    "Put together a rectangular head and body, then reveal a friendly face.",
    "Choose above/below and left/right · solid boundaries",[
      box("bot-body","The robot body","#83b0c2",-2.3,-3.1,2.3,.15),
      box("bot-head","Robot head","#b3c8d2",-1.8,.15,1.8,2.85)
    ],[
      R(1,-1.18,1.20,.75,.62,colors.ink),R(1,.45,1.20,.75,.62,colors.ink),
      R(1,-.96,1.41,.27,.21,"#f6e9b9"),R(1,.68,1.41,.27,.21,"#f6e9b9"),
      L(1,-.78,.65,.8,.65,colors.blue,.1),
      C(1,0,-1.8,.43,"#ebce92"),
      L(2,0,2.86,0,3.45,colors.ink,.10),C(2,0,3.6,.22,colors.rose),
      L(2,-2.3,-1.2,-3.25,-1.85,colors.ink,.12),
      L(2,2.3,-1.2,3.25,-1.85,colors.ink,.12),
      S(3,-3.8,3.25,.26),S(3,3.55,3.5,.21)
    ]),
  make("build","quick-power-cell","Power Cell","Charge Me Up",
    "A tall battery and its terminal, plus a bright lightning emblem.",
    "Simple vertical/horizontal boundaries · one dashed top edge",[
      box("battery-case","The battery casing","#86b9a0",-1.85,-3.1,1.85,2.2),
      box("battery-tip","The positive terminal","#e6c17b",-.68,2.2,.68,2.9,["top"])
    ],[
      L(1,-.7,1.1,.5,-.45,colors.gold,.15),
      L(1,.5,-.45,-.3,-.3,colors.gold,.15),
      L(1,-.3,-.3,.5,-1.8,colors.gold,.15),
      R(1,-.7,-2.25,1.4,.18,colors.ink),
      R(2,-1.95,1.9,3.9,.22,colors.ink),
      C(2,2.6,1.4,.14,colors.berry),
      C(2,-2.7,1.5,.12,colors.leaf),
      S(3,-3.55,3.5,.28),S(3,3.6,3.25,.22),
      C(3,3.4,-1.9,.11,colors.berry)
    ]),
  make("build","quick-night-lantern","Night Lantern","Light the Way",
    "A bright lantern above its stand; explore a strict glass boundary.",
    "Above, below, left, right · mix solid and dashed boundaries",[
      box("lantern-base","The lantern stand","#ab8d9a",-2.15,-3.0,2.15,-1.55),
      box("lantern-glass","The glass lamp","#efd39a",-1.5,-1.55,1.5,2.35,["right"])
    ],[
      E(1,0,.4,.80,1.02,"#f5b879"),
      E(1,0,.47,.43,.67,"#fff4c8"),
      L(1,-1.5,-1.5,-1.5,2.3,colors.ink,.10),
      L(1,1.5,-1.5,1.5,2.3,colors.ink,.10),
      L(2,-1.15,2.35,0,3.5,colors.ink,.11),
      L(2,0,3.5,1.15,2.35,colors.ink,.11),
      R(2,-1.9,-2.72,3.8,.16,colors.ink),
      C(2,0,-2.22,.13,colors.light),
      S(3,-3.6,3.3,.25),S(3,3.6,3.5,.19),
      C(3,-3.15,.75,.11,colors.berry)
    ]),
  make("build","quick-music-player","Music Player","Press Play",
    "A simple music player with a bright screen and hand-drawn controls.",
    "Four straight inequalities on each piece · solid boundaries",[
      box("music-body","The player","#a599ce",-2.9,-3,2.9,3),
      box("music-screen","The display","#78b5ba",-2.1,-.1,2.1,2.2)
    ],[
      L(1,-.4,.4,1.25,1.1,colors.light,.18),
      L(1,1.25,1.1,-.4,1.75,colors.light,.18),
      L(1,-.4,1.75,-.4,.4,colors.light,.18),
      C(1,-1.3,-1.65,.27,colors.light),
      C(1,1.3,-1.65,.27,colors.light),
      R(2,-.5,-2.35,1.0,.16,colors.ink),
      L(2,-2.9,2.65,2.9,2.65,colors.ink,.09),
      C(2,3.5,.65,.13,colors.berry),
      S(3,-3.65,3.4,.28),S(3,3.7,-2.2,.22),
      C(3,-3.6,-2.65,.11,colors.blue)
    ])
]);
