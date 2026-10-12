// Picture data lives here, separate from question generation and screen logic.
// Rows are top-to-bottom, each [firstPixel,lastPixel] inclusive. A half-picture's
// coordinates count away from the future vertical mirror axis.
// To add a picture, add one validated definition; do not edit the maths engine.
const catRows=[
  [9,9],[8,9],[7,9],[0,9],[0,9],[0,8],[0,8],
  [0,7],[0,7],[0,6],[0,6],[0,5],[0,4],[0,3]
];
const mushroomRows=[
  [6,9],[4,11],[3,12],[2,13],[1,14],[1,14],[1,14],
  [2,13],[3,12],[5,10],[5,10],[5,10],[5,10],[4,11]
];
const rocketRows=[
  [7,8],[6,9],[5,10],[5,10],[5,10],[5,10],[5,10],
  [5,10],[4,11],[3,12],[2,13],[4,11],[6,9],[7,8]
];
const heartRows=[
  [4,7],[2,7],[1,7],[0,7],[0,7],[0,6],[0,6],
  [0,5],[0,5],[0,4],[0,3],[0,2],[0,1],[0,0]
];

// Reuse the exact first-play intervals for the existing mushroom. They are
// picture metadata (not logic), so old questions and saved progress remain valid.
const mushroomInitial=[
  [-3,2,false,false,-2,1],[-4,4,true,false,2,1],
  [-6,4,false,true,2,-1],[-6,5,true,true,2,1],
  [-8,7,false,false],[-7,7,true,false],[-8,6,false,true],
  [-7,5,false,true],[-5,5,true,false],[-4,2,false,true],
  [-3,3,true,false],[-4,3,false,false],[-3,2,true,true],
  [-4,3,true,true]
].map(([lower,upper,lowerIncluded,upperIncluded,a,b])=>({
  lower,upper,lowerIncluded,upperIncluded,transform:a===undefined?null:{a,b}
}));

export const PICTURE_DEFINITIONS = Object.freeze([
  {
    id:"cat-cameo",name:"Cat Cameo",mystery:"Mystery 01",
    description:"A secret character waits until the picture is finished.",
    family:"half",levels:["mirror"],window:{min:-5,max:5},height:16,
    rows:catRows,firstStrict:[true,false,true,false,true,false,true,true,false,true,false,true,false,true],
    fullRayDirection:{4:"right",5:"left"},
    palette:{base:"#eba66d",edge:"#3b3445",bands:[
      {from:1,to:3,fill:"#eca86f"},
      {from:11,to:13,fill:"#f5bd85"}
    ]},
    background:{base:"#deebf8",light:"#f0f6fd",shade:"#d0e3f4",sparkle:"#fffaf1"},
    detailStages:["ears","eyes","face","whiskers"],
    details:[
      [1,2,"#e891a1","ears"],[1,3,"#f1a8b3","ears"],[2,3,"#e891a1","ears"],
      [6,7,"#29283c","eyes"],[7,7,"#fff6dc","eyes"],
      [6,8,"#29283c","eyes"],[7,8,"#29283c","eyes"],
      [5,9,"#f59d99","face"],[6,9,"#f6b4a6","face"],
      [7,10,"#ffe8bb","face"],[8,10,"#ffe8bb","face"],[9,10,"#e06c85","face"],
      [7,11,"#ffedc8","face"],[8,11,"#ffedc8","face"],
      [9,11,"#704958","face",0.38],[8,12,"#704958","face",0.35],
      [4,11,"#73545a","whiskers",0.22],[5,11,"#73545a","whiskers",0.22],
      [6,11,"#73545a","whiskers",0.22],[5,12,"#73545a","whiskers",0.22],
      [6,12,"#73545a","whiskers",0.22]
    ]
  },
  {
    id:"heart-glow",name:"Heart Glow",mystery:"Mystery 02",
    description:"A smaller picture with a big surprise.",
    family:"half",levels:["mirror"],window:{min:-4,max:4},height:16,
    rows:heartRows,firstStrict:[true,false,true,false,true,false,true,false,true,false,true,false,true,false],
    fullRayDirection:{4:"right",5:"left"},
    palette:{base:"#f08ba6",edge:"#9c4469",bands:[
      {from:1,to:4,fill:"#f39cba"},
      {from:12,to:14,fill:"#dc648b"}
    ]},
    background:{base:"#f5e6f8",light:"#fff0fa",shade:"#ebd3f2",sparkle:"#fffde6"},
    detailStages:["sparkles","eyes","smile"],
    details:[
      [2,3,"#ffeac0","sparkles"],[3,4,"#ffcfe0","sparkles"],
      [4,5,"#ffe9be","sparkles"],[3,6,"#ffc5d8","sparkles"],
      [6,7,"#4a3557","eyes"],[7,7,"#fff8eb","eyes"],
      [6,8,"#4a3557","eyes"],[4,9,"#f3b1c5","smile"],
      [8,10,"#8e4767","smile",0.34],[7,11,"#8e4767","smile",0.30]
    ]
  },
  {
    id:"mushroom-mystery",name:"Mushroom Mystery",mystery:"Mystery 01",
    description:"The original mystery picture with two-ended intervals.",
    family:"full",levels:["full","solve","mixed"],
    window:{min:-8,max:8},axis:{min:-9,max:8},height:16,
    rows:mushroomRows,initial:mushroomInitial,
    palette:{base:"#ed707d",edge:"#28324c",bands:[
      {from:1,to:2,fill:"#f79b94"},
      {from:7,to:8,fill:"#ca4b67"},
      {from:9,to:14,fill:"#e8c596"}
    ]},
    background:{base:"#dff0e7",light:"#eff8ee",shade:"#cfe5dc",sparkle:"#fff8dd"},
    detailStages:["spots","eyes","face"],
    details:[
      [7,3,"#fff0d8","spots"],[5,4,"#fff0d8","spots"],
      [6,4,"#fff0d8","spots"],[3,5,"#fff0d8","spots"],
      [4,5,"#fff0d8","spots"],[3,6,"#fff0d8","spots"],
      [4,6,"#fff0d8","spots"],[6,11,"#273048","eyes"],
      [5,12,"#efa2a0","face"],[7,12,"#855c55","face",0.36]
    ]
  },
  {
    id:"rocket-launch",name:"Rocket Launch",mystery:"Mystery 02",
    description:"A new picture for the same full-interval questions.",
    family:"full",levels:["full","solve","mixed"],
    window:{min:-8,max:8},axis:{min:-9,max:8},height:16,
    rows:rocketRows,
    palette:{base:"#79bac6",edge:"#2f536d",bands:[
      {from:1,to:3,fill:"#b5e1e7"},
      {from:10,to:12,fill:"#f18f86"},
      {from:13,to:14,fill:"#f8b55f"}
    ]},
    background:{base:"#dae4f3",light:"#ecf2fd",shade:"#c6d8ee",sparkle:"#fff7d0"},
    detailStages:["portholes","fins","flame"],
    details:[
      [6,5,"#2a688a","portholes"],[7,5,"#e8faff","portholes"],
      [6,6,"#70d4ed","portholes"],[7,6,"#bceffd","portholes"],
      [4,10,"#bd566f","fins"],[5,10,"#eec3b8","fins"],
      [3,11,"#bd566f","fins"],[4,11,"#eec3b8","fins"],
      [6,13,"#fce2a1","flame"],[7,13,"#fff1bc","flame"],
      [7,14,"#fff1bc","flame"]
    ]
  }
]);
