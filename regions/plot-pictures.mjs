// Five ORIGINAL Plot & Shade pictures. Each coloured area is the exact
// intersection of the displayed inequalities: no painted mask or fake art.
import {q,parabola,vertical,absolute,circleRule,regionPaths,satisfiesAll} from "./curved-engine.mjs";
import {checkConstruction} from "./plot-engine.mjs";
const rule=(id,text,coeffs,side,inclusive=true)=>q(id,text,coeffs,side,inclusive);
const line=rule;
const V=(id,text,x,side,inclusive=true)=>vertical(id,text,x,side,inclusive);
const P=(id,text,a,h,k,side,inclusive=true)=>parabola(id,text,a,h,k,side,inclusive);
const A=(id,text,h,k,a,side,inclusive=true)=>absolute(id,text,h,k,a,side,inclusive);
const O=(id,text,cx,cy,r,side="inside",inclusive=true)=>
  circleRule(id,text,cx,cy,r,side,inclusive);
const task=(ruleId,kind,samplePoints,hints,guidance="Plot the graph using two mathematically correct points.")=>
  Object.freeze({ruleId,kind,
    samplePoints:Object.freeze(samplePoints.map(p=>Object.freeze({x:p[0],y:p[1]}))),
    hints:Object.freeze(hints),guidance});
const T=(ruleId,kind,a,b,hints,guidance)=>
  task(ruleId,kind,a?[a,b]:[],hints||[],guidance);
const piece=(id,name,color,rules,plots)=>Object.freeze({
  id,name,color,rules:Object.freeze(rules),
  plots:Object.freeze(plots)
});
const decoration=(id,stage,type,values)=>Object.freeze({id,stage,type,...values});
const Q=(id,stage,x1,y1,cx,cy,x2,y2,stroke,width=.065)=>
  decoration(id,stage,"curve",{x1,y1,cx,cy,x2,y2,stroke,width});
const C=(id,stage,x,y,r,fill,stroke="#795d75",width=.045)=>
  decoration(id,stage,"circle",{x,y,r,fill,stroke,width});
const E=(id,stage,x,y,rx,ry,fill,stroke="#795d75",width=.045)=>
  decoration(id,stage,"ellipse",{x,y,rx,ry,fill,stroke,width});
const S=(id,stage,x,y,r,fill="#e6b56b",stroke="#926b54",width=.04)=>
  decoration(id,stage,"star",{x,y,r,fill,stroke,width});
const picture=(step,id,name,clue,focus,description,pieces,details)=>Object.freeze({
  step,id,name,clue,focus,description,stage:PLOT_STAGES[step-1].name,
  pieces:Object.freeze(pieces),details:Object.freeze(details),mode:"plot"
});
export const PLOT_STAGES=Object.freeze([
  {name:"Starter",summary:"One graph per region; the other boundary is supplied"},
  {name:"Step Up",summary:"Sloping lines and circles"},
  {name:"Building",summary:"Two parabolas for one region; reusable boundaries"},
  {name:"Challenge",summary:"Absolute-value graphs, circles and multi-curve regions"},
  {name:"Big Finish",summary:"Seven rocket pieces with mixed and repeated boundaries"}
].map(s=>Object.freeze(s)));

// Original Phase 3 prototype: same IDs, equations, sample solutions and
// decorations as v1 to preserve old progress.
const umbrella=picture(1,"little-umbrella","Little Umbrella",
  "A little shelter from the rain","Parabola · straight line · boundary styles",
  "Plot the canopy and puddle, then discover the handle and raindrops.",[
  piece("canopy","Coral canopy","#e9a2a0",[
    rule("canopy-arch","y ≤ 4 − 0.5x²",[4,0,-.5],"below"),
    rule("canopy-rim","y ≥ 1",[1],"above")
  ],[T("canopy-arch","parabola",[0,4],[2,2],[
    "The parabola reaches its maximum at (0, 4). Place that as your first point.",
    "A point on this parabola is (2, 2), but any other correct point also works."
  ],"Place the turning point, then any second point on the parabola.")]),
  piece("puddle","Blue puddle","#83c6cd",[
    rule("puddle-bottom","y ≥ −4 + 0.25x²",[-4,0,.25],"above"),
    rule("puddle-top","y < −3",[-3],"below",false)
  ],[T("puddle-top","line",[-2,-3],[2,-3],[
    "The graph of y = −3 is a horizontal line.",
    "Both (−2, −3) and (2, −3) lie on this boundary."
  ],"Place any two different points on the straight boundary.")])
],[
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
]);

