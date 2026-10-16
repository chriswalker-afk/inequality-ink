// Complex Quest: one genuinely mathematical picture at each difficulty.
// Artwork is made only from plotted points, transformations and complex loci.
export const COMPLEX_SAVE_KEY="inequality-ink-complex-quest-v1";
export const COMPLEX_WORLD=Object.freeze({min:-5,max:5});
export const COMPLEX_ANGLES=Object.freeze([-180,-135,-90,-45,0,45,90,135,180]);
export const COMPLEX_STAGES=Object.freeze([
  Object.freeze({step:1,name:"Quick Spark",focus:"Plot points on the Argand diagram"}),
  Object.freeze({step:2,name:"Step Up",focus:"Rotations and complex conjugates"}),
  Object.freeze({step:3,name:"Ink Builder",focus:"Modulus loci and shaded discs"}),
  Object.freeze({step:4,name:"Brain Stretch",focus:"Arguments, translated sectors and rays"}),
  Object.freeze({step:5,name:"Masterpiece",focus:"Intersections of modulus and argument regions"})
]);
const z=(re,im)=>Object.freeze({re,im});
const point=(id,re,im,color)=>Object.freeze({id,kind:"point",target:z(re,im),color});
const transform=(id,seed,operation,color)=>Object.freeze({
  id,kind:"transform",seed:z(...seed),operation,color
});
const disc=(id,centre,radius,color,strict=false)=>Object.freeze({
  id,kind:"disc",centre:z(...centre),radius,strict,color
});
const sector=(id,centre,from,to,color,strict=false)=>Object.freeze({
  id,kind:"sector",centre:z(...centre),from,to,strict,color
});
const bounded=(id,centre,radius,from,to,color,strict=false)=>Object.freeze({
  id,kind:"bounded",centre:z(...centre),radius,from,to,strict,color
});
const picture=(id,name,step,clue,description,pieces)=>Object.freeze({
  id,name,step,stage:COMPLEX_STAGES[step-1].name,clue,description,
  pieces:Object.freeze(pieces)
});
export const COMPLEX_PICTURES=Object.freeze([
  picture("star-trail","Star Trail",1,"Five points. One star.",
    "Plot five complex numbers, then join them in order to create your constellation.",[
      point("s1",0,4,"#e5ba6a"),
      point("s2",2,-3,"#e5ba6a"),
      point("s3",-4,1,"#e5ba6a"),
      point("s4",4,1,"#e5ba6a"),
      point("s5",-2,-3,"#e5ba6a")
    ]),
  picture("rotating-pinwheel","Rotating Pinwheel",2,"Turn complex numbers into colour.",
    "Use conjugation and multiplication by i or -i to plot four rotating blades.",[
      transform("w1",[1,-3],"conjugate","#dd987c"),
      transform("w2",[3,-1],"conjugate","#dd987c"),
      transform("w3",[1,3],"i","#f0c674"),
      transform("w4",[3,1],"i","#f0c674"),
      transform("w5",[1,3],"negate","#85b6aa"),
      transform("w6",[3,1],"negate","#85b6aa"),
      transform("w7",[1,3],"-i","#88a9ca"),
      transform("w8",[3,1],"-i","#88a9ca")
    ]),
  picture("bubble-bouquet","Bubble Bouquet",3,"A garden of distances.",
    "Every disc is the exact set of complex numbers within a given distance of its centre.",[
      disc("b1",[-2,1],2,"#e7aa85"),
      disc("b2",[0,2],2,"#e9c67d"),
      disc("b3",[2,1],2,"#87b6b0",true),
      disc("b4",[-1,-2],2,"#b4a5cb"),
      disc("b5",[1,-2],2,"#83add0"),
      disc("b6",[0,0],1,"#f0d3a4")
    ]),
  picture("aurora-beams","Aurora Beams",4,"Illuminate the Argand plane.",
    "Read translated argument inequalities to construct five unbounded coloured sectors.",[
      sector("a1",[-3,-4],45,90,"#7da9bd"),
      sector("a2",[-1,-4],45,90,"#83bfab",true),
      sector("a3",[1,-4],90,135,"#d6acda"),
      sector("a4",[3,-4],90,135,"#edbb80"),
      sector("a5",[0,-4],45,135,"#d0d9a0",true)
    ]),
  picture("prism-butterfly","Prism Butterfly",5,"Make the loci overlap.",
    "Each wing is the intersection of a modulus disc and an argument sector.",[
      bounded("f1",[-1,0],3,90,180,"#d99aba"),
      bounded("f2",[1,0],3,0,90,"#8ab5ca"),
      bounded("f3",[-1,0],2,-180,-90,"#e9b178",true),
      bounded("f4",[1,0],2,-90,0,"#87b8a6",true),
      bounded("f5",[-1,0],1,90,135,"#f3d58c"),
      bounded("f6",[1,0],1,45,90,"#e7be7c")
    ])
]);
export const complexPicture=id=>COMPLEX_PICTURES.find(p=>p.id===id)||null;
const close=(a,b)=>Math.abs(a-b)<1e-9;
export function complexTransform(seed,operation){
  const {re,im}=seed;
  switch(operation){
    case "conjugate":return {re,im:-im};
    case "i":return {re:-im,im:re};
    case "-i":return {re:im,im:-re};
    case "negate":return {re:-re,im:-im};
    case "identity":return {re,im};
    default:throw Error("Unknown complex transformation "+operation);
  }
}
export function complexTarget(piece){
  return piece.kind==="point"?piece.target:
    piece.kind==="transform"?complexTransform(piece.seed,piece.operation):
    {...piece.centre,
      ...(piece.radius==null?{}:{radius:piece.radius}),
      ...(piece.from==null?{}:{from:piece.from,to:piece.to})};
}
export function matchesComplexTarget(piece,candidate){
  if(!piece||!candidate)return false;
  const answer=complexTarget(piece);
  const re=Number(candidate.re),im=Number(candidate.im);
  if(candidate.re===""||candidate.im===""||!Number.isFinite(re)||
    !Number.isFinite(im)||!close(re,answer.re)||!close(im,answer.im))return false;
  if("radius" in answer){
    if(candidate.radius===""||!Number.isFinite(Number(candidate.radius))||
      !close(Number(candidate.radius),answer.radius))return false;
  }
  if("from" in answer){
    if(candidate.from===""||candidate.to===""||
      !Number.isFinite(Number(candidate.from))||!Number.isFinite(Number(candidate.to))||
      !close(Number(candidate.from),answer.from)||
      !close(Number(candidate.to),answer.to))return false;
  }
  return true;
}
const sign=n=>n<0?"−":"+";
export function complexLabel({re,im}){
  if(!Number.isInteger(re)||!Number.isInteger(im))throw Error("Integer complex components required");
  if(im===0)return String(re);
  const part=(Math.abs(im)===1?"":Math.abs(im))+"i";
  return re===0?(im<0?"−":"")+part:
    re+(im<0?" − ":" + ")+part;
}
export function complexAngleLabel(deg){
  if(deg===0)return "0";
  const abs=Math.abs(deg),n=abs/45;
  if(!Number.isInteger(n)||n>4)throw Error("Unsupported angle "+deg);
  const labels={1:"π/4",2:"π/2",3:"3π/4",4:"π"};
  return (deg<0?"−":"")+labels[n];
}
export function complexQuestion(piece){
  if(piece.kind==="point")return "Plot z = "+complexLabel(piece.target)+".";
  if(piece.kind==="transform"){
    const op={conjugate:"conj(z)",i:"iz","-i":"−iz",negate:"−z",identity:"z"}[piece.operation];
    return "Given z = "+complexLabel(piece.seed)+", plot "+op+".";
  }
  const centre=piece.centre.re===0&&piece.centre.im===0?
    "z":"z − ("+complexLabel(piece.centre)+")";
  const relation=piece.strict?"<":"≤";
  const modulus="|"+centre+"| "+relation+" "+piece.radius;
  if(piece.kind==="disc")return modulus;
  const argument=complexAngleLabel(piece.from)+" "+relation+" arg("+
    centre+") "+relation+" "+complexAngleLabel(piece.to);
  if(piece.kind==="sector")return argument;
  return modulus+"    and    "+argument;
}
export function complexHint(piece,level=0){
  if(piece.kind==="point")
    return level===0?"The horizontal coordinate is Re(z); the vertical is Im(z).":
      "For z = "+complexLabel(piece.target)+", read the coefficient of i carefully.";
  if(piece.kind==="transform")
    return level===0?"Conjugation reflects in the real axis; multiplying by i rotates 90° anticlockwise.":
      "Write z = a + bi. Then iz = −b + ai, −iz = b − ai and conj(z) = a − bi.";
  if(piece.kind==="disc"||piece.kind==="bounded")
    return level===0?"|z − c| describes distance from c. The centre is c and the radius is the number on the right.":
      "Do not change signs in c: |z − (a + bi)| has centre (a, b).";
  return level===0?"arg(z − c) measures the angle of the ray from c, anticlockwise from the positive real direction.":
    "A sector is unbounded unless a modulus condition also limits its distance.";
}
export function validateComplexQuest(){
  if(COMPLEX_PICTURES.length!==5)throw Error("Expected five Complex Quest pictures");
  const ids=new Set(),taskIds=new Set();
  for(const [idx,p] of COMPLEX_PICTURES.entries()){
    if(p.step!==idx+1||ids.has(p.id)||p.pieces.length<4)
      throw Error("Invalid Complex Quest progression "+p.id);
    ids.add(p.id);
    for(const piece of p.pieces){
      if(taskIds.has(piece.id))throw Error("Duplicate Complex Quest piece "+piece.id);
      taskIds.add(piece.id);
      const answer=complexTarget(piece);
      if(!Number.isInteger(answer.re)||!Number.isInteger(answer.im)||
        Math.abs(answer.re)>4||Math.abs(answer.im)>4||
        !matchesComplexTarget(piece,answer))
        throw Error("Unplottable complex result "+piece.id);
      if(["disc","sector","bounded"].includes(piece.kind)){
        if(piece.kind!=="sector"&&(!Number.isInteger(piece.radius)||
          piece.radius<1||piece.radius>4))throw Error("Invalid modulus "+piece.id);
        if(piece.kind!=="disc"&&
          (!COMPLEX_ANGLES.includes(piece.from)||!COMPLEX_ANGLES.includes(piece.to)||
            piece.from>=piece.to||piece.to-piece.from>180))
          throw Error("Invalid argument sector "+piece.id);
      }
    }
  }
  return true;
}