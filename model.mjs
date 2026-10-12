// Inequality Ink: mathematical model and validated pixel-art source.
// All pixel filling is derived from the exact real-number interval, never from a reward lookup.
export const WIDTH = 16;
export const HEIGHT = 16;
export const COLUMN_MIN = -8;
export const COLUMN_MAX = 7;
export const AXIS_MIN = -9;
export const AXIS_MAX = 8;

const specification = [
  // Picture row (top to bottom), lower endpoint, upper endpoint, lower included, upper included, question type.
  [1, -3, 2, false, false, "solve", -2, 1],
  [2, -4, 4, true, false, "solve", 2, 1],
  [3, -6, 4, false, true, "solve", 2, -1],
  [4, -6, 5, true, true, "solve", 2, 1],
  [5, -8, 7, false, false, "draw"],
  [6, -7, 7, true, false, "draw"],
  [7, -8, 6, false, true, "draw"],
  [8, -7, 5, false, true, "draw"],
  [9, -5, 5, true, false, "draw"],
  [10, -4, 2, false, true, "draw"],
  [11, -3, 3, true, false, "draw"],
  [12, -4, 3, false, false, "read"],
  [13, -3, 2, true, true, "read"],
  [14, -4, 3, true, true, "read"]
];

export const ROWS = Object.freeze(specification.map(([y, lower, upper, lowerIncluded, upperIncluded, mode, a, b]) =>
  Object.freeze({y, lower, upper, lowerIncluded, upperIncluded, mode, a, b})
));
export const SEQUENCE = Object.freeze([...ROWS].reverse());

export const isInInterval = (x, i) => {
  if (i.direction === "right") return i.included ? x >= i.at : x > i.at;
  if (i.direction === "left") return i.included ? x <= i.at : x < i.at;
  return (i.lowerIncluded ? x >= i.lower : x > i.lower) &&
    (i.upperIncluded ? x <= i.upper : x < i.upper);
};

export const columnsFor = (i) => Array.from({length: WIDTH}, (_, p) => p + COLUMN_MIN)
  .filter(x => isInInterval(x, i));

export function identicalSolution(a, b) {
  if (!a || !b || a.direction !== b.direction) return false;
  if (a.direction === "between") return a.lower === b.lower &&
    a.upper === b.upper && a.lowerIncluded === b.lowerIncluded &&
    a.upperIncluded === b.upperIncluded;
  return a.at === b.at && a.included === b.included;
}

export const withDirection = i => ({...i, direction: i.direction || "between"});

export const fmt = n => String(n).replace(/-/g, "−");
export function formatInterval(i) {
  if (i.direction === "right") return `x ${i.included ? "≥" : ">"} ${fmt(i.at)}`;
  if (i.direction === "left") return `x ${i.included ? "≤" : "<"} ${fmt(i.at)}`;
  return `${fmt(i.lower)} ${i.lowerIncluded ? "≤" : "<"} x ${i.upperIncluded ? "≤" : "<"} ${fmt(i.upper)}`;
}

export function formatLinear(i, a, b) {
  if (!Number.isInteger(a) || a === 0 || !Number.isInteger(b)) throw new Error("Invalid linear transformation");
  const lower = a > 0 ? a * i.lower + b : a * i.upper + b;
  const upper = a > 0 ? a * i.upper + b : a * i.lower + b;
  const lowerIncluded = a > 0 ? i.lowerIncluded : i.upperIncluded;
  const upperIncluded = a > 0 ? i.upperIncluded : i.lowerIncluded;
  const term = Math.abs(a) === 1 ? "x" : `${Math.abs(a)}x`;
  const middle = a < 0 && b !== 0 ?
    `${fmt(b)} − ${term}` :
    `${a < 0 ? "−" : ""}${term}${b > 0 ? " + " + b : b < 0 ? " − " + Math.abs(b) : ""}`;
  return `${fmt(lower)} ${lowerIncluded ? "≤" : "<"} ${middle} ${upperIncluded ? "≤" : "<"} ${fmt(upper)}`;
}