const ice=picture(2,"ice-cream-dream","Ice Cream Dream",
  "A sweet scoop of maths","Sloping lines · centre and radius · circles",
  "Three small regions form a waffle cone with two pastel scoops.",[
  piece("ice-cone","Waffle cone","#d9a87c",[
    line("ice-left-edge","y ≥ −2x − 3.5",[-3.5,-2],"above"),
    line("ice-right-edge","y ≥ 2x − 3.5",[-3.5,2],"above"),
    line("ice-rim","y ≤ 0.5",[.5],"below")
  ],[T("ice-right-edge","line",[0,-3.5],[1,-1.5],[
    "A line is fixed by any two points on it.",
    "Try the points (0, −3.5) and (1, −1.5)."
  ],"Find two points on the rising edge of the cone.")]),
  piece("ice-strawberry","Strawberry scoop","#ed9fb7",[
    O("ice-left-scoop","(x + 0.5)² + (y − 1.5)² ≤ 1",- .5,1.5,1),
    V("ice-left-half","x ≤ 0",0,"left")
  ],[T("ice-left-scoop","circle",[-.5,1.5],[-1.5,1.5],[
    "For (x − h)² + (y − k)² = r², place the centre at (h, k).",
    "The centre is (−0.5, 1.5), and the radius is 1."
  ],"Place the centre first, then any point on the circle.")]),
  piece("ice-mint","Mint scoop","#86c7b4",[
    O("ice-right-scoop","(x − 0.5)² + (y − 1.5)² < 1",.5,1.5,1,"inside",false),
    V("ice-right-half","x ≥ 0",0,"right")
  ],[T("ice-right-scoop","circle",[.5,1.5],[1.5,1.5],[
    "The inequality is strict, but first draw the underlying circle.",
    "Use centre (0.5, 1.5) and radius 1."
  ],"Construct the other scoop's circular boundary.")])
],[
  Q("waffle-line-1",1,-1.35,-.65,-.5,-1.2,.65,-2.7,"#9d735c",.055),
  Q("waffle-line-2",1,1.35,-.65,.5,-1.2,-.65,-2.7,"#9d735c",.055),
  Q("waffle-line-3",1,-1.1,-.65,-.4,-1.8,.4,-2.8,"#9d735c",.045),
  C("scoop-dot-left",1,-.93,1.78,.11,"#ffe9d8","#c98195"),
  C("scoop-dot-right",1,.9,1.7,.11,"#def3dc","#618e83"),
  C("scoop-sprinkle-one",1,-.6,1.2,.08,"#ffe1bb","#b26d8e"),
  C("scoop-sprinkle-two",1,.5,1.3,.08,"#f3e7ad","#729c8f"),
  Q("cone-outline-left",2,-2,.5,-1,-1.45,0,-3.47,"#946855",.085),
  Q("cone-outline-right",2,2,.5,1,-1.45,0,-3.47,"#946855",.085),
  C("cherry",2,0,2.6,.25,"#c95e75","#8f4c6c"),
  Q("cherry-stem",2,0,2.82,.1,3.2,.35,3.26,"#56836d",.07),
  S("ice-spark-left",3,-3.25,2.2,.25),
  S("ice-spark-right",3,3.15,2.35,.25),
  S("ice-spark-top",3,-1.9,3.75,.19),
  C("ice-confetti-a",3,2.65,-.8,.08,"#d8869f"),
  C("ice-confetti-b",3,-2.65,-.8,.08,"#6cafa6")
]);

