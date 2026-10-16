// Four distinct Quick Spark Plot & Shade artworks. Every picture uses two
// genuine inequality regions, with precisely ONE missing graph per piece.
// Graphs use introductory straight lines and central parabolas; circles
// and absolute-value constructions remain in later difficulty tiers.
import {q,parabola,vertical} from "./curved-engine.mjs";
const part=(id,name,color,rules,plots)=>Object.freeze({
  id,name,color,rules:Object.freeze(rules),plots:Object.freeze(plots)
});
const plot=(ruleId,kind,a,b,hints,guidance)=>Object.freeze({
  ruleId,kind,
  samplePoints:Object.freeze([a,b].map(([x,y])=>Object.freeze({x,y}))),
  hints:Object.freeze(hints),guidance
});
const decorate=(type,id,stage,attrs)=>Object.freeze({id,stage,type,...attrs});
const C=(id,s,x,y,r,fill,stroke="#6c6475")=>
  decorate("circle",id,s,{x,y,r,fill,stroke,width:.045});
const E=(id,s,x,y,rx,ry,fill,stroke="#6c6475")=>
  decorate("ellipse",id,s,{x,y,rx,ry,fill,stroke,width:.045});
const Q=(id,s,x1,y1,cx,cy,x2,y2,stroke="#517b86",width=.08)=>
  decorate("curve",id,s,{x1,y1,cx,cy,x2,y2,stroke,width});
const S=(id,s,x,y,r,fill="#e7bc78",stroke="#8e7054")=>
  decorate("star",id,s,{x,y,r,fill,stroke,width:.04});
