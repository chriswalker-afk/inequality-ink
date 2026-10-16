// Hand-shaped Pixel Art expansion: only fill gaps in the five-picture pools.
// Every silhouette below is authored as actual interval endpoints, not reused
// from another level's artwork. These stable IDs are independent save slots.
//
// A row [left,right] means exactly the filled pixels. The question generator
// derives its inequalities from these rows at the indicated maths tier.
const SPECS=[];
const add=(mode,tier,id,name,clue,spans,colours,options={})=>
  SPECS.push({mode,tier,id,name,clue,spans,colours,options});

// MIRROR MODE. All rows start at the fold (0); the revealed half is copied
// inward-to-outward, so bees, butterflies and robots unfold in the right way.
add("mirror",1,"honey-bee","Honey Bee","Busy Buzz",
  [[0,2],[0,4],[0,5],[0,5],[0,4],[0,2]],
  ["#f4ce73","#986946","#525e70"],{bands:[[3,4,"#536579"]],detailColors:["#fff7d9","#566274","#ffedac"]});
add("mirror",1,"pine-sapling","Pine Sapling","Little Woodland",
  [[0,0],[0,2],[0,4],[0,5],[0,1],[0,1]],
  ["#67b18d","#367a67","#98765a"],{bands:[[5,6,"#a98665"]],detailColors:["#def4d7","#ffe69c","#bfe9d4"]});
add("mirror",2,"butterfly-wings","Pixel Butterfly","Wings Away",
  [[0,1],[0,4],[0,6],[0,4],[0,1],[0,5],[0,4],[0,1]],
  ["#ae9fd3","#6a6b9f","#eda7bc"],{bands:[[6,8,"#e6a0ba"]],detailColors:["#fff0b2","#f8e1ff","#7d86bf"]});
add("mirror",3,"ladybird","Ladybird","Dotty Visitor",
  [[0,3],[0,5],[0,7],[0,7],[0,7],[0,7],[0,6],[0,5],[0,3],[0,1]],
  ["#e58e83","#a75657","#6b5c66"],{bands:[[1,2,"#685f6a"]],detailColors:["#524a59","#fff2db","#594759"]});
add("mirror",3,"jam-jar","Jam Jar","Sticky Surprise",
  [[0,4],[0,4],[0,3],[0,5],[0,6],[0,6],[0,6],[0,6],[0,5],[0,5]],
  ["#db8291","#855a70","#b999b5"],{bands:[[1,3,"#ac91ac"]],detailColors:["#ffeac0","#f2c5d7","#ffdbad"]});
add("mirror",4,"robot-helmet","Robot Helmet","Mechanical Mind",
  [[0,0],[0,0],[0,6],[0,8],[0,8],[0,8],[0,8],[0,8],[0,8],[0,7],[0,6],[0,4]],
  ["#8aacc7","#497592","#dbab84"],{bands:[[11,12,"#ceac92"]],detailColors:["#ecf9fc","#516985","#fff2c7"]});
add("mirror",4,"celebration-cupcake","Party Cupcake","Make a Wish",
  [[0,0],[0,1],[0,2],[0,4],[0,7],[0,8],[0,8],[0,7],[0,6],[0,5],[0,5],[0,4]],
  ["#e5a4bb","#a56d90","#eabf80"],{bands:[[9,12,"#e8bb84"]],detailColors:["#fff2c4","#fcdeee","#ffecd5"]});

// FULL PICTURE. One bounded interval per row, varied roof, sail, cake,
// train, tent and lighthouse silhouettes, drawn at exact integer columns.
add("full",1,"snowy-mountain","Snowy Mountain","Peak Adventure",
  [[3,4],[2,5],[2,5],[1,6],[1,6],[0,7]],
  ["#91b0ca","#536f95","#d5dde8"],{bands:[[1,2,"#f2f6f1"]],detailColors:["#ffffff","#f1f4ff","#bddadf"]});
add("full",1,"little-house","Little House","Home Sweet Home",
  [[3,4],[2,5],[1,6],[0,7],[0,7],[0,7]],
  ["#dbb48b","#9c735d","#c57973"],{bands:[[1,3,"#bd7c77"]],detailColors:["#fce6ad","#f6f0ce","#a77a72"]});
add("full",2,"paper-airplane","Paper Airplane","Ready for Flight",
  [[4,5],[3,6],[2,7],[0,9],[2,7],[3,6],[4,5],[4,5]],
  ["#a3cee0","#618db4","#e6e3d3"],{bands:[[4,6,"#e5e8dc"]],detailColors:["#ffffff","#fff2ce","#c7eeea"]});
