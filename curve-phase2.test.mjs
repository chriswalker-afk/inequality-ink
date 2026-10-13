import test from "node:test";
import assert from "node:assert/strict";
import {
  PICTURE,WORLD,functionValue,satisfies,satisfiesAll,curvedCellAt,
  rangeIntervalsAtX,regionPaths,boundaryPoints,absolute,circleRule,parabola
} from "./regions/curved-engine.mjs";
import {
  CURVE_STAGES,CURVE_PICTURES,curvePicture,validateCurveGallery
} from "./regions/curve-pictures.mjs";

test("five UNIQUE picture paths increase from two to seven real pieces",()=>{
  assert.equal(validateCurveGallery(),true);
  assert.deepEqual(CURVE_PICTURES.map(p=>p.pieces.length),[2,3,4,5,7]);
  assert.deepEqual(CURVE_STAGES.map(x=>x.name),
    ["Starter","Step Up","Building","Challenge","Big Finish"]);
  assert.equal(new Set(CURVE_PICTURES.map(p=>p.id)).size,5);
  assert.equal(CURVE_PICTURES[0].pieces[0].rules[0].text,"y ≥ x² − 4");
  assert.equal(curvePicture("parabola-butterfly").details,PICTURE.details);
  assert.equal(curvePicture("unknown"),null);
});

test("parabolic translations, absolute graphs and circle rules are evaluated accurately",()=>{
  const p=parabola("test-parabola","y ≥ (x − 2)² + 1",1,2,1,"above");
  assert.equal(functionValue(p,2),1);
  assert.equal(functionValue(p,4),5);
  assert.equal(satisfies(p,2,1),true);
  assert.equal(satisfies(p,2,0),false);
  const v=absolute("test-abs","y ≤ 2 − |x − 1|",1,2,-1,"below");
  assert.equal(functionValue(v,1),2);
  assert.equal(functionValue(v,3),0);
  assert.equal(satisfies(v,3,-.1),true);
  assert.equal(satisfies(v,3,.1),false);
  const c=circleRule("test-circle","(x − 1)² + (y + 2)² ≤ 4",1,-2,2);
  assert.equal(satisfies(c,1,-2),true);
  assert.equal(satisfies(c,3,-2),true);
  assert.equal(satisfies(c,3.05,-2),false);
  assert.ok(boundaryPoints(c)[0].length>350);
});
test("the complement of a circle preserves the hole when a wrong region flashes",()=>{
  const c=circleRule("disk","x² + y² ≤ 4",0,0,2);
  const outer={...c,side:"outside"};
  assert.equal(rangeIntervalsAtX([outer],0).length,2);
  assert.equal(rangeIntervalsAtX([c],0).length,1);
  assert.equal(rangeIntervalsAtX([c],3).length,0);
  assert.equal(rangeIntervalsAtX([outer],3).length,1);
  assert.ok(regionPaths([outer]).length>=3);
  const right=curvedCellAt([c],3,0);
  assert.equal(right.correct,false);
  assert.ok(right.paths.length>=3);
  assert.equal(curvedCellAt([c],2,0),null);
  assert.equal(curvedCellAt([c],0,0).correct,true);
  assert.deepEqual(rangeIntervalsAtX([outer],11),[]);
});
test("each of the 21 picture pieces has a selectable mathematically correct cell",()=>{
  let count=0;
  for(const p of CURVE_PICTURES){
    for(const part of p.pieces){
      let found=null;
      for(let x=-4.5;x<=4.5&&!found;x+=.25)
        for(let y=-4.5;y<=4.5;y+=.25)
          if(satisfiesAll(part.rules,x,y)&&curvedCellAt(part.rules,x,y,.06)?.correct){
            found=[x,y];break;
          }
      assert.ok(found,p.id+": "+part.id+" has no tappable region");
      const [x,y]=found;
      assert.equal(satisfiesAll(part.rules,x,y),true);
      assert.ok(regionPaths(part.rules).length>0);
      count++;
    }
  }
  assert.equal(count,21);
});
test("the five modes feature strict boundaries, circles and absolute-value conditions",()=>{
  const all=p=>p.pieces.flatMap(part=>part.rules);
  assert.ok(all(CURVE_PICTURES[0]).some(r=>!r.inclusive));
  assert.ok(all(CURVE_PICTURES[1]).some(r=>r.kind==="circle"));
  assert.ok(all(CURVE_PICTURES[2]).some(r=>!r.inclusive));
  assert.ok(all(CURVE_PICTURES[3]).some(r=>r.kind==="absolute"));
  assert.ok(all(CURVE_PICTURES[3]).some(r=>r.kind==="circle"));
  assert.ok(all(CURVE_PICTURES[4]).some(r=>r.kind==="circle"));
  assert.ok(all(CURVE_PICTURES[4]).some(r=>!r.inclusive));
  assert.ok(all(CURVE_PICTURES[4]).some(r=>r.kind==="vertical"));
  assert.deepEqual(WORLD,{xmin:-5,xmax:5,ymin:-5,ymax:5});
});
test("reveal-stage decorations have unique IDs and contrast-safe outdoor elements",()=>{
  for(const p of CURVE_PICTURES){
    assert.equal(new Set(p.details.map(d=>d.id)).size,p.details.length);
    assert.ok(p.details.some(d=>d.stage===1));
    assert.ok(p.details.some(d=>d.stage===2));
    assert.ok(p.details.some(d=>d.stage===3));
    for(const d of p.details){
      assert.ok(d.fill||d.stroke);
      if(d.type==="star"){
        assert.ok(d.stroke);
        assert.notEqual(d.stroke.toLowerCase(),"#ffffff");
        assert.notEqual(d.fill.toLowerCase(),"#ffffff");
      }
    }
  }
});