function variantForPixels(i, variant) {
  const pixels = columnsFor(i);
  const left = pixels[0], right = pixels[pixels.length - 1];
  const kind = ((variant % 4) + 4) % 4;
  return {direction: "between",
    lower: left - (kind === 1 || kind === 3 ? 1 : 0),
    upper: right + (kind === 2 || kind === 3 ? 1 : 0),
    lowerIncluded: !(kind === 1 || kind === 3),
    upperIncluded: !(kind === 2 || kind === 3)};
}


export const LEVELS = Object.freeze({
  mirror: {name:"Mirror Mode", subtitle:"Start here · one-sided inequalities", detail:"Read or represent ordinary one-sided inequalities to reveal a mystery picture."},
  full: {name:"Full Picture", subtitle:"Build both ends · bounded inequalities", detail:"Shade an exact interval across the whole picture."},
  solve: {name:"Solve & Paint", subtitle:"Algebra challenge · solve then draw", detail:"Rearrange inequalities before drawing their solutions."},
  mixed: {name:"Mixed Challenge", subtitle:"A little of everything", detail:"Switch between mirrored, bounded and algebra questions."}
});
export const LEVEL_IDS = Object.freeze(Object.keys(LEVELS));

// 16 even-width columns -8,...,7 are mirrored through x=-0.5.
// Reflection preserves integer pixel centers but is NOT an algebraic transformation of the inequality.
export const reflectColumn = x => -1-x;

export function paintedColumns(question) {
  if (question.artMode === "mirror-half") return catHalfColumns(question.answer);
  if (question.artMode !== "mirror") return columnsFor(question.answer);
  if (question.mirrorSide !== "left" && question.mirrorSide !== "right") throw Error("Unknown mirror side");
  const half = columnsFor(question.answer).filter(x => question.mirrorSide === "left" ? x < 0 : x >= 0);
  return [...new Set([...half, ...half.map(reflectColumn)])].sort((a,b)=>a-b);
}

// A half-picture specifies its own displayed number-line window.
// The integer columns are [min, max), so [-5,5] provides ten pixel columns
// labelled -5,-4,...,4; x < 3 draws precisely -5,...,2.
// None of these limits changes the student's unbounded real solution.
export const CAT_WINDOW=Object.freeze({min:-5,max:5});
export function pixelsInWindow(interval,window){
  if(!window||!Number.isInteger(window.min)||!Number.isInteger(window.max)||
     window.max<=window.min)throw Error("Invalid number-line window");
  return Array.from({length:window.max-window.min},(_,j)=>window.min+j)
    .filter(x=>isInInterval(x,interval));
}
export const CAT_HALF_WIDTH=CAT_WINDOW.max-CAT_WINDOW.min;
export const CAT_FULL_WIDTH=2*CAT_HALF_WIDTH;
// Rows are stored as pixel indices relative to the left edge of the half-canvas.
// The generator derives one true half-line per row from the same window.
export const CAT_HALF_ROWS=Object.freeze([
  [1,9,9,"right",true], // x > 3 paints only pixel 4
  [2,8,9,"right",false],
  [3,7,9,"right",true],
  [4,0,9,"right",false],
  [5,0,9,"left",true],
  [6,0,8,"left",false],
  [7,0,8,"left",true],
  [8,0,7,"left",true],   // x < 3 on [-5,5] -> -5 through 2 (8 pixels)
  [9,0,7,"left",false],
  [10,0,6,"left",true],
  [11,0,6,"left",false],
  [12,0,5,"left",true],
  [13,0,4,"left",false],
  [14,0,3,"left",true]
].map(([y,from,to,direction,strict])=>Object.freeze({y,from,to,direction,strict})));
export const CAT_SEQUENCE=Object.freeze([...CAT_HALF_ROWS].reverse());
export const catHalfColumns=interval=>pixelsInWindow(interval,CAT_WINDOW);
export function catHalfPixelAt(x,y){
  const row=CAT_HALF_ROWS.find(r=>r.y===y);
  return Boolean(row && x>=row.from && x<=row.to);
}
export function catPixelAt(x,y){
  if(!Number.isInteger(x)||x<0||x>=CAT_FULL_WIDTH)return false;
  const halfX=x<CAT_HALF_WIDTH?CAT_HALF_WIDTH-1-x:x-CAT_HALF_WIDTH;
  return catHalfPixelAt(halfX,y);
}
export function catColourAt(x,y){
  if(!catPixelAt(x,y))return null;
  const d=x<CAT_HALF_WIDTH?CAT_HALF_WIDTH-1-x:x-CAT_HALF_WIDTH;
  const row=CAT_HALF_ROWS.find(r=>r.y===y);
  // The base colour layer contains no eyes, nose, ear interiors or whiskers.
  // Those are separate final details, revealed only after full colour appears.
  const outline="#3b3445",ginger="#eba66d",furLight="#f8cc90",furShadow="#d78960";
  if(y<=3){
    if(d===row.from||d===row.to||y===1)return outline;
    return ginger;
  }
  if(d===row.to||y===14)return outline;
  if(y===4&&d>=7)return outline;
  if(y===13)return furShadow;
  if(y===5&&d>=7)return furShadow;
  return y%3===0?furLight:ginger;
}
function catAnswer(row,replay=0){
  const strict=row.direction==="right"&&row.from===0?false:
    (replay===0?row.strict:(row.strict !== (replay%2===1)));
  return {
    direction:row.direction,
    at:row.direction==="right"
      ? CAT_WINDOW.min+row.from-(strict?1:0)
      : CAT_WINDOW.min+row.to+(strict?1:0),
    included:!strict
  };
}

