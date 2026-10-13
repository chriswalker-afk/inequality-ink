// Presentation helpers shared by all four Graph Art modes.
// Neither function reads nor changes game, marking or saved-progress state.
export function renderPieceMarkers(host,doc,total,completed){
  if(!Number.isInteger(total)||total<1||total>100)throw Error("Invalid piece count");
  if(!Number.isInteger(completed)||completed<0||completed>total)
    throw Error("Invalid completed piece count");
  host.replaceChildren();
  for(let i=0;i<total;i++){
    const segment=doc.createElement("span");
    segment.className=i<completed?"is-done":i===completed?"is-current":"";
    host.append(segment);
  }
}
export function renderSummaryMetrics(host,doc,items){
  host.replaceChildren();
  for(const {value,label} of items){
    const metric=doc.createElement("div");
    metric.className="graph-summary-metric";
    const count=doc.createElement("strong");
    count.textContent=String(value);
    const text=doc.createElement("span");
    text.textContent=label;
    metric.append(count,text);
    host.append(metric);
  }
}
