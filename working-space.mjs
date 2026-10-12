// An optional, unmarked working pad for Solve & Paint.
// MathML is produced from escaped tokens and rendered natively by the browser.
// Handwritten strokes stay in memory for the current question only.
const SVG_NS="http://www.w3.org/2000/svg";
const esc=value=>String(value).replace(/&/g,"&amp;")
  .replace(/</g,"&lt;").replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;").replace(/'/g,"&#39;");

const tokenRe=/<=|>=|!=|->|\d+(?:\.\d+)?|[A-Za-z]+|[^\s]/gu;
const mathOps={
  "<=":"≤",">=":"≥","!=":"≠","->":"→","-":"−",
  "*":"×","/":"÷"
};
function mathsTokens(line){return line.match(tokenRe)||[];}
function parseLine(line){
  const tokens=mathsTokens(line);
  let index=0;
  function atom(){
    const raw=tokens[index++];
    if(raw==="("||raw==="["){
      const close=raw==="("?")":"]";
      return {kind:"group",open:raw,close,items:sequence(close)};
    }
    if(raw==="sqrt"&&tokens[index]==="("){
      index++;return {kind:"root",items:sequence(")")};
    }
    return {kind:/^\d/.test(raw)?"number":/^[A-Za-z]+$/.test(raw)?
      "identifier":/^[^A-Za-z0-9]$/.test(raw)?"operator":"text",value:raw};
  }
  function sequence(stop=null){
    const items=[];
    while(index<tokens.length){
      if(stop&&tokens[index]===stop){index++;break;}
      const op=tokens[index];
      const prior=items[items.length-1];
      if((op==="/"||op==="^")&&prior&&
        prior.kind!=="operator"&&index+1<tokens.length){
        index++;
        const after=atom();
        items.pop();
        items.push(op==="/"?{kind:"fraction",top:prior,bottom:after}:
          {kind:"power",base:prior,exponent:after});
      }else items.push(atom());
    }
    return items;
  }
  return sequence();
}
function renderNodes(nodes){return nodes.map(renderNode).join("");}
function asOperand(node){
  // Parentheses group the numerator, denominator or exponent.
  if(node.kind==="group"){
    return node.items.length?renderNodes(node.items):"<mi>□</mi>";
  }
  return renderNode(node);
}
function renderNode(node){
  switch(node.kind){
    case "number":return "<mn>"+esc(node.value)+"</mn>";
    case "identifier":return "<mi>"+esc(node.value)+"</mi>";
    case "operator":return "<mo>"+esc(mathOps[node.value]||node.value)+"</mo>";
    case "fraction":return "<mfrac><mrow>"+asOperand(node.top)+
      "</mrow><mrow>"+asOperand(node.bottom)+"</mrow></mfrac>";
    case "power":return "<msup><mrow>"+renderNode(node.base)+
      "</mrow><mrow>"+asOperand(node.exponent)+"</mrow></msup>";
    case "root":return "<msqrt><mrow>"+renderNodes(node.items)+"</mrow></msqrt>";
    case "group":return "<mrow><mo>"+esc(node.open)+"</mo>"+
      renderNodes(node.items)+"<mo>"+esc(node.close)+"</mo></mrow>";
    default:return "<mtext>"+esc(node.value||"")+"</mtext>";
  }
}
// Exported for browser-independent unit tests. Never inject raw user HTML.
export function renderMathWorking(source){
  const lines=String(source||"").slice(0,2000).split(/\r?\n/).slice(0,20)
    .map(line=>line.trim()).filter(Boolean);
  if(!lines.length)return '<span class="work-preview-empty">Your maths appears here as you type.</span>';
  return lines.map(line=>'<math xmlns="http://www.w3.org/1998/Math/MathML" '+
    'display="block" aria-label="'+esc(line)+'"><mrow>'+
    renderNodes(parseLine(line))+'</mrow></math>').join("");
}
export function insertMathWorking(value,start,end,key){
  const source=String(value||"");
  const left=Math.max(0,Math.min(source.length,Number.isInteger(start)?start:source.length));
  const right=Math.max(left,Math.min(source.length,Number.isInteger(end)?end:left));
  const selection=source.slice(left,right);
  let insert=key,offset=String(key).length;
  if(key==="brackets"){
    insert="("+selection+")";offset=selection?insert.length:1;
  }else if(key==="fraction"){
    insert=selection?"("+selection+")/()":"()/()";
    offset=selection?insert.length-1:1;
  }else if(key==="square"){
    // If the caret follows a variable, square it; otherwise insert x squared.
    insert=selection?"("+selection+")^2":
      /[A-Za-z0-9)]$/.test(source.slice(0,left))?"^2":"x^2";
    offset=insert.length;
  }else if(key==="newline"){
    insert="\n";offset=1;
  }else if(key==="backspace"){
    if(left===right&&left>0)return {
      value:source.slice(0,left-1)+source.slice(right),
      start:left-1,end:left-1
    };
    insert="";offset=0;
  }
  const position=left+offset;
  return {value:source.slice(0,left)+insert+source.slice(right),
    start:position,end:position};
}

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function workingPoint(event,rect){
  const width=Math.max(rect.width||0,1),height=Math.max(rect.height||0,1);
  const x=(event.clientX-(rect.left||0))/width*1000;
  const y=(event.clientY-(rect.top||0))/height*400;
  return {x:Math.round(clamp(x,0,1000)*10)/10,
    y:Math.round(clamp(y,0,400)*10)/10};
}
export function workingPath(points){
  if(!points.length)return "";
  const start=points[0];
  return "M"+start.x+" "+start.y+(points.length===1?" l0.1 0":
    points.slice(1).map(p=>" L"+p.x+" "+p.y).join(""));
}
function squaredDistanceToSegment(p,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;
  const t=length?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/length,0,1):0;
  const ex=p.x-(a.x+t*dx),ey=p.y-(a.y+t*dy);
  return ex*ex+ey*ey;
}
export function nearestWorkingStroke(strokes,point,radius=27){
  let chosen=-1,best=radius*radius;
  strokes.forEach((stroke,index)=>{
    const points=stroke.points||[];
    for(let j=0;j<points.length;j++){
      const dist=squaredDistanceToSegment(point,points[Math.max(0,j-1)],points[j]);
      if(dist<best){best=dist;chosen=index;}
    }
  });
  return chosen;
}

