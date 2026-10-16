// Step Up gallery: seven individually composed, three-piece artworks.
// Coloured regions are genuine convex intersections of the displayed
// inequalities, not image masks. Every point lies on a quarter-unit grid.
// The original five-stage gallery and all older saved picture IDs stay intact.
const gcd=(x,y)=>{
  let a=Math.abs(x),b=Math.abs(y);
  while(b){const t=a%b;a=b;b=t;}return a||1;
};
const rational=(n,d=1)=>{
  if(d<0){n=-n;d=-d;}
  const f=gcd(n,d);n/=f;d/=f;
  if(n===0)return "0";
  const minus=n<0?"−":"",a=Math.abs(n);
  const special={"1/2":"½","1/3":"⅓","2/3":"⅔","1/4":"¼","3/4":"¾"};
  return minus+(d===1?String(a):special[a+"/"+d]||(a+"/"+d));
};
function textFor(a,b,c,included){
  if(!b){
    const less=a>0;
    return "x "+(less?(included?"≤":"<"):(included?"≥":">"))+
      " "+rational(c,a);
  }
  if(!a){
    const less=b>0;
    return "y "+(less?(included?"≤":"<"):(included?"≥":">"))+
      " "+rational(c,b);
  }
  const less=b>0,m=-a/b,k=c/b;
  const slope=Math.abs(m)===1?(m<0?"−":"")+"x":
    rational(-a,b)+"x";
  const intercept=Math.abs(k)<1e-9?"":k<0?
    " − "+rational(Math.abs(c),Math.abs(b)):
    " + "+rational(Math.abs(c),Math.abs(b));
  return "y "+(less?(included?"≤":"<"):(included?"≥":">"))+
    " "+slope+intercept;
}
function poly(id,name,color,input,{strict=[]}={}){
  if(input.length<3)throw Error("Polygon needs three vertices: "+id);
  let verts=input.map(([x,y])=>[x,y]);
  let signed=0;
  for(let i=0;i<verts.length;i++){
    const [x,y]=verts[i],[nx,ny]=verts[(i+1)%verts.length];
    signed+=x*ny-nx*y;
  }
  if(Math.abs(signed)<1e-8)throw Error("Flat polygon "+id);
  if(signed<0)verts.reverse();
  const edges=verts.map(([x,y],i)=>{
    const [nx,ny]=verts[(i+1)%verts.length];
    const dx=Math.round(4*(nx-x)),dy=Math.round(4*(ny-y));
    if(Math.abs(dx/4-(nx-x))>1e-8||Math.abs(dy/4-(ny-y))>1e-8)
      throw Error("Quarter-grid coordinates required: "+id);
    let a=4*dy,b=-4*dx,c=4*(dy*x-dx*y);
    if(!Number.isInteger(c))throw Error("Edge constant must be integer: "+id);
    const g=gcd(gcd(a,b),c);
    a/=g;b/=g;c/=g;
    const inclusive=!strict.includes(i);
    return Object.freeze({id:id+"-edge-"+(i+1),a,b,c,inclusive,
      form:a===0||b===0?"axis":"slope",
      text:textFor(a,b,c,inclusive)});
  });
  return Object.freeze({id,name,color,rules:Object.freeze(edges),
    vertices:Object.freeze(verts.map(([x,y])=>Object.freeze({x,y})))});
}
const rect=(x1,y1,x2,y2)=>[
  [x1,y1],[x2,y1],[x2,y2],[x1,y2]
];
const diamond=(x,y,rx,ry)=>[[x,y+ry],[x-rx,y],[x,y-ry],[x+rx,y]];
const D=(type,stage,data)=>Object.freeze({type,stage,...data});
const L=(stage,x1,y1,x2,y2,color="#45677a",width=.085)=>
  D("line",stage,{x1,y1,x2,y2,color,width});
const E=(stage,x,y,rx,ry,color="#f6deb9",outline=null)=>
  D("ellipse",stage,{x,y,rx,ry,color,outline});