// Different inequality endpoints can select identical integer pixels. Exact number-line
// marking is always performed with identicalSolution(), never paintedColumns().
function equivalentBoundedPixels(interval, variant) {
  const pixels=columnsFor(interval),left=pixels[0],right=pixels.at(-1);
  const kind=((variant%4)+4)%4;
  return {direction:"between",
    lower:left-(kind===1||kind===3?1:0),
    upper:right+(kind===2||kind===3?1:0),
    lowerIncluded:!(kind===1||kind===3),
    upperIncluded:!(kind===2||kind===3)};
}
function mirrorAnswer(row,index,replay) {
  const pixels=columnsFor(row),left=pixels[0],right=pixels.at(-1);
  const side=(index+replay)%2===0?"right":"left";
  // Alternate ≤ / < on the right and ≥ / > on the left.
  const strict=Math.floor((index+replay)/2)%2===1;
  const answer=side==="right"
    ? {direction:"left",at:right+(strict?1:0),included:!strict}
    : {direction:"right",at:left-(strict?1:0),included:!strict};
  return {answer,side};
}
function readOptions(answer,index,replay) {
  let candidates;
  if(answer.direction==="between") {
    candidates=[answer,{...answer,lowerIncluded:!answer.lowerIncluded},
      {...answer,upperIncluded:!answer.upperIncluded},
      {...answer,lower:answer.lower+1}];
  } else {
    const shift=answer.at===AXIS_MAX?-1:answer.at===AXIS_MIN?1:(index+replay)%2===0?1:-1;
    candidates=[answer,{...answer,included:!answer.included},
      {...answer,direction:answer.direction==="left"?"right":"left"},
      {...answer,at:answer.at+shift}];
  }
  return candidates.map((_,k)=>candidates[(k+(index*3+replay)%4)%4])
    .map(i=>({label:formatInterval(i),value:i}));
}
export function makeQuestion(index,replay=0,level="mixed") {
  if (!LEVELS[level]) throw Error("Unknown difficulty: "+level);
  if(level==="mirror"){
    const row=CAT_SEQUENCE[index];
    if(!row)return null;
    const answer=catAnswer(row,replay),mode=index<3?"read":"draw";
    const question={index,row:row.y,artMode:"mirror-half",artwork:"cat",
      mirrorSide:"right",mode,answer};
    return mode==="read"
      ? {...question,prompt:"Which one-sided inequality does this number line show?",
          options:readOptions(answer,index,replay)}
      : {...question,prompt:"Represent this inequality on the number line.",
          equation:formatInterval(answer)};
  }
  const row=SEQUENCE[index];
  if(!row) return null;
  let artMode="full",mirrorSide=null;
  let mode=level==="solve"?"solve":index<3?"read":"draw";
  if(level==="mirror") artMode="mirror";
  if(level==="mixed") {
    const phase=index%4;
    artMode=phase<=1?"mirror":"full";
    mode=phase===0?"read":phase===3?"solve":"draw";
  }
  let answer={direction:"between",lower:row.lower,upper:row.upper,
    lowerIncluded:row.lowerIncluded,upperIncluded:row.upperIncluded};
  if(artMode==="mirror") {
    const result=mirrorAnswer(row,index,replay);
    answer=result.answer;
    mirrorSide=result.side;
  } else if(replay>0) answer=equivalentBoundedPixels(answer,replay+index);
  const question={index,row:row.y,artMode,mirrorSide,mode,answer};
  if(mode==="read")return {...question,
    prompt:artMode==="mirror"?"Which one-sided inequality is represented by this number line?":"Which inequality does this number line represent?",
    options:readOptions(answer,index,replay)};
  if(mode==="draw")return {...question,
    prompt:artMode==="mirror"?"Draw the one-sided inequality. Only the indicated half of your line paints the row.":"Draw the complete bounded inequality.",
    equation:formatInterval(answer)};
  const coefficientChoices=[[2,1],[2,-3],[-2,1],[3,2],[-3,-2],[1,4],[-1,1]];
  const [a,b]=replay===0 && row.a && row.b!==undefined ? [row.a,row.b] :
    coefficientChoices[(replay+index)%coefficientChoices.length];
  return {...question,
    prompt:"Solve the inequality, then represent its complete solution on the number line.",
    equation:formatLinear(answer,a,b),transformed:{a,b}};
}

