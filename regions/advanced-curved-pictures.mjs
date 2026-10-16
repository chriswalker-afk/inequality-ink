// Original advanced curved-region and plotted-construction picture catalogue.
// Every coloured component is the intersection of explicit inequalities.
// Plot mode uses exactly the SAME mathematical rules as Curve & Fill but
// demands genuine graph constructions before the student may shade them.
// Both galleries have distinct identities, clues, palette and saved progress.
import {q,parabola,vertical,absolute,circleRule} from "./curved-engine.mjs";
const fmt=n=>String(n).replace("-","−");
const xterm=h=>h===0?"x":h<0?"(x + "+fmt(-h)+")":"(x − "+fmt(h)+")";
const ftext=(a,h,k,side,inclusive)=>{
  const sign=side==="above"?(inclusive?"≥":">"):(inclusive?"≤":"<");
  const op=a<0?" − ":" + ",absA=Math.abs(a);
  return "y "+sign+" "+fmt(k)+op+
    (absA===1?"":fmt(absA))+xterm(h)+"²";
};
function par(id,a,h,k,side,inclusive=true){
  return parabola(id,ftext(a,h,k,side,inclusive),a,h,k,side,inclusive);
}
function hline(id,y,side,inclusive=true){
  return q(id,"y "+(side==="above"?(inclusive?"≥":">"):(inclusive?"≤":"<"))+" "+
    fmt(y),[y],"above"===side?"above":"below",inclusive);
}
function vline(id,x,side,inclusive=true){
  return vertical(id,"x "+(side==="right"?(inclusive?"≥":">"):(inclusive?"≤":"<"))+
    " "+fmt(x),x,side,inclusive);
}
function ab(id,h,k,a,side,inclusive=true){
  const positive=a>0;
  const term=(Math.abs(a)===1?"":fmt(Math.abs(a)))+"|"+xterm(h)+"|";
  const text="y "+(side==="above"?(inclusive?"≥":">"):(inclusive?"≤":"<"))+
    " "+fmt(k)+(positive?" + ":" − ")+term;
  return absolute(id,text,h,k,a,side,inclusive);
}
function circle(id,cx,cy,r,side="inside",inclusive=true){
  const txt="("+xterm(cx)+")² + (y"+
    (cy<0?" + "+fmt(-cy):cy>0?" − "+fmt(cy):"")+
    ")² "+(side==="inside"?(inclusive?"≤":"<"):(inclusive?"≥":">"))+
    " "+fmt(r*r);
  return circleRule(id,txt,cx,cy,r,side,inclusive);
}
const D=(type,stage,props)=>Object.freeze({type,stage,...props});
const circleDetail=(stage,x,y,r,fill)=>D("circle",stage,{x,y,r,fill,stroke:"#6b788b",width:.045});
const ellipseDetail=(stage,x,y,rx,ry,fill)=>D("ellipse",stage,{x,y,rx,ry,fill,stroke:"#667b8a",width:.045});
const curveDetail=(stage,x1,y1,cx,cy,x2,y2,stroke="#577e89")=>
  D("curve",stage,{x1,y1,cx,cy,x2,y2,stroke,width:.085});
