// Advanced Linear Graph Art (Ink Builder, Brain Stretch, Masterpiece).
// Twelve different geometric subjects are composed as genuine convex regions.
// The different modes have separate artworks, colours, transformations, clues
// and persistent picture IDs, with no changes to old core definitions.
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=a%b;a=b;b=t;}return a||1};
const rational=(n,d=1)=>{
  if(d<0){n=-n;d=-d}const g=gcd(n,d);n/=g;d/=g;
  const sign=n<0?"−":"",mag=Math.abs(n),parts={"1/2":"½","1/3":"⅓","2/3":"⅔","1/4":"¼","3/4":"¾","1/5":"⅕","2/5":"⅖","3/5":"⅗","4/5":"⅘"};
  return sign+(d===1?String(mag):parts[mag+"/"+d]||mag+"/"+d);
};
function readable(a,b,c,strict,standard=false,flip=false){
  const sign=less=>less?(strict?"<":"≤"):(strict?">":"≥");
  if(a===0)return "y "+sign(b>0)+" "+rational(c,b);
  if(b===0)return "x "+sign(a>0)+" "+rational(c,a);
  if(standard){
    const n=flip?-1:1,A=n*a,B=n*b,C=n*c;
    const term=(v,letter,start)=>!v?"":(start?(v<0?"−":""):(v<0?" − ":" + "))+
      (Math.abs(v)===1?"":Math.abs(v))+letter;
    return term(A,"x",true)+term(B,"y",false)+" "+
      (flip?(strict?">":"≥"):(strict?"<":"≤"))+" "+rational(C);
  }
  const m=-a/b,k=c/b;
  return "y "+sign(b>0)+" "+(Math.abs(m)===1?(m<0?"−":"")+"x":rational(-a,b)+"x")+
    (Math.abs(k)<1e-9?"":k<0?" − "+rational(Math.abs(c),Math.abs(b)):" + "+rational(Math.abs(c),Math.abs(b)));
}
const rect=(l,b,r,t)=>[[l,b],[r,b],[r,t],[l,t]];
const tri=(a,b,c)=>[a,b,c];
const diamond=(x,y,rx,ry)=>[[x,y+ry],[x-rx,y],[x,y-ry],[x+rx,y]];
const trap=(l,b,r,t,ul,ur)=>[[l,b],[r,b],[ur,t],[ul,t]];
const hex=(x,y,rx,ry)=>{
 const inset=Math.round(rx*.6*4)/4;
 return [[x-inset,y+ry],[x+inset,y+ry],[x+rx,y],
   [x+inset,y-ry],[x-inset,y-ry],[x-rx,y]];
};
// All authored coordinates are multiples of .25; hex widths use increments .5.
const sh=(name,group,points)=>({name,group,points});
function motif(which){
  switch(which){
  case "owl":return [
    sh("Round owl body",0,hex(0,-.6,2.5,2.5)),
    sh("Left pointed ear",1,tri([-2,1.2],[-1.2,3.75],[-.15,1.45])),
    sh("Right pointed ear",1,tri([2,1.2],[1.2,3.75],[.15,1.45])),
    sh("Left feathered wing",2,tri([-1.5,-.2],[-3.25,-1.4],[-1.5,-2.25])),
    sh("Right feathered wing",2,tri([1.5,-.2],[3.25,-1.4],[1.5,-2.25])),
    sh("Left eye",3,diamond(-.75,.6,.55,.55)),
    sh("Right eye",3,diamond(.75,.6,.55,.55)),
    sh("Tiny beak",4,tri([-.4,-.25],[.4,-.25],[0,-1.0])),
    sh("Perching branch",5,trap(-3.5,-3.5,3.5,-3.05,-3.75,3.75))
  ];
  case "boat":return [
    sh("Boat hull",0,trap(-4,-2.25,4,-3.75,-2.5,2.5)),
    sh("Main triangular sail",1,tri([-1.75,-2],[0,2.5],[0,-2])),
    sh("Forward sail",2,tri([.25,-2],[.25,3.25],[3,-2])),
    sh("Tall mast",3,rect(-.25,-2.25,.25,3.5)),
    sh("Sun over the bay",4,diamond(-3,3,.75,.75)),
    sh("Left rippling water",5,trap(-4.5,-4.5,-1.25,-4,-4.25,-.75)),
    sh("Right rippling water",5,trap(.5,-4.5,4.5,-4,.75,4.25)),
    sh("Cloud at sea",4,diamond(3.5,3.7,.75,.45)),
    sh("Sailboat pennant",3,tri([0,3.5],[0,4.25],[1,3.75]))
  ];
  case "windmill":return [
    sh("Stone windmill tower",0,trap(-1.8,-3.5,1.8,.9,-1,1)),
    sh("Roof",1,tri([-1.25,.9],[1.25,.9],[0,2.45])),
    sh("North windmill sail",2,diamond(0,3.25,.4,1.15)),
    sh("East windmill sail",2,diamond(2.15,1.75,1.15,.4)),
    sh("South windmill sail",2,diamond(0,.15,.4,1.15)),
    sh("West windmill sail",2,diamond(-2.15,1.75,1.15,.4)),
    sh("Front doorway",3,rect(-.55,-3.5,.55,-1.75)),
    sh("Morning sunshine",4,diamond(3.5,3.5,.75,.75)),
    sh("Path through the field",5,trap(-1.25,-4.5,1.25,-3.5,-.5,.5))
  ];
  case "cat":return [
    sh("Cat face",0,hex(0,-.15,2.5,2.0)),
    sh("Left ear",1,tri([-2,1.2],[-1.75,3.5],[-.35,1.5])),
    sh("Right ear",1,tri([2,1.2],[1.75,3.5],[.35,1.5])),
    sh("Left bright eye",2,diamond(-.8,.35,.45,.5)),
    sh("Right bright eye",2,diamond(.8,.35,.45,.5)),
    sh("Pink nose",3,tri([-.35,-.45],[.35,-.45],[0,-1])),
    sh("Cat collar",4,trap(-1.5,-2.5,1.5,-2,-1.25,1.25)),
    sh("Golden bell",5,diamond(0,-2.75,.5,.5)),
    sh("Curled tail",4,tri([1.5,-2],[3,-3.5],[3.75,-1.25]))
  ];
  case "rocket":return [
    sh("Rocket fuselage",0,rect(-1.25,-2.5,1.25,2.0)),
    sh("Pointed nose",1,tri([-1.25,2],[1.25,2],[0,4.25])),
    sh("Left stabiliser",2,tri([-1.25,-1],[-3.5,-3.25],[-1.25,-2.5])),
    sh("Right stabiliser",2,tri([1.25,-1],[3.5,-3.25],[1.25,-2.5])),
    sh("Crystal window",3,diamond(0,.75,.75,.75)),
    sh("Rocket engine",4,rect(-.75,-3.1,.75,-2.5)),
    sh("Left flame",5,tri([-.75,-3],[0,-4.5],[0,-3.0])),
    sh("Right flame",5,tri([0,-3],[0,-4.5],[.75,-3])),
    sh("Distant star",3,diamond(3.5,3.5,.5,.5))
  ];
  case "lighthouse":return [
    sh("Tall tapered tower",0,trap(-1.75,-3.75,1.75,1.75,-1,1)),
    sh("Beacon lantern",1,rect(-1,1.75,1,3)),
    sh("Pointed lighthouse roof",2,tri([-1.25,3],[1.25,3],[0,4.25])),
    sh("Entrance door",3,rect(-.6,-3.75,.6,-2)),
    sh("Lower striped band",4,trap(-1.5,-1.75,1.5,-1,-1.4,1.4)),
    sh("Upper striped band",4,trap(-1.25,.25,1.25,.75,-1.15,1.15)),
    sh("Glass beacon",5,diamond(0,2.35,.45,.45)),
    sh("Left light beam",1,tri([-1,2.5],[-4.5,3.25],[-4.25,1.75])),
    sh("Right light beam",1,tri([1,2.5],[4.5,3.25],[4.25,1.75]))
  ];
  case "tree":return [
    sh("Tall tree trunk",0,rect(-.65,-3.5,.65,.65)),
    sh("Leafy middle canopy",1,diamond(0,1.5,2.25,2.5)),
    sh("Leafy left canopy",2,diamond(-2,1.15,1.4,1.6)),
    sh("Leafy right canopy",2,diamond(2,1.15,1.4,1.6)),
    sh("Fruit on left",3,diamond(-2.1,1.45,.45,.45)),
    sh("Fruit on right",3,diamond(2.1,1.45,.45,.45)),
    sh("Golden fruit",3,diamond(0,2.75,.4,.4)),
    sh("Garden hill",4,tri([-4.25,-4],[4.25,-4],[0,-3])),
    sh("Sun through leaves",5,diamond(3.65,3.65,.5,.5))
  ];
  case "submarine":return [
    sh("Submarine hull",0,hex(0,-1.25,3.5,1.5)),
    sh("Raised deck",1,rect(-1.25,.25,1.25,1.25)),
    sh("Periscope",2,rect(-.35,1.25,.35,3.5)),
    sh("Periscope cap",3,diamond(.45,3.4,.65,.4)),
    sh("Left porthole",4,diamond(-1.5,-1.15,.55,.55)),
    sh("Right porthole",4,diamond(1.5,-1.15,.55,.55)),
    sh("Rear fin",2,tri([2,-1],[4,-2.5],[3.25,-.5])),
    sh("Left bubble",5,diamond(-3.6,2.0,.55,.55)),
    sh("Right bubble",5,diamond(3,3.25,.65,.65))
  ];
  case "castle":return [
    sh("Castle great hall",0,rect(-2.25,-3.5,2.25,1)),
    sh("Left tower",1,rect(-4,-3.5,-2,2.25)),
    sh("Right tower",1,rect(2,-3.5,4,2.25)),
    sh("Left spire",2,tri([-4.25,2.25],[-1.75,2.25],[-3,4.25])),
    sh("Right spire",2,tri([1.75,2.25],[4.25,2.25],[3,4.25])),
    sh("Central castle door",3,diamond(0,-2.15,.8,1.35)),
    sh("Left pennant",4,tri([-3,3.25],[-3,4.5],[-1.5,4])),
    sh("Left tower window",5,diamond(-3,.0,.45,.75)),
    sh("Right tower window",5,diamond(3,.0,.45,.75))
  ];
  case "butterfly":return [
    sh("Upper left wing",0,diamond(-1.75,1.25,1.75,2.0)),
    sh("Upper right wing",1,diamond(1.75,1.25,1.75,2.0)),
    sh("Lower left wing",2,diamond(-1.5,-1.5,1.45,1.25)),
    sh("Lower right wing",3,diamond(1.5,-1.5,1.45,1.25)),
    sh("Slender butterfly body",4,diamond(0,-.25,.4,2.5)),
    sh("Left antenna",5,tri([-.15,1.75],[-1.4,3.75],[-.85,3.25])),
    sh("Right antenna",5,tri([.15,1.75],[1.4,3.75],[.85,3.25])),
    sh("Left wing spot",5,diamond(-2,1.45,.55,.55)),
    sh("Right wing spot",5,diamond(2,1.45,.55,.55))
  ];
  case "train":return [
    sh("Train locomotive",0,rect(-3.75,-2.5,2.5,.25)),
    sh("Driver's cab",1,rect(-2,0,1.25,2.5)),
    sh("Train front",2,rect(2.5,-2.5,4,-.5)),
    sh("Cab roof",3,trap(-2.25,2.5,1.5,3.25,-2,1.25)),
    sh("Smokestack",4,rect(2.5,-.5,3.25,2)),
    sh("Puff of smoke",5,diamond(3.2,3.0,.65,.55)),
    sh("Small steam cloud",5,diamond(4,3.75,.45,.45)),
    sh("Front train wheel",4,diamond(1.75,-2.75,.75,.75)),
    sh("Rear train wheel",4,diamond(-2.5,-2.75,.75,.75))
  ];
  case "phoenix":return [
    sh("Golden bird body",0,hex(0,-.5,1.75,2)),
    sh("Left flame wing",1,tri([-1.0,1],[-4.25,3.25],[-2.25,-1])),
    sh("Right flame wing",1,tri([1,1],[4.25,3.25],[2.25,-1])),
    sh("Left tail feather",2,tri([-.5,-2],[-2.5,-4.5],[0,-3])),
    sh("Right tail feather",2,tri([.5,-2],[2.5,-4.5],[0,-3])),
    sh("Bird crown",3,tri([-.9,1.5],[0,3.75],[.9,1.5])),
    sh("Left gleaming eye",4,diamond(-.65,.5,.35,.4)),
    sh("Right gleaming eye",4,diamond(.65,.5,.35,.4)),
    sh("Heart of the fire",5,diamond(0,-2.5,.55,.65))
  ];
  }
  throw Error("Unknown advanced subject "+which);
}
const MOTIFS=["owl","boat","windmill","cat","rocket","lighthouse",
  "tree","submarine","castle","butterfly","train","phoenix"];