export const TUTORIAL = [
  {mode:"tutorial", prompt:"Shade every value greater than or equal to −2.", equation:"x ≥ −2",
    answer:{direction:"right", at:-2, included:true}},
  {mode:"tutorial", prompt:"Now shade the values between these endpoints.", equation:"−2 < x ≤ 3",
    answer:{direction:"between", lower:-2, upper:3, lowerIncluded:false, upperIncluded:true}}
];

export function pixelAt(x,y) {
  const row = ROWS.find(r=>r.y === y);
  return row && isInInterval(x + COLUMN_MIN, {...row,direction:"between"}) ? true : false;
}

// The colour artwork is strictly constrained by pixelAt(). No decorative colour can create extra pixels.
export const TUTORIAL_MIRROR = [
  {mode:"tutorial",prompt:"Draw the closed circle and shade left. The ray is not cut short.",equation:"x ≤ 4",
    answer:{direction:"left",at:4,included:true}},
  {mode:"tutorial",prompt:"Now draw an open circle and shade right.",equation:"x > 3",
    answer:{direction:"right",at:3,included:false}}
];
export const tutorialFor = level => level==="mirror"?TUTORIAL_MIRROR:TUTORIAL;

// Colours are also symmetric; the right-hand colours always reflect the left-hand colours.
// Art detail never changes the mathematical silhouette.
export function colourAt(x,y) {
  if(!pixelAt(x,y))return null;
  const row=ROWS[y-1],first=columnsFor(row)[0]-COLUMN_MIN,last=columnsFor(row).at(-1)-COLUMN_MIN;
  const lx=Math.min(x,WIDTH-1-x);
  const outline="#28324c",coral="#ed707d",shadow="#ca4b67",
    highlight="#f79b94",stem="#e8c596",stemShade="#cfa373";
  if(y===1||y===9||x===first||x===last)return outline;
  if(y<=8){
    // Spots and the small face are final details, not part of the base colour.
    if(y===2||(y===3&&lx===7))return highlight;
    if(y>=7)return shadow;
    return coral;
  }
  if((y===13&&lx===6)||(y===14&&lx>=5))return stemShade;
  return stem;
}

