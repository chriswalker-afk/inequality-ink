import {WORLD,PICTURE,regionPaths,boundaryPoints,satisfiesAll,validatePicture} from "./curved-engine.mjs";
validatePicture();
const NS="http://www.w3.org/2000/svg",S=620,P=53,U=S-2*P,px=x=>P+(x-WORLD.xmin)*U/10,py=y=>P+(WORLD.ymax-y)*U/10;
const $=id=>document.getElementById(id),svg=$("graph");
const SAVE="inequality-ink-curve-fill-prototype-v1";
let done=0,selected=false,cursor={x:0,y:0},message="",tone="";
try{const saved=JSON.parse(localStorage.getItem(SAVE));if(saved?.done===1||saved?.done===2)done=saved.done;}catch{}
function el(tag,attrs={},parent=svg){const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);parent.append(e);return e;}
function path(points,close=false){return points.map((p,i)=>(i?"L":"M")+px(p.x).toFixed(2)+" "+py(p.y).toFixed(2)).join(" ")+(close?" Z":"");}
function text(x,y,str,attrs={}){const e=el("text",{x,y,fill:"#718b99","font-size":"13",...attrs});e.textContent=str;return e;}
function drawRegion(part,attrs){for(const pts of regionPaths(part.rules))el("path",{d:path(pts,true),...attrs,"pointer-events":"none"});}
function render(){
 svg.replaceChildren();
 el("rect",{x:P,y:P,width:U,height:U,rx:10,fill:"#fffcf8",stroke:"#d4ddd8","stroke-width":2});
 for(let n=-5;n<=5;n++){
 el("line",{x1:px(n),y1:P,x2:px(n),y2:S-P,stroke:"#7d98a0","stroke-opacity":n===0?".55":".19","stroke-width":n===0?2:1});
 el("line",{x1:P,y1:py(n),x2:S-P,y2:py(n),stroke:"#7d98a0","stroke-opacity":n===0?".55":".19","stroke-width":n===0?2:1});
 if(n!==0&&n%2===0){text(px(n),py(0)+18,String(n),{"text-anchor":"middle"});text(px(0)-11,py(n)+5,String(n),{"text-anchor":"end"});}
 }
 text(px(5)-12,py(0)-11,"x",{"font-size":"17"});text(px(0)+10,py(5)+22,"y",{"font-size":"17"});
 PICTURE.pieces.slice(0,done).forEach(part=>drawRegion(part,{fill:part.color,stroke:"#fff9ee","stroke-width":"1"}));
 if(done<2){
 const part=PICTURE.pieces[done];
 if(selected)drawRegion(part,{fill:part.color,"fill-opacity":".67",stroke:"#358a78","stroke-width":"1"});
 for(const rule of part.rules){
   const paths=boundaryPoints(rule);const list=rule.kind==="vertical"?[paths]:paths;
   for(const pts of list)if(pts.length>1)el("path",{d:path(pts),fill:"none",stroke:rule.kind==="function"?"#416e9a":"#66778f","stroke-width":"3","stroke-dasharray":rule.inclusive?"":"9 7","pointer-events":"none"});
 }
 el("circle",{cx:px(cursor.x),cy:py(cursor.y),r:7,fill:"none",stroke:"#2a9476","stroke-width":2,"stroke-dasharray":"3 3","pointer-events":"none"});
 }
 $("progress").textContent=done+" / 2 pieces";
 $("pieceLabel").textContent=done<2?"PIECE "+(done+1)+" OF 2":"PICTURE FINISHED";
 $("pieceName").textContent=done<2?PICTURE.pieces[done].name:PICTURE.name;
 $("rules").replaceChildren();
 if(done<2)for(const r of PICTURE.pieces[done].rules){
 const item=document.createElement("div");item.className="rule";
 const t=document.createElement("span");t.textContent=r.text;
 const small=document.createElement("small");small.textContent=r.inclusive?"solid":"dashed";
 item.append(t,small);$("rules").append(item);
 }
 $("complete").hidden=done!==2;
 $("check").disabled=done===2||!selected;$("undo").disabled=done===2||!selected;
 $("feedback").textContent=message|| (done===2?"You made a butterfly from two curved intersections.":"Select the region satisfying all three inequalities.");
 $("feedback").className="feedback "+tone;
}
function pick(x,y){
 if(done===2)return;
 if(x<=-5||x>=5||y<=-5||y>=5)return;
 const part=PICTURE.pieces[done];
 // Distance tolerance avoids ambiguous taps exactly on a boundary.
 const near=part.rules.some(r=>r.kind==="vertical"?Math.abs(x-r.x)<.09:Math.abs(y-r.coeffs.reduce((s,c,i)=>s+c*x**i,0))<.12);
 if(near){message="Choose a point farther from the boundary.";tone="";selected=false;}
 else if(satisfiesAll(part.rules,x,y)){selected=true;message="Correct region selected! Press Check region.";tone="success";}
 else{selected=false;message="Not quite. This point does not satisfy every inequality. Try again.";tone="error";}
 render();
}
function reset(){done=0;selected=false;cursor={x:0,y:0};message="";tone="";localStorage.setItem(SAVE,JSON.stringify({done}));render();}
$("check").addEventListener("click",()=>{if(!selected||done>=2)return;done++;selected=false;message=done===2?"Both wings complete — beautiful maths!":"Great! The first wing is painted. Now find the other wing.";tone="success";localStorage.setItem(SAVE,JSON.stringify({done}));render();});
$("undo").addEventListener("click",()=>{selected=false;message="Selection cleared.";tone="";render();});
$("reset").addEventListener("click",reset);$("replay").addEventListener("click",reset);
$("hint").addEventListener("click",()=>{if(done===2)return;message=done===0?"Look between the two parabolas, to the LEFT of the y-axis. Try (−1, 0).":"Look between the two parabolas, to the RIGHT of the y-axis. Try (1, 0). The vertical line is dashed.";tone="";render();});
svg.addEventListener("click",ev=>{const b=svg.getBoundingClientRect();if(!b.width)return;const x=-5+((ev.clientX-b.left)/b.width*S-P)*10/U;const y=5-((ev.clientY-b.top)/b.height*S-P)*10/U;pick(x,y);});
svg.addEventListener("keydown",ev=>{const dirs={ArrowLeft:[-.5,0],ArrowRight:[.5,0],ArrowUp:[0,.5],ArrowDown:[0,-.5]};if(dirs[ev.key]){ev.preventDefault();cursor.x=Math.max(-4.5,Math.min(4.5,cursor.x+dirs[ev.key][0]));cursor.y=Math.max(-4.5,Math.min(4.5,cursor.y+dirs[ev.key][1]));message="Cursor at ("+cursor.x+", "+cursor.y+"). Press Enter to select.";tone="";render();}else if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();pick(cursor.x,cursor.y);}});
render();