const arches=[.25,.375,.5,.625,.75];
const rainbowColors=["#79b9aa","#f1c27a","#e9a1b1","#aa9acb"];
const rainbowPieces=Array.from({length:4},(_,i)=>{
  const lower=arches[i],upper=arches[i+1];
  const l=rule("gate-lower-"+i,
    "y ≥ "+(lower*4)+" − "+lower+"x²",
    [4*lower,0,-lower],"above",i!==2);
  const u=rule("gate-upper-"+i,
    "y "+(i===1?"<":"≤")+" "+(upper*4)+" − "+upper+"x²",
    [4*upper,0,-upper],"below",i!==1);
  // First band asks for both curves; subsequent pieces build on the previously
  // plotted upper curve and introduce one new upper boundary.
  const all=i===0?[l,u]:[u];
  return piece("gate-arc-"+(i+1),
    ["Teal arch","Golden arch","Coral arch","Lavender arch"][i],
    rainbowColors[i],[l,u],all.map((r,j)=>T(r.id,"parabola",
      [0,4*(i===0&&j===0?lower:upper)],[2,0],[
        "The turning point is the vertex on the y-axis.",
        "All these parabolas cross the x-axis at (2, 0) and (−2, 0)."
      ],"Plot the translated/parabolic arc using its vertex and another point.")));
});
const rainbow=picture(3,"rainbow-gate","Rainbow Gate",
  "A colourful curve to cross","Two curves to plot · bands between parabolas",
  "Build four nested arch bands, reusing a boundary from the previous piece.",rainbowPieces,[
  E("rain-cloud-left",1,-2.35,-.25,.58,.20,"#d2e7ea","#76909a"),
  E("rain-cloud-right",1,2.35,-.25,.58,.20,"#d2e7ea","#76909a"),
  C("rain-puff-left",1,-2.05,-.12,.27,"#d2e7ea","#76909a"),
  C("rain-puff-right",1,2.05,-.12,.27,"#d2e7ea","#76909a"),
  Q("rain-pillar-left",2,-2.22,-.12,-2.3,-.8,-2.3,-1.9,"#607e92",.13),
  Q("rain-pillar-right",2,2.22,-.12,2.3,-.8,2.3,-1.9,"#607e92",.13),
  E("rain-stone-left",2,-2.30,-2.0,.48,.20,"#b5c4bc","#647a83"),
  E("rain-stone-right",2,2.30,-2.0,.48,.20,"#b5c4bc","#647a83"),
  C("rain-shine-l",2,-.72,1.6,.09,"#fff0ce","#98728b"),
  C("rain-shine-r",2,.72,1.6,.09,"#fff0ce","#98728b"),
  S("rain-star-left",3,-3.6,2.6,.26),
  S("rain-star-right",3,3.6,2.6,.26),
  S("rain-star-top",3,0,4.2,.25),
  C("rain-dust-l",3,-3.15,1.2,.08,"#987897"),
  C("rain-dust-r",3,3.15,1.2,.08,"#987897")
]);

