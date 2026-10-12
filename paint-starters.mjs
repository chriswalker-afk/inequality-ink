// Four short two-, three- and four-colour Paint by Inequalities pictures.
// S is an actively paintable sky/background square; every other key is a
// genuine colour choice. Starter rows can need only one inequality.
const sky=(hex)=>({name:"Sky",hex});
const make=({id,name,clue,description,step,grid,colours,base,edge,detailStages,details})=>{
 const width=grid[0].length,background=colours.S.hex;
 return {
  id,name,clue,description,progression:{paint:step},
  family:"full",levels:["paint"],
  window:{min:-Math.floor(width/2),max:Math.ceil(width/2)},
  height:grid.length+2,
  rows:grid.map(()=>[0,width-1]),
  palette:{base,edge},
  background:{base:background,light:"#f7fbff",shade:"#d4e4ed",sparkle:"#fff6df"},
  paint:{backgroundId:"S",colours,grid},detailStages,details
 };
};
export const PAINT_STARTERS=Object.freeze([
 make({
  id:"paint-heart-starter",name:"Little Heart",clue:"Sweet Heart",
  description:"Six short rows and two colours make a lovely little heart.",
  step:1,base:"#ee8aa7",edge:"#b95e82",
  colours:{S:sky("#f5eaf4"),R:{name:"Berry pink",hex:"#f08caa"}},
  grid:[
   "SSRRRRSS",
   "SRRRRRRS",
   "RRRRRRRR",
   "SRRRRRRS",
   "SSRRRRSS",
   "SSSRRSSS"
  ],
  detailStages:["twinkle","shine"],
  details:[[2,1,"#ffe3ec","twinkle"],[3,2,"#ffd4e5","twinkle"],
   [3,5,"#fff1f5","shine"]]
 }),
 make({
  id:"paint-star-step",name:"Sunny Star",clue:"Star Splash",
  description:"Eight rows, two colours and one bright star.",
  step:2,base:"#f5c86a",edge:"#d99a50",
  colours:{S:sky("#e8effa"),Y:{name:"Star yellow",hex:"#f8d16b"}},
  grid:[
   "SSSYYSSS",
   "SSYYYYSS",
   "YYYYYYYY",
   "SYYYYYYS",
   "SSYYYYSS",
   "SYYYYYYS",
   "SSYYYYSS",
   "SSSYYSSS"
  ],
  detailStages:["glitter","glow"],
  details:[[3,1,"#fff5c6","glitter"],[2,3,"#ffed9a","glitter"],
   [3,5,"#fff8df","glow"]]
 }),
 make({
  id:"paint-daisy-building",name:"Little Daisy",clue:"Daisy Days",
  description:"Ten rows introduce three distinct paintable colours.",
  step:3,base:"#ef9dbd",edge:"#98657c",
  colours:{
   S:sky("#e6f1e3"),
   P:{name:"Petal pink",hex:"#f1a4ca"},
   G:{name:"Stem green",hex:"#76b88f"}
  },
  grid:[
   "SSSSPPSSSS",
   "SSSPPPPSSS",
   "SSPPPPPPSS",
   "SPPPPPPPPS",
   "SSSPPPPSSS",
   "SSSSGGSSSS",
   "SSSSGGSSSS",
   "SSGGGGGGSS",
   "SSSSGGSSSS",
   "SSSSGGSSSS"
  ],
  detailStages:["petals","centre","leaves"],
  details:[[4,2,"#ffe1ed","petals"],[3,3,"#ffd4e5","petals"],
   [4,4,"#ffe68a","centre"],[4,8,"#cef0bd","leaves"]]
 }),
 make({
  id:"paint-rocket-challenge",name:"Little Rocket",clue:"Ready for Launch",
  description:"Twelve rows use four paintable colours before the big finale.",
  step:4,base:"#79b4d7",edge:"#486f92",
  colours:{
   S:sky("#e3edf8"),
   R:{name:"Rocket coral",hex:"#f1878b"},
   B:{name:"Rocket blue",hex:"#82b7df"},
   O:{name:"Flame orange",hex:"#f7ac68"}
  },
  grid:[
   "SSSSRRSSSS",
   "SSSRRRRSSS",
   "SSSRRRRSSS",
   "SSSBBBBSSS",
   "SSSBBBBSSS",
   "SSSBBBBSSS",
   "SSSBBBBSSS",
   "SSSBBBBSSS",
   "SSRRRRRRSS",
   "SSRRRRRRSS",
   "SSSOOOOSSS",
   "SSSSOOSSSS"
  ],
  detailStages:["cockpit","fins","flames"],
  details:[[4,2,"#ffe3d8","cockpit"],[3,5,"#f1faff","cockpit"],
   [3,9,"#f7b5b9","fins"],[4,11,"#ffe4b5","flames"],
   [4,12,"#fff1ca","flames"]]
 })
]);
