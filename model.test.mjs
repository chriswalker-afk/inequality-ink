import test from "node:test";
import assert from "node:assert/strict";
import {
  WIDTH, HEIGHT, COLUMN_MIN, COLUMN_MAX, AXIS_MIN, AXIS_MAX,
  ROWS, SEQUENCE, LEVELS, LEVEL_IDS, TUTORIAL, TUTORIAL_MIRROR, tutorialFor,
  CAT_HALF_WIDTH, CAT_HALF_ROWS, CAT_SEQUENCE, catHalfColumns, catHalfPixelAt,
  catPixelAt, catColourAt, reflectColumn, paintedColumns,
  columnsFor, isInInterval, identicalSolution, makeQuestion,
  pixelAt, colourAt, validatePuzzle, formatLinear
} from "./model.mjs";

test("both master sprites are continuous; the cat starts as an eight-column half",()=>{
  const result=validatePuzzle();
  assert.equal(result.connected,true);
  assert.equal(result.symmetric,true);
  assert.equal(result.catConnected,true);
  assert.equal(CAT_HALF_WIDTH,8);
  assert.equal(WIDTH,16);
  assert.equal(HEIGHT,16);
  assert.equal(ROWS.length,14);
  assert.equal(CAT_HALF_ROWS.length,14);
  assert.equal(CAT_SEQUENCE[0].y,14);
  assert.equal(CAT_SEQUENCE.at(-1).y,1);
  assert.equal(SEQUENCE[0].y,14);
});

