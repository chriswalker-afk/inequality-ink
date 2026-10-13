// Phase 2: five ORIGINAL mathematical pictures. Every coloured shape is
// the actual intersection of its displayed inequalities, never decoration.
import {
  PICTURE,parabola,q,vertical,absolute,circleRule,
  validatePicture,regionPaths,satisfiesAll
} from "./curved-engine.mjs";

export const CURVE_STAGES=Object.freeze([
  Object.freeze({step:1,name:"Starter",summary:"Find two parabolic wings"}),
  Object.freeze({step:2,name:"Step Up",summary:"Translated parabolas and your first circle"}),
  Object.freeze({step:3,name:"Building",summary:"Regions between curved boundaries; strict signs"}),
  Object.freeze({step:4,name:"Challenge",summary:"Absolute-value boundaries and circles"}),
  Object.freeze({step:5,name:"Big Finish",summary:"A seven-piece mixture of curves"})
]);
const piece=(id,name,color,rules)=>Object.freeze({
  id,name,color,rules:Object.freeze(rules)
});
const picture=(step,id,name,clue,description,focus,pieces,details)=>Object.freeze({
  step,id,name,clue,description,focus,
  stage:CURVE_STAGES[step-1].name,mode:"curve",
  pieces:Object.freeze(pieces),details:Object.freeze(details)
});
const E=(id,stage,x,y,rx,ry,fill,stroke="#536275",width=.045)=>
  Object.freeze({id,stage,type:"ellipse",x,y,rx,ry,fill,stroke,width});
const C=(id,stage,x,y,r,fill,stroke="#536275",width=.04)=>
  Object.freeze({id,stage,type:"circle",x,y,r,fill,stroke,width});
const Q=(id,stage,x1,y1,cx,cy,x2,y2,stroke="#48687a",width=.06)=>
  Object.freeze({id,stage,type:"curve",x1,y1,cx,cy,x2,y2,stroke,width});
const S=(id,stage,x,y,r,fill="#dfad64",stroke="#936d55",width=.04)=>
  Object.freeze({id,stage,type:"star",x,y,r,fill,stroke,width});

const hills=picture(2,"rolling-hills","Rolling Hills",
  "A sunny landscape","Two parabolic hills and a circular sun.",
  "Translated parabolas · a circle · three regions",[
    piece("left-hill","Emerald hill","#82b6a0",[
      q("hill-left-ground","y ≥ −4",[-4],"above"),
      parabola("hill-left-arc","y ≤ −0.42(x + 2)² + 1.28",-.42,-2,1.28,"below"),
      vertical("hill-left-half","x ≤ 0",0,"left")
    ]),
    piece("right-hill","Teal hill","#62a997",[
      q("hill-right-ground","y ≥ −4",[-4],"above"),
      parabola("hill-right-arc","y ≤ −0.38(x − 2)² + 1.15",-.38,2,1.15,"below"),
      vertical("hill-right-half","x ≥ 0",0,"right")
    ]),
    piece("sun-disk","Golden sun","#f5c677",[
      circleRule("hill-sun-rule","(x − 2.85)² + (y − 3.22)² ≤ 0.68²",2.85,3.22,.68)
    ])
  ],[
    E("hill-patch-left",1,-2.6,-2.3,.45,.14,"#d1e9bc","#54856d"),
    E("hill-patch-right",1,1.6,-2.25,.52,.15,"#c5ead5","#498471"),
    C("hill-flower-a",1,-3.5,-2.5,.1,"#f2d29c","#8c6b5b"),
    C("hill-flower-b",1,3.0,-2.6,.11,"#ffe6ad","#8c6b5b"),
    Q("hill-grass-a",1,-3.9,-3.35,-3.7,-2.95,-3.48,-3.34,"#3e7769"),
    Q("hill-grass-b",1,2.4,-3.3,2.62,-2.9,2.83,-3.3,"#356f63"),
    C("hill-sun-eye-a",2,2.65,3.30,.07,"#655365","#655365"),
    C("hill-sun-eye-b",2,3.04,3.30,.07,"#655365","#655365"),
    Q("hill-sun-smile",2,2.66,3.05,2.85,2.87,3.05,3.05,"#655365",.048),
    E("hill-cloud-one",2,-2.90,3.70,.68,.19,"#d3e7e8","#617f91"),
    E("hill-cloud-two",2,-2.52,3.84,.36,.24,"#d3e7e8","#617f91"),
    E("hill-cloud-three",2,-2.1,3.72,.46,.18,"#d3e7e8","#617f91"),
    S("hill-star-a",3,-4.1,3.25,.21),
    S("hill-star-b",3,4.27,1.90,.18),
    C("hill-dust-a",3,-.55,3.60,.07,"#886c84"),
    C("hill-dust-b",3,4.10,3.72,.07,"#886c84")
  ]);

