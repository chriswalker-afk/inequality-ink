// Twenty distinct pixel-art rewards for Quadratic Quest.
// Questions are built in quadratic-quest.mjs from exact, stage-appropriate roots.
const palette=(map)=>Object.freeze(map);
const picture=(id,name,stage,clue,focus,colours,rows)=>{
  const width=Math.max(...rows.map(row=>row.length));
  return Object.freeze({id,name,stage,clue,focus,
    art:Object.freeze({rows:Object.freeze(rows.map(row=>{
      const left=Math.floor((width-row.length)/2);
      return ".".repeat(left)+row+".".repeat(width-row.length-left);
    })),colours:palette(colours)})});
};
export const QUEST_EXTRA_DEFINITIONS=Object.freeze([
  // QUICK SPARK: simple factorised quadratics, six visible successes.
  picture("heart-of-gold","Heart of Gold",1,"A Little Kindness",
    "Factorised quadratics · roots · between or outside",
    {R:"#ed92a8",G:"#f5d07a"},[
      "..RR..RR..",".RRRRRRRR.","RRRRGGRRRR",
      ".RRRRRRRR.","..RRRRRR..","....RR...."
    ]),
  picture("starlight-spark","Starlight Spark",1,"Wish Upon a Star",
    "Two brackets · strict and inclusive endpoints",
    {Y:"#f0c866",G:"#e6a178"},[
      "....YY....","....YY....","YYYYYYYYYY",
      ".YYYYYYYY.","..YYGGYY..",".YY....YY."
    ]),
  picture("tiny-tulip","Tiny Tulip",1,"Spring Has Sprung",
    "Find both roots · test the middle interval",
    {P:"#d88baa",Y:"#f4c978",G:"#73ae91"},[
      "...PPPP...","..PPYYPP..","..PPPPPP..",
      "...PPPP...","....GG....","...GGGG..."
    ]),
  picture("sky-balloon","Sky Balloon",1,"Up, Up and Away",
    "Opening upwards · positive and negative regions",
    {B:"#82bccc",W:"#e9f4e6",T:"#b48a74"},[
      "...BBBB...","..BBBBBB..",".BBBWWBBB.",
      "..BBBBBB..","...BBBB...","....TT...."
    ]),
  // STEP UP: expanded monic quadratics and factorisation.
  picture("tin-can-friend","Tin Can Friend",2,"Meet the Robot",
    "Factorise x² + bx + c · check negative roots",
    {T:"#90a9bd",B:"#6f9fc3",W:"#f2dfba",R:"#d18d93",G:"#819e8d"},[
      ".....TT.....","...TTTTTT...","..TBBBBBBT..",
      "..TBWWWWBT..","..TBBBBBBT..",".RR.TTTT.RR.",
      "....GGGG....","...GG..GG..."
    ]),
  picture("rainbow-arch","Rainbow Arch",2,"After the Rain",
    "Expanded monics · strict versus non-strict signs",
    {R:"#dc899a",O:"#efa674",Y:"#efd078",G:"#8eb88b",B:"#80b2c6",W:"#e3e6e3"},[
      "...RRRRRRRR...","..ROOOOOOOR..",".ROYYYYYYYYOR.",
      "ROYGGBBGGYOR","ROYG....GYOR",".BB......BB.",
      "..W......W..",".WWW....WWW."
    ]),
  picture("cosy-cottage","Cosy Cottage",2,"Home Sweet Home",
    "Factorise with positive and negative constant terms",
    {R:"#d48e8f",T:"#deba91",W:"#96bed0",D:"#8c8db2"},[
      ".....RR.....","....RRRR....","...RRRRRR...",
      "..RRRRRRRR..",".TTTTTTTTTT.",".TWWTTWWTT.",
      ".TTTTDDTTT.",".TTTTDDTTT."
    ]),
  picture("coral-goldfish","Coral Goldfish",2,"Under the Waves",
    "Factorise expanded expressions · decide outside roots",
    {B:"#f0ad72",W:"#fae2ba",T:"#d78c83",F:"#86b4bd"},[
      "...BBBB....","..BBBBBB...",".BBWWBBBBTT",
      "BBWWWWBBTTT",".BBWWBBBBTT","..BBBBBB...",
      "...BBBB....","....FF....."
    ]),
  // INK BUILDER: rearrange to zero and handle opening downwards.
  picture("moonlit-owl","Moonlit Owl",3,"Eyes in the Forest",
    "Rearrange before factorising · negative coefficients",
    {P:"#937fba",B:"#7a9eb9",W:"#f3e7c8",O:"#e5ae6e",T:"#ad8978"},[
      "....PP..PP....","...PPPPPPPP...","..PBBBBBBBBP..",
      ".PBWWBBWWBBP.",".PBWOBBWOBBP.",".PBBBBBBBBBP.",
      "..PBBBBBBBBP.","...PBBBBBBP...","....PPPPPP....",".....TTTT....."
    ]),
  picture("yellow-submarine","Yellow Submarine",3,"Deep Sea Dive",
    "Quadratics on both sides · rearrange and solve",
    {T:"#7aa2a1",Y:"#e8c46e",B:"#8eb9c5"},[
      "......TT......","......TT......","....TTTTTT....",
      "..YYYYYYYYYY..",".YYYYBBBBYYYY.","YYYYYBBBBYYYYY",
      ".YYYYYYYYYYYY.","..YYYYYYYYYY..","...T......T...","..TT......TT.."
    ]),
  picture("celebration-cake","Celebration Cake",3,"Make a Wish",
    "Rearranged inequalities · roots and endpoint decisions",
    {R:"#e0a36e",P:"#d7a3bf",W:"#f5e8cf",B:"#81aabc"},[
      ".....RRRR.....","....RPPPRR....","..PPPPPPPPPP..",
      ".PPWWPPWWPPPP.","..PPPPPPPPPP..","...WWWWWWWW...",
      "...BBBBBBBB...","....BBBBBB....",".....BBBB.....","......BB......"
    ]),
  picture("golden-tree","Golden Tree",3,"Autumn Glow",
    "Rearrange to zero · choose intervals with care",
    {G:"#81b196",Y:"#eac57c",T:"#9b8570"},[
      "......GG......",".....GGGG.....","....GGGGGG....",
      "...GGGGGGGG...","..GGYYGGYYGG..",".GGGGGGGGGGGG.",
      "...GGGGGGGG...",".....TTTT.....",".....TTTT.....","...TTTTTTTT..."
    ]),
  // BRAIN STRETCH: non-monic quadratics, scaled factors and reverse signs.
  picture("alpine-morning","Alpine Morning",4,"Into the Mountains",
    "Non-monic factorising · negative leading terms",
    {Y:"#f0cf8d",W:"#edf1e5",G:"#84b3a5",B:"#7794b2",T:"#ac876f"},[
      ".......YY.......","......YYYY......",".....YYWWYY.....",
      "....WWWWWWWW....","...GGWWBBWWGG...","..GGGGGBBGGGGG..",
      ".GGGGGGGGGGGGGG.","GGGGGGGGGGGGGGGG","..GGGGGGGGGGGG..",
      "...TT....TT.....","..TTTT..TTTT....",".TTTTTTTTTTTTTT."
    ]),
  picture("clockwork-friend","Clockwork Friend",4,"Built with Brains",
    "Scaled quadratics · expanded non-monic expressions",
    {Y:"#e6bd75",T:"#8e9fac",B:"#6cabc5",W:"#f2e6cc",R:"#d58d87",G:"#81af9d"},[
      "......YY......",".....YYYY.....","....TTTTTT....",
      "...TBBBBBBT...","..TTBWWWWBTT..","..TBBRBBRBBT..",
      "..TBBBBBBBBT..","...TTTTTTTT...","..RR.TTTT.RR..",
      "..RR.GGGG.RR..",".....GGGG.....","....GG..GG...."
    ]),
  picture("lighthouse-glow","Lighthouse Glow",4,"Guide Me Home",
    "Factorise ax² + bx + c · mixed coefficients",
    {Y:"#f0d582",R:"#d98e8a",W:"#f8f0db",B:"#7daabc"},[
      "......YY......","....YYYYYY....","......RR......",
      ".....RRRR.....",".....WWWW.....",".....RRRR.....",
      ".....RWWR.....",".....RRRR.....","....RRRRRR....",
      "...RRRWWRRR...","..BBBBBBBBBB..",".BBBBBBBBBBBB."
    ]),
  picture("castle-at-dusk","Castle at Dusk",4,"Beyond the Walls",
    "Negative multipliers · inclusive solutions",
    {T:"#8d8fab",W:"#f5d796",D:"#6d6f9a",G:"#91b09a"},[
      ".TTT.......TTT.",".TWT.......TWT.",".TTT..TTT..TTT.",
      ".TTTTTTTTTTTTT.","..TTTTTTTTTTT..","..TWTWWWWTWT..",
      "..TTTTTTTTTTT..","..TTTDDDDTTTT..","..TTTDDDDTTTT..",
      "..TTTDDDDTTTT..",".GGGGGGGGGGGGG.","GGGGGGGGGGGGGGG"
    ]),
  // MASTERPIECE: varied forms; students choose the full solution method.
  picture("orbit-explorer","Orbit Explorer",5,"Journey to the Stars",
    "Mixed quadratic forms · sophisticated sign reasoning",
    {Y:"#f0d48a",B:"#84aec8",W:"#f3eadc",R:"#d98ca8",T:"#e5ad75"},[
      ".........YY.........","........YYYY........",".......YBBBBY.......",
      "......BBBBBBBB......",".....BBWWWWBBBB.....","...BBBBWWWWBBBBBB...",
      "..BBRRBBBBBBRRBB....",".BBBBBBBBBBBBBBBB...",
      "BBBBBBBBBBBBBBBBBB..","...BBYYYYYYYYBB.....","....BYYTTTTYYB......",
      ".....TTTTTTTT.......","......RR..RR........",".....RR....RR......."
    ]),
  picture("rising-phoenix","Rising Phoenix",5,"From the Flames",
    "Mixed rearrangement and factoring · signs of ax²",
    {R:"#dc8d81",Y:"#efc875"},[
      "........RR........","......RRRRRR......",".....RRYYRRRR.....",
      "....RYYRRYYRRR....","...RYYRRRRYYRRR...","RRRYYYRRRRYYYRRRR",
      ".RRRYYYYYYYYRRRR.","..RRRYYYRYYYRRR..","...RRRRRRRRRRR...",
      ".....RRRRRR.....","......RRRR......",".......RR.......",
      "......RRRR......",".....RR..RR....."
    ]),
  picture("coral-kingdom","Coral Kingdom",5,"A Secret Reef",
    "Multi-step comparisons · negative and scaled quadratics",
    {B:"#87bbc3",G:"#7baf98",P:"#d99cb8"},[
      "......B....B......","....BBBBBBBBBB....","...BBBGGGGBBB....",
      "..BBGGGGGGGGBB...","..BGGGGGGGGGGB...",".BGGGGGGGGGGGB...",
      "BBGGPPGGGGPPGGBB",".BGGGGGGGGGGGB..","...PPGGPPGGPP...",
      "..PPPPPPPPPPPP..","....PP....PP....","...PP......PP...",
      "..PP........PP..",".PP..........PP."
    ]),
  picture("night-observatory","Night Observatory",5,"Beyond the Horizon",
    "Choose a method independently · mixed inequalities",
    {Y:"#ead18c",B:"#84a6c8",W:"#e9e2d7",D:"#a6a6c3",G:"#7fa897"},[
      ".......YYYY.......","....Y........Y....",".....YY....YY.....",
      ".......BB........","......BBBB.......",".....BBBBBB......",
      "....BBBBBBBB.....","...BBBBBBBBBB....","..BBBBBBBBBBBB...",
      "...BBWWWWWWBB....","...BBWWWWWWBB....","...BBBDDDDDBB....",
      "...BBBBDDBBBB....","..GGGGGGGGGGGG..."
    ])
]);