test("Cat Cameo matches the designed inner- and outer-block half-sprite",()=>{
  const bounds=[
    [6,7],[5,7],[4,7],[0,7],[0,7],[0,6],[0,6],
    [0,5],[0,5],[0,4],[0,4],[0,3],[0,2],[0,1]
  ];
  for(let i=0;i<14;i++){
    const row=CAT_HALF_ROWS[i], [from,to]=bounds[i];
    assert.deepEqual([row.from,row.to],[from,to]);
    assert.deepEqual(Array.from({length:8},(_,x)=>x).filter(x=>catHalfPixelAt(x,row.y)),
      Array.from({length:to-from+1},(_,n)=>from+n));
    assert.equal(row.from===0||row.to===7,true,
      "Each cat row must be describable by one ray cropped at the canvas edge");
  }
});
test("every true one-sided solution is clipped to the eight-column canvas, not bounded mathematically",()=>{
  const upper={direction:"right",at:3,included:false}; // x > 3
  assert.deepEqual(catHalfColumns(upper),[4,5,6,7]);
  assert.equal(isInInterval(10000,upper),true,"The ray still extends without bound");
  const lower={direction:"left",at:4,included:true};  // x <= 4
  assert.deepEqual(catHalfColumns(lower),[0,1,2,3,4]);
  assert.equal(isInInterval(-10000,lower),true,"The left-pointing ray remains infinite");
  const strictAlt={direction:"left",at:5,included:false};
  assert.deepEqual(catHalfColumns(strictAlt),catHalfColumns(lower));
  assert.equal(identicalSolution(strictAlt,lower),false);
  assert.equal(identicalSolution(upper,{direction:"right",at:4,included:true}),false);
});
test("Cat Cameo has the specified x > 3 ear question",()=>{
  const question=makeQuestion(11,0,"mirror");
  assert.equal(question.row,3);
  assert.equal(question.mode,"draw");
  assert.equal(question.equation,"x > 3");
  assert.equal(question.artMode,"mirror-half");
  assert.deepEqual(paintedColumns(question),[4,5,6,7]);
});
test("all four difficulties have mathematically exact questions over 40 replay variants",()=>{
  assert.deepEqual([...LEVEL_IDS].sort(),["full","mirror","mixed","solve"]);
  const seenMirror={read:0,draw:0,left:0,right:0,open:0,closed:0};
  for(const level of LEVEL_IDS){
    assert.ok(LEVELS[level].name);
    const modes=new Set();
    for(let i=0;i<14;i++)for(let replay=0;replay<40;replay++){
      const question=makeQuestion(i,replay,level);
      const target=level==="mirror"
        ? Array.from({length:8},(_,x)=>x).filter(x=>catHalfPixelAt(x,question.row))
        : columnsFor(ROWS.find(r=>r.y===question.row));
      assert.deepEqual(paintedColumns(question),target,
        level+" question "+i+" replay "+replay);
      modes.add(question.mode);
      if(question.mode==="read"){
        assert.equal(question.options.length,4);
        assert.equal(question.options.filter(o=>identicalSolution(o.value,question.answer)).length,1);
      }else assert.ok(question.equation.length);
      if(level==="mirror"){
        assert.equal(question.artMode,"mirror-half");
        assert.equal(question.mirrorSide,"right");
        assert.notEqual(question.answer.direction,"between");
        seenMirror[question.mode]++;
        seenMirror[question.answer.direction]++;
        seenMirror[question.answer.included?"closed":"open"]++;
      }
      const endpoints=question.answer.direction==="between"
        ? [question.answer.lower,question.answer.upper]:[question.answer.at];
      for(const endpoint of endpoints)assert.ok(endpoint>=AXIS_MIN&&endpoint<=AXIS_MAX);
    }
    if(level==="solve")assert.deepEqual([...modes],["solve"]);
    if(level==="mirror"||level==="full")assert.deepEqual([...modes].sort(),["draw","read"]);
    if(level==="mixed")assert.deepEqual([...modes].sort(),["draw","read","solve"]);
  }
  assert.ok(Object.values(seenMirror).every(n=>n>0));
});
test("the final cat is a completely connected reflection, with symmetrical colouring",()=>{
  const cells=new Set();
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
    assert.equal(catPixelAt(x,y),catPixelAt(WIDTH-1-x,y));
    assert.equal(catColourAt(x,y),catColourAt(WIDTH-1-x,y));
    if(catPixelAt(x,y))cells.add(x+","+y);
    else assert.equal(catColourAt(x,y),null);
  }
  const reached=new Set(),stack=[cells.values().next().value];
  while(stack.length){
    const key=stack.pop();if(reached.has(key))continue;
    reached.add(key);
    const [x,y]=key.split(",").map(Number);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const next=(x+dx)+","+(y+dy);
      if(cells.has(next)&&!reached.has(next))stack.push(next);
    }
  }
  assert.equal(reached.size,cells.size);
  assert.ok(cells.size>130);
});
test("original mushroom remains unchanged in other modes",()=>{
  assert.equal(COLUMN_MIN,-8);assert.equal(COLUMN_MAX,7);
  for(const row of ROWS){
    const xs=columnsFor(row);
    assert.ok(xs.length>0);
    for(let j=1;j<xs.length;j++)assert.equal(xs[j],xs[j-1]+1);
    assert.deepEqual(xs.map(reflectColumn).sort((a,b)=>a-b),xs);
  }
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
    assert.equal(pixelAt(x,y),pixelAt(WIDTH-1-x,y));
    assert.equal(colourAt(x,y),colourAt(WIDTH-1-x,y));
  }
});
test("practice questions teach x ≤ 4 and x > 3 as real one-sided inequalities",()=>{
  assert.equal(tutorialFor("mirror"),TUTORIAL_MIRROR);
  assert.equal(tutorialFor("full"),TUTORIAL);
  assert.deepEqual(catHalfColumns(TUTORIAL_MIRROR[0].answer),[0,1,2,3,4]);
  assert.deepEqual(catHalfColumns(TUTORIAL_MIRROR[1].answer),[4,5,6,7]);
  assert.equal(isInInterval(-150,TUTORIAL_MIRROR[0].answer),true);
  assert.equal(isInInterval(150,TUTORIAL_MIRROR[1].answer),true);
});
test("negative coefficients still reverse both inequality signs",()=>{
  const i={direction:"between",lower:-3,upper:2,lowerIncluded:false,upperIncluded:false};
  assert.equal(formatLinear(i,-2,1),"−3 < 1 − 2x < 7");
});
