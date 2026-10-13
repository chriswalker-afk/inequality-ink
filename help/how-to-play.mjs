/* One mode-aware How to play guide for both Inequality Ink studios.
   Kept independent of game state: opening help never changes a saved answer. */
const numberLineMaths = [
  ["Open or closed?", "Use an <strong>open circle</strong> for &lt; or &gt;: the endpoint is excluded. Use a <strong>closed circle</strong> for ≤ or ≥: it is included."],
  ["Which way?", "Greater than means shade to the right; less than means shade to the left. A solution between two values shades the segment between them."]
];
const graphMaths = [
  ["One region, all the rules", "A point belongs to the coloured piece only when it satisfies <strong>every inequality</strong>. This shared solution is called the intersection."],
  ["Solid or dashed?", "Draw a <strong>solid</strong> boundary for ≤ or ≥, and a <strong>dashed</strong> one for &lt; or &gt;. The line itself belongs to the region only for solid boundaries."],
  ["When unsure, test a point", "Try a simple point away from the boundaries, often (0, 0). Substitute its coordinates into each inequality to decide whether it belongs in the region."]
];
const guides = {
  mirror: {
    title:"Mirror Mode", subtitle:"Make a picture from one-sided number-line inequalities.",
    steps:[
      ["Read the inequality", "Find the endpoint and decide whether the solution points left or right."],
      ["Make the number line", "Move the circle to the correct number. Choose an open or closed circle and the correct arrow."],
      ["Check and reveal", "Check your answer to paint another part of the mystery picture."]
    ],
    maths:numberLineMaths,
    controls:[
      ["Position the circle", "Drag the circle, tap a numbered tick, or use the +/− controls."],
      ["Change its style", "Tap the circle to switch between open and closed."],
      ["Check or get help", "Use Check & paint. The in-game Hint button offers up to three increasingly detailed clues."]
    ],
    example:"line"
  },
  full: {
    title:"Full Picture", subtitle:"Represent inequalities with two endpoints.",
    steps:[
      ["Read both bounds", "Work out the lower and upper values in the inequality."],
      ["Place the endpoints", "Set both circles and decide whether each boundary is included."],
      ["Shade and check", "Choose the interval or ray that satisfies the inequality and check to paint the picture."]
    ],
    maths:numberLineMaths.concat([["Two-sided inequalities", "For example, −1 &lt; x ≤ 3 means the values <strong>between</strong> −1 and 3, with an open circle at −1 and a closed circle at 3."]]),
    controls:[
      ["Move each endpoint", "Drag circles, tap numbered ticks, or use the number boxes and +/− controls."],
      ["Choose the solution", "Select the shading direction, then set each circle to open or closed."],
      ["Use staged hints", "Hint first asks you to check your approach; more help gradually gives the solution."]
    ],
    example:"interval"
  },
  solve: {
    title:"Solve & Paint", subtitle:"Solve an inequality, then represent its solution.",
    steps:[
      ["Solve the inequality", "Use inverse operations to isolate x. Check any changes to the inequality signs."],
      ["Draw the solution", "Put the endpoints on the number line, choose the correct circles and shade the solution."],
      ["Check your answer", "A correct answer fills another row of your picture."]
    ],
    maths:numberLineMaths.concat([["The negative-number trap", "When multiplying or dividing an inequality by a negative number, <strong>reverse the inequality sign</strong>. For two-sided inequalities, reverse both signs."]]),
    controls:[
      ["Use the working space", "Work through the algebra before changing the number-line controls."],
      ["Edit the number line", "Drag endpoints or use the number boxes; set the direction and open/closed circles."],
      ["Try graduated hints", "Press Hint for a strategy, then more guidance and finally the answer if needed."]
    ],
    example:"interval"
  },
  mixed: {
    title:"Mixed Challenge", subtitle:"Combine reading, drawing and solving number-line inequalities.",
    steps:[
      ["Identify the task", "Some questions ask you to read a number line, others to draw one, and others to solve algebra first."],
      ["Use the right skill", "Read the endpoints, draw the correct solution or rearrange the inequality before plotting."],
      ["Complete the picture", "Each correctly checked question reveals another part of your unique mixed-challenge picture."]
    ],
    maths:numberLineMaths.concat([["Solve before drawing", "If you are given algebra, simplify it first. Always reverse inequality signs when multiplying or dividing by a negative number."]]),
    controls:[
      ["Read questions", "Select the inequality that matches the displayed number line."],
      ["Draw questions", "Drag or nudge endpoints and set shading and circle types."],
      ["Solve questions", "Use the algebra and number-line controls together. Hints increase in detail when requested."]
    ],
    example:"interval"
  },
  paint: {
    title:"Paint by Inequalities", subtitle:"Use integer solutions to colour pixel-art squares.",
    steps:[
      ["Choose a colour rule", "Select an inequality in the palette. This activates the row you are painting."],
      ["Find its solutions", "Evaluate the integer labels and paint only the squares that satisfy that inequality."],
      ["Check the row", "Correct colours stay and the numbers disappear. Continue until the picture is complete."]
    ],
    maths:[
      ["Check the actual integer", "For x &gt; 2, paint squares labelled 3, 4, 5, and so on—not the square labelled 2."],
      ["Inclusive endpoints", "For x ≥ 2, include the square labelled 2 as well."],
      ["Every rule is separate", "You are colouring labelled squares, not drawing continuous number-line shading."]
    ],
    controls:[
      ["Select a rule", "Tap a colour beside its inequality; only the active row can be edited."],
      ["Paint quickly", "Tap or swipe across eligible squares. Use Erase or Clear row to correct mistakes."],
      ["Check and continue", "Press Check row. Selecting a colour does not automatically complete another rule."]
    ],
    example:"pixels"
  },
  quadratic: {
    title:"Quadratic Quest", subtitle:"Solve quadratic inequalities and reveal a bonus picture.",
    steps:[
      ["Find the roots", "Factorise, use the formula or another valid method to find where the quadratic equals zero."],
      ["Choose the sign region", "Decide whether the quadratic is positive or negative between the roots or outside them."],
      ["Mark and check", "Choose between/outside, position the roots and set open or closed circles before checking."]
    ],
    maths:[
      ["Above and below", "When the parabola opens upwards, it is negative between its roots and positive outside them."],
      ["Inclusive or strict?", "Use closed circles for ≤ or ≥ and open circles for &lt; or &gt;."],
      ["Example", "(x + 1)(x − 2) &lt; 0 gives −1 &lt; x &lt; 2: an open circle at each root and shading between."]
    ],
    controls:[
      ["Select the region", "Choose Between roots or Outside roots."],
      ["Adjust each root", "Drag the markers or use the numerical controls. Choose open or closed for each root."],
      ["Explore and get help", "Use Explore the parabola and the three-stage Hint button if you need support."]
    ],
    example:"interval"
  },
  find: {
    title:"Find & Fill", subtitle:"Find the shared region of straight-line inequalities.",
    steps:[
      ["Read every inequality", "Each piece is defined by several inequalities that must all be true together."],
      ["Find the overlap", "Look at the boundaries and decide which part of the graph satisfies them all."],
      ["Fill and check", "Tap that region, then select Check region. Each correct region becomes a picture piece."]
    ],
    maths:graphMaths,
    controls:[
      ["Fill a region", "Tap or click inside it, away from the boundary. Arrow keys move a keyboard cursor; Enter selects."],
      ["Try another region", "A wrong region flashes red and clears; a correct selection stays until you press Check."],
      ["Ask for a hint", "Use Give me a hint to receive a clue. You can try again without a penalty."]
    ],
    example:"overlap"
  },
  build: {
    title:"Build & Shade", subtitle:"Build up the shared region one boundary at a time.",
    steps:[
      ["Read the highlighted inequality", "Decide which side of the line satisfies it: above, below, left or right."],
      ["Choose its boundary", "Choose solid or dashed, then add the line to the graph."],
      ["Follow the overlap", "Watch the valid half-planes narrow to the intersection. Continue to the next piece."]
    ],
    maths:graphMaths.concat([["What the arrows mean", "An arrow points towards the half-plane where one inequality holds. Only the overlap of <strong>all</strong> valid sides is part of the picture."]]),
    controls:[
      ["Choose a side", "Select the correct side of the current inequality; options adapt to horizontal and vertical lines."],
      ["Choose solid or dashed", "Use the equality symbol to decide, then select Add this boundary."],
      ["Follow the animation", "When every line is added, review the highlighted shared region before choosing Next piece."]
    ],
    example:"overlap"
  },
  curve: {
    title:"Curve & Fill", subtitle:"Read curved inequalities and find their shared regions.",
    steps:[
      ["Read the curved boundaries", "Look for parabolas, circles and V-shaped graphs as well as straight lines."],
      ["Find the common region", "Test which side of each curve is allowed. The coloured piece satisfies every rule."],
      ["Fill and check", "Tap inside that curved region, then check to add it to the picture."]
    ],
    maths:graphMaths.concat([["Curves divide the plane too", "For y ≥ x², the valid region is <strong>on or above</strong> the parabola. For a circle inequality, check whether it means inside or outside the circle."]]),
    controls:[
      ["Select a region", "Tap away from curved boundaries to fill a region. Keyboard: arrow keys and Enter."],
      ["Check your choice", "Incorrect regions briefly flash red; correct ones remain while you press Check region."],
      ["Use a test point", "Give me a hint suggests a test point for you to check against the displayed inequalities."]
    ],
    example:"curve"
  },
  plot: {
    title:"Plot & Shade", subtitle:"Construct the boundaries yourself, then shade the picture.",
    steps:[
      ["Plot the graph", "Place two suitable points for the highlighted boundary. Drag or nudge them until your sketch is correct, then press Check sketch."],
      ["Choose solid or dashed", "Select the right boundary style from the inequality, then press Check boundary. Repeat for each missing graph."],
      ["Fill the common region", "When all required boundaries have been plotted, tap the area satisfying every inequality and press Check region."]
    ],
    maths:graphMaths.concat([
      ["Which two points?", "For a line, choose any two distinct points on it. For a parabola or V shape, place the vertex first. For a circle, place its centre and a point on its circumference."],
      ["A worked example", "For <strong>y &lt; 2x + 1</strong>, plot the line through (0, 1) and (1, 3), make it <strong>dashed</strong>, then shade below it. The diagram shows this single-inequality example."]
    ]),
    controls:[
      ["Plot points", "Tap the grid to add points; coordinates snap to 0.5. Drag a placed point or use the adjustment arrows to refine it."],
      ["Understand the labels", "PLOT means the current missing boundary; NEXT is upcoming; GIVEN is supplied; REUSED appeared in an earlier piece; BUILT is already verified."],
      ["Check each stage", "Use Check sketch, then Check boundary, then Check region. Undo and Edit sketch let you correct your work. Keyboard: arrow keys and Enter."]
    ],
    example:"plot"
  }
};
const lineExample = '<svg viewBox="0 0 320 108" role="img" aria-label="Number line representing x greater than 2, with an open circle at 2 and an arrow to the right"><path d="M25 51H294" stroke="#607b88" stroke-width="2"/><path d="M289 44l8 7-8 7" fill="none" stroke="#607b88" stroke-width="2"/><path d="M190 51H286" stroke="#469985" stroke-width="7" stroke-linecap="round"/><path d="M278 44l9 7-9 7" stroke="#469985" stroke-width="4" fill="none"/>'
  +[-2,-1,0,1,2,3,4].map((n,i)=>'<path d="M'+(50+i*35)+' 45v12" stroke="#637c87" stroke-width="1.5"/><text x="'+(50+i*35)+'" y="76" text-anchor="middle" font-size="12" fill="#526c79">'+n+'</text>').join('')
  +'<circle cx="190" cy="51" r="7" stroke="#308d79" stroke-width="3.5" fill="#fffdf8"/></svg>';
