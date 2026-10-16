// Additional original mystery art, balanced by mode and mathematical difficulty.
// Two new, independent pictures per tier per mode, alongside each original
// five-stage anchor. Every piece uses real, verifiable inequality rows.
// Profiles describe hand-authored silhouettes (top to bottom), NOT answers.
const PROFILES=Object.freeze({
tree:[.05,.16,.29,.18,.4,.29,.56,.4,.78,.55,.9,.14,.14,.12],
cloud:[.18,.3,.62,.8,.93,.98,.95,.93,.83,.7,.53,.36,.23,.15],
hex:[.2,.45,.7,.9,.95,1,1,.95,.9,.7,.45,.2,.15,.1],
tulip:[.16,.53,.82,.96,1,.88,.48,.22,.12,.12,.52,.28,.12,.1],
orb:[.22,.43,.67,.85,.98,1,1,.98,.85,.67,.43,.22,.13,.08],
jelly:[.12,.38,.73,.94,1,1,.95,.9,.8,.62,.38,.52,.27,.15],
lantern:[.11,.23,.47,.73,.91,.94,.94,.9,.81,.62,.39,.25,.12,.12],
tower:[.8,.78,.3,.3,.68,.68,.72,.73,.73,.72,.72,.78,.85,.92],
crown:[.05,.8,.2,.84,.27,.9,.73,.8,.88,.89,.9,.82,.76,.68],
rocket:[.07,.15,.26,.33,.53,.53,.6,.61,.62,.42,.26,.17,.1,.05],
acorn:[.17,.42,.67,.85,.92,.87,.78,.79,.68,.59,.48,.33,.2,.07],
cup:[.56,.7,.78,.87,.91,.93,.87,.82,.73,.66,.83,.78,.52,.4],
boat:[.1,.19,.32,.48,.62,.47,.32,.79,.89,.96,.84,.67,.38,.15],
cone:[.84,.89,.92,.83,.7,.58,.45,.36,.28,.21,.15,.1,.08,.05],
bell:[.11,.27,.48,.64,.72,.78,.8,.88,.95,.98,.77,.33,.2,.1],
mushroom:[.12,.43,.71,.91,.96,1,.9,.34,.26,.25,.26,.42,.46,.43],
helmet:[.09,.33,.63,.82,.94,.97,.95,.92,.87,.84,.81,.79,.56,.36],
cactus:[.13,.2,.3,.48,.48,.32,.6,.67,.54,.36,.5,.78,.81,.72],
chest:[.19,.58,.8,.92,.9,.92,.94,.93,.94,.94,.88,.85,.78,.57],
trophy:[.79,.92,.87,.73,.59,.45,.28,.21,.2,.46,.63,.75,.81,.65],
sub:[.16,.32,.57,.76,.9,.94,.98,.93,.78,.62,.51,.31,.17,.1],
nest:[.15,.28,.42,.52,.6,.65,.79,.94,.97,.83,.65,.46,.3,.19],
hat:[.13,.26,.41,.56,.63,.72,.81,.82,.82,.99,.97,.78,.49,.23],
fish:[.1,.24,.51,.73,.88,.95,.81,.67,.48,.37,.72,.53,.29,.1],
planet:[.22,.4,.68,.84,.92,.97,1,1,.96,.91,.78,.67,.47,.2],
house:[.05,.14,.31,.41,.56,.68,.76,.81,.85,.85,.85,.83,.81,.79],
snowman:[.13,.33,.45,.44,.25,.21,.45,.69,.88,.89,.76,.56,.38,.22],
butterfly:[.18,.66,.94,1,.97,.77,.42,.35,.54,.91,.93,.7,.4,.17],
hourglass:[.88,.74,.59,.44,.32,.2,.1,.1,.22,.42,.59,.74,.87,.91],
dragon:[.09,.16,.25,.49,.69,.83,.97,.71,.49,.59,.82,.6,.34,.17],
star:[.08,.12,.18,.82,.58,.4,.92,.43,.27,.15,.1,.09,.07,.05],
shield:[.61,.82,.87,.86,.81,.78,.75,.7,.6,.48,.36,.25,.16,.08],
gem:[.15,.38,.57,.83,.96,.98,.97,.92,.77,.62,.43,.29,.18,.06],
robot:[.76,.82,.84,.78,.82,.85,.84,.82,.75,.71,.59,.5,.45,.29],
vase:[.26,.41,.6,.48,.35,.29,.39,.57,.69,.77,.79,.68,.53,.35],
kite:[.12,.23,.48,.74,.96,.77,.56,.37,.27,.18,.13,.09,.07,.05],
tornado:[.85,.93,.84,.73,.81,.65,.57,.67,.48,.42,.48,.33,.19,.07],
leaf:[.1,.25,.49,.63,.75,.84,.94,.85,.78,.56,.43,.31,.18,.06],
candle:[.08,.15,.27,.25,.34,.51,.53,.56,.6,.64,.66,.63,.59,.5],
potion:[.21,.33,.37,.38,.4,.57,.73,.85,.83,.76,.73,.56,.42,.23],
castle:[.7,.81,.81,.48,.51,.84,.85,.86,.86,.86,.82,.72,.69,.66],
flower:[.16,.43,.75,.96,1,.91,.68,.23,.15,.47,.43,.22,.12,.1],
owl:[.33,.67,.77,.81,.94,.93,.86,.82,.77,.7,.57,.43,.27,.12],
sun:[.09,.39,.61,.82,.9,.97,.99,.93,.87,.74,.55,.38,.17,.06],
lollipop:[.16,.46,.72,.91,.98,.95,.88,.72,.43,.17,.11,.1,.1,.1],
rainbow:[.13,.29,.51,.72,.86,.94,1,1,.94,.86,.73,.57,.39,.2]
});
const THEMES=Object.freeze({
mirror:[
 [["Spruce Sapling","Woodland Spark","tree"],["Cloud Puff","Silver Lining","cloud"]],
 [["Golden Honeycomb","Busy Bees","hex"],["Spring Tulip","Garden Secret","tulip"]],
 [["Winter Globe","First Snow","orb"],["Ocean Jellyfish","Drift Along","jelly"]],
 [["Moonlight Lantern","After Dark","lantern"],["Castle Tower","Royal Lookout","tower"]],
 [["Crystal Crown","Royal Jewels","crown"],["Rocket Fire","Skyward Flame","rocket"]]
],
full:[
 [["Autumn Acorn","Oak Adventure","acorn"],["Cocoa Cup","Cosy Break","cup"]],
 [["Paper Sailboat","Set Sail","boat"],["Ice Cream Cone","Summer Scoop","cone"]],
 [["Golden Bell","Ding Dong","bell"],["Forest Mushroom","Under the Trees","mushroom"]],
 [["Space Helmet","Astronaut Training","helmet"],["Desert Cactus","Sunshine Days","cactus"]],
 [["Treasure Chest","Buried Riches","chest"],["Champion Trophy","Winning Moment","trophy"]]
],
solve:[
 [["Diving Submarine","Ocean Expedition","sub"],["Bird Nest","Home Sweet Home","nest"]],
 [["Magic Hat","Abracadabra","hat"],["Happy Fish","Underwater Treasure","fish"]],
 [["Ringed Planet","Another World","planet"],["Little Cottage","Through the Woods","house"]],
 [["Snowman","Frosty Friend","snowman"],["Butterfly","Wings of Colour","butterfly"]],
 [["Golden Hourglass","Against the Sand","hourglass"],["Fire Dragon","Here Comes Trouble","dragon"]]
],
mixed:[
 [["Shooting Star","Wish Upon It","star"],["Brave Shield","Little Hero","shield"]],
 [["Blue Diamond","Bright Discovery","gem"],["Friendly Robot","Beep Boop","robot"]],
 [["Flower Vase","A Bunch of Joy","vase"],["Flying Kite","Catch the Wind","kite"]],
 [["Whirling Tornado","Twister Alert","tornado"],["Forest Leaf","Green Treasure","leaf"]],
 [["Twilight Candle","A Warm Glow","candle"],["Potion Bottle","A Little Magic","potion"]]
],
paint:[
 [["Fairy Castle","Faraway Kingdom","castle"],["Summer Flower","Sunshine Garden","flower"]],
 [["Night Owl","Who Goes There","owl"],["Morning Sun","Golden Morning","sun"]],
 [["Candy Lollipop","Sweet Surprise","lollipop"],["Rainbow Arch","After the Rain","rainbow"]],
 [["Ocean Planet","Beyond Earth","planet"],["Cactus Bloom","Desert Colours","cactus"]],
 [["Butterfly Wings","Colourful Flight","butterfly"],["Rocket Party","Launch Day","rocket"]]
]
});
const SHADES=[
 ["#7bbca6","#477c70","#c89f79"],
 ["#8ab6d3","#507f9c","#ecc685"],
 ["#da9caa","#a16883","#edc789"],
 ["#9fb4da","#617eaa","#b4cfac"],
 ["#e1b786","#a87c69","#88b9b3"]
];
const BACKS=[
 ["#eaf3ee","#fbfffc","#d9e9e0"],
 ["#e4edf7","#f8fcff","#d1e2f2"],
 ["#f6ecf0","#fffcfd","#eedde7"],
 ["#edeaf7","#faf8ff","#dfdbf0"],
 ["#f6f0e5","#fffcf5","#ece2d2"]
];
const clip=(x,a,b)=>Math.max(a,Math.min(b,x));
const count=[6,8,10,12,14],width=[8,10,12,14,16];
const sample=(profile,n,i)=>profile[Math.round(i*(profile.length-1)/Math.max(1,n-1))];
function outline(profile,w,n,{mirror=false}={}){
  return Array.from({length:n},(_,i)=>{
    const radius=clip(Math.round(sample(profile,n,i)*(mirror?w-1:w/2-1)),0,mirror?w-1:w/2-1);
    return mirror?[0,radius]:[w/2-1-radius,w/2+radius];
  });
}
function decorations(rows,family,w,n,colours){
  const decorations=[],groups=["glimmer","highlights","finishing"];
  // Deliberately only place details where real filled pixel squares exist.
  for(let j=0;j<3;j++){
    const y=1+j*2;
    const [from,to]=rows[y-1], centre=family==="half"?0:w/2-1;
    const selected=clip(centre,from,to);
    decorations.push([family==="half"?w+selected:selected,y,colours[j],groups[j]]);
    const below=y+1,[left,right]=rows[below-1];
    const second=clip(family==="half"?Math.min(2,right):w/2-1,left,right);
    if(below!==y)decorations.push([family==="half"?w+second:second,below,colours[j],groups[j]]);
  }
  return {detailStages:groups,details:decorations};
}
function paintedArtwork(profile,step,variant,w,n){
  const keys=["S","A","B","C","D"].slice(0,[2,2,3,4,5][step-1]);
  const hex=["#e4eff6","#ea9ab1","#f1c77d","#83bcb0","#ad9ccc"];
  const names=["Sky","Rose","Gold","Teal","Lilac"];
  const colours=Object.fromEntries(keys.map((key,i)=>[key,{name:names[i],hex:hex[i]}]));
  const rows=outline(profile,w,n);
  const grid=rows.map(([a,b],i)=>{
    const line=Array(w).fill("S");
    const fillKey=keys[1+(Math.floor(i/Math.max(1,Math.ceil(n/(keys.length-1))))+variant)%(keys.length-1)];
    for(let x=a;x<=b;x++)line[x]=fillKey;
    return line.join("");
  });
  return {backgroundId:"S",colours,grid};
}
export const MYSTERY_BANK=Object.freeze(Object.entries(THEMES).flatMap(([mode,steps])=>
  steps.flatMap((themes,stageIndex)=>themes.map(([name,clue,shape],variant)=>{
    const tier=stageIndex+1,n=count[stageIndex],
      half=mode==="mirror",w=half?[6,7,8,9,10][stageIndex]:width[stageIndex];
    const profile=PROFILES[shape],rows=mode==="paint"?
      Array.from({length:n},()=>[0,w-1]):
      outline(profile,w,n,{mirror:half});
    const [base,edge,accent]=SHADES[(stageIndex+variant+Object.keys(THEMES).indexOf(mode))%SHADES.length];
    const [bg,light,shade]=BACKS[(stageIndex+variant)%BACKS.length];
    const art=mode==="paint"?
      paintedArtwork(profile,tier,variant,w,n):null;
    const outlineRows=art?outline(profile,w,n):rows;
    const marks=decorations(outlineRows,half?"half":"full",w,n,
      ["#fff8db","#fce0d8","#b6d9cd"]);
    return Object.freeze({
      id:"bank-"+mode+"-"+tier+"-"+(variant+1),
      name,clue,description:"A new "+name.toLowerCase()+" to uncover, one inequality at a time.",
      family:half?"half":"full",levels:[mode],
      window:{min:-Math.floor(w/2),max:Math.ceil(w/2)},
      axis:mode==="mixed"?{min:-w/2-1,max:w/2+1}:undefined,
      height:n+2,rows,
      legacyMathStage:{[mode]:tier},
      mysteryBank:true,
      palette:{base,edge,bands:[{from:Math.max(1,Math.floor(n*.65)),to:n,fill:accent}]},
      background:{base:bg,light,shade,sparkle:"#fff9d7"},
      detailStages:marks.detailStages,details:marks.details,
      ...(art?{paint:art}:{}),
    });
  }))
));
