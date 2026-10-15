// Optional original pixel-art pictures inspired by student feedback.
// One additional same-level picture per mode. These have NEW stable IDs:
// existing artwork, stage progression, saved work and score keys are untouched.
const sky=(base,light,shade)=>({base,light,shade,sparkle:"#fff6d8"});
const bonus=({id,name,clue,description,levels,width,rows,step,base,edge,bands=[],
  background,detailStages,details,paint})=>Object.freeze({
  id,name,clue,description,levels,
  family:levels.includes("mirror")?"half":"full",
  window:{min:-Math.floor(width/2),max:Math.ceil(width/2)},
  axis:levels.includes("mixed")?{min:-width/2-1,max:width/2+1}:undefined,
  height:rows.length+2,rows,
  legacyMathStage:Object.fromEntries(levels.map(mode=>[mode,step])),
  palette:{base,edge,bands},background,detailStages,details,paint
});
export const STUDENT_BONUS_PICTURES=Object.freeze([
  bonus({
    id:"mirror-evergreen-bonus",name:"Little Evergreen",clue:"Forest Sparkle",
    description:"Eight rays reveal a decorated tree with a small trunk.",
    levels:["mirror"],step:2,width:7,
    rows:[[0,0],[0,1],[0,2],[0,3],[0,4],[0,6],[0,1],[0,1]],
    base:"#67b88b",edge:"#347b69",
    bands:[{from:7,to:8,fill:"#ab8165"}],
    background:sky("#deecf6","#f1f9ff","#c9dfee"),
    detailStages:["baubles","star","trunk"],
    details:[
      [8,3,"#f9d07b","baubles"],[9,5,"#e992ad","baubles"],
      [7,1,"#fff4c6","star"],[7,7,"#c99b76","trunk"]
    ]
  }),
  bonus({
    id:"full-sailboat-bonus",name:"Sailboat",clue:"Across the Bay",
    description:"Eight bounded intervals reveal a sailboat on the waves.",
    levels:["full"],step:2,width:10,
    rows:[[4,5],[3,6],[2,7],[1,8],[3,6],[0,9],[1,8],[3,6]],
    base:"#b3d8df",edge:"#538caa",
    bands:[{from:6,to:8,fill:"#d49d7b"}],
    background:sky("#d8eff7","#f4fbff","#c2e3ed"),
    detailStages:["mast","sail","hull"],
    details:[
      [4,2,"#fff8de","mast"],[3,3,"#f3f8e7","sail"],
      [2,4,"#e8f9ef","sail"],[3,7,"#a96e61","hull"]
    ]
  }),
  bonus({
    id:"solve-balloon-bonus",name:"Hot Air Balloon",clue:"Up and Away",
    description:"Ten algebraic inequalities form a balloon and basket.",
    levels:["solve"],step:3,width:10,
    rows:[[4,5],[2,7],[1,8],[0,9],[0,9],[1,8],[2,7],[4,5],[3,6],[3,6]],
    base:"#e99896",edge:"#a95e82",
    bands:[{from:9,to:10,fill:"#c59473"}],
    background:sky("#e5eafa","#f7f7ff","#d4def4"),
    detailStages:["panels","ropes","basket"],
    details:[
      [3,3,"#ffe8a4","panels"],[2,5,"#f5c8a4","panels"],
      [4,8,"#755d61","ropes"],[3,9,"#9e6e5a","basket"],
      [4,10,"#efd0a1","basket"]
    ]
  }),
  bonus({
    id:"mixed-crystal-bonus",name:"Prism Crystal",clue:"Hidden Treasure",
    description:"Eight original three-skill questions build a glowing gem.",
    levels:["mixed"],step:2,width:10,
    rows:[[3,6],[2,7],[1,8],[0,9],[0,9],[1,8],[2,7],[3,6]],
    base:"#9bd8d9",edge:"#427b97",
    bands:[{from:4,to:5,fill:"#73bdcd"}],
    background:sky("#e6e6f9","#f8f7ff","#d8dbf1"),
    detailStages:["facets","shine"],
    details:[
      [4,2,"#e7ffff","facets"],[3,4,"#caf7f1","facets"],
      [4,6,"#d0f2fa","facets"],[4,8,"#fffbe1","shine"]
    ]
  }),
  bonus({
    id:"paint-kite-bonus",name:"Rainbow Kite",clue:"Colours Aloft",
    description:"Ten rows and three colours paint a diamond kite.",
    levels:["paint"],step:3,width:10,
    rows:Array.from({length:10},()=>[0,9]),
    base:"#eaa1ba",edge:"#a2658c",
    background:sky("#e1eff8","#f7fbff","#c9e5f2"),
    paint:{
      backgroundId:"S",
      colours:{
        S:{name:"Sky blue",hex:"#e1eff8"},
        P:{name:"Coral pink",hex:"#e995b3"},
        Y:{name:"Golden yellow",hex:"#f6ce7e"}
      },
      grid:[
        "SSSSPPSSSS",
        "SSSPPPPSSS",
        "SSPPYYPPSS",
        "SPPYYYYPPS",
        "PPYYYYYYPP",
        "SPPYYYYPPS",
        "SSPPYYPPSS",
        "SSSPPPPSSS",
        "SSSSPPSSSS",
        "SSSSPPSSSS"
      ]
    },
    detailStages:["sparkles","shimmer"],
    details:[
      [3,2,"#ffe6ee","sparkles"],[3,4,"#fff1c8","sparkles"],
      [4,6,"#fbe8ba","shimmer"],[4,9,"#ffd8e5","shimmer"]
    ]
  })
]);