const lantern=picture(4,"moonlight-lantern","Moonlight Lantern",
  "Light made from V-shaped graphs","Absolute-value graphs · circles · parabolas",
  "Construct a glowing diamond, glass sides, arched roof and hanging tassel.",[
  piece("lantern-glow","Amber glow","#f3cc83",[
    A("lantern-lower-V","y ≥ −1 + |x|",0,-1,1,"above"),
    A("lantern-upper-V","y ≤ 3 − |x|",0,3,-1,"below")
  ],[
    T("lantern-lower-V","absolute",[0,-1],[1,0],[
      "Plot the point of the V before placing a second point.",
      "The bottom vertex is (0, −1)."
    ],"Place the lower V's vertex and another point on one arm."),
    T("lantern-upper-V","absolute",[0,3],[1,2],[
      "A negative coefficient reflects the V upside down.",
      "The top vertex is (0, 3); one other point is (1, 2)."
    ],"Plot the inverted V without altering the lower boundary.")
  ]),
  piece("lantern-left-glass","Left glass","#96c5cf",[
    O("lantern-left-disk","(x + 2.5)² + (y − 1)² ≤ 1",-2.5,1,1),
    V("lantern-left-limit","x ≤ −1.5",-1.5,"left")
  ],[T("lantern-left-disk","circle",[-2.5,1],[-1.5,1],[
    "A circle is defined by its centre and radius.",
    "Place the centre (−2.5, 1) and a point one unit away."
  ])]),
  piece("lantern-right-glass","Right glass","#8eb6d8",[
    O("lantern-right-disk","(x − 2.5)² + (y − 1)² < 1",2.5,1,1,"inside",false),
    V("lantern-right-limit","x ≥ 1.5",1.5,"right")
  ],[T("lantern-right-disk","circle",[2.5,1],[3.5,1],[
    "Locate the right-hand centre correctly.",
    "The centre is (2.5, 1) and radius is 1."
  ])]),
  piece("lantern-roof","Bronze roof","#dca885",[
    P("lantern-cap-arc","y ≤ 4 − 0.5x²",-.5,0,4,"below"),
    rule("lantern-cap-line","y ≥ 3",[3],"above")
  ],[
    T("lantern-cap-arc","parabola",[0,4],[2,2],[
      "The roof is a downward-opening parabola.",
      "Its vertex is (0, 4), and (2, 2) is on it."
    ]),
    T("lantern-cap-line","line",[-2,3],[2,3],[
      "This boundary has gradient zero.",
      "Use any two points with y = 3."
    ])
  ]),
  piece("lantern-tassel","Teal tassel","#86bcb4",[
    A("lantern-tassel-V","y ≥ −3 + |x|",0,-3,1,"above"),
    rule("lantern-tassel-top","y ≤ −1.5",[-1.5],"below"),
    V("lantern-tassel-left","x ≥ −1.5",-1.5,"right"),
    V("lantern-tassel-right","x ≤ 1.5",1.5,"left")
  ],[T("lantern-tassel-V","absolute",[0,-3],[1,-2],[
    "The V opens upwards.",
    "Its turning point is (0, −3) and (1, −2) lies on one arm."
  ])])
],[
  E("lantern-centre-ring",1,0,1,.65,.65,"#fff0c6","#a87a65"),
  C("lantern-centre-dot",1,0,1,.26,"#d38869","#986a63"),
  C("lantern-left-shine",1,-2.8,1.3,.13,"#e7f6ed","#668e9e"),
  C("lantern-right-shine",1,2.8,1.3,.13,"#e7f6ed","#668e9e"),
  Q("lantern-top-handle",2,-.52,4.14,0,4.75,.52,4.14,"#705d6f",.12),
  Q("lantern-bottom-chain",2,0,-2.98,.1,-3.62,0,-4.32,"#497b81",.085),
  E("lantern-bead",2,0,-4.25,.16,.21,"#e8ba83","#916b6c"),
  Q("lantern-side-line-left",2,-2,1,-2.2,0,-1.6,-.7,"#6c8797",.06),
  Q("lantern-side-line-right",2,2,1,2.2,0,1.6,-.7,"#6c8797",.06),
  S("lantern-star-left",3,-4.1,3.25,.25),
  S("lantern-star-right",3,4.12,3.1,.24),
  S("lantern-star-low",3,3.45,-2.65,.19),
  C("lantern-glint-l",3,-3.65,-1.1,.08,"#987a99"),
  C("lantern-glint-r",3,3.65,-1.1,.08,"#987a99")
]);