const intervalExample = '<svg viewBox="0 0 320 108" role="img" aria-label="Number line showing minus 1 less than x less than or equal to 3, with an open circle at minus 1 and a closed circle at 3"><path d="M25 51H294" stroke="#607b88" stroke-width="2"/><path d="M30 44l-8 7 8 7M289 44l8 7-8 7" fill="none" stroke="#607b88" stroke-width="2"/><path d="M85 51H225" stroke="#469985" stroke-width="7" stroke-linecap="round"/>'
  +[-2,-1,0,1,2,3,4].map((n,i)=>'<path d="M'+(50+i*35)+' 45v12" stroke="#637c87" stroke-width="1.5"/><text x="'+(50+i*35)+'" y="76" text-anchor="middle" font-size="12" fill="#526c79">'+n+'</text>').join('')
  +'<circle cx="85" cy="51" r="7" stroke="#308d79" stroke-width="3.5" fill="#fffdf8"/><circle cx="225" cy="51" r="7" fill="#308d79" stroke="#fff" stroke-width="1.3"/></svg>';
const grid = Array.from({length:7},(_,i)=>'<path d="M'+(40+i*40)+' 16V148M40 '+(16+i*22)+'H280" stroke="#e0eae4" stroke-width="1"/>').join('');
const plotExample = '<svg viewBox="0 0 320 170" role="img" aria-label="Example graph y less than 2x plus 1: the dashed line through zero comma one and one comma three, with the region below shaded"><rect x="40" y="16" width="240" height="132" rx="3" fill="#fffdf8"/>'
  +grid+'<path d="M80 148L200 16H280V148Z" fill="#b3e8d3" fill-opacity=".78"/><path d="M160 16V148M40 82H280" stroke="#678391" stroke-width="1.6"/><path d="M80 148L200 16" fill="none" stroke="#367e76" stroke-width="3" stroke-dasharray="7 5"/><circle cx="160" cy="60" r="4.4" fill="#2b806f"/><circle cx="200" cy="16" r="4.4" fill="#2b806f"/><text x="168" y="55" font-size="11" fill="#2e6770">(0, 1)</text><text x="208" y="28" font-size="11" fill="#2e6770">(1, 3)</text><text x="174" y="125" font-size="11" fill="#2d796d">y &lt; 2x + 1</text></svg>';