const ribbonValues=[.18,.34,.50,.66,.82];
const ribbonColors=["#78b8a5","#f0c174","#e7a1a7","#aa96cb"];
const ribbonNames=["Emerald ribbon","Golden ribbon","Rose ribbon","Lavender ribbon"];
const ribbonPieces=ribbonNames.map((name,i)=>piece("ribbon-"+(i+1),name,ribbonColors[i],[
  q("ribbon-"+i+"-bottom",
    "y "+(i===2?">":"≥")+" "+ribbonValues[i]+"(4 − x²)",
    [4*ribbonValues[i],0,-ribbonValues[i]],"above",i!==2),
  q("ribbon-"+i+"-top",
    "y "+(i===1?"<":"≤")+" "+ribbonValues[i+1]+"(4 − x²)",
    [4*ribbonValues[i+1],0,-ribbonValues[i+1]],"below",i!==1)
]));
const rainbow=picture(3,"rainbow-ribbons","Rainbow Ribbons",
  "Four colourful arcs","Layer four real parabolic bands into a rainbow.",
  "Regions between two curves · strict boundaries",ribbonPieces,[
    E("rainbow-cloud-left",1,-2.30,-.11,.63,.24,"#d9e9e7","#678493"),
    E("rainbow-cloud-right",1,2.30,-.11,.63,.24,"#d9e9e7","#678493"),
    C("rainbow-cloud-puff-l",1,-2.02,.06,.27,"#d9e9e7","#678493"),
    C("rainbow-cloud-puff-r",1,2.02,.06,.27,"#d9e9e7","#678493"),
    C("rainbow-shine-a",2,0,2.25,.10,"#ffe8c0","#9b6486"),
    C("rainbow-shine-b",2,-.65,1.65,.08,"#ffe8c0","#9b6486"),
    C("rainbow-shine-c",2,.65,1.65,.08,"#ffe8c0","#9b6486"),
    S("rainbow-star-l",3,-3.65,2.8,.32),
    S("rainbow-star-r",3,3.65,2.8,.32),
    S("rainbow-star-top",3,0,4.1,.23),
    C("rainbow-spark-l",3,-3.25,1.40,.08,"#996d85"),
    C("rainbow-spark-r",3,3.25,1.40,.08,"#996d85")
  ]);

const flower=picture(4,"orbit-flower","Orbit Flower",
  "A flower in orbit","Curved and circular petals meet around a golden centre.",
  "Absolute-value graphs · parabolas · circle inequalities",[
    piece("upper-petal","Upper petal","#eb9fb4",[
      absolute("flower-upper-v","y ≥ 0.75 + 0.6|x|",0,.75,.6,"above"),
      parabola("flower-upper-arch","y ≤ 3.6 − 1.9x²",-1.9,0,3.6,"below")
    ]),
    piece("lower-petal","Lower petal","#aa9dd9",[
      absolute("flower-lower-v","y ≤ −0.75 − 0.6|x|",0,-.75,-.6,"below"),
      parabola("flower-lower-arch","y ≥ −3.6 + 1.9x²",1.9,0,-3.6,"above")
    ]),
    piece("left-petal","Left petal","#91cad3",[
      circleRule("flower-left-circle","(x + 1.8)² + y² ≤ 1.12²",-1.8,0,1.12)
    ]),
    piece("right-petal","Right petal","#f2c288",[
      circleRule("flower-right-circle","(x − 1.8)² + y² ≤ 1.12²",1.8,0,1.12)
    ]),
    piece("flower-heart","Golden centre","#f1d277",[
      circleRule("flower-centre-circle","x² + y² ≤ 0.7²",0,0,.7)
    ])
  ],[
    E("petal-ring",1,0,0,.50,.50,"#fff0c1","#946f67"),
    C("petal-centre",1,0,0,.19,"#c78368","#88585e"),
    C("petal-dot-top",1,0,2.18,.13,"#ffe3b5","#a86586"),
    C("petal-dot-bottom",1,0,-2.18,.13,"#e2d6f4","#7368a1"),
    C("petal-dot-left",1,-2.18,.15,.14,"#dbf0f3","#457f8b"),
    C("petal-dot-right",1,2.18,.15,.14,"#fff0d8","#a27651"),
    Q("flower-stem",2,0,-3.67,.15,-4.18,0,-4.65,"#497d69",.12),
    Q("flower-leaf-left",2,0,-4.29,-1.16,-4.0,-1.52,-4.42,"#497d69",.075),
    Q("flower-leaf-right",2,0,-4.44,1.16,-4.11,1.52,-4.41,"#497d69",.075),
    S("flower-star-left",3,-3.9,2.9,.27),
    S("flower-star-right",3,3.9,2.9,.27),
    S("flower-star-low-l",3,-3.4,-3.1,.17),
    S("flower-star-low-r",3,3.4,-3.1,.17),
    C("flower-dust-a",3,-3.8,.2,.08,"#936d8f"),
    C("flower-dust-b",3,3.8,.2,.08,"#936d8f")
  ]);

