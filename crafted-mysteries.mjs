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

// MASTERPIECE: two additional high-detail reveals in each mode, ensuring
// the finished site has 125 genuinely distinct works of art, not just 125
// game-mode appearances of shared pictures.
add("mirror",5,"castle-keep","Castle Keep","Royal Hideaway",
  [[0,2],[0,2],[0,9],[0,7],[0,7],[0,9],[0,9],[0,9],[0,9],[0,9],[0,9],[0,9],[0,7],[0,7]],
  ["#a1b5cd","#617994","#c7927e"],{bands:[[3,4,"#c39b89"],[10,12,"#c49e8e"]],detailColors:["#fff2bf","#e5f5e2","#ffdfad"]});
add("mirror",5,"peacock-fan","Peacock Fan","Colourful Feathers",
  [[0,2],[0,5],[0,8],[0,9],[0,9],[0,9],[0,9],[0,9],[0,8],[0,6],[0,4],[0,3],[0,2],[0,1]],
  ["#77b9ac","#417f85","#bc9fdb"],{bands:[[4,8,"#8e9ec9"],[12,14,"#668e9c"]],detailColors:["#ffe7ad","#e9ccee","#d9f6e0"]});
add("full",5,"volcano","Volcano","Lava Adventure",
  [[7,8],[6,9],[5,10],[5,10],[4,11],[4,11],[3,12],[3,12],[2,13],[2,13],[1,14],[1,14],[0,15],[0,15]],
  ["#b9a299","#806f77","#e89e6c"],{bands:[[1,5,"#e4a46a"],[12,14,"#8e7774"]],detailColors:["#ffe6a8","#ebaf85","#f8c893"]});
add("full",5,"double-decker-bus","Double-Decker Bus","City Lights",
  [[4,11],[3,12],[2,13],[1,14],[1,14],[1,14],[1,14],[1,14],[1,14],[1,14],[0,15],[0,15],[2,13],[3,12]],
  ["#dc8c7f","#935b62","#d7b88b"],{bands:[[11,14,"#bf9d79"]],detailColors:["#f8edc3","#d7edfa","#fff2d0"]});
add("solve",5,"pixel-guitar","Pixel Guitar","Music Maker",
  [[6,9],[6,9],[6,9],[6,9],[5,10],[4,11],[3,12],[2,13],[2,13],[2,13],[3,12],[4,11],[5,10],[6,9]],
  ["#daa67b","#9a705f","#c4a2c5"],{bands:[[1,4,"#97748c"],[10,14,"#ddbb8b"]],detailColors:["#f7edca","#f8e1d5","#fcdbb1"]});
add("solve",5,"space-cruiser","Space Cruiser","Beyond the Moon",
  [[7,8],[6,9],[5,10],[5,10],[4,11],[3,12],[2,13],[1,14],[0,15],[0,15],[1,14],[3,12],[5,10],[7,8]],
  ["#95b8d6","#527fa7","#e6b786"],{bands:[[9,14,"#d2a8a6"]],detailColors:["#edfaff","#fff2be","#d7f4e4"]});
add("mixed",5,"pirate-skull","Pirate Skull","Treasure Trouble",
  [[4,11],[2,13],[1,14],[0,15],[0,15],[0,15],[0,15],[1,14],[2,13],[3,12],[4,11],[4,11],[4,11],[5,10]],
  ["#e5d5bc","#8c827f","#c99a7d"],{bands:[[11,14,"#d2bca7"]],detailColors:["#f3e7d3","#716c7a","#fff8e2"]});
add("mixed",5,"ancient-pyramid","Ancient Pyramid","Desert Mystery",
  [[7,8],[6,9],[6,9],[5,10],[5,10],[4,11],[4,11],[3,12],[3,12],[2,13],[2,13],[1,14],[1,14],[0,15]],
  ["#e2c486","#9b866c","#e9d5aa"],{bands:[[12,14,"#c5a779"]],detailColors:["#ffedc6","#d9b78f","#f7e1b2"]});
add("paint",5,"undersea-submarine","Undersea Submarine","Deep Dive",
  [[6,9],[4,11],[3,12],[2,13],[1,14],[0,15],[0,15],[0,15],[0,15],[1,14],[2,13],[3,12],[4,11],[6,9]],
  ["#81b9bd","#497d98","#ecc57e"],{paintColors:["#7fc1bb","#f0ce8b","#a2a1cf","#e49ab1"],paintSplit:true,paintBackground:"#d9ecf6",detailColors:["#fcf0bf","#fce2d0","#dff8e7"]});
add("paint",5,"festival-egg","Festival Egg","Colourful Secret",
  [[7,8],[5,10],[3,12],[2,13],[2,13],[1,14],[0,15],[0,15],[1,14],[2,13],[3,12],[4,11],[5,10],[6,9]],
  ["#8dbb93","#578677","#efc27d"],{paintColors:["#77bc8a","#f0cb81","#d28eb1","#81add1"],paintSplit:true,paintBackground:"#e8f4eb",detailColors:["#f6e0bb","#e1f8d9","#ffefce"]});

