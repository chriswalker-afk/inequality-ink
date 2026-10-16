// Four original Quick Spark Curve & Fill pictures, each consisting of two
// genuinely curved intersections. Parabolic equations stay un-translated:
// students meet shifted and circular boundaries later in Step Up.
import {q,parabola,vertical} from "./curved-engine.mjs";
const part=(id,name,color,rules)=>Object.freeze({
  id,name,color,rules:Object.freeze(rules)
});
const note=(type,id,stage,props)=>Object.freeze({id,stage,type,...props});
const C=(id,s,x,y,r,fill,stroke="#5c7080")=>
  note("circle",id,s,{x,y,r,fill,stroke,width:.045});
const E=(id,s,x,y,rx,ry,fill,stroke="#5c7080")=>
  note("ellipse",id,s,{x,y,rx,ry,fill,stroke,width:.045});
const Q=(id,s,x1,y1,cx,cy,x2,y2,stroke="#557b79",width=.07)=>
  note("curve",id,s,{x1,y1,cx,cy,x2,y2,stroke,width});
const S=(id,s,x,y,r,fill="#e6b879",stroke="#97704d")=>
  note("star",id,s,{x,y,r,fill,stroke,width:.05});
function art(id,name,clue,description,focus,pieces,details){
  return Object.freeze({
    step:1,id,name,clue,description,focus,stage:"Starter",mode:"curve",
    pieces:Object.freeze(pieces),details:Object.freeze(details),
    practice:true,quickSpark:true
  });
}
export const CURVE_QUICK_SPARKS=Object.freeze([
  art("quick-curve-mushroom","Mushroom Magic","A Forest Surprise",
    "A rounded mushroom cap and a slender stem spring from two simple parabolic regions.",
    "Parabola above/below · horizontal lines · a narrow stem",[
      part("mushroom-cap","Mushroom cap","#e5a19a",[
        parabola("mushroom-top","y ≤ 3.5 − 0.5x²",-.5,0,3.5,"below"),
        q("mushroom-rim","y ≥ 0.65",[.65],"above")
      ]),
      part("mushroom-stem","Cream-coloured stem","#efd4a3",[
        parabola("stem-bottom","y ≥ −2.7 + 0.1x²",.1,0,-2.7,"above"),
        q("stem-top","y ≤ 0.65",[.65],"below"),
        vertical("stem-left","x ≥ −0.8",-.8,"right"),
        vertical("stem-right","x ≤ 0.8",.8,"left")
      ])
    ],[
      E("mushroom-spots-left",1,-1.3,1.67,.32,.23,"#fff2d6"),
      C("mushroom-spots-right",1,1.33,2.18,.27,"#fff0ce"),
      C("mushroom-spots-middle",1,.12,2.79,.22,"#fff0ce"),
      E("mushroom-glint",1,-.55,2.82,.24,.12,"#ffdacc"),
      C("mushroom-face-eye-a",2,-.28,-1.18,.085,"#475d68"),
      C("mushroom-face-eye-b",2,.28,-1.18,.085,"#475d68"),
      Q("mushroom-smile",2,-.24,-1.53,0,-1.7,.24,-1.53,"#85586b"),
      Q("mushroom-grass-left",2,-1.65,-2.7,-1.35,-2.42,-1.1,-2.7,"#4d8574"),
      Q("mushroom-grass-right",2,1.15,-2.7,1.4,-2.39,1.65,-2.7,"#4d8574"),
      S("mushroom-star-a",3,-3.7,3.6,.22),
      S("mushroom-star-b",3,3.65,3.28,.26),
      C("mushroom-dust-a",3,-2.95,.35,.10,"#9274a6"),
      C("mushroom-dust-b",3,3.25,-1.45,.10,"#ad879a")
    ]),
  art("quick-curve-autumn-leaf","Autumn Leaf","A Leaf on the Breeze",
    "Two mirrored parabolic leaf halves join to form a glowing autumn leaf.",
    "Recognise regions above and below y = 0 · positive and negative x²",[
      part("leaf-upper","Upper leaf","#e7bd7f",[
        q("leaf-upper-middle","y ≥ 0",[0],"above"),
        parabola("leaf-upper-arch","y ≤ 2.4 − 0.36x²",-.36,0,2.4,"below")
      ]),
      part("leaf-lower","Lower leaf","#d88b7b",[
        q("leaf-lower-middle","y ≤ 0",[0],"below"),
        parabola("leaf-lower-arch","y ≥ −2.4 + 0.36x²",.36,0,-2.4,"above")
      ])
    ],[
      Q("leaf-centre",1,-2.65,0,0,.1,2.65,0,"#8f6852",.09),
      Q("leaf-vein-a",1,-1.15,.05,-1.0,.95,-.38,1.55,"#b6805f"),
      Q("leaf-vein-b",1,.2,.05,1.1,.8,1.45,1.22,"#b6805f"),
      Q("leaf-vein-c",1,-1.15,-.05,-.9,-1.04,-.3,-1.65,"#a46962"),
      Q("leaf-vein-d",1,.15,-.05,.85,-.85,1.45,-1.30,"#a46962"),
      Q("leaf-stalk",2,2.55,0,3.28,-.15,3.8,-.75,"#8f6852",.11),
      C("leaf-dewdrop",2,-1.16,1.15,.13,"#ffefd1"),
      C("leaf-shine",2,.9,-1.23,.09,"#f9ce9d"),
      S("leaf-fall-left",3,-3.56,2.4,.24),
      S("leaf-fall-right",3,3.8,2.95,.20),
      C("leaf-wind-a",3,-3.5,-1.1,.10,"#a1828b"),
      C("leaf-wind-b",3,3.25,-2.3,.12,"#a1828b")
    ]),
  art("quick-curve-snowman","Winter Snowman","Frosty Friend",
    "Two curved regions reveal the snowman's head and body, followed by winter details.",
    "Two simple parabolic lenses · centre line symmetry",[
      part("snowman-body","Snowball body","#bfdde2",[
        parabola("snowman-body-bottom","y ≥ −3.4 + 0.35x²",.35,0,-3.4,"above"),
        parabola("snowman-body-top","y ≤ 0.8 − 0.35x²",-.35,0,.8,"below")
      ]),
      part("snowman-head","Snowman face","#f0ece0",[
        parabola("snowman-head-bottom","y ≥ 1 + 0.85x²",.85,0,1,"above"),
        parabola("snowman-head-top","y ≤ 3.35 − 0.75x²",-.75,0,3.35,"below")
      ])
    ],[
      C("snowman-button-a",1,0,-.75,.14,"#496b77"),
      C("snowman-button-b",1,0,-1.63,.14,"#496b77"),
      C("snowman-button-c",1,0,-2.38,.14,"#496b77"),
      Q("snowman-arm-a",1,-1.72,-.6,-2.95,.1,-3.1,.48,"#887565",.13),
      Q("snowman-arm-b",1,1.72,-.6,2.95,.1,3.1,.48,"#887565",.13),
      C("snowman-eye-a",2,-.4,2.5,.10,"#425867"),
      C("snowman-eye-b",2,.4,2.5,.10,"#425867"),
      E("snowman-carrot",2,0,2.14,.2,.12,"#e3a16b"),
      Q("snowman-smile",2,-.44,1.84,0,1.53,.44,1.84,"#6e6475",.07),
      Q("snowman-scarf",2,-1.05,.99,0,.70,1.1,.99,"#b8738c",.21),
      S("snowman-flake-a",3,-3.9,3.65,.23,"#ccdfe9","#678ca0"),
      S("snowman-flake-b",3,3.84,2.98,.28,"#ccdfe9","#678ca0"),
      C("snowman-dust",3,-3.15,-2.3,.12,"#8aaabb")
    ]),
  art("quick-curve-jellyfish","Friendly Jellyfish","Under the Waves",
    "A curved bell and a trailing region bring a smiling sea creature to life.",
    "Above/below simple parabolas · intersecting curved regions",[
      part("jelly-bell","Lavender bell","#a7a0d5",[
        parabola("jelly-upper","y ≤ 3.55 − 0.34x²",-.34,0,3.55,"below"),
        q("jelly-rim","y ≥ 1",[1],"above")
      ]),
      part("jelly-trail","Teal tentacle veil","#8bc8ce",[
        parabola("jelly-trail-bottom","y ≥ −3.3 + 0.27x²",.27,0,-3.3,"above"),
        q("jelly-trail-top","y ≤ 1",[1],"below"),
        vertical("jelly-trail-left","x ≥ −1.7",-1.7,"right"),
        vertical("jelly-trail-right","x ≤ 1.7",1.7,"left")
      ])
    ],[
      E("jelly-spot-a",1,-1.14,2.0,.3,.17,"#ddd8ef"),
      E("jelly-spot-b",1,1.14,2.0,.3,.17,"#ddd8ef"),
      C("jelly-eye-a",1,-.46,1.77,.11,"#554963"),
      C("jelly-eye-b",1,.46,1.77,.11,"#554963"),
      Q("jelly-smile",1,-.3,1.46,0,1.3,.3,1.46,"#665472",.065),
      Q("jelly-tentacle-a",2,-1.15,-2.2,-1.56,-3.1,-1.30,-3.75,"#518da3",.10),
      Q("jelly-tentacle-b",2,0,-2.25,.44,-3.2,0,-3.85,"#518da3",.10),
      Q("jelly-tentacle-c",2,1.15,-2.2,1.50,-3.0,1.33,-3.75,"#518da3",.10),
      E("jelly-glimmer",2,-.85,.08,.18,.47,"#d5eef0"),
      S("jelly-seastar",3,-3.72,-2.85,.27,"#e2ba78"),
      C("jelly-bubble-a",3,3.22,2.73,.17,"#95cbd8"),
      C("jelly-bubble-b",3,3.57,3.44,.12,"#95cbd8"),
      C("jelly-bubble-c",3,-3.23,-.95,.10,"#8bbac6")
    ])
]);