const bellLower=(id,text,side)=>parabola(id,text,-.07,0,1.30,side);
const bellUpper=(id,text,side)=>parabola(id,text,-.30,0,3.65,side);
const jellies=picture(5,"cosmic-jellyfish","Cosmic Jellyfish",
  "A creature from the stars","Seven regions make a luminous jellyfish.",
  "Mixed curves · strict lines · circles · seven pieces",[
    piece("bell-left","Lavender bell","#ad94cd",[
      bellLower("jelly-bell-left-low","y ≥ 1.30 − 0.07x²","above"),
      bellUpper("jelly-bell-left-top","y ≤ 3.65 − 0.30x²","below"),
      vertical("jelly-bell-left-mid","x ≤ 0",0,"left")
    ]),
    piece("bell-right","Blue bell","#8daedc",[
      bellLower("jelly-bell-right-low","y ≥ 1.30 − 0.07x²","above"),
      bellUpper("jelly-bell-right-top","y ≤ 3.65 − 0.30x²","below"),
      vertical("jelly-bell-right-mid","x > 0",0,"right",false)
    ]),
    piece("tentacle-left","Left ribbon","#c19acb",[
      parabola("jelly-t-left-floor","y ≥ −3.5 + 0.4(x + 1.8)²",.4,-1.8,-3.5,"above"),
      q("jelly-t-left-top","y ≤ 1.1",[1.1],"below"),
      vertical("jelly-t-left-a","x ≥ −2.15",-2.15,"right"),
      vertical("jelly-t-left-b","x ≤ −1.50",-1.50,"left")
    ]),
    piece("tentacle-center","Centre ribbon","#78bfb6",[
      parabola("jelly-t-mid-floor","y ≥ −3.7 + 0.36x²",.36,0,-3.7,"above"),
      q("jelly-t-mid-top","y ≤ 1.2",[1.2],"below"),
      vertical("jelly-t-mid-a","x ≥ −0.44",-.44,"right"),
      vertical("jelly-t-mid-b","x ≤ 0.44",.44,"left")
    ]),
    piece("tentacle-right","Right ribbon","#e8a6b8",[
      parabola("jelly-t-right-floor","y ≥ −3.5 + 0.4(x − 1.8)²",.4,1.8,-3.5,"above"),
      q("jelly-t-right-top","y ≤ 1.1",[1.1],"below"),
      vertical("jelly-t-right-a","x ≥ 1.50",1.5,"right"),
      vertical("jelly-t-right-b","x < 2.15",2.15,"left",false)
    ]),
    piece("bubble-left","Small bubble","#b3e2e5",[
      circleRule("jelly-bubble-left-rule","(x + 3.65)² + (y + 1.25)² < 0.49²",-3.65,-1.25,.49,"inside",false)
    ]),
    piece("bubble-right","Floating bubble","#dfd1f3",[
      circleRule("jelly-bubble-right-rule","(x − 3.7)² + (y + 0.6)² ≤ 0.58²",3.7,-.6,.58)
    ])
  ],[
    E("jelly-eye-l",1,-.72,2.2,.24,.29,"#fff4d7","#4c5a76"),
    E("jelly-eye-r",1,.72,2.2,.24,.29,"#fff4d7","#4c5a76"),
    C("jelly-pupil-l",1,-.7,2.19,.095,"#35475c","#35475c"),
    C("jelly-pupil-r",1,.7,2.19,.095,"#35475c","#35475c"),
    E("jelly-blush-l",1,-1.50,1.91,.23,.12,"#f7bfd0","#9a729b"),
    E("jelly-blush-r",1,1.50,1.91,.23,.12,"#f7bfd0","#9a729b"),
    Q("jelly-smile",2,-.29,1.87,0,1.58,.29,1.87,"#495275",.085),
    Q("jelly-tentacle-wave-l",2,-1.84,-.1,-1.56,-1.65,-1.84,-3.2,"#725f9c",.07),
    Q("jelly-tentacle-wave-m",2,0,.15,.28,-1.64,0,-3.27,"#348b7f",.07),
    Q("jelly-tentacle-wave-r",2,1.8,-.1,1.52,-1.65,1.8,-3.2,"#a76f92",.07),
    E("jelly-bubble-glint-left",2,-3.75,-1.1,.12,.20,"#fff3d9","#6698a5",.028),
    E("jelly-bubble-glint-right",2,3.58,-.43,.13,.21,"#fff3d9","#9280b1",.028),
    S("jelly-starlight-a",3,-4.2,3.7,.3),
    S("jelly-starlight-b",3,4.25,3.5,.28),
    S("jelly-starlight-c",3,-3.65,-3.1,.2),
    S("jelly-starlight-d",3,3.65,-3.0,.19),
    C("jelly-speck-a",3,-2.8,4.1,.08,"#9873aa"),
    C("jelly-speck-b",3,2.9,4.25,.08,"#9873aa")
  ]);

