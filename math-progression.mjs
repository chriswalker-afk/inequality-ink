// Mathematical progression independent of pixel-art geometry.
// Stages 1–4 gradually introduce endpoint and algebra skills; Stage 5 and
// bonus pictures preserve the pre-existing first-run and replay questions.
export const MATH_PROFILE_NAMES=Object.freeze([
  "Starter","Step Up","Building","Challenge","Big Finish"
]);
export function mathematicalStage(picture,level){
  // Progression describes the five visible core stages. An earlier core
  // picture may now appear under More pictures; preserve its original maths
  // rather than silently changing its strict endpoints or algebra.
  const step=picture.progression?.[level]??picture.legacyMathStage?.[level];
  return Number.isInteger(step)&&step>=1&&step<=5?step:5;
}

// Desired [leftOpen,rightOpen] pairs, from the first painted row upwards.
// The image generator still forces an inclusive end if the art touches an edge.
const BOUNDED_PATTERNS=Object.freeze({
  1:[[false,false],[false,false],[false,false],
    [false,false],[true,false],[false,true]],
  2:[[false,false],[false,false],[true,false],[false,true],
    [true,false],[false,true],[true,true],[false,false]],
  3:[[false,false],[true,false],[false,true],[true,true],
    [false,false],[false,true],[true,false],[true,true],
    [false,false],[true,false]],
  4:[[false,false],[true,false],[false,true],[true,true],
    [true,false],[true,true],[false,false],[false,true],
    [true,true],[false,false],[true,false],[true,true]]
});
export function boundedEndpointPreferences(stage,index,replay){
  if(stage===5)return {
    left:(index+replay)%2===0,
    right:(index+replay)%3===0
  };
  const patterns=BOUNDED_PATTERNS[stage];
  if(!patterns)throw Error("Unknown mathematical stage");
  const [left,right]=patterns[index%patterns.length];
  // Replay swaps the open end but never introduces a harder endpoint pattern.
  if(replay%2!==0&&left!==right)return {left:right,right:left};
  return {left,right};
}
export function oneSidedOpenPreference(stage,index,replay,original){
  if(stage===5)return original;
  if(stage===1)return index>=4&&(index+replay)%2===0;
  if(stage===2)return index>=2&&(index+replay)%3!==0;
  if(stage===3)return index>=1&&(index+replay)%2===0;
  if(stage===4)return (index+replay)%4!==1;
  throw Error("Unknown mathematical stage");
}

// Each row has a fixed type of rearrangement. Replays vary the constant
// without changing whether multiplication or a sign reversal is involved.
// The Starter finishes with one simple sign reversal, -x.
const LINEAR_PATTERNS=Object.freeze({
  1:[
    [[1,1],[1,2]],[[1,-1],[1,1]],[[2,0]],
    [[1,-2],[1,2]],[[2,1],[2,-1]],[[-1,0]]
  ],
  2:[
    [[1,2],[1,-2]],[[2,0]],[[1,-3],[1,3]],
    [[2,1],[2,-1]],[[1,4],[1,-4]],[[2,-2],[2,2]],
    [[-1,1],[-1,-1]],[[-2,0]]
  ],
  3:[
    [[1,3],[1,-3]],[[2,0]],[[2,1],[2,-1]],
    [[-1,1],[-1,-1]],[[3,0]],[[2,3],[2,-3]],
    [[-2,1],[-2,-1]],[[1,4],[1,-4]],
    [[3,1],[3,-1]],[[-2,3],[-2,-3]]
  ],
  4:[
    [[2,0]],[[1,-4],[1,4]],[[2,3],[2,-3]],
    [[-1,2],[-1,-2]],[[3,0]],[[2,-4],[2,4]],
    [[-2,1],[-2,-1]],[[3,2],[3,-2]],
    [[-3,0]],[[2,-3],[2,3]],
    [[-2,3],[-2,-3]],[[-3,2],[-3,-2]]
  ]
});
const ORIGINAL_TRANSFORMS=[[2,1],[2,-3],[-2,1],[3,2],
  [-3,-2],[1,4],[-1,1]];
export function solveTransformation(stage,index,replay,preferred=null){
  if(stage===5){
    if(preferred&&replay===0)return {a:preferred.a,b:preferred.b};
    const [a,b]=ORIGINAL_TRANSFORMS[(replay+index)%ORIGINAL_TRANSFORMS.length];
    return {a,b};
  }
  const plan=LINEAR_PATTERNS[stage];
  if(!plan)throw Error("Unknown mathematical stage");
  const choices=plan[index%plan.length];
  const [a,b]=choices[replay%choices.length];
  return {a,b};
}

// Painting still requires exactly the original integer-labelled squares;
// varying a strict/inclusive endpoint never changes the pixel target.
// 'upper' refers to a bounded colour run's upper bound.
export function paintStrictPreference(stage,index,replay,runIndex,endpoint){
  const parity=(index+replay+runIndex)%2===0;
  if(stage===5)return endpoint==="upper"?
    (index+runIndex+replay)%3===0:parity;
  if(stage===1){
    if(endpoint==="upper")return index>=5&&!parity;
    return index>=3&&parity;
  }
  if(stage===2){
    if(endpoint==="upper")return index>=4&&(index+replay+runIndex)%3===0;
    return index>=1&&parity;
  }
  if(stage===3){
    if(endpoint==="upper")return index>=2&&(index+replay+runIndex)%3!==0;
    return index>=1&&parity;
  }
  if(stage===4){
    if(endpoint==="upper")return (index+replay+runIndex)%3!==1;
    return parity;
  }
  throw Error("Unknown mathematical stage");
}