add("full",3,"layer-cake","Layer Cake","Icing on Top",
  [[4,7],[3,8],[2,9],[2,9],[3,8],[1,10],[1,10],[1,10],[1,10],[1,10]],
  ["#e7b4ba","#a66f80","#eacb90"],{bands:[[6,10,"#e4c18f"]],detailColors:["#fff4e3","#ffe0c0","#f8f4d2"]});
add("full",3,"toy-train","Toy Train","All Aboard",
  [[4,7],[3,8],[3,8],[3,8],[1,10],[1,10],[0,11],[0,11],[1,10],[2,9]],
  ["#78a8a3","#4b7d81","#bd8973"],{bands:[[7,10,"#ba8a74"]],detailColors:["#f0d49b","#e7f5e4","#c5e6dc"]});
add("full",4,"camping-tent","Camping Tent","Under the Stars",
  [[6,7],[5,8],[5,8],[4,9],[4,9],[3,10],[3,10],[2,11],[1,12],[0,13],[0,13],[0,13]],
  ["#80b49e","#4a7e78","#d7ac7c"],{bands:[[11,12,"#ac866c"]],detailColors:["#f5e4b6","#f0d8ac","#9fddc6"]});
add("full",4,"striped-lighthouse","Striped Lighthouse","Guiding Light",
  [[5,8],[5,8],[4,9],[3,10],[4,9],[4,9],[3,10],[3,10],[2,11],[2,11],[1,12],[1,12]],
  ["#ded4c5","#8b7c80","#cf8d84"],{bands:[[3,4,"#cc8b84"],[7,8,"#cf8d84"],[11,12,"#c7ac92"]],detailColors:["#fff6bf","#f6dfbf","#f3ebd4"]});

// SOLVE & PAINT. New artwork reuses the established tier-specific linear
// rearrangements, including sign-reversal practice at appropriate stages.
add("solve",1,"moon-rocket","Moon Rocket","Lift Off",
  [[3,4],[2,5],[2,5],[1,6],[0,7],[2,5]],
  ["#b7c8e6","#728cae","#f6b46b"],{bands:[[6,6,"#efaa66"]],detailColors:["#ffecac","#dff4fd","#ffe6b8"]});
add("solve",1,"gold-medal","Gold Medal","Top of the Podium",
  [[2,5],[1,6],[1,6],[0,7],[1,6],[2,5]],
  ["#efc36c","#9c8258","#e6a7a0"],{bands:[[1,2,"#dba39c"]],detailColors:["#fff3cc","#fff8df","#f5dea5"]});
add("solve",2,"pirate-flag","Pirate Flag","Ahoy There",
  [[4,5],[3,8],[1,8],[1,7],[3,7],[4,5],[4,5],[4,5]],
  ["#6f8199","#495b76","#a9c3cf"],{bands:[[6,8,"#b1a087"]],detailColors:["#f3e6c5","#f8f4e3","#b4dbe4"]});
add("solve",2,"kitten-face","Kitten Face","Purrfect Mystery",
  [[0,9],[0,9],[1,8],[1,8],[1,8],[2,7],[3,6],[4,5]],
  ["#dcae89","#aa786d","#f7d4a9"],{bands:[[6,8,"#e7c6a6"]],detailColors:["#f5e6cb","#514f5b","#ef9b9c"]});
add("solve",3,"cherry-cupcake","Cherry Cupcake","Sweet Treat",
  [[5,6],[4,7],[3,8],[1,10],[1,10],[2,9],[2,9],[3,8],[3,8],[4,7]],
  ["#edb2c0","#a57c9b","#f1cf98"],{bands:[[7,10,"#eec899"]],detailColors:["#fef2cf","#fff1e6","#f5d4e1"]});
add("solve",4,"mermaid-tail","Mermaid Tail","Undersea Magic",
  [[5,8],[4,9],[3,10],[3,10],[4,9],[4,9],[3,10],[2,11],[1,12],[0,13],[1,12],[3,10]],
  ["#78bbb2","#397e8e","#c5a9da"],{bands:[[9,12,"#b5a2d4"]],detailColors:["#d6f4e9","#fff0cc","#9be0d3"]});
add("solve",4,"windmill","Garden Windmill","Turn with the Wind",
  [[6,7],[3,10],[2,11],[5,8],[1,12],[0,13],[5,8],[5,8],[5,8],[4,9],[4,9],[3,10]],
  ["#9cb5d3","#577e9d","#d3af82"],{bands:[[9,12,"#d0af8c"]],detailColors:["#f7e9c7","#d8f0ed","#fff7db"]});