export const CURVE_PICTURES=Object.freeze([
  Object.freeze({...PICTURE,step:1,stage:"Starter",mode:"curve",
    description:"Find the two wings bounded by intersecting parabolas.",
    focus:"Two parabolas · common regions · solid and dashed boundaries"}),
  hills,rainbow,flower,jellies
]);
export const curvePicture=id=>CURVE_PICTURES.find(p=>p.id===id)||null;
export const curveStagePicture=step=>CURVE_PICTURES[step-1]||null;

export function validateCurveGallery(){
  if(CURVE_PICTURES.length!==5)throw Error("Curve & Fill requires five original pictures");
  const ids=new Set();
  for(const [index,p] of CURVE_PICTURES.entries()){
    if(ids.has(p.id)||p.step!==index+1||p.mode!=="curve"||
       p.stage!==CURVE_STAGES[index].name||!p.clue||!p.focus||!p.description)
      throw Error("Incorrect Curve & Fill gallery metadata");
    ids.add(p.id);
    if(index&&p.pieces.length<=CURVE_PICTURES[index-1].pieces.length)
      throw Error("Curve & Fill picture sizes must grow each stage");
    validatePicture(p);
    const partIds=new Set(),ruleIds=new Set();
    for(const part of p.pieces){
      if(partIds.has(part.id)||!part.color||!/^#[0-9a-fA-F]{6}$/.test(part.color))
        throw Error("Invalid picture piece "+part.id);
      partIds.add(part.id);
      if(!part.rules.some(r=>["function","absolute","circle"].includes(r.kind)))
        throw Error("Each Curve & Fill piece must have a genuine curved boundary: "+part.id);
      for(const r of part.rules){
        if(ruleIds.has(r.id))throw Error("Repeated inequality identifier "+r.id);
        ruleIds.add(r.id);
      }
      // A real patch of positive area must be visible. The fill is always
      // computed from the rules, never a painted bitmap or authored polygon.
      const polygons=regionPaths(part.rules);
      if(!polygons.length)throw Error("No visible mathematical region "+part.id);
      const samples=Array.from({length:33},(_,i)=>-4.8+i*.3);
      if(!samples.some(x=>samples.some(y=>satisfiesAll(part.rules,x,y))))
        throw Error("Region too small to select by touch "+part.id);
    }
    if(!(p.details?.length>=8)||!p.details.some(d=>d.stage===3))
      throw Error("Missing staged artwork details for "+p.id);
  }
  if(CURVE_PICTURES[0].id!=="parabola-butterfly"||
     CURVE_PICTURES[0].pieces[0].rules[0].text!=="y ≥ x² − 4")
    throw Error("The original butterfly must remain intact");
  return true;
}