const PRIMARY=[
  ["#8cb3c0","#cf97a9","#e8bc7e","#577f9d","#f5d89d","#8caa9c"],
  ["#92bcb1","#9f9bc8","#e6bb83","#477e9d","#dd8395","#bbd2c5"],
  ["#d1b595","#89b8bb","#e79c8e","#677da7","#edd28e","#78a88b"],
  ["#c9a0b4","#ebad84","#8dc3d0","#647ea1","#f5d38e","#9db9a4"]
];
const TITLES=[
  ["Twilight Owl","Cloud Sailboat","Hilltop Windmill","Whisker Cat",
   "Meteor Rocket","Beacon on the Cliffs","Emerald Orchard","Coral Submarine",
   "Moonlit Fortress","Prism Butterfly","Steam Express","Firebird Rising"],
  ["Starlight Owl","Harbour Dream","Four-Winds Mill","Midnight Cat",
   "Comet Explorer","Northern Beacon","Enchanted Tree","Ocean Explorer",
   "Sky Kingdom","Aurora Wings","Festival Express","Solar Phoenix"]
];
const CLUES=["Feathers after Dark","Catch the Wind","Turning in the Breeze","Whisker Mystery",
  "Launch into Wonder","A Light in the Night","Hidden in the Leaves","Deep Blue Voyage",
  "A Royal Secret","Spread Your Wings","All Aboard!","Born from Starlight"];
