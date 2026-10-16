import {
  GRAPH_MURAL_PICTURES,GRAPH_MURAL_MODES,GRAPH_MURAL_ZONES,
  GRAPH_MURAL_WIDTH,graphMuralPlacements,graphMuralEntry,
  graphMuralReplayUrl,rememberGraphMuralDiscoveries
} from "./graph-mural-model.mjs";
import {drawGraphMuralArt} from "./graph-mural-art.mjs";
const $=id=>document.getElementById(id),SVG="http://www.w3.org/2000/svg";
const viewport=$("muralViewport"),world=$("muralWorld"),dialog=$("discoveryDialog");
const placements=graphMuralPlacements();
let filter="all",previousSignature="",discovered=new Set();
const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
function create(tag,attrs={},parent){
  const el=document.createElementNS(SVG,tag);
  for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));
  if(parent)parent.append(el);return el;
}
function storage(){try{return window.localStorage;}catch{return null;}}
function showDetails(entry){
  $("discoveryTitle").textContent=entry.picture.name;
  const mode=GRAPH_MURAL_MODES.find(x=>x.id===entry.mode)?.name||"Graph Art";
  $("discoveryDescription").textContent=mode+" · "+
    GRAPH_MURAL_ZONES[entry.step-1].name+" · "+
    entry.picture.pieces.length+" mathematical regions";
  $("discoverySkills").textContent=entry.picture.focus||entry.picture.description||"";
  const detail=$("detailSvg");detail.replaceChildren();
  detail.setAttribute("aria-label","Completed Graph Art picture: "+entry.picture.name);
  drawGraphMuralArt(detail,entry);
  $("replayLink").href=graphMuralReplayUrl(entry);
  $("replayLink").textContent="Revisit in "+mode+" ↗";
  if(dialog.showModal)dialog.showModal();else dialog.setAttribute("open","");
  $("closeDialog").focus();
}
function drawLabels(){
  const host=$("muralLabels");
  for(const zone of GRAPH_MURAL_ZONES){
    const x=zone.x+54;
    create("text",{x,y:62,class:"label-text"},host).textContent=
      String(zone.step).padStart(2,"0")+"  "+zone.name;
    create("text",{x,y:94,class:"label-small"},host).textContent=zone.subtitle;
    if(zone.step>1)create("path",{d:"M"+zone.x+" 0V890",stroke:"#b8cfc5",
      "stroke-width":2,"stroke-dasharray":"9 12","stroke-opacity":.65},host);
    create("circle",{cx:zone.x+1000,cy:73,r:18,fill:"#e1f1e4",
      stroke:"#b9d6c6","stroke-width":2},host);
    create("text",{x:zone.x+1000,y:80,"font-size":20,"text-anchor":"middle",
      fill:"#5d967f","font-weight":850},host).textContent="✦";
  }
}
function artNode(entry,recent){
  const place=placements.get(entry.key);
  if(!place)return null;
  const group=create("g",{
    class:"mural-object"+(recent?" arrived":""),
    transform:"translate("+place.x+" "+place.y+") scale("+place.scale+")",
    role:"button",tabindex:"0","data-discovery":entry.key,
    "aria-label":"Open completed "+entry.picture.name+", "+
      GRAPH_MURAL_MODES.find(x=>x.id===entry.mode)?.name
  });
  create("title",{},group).textContent=entry.picture.name+" · completed";
  create("rect",{x:6,y:6,width:608,height:608,rx:25,fill:"transparent",
    "pointer-events":"all"},group);
  create("rect",{x:4,y:4,width:612,height:612,rx:22,class:"focus",
    fill:"none",stroke:"#de8c70","stroke-width":10},group);
  const artwork=create("g",{class:"art","pointer-events":"none"},group);
  drawGraphMuralArt(artwork,entry);
  group.addEventListener("click",()=>showDetails(entry));
  group.addEventListener("keydown",e=>{
    if(e.key==="Enter"||e.key===" "){e.preventDefault();showDetails(entry);}
  });
  return group;
}
function openZone(zoneId,instant=false){
  const zone=GRAPH_MURAL_ZONES.find(z=>z.id===zoneId);
  if(!zone)return;
  const ratio=world.getBoundingClientRect().width/GRAPH_MURAL_WIDTH;
  const left=(zone.x+560)*ratio-viewport.clientWidth/2;
  viewport.scrollTo({left:Math.max(0,Math.min(left,viewport.scrollWidth-viewport.clientWidth)),
    behavior:instant||reduced()?"auto":"smooth"});
}
function updateZone(){
  const width=world.getBoundingClientRect().width;
  if(!width)return;
  const x=(viewport.scrollLeft+viewport.clientWidth/2)*GRAPH_MURAL_WIDTH/width;
  let active=GRAPH_MURAL_ZONES[0];
  for(const z of GRAPH_MURAL_ZONES)if(x>=z.x)active=z;
  for(const b of document.querySelectorAll("[data-zone]")){
    if(b.dataset.zone===active.id)b.setAttribute("aria-current","true");
    else b.removeAttribute("aria-current");
  }
}
function render(){
  discovered=rememberGraphMuralDiscoveries(storage());
  $("foundCount").textContent=discovered.size;
  $("totalCount").textContent=GRAPH_MURAL_PICTURES.length;
  $("progressFill").style.width=(100*discovered.size/GRAPH_MURAL_PICTURES.length)+"%";
  const visible=GRAPH_MURAL_PICTURES.filter(entry=>
    discovered.has(entry.key)&&(filter==="all"||entry.mode===filter));
  $("emptyNote").textContent=visible.length?
    "Your completed pictures stay in this world even when you replay them.":
    filter!=="all"&&discovered.size?
      "No discoveries in this challenge yet. Try another filter or keep creating.":
      "Finish your first Graph Art picture to make this world your own.";
  const signature=filter+"|"+visible.map(e=>e.key).join("|");
  if(signature===previousSignature)return;
  previousSignature=signature;
  const recent=new URLSearchParams(window.location.search).get("found");
  const nodes=visible.map(entry=>artNode(entry,entry.key===recent)).filter(Boolean);
  $("muralItems").replaceChildren(...nodes);
  if(recent&&visible.some(e=>e.key===recent)){
    const place=placements.get(recent);
    if(place)openZone(place.zone,true);
  }
}
drawLabels();
for(const b of document.querySelectorAll("[data-mode]")){
  b.addEventListener("click",()=>{
    filter=b.dataset.mode;
    for(const item of document.querySelectorAll("[data-mode]"))
      item.setAttribute("aria-pressed",String(item.dataset.mode===filter));
    render();
  });
}
for(const b of document.querySelectorAll("[data-zone]"))
  b.addEventListener("click",()=>openZone(b.dataset.zone));
viewport.addEventListener("scroll",updateZone,{passive:true});
window.addEventListener("resize",updateZone);
window.addEventListener("storage",render);
window.addEventListener("pageshow",render);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)render();});
$("closeDialog").addEventListener("click",()=>dialog.close());
$("doneDialog").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
render();
updateZone();