const overlapExample = '<svg viewBox="0 0 320 170" role="img" aria-label="The shared region right of the y-axis and below the line y equals 2, coloured green"><rect x="40" y="16" width="240" height="132" rx="3" fill="#fffdf8"/>'
  +grid+'<rect x="160" y="38" width="120" height="110" fill="#b3e8d3" fill-opacity=".85"/><path d="M160 16V148M40 82H280" stroke="#678391" stroke-width="1.8"/><path d="M40 38H280" stroke="#5087a2" stroke-width="3.5"/><path d="M160 16V148" stroke="#4b8a92" stroke-width="3.5"/><text x="188" y="104" font-size="12" fill="#286e5d">Both true</text><text x="44" y="30" font-size="11" fill="#456a7c">y ≤ 2</text><text x="169" y="159" font-size="11" fill="#456a7c">x ≥ 0</text></svg>';
const curveExample = '<svg viewBox="0 0 320 170" role="img" aria-label="The green curved region lies between a parabola and a horizontal boundary"><rect x="40" y="16" width="240" height="132" rx="3" fill="#fffdf8"/>'
  +grid+'<path d="M112 45H208Q160 198 112 45Z" fill="#b3e8d3" fill-opacity=".86"/><path d="M40 82H280M160 16V148" stroke="#678391" stroke-width="1.6"/><path d="M40 45H280" stroke="#4b8a92" stroke-width="3"/><path d="M92 16Q160 234 228 16" fill="none" stroke="#387d8a" stroke-width="3.5"/><text x="165" y="68" font-size="11" fill="#256c61">Shared curved</text><text x="178" y="82" font-size="11" fill="#256c61">region</text></svg>';