const FOCUS=[
  "Rising and falling boundaries · coordinate intersections · strict signs",
  "Standard-form half-planes · fractional gradients · open/closed edges",
  "Multi-facet convex regions · mixed inequalities · rigorous sign interpretation"
];
const scalePoint=(pt,shift,mirror)=>[
  (mirror?-pt[0]:pt[0])+shift,pt[1]
];
const D=(type,stage,attrs)=>Object.freeze({type,stage,...attrs});
const colour=(palette,i)=>palette[i%palette.length];
const fmtTerm=(a,b,first)=>!a?"":(first?(a<0?"−":""):(a<0?" − ":" + "))+
  (Math.abs(a)===1?"":Math.abs(a))+b;
function polygon(id,name,color,input,step,i){
  let verts=input.map(([x,y])=>[x,y]);
  let signed=verts.reduce((s,p,j)=>{
    const q=verts[(j+1)%verts.length];return s+p[0]*q[1]-q[0]*p[1];
  },0);
  if(Math.abs(signed)<1e-7)throw Error("Flat advanced piece "+id);
  if(signed<0)verts.reverse();
  const rules=verts.map((p,k)=>{
    const nxt=verts[(k+1)%verts.length];
    const dx=Math.round((nxt[0]-p[0])*4),dy=Math.round((nxt[1]-p[1])*4);
    if(Math.abs(dx/4-(nxt[0]-p[0]))>1e-9||
      Math.abs(dy/4-(nxt[1]-p[1]))>1e-9)
      throw Error("Advanced polygon needs quarter-grid points "+id);
    let a=dy*4,b=-dx*4,c=dy*4*p[0]-dx*4*p[1];
    if(!Number.isInteger(c))throw Error("Noninteger advanced edge "+id);
    const g=gcd(gcd(a,b),c);a/=g;b/=g;c/=g;
    const strict=step===3?(i===1&&k===0):
      step===4?(i%3===0&&k===1):(i%2===0&&k===0||i%3===1&&k===2);
    const standard=step>=4&&a!==0&&b!==0&&
      (step===5||(i+k)%2===0);
    const flip=standard&&(i+k)%3===0;
    const sig=less=>less?(strict?"<":"≤"):(strict?">":"≥");
    let text;
    if(b===0)text="x "+sig(a>0)+" "+rational(c,a);
    else if(a===0)text="y "+sig(b>0)+" "+rational(c,b);
    else if(standard)text=fmtTerm(flip?-a:a,"x",true)+
      fmtTerm(flip?-b:b,"y",false)+" "+
      (flip?(strict?">":"≥"):(strict?"<":"≤"))+" "+rational(flip?-c:c);
    else{
      const slope=-a/b,intercept=c/b;
      text="y "+sig(b>0)+" "+
        (Math.abs(slope)===1?(slope<0?"−":"")+"x":rational(-a,b)+"x")+
        (Math.abs(intercept)<1e-9?"":intercept<0?
          " − "+rational(Math.abs(c),Math.abs(b)):
          " + "+rational(Math.abs(c),Math.abs(b)));
    }
    return Object.freeze({id:id+"-edge-"+(k+1),a,b,c,
      inclusive:!strict,form:a===0||b===0?"axis":standard?"standard":"slope",text});
  });
  return Object.freeze({id,name,color,
    vertices:Object.freeze(verts.map(([x,y])=>Object.freeze({x,y}))),
    rules:Object.freeze(rules)});
}
function details(id,subject,mirror,shift,palette){
  const dx=x=>(mirror?-x:x)+shift;
  const dots=[
    D("circle",0,{x:dx(-1.2),y:.65,r:.17,color:"#fff0cc"}),
    D("circle",0,{x:dx(.9),y:1.15,r:.13,color:"#fff0cc"}),
    D("ellipse",0,{x:dx(.1),y:-.55,rx:.24,ry:.15,color:"#fff4dc"}),
    D("line",0,{x1:dx(-.8),y1:-1.5,x2:dx(.8),y2:-1.5,color:colour(palette,3),width:.09}),
    D("line",1,{x1:dx(-2.8),y1:-3.9,x2:dx(2.8),y2:-3.9,color:"#437f85",width:.10}),
    D("circle",1,{x:dx(-3.2),y:1.5,r:.1,color:"#a9788f"}),
    D("circle",1,{x:dx(3.1),y:2.6,r:.13,color:"#b78f59"}),
    D("ellipse",1,{x:dx(.2),y:2.35,rx:.32,ry:.14,color:"#f2d6a0"}),
    D("star",2,{x:dx(-3.75),y:3.65,r:.26,color:"#b4824b"}),
    D("star",2,{x:dx(3.7),y:3.45,r:.23,color:"#b4824b"}),
    D("circle",2,{x:dx(3.5),y:-3.2,r:.12,color:"#8d769c"}),
    D("circle",2,{x:dx(-3.6),y:-2.85,r:.10,color:"#7098a1"})
  ];
  const context={
    owl:[D("line",1,{x1:dx(-2.2),y1:-3.5,x2:dx(2.2),y2:-3.5,color:"#856d58",width:.13})],
    boat:[D("line",1,{x1:dx(0),y1:-2.3,x2:dx(0),y2:3.8,color:"#685e62",width:.12})],
    windmill:[D("circle",1,{x:dx(0),y:1.75,r:.32,color:"#f6e0a7"})],
    cat:[D("line",1,{x1:dx(-2.4),y1:-1.0,x2:dx(-3.45),y2:-.8,color:"#795c69",width:.08}),
      D("line",1,{x1:dx(2.4),y1:-1,x2:dx(3.45),y2:-.8,color:"#795c69",width:.08})],
    rocket:[D("line",1,{x1:dx(-1),y1:0,x2:dx(1),y2:0,color:"#4f708b",width:.12})],
    lighthouse:[D("line",1,{x1:dx(-2.5),y1:-4.2,x2:dx(2.5),y2:-4.2,color:"#54949c",width:.12})],
    tree:[D("line",1,{x1:dx(-.5),y1:-3.1,x2:dx(.5),y2:-3.1,color:"#826e59",width:.12})],
    submarine:[D("circle",1,{x:dx(3.8),y:2.5,r:.22,color:"#649bb3"})],
    castle:[D("line",1,{x1:dx(-4.2),y1:-3.75,x2:dx(4.2),y2:-3.75,color:"#798d88",width:.12})],
    butterfly:[D("line",1,{x1:dx(-.3),y1:1.75,x2:dx(-1.2),y2:3.4,color:"#736e8f",width:.09}),
      D("line",1,{x1:dx(.3),y1:1.75,x2:dx(1.2),y2:3.4,color:"#736e8f",width:.09})],
    train:[D("line",1,{x1:dx(-4.2),y1:-3.75,x2:dx(4.2),y2:-3.75,color:"#777886",width:.12})],
    phoenix:[D("star",1,{x:dx(0),y:3.6,r:.29,color:"#ba7c51"})]
  };
  return Object.freeze([...dots,...(context[subject]||[])].map((d,i)=>
    Object.freeze({id:id+"-detail-"+(i+1),...d})));
}
export const ADVANCED_LINEAR_PICTURES=Object.freeze(
  [3,4,5].flatMap((step,j)=>
    ["fill","build"].flatMap((mode,modeIndex)=>{
      const size=step===3?4:step===4?(mode==="fill"?6:5):(mode==="fill"?9:8);
      return Array.from({length:4},(_,index)=>{
        const themeIndex=(j*4+index+(mode==="build"?6:0))%MOTIFS.length;
        const theme=MOTIFS[themeIndex],mirror=mode==="build";
        const palette=PRIMARY[(j+index+modeIndex)%PRIMARY.length];
        const shift=mode==="build"&&j%2===1?.25:0;
        const id="advanced-"+mode+"-"+step+"-"+theme+"-"+index;
        const shapes=motif(theme).slice(0,size);
        const parts=shapes.map((part,i)=>{
          const points=part.points.map(p=>scalePoint(p,shift,mirror));
          return polygon(id+"-part-"+(i+1),part.name,
            colour(palette,part.group),points,step,i);
        });
        const name=TITLES[modeIndex][themeIndex],stage=["","","",
          "Building","Challenge","Big Finish"][step];
        return Object.freeze({id,mode,step,stage,name,
          clue:CLUES[themeIndex],
          description:"Bring "+name.toLowerCase()+" to life from "+size+
            " actual convex inequality intersections, with unique illustrated finishing details.",
          focus:FOCUS[j]+(mode==="build"?
            " · select sides and solid/dashed line styles":
            " · read and fill the common solution of every inequality"),
          pieces:Object.freeze(parts),
          details:details(id,theme,mirror,shift,palette),
          practice:true,advancedVariety:true,advancedMotif:theme});
      });
    }))
);