// Separate finishing touches from the mathematical artwork and its base colours.
// Each detail is an SVG pixel or small, pixel-aligned ink stroke, not an inequality pixel.
// Designs are authored as symmetrical LEFT-side details and mirrored deterministically.
// Details remain entirely inside the already painted silhouette.
function mirroredDetails(fullWidth,leftMarks){
  const marks=[];
  for(const [x,y,color,group,height=1] of leftMarks){
    for(const px of [x,fullWidth-1-x]){
      marks.push(Object.freeze({x:px,y,color,group,height}));
    }
  }
  return Object.freeze(marks);
}
export const CAT_DETAIL_STAGES=Object.freeze(["ears","eyes","face","whiskers"]);
export const MUSHROOM_DETAIL_STAGES=Object.freeze(["spots","eyes","face"]);
export const CAT_DETAILS=mirroredDetails(CAT_FULL_WIDTH,[
  // Pink inner ears appear first.
  [1,2,"#e891a1","ears"],
  [1,3,"#f1a8b3","ears"],
  [2,3,"#e891a1","ears"],

  // Two expressive dark eyes, each with a tiny cream catchlight.
  [6,7,"#29283c","eyes"],
  [7,7,"#fff6dc","eyes"],
  [6,8,"#29283c","eyes"],
  [7,8,"#29283c","eyes"],

  // Cheeks, bright muzzle, a pink nose and a small curved smile.
  [5,9,"#f59d99","face"],
  [6,9,"#f6b4a6","face"],
  [7,10,"#ffe8bb","face"],
  [8,10,"#ffe8bb","face"],
  [9,10,"#e06c85","face"],
  [7,11,"#ffedc8","face"],
  [8,11,"#ffedc8","face"],
  [9,11,"#704958","face",0.38],
  [8,12,"#704958","face",0.35],

  // Fine whiskers are centred in their pixels rather than full-height blocks.
  [4,11,"#73545a","whiskers",0.22],
  [5,11,"#73545a","whiskers",0.22],
  [6,11,"#73545a","whiskers",0.22],
  [5,12,"#73545a","whiskers",0.22],
  [6,12,"#73545a","whiskers",0.22]
]);
export const MUSHROOM_DETAILS=mirroredDetails(WIDTH,[
  // Cap spots add a second colour and texture after the cap is coloured.
  [7,3,"#fff0d8","spots"],
  [5,4,"#fff0d8","spots"],
  [6,4,"#fff0d8","spots"],
  [3,5,"#fff0d8","spots"],
  [4,5,"#fff0d8","spots"],
  [3,6,"#fff0d8","spots"],
  [4,6,"#fff0d8","spots"],

  // A little face transforms the stem into a character.
  [6,11,"#273048","eyes"],
  [5,12,"#efa2a0","face"],
  [7,12,"#855c55","face",0.36]
]);
export function finalDetailsFor(artwork){
  if(artwork==="cat")return CAT_DETAILS;
  if(artwork==="mushroom")return MUSHROOM_DETAILS;
  throw Error("Unknown artwork for details: "+artwork);
}
export function detailStagesFor(artwork){
  if(artwork==="cat")return CAT_DETAIL_STAGES;
  if(artwork==="mushroom")return MUSHROOM_DETAIL_STAGES;
  throw Error("Unknown artwork for detail stages: "+artwork);
}
// Coloured backgrounds belong exclusively to the FINISHED artwork.
// They are not mathematical pixels, are never sampled by an inequality,
// and stay behind the silhouette and all final facial details.
export const FINISHED_BACKGROUNDS=Object.freeze({
  cat:Object.freeze({base:"#deebf8",light:"#f0f6fd",shade:"#d0e3f4",sparkle:"#fffaf1"}),
  mushroom:Object.freeze({base:"#dff0e7",light:"#eff8ee",shade:"#cfe5dc",sparkle:"#fff8dd"})
});
export function finishedBackgroundAt(artwork,x,y){
  const palette=FINISHED_BACKGROUNDS[artwork];
  if(!palette)throw Error("Unknown finished background: "+artwork);
  const width=artwork==="cat"?CAT_FULL_WIDTH:WIDTH;
  if(!Number.isInteger(x)||!Number.isInteger(y)||
     x<0||x>=width||y<0||y>=HEIGHT)
    throw Error("Background pixel outside picture");
  const left=Math.min(x,width-1-x);
  // Gentle symmetrical pixel-art highlights make the final image feel complete.
  if(y===2&&left===Math.floor(width/4))return palette.sparkle;
  if(y===3&&left===Math.floor(width/4)-1)return palette.light;
  if(y<5)return palette.light;
  if(y>=11&&(Math.floor(left/3)+Math.floor(y/3))%2===0)return palette.shade;
  return palette.base;
}