const C=(stage,x,y,r,color="#45677a")=>D("circle",stage,{x,y,r,color});
const R=(stage,x,y,w,h,color="#f1e6ce")=>D("rect",stage,{x,y,w,h,color});
const S=(stage,x,y,r,color="#be8f55")=>D("star",stage,{x,y,r,color});
function make(mode,id,name,clue,description,focus,pieces,detail){
  if(pieces.length!==3)throw Error("Step Up requires three pieces: "+id);
  return Object.freeze({
    mode,id,name,clue,description,focus,stage:"Step Up",step:2,
    practice:true,stepUpVariety:true,
    pieces:Object.freeze(pieces),
    details:Object.freeze(detail.map((d,i)=>Object.freeze({
      id:id+"-detail-"+(i+1),...d
    })))
  });
}
export const LINEAR_STEP_UPS=Object.freeze([
  make("fill","step-bubble-fish","Bubble Fish","Under the Sea",
    "Build a friendly geometric fish from a sparkling body, pointed tail and little fin.",
    "Sloping straight lines · compare simple x/y inequalities · three regions",[
      poly("fish-body","Ocean-blue body","#7dbfc6",
        diamond(-.75,0,2.5,2)),
      poly("fish-tail","A coral tail","#e9a0a2",
        [[1,0],[4,2],[4,-2]]),
      poly("fish-fin","A golden fin","#f2c57e",
        [[-1.25,1.50],[-.5,3.25],[.75,1.25]])
    ],[
      C(0,-1.9,.58,.17,"#34566a"),
      E(0,-2.1,0,.32,.20,"#a7dce0"),
      L(0,-.9,.55,.95,.15,"#d6f0e6",.08),
      E(0,2.75,.3,.5,.15,"#ffd2c5"),
      L(1,1.25,-.1,3.65,1.3,"#d27e8d",.08),
      L(1,1.25,-.1,3.65,-1.3,"#d27e8d",.08),
      C(1,-3.7,2.5,.18,"#629cab"),
      C(1,-3.1,3.35,.12,"#629cab"),
      C(1,-4.1,3.4,.24,"#629cab"),
      S(2,-3.8,-3.4,.21),S(2,3.85,3.45,.22),
      C(2,3.1,-3.3,.10,"#af91ad")
    ]),
  make("fill","step-potted-sunflower","Potted Sunflower","Something is Growing",
    "A flower pot, green stalk and geometric sunflower reveal a small garden scene.",
    "Rising and falling slopes · simple bounded regions · three pieces",[
      poly("sunflower-pot","The terracotta pot","#d88e7b",
        [[-2,-1.25],[2,-1.25],[1.50,-3.50],[-1.50,-3.50]]),
      poly("sunflower-stem","The leafy stalk","#86bb91",
        rect(-.50,-1.25,.50,2)),
      poly("sunflower-head","The golden flower","#f0c875",
        diamond(0,2.5,1.25,1.25))
    ],[
      C(0,0,2.6,.40,"#936c57"),
      C(0,-.17,2.75,.075,"#fff0c1"),
      C(0,.17,2.75,.075,"#fff0c1"),
      E(0,-.55,-2.25,.32,.11,"#edb79e"),
      L(1,-.2,-.55,-1.55,.20,"#4a947b",.16),
      L(1,.1,.55,1.6,.85,"#4a947b",.16),
      E(1,-1.4,.15,.56,.24,"#8ac2a0"),
      E(1,1.30,.75,.49,.25,"#8ac2a0"),
      L(1,-1.6,-1.25,1.6,-1.25,"#945d63",.11),
      S(2,-3.3,3.8,.28),S(2,3.25,3.45,.24),
      C(2,3.6,-2.9,.10,"#c7868a")
    ]),
  make("fill","step-beacon-lighthouse","Tiny Lighthouse","A Light on the Coast",
    "A tall sloping lighthouse, luminous lantern room and pointed roof shine at sea.",
    "Use two gentle gradients and clear vertical and horizontal restrictions",[
      poly("light-tower","The lighthouse tower","#b1bfcb",
        [[-1.50,-3.50],[1.50,-3.50],[.75,1.50],[-.75,1.50]]),
      poly("light-room","The glowing window","#f3d48a",
        rect(-1,1.50,1,2.75)),
      poly("light-roof","The pointed roof","#d98e91",
        [[-1.25,2.75],[1.25,2.75],[0,4.00]])
    ],[
      R(0,-.42,-2.65,.84,1.15,"#607b90"),
      R(0,-.35,.05,.70,.75,"#dbeff0"),
      L(0,-1.0,-2.7,1.0,-2.7,"#56758b",.12),
      L(1,-.65,1.7,-.65,2.65,"#ad8e69",.07),
      L(1,.65,1.7,.65,2.65,"#ad8e69",.07),
      E(1,0,2.20,.35,.43,"#fff0bd"),
      L(1,-2.75,2.30,-1.45,2.12,"#e6bb82",.15),
      L(1,1.45,2.12,2.75,2.30,"#e6bb82",.15),
      L(2,-3.8,-3.6,3.8,-3.6,"#4c91a1",.12),
      S(2,3.60,3.9,.20),S(2,-3.85,3.45,.19),
      C(2,-3.2,-2.0,.13,"#689cad")
    ]),
  make("build","step-happy-penguin","Happy Penguin","A Chilly Visitor",
    "Assemble a dark geometric body, pale belly and triangular orange beak.",
    "Rising and falling half-planes · a strict boundary · three regions",[
      poly("penguin-body","The penguin","#526f87",
        diamond(0,-.25,2.25,3)),
      poly("penguin-belly","The snowy belly","#e5e9dd",
        diamond(0,-.75,1.25,1.75),{strict:[1]}),
      poly("penguin-beak","The orange beak","#f2bd73",
        [[-.50,1.25],[.50,1.25],[0,.50]])
    ],[
      C(0,-.73,1.85,.18,"#eaf2eb"),C(0,.73,1.85,.18,"#eaf2eb"),
      C(0,-.72,1.85,.09,"#344b61"),C(0,.72,1.85,.09,"#344b61"),
      E(0,-.95,-.10,.32,.15,"#e6a7ae"),
      E(0,.95,-.10,.32,.15,"#e6a7ae"),
      L(1,-1.30,-2.30,-2.35,-2.85,"#edb36f",.20),
      L(1,1.30,-2.30,2.35,-2.85,"#edb36f",.20),
      L(1,-2.15,.25,-3.1,-1.10,"#607f92",.24),
      L(1,2.15,.25,3.1,-1.10,"#607f92",.24),
      S(2,-3.8,3.35,.23),S(2,3.80,3.4,.21),
      C(2,3.55,-2.15,.10,"#a0b6ca")
    ]),
  make("build","step-mountain-cabin","Mountain Cabin","Home Among the Hills",
    "Shape a cosy house using a triangular roof, square walls and a little door.",
    "Interpret diagonal boundaries with one dashed edge among solid lines",[
      poly("cabin-walls","Golden cabin","#e5bf8d",
        rect(-2.75,-3.25,2.75,.75)),
      poly("cabin-roof","The red roof","#cf8a8b",
        [[-3.50,.75],[3.50,.75],[0,3.75]],{strict:[1]}),
      poly("cabin-door","The wooden door","#8d7190",
        rect(-.75,-3.25,.75,-.75))
    ],[
      R(0,-2.0,-1.1,.85,.8,"#b8d9d8"),
      R(0,1.15,-1.1,.85,.8,"#b8d9d8"),
      L(0,-1.57,-1.12,-1.57,-.3,"#517981",.08),
      L(0,1.58,-1.12,1.58,-.3,"#517981",.08),
      C(1,.38,-2.05,.14,"#f1d197"),
      L(1,1.9,2.7,1.9,3.7,"#84727f",.17),
      E(1,2.05,3.9,.40,.15,"#a8bac3"),
      E(1,2.45,4.2,.46,.17,"#a8bac3"),
      L(1,-3.7,-3.35,3.7,-3.35,"#589085",.11),
      S(2,-4.05,3.70,.19),S(2,4.05,2.95,.24),
      C(2,3.7,-2.75,.10,"#6d9e86")
    ]),
  make("build","step-balloon-adventure","Hot Air Balloon","Up, Up, Away",
    "Combine a faceted balloon, its hanging rigging and a little passenger basket.",
    "Three connected regions · diagonals · open and closed boundaries",[
      poly("balloon-envelope","The balloon","#d998aa",
        diamond(0,1.75,2.25,2.25),{strict:[2]}),
      poly("balloon-harness","The hanging ropes","#85b9c4",
        [[-1.00,-.50],[1.00,-.50],[.50,-2.50],[-.50,-2.50]]),
      poly("balloon-basket","The basket","#deb882",
        rect(-1.00,-3.50,1.00,-2.25))
    ],[
      L(0,0,3.9,0,-.25,"#f6d8c9",.09),
      L(0,-1.85,1.65,1.85,1.65,"#f5c2c7",.08),
      E(0,-.85,2.40,.23,.41,"#ffd8d3"),
      E(0,.82,2.25,.23,.41,"#ffd8d3"),
      L(1,-.70,-.4,-.66,-2.45,"#507b8a",.11),
      L(1,.70,-.4,.66,-2.45,"#507b8a",.11),
      L(1,-1.05,-2.15,1.05,-2.15,"#876979",.09),
      L(1,-1.05,-2.75,1.05,-2.75,"#bc8e67",.10),
      E(2,-3.05,3.25,.62,.20,"#d1e5e8"),
      E(2,3.15,2.95,.77,.22,"#d1e5e8"),
      S(2,-3.9,-2.30,.22),S(2,3.85,3.9,.23)
    ]),
  make("build","step-desert-cactus","Desert Cactus","Spiky Sunshine",
    "Grow a cactus with two upward arms from simple intersecting straight lines.",
    "Rising slopes and mixed solid/dashed boundaries; compare gradient signs",[
      poly("cactus-trunk","Tall green trunk","#6aa98c",
        rect(-.75,-3.5,.75,3)),
      poly("cactus-left-arm","The left arm","#80bda0",
        [[-.25,-1.00],[-2.75,-.25],[-2.50,1.50],[-1.75,1.50]],
        {strict:[1]}),
      poly("cactus-right-arm","The right arm","#80bda0",
        [[.25,-1.00],[2.75,-.25],[2.50,1.50],[1.75,1.50]])
    ],[
      L(0,-.32,-2.7,-.3,2.35,"#b3d9b4",.065),
      L(0,.32,-2.7,.3,2.35,"#b3d9b4",.065),
      L(0,-2.45,.8,-1.85,.85,"#b3d9b4",.075),
      L(0,2.45,.8,1.85,.85,"#b3d9b4",.075),
      C(1,-.28,1.75,.10,"#375a56"),
      C(1,.28,1.75,.10,"#375a56"),
      E(1,0,1.35,.36,.12,"#cd847f"),
      S(1,0,3.05,.29,"#e7ad94"),
      S(1,-2.55,1.62,.20,"#e7ad94"),
      L(2,-3.65,-3.6,3.65,-3.6,"#caaf83",.15),
      S(2,3.9,3.8,.20),S(2,-3.85,3.15,.22)
    ])
]);
