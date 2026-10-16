// A persistent, read-only collection of Graph Art completions across all four modes.
// Separate from the game saves so replaying a picture cannot remove a discovery.
import {
  GRAPH_ART_PICTURES,GRAPH_PRACTICE_PICTURES,GRAPH_ART_STAGES,
  GRAPH_ART_SAVE_KEY,GRAPH_ART_LEGACY_SAVE_KEY
} from "./graph-art-pictures.mjs";
import {CURVE_PICTURES,CURVE_PRACTICE_PICTURES} from "./curve-pictures.mjs";
import {PLOT_PICTURES,PLOT_PRACTICE_PICTURES} from "./plot-pictures.mjs";

export const GRAPH_MURAL_ACHIEVEMENTS_KEY="inequality-ink-graph-mural-v1";
export const GRAPH_MURAL_WIDTH=5600;
export const GRAPH_MURAL_HEIGHT=890;
export const GRAPH_MURAL_ZONE_WIDTH=1120;
export const GRAPH_MURAL_MODES=Object.freeze([
  Object.freeze({id:"all",name:"All modes"}),
  Object.freeze({id:"fill",name:"Find & Fill"}),
  Object.freeze({id:"build",name:"Build & Shade"}),
  Object.freeze({id:"curve",name:"Curve & Fill"}),
  Object.freeze({id:"plot",name:"Plot & Shade"})
]);
export const GRAPH_MURAL_ZONES=Object.freeze(GRAPH_ART_STAGES.map((stage,i)=>
  Object.freeze({id:"tier-"+stage.step,step:stage.step,name:stage.name,
    subtitle:stage.summary,x:i*GRAPH_MURAL_ZONE_WIDTH})));
export const graphMuralKey=(mode,id)=>mode+":"+id;

export const GRAPH_MURAL_PICTURES=Object.freeze([
  ...[...GRAPH_ART_PICTURES,...GRAPH_PRACTICE_PICTURES].map(p=>
    Object.freeze({key:graphMuralKey(p.mode,p.id),mode:p.mode,
      step:p.step,picture:p})),
  ...[...CURVE_PICTURES,...CURVE_PRACTICE_PICTURES].map(p=>
    Object.freeze({key:graphMuralKey("curve",p.id),mode:"curve",
      step:p.step,picture:p})),
  ...[...PLOT_PICTURES,...PLOT_PRACTICE_PICTURES].map(p=>
    Object.freeze({key:graphMuralKey("plot",p.id),mode:"plot",
      step:p.step,picture:p}))
]);
const byKey=new Map(GRAPH_MURAL_PICTURES.map(entry=>[entry.key,entry]));
export const graphMuralEntry=key=>byKey.get(key)||null;
function readSafe(storage,key){
  try{
    const data=JSON.parse(storage?.getItem(key)??"null");
    return data&&typeof data==="object"?data:null;
  }catch{return null;}
}
function isFinished(record,entry){
  return Number.isInteger(record?.done)&&record.done===entry.picture.pieces.length;
}
export function completedGraphMuralIds(storage){
  const completed=new Set();
  const linear=readSafe(storage,GRAPH_ART_SAVE_KEY);
  const curve=readSafe(storage,"inequality-ink-curve-fill-v2");
  const plot=readSafe(storage,"inequality-ink-plot-shade-v2");
  const oldLinear=readSafe(storage,GRAPH_ART_LEGACY_SAVE_KEY);
  const oldCurve=readSafe(storage,"inequality-ink-curve-fill-prototype-v1");
  const oldPlot=readSafe(storage,"inequality-ink-plot-shade-prototype-v1");
  for(const entry of GRAPH_MURAL_PICTURES){
    const p=entry.picture;
    if(entry.mode==="fill"||entry.mode==="build"){
      // Older versions could offer a picture in either linear mode.
      const records=linear?.records||{};
      if(isFinished(records["fill:"+p.id],entry)||
         isFinished(records["build:"+p.id],entry)||
         (p.id==="aurora-crystal"&&oldLinear?.done===p.pieces.length))
        completed.add(entry.key);
    }else if(entry.mode==="curve"){
      if(isFinished(curve?.records?.[p.id],entry)||
         (p.id==="parabola-butterfly"&&isFinished(oldCurve,entry)))
        completed.add(entry.key);
    }else if(isFinished(plot?.records?.[p.id],entry)||
      (p.id==="little-umbrella"&&isFinished(oldPlot,entry))){
      completed.add(entry.key);
    }
  }
  return completed;
}
export function graphMuralDiscoveredIds(storage){
  const found=completedGraphMuralIds(storage);
  const saved=readSafe(storage,GRAPH_MURAL_ACHIEVEMENTS_KEY);
  if(Array.isArray(saved?.ids))for(const id of saved.ids)
    if(typeof id==="string"&&byKey.has(id))found.add(id);
  return found;
}
export function rememberGraphMuralDiscoveries(storage){
  const completed=graphMuralDiscoveredIds(storage);
  try{
    storage?.setItem(GRAPH_MURAL_ACHIEVEMENTS_KEY,
      JSON.stringify({version:1,ids:[...completed].sort()}));
  }catch{}
  return completed;
}

// Slots come from the whole catalogue, never the student's unlocked subset.
// This keeps each artwork in a fixed spot as the mural fills up.
export function graphMuralPlacements(entries=GRAPH_MURAL_PICTURES){
  const placed=new Map();
  for(const zone of GRAPH_MURAL_ZONES){
    const tier=entries.filter(entry=>entry.step===zone.step)
      .sort((a,b)=>a.key.localeCompare(b.key));
    if(tier.length>48)throw Error("Graph mural tier exceeds its 48 stable slots: "+zone.name);
    tier.forEach((entry,i)=>{
      const column=i%8,row=Math.floor(i/8);
      const hash=[...entry.key].reduce((n,c)=>(n*33+c.charCodeAt(0))>>>0,5381);
      const jitterX=(hash%9)-4,jitterY=((hash>>>9)%11)-5;
      const scale=.194+((hash>>>17)%9)*.0015;
      placed.set(entry.key,Object.freeze({
        key:entry.key,zone:zone.id,step:zone.step,
        x:zone.x+8+column*140+jitterX,
        y:115+row*128+jitterY,scale
      }));
    });
  }
  return placed;
}
export function graphMuralReplayUrl(entry){
  if(!entry)return "./";
  const id=encodeURIComponent(entry.picture.id);
  if(entry.mode==="curve")return "./curve.html?picture="+id;
  if(entry.mode==="plot")return "./plot.html?picture="+id;
  return "./?mode="+encodeURIComponent(entry.mode)+"&picture="+id+"&from=mural";
}
