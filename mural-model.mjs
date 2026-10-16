// My Mural model: stable layout and an archive independent of replays.
// The game save stays unchanged; only completed Pixel Art creates rewards.
import {PICTURE_LIBRARY,questionCount,fullPictureWidth} from "./picture-engine.mjs";
export const MURAL_ACHIEVEMENTS_KEY="inequality-ink-mural-v1";
export const MURAL_GAME_KEY="inequality-ink-v5";
export const MURAL_WIDTH=5400,MURAL_HEIGHT=820;
export const MURAL_ZONES=Object.freeze([
  Object.freeze({id:"garden",name:"The Garden",subtitle:"Seeds of discovery",x:0}),
  Object.freeze({id:"village",name:"The Village",subtitle:"A world of ideas",x:1080}),
  Object.freeze({id:"coast",name:"The Coast",subtitle:"Beyond the shoreline",x:2160}),
  Object.freeze({id:"highlands",name:"The Highlands",subtitle:"Adventure awaits",x:3240}),
  Object.freeze({id:"sky",name:"The Sky",subtitle:"Anything is possible",x:4320})
]);
const ROWS=5,COLUMNS=9,SLOTS=ROWS*COLUMNS;
const fallbackModes=["mirror","full","solve","mixed","paint"];
const keywords={
  garden:["bee","butterfly","flower","tulip","plant","forest","pine","evergreen",
    "tree","leaf","cactus","acorn","bird","ladybird","spruce","sapling","mushroom",
    "garden","cherry","parrot","honey","apple","nest","rose","strawberry"],
  village:["house","cottage","castle","tower","village","bus","train","robot",
    "cupcake","trophy","medal","pencil","guitar","gift","present","cake","pot",
    "candle","cocoa","cup","bottle","lantern","windmill","lighthouse","hat",
    "ice cream","icecream","party","door","home","snow globe"],
  coast:["ocean","sea","fish","boat","sail","mermaid","submarine","underwater",
    "undersea","beach","wave","whale","turtle","pirate","coral","jellyfish",
    "shell","crab","dive","octopus","water","coast"],
  highlands:["mountain","volcano","snow","tent","hill","rock","peak","dragon",
    "pyramid","crystal","gem","diamond","prism","shield","winter","treasure",
    "scout","hourglass","stone","desert","cave","gnome","camp"],
  sky:["rocket","planet","cloud","sun","moon","rainbow","balloon","airplane",
    "plane","kite","orbit","galaxy","comet","sky","star","space","astronaut",
    "firework","meteor","spaceship","space cruiser","flight"]
};
export function muralHash(value){
  let hash=2166136261;
  for(const char of String(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}
  return hash>>>0;
}
export function muralPreferredZone(picture){
  const words=(picture.id+" "+picture.name+" "+(picture.clue||"")).toLowerCase();
  let best=-1,weight=0;
  for(const [i,zone] of MURAL_ZONES.entries()){
    const hits=keywords[zone.id].filter(term=>words.includes(term)).length;
    if(hits>weight){best=i;weight=hits;}
  }
  return best===-1?muralHash(picture.id)%MURAL_ZONES.length:best;
}
export function muralPlacements(pictures=PICTURE_LIBRARY){
  const buckets=MURAL_ZONES.map(()=>[]);
  // Assign from the complete fixed catalogue, never from unlocked pictures.
  const sorted=[...pictures].sort((a,b)=>a.id.localeCompare(b.id));
  for(const picture of sorted){
    let zone=muralPreferredZone(picture);
    if(buckets[zone].length>=SLOTS){
      zone=buckets.map((b,i)=>({i,length:b.length})).
        filter(a=>a.length<SLOTS).sort((a,b)=>a.length-b.length||a.i-b.i)[0]?.i;
    }
    if(zone===undefined)throw Error("Not enough stable mural locations");
    buckets[zone].push(picture);
  }
  const placement=new Map();
  for(let zone=0;zone<MURAL_ZONES.length;zone++){
    for(const [i,picture] of buckets[zone].entries()){
      // 17 is coprime to 45: no two items in a zone share a slot.
      const slot=(i*17+zone*11+7)%SLOTS;
      const column=slot%COLUMNS,row=Math.floor(slot/COLUMNS);
      const seed=muralHash(picture.id);
      const width=fullPictureWidth(picture),height=picture.height;
      const scale=Math.min(100/width,88/height);
      const realWidth=width*scale,realHeight=height*scale;
      const baseline=[365,350,360,318,210][zone];
      const rowStep=[88,88,88,96,96][zone];
      const jitterX=(seed%13)-6,jitterY=(Math.floor(seed/13)%13)-6;
      const x=MURAL_ZONES[zone].x+60+column*112+jitterX-realWidth/2;
      const y=Math.min(MURAL_HEIGHT-realHeight-20,baseline+row*rowStep+jitterY);
      placement.set(picture.id,Object.freeze({
        id:picture.id,zone:MURAL_ZONES[zone].id,x,y,scale,
        width:realWidth,height:realHeight,sortKey:y+realHeight
      }));
    }
  }
  return placement;
}
function parseSafe(value){
  if(typeof value!=="string")return null;
  try{return JSON.parse(value);}catch{return null;}
}
function readSafe(storage,key){
  try{return parseSafe(storage?.getItem(key));}catch{return null;}
}
export function completedIdsFromProgress(progress,pictures=PICTURE_LIBRARY){
  const found=new Set();
  if(!progress||typeof progress!=="object")return found;
  for(const p of pictures){
    if(p.levels.some(mode=>{
      const record=progress[mode+":"+p.id];
      return record?.completed===true||Number.isInteger(record?.done)&&
        record.done>=questionCount(p);
    }))found.add(p.id);
  }
  return found;
}
export function muralDiscoveredIds(storage,pictures=PICTURE_LIBRARY){
  const allowed=new Set(pictures.map(p=>p.id)),result=new Set();
  const prior=readSafe(storage,MURAL_ACHIEVEMENTS_KEY);
  if(Array.isArray(prior?.ids))for(const id of prior.ids)
    if(typeof id==="string"&&allowed.has(id))result.add(id);
  const current=readSafe(storage,MURAL_GAME_KEY);
  for(const id of completedIdsFromProgress(current?.progress,pictures))result.add(id);
  // The homepage migrates old saves. A read-only fallback also lets a student
  // visit the mural directly before opening the homepage on this browser.
  if(!current){
    const legacy=readSafe(storage,"inequality-ink-v4")||
      readSafe(storage,"inequality-ink-v3")||
      readSafe(storage,"inequality-ink-v2");
    const oldIds={mirror:"cat-cameo",full:"mushroom-mystery",
      solve:"mushroom-mystery",mixed:"mushroom-mystery",paint:"paint-rocket"};
    for(const mode of fallbackModes){
      const p=pictures.find(pic=>pic.id===oldIds[mode]);
      const row=legacy?.progress?.[mode];
      if(p&&(row?.completed===true||row?.done>=questionCount(p)))result.add(p.id);
    }
  }
  return result;
}
export function rememberMuralDiscoveries(storage,progress={},id=null,
  pictures=PICTURE_LIBRARY){
  const known=new Set(pictures.map(p=>p.id));
  const found=muralDiscoveredIds(storage,pictures);
  for(const key of completedIdsFromProgress(progress,pictures))found.add(key);
  if(typeof id==="string"&&known.has(id))found.add(id);
  const ids=[...found].sort();
  try{storage?.setItem(MURAL_ACHIEVEMENTS_KEY,
    JSON.stringify({version:1,ids}));}catch{}
  return new Set(ids);
}
export function muralModesFor(picture,storage){
  const progress=readSafe(storage,MURAL_GAME_KEY)?.progress||{};
  const finished=picture.levels.filter(mode=>{
    const row=progress[mode+":"+picture.id];
    return row?.completed===true||row?.done>=questionCount(picture);
  });
  return finished.length?finished:[picture.levels[0]];
}