const starDetail=(stage,x,y,r)=>D("star",stage,{x,y,r,fill:"#e8c17b",stroke:"#977656",width:.045});
const palettes=[
 ["#e1a6bb","#93c8ca","#e9c789","#93b7a1","#9b97c9","#79b4cb","#dca48d"],
 ["#90c4b2","#e4ae89","#a29bd2","#e9cb8f","#7db6cd","#d698b1","#b5c5a1"],
 ["#a5acd2","#e9c487","#8fc4bf","#e7a0ab","#d1bd97","#8cb0d0","#98bead"],
 ["#e5a3a5","#8dbdbc","#e8cb9a","#b7a1d6","#d5af8c","#82afcb","#bad0b3"]
];
const SUBJECTS=[
  {motif:"flower",curve:"Enchanted Wildflower",plot:"Sunlit Meadow Bloom",
    clue:"Something Begins to Blossom",
    parts:[["petal-crown","bell",0,1],["left-petal","disk",-1.5,1],
      ["right-petal","disk",1.5,1],["flower-stem","stripe",0,-1.5]]},
  {motif:"alien",curve:"Friendly Moon Creature",plot:"Orbital Robot Friend",
    clue:"Greetings from the Stars",
    parts:[["round-head","disk",0,1],["friendly-body","stripe",0,-1.5],
      ["left-antenna","bell",-2.5,2],["right-antenna","bell",2.5,2]]},
  {motif:"tower",curve:"Coastal Moon Beacon",plot:"Northern Star Tower",
    clue:"Light Through the Fog",
    parts:[["tall-tower","stripe",0,-1.5],["glowing-lantern","bell",0,2.5],
      ["left-bubble","disk",-3,1],["right-bubble","disk",3,1]]},
  {motif:"observatory",curve:"Planetarium Night",plot:"Night Sky Observatory",
    clue:"Look to the Stars",
    parts:[["domed-roof","bell",0,2],["great-hall","stripe",0,-1],
      ["left-moon","disk",-2.5,-.5],["right-moon","disk",2.5,-.5]]},
  {motif:"butterfly",curve:"Prismatic Moth",plot:"Fluttering Prism",
    clue:"Wings of Mathematics",
    parts:[["left-upper-wing","vpetal",-2,1],["right-upper-wing","vpetal",2,1],
      ["left-lower-wing","basin",-2,-1],["right-lower-wing","basin",2,-1],
      ["central-body","stripe",0,0]]},
  {motif:"planet",curve:"Planet and Stardust",plot:"Rings of Saturn",
    clue:"A New Orbit Awaits",
    parts:[["planet-disc","disk",0,0],["planetary-ring","band",0,1.5],
      ["left-stardust","vpetal",-2,-1.5],["right-stardust","vpetal",2,-1.5],
      ["distant-star","disk",3,3]]},
  {motif:"lantern",curve:"Midnight Lantern",plot:"Festival of Light",
    clue:"Chasing the Glow",
    parts:[["luminous-core","spear",0,1],["curved-roof","bell",0,3],
      ["left-side-glass","halfDisk",-2.5,0],["right-side-glass","halfDisk",2.5,0],
      ["hanging-tassel","stripe",0,-2.5]]},
  {motif:"fish",curve:"Moonlit Koi",plot:"Golden Ocean Fish",
    clue:"Something in the Water",
    parts:[["fish-body","disk",-.5,0],["pointed-tail","vpetal",2.5,0],
      ["top-fin","bell",-1.5,1.5],["bottom-fin","basin",-1.5,-1.5],
      ["floating-bubble","disk",3,3]]},
  {motif:"garden",curve:"Enchanted Canopy",plot:"Forest Treehouse",
    clue:"Secrets in the Leaves",
    parts:[["left-tree-crown","bell",-2,2],["central-crown","bell",0,2.5],
      ["right-tree-crown","bell",2,2],["main-tree-stem","stripe",0,-1.5],
      ["left-forest-fruit","disk",-2,0],["right-forest-fruit","disk",2,0],
      ["garden-ground","basin",0,-3]]},
  {motif:"jelly",curve:"Sea of Lantern Jellyfish",plot:"Deep Ocean Parade",
    clue:"A Glow Below the Waves",
    parts:[["left-jelly-bell","bell",-2.5,2],["middle-jelly-bell","bell",0,2.5],
      ["right-jelly-bell","bell",2.5,2],["left-trailing-ribbon","stripe",-2.5,-1.5],
      ["middle-trailing-ribbon","stripe",0,-1.5],
      ["right-trailing-ribbon","stripe",2.5,-1.5],
      ["glowing-bubble","disk",3,-3]]},
  {motif:"carnival",curve:"Cloud Nine Carnival",plot:"Sky Balloon Festival",
    clue:"A World Above the Clouds",
    parts:[["left-air-balloon","disk",-2.5,2],["central-air-balloon","disk",0,2.5],
      ["right-air-balloon","disk",2.5,2],["left-hanging-string","stripe",-2.5,-1],
      ["middle-hanging-string","stripe",0,-1],
      ["right-hanging-string","stripe",2.5,-1],
      ["festival-basket","disk",0,-3]]},
  {motif:"fireworks",curve:"Aurora Fireworks",plot:"Celestial Firework Show",
    clue:"Colour in the Night Sky",
    parts:[["upper-left-spark","vpetal",-2,1],["upper-right-spark","vpetal",2,1],
      ["lower-left-spark","basin",-2,-1],["lower-right-spark","basin",2,-1],
      ["central-flame","spear",0,2],["golden-core","disk",0,0],
      ["distant-comet","disk",3.5,3.5]]}
];
const qRules=(id,kind,x,y,step,num)=>{
 const rules=[],strict=step>=4&&(num%3===0),hard=step===5&&num%4===0;
 if(kind==="disk"){
   rules.push(circle(id+"-disc",x,y,step>=5&&num%2===0?1.5:1,"inside",!strict));
   if(num%3===1)rules.push(hline(id+"-disc-floor",y-.5,"above"));
 }else if(kind==="halfDisk"){
   rules.push(circle(id+"-round",x,y,1.5,"inside",!strict));
   rules.push(hline(id+"-midline",y,"above"));
 }else if(kind==="bell"){
   rules.push(par(id+"-arch",-.5,x,y+1.5,"below",!strict));
   rules.push(hline(id+"-rim",y-.5,"above"));
   if(hard)rules.push(vline(id+"-edge",x+1.5,"left"));
 }else if(kind==="basin"){
   rules.push(par(id+"-basin",.5,x,y-1.5,"above",!strict));
   rules.push(hline(id+"-lip",y+.5,"below"));
   if(hard)rules.push(vline(id+"-edge",x-1.5,"right"));
 }else if(kind==="stripe"){
   rules.push(par(id+"-bottom",.5,x,y-1.5,"above"));
   rules.push(hline(id+"-top",y+1.5,"below",!strict));
   rules.push(vline(id+"-left",x-.5,"right"));
   rules.push(vline(id+"-right",x+.5,"left",!hard));
 }else if(kind==="band"){
   rules.push(par(id+"-band-low",-.5,x,y-.5,"above"));
   rules.push(par(id+"-band-high",-.5,x,y+1,"below",!strict));
   rules.push(vline(id+"-band-left",x-1.5,"right"));
   rules.push(vline(id+"-band-right",x+1.5,"left"));
 }else if(kind==="vpetal"){
   rules.push(ab(id+"-v-lower",x,y-.5,.5,"above",!strict));
   rules.push(par(id+"-v-upper",-.5,x,y+2,"below"));
 }else if(kind==="spear"){
   rules.push(ab(id+"-v-top",x,y+1.5,-1,"below",!strict));
   rules.push(ab(id+"-v-bottom",x,y-.5,1,"above"));
 }else throw Error("Unknown mathematically drawn region "+kind);
 return Object.freeze(rules);
};
function plotPoints(rule){
  const close=n=>Math.abs(n*2-Math.round(n*2))<1e-8;
  if(rule.kind==="circle"){
    const cx=rule.cx,cy=rule.cy,r=rule.r;
    for(const dir of [1,-1])
      if(Math.abs(cx+dir*r)<=5&&Math.abs(cy)<=5&&close(cx+dir*r))
        return [{x:cx,y:cy},{x:cx+dir*r,y:cy}];
  }
  if(rule.kind==="vertical")return [
    {x:rule.x,y:-1.5},{x:rule.x,y:1.5}
  ];
  if(rule.kind==="absolute"){
    for(const dx of [1,2,-1,-2]){
      const y=rule.k+rule.a*Math.abs(dx),x=rule.h+dx;
      if(x>=-5&&x<=5&&y>=-5&&y<=5&&close(y))
        return [{x:rule.h,y:rule.k},{x,y}];
    }
  }
  if(rule.kind==="function"&&rule.coeffs.length===3){
    const [c,b,a]=rule.coeffs,h=-b/(2*a),k=c-b*b/(4*a);
    for(const dx of [1,-1,2,-2,.5,-.5]){
      const x=h+dx,y=k+a*dx*dx;
      if(x>=-5&&x<=5&&y>=-5&&y<=5&&close(x)&&close(y))
        return [{x:h,y:k},{x,y}];
    }
  }
  if(rule.kind==="function"&&rule.coeffs.length<=2){
    const list=[];
    for(let x=-4.5;x<=4.5;x+=.5){
      const y=rule.coeffs[0]+(rule.coeffs[1]||0)*x;
      if(y>=-5&&y<=5&&close(y))list.push({x,y});
    }
    if(list.length>=2)return [list[0],list[list.length-1]];
  }
  throw Error("No two exact snapped plotting points for "+rule.id);
}
function kindFor(rule){
 return rule.kind==="circle"?"circle":
   rule.kind==="absolute"?"absolute":
     rule.kind==="function"&&rule.coeffs.length===3?"parabola":"line";
}
function choosePlots(id,kind,rules,step,number){
  let primary=kind==="stripe"&&step===3?
    rules.find(r=>r.kind==="vertical"):rules.find(r=>
      r.kind==="circle"||r.kind==="absolute"||
      r.kind==="function"&&r.coeffs.length===3);
  if(!primary)primary=rules[0];
  const goals=[primary];
  if(step===4&&number===4||step===5&&number%3===0){
    const second=rules.find(r=>r.id!==primary.id&&
      (r.kind==="vertical"||r.kind==="function"&&r.coeffs.length<=2||
       r.kind==="absolute"));
    if(second)goals.push(second);
  }
  return Object.freeze(goals.map((target,i)=>{
    const pts=plotPoints(target),type=kindFor(target);
    return Object.freeze({ruleId:target.id,kind:type,
      samplePoints:Object.freeze(pts.map(p=>Object.freeze(p))),
      hints:Object.freeze([
        type==="circle"?"A circle needs a centre and radius.":
        type==="parabola"?"Plot the turning point before another point on the curve.":
        type==="absolute"?"Find the V's vertex before drawing an arm.":
        "Use two exact points that satisfy the line equation.",
        "Check your plotted coordinates against "+target.text+"."
      ]),
      guidance:i?"Construct the second boundary, then choose solid or dashed.":
        "Construct "+target.text+" from two mathematically correct points."
    });
  }));
}
const makeDetails=(id,mode,subject,index,step)=>{
  const off=mode==="plot"?.5:0;
  const accent=palettes[(index+step+(mode==="plot"?1:0))%4];
  const m=subject.motif;
  const natural=[
    circleDetail(1,off-.65,.45,.14,"#fff0d1"),
    circleDetail(1,off+.65,.45,.14,"#fff0d1"),
    ellipseDetail(1,off,0,.55,.20,accent[2]),
    ellipseDetail(1,off-1.65,2.0,.23,.14,"#f3debb"),
    ellipseDetail(1,off+1.65,2.0,.23,.14,"#f3debb"),
    curveDetail(2,off-1.1,-2,off,-2.25,off+1.1,-2,"#477f81"),
    curveDetail(2,off-1.85,-1.0,off-1.2,-1.55,off-.65,-1.0,"#5e8c96"),
    curveDetail(2,off+.65,-1,off+1.2,-1.55,off+1.85,-1,"#5e8c96"),
    circleDetail(2,off-3.6,.2,.11,"#ac8da4"),
    circleDetail(2,off+3.5,-.8,.13,"#a97c80"),
    starDetail(3,off-3.75,3.6,.25),
    starDetail(3,off+3.65,3.4,.22),
    circleDetail(3,off-3.7,-3,.11,"#779eaa"),
    circleDetail(3,off+3.55,-3.4,.11,"#779eaa")
  ];
  // The subject-specific final brushstroke deliberately varies by scene.
  const extras={
    flower:[curveDetail(2,off-.3,-1.2,off-1.6,-1.9,off-2.2,-1.25,"#548b75")],
    alien:[starDetail(3,off,4.15,.27)],
    tower:[curveDetail(2,off-3.8,-3.8,off,-3.65,off+3.8,-3.8,"#4c90a1")],
    observatory:[starDetail(3,off,4.2,.32)],
    butterfly:[curveDetail(2,off-.2,1.9,off-1.0,3.2,off-1.4,3.35,"#7c7398")],
    planet:[curveDetail(2,off-3.1,.65,off,1.6,off+3.1,.65,"#d4bb90")],
    lantern:[curveDetail(2,off-.55,3.9,off,4.45,off+.55,3.9,"#94717b")],
    fish:[circleDetail(2,off-1.2,.6,.20,"#536b79")],
    garden:[curveDetail(2,off-1.3,-2.9,off,-3.45,off+1.3,-2.9,"#528a6e")],
    jelly:[starDetail(3,off,4.35,.23)],
    carnival:[curveDetail(2,off-2.5,-3,off,-3.6,off+2.5,-3,"#8a7593")],
    fireworks:[starDetail(3,off,4.2,.33)]
  };
  return Object.freeze([...natural,...(extras[m]||[])].map((d,i)=>
    Object.freeze({id:id+"-detail-"+(i+1),...d})));
};
function picture(mode,step,i){
  const idx=(step-3)*4+i,subject=SUBJECTS[idx];
  const name=subject[mode],id="advanced-"+mode+"-"+step+"-"+subject.motif+"-"+i;
  const palette=palettes[(step+i+(mode==="plot"?1:0))%4];
  // Plot artwork is a shifted, differently illustrated composition, not
  // a screenshot of the Curve & Fill variant.
  const dx=mode==="plot"?.5:0;
  const parts=subject.parts.map(([label,kind,x,y],n)=>{
    const partId=id+"-piece-"+(n+1),xx=x+dx;
    const rules=qRules(partId,kind,xx,y,step,n);
    return Object.freeze({id:partId,name:label.replaceAll("-"," "),
      color:palette[n%palette.length],rules,
      ...(mode==="plot"?{plots:choosePlots(partId,kind,rules,step,n)}:{})});
  });
  const size=step===3?4:step===4?5:7;
  if(parts.length!==size)throw Error("Incorrect advanced curved piece count "+id);
  const focus=step===3?
    "Intersect translated parabolas and circles; interpret strict boundaries and linked regions.":
    step===4?"Use absolute-value V graphs, circle inequalities and translated parabolic intersections.":
      "Combine multiple non-linear boundary types, strict signs and several plotted regions.";
  return Object.freeze({id,mode,step,
    stage:step===3?"Building":step===4?"Challenge":"Big Finish",
    name,clue:subject.clue,
    description:"Reveal "+name.toLowerCase()+" through "+size+
      " mathematically shaded, deliberately different regions and animated artistic finishing details.",
    focus:focus+(mode==="plot"?" Construct the required graph from two correct points.":""),practice:true,
    advancedVariety:true,advancedMotif:subject.motif,
    pieces:Object.freeze(parts),
    details:makeDetails(id,mode,subject,i,step)});
}
export const ADVANCED_CURVE_PICTURES=Object.freeze(
  [3,4,5].flatMap(step=>[0,1,2,3].map(i=>picture("curve",step,i)))
);
export const ADVANCED_PLOT_PICTURES=Object.freeze(
  [3,4,5].flatMap(step=>[0,1,2,3].map(i=>picture("plot",step,i)))
);
