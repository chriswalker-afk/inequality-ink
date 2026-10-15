import {PAINT_PICTURES} from "./paint-pictures.mjs";
import {STARTER_PICTURES} from "./starter-pictures.mjs";
import {STUDENT_BONUS_PICTURES} from "./student-bonus-pictures.mjs";
import {MIXED_PICTURES} from "./mixed-pictures.mjs";
import {PAINT_STARTERS} from "./paint-starters.mjs";
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
  ...STARTER_PICTURES,
  ...STUDENT_BONUS_PICTURES,
  // Mixed Challenge now has a completely independent five-picture journey.
  // Existing Full/Solve artworks still support Mixed as preserved bonus art.
  ...MIXED_PICTURES,
  {
    id:"cat-cameo",name:"Cat Cameo",clue:"Whisker Wink",
    progression:{mirror:5},
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
    id:"heart-glow",name:"Heart Glow",clue:"Full of Feeling",
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
    id:"mushroom-mystery",name:"Mushroom Mystery",clue:"Woodland Wonder",
    progression:{full:5},
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
    id:"rocket-launch",name:"Rocket Launch",clue:"Blast Off",
    progression:{solve:5},
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
  },

  // MIRROR MODE · single genuine one-sided inequalities
  {
    id:"coral-crab",name:"Coral Crab",clue:"Seaside Sidestep",
    description:"A colourful seaside creature awaits the final reveal.",
    family:"half",levels:["mirror"],window:{min:-5,max:5},height:16,
    rows:[
      [8,9],[7,9],[6,9],[0,9],[0,9],[0,8],[0,8],
      [0,8],[0,8],[0,7],[0,8],[0,9],[6,9],[7,9]
    ],
    firstStrict:[true,false,true,false,true,false,true,false,true,true,false,false,true,false],
    fullRayDirection:{4:"right",5:"left",12:"right"},
    palette:{base:"#ef877f",edge:"#8b4059",bands:[
      {from:1,to:3,fill:"#ef997f"},{from:4,to:9,fill:"#e87875"},
      {from:10,to:12,fill:"#d95e72"},{from:13,to:14,fill:"#efa178"}
    ]},
    background:{base:"#dceff4",light:"#effaff",shade:"#c7e6eb",sparkle:"#fff7d3"},
    detailStages:["claws","shell","eyes","face","feet"],
    details:[
      [0,1,"#ffe1ba","claws"],[1,2,"#ffd3aa","claws"],
      [2,3,"#f5b19b","claws"],[3,4,"#fca29a","claws"],
      [4,6,"#ffc3a5","shell"],[5,7,"#ffa6a0","shell"],
      [3,8,"#ffd1b3","shell"],[6,9,"#eaa19a","shell"],
      [4,11,"#ffa49b","shell"],[3,12,"#f8b39f","shell"],
      [6,6,"#302e49","eyes"],[7,6,"#fff4e8","eyes"],
      [6,7,"#302e49","eyes"],[7,7,"#4b354f","eyes"],
      [5,9,"#f8a8b0","face"],[5,10,"#f8acb1","face"],
      [7,10,"#944e66","face",0.35],[8,10,"#944e66","face",0.38],
      [8,11,"#944e66","face",0.3],
      [1,13,"#ffc8a2","feet"],[2,14,"#ffd1a9","feet"]
    ]
  },
  {
    id:"twilight-owl",name:"Twilight Owl",clue:"Night Watch",
    description:"A wide-eyed nocturnal character awaits.",
    family:"half",levels:["mirror"],window:{min:-4,max:5},height:16,
    rows:[
      [7,8],[6,8],[5,8],[0,8],[0,8],[0,8],[0,7],
      [0,7],[0,7],[0,7],[0,6],[0,6],[6,8],[7,8]
    ],
    firstStrict:[true,false,true,false,true,false,true,false,true,false,true,false,true,false],
    fullRayDirection:{4:"right",5:"left",6:"right"},
    palette:{base:"#c68f65",edge:"#614b55",bands:[
      {from:1,to:3,fill:"#bd8266"},{from:4,to:9,fill:"#c99471"},
      {from:10,to:12,fill:"#e1c49a"},{from:13,to:14,fill:"#d2a371"}
    ]},
    background:{base:"#e1e9f7",light:"#f2f6ff",shade:"#cad9ee",sparkle:"#fff4ca"},
    detailStages:["tufts","eyes","beak","wings","feet"],
    details:[
      [0,2,"#f1c092","tufts"],[1,3,"#f3cea2","tufts"],
      [4,6,"#fff3d9","eyes"],[5,6,"#fff3d9","eyes"],
      [6,6,"#354358","eyes"],[4,7,"#fff3d9","eyes"],
      [5,7,"#30364c","eyes"],[6,7,"#fff8ec","eyes"],
      [8,8,"#f1ac57","beak"],[8,9,"#db8350","beak"],
      [7,9,"#ffcd7a","beak"],
      [2,9,"#9d725e","wings"],[3,10,"#b78465","wings"],
      [4,11,"#f2d6a7","wings"],[5,12,"#f7dfb3","wings"],
      [1,13,"#efb55a","feet"],[0,14,"#e8aa55","feet"]
    ]
  },

  // FULL PICTURE · one bounded interval per row; also compatible with
  // Solve & Paint and Mixed Challenge via horizontal symmetry.
  {
    id:"flower-pot",name:"Blooming Flower",clue:"In Full Bloom",
    description:"A tiny garden blooms as the rows rise.",
    family:"full",levels:["full","solve","mixed"],
    window:{min:-8,max:8},axis:{min:-9,max:8},height:16,
    rows:[
      [7,8],[5,10],[3,12],[2,13],[3,12],[5,10],[7,8],
      [5,10],[7,8],[6,9],[4,11],[5,10],[5,10],[6,9]
    ],
    palette:{base:"#cc8a67",edge:"#55495d",bands:[
      {from:1,to:3,fill:"#f4a3c0"},{from:4,to:6,fill:"#e88db4"},
      {from:7,to:9,fill:"#71b68c"},{from:10,to:14,fill:"#d39370"}
    ]},
    background:{base:"#e4f2df",light:"#f5fae8",shade:"#cee7cd",sparkle:"#fff7cb"},
    detailStages:["petals","centre","leaves","pot"],
    details:[
      [7,1,"#ffe2ed","petals"],[6,2,"#ffd8e6","petals"],
      [4,4,"#f9bbd4","petals"],[5,5,"#ffd3e2","petals"],
      [7,3,"#ffda6d","centre"],[6,4,"#ffeb9c","centre"],
      [7,4,"#ffc75b","centre"],[7,5,"#f4c360","centre"],
      [5,8,"#3f936b","leaves"],[6,8,"#a5d6a4","leaves"],
      [7,9,"#4b9874","leaves"],
      [6,10,"#a75f56","pot"],[4,11,"#ffe1b0","pot"],
      [5,11,"#fac99a","pot"],[6,12,"#a65d4b","pot"],
      [6,13,"#edb48b","pot"],[7,14,"#b77557","pot"]
    ]
  },
  {
    id:"enchanted-potion",name:"Enchanted Potion",clue:"Bubbling Brew",
    // Former Mixed finale stays playable as a bonus with its existing save.
    description:"A sparkling magical object appears at the end.",
    family:"full",levels:["full","solve","mixed"],
    window:{min:-8,max:8},axis:{min:-9,max:8},height:16,
    rows:[
      [7,8],[6,9],[6,9],[6,9],[5,10],[3,12],[2,13],
      [1,14],[1,14],[1,14],[2,13],[3,12],[4,11],[5,10]
    ],
    palette:{base:"#8ccfda",edge:"#3c5475",bands:[
      {from:1,to:3,fill:"#b988a7"},{from:4,to:6,fill:"#83c7d5"},
      {from:7,to:11,fill:"#af81d0"},{from:12,to:14,fill:"#8bcfc8"}
    ]},
    background:{base:"#e8e1f6",light:"#f8f5ff",shade:"#d4caed",sparkle:"#fff6cf"},
    detailStages:["stopper","glass","bubbles","magic"],
    details:[
      [7,1,"#f5c7a0","stopper"],[6,2,"#f0bf98","stopper"],
      [7,3,"#d3a7be","stopper"],
      [5,6,"#e3f9ff","glass"],[3,8,"#bdf1fb","glass"],
      [2,9,"#c5eff6","glass"],[4,10,"#d9f9fb","glass"],
      [6,7,"#fce9fa","bubbles"],[5,9,"#ffdcfa","bubbles"],
      [7,9,"#f8f0ff","bubbles"],[4,11,"#e9c7ff","bubbles"],
      [6,11,"#f5dbff","bubbles"],
      [7,8,"#ffe1f1","magic"],[6,10,"#ffd4f1","magic"],
      [7,12,"#fff0cb","magic"]
    ]
  },
  {
    id:"ice-cream-treat",name:"Ice Cream Treat",clue:"Sweet Scoop",
    description:"A colourful sweet treat is revealed piece by piece.",
    family:"full",levels:["full","solve","mixed"],
    window:{min:-8,max:8},axis:{min:-9,max:8},height:16,
    rows:[
      [7,8],[5,10],[4,11],[3,12],[2,13],[2,13],[3,12],
      [4,11],[5,10],[5,10],[6,9],[6,9],[7,8],[7,8]
    ],
    palette:{base:"#eab978",edge:"#705468",bands:[
      {from:1,to:1,fill:"#e57188"},{from:2,to:3,fill:"#f9e1ef"},
      {from:4,to:8,fill:"#f4b9d1"},{from:9,to:14,fill:"#e9b878"}
    ]},
    background:{base:"#fce9db",light:"#fff7ef",shade:"#f4dac9",sparkle:"#fffdef"},
    detailStages:["cherry","sauce","sprinkles","waffle"],
    details:[
      [7,1,"#fd9c9c","cherry"],[6,2,"#e86b85","cherry"],
      [5,4,"#a56b84","sauce"],[3,5,"#9c637c","sauce"],
      [4,6,"#b07187","sauce"],[5,7,"#aa6880","sauce"],
      [7,3,"#e8a1b4","sprinkles"],[6,4,"#fff4bb","sprinkles"],
      [5,5,"#8ed5c8","sprinkles"],[7,6,"#ffe1f4","sprinkles"],
      [6,7,"#8ed0c9","sprinkles"],[7,8,"#fff6c4","sprinkles"],
      [6,10,"#a66e54","waffle"],[7,10,"#fcdba1","waffle"],
      [6,11,"#a66e54","waffle"],[7,12,"#e2a35f","waffle"],
      [7,13,"#aa7655","waffle"],[7,14,"#e2a35f","waffle"]
    ]
  }
,
  ...PAINT_PICTURES,
  ...PAINT_STARTERS
]);
