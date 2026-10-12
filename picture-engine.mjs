// Reusable, picture-independent question, artwork and validation engine.
// New pictures only require a definition in pictures.mjs.
import {PICTURE_DEFINITIONS} from "./pictures.mjs";
import {isInInterval,identicalSolution,formatInterval,formatLinear} from "./model.mjs";

export const LEVELS_FOR_PICTURE=Object.freeze(["mirror","full","solve","mixed"]);
export const PICTURE_LIBRARY=Object.freeze(PICTURE_DEFINITIONS);
const PICTURES_BY_ID=new Map(PICTURE_LIBRARY.map(p=>[p.id,p]));

export function pictureById(id){
  const result=PICTURES_BY_ID.get(id);
  if(!result)throw Error("Unknown picture: "+id);
  return result;
}
export function picturesForLevel(level){
  if(!LEVELS_FOR_PICTURE.includes(level))throw Error("Unknown difficulty: "+level);
  return PICTURE_LIBRARY.filter(p=>p.levels.includes(level));
}
export function defaultPictureForLevel(level){
  const pictures=picturesForLevel(level);
  if(!pictures.length)throw Error("No pictures support level "+level);
  return pictures[0];
}
export const pictureHeight=picture=>picture.height;
export const pictureWidth=picture=>picture.window.max-picture.window.min;
export const fullPictureWidth=picture=>picture.family==="half"?pictureWidth(picture)*2:pictureWidth(picture);
export const questionCount=picture=>picture.rows.length;
export const pictureAxis=picture=>picture.axis||picture.window;
export function picturedRow(picture,index){
  const y=picture.rows.length-index;
  return picture.rows[y-1]&&{y,from:picture.rows[y-1][0],to:picture.rows[y-1][1]};
}
export function picturePixelAt(picture,x,y,{full=false}={}){
  if(!Number.isInteger(x)||!Number.isInteger(y)||y<0||y>=picture.height)return false;
  const w=pictureWidth(picture),width=full?fullPictureWidth(picture):w;
  if(x<0||x>=width)return false;
  const local=full&&picture.family==="half"&&x<w?w-1-x:full&&picture.family==="half"?x-w:x;
  const row=picture.rows[y-1];
  return Boolean(row&&local>=row[0]&&local<=row[1]);
}
function localColour(picture,x,y){
  const row=picture.rows[y-1];
  let fill=picture.palette.base;
  for(const band of picture.palette.bands||[])
    if(y>=band.from&&y<=band.to)fill=band.fill;
  if((picture.palette.edge!==undefined)&&(x===row[0]||x===row[1]))
    return picture.palette.edge;
  return fill;
}
export function pictureColourAt(picture,x,y,{full=false}={}){
  if(!picturePixelAt(picture,x,y,{full}))return null;
  const w=pictureWidth(picture);
  const local=full&&picture.family==="half"?(x<w?w-1-x:x-w):x;
  return localColour(picture,local,y);
}
export function pictureBackgroundAt(picture,x,y,{full=true}={}){
  const width=full?fullPictureWidth(picture):pictureWidth(picture);
  if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=width||y<0||y>=picture.height)
    throw Error("Background pixel outside "+picture.id);
  const palette=picture.background,left=Math.min(x,width-1-x);
  if(y===2&&left===Math.floor(width/4))return palette.sparkle;
  if(y===3&&left===Math.floor(width/4)-1)return palette.light;
  if(y<5)return palette.light;
  if(y>=picture.height-5&&(Math.floor(left/3)+Math.floor(y/3))%2===0)return palette.shade;
  return palette.base;
}
export function pictureDetailStages(picture){return picture.detailStages;}
export function pictureFinalDetails(picture){
  const width=fullPictureWidth(picture);
  const marks=[];
  for(const [x,y,color,group,height=1] of picture.details||[]){
    marks.push(Object.freeze({x,y,color,group,height}));
    if(width-1-x!==x)marks.push(Object.freeze({x:width-1-x,y,color,group,height}));
  }
  return marks;
}

const pixelValuesForWindow=window=>Array.from(
  {length:window.max-window.min},(_,i)=>window.min+i);