export function initWorkingPad(doc){
  const $=id=>doc.getElementById(id);
  const input=$("workingArea"),preview=$("workMathPreview"),drawing=$("workDrawing");
  const typeButton=$("workTypeButton"),drawButton=$("workDrawButton");
  const typePanel=$("workTypePanel"),drawPanel=$("workDrawPanel");
  const keyboard=$("workMathKeyboard");
  const pen=$("workPen"),eraser=$("workEraser");
  const undo=$("workUndo"),clear=$("workClear");
  let method="type",tool="pen",strokes=[],history=[],pointer=null,activePath=null;
  let selection={start:0,end:0};

  function rememberSelection(){
    if(Number.isInteger(input.selectionStart)&&Number.isInteger(input.selectionEnd))
      selection={start:input.selectionStart,end:input.selectionEnd};
    else selection={start:input.value.length,end:input.value.length};
  }
  function refreshMath(){preview.innerHTML=renderMathWorking(input.value);}
  input.addEventListener("input",()=>{rememberSelection();refreshMath();});
  for(const event of ["click","keyup","select"])input.addEventListener(event,rememberSelection);
  keyboard.addEventListener("click",event=>{
    const button=event.target.closest?.("[data-math-key]");
    if(!button||!keyboard.contains(button))return;
    const result=insertMathWorking(input.value,selection.start,selection.end,
      button.dataset.mathKey);
    if(result.value.length>2000)return;
    input.value=result.value;
    input.focus({preventScroll:true});
    input.setSelectionRange?.(result.start,result.end);
    selection={start:result.start,end:result.end};
    refreshMath();
  });

  function changeMethod(next){
    method=next;
    typePanel.hidden=next!=="type";
    drawPanel.hidden=next!=="draw";
    typeButton.setAttribute("aria-pressed",String(next==="type"));
    drawButton.setAttribute("aria-pressed",String(next==="draw"));
    typeButton.classList.toggle("selected",next==="type");
    drawButton.classList.toggle("selected",next==="draw");
    if(next==="draw")input.blur?.();
  }
  typeButton.addEventListener("click",()=>changeMethod("type"));
  drawButton.addEventListener("click",()=>changeMethod("draw"));

  function changeTool(next){
    tool=next;
    pen.setAttribute("aria-pressed",String(next==="pen"));
    eraser.setAttribute("aria-pressed",String(next==="eraser"));
    pen.classList.toggle("selected",next==="pen");
    eraser.classList.toggle("selected",next==="eraser");
    drawing.classList.toggle("is-erasing",next==="eraser");
  }
  function pushHistory(){
    history.push(strokes.map(s=>({points:s.points.map(p=>({...p}))})));
    if(history.length>60)history.shift();
  }
  function controls(){
    undo.disabled=!history.length;
    clear.disabled=!strokes.length;
  }
  function newPath(points){
    const path=doc.createElementNS(SVG_NS,"path");
    path.setAttribute("d",workingPath(points));
    path.setAttribute("class","working-stroke");
    path.setAttribute("fill","none");
    path.setAttribute("stroke","#344b69");
    path.setAttribute("stroke-width","5.5");
    path.setAttribute("stroke-linecap","round");
    path.setAttribute("stroke-linejoin","round");
    return path;
  }
  function renderStrokes(){
    drawing.replaceChildren(...strokes.map(s=>newPath(s.points)));
    controls();
  }
  function eraseAt(point){
    const index=nearestWorkingStroke(strokes,point);
    if(index<0)return;
    pushHistory();
    strokes.splice(index,1);
    renderStrokes();
  }
  drawing.addEventListener("pointerdown",event=>{
    if(event.button!==undefined&&event.button!==0||event.isPrimary===false||pointer!==null)return;
    event.preventDefault?.();
    pointer=event.pointerId;
    drawing.setPointerCapture?.(pointer);
    const point=workingPoint(event,drawing.getBoundingClientRect());
    if(tool==="eraser"){eraseAt(point);return;}
    pushHistory();
    const stroke={points:[point]};
    strokes.push(stroke);
    activePath=newPath(stroke.points);
    drawing.append(activePath);
    controls();
  });
  drawing.addEventListener("pointermove",event=>{
    if(pointer===null||event.pointerId!==pointer)return;
    event.preventDefault?.();
    const point=workingPoint(event,drawing.getBoundingClientRect());
    if(tool==="eraser"){eraseAt(point);return;}
    const current=strokes[strokes.length-1];
    if(!current)return;
    const last=current.points[current.points.length-1];
    if(Math.abs(last.x-point.x)+Math.abs(last.y-point.y)<1)return;
    current.points.push(point);
    activePath?.setAttribute("d",workingPath(current.points));
  });
  function stopPointer(event){
    if(pointer===null||event.pointerId!==pointer)return;
    if(drawing.hasPointerCapture?.(pointer))drawing.releasePointerCapture?.(pointer);
    pointer=null;activePath=null;controls();
  }
  drawing.addEventListener("pointerup",stopPointer);
  drawing.addEventListener("pointercancel",stopPointer);
  drawing.addEventListener("lostpointercapture",event=>{
    if(pointer===event.pointerId){pointer=null;activePath=null;}
  });
  pen.addEventListener("click",()=>changeTool("pen"));
  eraser.addEventListener("click",()=>changeTool("eraser"));
  undo.addEventListener("click",()=>{
    if(!history.length)return;
    strokes=history.pop();
    pointer=null;activePath=null;
    renderStrokes();
  });
  clear.addEventListener("click",()=>{
    if(!strokes.length)return;
    pushHistory();strokes=[];
    pointer=null;activePath=null;
    renderStrokes();
  });
  function reset(){
    input.value="";selection={start:0,end:0};
    strokes=[];history=[];pointer=null;activePath=null;
    changeMethod("type");changeTool("pen");
    refreshMath();renderStrokes();
  }
  reset();
  return {reset};
}
