// Five ORIGINAL Mixed Challenge pictures, authored only for Mixed Challenge.
// Each artwork deliberately combines three different mathematical tasks:
// mirror-mode one-sided rays, full-picture bounded intervals, and algebraic
// Solve & Paint questions. The pure question engine rotates those tasks on
// rows 0/1/2/3; six rows already include all three and longer pictures repeat
// the complete cycle. Do not reuse Full Picture or Solve & Paint artwork here.
//
// For a full-width mirrored ray, each occupied row MUST be symmetric about
// the central column. Its pixels must also form one connected interval.
const makeMixed=({id,name,clue,description,step,width,rows,base,edge,
  bands=[],background,detailStages,details})=>Object.freeze({
  id,name,clue,description,
  family:"full",levels:["mixed"],progression:{mixed:step},
  window:{min:-width/2,max:width/2},
  // An open ray or strict bounded endpoint may sit one unit off the image.
  axis:{min:-width/2-1,max:width/2+1},
  height:rows.length+2,rows,
  palette:{base,edge,bands},
  background,detailStages,details
});

const sky=(base,light,shade,sparkle="#fff7d9")=>
  ({base,light,shade,sparkle});

export const MIXED_PICTURES=Object.freeze([
  makeMixed({
    id:"mixed-shield-starter",
    name:"Little Shield",clue:"Pocket Guardian",
    description:"Six rows combine mirrored rays, bounded intervals and algebra.",
    step:1,width:8,
    rows:[
      [2,5],[1,6],[0,7],[0,7],[1,6],[3,4]
    ],
    base:"#7396c9",edge:"#364d76",
    bands:[{from:1,to:2,fill:"#6f90be"},{from:5,to:6,fill:"#9eb8e0"}],
    background:sky("#e8eef9","#f5f8ff","#d9e5f5"),
    detailStages:["crest","shine"],
    details:[
      [3,2,"#f7d475","crest"],[3,4,"#f2c45f","crest"],
      [2,3,"#dee8f8","shine"],[2,4,"#bed9e7","shine"],
      [3,5,"#fceab6","shine"],[3,6,"#f1da9b","shine"]
    ]
  }),
  makeMixed({
    id:"mixed-saucer-step",
    name:"Flying Saucer",clue:"Visitor from Above",
    description:"Eight rows reveal a visitor powered by all three skills.",
    step:2,width:10,
    rows:[
      [4,5],[3,6],[2,7],[0,9],[0,9],[1,8],[3,6],[4,5]
    ],
    base:"#77b9b3",edge:"#355e76",
    bands:[
      {from:1,to:2,fill:"#7ea7ca"},
      {from:3,to:5,fill:"#6c9fab"},
      {from:6,to:8,fill:"#a0d4cc"}
    ],
    background:sky("#e5e6f6","#f7f6ff","#d4d9ed"),
    detailStages:["cockpit","lights","beam"],
    details:[
      [4,8,"#fff0b4","cockpit"],[4,7,"#426a7b","cockpit"],
      [3,6,"#d9f5ec","cockpit"],[2,5,"#f7d27e","lights"],
      [4,5,"#fff1c9","lights"],[1,4,"#ffe6a0","lights"],
      [3,4,"#efbe76","lights"],[3,3,"#bdd9f2","beam"],
      [4,2,"#e3edf9","beam"],[4,1,"#b2d6f2","beam"]
    ]
  }),
  makeMixed({
    id:"mixed-hourglass-building",
    name:"Golden Hourglass",clue:"Against the Clock",
    description:"Ten questions sculpt an hourglass as inequalities become trickier.",
    step:3,width:12,
    rows:[
      [1,10],[2,9],[3,8],[4,7],[5,6],
      [5,6],[4,7],[3,8],[2,9],[1,10]
    ],
    base:"#d6a469",edge:"#826279",
    bands:[
      {from:1,to:2,fill:"#9b7591"},
      {from:3,to:5,fill:"#e5bd79"},
      {from:6,to:9,fill:"#a8ced0"},
      {from:10,to:10,fill:"#9b7591"}
    ],
    background:sky("#e5f1e9","#f5fcf4","#d4e9db"),
    detailStages:["frame","glass","sand"],
    details:[
      [2,10,"#eadc9a","frame"],[3,10,"#efe2b0","frame"],
      [2,1,"#d8c899","frame"],[3,1,"#f1dd9f","frame"],
      [3,9,"#e2f5ef","glass"],[4,8,"#f5faf2","glass"],
      [4,7,"#e5f9ee","glass"],[5,6,"#f5d176","sand"],
      [5,5,"#eab64c","sand"],[4,3,"#f8d581","sand"],
      [3,2,"#f0c765","sand"]
    ]
  }),
  makeMixed({
    id:"mixed-butterfly-challenge",
    name:"Butterfly",clue:"Flutter By",
    description:"Twelve questions blend reflected rays, intervals and algebra.",
    step:4,width:14,
    rows:[
      [6,7],[4,9],[2,11],[0,13],[1,12],[3,10],
      [5,8],[5,8],[2,11],[1,12],[3,10],[6,7]
    ],
    base:"#c68cba",edge:"#664e83",
    bands:[
      {from:1,to:5,fill:"#91b7d4"},
      {from:6,to:8,fill:"#80689a"},
      {from:9,to:12,fill:"#e7a5c3"}
    ],
    background:sky("#e8f1df","#f7fcef","#d8e8cd"),
    detailStages:["antennae","upper-wings","lower-wings","body"],
    details:[
      [6,12,"#513f6a","antennae"],[6,11,"#674d79","antennae"],
      [2,9,"#f5d384","upper-wings"],[3,10,"#ffe1a6","upper-wings"],
      [4,11,"#f6d6ee","upper-wings"],[5,8,"#ae69aa","upper-wings"],
      [2,3,"#fff0af","lower-wings"],[3,4,"#f7ddaa","lower-wings"],
      [5,5,"#dde7f7","lower-wings"],[5,7,"#b9dbde","lower-wings"],
      [6,9,"#453b62","body"],[6,7,"#514268","body"],
      [6,5,"#46385f","body"],[6,3,"#5b4168","body"],
      [6,1,"#6b507a","body"]
    ]
  }),
  makeMixed({
    id:"mixed-dragon-finale",
    name:"Dragon Guardian",clue:"Here Be Dragons",
    description:"Fourteen mixed questions awaken a colourful dragon face.",
    step:5,width:16,
    rows:[
      [6,9],[4,11],[3,12],[2,13],[1,14],[0,15],[0,15],
      [1,14],[2,13],[3,12],[4,11],[4,11],[5,10],[6,9]
    ],
    base:"#62aa9a",edge:"#265d69",
    bands:[
      {from:1,to:3,fill:"#7dc0a3"},
      {from:8,to:11,fill:"#4b9e91"},
      {from:12,to:14,fill:"#428a80"}
    ],
    background:sky("#e4e9f6","#f6f8ff","#d7e2f2"),
    detailStages:["horns","eyes","scales","snout","sparkles"],
    details:[
      [6,14,"#f9dfab","horns"],[5,13,"#f6db9c","horns"],
      [4,12,"#d5be86","horns"],[4,11,"#f1c784","horns"],
      [4,10,"#283b57","eyes"],[5,10,"#f3d980","eyes"],
      [4,9,"#31506c","eyes"],[5,9,"#2a3d57","eyes"],
      [2,8,"#b7dfc6","scales"],[3,7,"#a5d7bd","scales"],
      [4,6,"#b9e1c8","scales"],[4,5,"#f4d08e","scales"],
      [5,4,"#a4d2b2","scales"],
      [6,3,"#2b5963","snout"],[6,2,"#35586a","snout"],
      [6,1,"#f3d79f","snout"],
      [3,8,"#e5c983","sparkles"],[4,8,"#f4e1a1","sparkles"],
      [5,7,"#d0e8cd","sparkles"]
    ]
  })
]);
