// Three three-piece Plot & Shade Step Up artworks. Each region requires a
// single genuine new graph (a line, translated parabola or circle), and its
// two sample points pass the same exact construction check as the game.
import {q,parabola,vertical,circleRule} from "./curved-engine.mjs";
const part=(id,name,color,rules,plots)=>Object.freeze({
  id,name,color,rules:Object.freeze(rules),
  plots:Object.freeze(plots)
});
const T=(ruleId,kind,a,b,hints,guidance)=>Object.freeze({
  ruleId,kind,
  samplePoints:Object.freeze([a,b].map(([x,y])=>Object.freeze({x,y}))),
  hints:Object.freeze(hints),guidance
});
const D=(type,stage,data)=>Object.freeze({type,stage,...data});
const C=(stage,x,y,r,fill,stroke="#657783",width=.045)=>
  D("circle",stage,{x,y,r,fill,stroke,width});
const E=(stage,x,y,rx,ry,fill,stroke="#657783",width=.045)=>
  D("ellipse",stage,{x,y,rx,ry,fill,stroke,width});
const Q=(stage,x1,y1,cx,cy,x2,y2,stroke="#587e88",width=.075)=>
  D("curve",stage,{x1,y1,cx,cy,x2,y2,stroke,width});
const S=(stage,x,y,r,fill="#e5bd7c",stroke="#94735b")=>
  D("star",stage,{x,y,r,fill,stroke,width:.04});