// MIXED CHALLENGE. These are mode-exclusive, symmetric full canvases with
// exactly the same genuine mirror/full/solve question mixture as core Mixed.
add("mixed",1,"tiny-planet","Tiny Planet","Orbiting Home",
  [[2,5],[1,6],[0,7],[0,7],[1,6],[2,5]],
  ["#8dafe1","#627ab1","#e3b4ba"],{bands:[[3,4,"#a69ad4"]],detailColors:["#ffe8bb","#f4dfdc","#d7edff"]});
add("mixed",3,"beacon-lighthouse","Beacon Lighthouse","Shine a Light",
  [[5,6],[5,6],[4,7],[3,8],[4,7],[4,7],[3,8],[3,8],[2,9],[2,9]],
  ["#c5d7dd","#6b869c","#d9a78b"],{bands:[[3,4,"#dba28d"],[7,8,"#daa58d"]],detailColors:["#fff2ba","#f4f1e2","#afd1e1"]});
add("mixed",4,"garden-gnome","Garden Gnome","Mischief in the Garden",
  [[6,7],[5,8],[5,8],[4,9],[4,9],[3,10],[3,10],[3,10],[2,11],[2,11],[1,12],[2,11]],
  ["#d7b8ae","#90727d","#c77e7c"],{bands:[[1,5,"#cd7a79"],[10,12,"#7a9bba"]],detailColors:["#f9e6d4","#fff5e2","#ffdeca"]});

// PAINT BY INEQUALITIES. Each row has at most four exact colour intervals,
// while the number of genuine colour choices follows the existing 2/3/4-tier
// progression. The masks are handcrafted, not duplicated from other pools.
add("paint",1,"smiling-sun","Smiling Sun","Sunny Hello",
  [[3,4],[2,5],[1,6],[1,6],[2,5],[3,4]],
  ["#f3cc72","#c99f55","#f3cc72"],{paintColors:["#f4c56b"],paintBackground:"#d8eefa",detailColors:["#fff9d5","#6b718a","#faeac3"]});
add("paint",1,"red-pencil","Red Pencil","Write On",
  [[3,4],[3,4],[2,5],[2,5],[2,5],[3,4]],
  ["#e28b88","#ad6c78","#f2cfad"],{paintColors:["#e5968f"],paintBackground:"#eaf2fc",detailColors:["#fff5e0","#fbe9c7","#f0dbbe"]});
add("paint",2,"floating-balloon","Floating Balloon","Up in the Air",
  [[4,5],[3,6],[2,7],[2,7],[3,6],[4,5],[4,5],[4,5]],
  ["#dd9ab4","#a77395","#d7b2bb"],{paintColors:["#e7a2bb"],paintBackground:"#e7f2fb",detailColors:["#ffebd9","#fff2e8","#e7d8f1"]});
add("paint",2,"green-turtle","Green Turtle","Slow and Steady",
  [[4,5],[2,7],[1,8],[0,9],[0,9],[1,8],[3,6],[4,5]],
  ["#84bba1","#497e77","#9cc7a5"],{paintColors:["#86c09d"],paintBackground:"#e4f2f7",detailColors:["#def7cc","#fff1d1","#a4dbc5"]});
add("paint",3,"cherry-icecream","Cherry Ice Cream","A Scoop of Joy",
  [[5,6],[3,8],[2,9],[1,10],[1,10],[2,9],[3,8],[4,7],[4,7],[5,6]],
  ["#eda7bc","#ae7890","#f1ce90"],{paintColors:["#e8a2b8","#f3d29b"],paintBackground:"#eaf3fa",detailColors:["#fff4cb","#ffe6e3","#fcf0d6"]});
add("paint",4,"rainbow-fish","Rainbow Fish","Underwater Colours",
  [[5,8],[3,10],[2,11],[1,12],[0,13],[0,13],[1,12],[2,11],[4,9],[4,9],[3,10],[5,8]],
  ["#72c2bf","#467eae","#f2c47b"],{paintColors:["#75bfc3","#f1cc78","#dca1b7"],paintSplit:true,paintBackground:"#e4f1fa",detailColors:["#f8f6d0","#f5e0d2","#ecf6e8"]});
add("paint",4,"mushroom-house","Mushroom House","Secret Woodland",
  [[5,8],[3,10],[1,12],[0,13],[0,13],[1,12],[4,9],[4,9],[4,9],[4,9],[4,9],[3,10]],
  ["#d58f89","#a66870","#e4cbac"],{paintColors:["#d88686","#f1d7b3","#9eb79b"],paintBackground:"#e7f3ed",detailColors:["#fff1c6","#ffe4b9","#f6e8cf"]});

