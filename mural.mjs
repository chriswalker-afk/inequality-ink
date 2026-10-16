// Connected My Mural experience. No hidden pictures are mounted in the DOM.
// The same mathematical pixel-art definitions as the game render every reward.
import {PICTURE_LIBRARY,fullPictureWidth,questionCount} from "./picture-engine.mjs";
import {muralSpritePaths} from "./mural-art.mjs";
import {
  MURAL_ZONES,MURAL_WIDTH,muralPlacements,muralDiscoveredIds,
  rememberMuralDiscoveries,muralModesFor
} from "./mural-model.mjs";

const $=id=>document.getElementById(id);
const SVG_NS="http://www.w3.org/2000/svg";
const library=new Map(PICTURE_LIBRARY.map(p=>[p.id,p]));
const places=muralPlacements();
const viewport=$("muralViewport"),world=$("muralWorld");
const details=$("muralDetails");
const prefersReduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
function safeStorage(){
  try{return window.localStorage;}catch{return null;}
}
function element(tag,attrs={},parent){
  const node=document.createElementNS(SVG_NS,tag);
  for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));
  if(parent)parent.append(node);
  return node;
}
function paintPaths(picture,parent){
  for(const {fill,d} of muralSpritePaths(picture))
    element("path",{d,fill,"shape-rendering":"crispEdges"},parent);
}
// Exported for browser-free mathematical/unit verification.
export function replayUrlFor(picture,mode){
  const available=picture.levels.includes(mode)?mode:picture.levels[0];
  return "./?muralMode="+encodeURIComponent(available)+
    "&muralPicture="+encodeURIComponent(picture.id);
}
let activeId=null;
function showDiscovery(picture){
  activeId=picture.id;
  $("muralPictureName").textContent=picture.name;
  $("muralPictureStory").textContent=picture.clue+
    " · "+questionCount(picture)+" inequalities · "+
    "Discovered through mathematics";
  const graphic=$("muralDetailArt");
  graphic.replaceChildren();
  graphic.setAttribute("viewBox","0 0 "+fullPictureWidth(picture)+" "+picture.height);
  graphic.setAttribute("aria-label",picture.name+", your completed artwork");
  paintPaths(picture,graphic);
  const modes=muralModesFor(picture,safeStorage());
  const visit=modes[0];
  $("muralReplay").href=replayUrlFor(picture,visit);
  $("muralReplay").textContent="Revisit in "+({
    mirror:"Mirror Mode",full:"Full Picture",solve:"Solve & Paint",
    mixed:"Mixed Challenge",paint:"Paint by Inequalities"
  }[visit]||"Pixel Art")+" ↗";
  if(typeof details.showModal==="function")details.showModal();
  else details.setAttribute("open","");
  $("muralClose").focus();
}
function itemNode(picture,place,isRecent){
  const g=element("g",{
    "class":"mural-discovery"+(isRecent?" recently-found":""),
    "data-picture-id":picture.id,
    role:"button",tabindex:"0",
    "aria-label":"Open completed picture: "+picture.name,
    transform:"translate("+place.x+" "+place.y+") scale("+place.scale+")"
  });
  element("title",{},g).textContent=picture.name+" — discovered";
  const w=fullPictureWidth(picture),h=picture.height;
  element("rect",{x:-1.2,y:-1.2,width:w+2.4,height:h+2.4,
    fill:"transparent","pointer-events":"all"},g);
  element("rect",{"class":"mural-focus-ring",x:-1.4,y:-1.4,
    width:w+2.8,height:h+2.8,rx:1,fill:"none"},g);
  const sprite=element("g",{"class":"mural-sprite","aria-hidden":"true"},g);
  paintPaths(picture,sprite);
  g.addEventListener("click",()=>showDiscovery(picture));
  g.addEventListener("keydown",event=>{
    if(event.key==="Enter"||event.key===" "){
      event.preventDefault();showDiscovery(picture);
    }
  });
  return g;
}
function scrollToWorldX(worldX,{instant=false}={}){
  const ratio=world.getBoundingClientRect().width/MURAL_WIDTH;
  const center=worldX*ratio-viewport.clientWidth/2;
  const max=viewport.scrollWidth-viewport.clientWidth;
  viewport.scrollTo({left:Math.max(0,Math.min(max,center)),
    behavior:instant||prefersReduced()?"auto":"smooth"});
}
function openZone(zoneId,options={}){
  const zone=MURAL_ZONES.find(z=>z.id===zoneId);
  if(zone)scrollToWorldX(zone.x+540,options);
}
function updateActiveZone(){
  const x=(viewport.scrollLeft+viewport.clientWidth/2)*
    MURAL_WIDTH/world.getBoundingClientRect().width;
  let active=0;
  for(let i=1;i<MURAL_ZONES.length;i++)
    if(x>=MURAL_ZONES[i].x)active=i;
  for(const button of document.querySelectorAll("[data-mural-zone]")){
    if(button.dataset.muralZone===MURAL_ZONES[active].id)
      button.setAttribute("aria-current","true");
    else button.removeAttribute("aria-current");
  }
}
let lastSignature="";
function renderMural(){
  const storage=safeStorage();
  // Also archives existing completions, so replay cannot erase a discovery.
  const collected=rememberMuralDiscoveries(storage);
  const ids=[...collected].filter(id=>library.has(id));
  const signature=ids.slice().sort().join("|");
  $("muralCount").textContent=String(ids.length);
  $("muralTotal").textContent=String(PICTURE_LIBRARY.length);
  $("muralBar").style.width=100*ids.length/PICTURE_LIBRARY.length+"%";
  $("muralEmpty").hidden=ids.length!==0;
  if(signature===lastSignature)return;
  lastSignature=signature;
  const urlParams=new URLSearchParams(window.location.search);
  const recentlyFound=urlParams.get("found");
  const all=ids.map(id=>({picture:library.get(id),place:places.get(id)})).
    filter(({place})=>!!place).sort((a,b)=>a.place.sortKey-b.place.sortKey);
  const layer=$("muralItems");
  layer.replaceChildren();
  const pieces=all.map(({picture,place})=>
    itemNode(picture,place,picture.id===recentlyFound));
  layer.append(...pieces);
  if(recentlyFound&&collected.has(recentlyFound)){
    const place=places.get(recentlyFound);
    if(place)requestAnimationFrame(()=>scrollToWorldX(
      place.x+place.width/2,{instant:true}));
  }
}
for(const button of document.querySelectorAll("[data-mural-zone]")){
  button.addEventListener("click",()=>openZone(button.dataset.muralZone));
}
viewport.addEventListener("scroll",updateActiveZone,{passive:true});
window.addEventListener("resize",updateActiveZone);
window.addEventListener("storage",renderMural);
window.addEventListener("pageshow",renderMural);
document.addEventListener("visibilitychange",()=>{
  if(!document.hidden)renderMural();
});
$("muralClose").addEventListener("click",()=>details.close());
$("muralDone").addEventListener("click",()=>details.close());
details.addEventListener("click",event=>{if(event.target===details)details.close();});
renderMural();
updateActiveZone();