const rocket=picture(5,"rocket-launch","Rocket Launch",
  "A rocket built from plotted graphs","Mixed curves · two plotted boundaries · seven pieces",
  "Plot ten boundaries to build a rocket with fins, flames and a nose cone.",[
  piece("rocket-nose","Rose nose cone","#e9a2ad",[
    A("rocket-nose-v","y ≤ 4 − 2|x|",0,4,-2,"below"),
    rule("rocket-nose-floor","y ≥ 2",[2],"above")
  ],[
    T("rocket-nose-v","absolute",[0,4],[1,2],[
      "The pointed rocket tip comes from a downwards V.",
      "Use the vertex (0, 4), then another point (1, 2)."
    ]),
    T("rocket-nose-floor","line",[-1,2],[1,2],[
      "The base of the nose is horizontal.",
      "Use any two points with y = 2."
    ])
  ]),
  piece("rocket-body-left","Left fuselage","#91c1ce",[
    P("rocket-body-left-top","y ≤ 2 − 0.25x²",-.25,0,2,"below"),
    P("rocket-body-left-bottom","y ≥ −2 + 0.25x²",.25,0,-2,"above"),
    V("rocket-body-left-mid","x ≤ 0",0,"left"),
    V("rocket-body-left-edge","x ≥ −1",-1,"right")
  ],[
    T("rocket-body-left-top","parabola",[0,2],[2,1],[
      "Start at the turning point (0, 2).",
      "The parabola also passes through (2, 1)."
    ]),
    T("rocket-body-left-bottom","parabola",[0,-2],[2,-1],[
      "This time the parabola opens upwards.",
      "Its vertex is (0, −2), and (2, −1) is on the curve."
    ])
  ]),
  piece("rocket-body-right","Right fuselage","#76aaa9",[
    P("rocket-body-right-top","y ≤ 2 − 0.25x²",-.25,0,2,"below"),
    P("rocket-body-right-bottom","y ≥ −2 + 0.25x²",.25,0,-2,"above"),
    V("rocket-body-right-mid","x ≥ 0",0,"right",false),
    V("rocket-body-right-edge","x ≤ 1",1,"left")
  ],[
    T("rocket-body-right-mid","line",[0,-2],[0,2],[
      "A vertical line has all x-coordinates equal.",
      "Use any two different points with x = 0."
    ])
  ]),
  piece("rocket-fin-left","Left stabiliser","#a99bcc",[
    rule("rocket-fin-left-diagonal","y ≤ x + 1",[1,1],"below"),
    rule("rocket-fin-left-bottom","y ≥ −2.5",[-2.5],"above"),
    V("rocket-fin-left-limit","x ≥ −3",-3,"right"),
    V("rocket-fin-left-join","x ≤ −1",-1,"left")
  ],[T("rocket-fin-left-diagonal","line",[-2,-1],[-1,0],[
    "The fin edge has gradient +1.",
    "Check that (−2, −1) and (−1, 0) lie on the line."
  ])]),
  piece("rocket-fin-right","Right stabiliser","#baa0cf",[
    rule("rocket-fin-right-diagonal","y ≤ −x + 1",[1,-1],"below"),
    rule("rocket-fin-right-bottom","y ≥ −2.5",[-2.5],"above"),
    V("rocket-fin-right-limit","x ≤ 3",3,"left"),
    V("rocket-fin-right-join","x ≥ 1",1,"right")
  ],[T("rocket-fin-right-diagonal","line",[1,0],[2,-1],[
    "The right fin edge has gradient −1.",
    "Check that (1, 0) and (2, −1) lie on the line."
  ])]),
  piece("rocket-flame-left","Left flame","#f5c573",[
    P("rocket-flame-left-arc","y ≥ −4 + 0.5(x + 0.5)²",.5,-.5,-4,"above"),
    rule("rocket-flame-left-top","y < −2.5",[-2.5],"below",false),
    V("rocket-flame-left-half","x ≤ 0",0,"left"),
    V("rocket-flame-left-edge","x ≥ −1",-1,"right")
  ],[
    T("rocket-flame-left-arc","parabola",[-.5,-4],[1.5,-2],[
      "This parabola is translated half a unit to the left.",
      "Use its vertex (−0.5, −4) and a second point (1.5, −2)."
    ]),
    T("rocket-flame-left-top","line",[-1,-2.5],[1,-2.5],[
      "This inequality has no equality sign.",
      "Sketch the horizontal line y = −2.5 before choosing dashed."
    ])
  ]),
  piece("rocket-flame-right","Right flame","#e9a06e",[
    P("rocket-flame-right-arc","y ≥ −4 + 0.5(x − 0.5)²",.5,.5,-4,"above"),
    rule("rocket-flame-right-top","y < −2.5",[-2.5],"below",false),
    V("rocket-flame-right-half","x ≥ 0",0,"right",false),
    V("rocket-flame-right-edge","x ≤ 1",1,"left")
  ],[
    T("rocket-flame-right-arc","parabola",[.5,-4],[-1.5,-2],[
      "The second flame parabola is reflected across the y-axis.",
      "Use vertex (0.5, −4) and a point (−1.5, −2)."
    ])
  ])
],[
  C("rocket-window",1,0,.9,.51,"#f5dfbc","#54788a",.09),
  C("rocket-window-inner",1,0,.9,.31,"#82cdd3","#42788b"),
  C("rocket-window-shine",1,-.11,1.08,.1,"#eef7e6","#4c8d95"),
  C("rocket-rivet-a",1,-.75,-.9,.075,"#f1e7cd","#5f8691"),
  C("rocket-rivet-b",1,.75,-.9,.075,"#f1e7cd","#5f8691"),
  Q("rocket-body-stripe",2,-.93,-1.55,0,-1.35,.93,-1.55,"#547b89",.12),
  Q("rocket-fin-stripe-l",2,-2.5,-1.98,-2.05,-1.3,-1.16,-.8,"#7c6a9c",.08),
  Q("rocket-fin-stripe-r",2,2.5,-1.98,2.05,-1.3,1.16,-.8,"#876c9d",.08),
  C("rocket-flame-glow-l",2,-.46,-3.25,.15,"#fff0bf","#ba8263"),
  C("rocket-flame-glow-r",2,.46,-3.25,.15,"#fff0bf","#ba8263"),
  S("rocket-star-left",3,-4.1,3.65,.28),
  S("rocket-star-right",3,4.1,3.42,.26),
  S("rocket-star-low-left",3,-3.8,-3.6,.17),
  S("rocket-star-low-right",3,3.8,-3.5,.18),
  C("rocket-stardust-a",3,-3.45,1.6,.09,"#967ba1"),
  C("rocket-stardust-b",3,3.55,1.55,.08,"#967ba1"),
  C("rocket-stardust-c",3,3.3,-.8,.08,"#a87d91"),
  C("rocket-stardust-d",3,-3.2,-.8,.08,"#a87d91")
]);