function validateDetails(name,details,width,mask,stages){
  const allowed=new Set(stages),placed=new Set(),lookup=new Map();
  for(const mark of details){
    if(!Number.isInteger(mark.x)||!Number.isInteger(mark.y)||
       mark.x<0||mark.x>=width||mark.y<0||mark.y>=HEIGHT)
      throw Error(name+" has an out-of-bounds detail");
    if(!mask(mark.x,mark.y))throw Error(name+" detail outside the silhouette at "+mark.x+","+mark.y);
    if(!allowed.has(mark.group))throw Error(name+" detail has unknown group "+mark.group);
    if(!/^#[0-9a-f]{6}$/i.test(mark.color))throw Error(name+" detail has invalid colour");
    if(!(mark.height>0&&mark.height<=1))throw Error(name+" detail has invalid height");
    const key=mark.x+","+mark.y;
    if(placed.has(key))throw Error(name+" has overlapping final details at "+key);
    placed.add(key);lookup.set(key,mark);
  }
  for(const mark of details){
    const reflected=lookup.get((width-1-mark.x)+","+mark.y);
    if(!reflected||reflected.color!==mark.color||
       reflected.group!==mark.group||reflected.height!==mark.height)
      throw Error(name+" has asymmetric final details at "+mark.x+","+mark.y);
  }
  for(const stage of stages)
    if(!details.some(mark=>mark.group===stage))throw Error(name+" has an empty detail stage "+stage);
  return true;
}

export function validatePuzzle() {
  if(ROWS.length!==14||ROWS.some(r=>r.y<1||r.y>14))throw Error("Invalid row count");
  const positions=new Set();
  for(const row of ROWS){
    const cols=columnsFor(row);
    if(!cols.length||cols.some((c,j)=>j&&c!==cols[j-1]+1))throw Error("Non-contiguous row "+row.y);
    if(cols.some(x=>x<COLUMN_MIN||x>COLUMN_MAX))throw Error("Pixel out of bounds");
    for(const c of cols)positions.add(c+","+row.y);
    const reflection=cols.map(reflectColumn).sort((a,b)=>a-b);
    if(JSON.stringify(reflection)!==JSON.stringify(cols))throw Error("Sprite is not mirror-symmetric at row "+row.y);
  }
  const flood=new Set(),stack=[positions.values().next().value];
  while(stack.length){
    const node=stack.pop();
    if(flood.has(node))continue;
    flood.add(node);
    const [x,y]=node.split(",").map(Number);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const next=(x+dx)+","+(y+dy);
      if(positions.has(next)&&!flood.has(next))stack.push(next);
    }
  }
  if(flood.size!==positions.size)throw Error("Disconnected sprite");
  if(CAT_HALF_ROWS.length!==14)throw Error("Expected 14 cat rows");
  const catCells=new Set();
  for(const row of CAT_HALF_ROWS){
    const xs=Array.from({length:CAT_HALF_WIDTH},(_,i)=>i).filter(x=>catHalfPixelAt(x,row.y));
    if(xs.length!==row.to-row.from+1||xs.some((x,i)=>x!==row.from+i))
      throw Error("Cat row "+row.y+" is not a single clipped interval");
    for(const x of xs)catCells.add(x+","+row.y);
  }
  const catSeen=new Set(),catStack=[catCells.values().next().value];
  while(catStack.length){
    const node=catStack.pop();
    if(catSeen.has(node))continue;
    catSeen.add(node);
    const [x,y]=node.split(",").map(Number);
    for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
      const n=(x+dx)+","+(y+dy);
      if(catCells.has(n)&&!catSeen.has(n))catStack.push(n);
    }
  }
  if(catSeen.size!==catCells.size)throw Error("Cat half is disconnected");
  for(let n=0;n<14;n++)for(const level of LEVEL_IDS)for(let replay=0;replay<20;replay++){
    const q=makeQuestion(n,replay,level);
    const expected=level==="mirror"
      ? Array.from({length:CAT_HALF_WIDTH},(_,i)=>i).filter(x=>catHalfPixelAt(x,q.row)).map(i=>i+CAT_WINDOW.min)
      : columnsFor(ROWS.find(r=>r.y===q.row));
    if(JSON.stringify(paintedColumns(q))!==JSON.stringify(expected))
      throw Error("Paint mismatch "+level+" row "+q.row+" replay "+replay);
    if(level==="mirror"){
      if(q.artMode!=="mirror-half"||q.mirrorSide!=="right"||
         q.answer.direction==="between")throw Error("Cat mirror mode must be a right-half ray");
    }else if(q.artMode==="mirror"&&q.answer.direction==="between")
      throw Error("Mixed mirror question must be one-sided");
    if(q.mode==="read"&&q.options.filter(o=>identicalSolution(o.value,q.answer)).length!==1)
      throw Error("Ambiguous options");
  }
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<CAT_FULL_WIDTH;x++){
    if(catColourAt(x,y)!==catColourAt(CAT_FULL_WIDTH-1-x,y))throw Error("Cat colour asymmetry");
    if(catColourAt(x,y)!==null&&!catPixelAt(x,y))throw Error("Cat colour outside silhouette");
  }
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++)
    if(colourAt(x,y)!==colourAt(WIDTH-1-x,y))throw Error("Colour asymmetry at "+x+","+y);
  validateDetails("Cat Cameo",CAT_DETAILS,CAT_FULL_WIDTH,catPixelAt,CAT_DETAIL_STAGES);
  validateDetails("Mushroom Mystery",MUSHROOM_DETAILS,WIDTH,pixelAt,MUSHROOM_DETAIL_STAGES);
  for(const [artwork,width,mask] of [
    ["cat",CAT_FULL_WIDTH,catPixelAt],["mushroom",WIDTH,pixelAt]
  ]){
    for(let y=0;y<HEIGHT;y++)for(let x=0;x<width;x++){
      const colour=finishedBackgroundAt(artwork,x,y);
      if(!/^#[0-9a-f]{6}$/i.test(colour))
        throw Error(artwork+" has invalid background colour");
      if(colour!==finishedBackgroundAt(artwork,width-1-x,y))
        throw Error(artwork+" finished background is asymmetric");
    }
    if(!Object.isFrozen(FINISHED_BACKGROUNDS[artwork]))
      throw Error(artwork+" finished palette is mutable");
  }
  return {rows:ROWS.length,pixels:positions.size,connected:true,symmetric:true,
    catHalfPixels:catCells.size,catConnected:true,catWindow:CAT_WINDOW,
    catDetails:CAT_DETAILS.length,mushroomDetails:MUSHROOM_DETAILS.length};
}