const COUNT_BY_STAGE=[6,8,10,12,14];
const WIDTHS=[8,10,12,14,16];
const MIRROR_WIDTHS=[6,7,8,9,10];
const BACKGROUNDS=[
  ["#eaf5ef","#fafffb","#d9eadf"],
  ["#e7f1fa","#f9fcff","#d5e4f3"],
  ["#f7edf1","#fffbfd","#ebdde8"],
  ["#eeedf8","#fcfaff","#dfdff0"],
  ["#f7f0e6","#fffdf6","#eadfcc"]
];
function pictureFromSpec(spec,index){
  const {mode,tier,id,name,clue,spans,colours,options}=spec;
  const count=COUNT_BY_STAGE[tier-1],w=mode==="mirror"?
    MIRROR_WIDTHS[tier-1]:WIDTHS[tier-1];
  if(spans.length!==count)throw Error("Bad handcrafted artwork "+id);
  for(const [left,right] of spans)
    if(!Number.isInteger(left)||!Number.isInteger(right)||
       left<0||right>=w||left>right||
       (mode==="mirror"&&left!==0)||
       (mode==="mixed"&&left+right!==w-1))
      throw Error("Invalid ink span "+id);
  const rows=mode==="paint"?
    spans.map(()=>[0,w-1]):spans;
  const [base,edge,accent]=colours;
  const [sky,light,shade]=BACKGROUNDS[(tier+index)%BACKGROUNDS.length];
  const background=mode==="paint"?
    {base:options.paintBackground,light:options.paintBackground,
      shade:options.paintBackground,sparkle:options.paintBackground}:
    {base:sky,light,shade,sparkle:"#fff8dd"};
  const bands=options.bands?
    options.bands.map(([from,to,fill])=>({from,to,fill})):
    [{from:Math.max(1,count-2),to:count,fill:accent}];
  const groupNames=["glimmers","features","finishing"];
  const ys=Array.from({length:6},(_,i)=>
    1+Math.round(i*(count-1)/5));
  const decorationColors=options.detailColors||
    ["#fff1cc","#f8dfdd","#d6f4ec"];
  const details=ys.map((y,i)=>{
    const [left,right]=spans[y-1];
    const centre=mode==="mirror"?0:w/2;
    const maxOffset=mode==="mirror"?right:Math.max(0,right-centre);
    const offset=Math.min(maxOffset,i%3);
    // Every mark has a reflected twin. Keep these on visible, painted pixels.
    const x=mode==="mirror"?w+offset:centre+offset;
    return [x,y,decorationColors[Math.floor(i/2)],groupNames[Math.floor(i/2)],.7];
  });
  let paint;
  if(mode==="paint"){
    const palette=["S","A","B","C"].slice(0,[2,2,3,4,5][tier-1]);
    const names=["Background","Main colour","Highlight","Accent"];
    const hex=[options.paintBackground,...options.paintColors];
    const colours=Object.fromEntries(palette.map((key,i)=>[
      key,{name:names[i],hex:hex[i]}
    ]));
    const bandsByRow=Math.max(1,Math.ceil(count/(palette.length-1)));
    const grid=spans.map(([left,right],row)=>{
      const pixels=Array(w).fill("S");
      const main=1+Math.min(palette.length-2,Math.floor(row/bandsByRow));
      for(let col=left;col<=right;col++){
        let code=palette[main];
        if(options.paintSplit&&col>w/2-1)code=palette[1+main%(palette.length-1)];
        pixels[col]=code;
      }
      return pixels.join("");
    });
    paint={backgroundId:"S",colours,grid};
  }
  return Object.freeze({
    id:"gallery-"+mode+"-"+tier+"-"+id,
    name,clue,
    description:"A completely new mystery to discover at the "+tier+"-star challenge.",
    family:mode==="mirror"?"half":"full",levels:[mode],
    window:{min:-Math.floor(w/2),max:Math.ceil(w/2)},
    axis:mode==="mixed"?{min:-w/2-1,max:w/2+1}:undefined,
    rows,height:count+2,legacyMathStage:{[mode]:tier},
    craftedMystery:true,
    palette:{base,edge,bands},
    background,detailStages:groupNames,details,
    ...(paint?{paint}:{}),
  });
}
export const CRAFTED_MYSTERIES=Object.freeze(SPECS.map(pictureFromSpec));
export const CRAFTED_MYSTERY_COUNTS=Object.freeze(
  Object.fromEntries(["mirror","full","solve","mixed","paint"].map(mode=>[
    mode,Object.freeze(Array.from({length:5},(_,i)=>
      CRAFTED_MYSTERIES.filter(p=>p.levels.includes(mode)&&
        p.legacyMathStage[mode]===i+1).length))
  ]))
);