/* Phase 6: a separate, equivalent Step Up task with three constructed pieces.
   The globe, stand and snowman are all exact shaded inequalities. */
const snowGlobe=Object.freeze({...picture(2,"snow-globe","Snow Globe",
  "Winter Wonderland","Circles · a horizontal line · centre and radius",
  "Sketch two different circles and a horizontal line to build a snow globe.",[
  piece("globe-glass","The glass globe","#a6d7df",[
    O("globe-outer-circle","x² + (y − 1.5)² ≤ 4",0,1.5,2),
    rule("globe-bottom-edge","y ≥ −0.5",[-.5],"above")
  ],[
    T("globe-outer-circle","circle",[0,1.5],[2,1.5],[
      "A circle is fixed by its centre and radius.",
      "Use centre (0, 1.5) and a point two units away."
    ],"Place the centre then any point two units from it.")
  ]),
  piece("globe-stand","The wooden base","#d6ad87",[
    rule("globe-stand-floor","y ≥ −2.5",[-2.5],"above"),
    rule("globe-stand-top","y ≤ −1.25",[-1.25],"below"),
    V("globe-stand-left","x ≥ −1.75",-1.75,"right"),
    V("globe-stand-right","x ≤ 1.75",1.75,"left")
  ],[
    T("globe-stand-floor","line",[-2,-2.5],[2,-2.5],[
      "Every point on this line has y = −2.5.",
      "Try (−2, −2.5) and (2, −2.5)."
    ],"Draw the horizontal bottom edge of the globe stand.")
  ]),
  piece("globe-snowman","Snowman's body","#eaf1df",[
    O("globe-snowman-circle","x² + (y − 0.5)² < 1",0,.5,1,"inside",false)
  ],[
    T("globe-snowman-circle","circle",[0,.5],[1,.5],[
      "A strict circle inequality still has a circular boundary.",
      "The centre is (0, 0.5) and the radius is 1."
    ],"Find the centre and a point one unit from it.")
  ])
],[
  C("snow-head",1,0,1.75,.49,"#faf5e8","#688b91",.045),
  C("snow-eye-left",1,-.16,1.84,.055,"#4b6570","#4b6570"),
  C("snow-eye-right",1,.16,1.84,.055,"#4b6570","#4b6570"),
  C("snow-button-one",1,0,.75,.075,"#5c7b82","#5c7b82"),
  C("snow-button-two",1,0,.35,.075,"#5c7b82","#5c7b82"),
  Q("snow-scarf",2,-.45,1.39,0,1.16,.45,1.42,"#bd6f79",.12),
  Q("snow-arm-left",2,-.75,.7,-1.45,.95,-1.56,1.27,"#796e6d",.09),
  Q("snow-arm-right",2,.75,.7,1.45,.95,1.56,1.27,"#796e6d",.09),
  Q("base-engraving",2,-1.4,-1.85,0,-2.1,1.4,-1.85,"#8d755f",.07),
  S("snowflake-left",3,-3,2.85,.25),
  S("snowflake-right",3,3.1,3.25,.25),
  S("snowflake-top",3,-1.15,4.05,.19),
  C("snow-sparkle-left",3,-2.8,-2.2,.08,"#92aab4"),
  C("snow-sparkle-right",3,2.8,-2.15,.08,"#a890ae")
]),practice:true});

