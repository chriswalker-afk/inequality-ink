import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {renderPieceMarkers,renderSummaryMetrics} from "./regions/studio-ui.mjs";

class FakeElement{
  constructor(tag){this.tagName=tag;this.children=[];this.className="";this.textContent="";}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=[];this.append(...nodes);}
}
const fakeDoc={createElement:tag=>new FakeElement(tag)};
test("All graph modes use the same segmented progress component",()=>{
  const host=new FakeElement("div");
  renderPieceMarkers(host,fakeDoc,5,2);
  assert.equal(host.children.length,5);
  assert.deepEqual(host.children.map(p=>p.className),
    ["is-done","is-done","is-current","",""]);
  renderPieceMarkers(host,fakeDoc,9,9);
  assert.equal(host.children.length,9);
  assert.ok(host.children.every(p=>p.className==="is-done"));
  assert.throws(()=>renderPieceMarkers(host,fakeDoc,0,0),/Invalid piece count/);
  assert.throws(()=>renderPieceMarkers(host,fakeDoc,3,4),/Invalid completed/);
});
test("Completed artworks have readable, independent statistic cards",()=>{
  const host=new FakeElement("div");
  renderSummaryMetrics(host,fakeDoc,[
    {value:3,label:"Picture pieces"},
    {value:8,label:"Inequalities"},
    {value:"1 / 5",label:"Stage complete"}
  ]);
  assert.equal(host.children.length,3);
  assert.deepEqual(host.children.map(node=>node.children[0].textContent),
    ["3","8","1 / 5"]);
  assert.deepEqual(host.children.map(node=>node.children[1].textContent),
    ["Picture pieces","Inequalities","Stage complete"]);
});
test("Both art styles load shared presentation, preserving original game tools",()=>{
  const root=readFileSync(new URL("./index.html",import.meta.url),"utf8");
  const shared=readFileSync(new URL("./studio-design.css",import.meta.url),"utf8");
  assert.match(root,/studio-design\.css/);
  assert.match(root,/id="drawLine"/);
  assert.match(root,/id="questLine"/);
  assert.match(root,/id="leftOpen"/);
  assert.match(root,/id="leftClosed"/);
  assert.match(root,/numberline-gesture-tip/);
  assert.match(shared,/draw-line-holder svg \[data-endpoint\]/);
  assert.match(shared,/touch-action:none/);
  for(const [file,mode] of [
    ["regions/index.html","graph"],
    ["regions/curve.html","curve"],
    ["regions/plot.html","plot"]
  ]){
    const html=readFileSync(new URL(file,import.meta.url),"utf8");
    assert.match(html,/studio-design\.css/,file);
    for(const id of [
      mode+"PieceMarkers",mode+"SummaryArt",mode+"SummaryMetrics",mode+"SavePicture"
    ])assert.ok(html.includes('id="'+id+'"'),file+" missing "+id);
    assert.match(html,/class="graph-progress-track"/,file);
    assert.match(html,/class="graph-feedback"/,file);
    assert.match(html,/class="graph-summary-buttons"/,file);
  }
  const plot=readFileSync(new URL("./regions/plot.html",import.meta.url),"utf8");
  for(const id of ["plotGraph","plotNudgeControls","plotDockCheck","plotDockUndo"])
    assert.ok(plot.includes('id="'+id+'"'),id+" must survive design alignment");
});
test("Tap-to-toggle, drag-to-move and keyboard circle interactions remain implemented",()=>{
  const app=readFileSync(new URL("./app.mjs",import.meta.url),"utf8");
  assert.match(app,/const CIRCLE_DRAG_THRESHOLD=9/);
  assert.match(app,/function toggleEndpoint\(side/);
  assert.match(app,/drag=\{pointerId:event\.pointerId,side/);
  assert.match(app,/g\.addEventListener\("pointerdown"/);
  assert.match(app,/\$\("drawLine"\)\.addEventListener\("pointerup"/);
  assert.match(app,/toggleEndpoint\(gesture\.side\)/);
  assert.match(app,/toggleEndpoint\(side,\{restoreFocus:true\}\)/);
  // app-smoke.test.mjs also runs the actual touch, mouse, drag, and Enter actions.
  const gestures=readFileSync(new URL("./app-smoke.test.mjs",import.meta.url),"utf8");
  assert.match(gestures,/quick mobile tap toggle open\/closed/);
  assert.match(gestures,/Dragging a circle still moves the endpoint/);
});