const make=(id,name,clue,focus,description,pieces,details)=>Object.freeze({
  step:1,id,name,clue,focus,description,stage:"Starter",mode:"plot",
  pieces:Object.freeze(pieces),details:Object.freeze(details),
  practice:true,quickSpark:true
});
export const PLOT_QUICK_SPARKS=Object.freeze([
  make("quick-plot-sky-kite","Sky Kite","Into the Blue",
    "Plot straight lines · one boundary per piece · choose solid or dashed",
    "Two triangular regions make a colourful kite soaring through the sky.",[
      part("kite-upper","Upper turquoise sail","#83b8c6",[
        q("kite-upper-floor","y ≥ 0",[0],"above"),
        q("kite-upper-left","y ≤ x + 3",[3,1],"below"),
        q("kite-upper-right","y ≤ 3 − x",[3,-1],"below")
      ],[
        plot("kite-upper-left","line",[-3,0],[0,3],[
          "Both (−3, 0) and (0, 3) lie on y = x + 3.",
          "The line rises one square for every square to the right."
        ],"Draw the rising left edge using two correct points.")
      ]),
      part("kite-lower","Lower golden sail","#e9bf7c",[
        q("kite-lower-top","y ≤ 0",[0],"below"),
        q("kite-lower-left","y ≥ −3 − x",[-3,-1],"above"),
        q("kite-lower-right","y ≥ x − 3",[-3,1],"above")
      ],[
        plot("kite-lower-right","line",[0,-3],[3,0],[
          "For y = x − 3, the y-intercept is −3.",
          "One other point is (3, 0)."
        ],"Plot the bottom-right edge from two points on y = x − 3.")
      ])
    ],[
      Q("kite-cross-horizontal",1,-2.9,0,0,0,2.9,0,"#dce8e4",.065),
      Q("kite-cross-vertical",1,0,-2.9,0,0,0,2.9,"#657c91",.07),
      C("kite-centre",1,0,0,.22,"#f5e7be"),
      Q("kite-tail-string",2,0,-3.0,-.5,-4.0,.45,-4.4,"#5a8280",.085),
      Q("kite-bow-left",2,0,-3.45,-.4,-3.2,-.7,-3.5,"#cf8796",.13),
      Q("kite-bow-right",2,0,-3.45,.4,-3.2,.7,-3.5,"#cf8796",.13),
      E("kite-glimmer-a",2,-.6,1.2,.15,.2,"#dceef1"),
      E("kite-glimmer-b",2,.63,-1.14,.15,.2,"#ffe4af"),
      S("kite-star-a",3,-3.65,3.63,.25),
      S("kite-star-b",3,3.75,3.4,.19),
      C("kite-wind-a",3,-3.5,.55,.13,"#89bfc5"),
      C("kite-wind-b",3,3.3,-2.1,.09,"#89bfc5")
    ]),
  make("quick-plot-candle","Birthday Candle","Make a Little Wish",
    "One parabola and one horizontal line · solid boundaries",
    "Plot a glowing flame and candle body, then finish the birthday decorations.",[
      part("candle-flame","Golden flame","#edb46e",[
        parabola("candle-flame-top","y ≤ 3.5 − 0.5x²",-.5,0,3.5,"below"),
        q("candle-flame-bottom","y ≥ 1.5",[1.5],"above")
      ],[
        plot("candle-flame-top","parabola",[0,3.5],[2,1.5],[
          "The highest point of this parabola is (0, 3.5).",
          "When x = 2, y = 3.5 − 0.5 × 4 = 1.5."
        ],"Place the turning point, then a second point on the parabola.")
      ]),
      part("candle-stick","Rose candle","#d990a1",[
        vertical("candle-left","x ≥ −1.5",-1.5,"right"),
        vertical("candle-right","x ≤ 1.5",1.5,"left"),
        q("candle-stick-bottom","y ≥ −3",[-3],"above"),
        q("candle-stick-top","y ≤ 1.5",[1.5],"below")
      ],[
        plot("candle-stick-bottom","line",[-2,-3],[2,-3],[
          "A horizontal line keeps the same y-value everywhere.",
          "Use any two points with y = −3."
        ],"Draw the candle's horizontal base.")
      ])
    ],[
      E("flame-inner-glow",1,0,2.35,.43,.79,"#fbe0a8"),
      Q("candle-wax-left",1,-1.4,1.22,-1.22,.78,-1.34,.48,"#f3bfbd",.12),
      Q("candle-wax-right",1,1.35,.72,1.16,.38,1.32,.14,"#f5c5c2",.12),
      C("candle-eye-a",1,-.45,-.75,.10,"#5b596c"),
      C("candle-eye-b",1,.45,-.75,.10,"#5b596c"),
      Q("candle-smile",2,-.36,-1.12,0,-1.4,.36,-1.12,"#87596b",.08),
      Q("candle-stand",2,-2.3,-3.1,0,-3.48,2.3,-3.1,"#927784",.15),
      C("candle-dot",2,0,.38,.14,"#f3d0c5"),
      S("candle-star-a",3,-3.4,3.15,.27),
      S("candle-star-b",3,3.6,3.3,.22),
      C("candle-sparkle-left",3,-2.6,1.65,.11,"#e5b17e"),
      C("candle-sparkle-right",3,2.5,1.9,.12,"#e5b17e")
    ]),
  make("quick-plot-pocket-rocket","Pocket Rocket","Ready to Launch",
    "Plot a diagonal line and a vertical line · simple plotted boundaries",
    "A pointed rocket nose and straight body appear from two constructed regions.",[
      part("rocket-nose","Coral rocket nose","#e79c9a",[
        q("rocket-nose-base","y ≥ 1",[1],"above"),
        q("rocket-nose-left","y ≤ x + 3",[3,1],"below"),
        q("rocket-nose-right","y ≤ 3 − x",[3,-1],"below")
      ],[
        plot("rocket-nose-right","line",[0,3],[2,1],[
          "The nose edge slopes down: y = 3 − x.",
          "The points (0, 3) and (2, 1) both work."
        ],"Plot the falling edge of the rocket nose.")
      ]),
      part("rocket-body","Teal rocket body","#8bc0cc",[
        vertical("rocket-body-left","x ≥ −1.5",-1.5,"right"),
        vertical("rocket-body-right","x ≤ 1.5",1.5,"left"),
        q("rocket-body-floor","y ≥ −3",[-3],"above"),
        q("rocket-body-ceiling","y ≤ 1",[1],"below")
      ],[
        plot("rocket-body-right","line",[1.5,-2],[1.5,2],[
          "A vertical line has the same x-value at every point.",
          "Use two points whose x-coordinate is 1.5."
        ],"Place two different points with x = 1.5.")
      ])
    ],[
      C("rocket-window-outer",1,0,.10,.65,"#507f9c"),
      C("rocket-window-inner",1,0,.10,.44,"#d7eced"),
      E("rocket-window-glint",1,-.16,.30,.14,.20,"#f8f5e1"),
      Q("rocket-fin-left",2,-1.5,-1.3,-2.25,-2.2,-2.85,-3.2,"#bb7285",.22),
      Q("rocket-fin-right",2,1.5,-1.3,2.25,-2.2,2.85,-3.2,"#bb7285",.22),
      Q("rocket-engine",2,-.9,-3.05,0,-3.50,.9,-3.05,"#75879f",.14),
      Q("rocket-flame",2,0,-3.1,.22,-4.4,0,-4.75,"#edb374",.27),
      C("rocket-rivet-a",2,-.85,-1.55,.10,"#f9e0b9"),
      C("rocket-rivet-b",2,.85,-1.55,.10,"#f9e0b9"),
      S("rocket-star-a",3,-3.7,3.4,.25),
      S("rocket-star-b",3,3.67,2.9,.2),
      C("rocket-glimmer",3,-3.3,-1.5,.11,"#dbaac8")
    ]),
  make("quick-plot-sunrise-bay","Sunrise Bay","Good Morning, Sea",
    "One parabolic sun and one dashed horizontal boundary",
    "Plot the sunrise and the shoreline, then add small waves and golden rays.",[
      part("bay-sun","Golden sunrise","#efd087",[
        parabola("bay-sun-upper","y ≤ 3.5 − 0.5x²",-.5,0,3.5,"below"),
        parabola("bay-sun-lower","y ≥ 1.5 + 0.5x²",.5,0,1.5,"above")
      ],[
        plot("bay-sun-upper","parabola",[0,3.5],[2,1.5],[
          "The parabola has its maximum at (0, 3.5).",
          "When x = 2, y = 1.5; this gives a second point."
        ],"Draw the upper edge of the sun.")
      ]),
      part("bay-sea","Turquoise sea","#7db9c4",[
        vertical("bay-sea-left","x ≥ −4.5",-4.5,"right"),
        vertical("bay-sea-right","x ≤ 4.5",4.5,"left"),
        q("bay-sea-floor","y ≥ −3",[-3],"above"),
        q("bay-sea-top","y < −1",[-1],"below",false)
      ],[
        plot("bay-sea-top","line",[-2,-1],[2,-1],[
          "The line y = −1 is horizontal.",
          "The < sign means your boundary should be dashed."
        ],"Plot the shoreline's strict horizontal boundary.")
      ])
    ],[
      Q("sunrise-ray-left",1,-2,3.35,-2.5,3.6,-2.82,3.6,"#c49d64",.1),
      Q("sunrise-ray-right",1,2,3.35,2.5,3.6,2.82,3.6,"#c49d64",.1),
      E("sunrise-glint",1,-.42,2.80,.24,.14,"#fff0bd"),
      Q("bay-wave-left",1,-3.7,-1.65,-2.9,-1.30,-2.0,-1.65,"#e6f3ed",.10),
      Q("bay-wave-right",1,1.4,-2.05,2.3,-1.65,3.25,-2.0,"#d4eeeb",.10),
      Q("bay-wave-mid",2,-1.0,-2.55,0,-2.23,1.0,-2.55,"#e3f6ed",.08),
      C("bay-sun-eye-a",2,-.29,2.38,.08,"#866a5f"),
      C("bay-sun-eye-b",2,.29,2.38,.08,"#866a5f"),
      Q("bay-sun-smile",2,-.23,2.15,0,2.01,.23,2.15,"#9d6c64",.05),
      S("bay-bird-left",3,-3.4,3.6,.19),
      S("bay-bird-right",3,3.65,3.18,.18),
      C("bay-foam-a",3,-4,-2.7,.10,"#e6f0f0"),
      C("bay-foam-b",3,3.9,-2.6,.10,"#e6f0f0")
    ])
]);