export const PLOT_PICTURES=Object.freeze([umbrella,ice,rainbow,lantern,rocket]);
export const PLOT_PICTURE=umbrella;
export const PLOT_PRACTICE_PICTURES=Object.freeze([snowGlobe]);
export const plotAllPictures=Object.freeze([...PLOT_PICTURES,...PLOT_PRACTICE_PICTURES]);
export const plotPicture=id=>plotAllPictures.find(p=>p.id===id)||null;
export const plotSteps=part=>part.plots||(part.plot?[part.plot]:[]);
export const plotRule=(part,index=0)=>part.rules.find(r=>r.id===plotSteps(part)[index]?.ruleId)||null;
export function ruleSignature(rule){
  if(!rule)return null;
  if(rule.kind==="function")return "f:"+rule.coeffs.join(",");
  if(rule.kind==="vertical")return "v:"+rule.x;
  if(rule.kind==="absolute")return "a:"+[rule.h,rule.k,rule.a].join(",");
  if(rule.kind==="circle")return "c:"+[rule.cx,rule.cy,rule.r].join(",");
  return null;
}
export function previousBoundaries(p,done){
  const signatures=new Set();
  for(const piece of p.pieces.slice(0,done))
    for(const step of plotSteps(piece))signatures.add(ruleSignature(plotRule(piece,plotSteps(piece).indexOf(step))));
  return signatures;
}
export function validatePlotPicture(p=PLOT_PICTURE){
  if(!Array.isArray(p.pieces)||p.pieces.length<2||p.details.length<10)throw Error("Invalid plot picture");
  const ids=new Set(),ruleIds=new Set();
  for(const part of p.pieces){
    if(ids.has(part.id))throw Error("Duplicate picture piece "+part.id);
    ids.add(part.id);
    const targets=plotSteps(part);
    if(!targets.length||!regionPaths(part.rules).length)
      throw Error("Piece lacks a plot task or region: "+part.id);
    const tIds=new Set();
    for(const step of targets){
      const target=part.rules.find(r=>r.id===step.ruleId);
      if(!target||tIds.has(step.ruleId)||!["line","parabola","circle","absolute"].includes(step.kind))
        throw Error("Invalid plot target "+step.ruleId);
      tIds.add(step.ruleId);
      if(!checkConstruction({kind:step.kind,rule:target},step.samplePoints).correct)
        throw Error("Example construction wrong: "+step.ruleId);
    }
    for(const r of part.rules){
      if(ruleIds.has(r.id))throw Error("Duplicate rule ID "+r.id);
      ruleIds.add(r.id);
    }
    let found=false;
    for(let x=-4.5;x<=4.5&&!found;x+=.25)
      for(let y=-4.5;y<=4.5;y+=.25)
        if(satisfiesAll(part.rules,x,y)){found=true;break;}
    if(!found)throw Error("No tappable region "+part.id);
  }
  if(new Set(p.details.map(d=>d.id)).size!==p.details.length||
     ![1,2,3].every(stage=>p.details.some(d=>d.stage===stage)))
    throw Error("Missing or duplicate decoration stages "+p.id);
  return true;
}
export function validatePlotGallery(){
  if(PLOT_PICTURES.length!==5)throw Error("Five Plot & Shade pictures required");
  const ids=new Set(),sizes=[2,3,4,5,7];
  PLOT_PICTURES.forEach((p,i)=>{
    if(ids.has(p.id)||p.stage!==PLOT_STAGES[i].name||
      p.step!==i+1||p.pieces.length!==sizes[i]||!p.focus||!p.description)
      throw Error("Incorrect Plot & Shade progression");
    ids.add(p.id);validatePlotPicture(p);
  });
  if(PLOT_PRACTICE_PICTURES.length!==1||snowGlobe.pieces.length!==3||
    !snowGlobe.practice||snowGlobe.step!==2||ids.has(snowGlobe.id))
    throw Error("Plot practice must be a separate three-piece Step Up picture");
  validatePlotPicture(snowGlobe);
  if(PLOT_PICTURES[0].id!=="little-umbrella"||
     plotRule(PLOT_PICTURES[0].pieces[0]).text!=="y ≤ 4 − 0.5x²")
    throw Error("Prototype umbrella must be preserved");
  return true;
}
