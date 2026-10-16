// Three genuinely different three-piece Step Up curve paintings.
// Curved outlines and interior colour always come from actual inequalities;
// staged decorations are added only after the mathematical work is complete.
import {q,parabola,vertical,circleRule} from "./curved-engine.mjs";
const part=(id,name,color,rules)=>Object.freeze({
  id,name,color,rules:Object.freeze(rules)
});
const D=(type,stage,data)=>Object.freeze({type,stage,...data});
const C=(stage,x,y,r,fill,stroke="#627786",width=.045)=>
  D("circle",stage,{x,y,r,fill,stroke,width});
const E=(stage,x,y,rx,ry,fill,stroke="#627786",width=.045)=>
  D("ellipse",stage,{x,y,rx,ry,fill,stroke,width});
const Q=(stage,x1,y1,cx,cy,x2,y2,stroke="#537e85",width=.075)=>
  D("curve",stage,{x1,y1,cx,cy,x2,y2,stroke,width});
const S=(stage,x,y,r,fill="#e7c17c",stroke="#957559")=>
  D("star",stage,{x,y,r,fill,stroke,width:.05});
function make(id,name,clue,description,focus,pieces,details){
  if(pieces.length!==3)throw Error("Step Up needs three pieces");
  return Object.freeze({id,name,clue,description,focus,step:2,
    stage:"Step Up",mode:"curve",practice:true,stepUpVariety:true,
    pieces:Object.freeze(pieces),
    details:Object.freeze(details.map((d,i)=>Object.freeze({
      id:id+"-detail-"+(i+1),...d
    })))
  });
}
export const CURVE_STEP_UPS=Object.freeze([
  make("step-sea-turtle","Sea Turtle","A Friend Beneath the Waves",
    "Three curved regions create a smiling turtle with a patterned shell.",
    "Translated parabolas · circular regions · intersections of curved boundaries",[
      part("turtle-shell","Turquoise shell","#80c0b0",[
        circleRule("turtle-shell-outline","(x + 0.6)² + y² ≤ 2²",-.6,0,2),
        q("turtle-shell-floor","y ≥ −1.75",[-1.75],"above")
      ]),
      part("turtle-head","The turtle's head","#aed0a1",[
        circleRule("turtle-head-outline","(x − 2.0)² + (y − 0.2)² ≤ 1",2,.2,1),
        q("turtle-head-floor","y ≥ −0.6",[-.6],"above")
      ]),
      part("turtle-flipper","Left back flipper","#b2d2be",[
        parabola("turtle-flipper-upper","y ≤ −0.85 − 0.15(x + 1.8)²",
          -.15,-1.8,-.85,"below"),
        parabola("turtle-flipper-lower","y ≥ −2.6 + 0.25(x + 1.8)²",
          .25,-1.8,-2.6,"above"),
        vertical("turtle-flipper-left","x ≥ −3.2",-3.2,"right"),
        vertical("turtle-flipper-right","x ≤ −1.2",-1.2,"left")
      ])
    ],[
      E(1,-1.1,.7,.52,.24,"#add8c4","#538d82"),
      E(1,-.15,.35,.46,.26,"#b7dfca","#538d82"),
      E(1,-1.25,-.28,.32,.22,"#a6d3c3","#538d82"),
      Q(1,-.55,1.15,.05,-.05,-.45,-1.35,"#4c9486",.07),
      C(1,2.35,.6,.13,"#355e6e","#355e6e"),
      C(1,2.39,.66,.04,"#fff7db","#fff7db"),
      C(1,2.63,.09,.14,"#c98f8c"),
      Q(2,1.85,-.15,2.12,-.36,2.4,-.1,"#537e7a",.08),
      Q(2,-.25,-1.7,.7,-2.5,1.15,-2.75,"#579b95",.16),
      Q(2,-2.0,-1.25,-3.0,-2.5,-3.2,-2.92,"#74ada1",.10),
      C(2,-3.9,1.7,.15,"#98cbd4"),
      C(2,-3.55,2.3,.23,"#98cbd4"),
      S(3,-3.9,3.6,.24,"#e7bf7e"),
      S(3,3.8,3.3,.25,"#e7bf7e"),
      C(3,3.56,-2.65,.10,"#85b7c3")
    ]),
  make("step-swirly-lollipop","Swirly Lollipop","A Sweet Surprise",
    "Two circular halves and a slender stick make a cheerful candy swirl.",
    "Circle centre and radius · vertical restrictions · a gentle parabola",[
      part("lollipop-left","Rose candy half","#e69eaf",[
        circleRule("lollipop-left-round","x² + (y − 1.55)² ≤ 1.7²",0,1.55,1.7),
        vertical("lollipop-left-side","x ≤ 0",0,"left")
      ]),
      part("lollipop-right","Mint candy half","#83cbbf",[
        circleRule("lollipop-right-round","x² + (y − 1.55)² < 1.7²",
          0,1.55,1.7,"inside",false),
        vertical("lollipop-right-side","x ≥ 0",0,"right")
      ]),
      part("lollipop-stick","Cream candy stick","#f0ddb4",[
        parabola("lollipop-stick-bottom","y ≥ −3.4 + 0.15x²",
          .15,0,-3.4,"above"),
        q("lollipop-stick-top","y ≤ −0.05",[-.05],"below"),
        vertical("lollipop-stick-left","x ≥ −0.28",-.28,"right"),
        vertical("lollipop-stick-right","x ≤ 0.28",.28,"left")
      ])
    ],[
      Q(1,-1.1,1.8,-.5,2.3,-.1,2.7,"#f7d6c9",.18),
      Q(1,.1,2.7,1,2.55,1.35,1.5,"#d8f2d3",.18),
      Q(1,-1.25,1.0,-.7,.45,0,.65,"#f6ddc9",.13),
      Q(1,0,.65,.8,.5,1.25,1.05,"#eaf6d5",.13),
      C(1,-.5,1.5,.14,"#fff5dc"),
      C(1,.54,1.55,.14,"#fff5dc"),
      C(2,-.53,1.58,.07,"#5a7081"),
      C(2,.53,1.58,.07,"#5a7081"),
      Q(2,-.26,1.19,0,1.04,.26,1.19,"#a16f87",.07),
      E(2,-.12,-1.3,.09,.48,"#fff8e6"),
      Q(2,-.28,-2.85,.0,-3.06,.28,-2.85,"#b89d86",.06),
      S(3,-3.75,3.75,.28),
      S(3,3.75,3.4,.20),
      C(3,-3.4,-2.25,.12,"#cb8f9e"),
      C(3,3.4,-2.85,.11,"#8cbdb9")
    ]),
  make("step-blooming-tulip","Blooming Tulip","Spring is Here",
    "Two overlapping parabolic petals meet above a slender green stem.",
    "Translated parabola graphs · regions bounded by lines and curves",[
      part("tulip-left-petal","Left coral petal","#e99b9d",[
        parabola("tulip-left-arch","y ≤ 3.4 − 0.65(x + 1)²",
          -.65,-1,3.4,"below"),
        q("tulip-left-floor","y ≥ 0.7",[.7],"above"),
        vertical("tulip-left-half","x ≤ 0.35",.35,"left")
      ]),
      part("tulip-right-petal","Right rose petal","#d8839d",[
        parabola("tulip-right-arch","y ≤ 3.4 − 0.65(x − 1)²",
          -.65,1,3.4,"below"),
        q("tulip-right-floor","y ≥ 0.7",[.7],"above"),
        vertical("tulip-right-half","x ≥ −0.35",-.35,"right")
      ]),
      part("tulip-stem","The emerald stem","#7db19b",[
        parabola("tulip-stem-ground","y ≥ −3.6 + 0.2x²",
          .2,0,-3.6,"above"),
        q("tulip-stem-ceiling","y ≤ 0.85",[.85],"below"),
        vertical("tulip-stem-left","x ≥ −0.36",-.36,"right"),
        vertical("tulip-stem-right","x ≤ 0.36",.36,"left")
      ])
    ],[
      Q(1,-1.25,1.25,-.9,2.0,-1.08,2.95,"#fcdad4",.14),
      Q(1,1.25,1.25,.9,2.0,1.08,2.95,"#efb3c5",.14),
      E(1,-1.35,2.5,.22,.42,"#ffd2cc"),
      E(1,1.3,2.5,.22,.42,"#f2bbcc"),
      Q(1,-.1,.75,0,1.85,.12,3.05,"#c77693",.08),
      Q(2,-.25,-.6,-2.2,-.55,-2.4,-1.4,"#4c8d78",.16),
      Q(2,.25,-1.55,2.4,-1.4,2.65,-2.2,"#4c8d78",.16),
      E(2,-1.55,-1.25,.55,.22,"#a6ceb1","#689d83"),
      E(2,1.72,-2.0,.58,.22,"#a6ceb1","#689d83"),
      C(2,-.23,1.1,.08,"#744f60"),
      C(2,.23,1.1,.08,"#744f60"),
      Q(2,-.20,.93,0,.83,.20,.93,"#986a7e",.05),
      S(3,-3.8,3.4,.25),
      S(3,3.8,3.65,.23),
      C(3,-3.45,-2.8,.12,"#ab8ca8"),
      C(3,3.25,-3.1,.12,"#c998ac")
    ])
]);