function make(id,name,clue,description,focus,pieces,details){
  if(pieces.length!==3)throw Error("Plot Step Up requires three pieces");
  return Object.freeze({
    id,name,clue,description,focus,step:2,stage:"Step Up",
    mode:"plot",practice:true,stepUpVariety:true,
    pieces:Object.freeze(pieces),
    details:Object.freeze(details.map((d,i)=>Object.freeze({
      id:id+"-detail-"+(i+1),...d
    })))
  });
}
export const PLOT_STEP_UPS=Object.freeze([
  make("step-plot-lighthouse","Moonlit Lighthouse","Beacon of Hope",
    "Plot the lighthouse tower, round lantern and curved roof to illuminate the sea.",
    "Vertical plotting · centre and radius · a simple downward parabola",[
      part("lighthouse-tower","The stone tower","#9bb4c0",[
        vertical("lighthouse-left-wall","x ≥ −1",-1,"right"),
        vertical("lighthouse-right-wall","x ≤ 1",1,"left"),
        q("lighthouse-floor","y ≥ −3.5",[-3.5],"above"),
        q("lighthouse-top","y ≤ 1.8",[1.8],"below")
      ],[
        T("lighthouse-left-wall","line",[-1,-3],[-1,1],[
          "A vertical boundary fixes x, not y.",
          "Both (−1, −3) and (−1, 1) have x = −1."
        ],"Place two different points on the vertical edge x = −1.")
      ]),
      part("lighthouse-lantern","The glowing lantern","#f1d08a",[
        circleRule("lighthouse-lamp","x² + (y − 2)² ≤ 1",0,2,1),
        q("lighthouse-lamp-base","y ≥ 1.75",[1.75],"above")
      ],[
        T("lighthouse-lamp","circle",[0,2],[1,2],[
          "A circle is defined by its centre and a point on its edge.",
          "Here the centre is (0, 2) and the radius is 1."
        ],"Plot the centre at (0, 2), then a point one unit away.")
      ]),
      part("lighthouse-roof","The curved red roof","#df989d",[
        parabola("lighthouse-roof-arc","y ≤ 4 − 0.5x²",
          -.5,0,4,"below"),
        q("lighthouse-roof-base","y ≥ 3",[3],"above")
      ],[
        T("lighthouse-roof-arc","parabola",[0,4],[2,2],[
          "The roof reaches its highest point at the vertex (0, 4).",
          "When x = 2, y = 4 − 0.5 × 4 = 2."
        ],"Place the turning point and a second point on the downward curve.")
      ])
    ],[
      Q(1,-1.02,-1.2,-.2,-1.03,.96,-1.2,"#718fa1",.08),
      Q(1,-1.02,.05,-.2,.22,.96,.05,"#718fa1",.08),
      E(1,0,2.1,.42,.38,"#ffedb4"),
      E(1,-.32,2.3,.12,.2,"#fff8de"),
      Q(1,-2.9,2.15,-1.75,2.25,-1.04,2.1,"#e8bd8b",.12),
      Q(2,1.04,2.1,1.75,2.25,2.9,2.15,"#e8bd8b",.12),
      Q(2,-.95,-3.6,0,-3.78,.95,-3.6,"#607d8b",.10),
      Q(2,-4,-3.8,-2.8,-3.55,-1.55,-3.8,"#5196a6",.13),
      Q(2,1.65,-3.8,2.8,-3.55,4,-3.8,"#5196a6",.13),
      C(2,0,-2.35,.18,"#e3c390"),
      S(3,-3.8,3.5,.20),
      S(3,3.7,3.85,.25),
      C(3,-3.5,-1.6,.1,"#9db8cc")
    ]),
  make("step-plot-geometric-cat","Geometric Cat","Paws and Whiskers",
    "A curved cat face meets two pointed ears, with a lively final expression.",
    "Draw a circle from centre/radius · plot positive and negative gradients",[
      part("cat-head","The cat face","#e9bb92",[
        circleRule("cat-head-circle","x² + (y + 0.5)² ≤ 2²",0,-.5,2),
        q("cat-head-base","y ≥ −2.4",[-2.4],"above")
      ],[
        T("cat-head-circle","circle",[0,-.5],[2,-.5],[
          "The circle is centred at (0, −0.5).",
          "The radius is 2, so (2, −0.5) is on the boundary."
        ],"Plot the centre then a point two units away.")
      ]),
      part("cat-left-ear","The left triangular ear","#d5968b",[
        q("cat-ear-left-ground","y ≥ 1",[1],"above"),
        q("cat-ear-left-up","y ≤ 2x + 6.5",[6.5,2],"below"),
        q("cat-ear-left-down","y ≤ −2x + 0.5",[.5,-2],"below")
      ],[
        T("cat-ear-left-up","line",[-2.5,1.5],[-1.5,3.5],[
          "For y = 2x + 6.5, the gradient is 2.",
          "Both (−2.5, 1.5) and (−1.5, 3.5) lie on the edge."
        ],"Plot two points on the rising edge of the left ear.")
      ]),
      part("cat-right-ear","The right triangular ear","#d5968b",[
        q("cat-ear-right-ground","y ≥ 1",[1],"above"),
        q("cat-ear-right-up","y ≤ 2x + 0.5",[.5,2],"below"),
        q("cat-ear-right-down","y < −2x + 6.5",[6.5,-2],"below",false)
      ],[
        T("cat-ear-right-down","line",[1.5,3.5],[2.5,1.5],[
          "This boundary falls with gradient −2.",
          "The < sign means the boundary line must be dashed."
        ],"Place two points on the falling right-hand edge.")
      ])
    ],[
      E(1,-.75,.05,.34,.47,"#f6ddbd"),
      E(1,.75,.05,.34,.47,"#f6ddbd"),
      C(1,-.72,.16,.13,"#43576a"),
      C(1,.72,.16,.13,"#43576a"),
      E(1,0,-.72,.24,.15,"#b97581"),
      Q(1,-.1,-.9,0,-1.13,.26,-1.20,"#7b6875",.055),
      Q(2,-.05,-.92,-.2,-1.14,-.48,-1.2,"#7b6875",.055),
      Q(2,-.85,-.87,-2.2,-.55,-3.0,-.9,"#746979",.065),
      Q(2,.85,-.87,2.2,-.55,3.0,-.9,"#746979",.065),
      Q(2,-.85,-1.13,-2.3,-1.25,-3.0,-1.65,"#746979",.065),
      Q(2,.85,-1.13,2.3,-1.25,3.0,-1.65,"#746979",.065),
      E(2,-1.55,2.3,.22,.4,"#f9d5c0"),
      E(2,1.55,2.3,.22,.4,"#f9d5c0"),
      S(3,-3.7,3.8,.23),
      S(3,3.7,-2.7,.19),
      C(3,-3.6,-2.7,.10,"#aa8b9e")
    ]),
  make("step-plot-garden-daisy","Garden Daisy","A Flower for You",
    "Construct a slim stem, a curved petal crown and a circular flower centre.",
    "Vertical line · simple parabola · centre and radius of a circle",[
      part("daisy-stem","The jade stem","#7fae96",[
        vertical("daisy-stem-left","x ≥ −0.5",-.5,"right"),
        vertical("daisy-stem-right","x ≤ 0.5",.5,"left"),
        q("daisy-stem-floor","y ≥ −3.5",[-3.5],"above"),
        q("daisy-stem-top","y ≤ 1.5",[1.5],"below")
      ],[
        T("daisy-stem-right","line",[.5,-3],[.5,1],[
          "A vertical line has equal x-coordinates at every point.",
          "You can use (0.5, −3) and (0.5, 1)."
        ],"Construct the right-hand edge of the stem at x = 0.5.")
      ]),
      part("daisy-petals","The sunny petals","#ead4a2",[
        parabola("daisy-petals-top","y ≤ 4 − 0.5x²",
          -.5,0,4,"below"),
        q("daisy-petals-base","y ≥ 1.5",[1.5],"above")
      ],[
        T("daisy-petals-top","parabola",[0,4],[2,2],[
          "The vertex is the maximum point (0, 4).",
          "At x = 2, the curve has y = 4 − 2 = 2."
        ],"Place the vertex, then plot another point on the arch.")
      ]),
      part("daisy-centre","The honey-gold centre","#e6b878",[
        circleRule("daisy-centre-disc","(x − 0)² + (y − 2.2)² ≤ 1",
          0,2.2,1),
        q("daisy-centre-floor","y ≥ 1.75",[1.75],"above")
      ],[
        T("daisy-centre-disc","circle",[0,2.2],[1,2.2],[
          "The circle centre is at (0, 2.2), with radius 1.",
          "The centre and any point one unit away determine the circle."
        ],"Place the centre first, then an edge point one unit away.")
      ])
    ],[
      C(1,-.25,2.45,.12,"#81655a"),
      C(1,.25,2.45,.12,"#81655a"),
      Q(1,-.25,2.04,0,1.86,.25,2.04,"#947365",.07),
      E(1,-1.45,2.65,.40,.26,"#f9e7c6"),
      E(1,1.50,2.65,.40,.26,"#f9e7c6"),
      E(1,-.95,3.35,.24,.33,"#fff0d3"),
      E(1,1.0,3.35,.24,.33,"#fff0d3"),
      Q(2,-.5,-.95,-2.15,-.8,-2.2,-1.85,"#498a75",.17),
      Q(2,.5,-1.55,2.15,-1.4,2.3,-2.1,"#498a75",.17),
      E(2,-1.65,-1.55,.53,.22,"#a9d1b6"),
      E(2,1.65,-1.75,.55,.20,"#a9d1b6"),
      S(3,-3.65,3.8,.23),
      S(3,3.8,3.45,.20),
      C(3,-3.6,-2.45,.13,"#96bca9")
    ])
]);