// Finishing details identify the actual subject, not merely decorate a blob.
// A dot on the right half is mirrored onto the left in the final artwork.
// Each entry is [x, row, colour, reveal stage, relative pixel size].
const FEATURES=Object.freeze({
  "honey-bee":[
    [7,2,"#3d4857","glimmers",.68],[8,3,"#f6e4bc","glimmers",.52],
    [7,4,"#495367","features",.9],[9,4,"#fff0b4","features",.6],
    [7,5,"#f9e4ba","finishing",.62],[6,6,"#a67654","finishing",.48]
  ],
  "ladybird":[
    [10,3,"#2d4656","glimmers",.9],[12,4,"#344354","glimmers",.85],
    [11,5,"#394456","features",.9],[13,6,"#334457","features",.8],
    [9,8,"#ffe1c8","finishing",.6],[8,9,"#fff0d7","finishing",.62]
  ],
  "little-house":[
    [5,2,"#fae7be","glimmers",.64],[4,3,"#f4d3ab","glimmers",.65],
    [5,4,"#ede0bb","features",.77],[5,5,"#675e6d","features",.86],
    [4,6,"#816f6b","finishing",.94],[5,6,"#e5dba9","finishing",.65]
  ],
  "toy-train":[
    [7,3,"#f4e5ac","glimmers",.7],[8,4,"#f8e8c5","glimmers",.7],
    [7,6,"#495b6c","features",.85],[9,7,"#495b6c","features",.82],
    [9,8,"#53536a","finishing",.88],[8,9,"#f4d7a8","finishing",.62]
  ],
  "pirate-flag":[
    [7,2,"#ecf2ef","glimmers",.8],[7,3,"#ecf2ef","glimmers",.82],
    [6,4,"#ecf2ef","features",.82],[5,5,"#e1ccb8","features",.7],
    [5,7,"#f6dfb8","finishing",.66],[5,8,"#836b65","finishing",.75]
  ],
  "kitten-face":[
    [7,1,"#f1b4b5","glimmers",.8],[7,2,"#f1b4b5","glimmers",.7],
    [6,4,"#42465d","features",.94],[6,5,"#f4e5c7","features",.55],
    [5,6,"#dd9299","finishing",.85],[5,7,"#7a646a","finishing",.53]
  ],
  "cherry-cupcake":[
    [6,1,"#c65e6c","glimmers",.88],[7,4,"#fff5d1","glimmers",.7],
    [8,5,"#fcecd6","features",.66],[7,6,"#fdf6e2","features",.75],
    [7,9,"#b68b74","finishing",.83],[6,10,"#f7e1b7","finishing",.74]
  ],
  "robot-helmet":[
    [9,1,"#f0ddb3","glimmers",.73],[10,3,"#f2ebc8","glimmers",.68],
    [12,6,"#355873","features",.91],[11,7,"#e2f4fd","features",.82],
    [12,9,"#4a657c","finishing",.88],[11,10,"#f6d1af","finishing",.73]
  ],
  "celebration-cupcake":[
    [9,1,"#fff5bc","glimmers",.86],[10,4,"#f6e6c5","glimmers",.71],
    [12,6,"#fff7de","features",.81],[11,7,"#e9bcf0","features",.77],
    [11,10,"#fef1cc","finishing",.83],[10,12,"#efc39e","finishing",.69]
  ],
  "garden-gnome":[
    [7,3,"#fff1d4","glimmers",.75],[8,5,"#fce7ca","glimmers",.72],
    [8,7,"#4b4b60","features",.92],[7,8,"#d99c8f","features",.86],
    [8,10,"#fff7eb","finishing",.9],[8,11,"#f2dfcd","finishing",.88]
  ],
  "mushroom-house":[
    [10,3,"#fff4d3","glimmers",.93],[11,4,"#ffecd3","glimmers",.76],
    [9,6,"#ffe5b8","features",.82],[8,8,"#a37e70","features",.8],
    [8,10,"#7b786f","finishing",.97],[8,11,"#897d6b","finishing",.91]
  ],
  "smiling-sun":[
    [5,2,"#fcf2c3","glimmers",.63],[5,3,"#606676","glimmers",.9],
    [4,4,"#fff0ae","features",.7],[5,4,"#f5df90","features",.6],
    [4,5,"#886d63","finishing",.72],[4,6,"#ffedb4","finishing",.72]
  ],
  "double-decker-bus":[
    [11,4,"#dbecf4","glimmers",.85],[12,5,"#eaf4f2","glimmers",.85],
    [11,7,"#dbe8ed","features",.85],[12,8,"#f6e9d1","features",.85],
    [11,12,"#575c6a","finishing",.92],[11,13,"#535966","finishing",.92]
  ],
  "pixel-guitar":[
    [8,2,"#f5dcb6","glimmers",.7],[8,4,"#ffe9cb","glimmers",.74],
    [9,7,"#f9ecd8","features",.83],[8,9,"#55495c","features",.98],
    [9,11,"#f6e3bd","finishing",.7],[8,13,"#e9cea3","finishing",.76]
  ],
  "pirate-skull":[
    [10,3,"#fff3dd","glimmers",.65],[9,4,"#f7e6ce","glimmers",.67],
    [10,5,"#414454","features",.98],[10,6,"#404556","features",.92],
    [9,12,"#7c6e70","finishing",.83],[8,13,"#fff6e5","finishing",.65]
  ],
  "undersea-submarine":[
    [9,3,"#edf7db","glimmers",.68],[10,5,"#f8efc8","glimmers",.79],
    [11,7,"#e7f5e1","features",.95],[12,8,"#f6e8d2","features",.87],
    [11,10,"#496b87","finishing",.82],[9,12,"#dfedd9","finishing",.79]
  ],
  "festival-egg":[
    [9,3,"#f9e1bb","glimmers",.83],[10,5,"#ecf5ca","glimmers",.82],
    [12,7,"#fdf0d3","features",.8],[11,8,"#ffe9bb","features",.83],
    [9,11,"#fff4d8","finishing",.78],[8,13,"#f6ead1","finishing",.72]
  ]
});

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
  const details=FEATURES[id]||ys.map((y,i)=>{
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
    const palette=["S","A","B","C","D"].slice(0,[2,2,3,4,5][tier-1]);
    const names=["Background","Main colour","Highlight","Accent","Detail"];
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
