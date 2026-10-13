// Small, fast-to-finish pixel pictures. Six, eight, ten and twelve genuine
// inequality questions build from bottom to top, with the final coloured
// decorations revealed only after completion. These are new IDs: legacy
// fourteen-row pictures and their saved scores are left entirely untouched.
const background=(base,light,shade)=>({
  base,light,shade,sparkle:"#fff6d5"
});
const make=({id,name,clue,description,rows,width,family,step,base,edge,
  bands=[],back,detailStages,details})=>({
  id,name,clue,description,family,
  levels:family==="half"?["mirror"]:["full","solve","mixed"],
  // Shared Full/Solve starter art remains available as legacy Mixed extras,
  // but no longer occupies any of Mixed Challenge's five ORIGINAL stages.
  progression:family==="half"?{mirror:step}:{full:step,solve:step},
  // Former Mixed core pictures stay playable as bonuses with their ORIGINAL
  // stage-specific equations and endpoint choices, even across replays.
  legacyMathStage:family==="full"?{mixed:step}:undefined,
  window:{min:-Math.floor(width/2),max:Math.ceil(width/2)},
  // Mixed-mode rays may have an OPEN endpoint just outside the painted grid.
  // The visible number line must include it without clipping the mathematics.
  axis:family==="full"?{min:-Math.floor(width/2)-1,max:Math.ceil(width/2)+1}:undefined,
  height:rows.length+2,rows,
  palette:{base,edge,bands},background:back,
  detailStages,details
});
export const STARTER_PICTURES=Object.freeze([
  make({
    id:"mirror-star-starter",name:"Little Star",clue:"Twinkle Time",
    description:"Six quick rays become one shining star.",family:"half",step:1,width:6,
    // Row arrays are top-to-bottom in SVG space. The mirrored half's
    // INNER edge is local column 0; column 5 is the outside edge.
    // Centre-anchored upper rays form the star's top point, a full
    // middle row forms its horizontal arms, and the outer-anchored
    // lower rays produce its two separated bottom points.
    rows:[[0,0],[0,1],[0,5],[0,4],[3,5],[4,5]],
    base:"#f5c45d",edge:"#d88c4d",back:background("#e5ebfa","#f5f7ff","#d4e1f5"),
    detailStages:["glimmer","shine"],
    details:[[5,1,"#fff2aa","glimmer"],[4,2,"#fff5c1","glimmer"],
      [3,3,"#ffe69a","shine"],[4,4,"#ffeba2","shine"]]
  }),
  make({
    id:"mirror-heart-step",name:"Little Heart",clue:"Heart in a Hurry",
    description:"Eight one-sided inequalities make a sweet little heart.",
    family:"half",step:2,width:8,
    rows:[[4,7],[2,7],[0,7],[0,7],[1,7],[2,7],[3,7],[4,7]],
    base:"#ee84a7",edge:"#af517a",back:background("#fae9f0","#fff6fb","#f4d9e5"),
    detailStages:["sparkles","blush"],
    details:[[2,2,"#ffdce9","sparkles"],[3,3,"#ffe9f0","sparkles"],
      [5,4,"#ffb8cf","blush"],[4,5,"#ffd5de","blush"]]
  }),
  make({
    id:"mirror-ball-building",name:"Bouncy Ball",clue:"Bounce Around",
    description:"Ten rays round out a playful ball.",
    family:"half",step:3,width:8,
    rows:[[5,7],[3,7],[2,7],[1,7],[0,7],[0,7],[1,7],[2,7],[3,7],[5,7]],
    base:"#6eb9de",edge:"#4778b6",back:background("#dff0f4","#effaff","#cde5ed"),
    detailStages:["seams","glint"],
    details:[[2,3,"#c9f3ff","seams"],[3,4,"#d6f5ff","seams"],
      [3,5,"#fbffff","glint"],[2,6,"#c1e8f9","glint"]]
  }),
  make({
    id:"mirror-flower-challenge",name:"Tiny Flower",clue:"Petal Pop",
    description:"Twelve rays bring a flower into bloom.",
    family:"half",step:4,width:9,
    rows:[[6,8],[4,8],[2,8],[1,8],[0,8],[1,8],
      [3,8],[6,8],[7,8],[7,8],[6,8],[5,8]],
    base:"#eba2c2",edge:"#a46291",
    bands:[{from:8,to:12,fill:"#70b792"}],
    back:background("#e6f1e2","#f7fff4","#d4e7d2"),
    detailStages:["petals","centre","leaves"],
    details:[[2,3,"#ffd4e5","petals"],[3,4,"#ffe4ed","petals"],
      [7,5,"#ffdf7b","centre"],[6,6,"#ffe89f","centre"],
      [1,11,"#b1e0ae","leaves"],[2,12,"#d1f0bb","leaves"]]
  }),
  make({
    id:"full-star-starter",name:"Starburst",clue:"Star in a Flash",
    description:"A star after just six bounded-inequality rows.",
    family:"full",step:1,width:8,
    rows:[[3,4],[2,5],[0,7],[1,6],[2,5],[3,4]],
    base:"#f7cb6d",edge:"#d89b54",
    back:background("#e4eaf9","#f7f9ff","#d1e0f5"),
    detailStages:["sparkles","glow"],
    details:[[2,3,"#fff0ac","sparkles"],[3,4,"#fff7d6","glow"]]
  }),
  make({
    id:"full-gift-step",name:"Gift Box",clue:"Wrapped with Wonder",
    description:"Eight intervals wrap up a colourful surprise.",
    family:"full",step:2,width:8,
    rows:[[2,5],[1,6],[1,6],[0,7],[0,7],[1,6],[1,6],[2,5]],
    base:"#e78293",edge:"#a45f81",
    bands:[{from:1,to:3,fill:"#efabb4"}],
    back:background("#e6f0f9","#f7fbff","#d4e6ef"),
    detailStages:["bow","ribbon"],
    details:[[3,1,"#fff0ca","bow"],[3,2,"#ffe5b5","bow"],
      [3,4,"#ffdf98","ribbon"],[3,6,"#ffdf98","ribbon"]]
  }),
  make({
    id:"full-ball-building",name:"Round Ball",clue:"Bouncy Business",
    description:"Ten carefully shaded intervals complete a bouncing ball.",
    family:"full",step:3,width:10,
    rows:[[4,5],[2,7],[1,8],[0,9],[0,9],[0,9],
      [0,9],[1,8],[2,7],[4,5]],
    base:"#76b6e6",edge:"#477cba",
    back:background("#e2f2f6","#f5fdff","#cce3ee"),
    detailStages:["stripes","highlights"],
    details:[[3,3,"#addafb","stripes"],[2,4,"#b7e2fe","stripes"],
      [4,5,"#ecfaff","highlights"],[3,6,"#d5efff","highlights"]]
  }),
  make({
    id:"full-flower-challenge",name:"Bright Flower",clue:"Flower Burst",
    description:"Twelve intervals grow an entire flower.",
    family:"full",step:4,width:12,
    rows:[[5,6],[3,8],[2,9],[1,10],[2,9],[3,8],
      [5,6],[4,7],[5,6],[4,7],[3,8],[4,7]],
    base:"#ef9bbb",edge:"#a85a83",
    bands:[{from:7,to:10,fill:"#6ebc8f"},{from:11,to:12,fill:"#c98f6f"}],
    back:background("#e4f0df","#f8fff3","#d1e5cd"),
    detailStages:["petals","centre","leaves","pot"],
    details:[[3,3,"#ffe0ee","petals"],[4,4,"#fff0f8","petals"],
      [5,5,"#f6cf70","centre"],[5,6,"#ffe29c","centre"],
      [5,8,"#c4e7b4","leaves"],[4,10,"#d5f1bc","leaves"],
      [4,11,"#efd0af","pot"],[4,12,"#f6dec1","pot"]]
  })
]);