function withinWindow(solution,window){
  return pixelValuesForWindow(window).filter(x=>isInInterval(x,solution));
}
function derivedHalfAnswer(picture,row,index,replay){
  const width=pictureWidth(picture);
  const full=row.from===0&&row.to===width-1;
  const right=row.to===width-1&&(row.from>0||full&&
    (picture.fullRayDirection?.[row.y]==="right"||
     !picture.fullRayDirection?.[row.y]&&index%2===0));
  const strictPref=picture.firstStrict?.[row.y-1]??(index%2===0);
  let strict=replay===0?strictPref:(strictPref!==((replay%2)===1));
  if(right){
    // No off-screen artificial endpoint for a full-width ray.
    if(row.from===0)strict=false;
    return {direction:"right",
      at:picture.window.min+row.from-(strict?1:0),included:!strict};
  }
  return {direction:"left",
    at:picture.window.min+row.to+(strict?1:0),included:!strict};
}
function derivedBoundedAnswer(picture,row,index,replay){
  const preferred=picture.initial?.[row.y-1];
  if(preferred&&replay===0)return {
    direction:"between",lower:preferred.lower,upper:preferred.upper,
    lowerIncluded:preferred.lowerIncluded,upperIncluded:preferred.upperIncluded
  };
  const w=pictureWidth(picture),leftStrict=row.from>0&&(index+replay)%2===0;
  const rightStrict=row.to<w-1&&(index+replay)%3===0;
  return {direction:"between",
    lower:picture.window.min+row.from-(leftStrict?1:0),
    upper:picture.window.min+row.to+(rightStrict?1:0),
    lowerIncluded:!leftStrict,upperIncluded:!rightStrict};
}
function mixedRayAnswer(picture,row,index,replay){
  if(picture.family!=="full")throw Error("Mixed rays require full artwork");
  const values=pixelValuesForWindow(picture.window);
  const centre=values.length/2;
  if(values.length%2!==0)throw Error("Mixed mirror mode needs an even picture width");
  const side=(index+replay)%2===0?"right":"left";
  const strict=(index+replay)%4<2;
  if(side==="right"){
    const edge=picture.window.min+row.to;
    return {side,answer:{direction:"left",at:edge+(strict?1:0),included:!strict}};
  }
  const edge=picture.window.min+row.from;
  return {side,answer:{direction:"right",at:edge-(strict?1:0),included:!strict}};
}
function readOptions(answer,index,replay,axis){
  let candidates;
  if(answer.direction==="between"){
    candidates=[
      answer,{...answer,lowerIncluded:!answer.lowerIncluded},
      {...answer,upperIncluded:!answer.upperIncluded},
      {...answer,lowerIncluded:!answer.lowerIncluded,
        upperIncluded:!answer.upperIncluded}
    ];
  }else{
    let move=answer.at>=axis.max?-1:answer.at<=axis.min?1:(index+replay)%2===0?1:-1;
    candidates=[
      answer,{...answer,included:!answer.included},
      {...answer,direction:answer.direction==="right"?"left":"right"},
      {...answer,at:answer.at+move}
    ];
  }
  return candidates.map((_,k)=>candidates[(k+(index*3+replay)%4)%4])
    .map(value=>({label:formatInterval(value),value}));
}
export function makePictureQuestion(picture,index,replay=0,level="mirror"){
  if(!picture.levels.includes(level))throw Error(picture.id+" does not support "+level);
  if(!Number.isInteger(index)||index<0||index>=questionCount(picture))return null;
  const row=picturedRow(picture,index);
  let mode,artMode,mirrorSide=null,answer;
  if(picture.family==="half"){
    mode=index<3?"read":"draw";
    artMode="mirror-half";
    answer=derivedHalfAnswer(picture,row,index,replay);
  }else{
    mode=level==="solve"?"solve":index<3?"read":"draw";
    artMode="full";
    if(level==="mixed"){
      const phase=index%4;
      mode=phase===0?"read":phase===3?"solve":"draw";
      if(phase<=1){
        artMode="mirror";
        const ray=mixedRayAnswer(picture,row,index,replay);
        answer=ray.answer;mirrorSide=ray.side;
      }
    }
    if(!answer)answer=derivedBoundedAnswer(picture,row,index,replay);
  }
  const basic={index,row:row.y,artMode,mirrorSide,mode,answer,pictureId:picture.id};
  if(mode==="read")return {...basic,prompt:"Which inequality does this number line represent?",
    options:readOptions(answer,index,replay,pictureAxis(picture))};
  if(mode==="draw")return {...basic,
    prompt:answer.direction==="between"?"Draw this inequality on the number line.":
      "Represent this inequality on the number line.",
    equation:formatInterval(answer)};
  const preferred=picture.initial?.[row.y-1]?.transform;
  const coefficients=[[2,1],[2,-3],[-2,1],[3,2],[-3,-2],[1,4],[-1,1]];
  const [a,b]=preferred&&replay===0?[preferred.a,preferred.b]:
    coefficients[(replay+index)%coefficients.length];
  return {...basic,prompt:"Solve the inequality, then draw your solution.",
    equation:formatLinear(answer,a,b),transformed:{a,b}};
}
export function picturePaintedValues(picture,question,solution=question.answer){
  // The same projection powers final committed pixels AND the temporary
  // ghost preview. Previewing a wrong answer must not clip it to the secret
  // silhouette or imply it was marked correct.
  if(question.pictureId!==picture.id)throw Error("Question/picture mismatch");
  if(question.artMode==="mirror-half")
    return withinWindow(solution,picture.window);
  if(question.artMode==="full")
    return withinWindow(solution,picture.window);
  if(question.artMode==="mirror"){
    const values=withinWindow(solution,picture.window);
    const centre=picture.window.min+pictureWidth(picture)/2;
    const half=values.filter(x=>question.mirrorSide==="right"?x>=centre:x<centre);
    const reflect=x=>picture.window.min+picture.window.max-1-x;
    return [...new Set([...half,...half.map(reflect)])].sort((a,b)=>a-b);
  }
  throw Error("Unknown art mode");
}
function rowsTouch(picture){
  for(let y=2;y<=picture.rows.length;y++){
    const [a,b]=picture.rows[y-2],[c,d]=picture.rows[y-1];
    if(a>d||c>b)return false;
  }
  return true;
}
function connected(picture,full=false){
  const width=full?fullPictureWidth(picture):pictureWidth(picture);
  const occupied=new Set();
  for(let y=0;y<picture.height;y++)for(let x=0;x<width;x++)
    if(picturePixelAt(picture,x,y,{full}))occupied.add(x+","+y);
  if(!occupied.size)return false;
  const visited=new Set(),stack=[occupied.values().next().value];
  while(stack.length){
    const key=stack.pop();if(visited.has(key))continue;visited.add(key);
    const [x,y]=key.split(",").map(Number);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const neighbour=(x+dx)+","+(y+dy);
      if(occupied.has(neighbour)&&!visited.has(neighbour))stack.push(neighbour);
    }
  }
  return visited.size===occupied.size;
}
const validColour=s=>typeof s==="string"&&/^#[0-9a-f]{6}$/i.test(s);
export function validatePicture(picture){
  if(!picture||!/^[-a-z0-9]+$/.test(picture.id))throw Error("Invalid picture id");
  if(!["half","full"].includes(picture.family))throw Error(picture.id+": invalid family");
  if(!Number.isInteger(picture.height)||picture.height<4||picture.height>48)
    throw Error(picture.id+": invalid height");
  const axis=pictureAxis(picture),w=pictureWidth(picture);
  if(!Number.isInteger(w)||w<2||w>30||!Number.isInteger(picture.window.min))
    throw Error(picture.id+": invalid window");
  if(!Number.isInteger(axis.min)||!Number.isInteger(axis.max)||
     axis.min>picture.window.min||axis.max<picture.window.max)
    throw Error(picture.id+": visible axis hides pixel bounds");
  if(!Array.isArray(picture.rows)||picture.rows.length<4||
     picture.rows.length>picture.height-2)
    throw Error(picture.id+": invalid active rows");
  if(!picture.levels.length||picture.levels.some(level=>!LEVELS_FOR_PICTURE.includes(level)))
    throw Error(picture.id+": unknown level");
  if(picture.family==="half"&&(picture.levels.length!==1||picture.levels[0]!=="mirror"))
    throw Error(picture.id+": half pictures require Mirror Mode");
  if(picture.family==="full"&&picture.levels.includes("mirror"))
    throw Error(picture.id+": full pictures cannot use Mirror Mode");
  for(const [i,row] of picture.rows.entries()){
    if(!Array.isArray(row)||row.length!==2||row.some(x=>!Number.isInteger(x))||
       row[0]<0||row[1]>=w||row[0]>row[1])
      throw Error(picture.id+": invalid row "+(i+1));
    if(picture.family==="half"&&row[0]!==0&&row[1]!==w-1)
      throw Error(picture.id+": row "+(i+1)+" cannot be drawn with one ray");
  }
  if(!rowsTouch(picture)||!connected(picture,false))
    throw Error(picture.id+": disconnected silhouette");
  if(picture.family==="half"&&!connected(picture,true))
    throw Error(picture.id+": disconnected reflected silhouette");
  if(picture.levels.includes("mixed")){
    if(w%2)throw Error(picture.id+": Mixed Challenge requires even width");
    for(const [a,b] of picture.rows)
      if(a!==w-1-b)throw Error(picture.id+": Mixed Challenge requires symmetric rows");
  }
  for(const colour of [picture.palette?.base,picture.palette?.edge,
    picture.background?.base,picture.background?.light,
    picture.background?.shade,picture.background?.sparkle])
    if(!validColour(colour))throw Error(picture.id+": invalid palette colour");
  for(const band of picture.palette.bands||[])
    if(!Number.isInteger(band.from)||!Number.isInteger(band.to)||
       band.from<0||band.to>=picture.height||band.from>band.to||
       !validColour(band.fill))
      throw Error(picture.id+": invalid colour band");
  if(!Array.isArray(picture.detailStages)||new Set(picture.detailStages).size!==picture.detailStages.length)
    throw Error(picture.id+": invalid detail stages");
  const used=new Set(),marks=pictureFinalDetails(picture);
  for(const mark of marks){
    if(!Number.isInteger(mark.x)||!Number.isInteger(mark.y)||
       !validColour(mark.color)||!(mark.height>0&&mark.height<=1)||
       !picture.detailStages.includes(mark.group)||
       !picturePixelAt(picture,mark.x,mark.y,{full:true}))
      throw Error(picture.id+": invalid detail at "+mark.x+","+mark.y);
    const key=mark.x+","+mark.y;
    if(used.has(key))throw Error(picture.id+": overlapping detail "+key);
    used.add(key);
  }
  for(const stage of picture.detailStages)
    if(!marks.some(mark=>mark.group===stage))throw Error(picture.id+": empty detail stage "+stage);
  for(let y=0;y<picture.height;y++)for(let x=0;x<fullPictureWidth(picture);x++){
    const mirror=fullPictureWidth(picture)-1-x;
    if(!validColour(pictureBackgroundAt(picture,x,y)))
      throw Error(picture.id+": invalid background");
    if(pictureBackgroundAt(picture,x,y)!==pictureBackgroundAt(picture,mirror,y))
      throw Error(picture.id+": asymmetric background");
    if(picture.family==="half"&&pictureColourAt(picture,x,y,{full:true})!==
      pictureColourAt(picture,mirror,y,{full:true}))
      throw Error(picture.id+": asymmetric colour");
  }
  for(const level of picture.levels)for(let index=0;index<questionCount(picture);index++){
    const row=picturedRow(picture,index);
    const expected=pixelValuesForWindow(picture.window)
      .filter((_,col)=>col>=row.from&&col<=row.to);
    for(let replay=0;replay<12;replay++){
      const question=makePictureQuestion(picture,index,replay,level);
      const actual=picturePaintedValues(picture,question);
      if(JSON.stringify(actual)!==JSON.stringify(expected))
        throw Error(picture.id+" "+level+" row "+row.y+" replay "+replay+": question mismatch");
      if(question.mode==="read"&&question.options.filter(o=>
        identicalSolution(o.value,question.answer)).length!==1)
        throw Error(picture.id+": ambiguous reading options");
      const endpoints=question.answer.direction==="between"?
        [question.answer.lower,question.answer.upper]:[question.answer.at];
      if(endpoints.some(n=>n<pictureAxis(picture).min||n>pictureAxis(picture).max))
        throw Error(picture.id+": endpoint off the visible number line");
    }
  }
  return {id:picture.id,rows:picture.rows.length,width:w,
    fullWidth:fullPictureWidth(picture),modes:picture.levels.slice()};
}
export function validatePictureLibrary(){
  if(PICTURES_BY_ID.size!==PICTURE_LIBRARY.length)throw Error("Duplicate picture IDs");
  return PICTURE_LIBRARY.map(validatePicture);
}