const pixelsExample = '<svg viewBox="0 0 320 108" role="img" aria-label="Squares labelled one to six; those labelled three to six are painted because x is greater than two">'
  +[1,2,3,4,5,6].map((n,i)=>'<rect x="'+(24+i*46)+'" y="28" width="39" height="40" rx="6" fill="'+(n>2?"#9ed6ba":"#f3f1e9")+'" stroke="#b7d2c9"/><text x="'+(43.5+i*46)+'" y="53" text-anchor="middle" font-size="15" font-weight="700" fill="#324d5c">'+n+'</text>').join('')
  +'<text x="24" y="20" font-size="12" fill="#456f71">x &gt; 2</text></svg>';
const examples = {
  line:["x > 2 · the endpoint is not included",lineExample],
  interval:["−1 < x ≤ 3 · only the right endpoint is included",intervalExample],
  pixels:["x > 2 · colour the integer squares 3, 4, 5, 6",pixelsExample],
  overlap:["x ≥ 0 and y ≤ 2 · only the green area satisfies both",overlapExample],
  curve:["The shaded intersection follows curved boundaries",curveExample],
  plot:["Plot, dash, then shade below y < 2x + 1",plotExample]
};
function currentMode() {
  const body=document.body;
  if(body.classList.contains("plot-page"))return "plot";
  if(body.classList.contains("curve-page"))return "curve";
  if(body.classList.contains("regions-page"))
    return document.getElementById("graphModeBuild")?.getAttribute("aria-pressed")==="true"?"build":"find";
  const quest=document.getElementById("quadraticScreen");
  if(quest&&!quest.hidden)return "quadratic";
  return document.querySelector(".level-card[aria-pressed=true]")?.dataset.level
    ||document.querySelector(".level-card.selected")?.dataset.level||"mirror";
}
function currentTip(mode){
  if(mode!=="plot"||document.getElementById("plotPlay")?.hidden!==false)return "";
  const step=document.querySelector("#plotPhaseTrack .plot-phase.is-current")?.dataset.step;
  const tips={
    plot:"Right now: place two points on the highlighted graph, then check your sketch.",
    style:"Right now: decide whether the inequality includes equality, then check the line style.",
    shade:"Right now: select the area that satisfies every rule shown for this piece."
  };
  return tips[step]||"";
}
function entryMarkup(items,ordered=false) {
  return items.map((item,i)=>'<div class="howplay-entry"><span class="howplay-entry-mark" aria-hidden="true">'+
    (ordered?String(i+1).padStart(2,"0"):"✦")+'</span><div><strong>'+item[0]+'</strong><p>'+item[1]+'</p></div></div>').join("");
}
function initGuide(){
  const triggers=[...document.querySelectorAll("[data-how-to-play]")];
  if(!triggers.length)return;
  const dialog=document.createElement("dialog");
  dialog.id="siteHowToPlay";
  dialog.className="howplay-dialog";
  dialog.setAttribute("aria-labelledby","howplayTitle");
  dialog.innerHTML='<div class="howplay-shell">'+
    '<header class="howplay-header"><div><span class="howplay-eyebrow">INEQUALITY INK · YOUR GUIDE</span><h2 id="howplayTitle">How to play</h2></div>'+
    '<button type="button" class="howplay-close" data-howplay-close aria-label="Close How to play">×</button></header>'+
    '<div class="howplay-intro"><strong id="howplayMode"></strong><p id="howplaySubtitle"></p><p id="howplayNow" class="howplay-now" hidden></p></div>'+
    '<div class="howplay-tabs" role="tablist" aria-label="How to play topics">'+
    '<button id="howplayTabSteps" type="button" role="tab" aria-controls="howplayPanel" data-howplay-tab="steps">The steps</button>'+
    '<button id="howplayTabMaths" type="button" role="tab" aria-controls="howplayPanel" data-howplay-tab="maths">Maths help</button>'+
    '<button id="howplayTabControls" type="button" role="tab" aria-controls="howplayPanel" data-howplay-tab="controls">Controls</button></div>'+
    '<section id="howplayPanel" class="howplay-panel" role="tabpanel" tabindex="0"></section>'+
    '<footer class="howplay-footer"><span>Your work stays exactly as it was.</span><button type="button" class="howplay-done" data-howplay-close>Back to the picture →</button></footer>'+
    '</div>';
  document.body.append(dialog);
  let guide=guides.mirror,tab="steps",lastTrigger=null;
  const tabs=[...dialog.querySelectorAll("[data-howplay-tab]")];
  const panel=dialog.querySelector("#howplayPanel");
  function render(){
    tabs.forEach(t=>{
      const active=t.dataset.howplayTab===tab;
      t.setAttribute("aria-selected",String(active));
      t.tabIndex=active?0:-1;
    });
    panel.setAttribute("aria-labelledby",tabs.find(t=>t.dataset.howplayTab===tab)?.id||"howplayTabSteps");
    const heading=tab==="steps"?entryMarkup(guide.steps,true)
      :tab==="controls"?entryMarkup(guide.controls):entryMarkup(guide.maths);
    const worked=examples[guide.example];
    panel.innerHTML=(tab==="maths"&&worked?
      '<div class="howplay-example"><div class="howplay-example-label">SEE IT ON A DIAGRAM</div>'+worked[1]+
      '<p>'+worked[0]+'</p></div>':"")+heading;
  }
  function selectTab(value,focus=false){
    if(!["steps","maths","controls"].includes(value))return;
    tab=value;render();
    if(focus)tabs.find(t=>t.dataset.howplayTab===value)?.focus();
  }
  function openGuide(trigger){
    const mode=currentMode();
    guide=guides[mode]||guides.mirror;
    lastTrigger=trigger||document.activeElement;
    dialog.querySelector("#howplayMode").textContent=guide.title;
    dialog.querySelector("#howplaySubtitle").textContent=guide.subtitle;
    const now=dialog.querySelector("#howplayNow"),tip=currentTip(mode);
    now.hidden=!tip;now.textContent=tip;
    selectTab("steps");
    if(typeof dialog.showModal==="function")dialog.showModal();
    else dialog.setAttribute("open","");
    dialog.querySelector(".howplay-close").focus();
  }
  function closeGuide(){
    if(typeof dialog.close==="function"&&dialog.open)dialog.close();
    else dialog.removeAttribute("open");
  }
  document.addEventListener("click",event=>{
    const trigger=event.target.closest?.("[data-how-to-play]");
    if(!trigger)return;
    event.preventDefault();
    openGuide(trigger);
  });
  dialog.addEventListener("click",event=>{
    if(event.target===dialog){closeGuide();return;}
    if(event.target.closest("[data-howplay-close]")){closeGuide();return;}
    const target=event.target.closest("[data-howplay-tab]");
    if(target)selectTab(target.dataset.howplayTab);
  });
  dialog.querySelector(".howplay-tabs").addEventListener("keydown",event=>{
    if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
    event.preventDefault();
    const index=tabs.findIndex(t=>t.dataset.howplayTab===tab);
    const next=event.key==="Home"?0:event.key==="End"?2:
      (index+(event.key==="ArrowRight"?1:2))%3;
    selectTab(tabs[next].dataset.howplayTab,true);
  });
  dialog.addEventListener("close",()=>lastTrigger?.focus?.());
}
if(typeof document!=="undefined"){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initGuide,{once:true});
  else initGuide();
}
