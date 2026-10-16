// Difficulty-first mystery selection shared by all four Graph Art modes.
// No question data or saved game records are changed by this helper.
export const GRAPH_MYSTERY_TIER_SAVE="inequality-ink-graph-mystery-tiers-v1";
export const GRAPH_MYSTERY_LEVELS=Object.freeze([
  Object.freeze({step:1,name:"Quick Spark",summary:"A quick first success"}),
  Object.freeze({step:2,name:"Step Up",summary:"Build on the basics"}),
  Object.freeze({step:3,name:"Ink Builder",summary:"More mathematical connections"}),
  Object.freeze({step:4,name:"Brain Stretch",summary:"Think a little deeper"}),
  Object.freeze({step:5,name:"Masterpiece",summary:"The biggest challenge"})
]);
export const GRAPH_MYSTERY_MODES=Object.freeze(["fill","build","curve","plot"]);
const validTier=n=>Number.isInteger(n)&&n>=1&&n<=5;
export function graphMysteryPool(mode,tier,core=[],practice=[]){
  if(!GRAPH_MYSTERY_MODES.includes(mode)||!validTier(tier))return [];
  const seen=new Set();
  return [...core,...practice].filter(p=>{
    // Reverse-reading uses different controls, so it remains an explicit
    // optional gallery challenge rather than an unexpected random task.
    if(!p||p.mode!==mode||p.step!==tier||
       p.practiceType==="reverse"||seen.has(p.id))return false;
    seen.add(p.id);return true;
  });
}
export function graphMysteryFinished(p,record){
  return Number(record?.done)===p.pieces.length;
}
export function graphMysteryStarted(record){
  if(!record||typeof record!=="object")return false;
  return Number(record.done)>0||Number(record.line)>0||
    Number(record.plotIndex)>0||
    (Array.isArray(record.points)&&record.points.length>0)||
    (Array.isArray(record.verified)&&record.verified.length>0)||
    (record.phase!==undefined&&record.phase!=="plot");
}
export function graphMysteryStatus(pictures,getRecord){
  const solved=[],partial=[],fresh=[];
  for(const p of pictures){
    const record=getRecord(p);
    if(graphMysteryFinished(p,record))solved.push(p);
    else if(graphMysteryStarted(record))partial.push(p);
    else fresh.push(p);
  }
  return {solved,partial,fresh,total:pictures.length,
    remaining:partial.length+fresh.length};
}
export function graphPickMystery(pictures,getRecord,random=Math.random){
  const {fresh,partial}=graphMysteryStatus(pictures,getRecord);
  const options=fresh.length?fresh:partial;
  if(!options.length)return null; // Never auto-replay a completed picture.
  const value=Number(random());
  const index=Math.min(options.length-1,Math.max(0,
    Math.floor((Number.isFinite(value)?value:0)*options.length)));
  return options[index];
}
export function graphContinueMystery(pictures,getRecord){
  return graphMysteryStatus(pictures,getRecord).partial[0]||null;
}
export function readGraphMysteryTiers(storage){
  let data;
  try{data=JSON.parse(storage?.getItem(GRAPH_MYSTERY_TIER_SAVE));}catch{}
  const result={};
  for(const mode of GRAPH_MYSTERY_MODES){
    const n=data?.[mode];
    if(validTier(n))result[mode]=n;
  }
  return result;
}
export function saveGraphMysteryTiers(storage,choices){
  const valid={};
  for(const mode of GRAPH_MYSTERY_MODES)
    if(validTier(choices?.[mode]))valid[mode]=choices[mode];
  try{storage?.setItem(GRAPH_MYSTERY_TIER_SAVE,JSON.stringify(valid));}catch{}
}
