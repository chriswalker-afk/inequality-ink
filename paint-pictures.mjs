// Self-contained, authorable multi-colour pictures for Paint by Inequalities.
// Each character is ONE labelled integer square (10 columns, 14 questions).
// S is background. Coloured objects are revealed as pupils paint each row.
// The existing picture renderer, full-screen reveal and save system are reused.
const sky={name:"Sky",hex:"#dceaf8"};
const deepSky={name:"Sky",hex:"#e2eaf5"};
const gardenSky={name:"Sky",hex:"#e5f1e3"};

const definitions=[
 {
  id:"paint-rocket",name:"Rainbow Rocket",clue:"To the Moon",
  description:"Paint a spacecraft and its launch flames, one row at a time.",
  family:"full",levels:["paint"],window:{min:-5,max:5},height:16,
  rows:Array.from({length:14},()=>[0,9]),
  palette:{base:"#73b2d8",edge:"#34546b"},
  background:{base:sky.hex,light:"#f0f7fe",shade:"#cbdff3",sparkle:"#fff9c8"},
  paint:{
   backgroundId:"S",
   colours:{
    S:sky,
    R:{name:"Coral red",hex:"#e96c70"},
    B:{name:"Ocean blue",hex:"#68aed8"},
    Y:{name:"Sunflower yellow",hex:"#ffe091"},
    O:{name:"Flame orange",hex:"#ffa95d"}
   },
   grid:[
    "SSSSRRSSSS","SSSRRRRSSS","SSSRRRRSSS","SSSBBBBSSS",
    "SSSBBBBSSS","SSSBBBBSSS","SSSBBYYSSS","SSSBBBBSSS",
    "SSSBBBBSSS","SSRRRRRRSS","SSRRRRRRSS","SSSOOOOSSS",
    "SSSOOOOSSS","SSSSOOSSSS"
   ]
  },
  detailStages:["shine","portholes","thrusters"],
  details:[
   [4,2,"#ffd4cc","shine"],[3,3,"#fff0e4","shine"],
   [4,5,"#e5f7ff","portholes"],[4,8,"#d7f5ff","portholes"],
   [3,10,"#ffbab8","thrusters"],[4,12,"#ffe8a6","thrusters"],
   [4,13,"#fff5b9","thrusters"]
  ]
 },
 {
  id:"paint-flower",name:"Blooming Garden",clue:"Petal Parade",
  description:"Grow a bright flower in a little clay pot.",
  family:"full",levels:["paint"],window:{min:-5,max:5},height:16,
  rows:Array.from({length:14},()=>[0,9]),
  palette:{base:"#f4b0cc",edge:"#996071"},
  background:{base:gardenSky.hex,light:"#eff9eb",shade:"#cfe5c8",sparkle:"#fff8ba"},
  paint:{
   backgroundId:"S",
   colours:{
    S:gardenSky,
    P:{name:"Petal pink",hex:"#f1a0c1"},
    Y:{name:"Golden yellow",hex:"#ffd76e"},
    G:{name:"Leaf green",hex:"#6cb88c"},
    C:{name:"Terracotta",hex:"#cf916c"}
   },
   grid:[
    "SSSSPPSSSS","SSSPPPPSSS","SSPPPPPPSS","SSPPPPPPSS",
    "SSSPYYYSSS","SSSPPPPSSS","SSSSGGSSSS","SSSSGGSSSS",
    "SSGGGGGSSS","SSSGGGGGSS","SSSSGGSSSS","SSSCCCCSSS",
    "SSCCCCCCSS","SSSCCCCSSS"
   ]
  },
  detailStages:["petals","centre","leaves","pot"],
  details:[
   [4,1,"#ffe7f4","petals"],[3,3,"#ffd9e6","petals"],
   [4,4,"#fff1b2","centre"],[4,5,"#ffe9c1","centre"],
   [4,7,"#b9e7b9","leaves"],[3,9,"#d0efaa","leaves"],
   [4,12,"#f8c6a1","pot"],[3,13,"#f6c4a0","pot"]
  ]
 },
 {
  id:"paint-robot",name:"Friendly Robot",clue:"Beep Beep Buddy",
  description:"Assemble a colourful, friendly little robot.",
  family:"full",levels:["paint"],window:{min:-5,max:5},height:16,
  rows:Array.from({length:14},()=>[0,9]),
  palette:{base:"#7a9aa8",edge:"#425268"},
  background:{base:deepSky.hex,light:"#f2f5ff",shade:"#d1daee",sparkle:"#fff9d8"},
  paint:{
   backgroundId:"S",
   colours:{
    S:deepSky,
    G:{name:"Circuit green",hex:"#77bf9b"},
    M:{name:"Steel grey",hex:"#839db1"},
    Y:{name:"Visor gold",hex:"#f4ce76"},
    B:{name:"Robot blue",hex:"#76abd7"}
   },
   grid:[
    "SSSSGGSSSS","SSSSGGSSSS","SSMMMMMMSS","SSMMMMMMSS",
    "SSYYYYYYSS","SSMMMMMMSS","SSMMMMMMSS","SSBBBBBBSS",
    "SSBBBBBBSS","SSBBGGGGSS","SSBBBBBBSS","SSMMMMMMSS",
    "SSMMMMMMSS","SSMMMMMMSS"
   ]
  },
  detailStages:["antenna","eyes","buttons","feet"],
  details:[
   [4,1,"#e9fcea","antenna"],[4,3,"#b4cfdc","antenna"],
   [3,5,"#334d68","eyes"],[4,5,"#334d68","eyes"],
   [3,8,"#f7ece6","buttons"],[4,9,"#e7f6ff","buttons"],
   [3,11,"#b5d0dc","feet"],[4,13,"#c4d5d9","feet"]
  ]
 }
];
export const PAINT_PICTURES=Object.freeze(definitions);
