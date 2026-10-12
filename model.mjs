// Inequality Ink: mathematical model and validated pixel-art source.
// All pixel filling is derived from the exact real-number interval, never from a reward lookup.
export const WIDTH = 16;
export const HEIGHT = 16;
export const COLUMN_MIN = -8;
export const COLUMN_MAX = 7;
export const AXIS_MIN = -9;
export const AXIS_MAX = 8;

const specification = [
  // Picture row (top to bottom), lower endpoint, upper endpoint, lower included, upper included, question type.
  [1, -3, 2, false, false, "solve", -2, 1],
  [2, -4, 4, true, false, "solve", 2, 1],
  [3, -6, 4, false, true, "solve", 2, -1],
  [4, -6, 5, true, true, "solve", 2, 1],
  [5, -8, 7, false, false, "draw"],
  [6, -7, 7, true, false, "draw"],
  [7, -8, 6, false, true, "draw"],
  [8, -7, 5, false, true, "draw"],
  [9, -5, 5, true, false, "draw"],
  [10, -4, 2, false, true, "draw"],
  [11, -3, 3, true, false, "draw"],
  [12, -4, 3, false, false, "read"],
  [13, -3, 2, true, true, "read"],
  [14, -4, 3, true, true, "read"]
];

export const ROWS = Object.freeze(specification.map(([y, lower, upper, lowerIncluded, upperIncluded, mode, a, b]) =>
  Object.freeze({y, lower, upper, lowerIncluded, upperIncluded, mode, a, b})
));
export const SEQUENCE = Object.freeze([...ROWS].reverse());

export const isInInterval = (x, i) => {
  if (i.direction === "right") return i.included ? x >= i.at : x > i.at;
  if (i.direction === "left") return i.included ? x <= i.at : x < i.at;
  return (i.lowerIncluded ? x >= i.lower : x > i.lower) &&
    (i.upperIncluded ? x <= i.upper : x < i.upper);
};

export const columnsFor = (i) => Array.from({length: WIDTH}, (_, p) => p + COLUMN_MIN)
  .filter(x => isInInterval(x, i));

export function identicalSolution(a, b) {
  if (!a || !b || a.direction !== b.direction) return false;
  if (a.direction === "between") return a.lower === b.lower &&
    a.upper === b.upper && a.lowerIncluded === b.lowerIncluded &&
    a.upperIncluded === b.upperIncluded;
  return a.at === b.at && a.included === b.included;
}

export const withDirection = i => ({...i, direction: i.direction || "between"});

export const fmt = n => String(n).replace(/-/g, "−");
export function formatInterval(i) {
  if (i.direction === "right") return `x ${i.included ? "≥" : ">"} ${fmt(i.at)}`;
  if (i.direction === "left") return `x ${i.included ? "≤" : "<"} ${fmt(i.at)}`;
  return `${fmt(i.lower)} ${i.lowerIncluded ? "≤" : "<"} x ${i.upperIncluded ? "≤" : "<"} ${fmt(i.upper)}`;
}

export function formatLinear(i, a, b) {
  if (!Number.isInteger(a) || a === 0 || !Number.isInteger(b)) throw new Error("Invalid linear transformation");
  const lower = a > 0 ? a * i.lower + b : a * i.upper + b;
  const upper = a > 0 ? a * i.upper + b : a * i.lower + b;
  const lowerIncluded = a > 0 ? i.lowerIncluded : i.upperIncluded;
  const upperIncluded = a > 0 ? i.upperIncluded : i.lowerIncluded;
  const term = Math.abs(a) === 1 ? "x" : `${Math.abs(a)}x`;
  const middle = a < 0 && b !== 0 ?
    `${fmt(b)} − ${term}` :
    `${a < 0 ? "−" : ""}${term}${b > 0 ? " + " + b : b < 0 ? " − " + Math.abs(b) : ""}`;
  return `${fmt(lower)} ${lowerIncluded ? "≤" : "<"} ${middle} ${upperIncluded ? "≤" : "<"} ${fmt(upper)}`;
}

function variantForPixels(i, variant) {
  const pixels = columnsFor(i);
  const left = pixels[0], right = pixels[pixels.length - 1];
  const kind = ((variant % 4) + 4) % 4;
  return {direction: "between",
    lower: left - (kind === 1 || kind === 3 ? 1 : 0),
    upper: right + (kind === 2 || kind === 3 ? 1 : 0),
    lowerIncluded: !(kind === 1 || kind === 3),
    upperIncluded: !(kind === 2 || kind === 3)};
}

function readOptions(answer, index, replay) {
  const candidates = [
    answer,
    {...answer, lowerIncluded: !answer.lowerIncluded},
    {...answer, upperIncluded: !answer.upperIncluded},
    {...answer, lower: answer.lower + 1}
  ];
  const rotated = candidates.map((_, k) => candidates[(k + (index * 3 + replay) % 4) % 4]);
  return rotated.map(i => ({label:formatInterval(i), value:i}));
}

export function makeQuestion(index, replay=0) {
  const row = SEQUENCE[index];
  if (!row) return null;
  let answer = {direction:"between", lower:row.lower, upper:row.upper,
    lowerIncluded:row.lowerIncluded, upperIncluded:row.upperIncluded};
  if (replay > 0 && row.mode !== "read") answer = variantForPixels(answer, replay + index);
  if (row.mode === "read") return {index, row:row.y, mode:"read", answer,
    prompt:"Which inequality does this number line represent?",
    options:readOptions(answer,index,replay)};
  if (row.mode === "draw") return {index, row:row.y, mode:"draw", answer,
    prompt:"Draw this inequality on the number line.", equation:formatInterval(answer)};
  const coefficients = [[row.a,row.b],[2,-3],[-2,1],[3,2]];
  const [a,b] = replay ? coefficients[(replay + index) % coefficients.length] : [row.a,row.b];
  return {index, row:row.y, mode:"solve", answer,
    prompt:"Solve the inequality, then draw your solution.", equation:formatLinear(answer,a,b),
    transformed: {a,b}};
}

export const TUTORIAL = [
  {mode:"tutorial", prompt:"Shade every value greater than or equal to −2.", equation:"x ≥ −2",
    answer:{direction:"right", at:-2, included:true}},
  {mode:"tutorial", prompt:"Now shade the values between these endpoints.", equation:"−2 < x ≤ 3",
    answer:{direction:"between", lower:-2, upper:3, lowerIncluded:false, upperIncluded:true}}
];

export function pixelAt(x,y) {
  const row = ROWS.find(r=>r.y === y);
  return row && isInInterval(x + COLUMN_MIN, {...row,direction:"between"}) ? true : false;
}

// The colour artwork is strictly constrained by pixelAt(). No decorative colour can create extra pixels.
export function colourAt(x,y) {
  if (!pixelAt(x,y)) return null;
  const row = ROWS[y-1], first = columnsFor(row)[0] - COLUMN_MIN, last = columnsFor(row).at(-1) - COLUMN_MIN;
  const outline = "#28324c", coral = "#ed707d", shadow = "#ca4b67",
    highlight = "#f79b94", cream = "#fff2ce", stem = "#e8c596", stemShade = "#cfa373";
  if (y === 1 || y === 9 || y === 14 && (x === first || x === last) ||
    x === first || x === last) return outline;
  if (y <= 8) {
    if ((y === 3 && [5,6,10,11].includes(x)) ||
        (y === 4 && [5,6,10,11].includes(x)) ||
        (y === 5 && [3,4,11,12].includes(x)) ||
        (y === 6 && [3,4,11,12].includes(x))) return cream;
    if (y === 2 || (y === 3 && x >= 7 && x <= 9)) return highlight;
    if (y >= 7 || y === 8) return shadow;
    return coral;
  }
  if (y === 11 && (x === 6 || x === 9)) return outline;
  if (y === 12 && (x === 7 || x === 8)) return shadow;
  if ((y === 13 && x === 6) || (y === 14 && x >= 5 && x <= 10)) return stemShade;
  return stem;
}

export function validatePuzzle() {
  if (ROWS.length !== 14 || ROWS.some(r => r.y < 1 || r.y > 14)) throw Error("Invalid row count");
  const positions = new Set();
  for (const row of ROWS) {
    const cols = columnsFor(row);
    if (!cols.length || cols.some((c,j)=>j && c!==cols[j-1]+1)) throw Error(`Non-contiguous row ${row.y}`);
    if (cols.some(x=>x < COLUMN_MIN || x > COLUMN_MAX)) throw Error("Pixel out of bounds");
    for (const c of cols) positions.add(`${c},${row.y}`);
  }
  const flood = new Set(), stack = [positions.values().next().value];
  while (stack.length) {
    const node=stack.pop();
    if (flood.has(node)) continue;
    flood.add(node);
    const [x,y]=node.split(",").map(Number);
    for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const next=`${x+dx},${y+dy}`;
      if (positions.has(next) && !flood.has(next)) stack.push(next);
    }
  }
  if (flood.size !== positions.size) throw Error("Disconnected sprite");
  for (let n=0;n<14;n++){
    const q=makeQuestion(n);
    const expected=columnsFor(ROWS.find(r=>r.y===q.row));
    if (JSON.stringify(columnsFor(q.answer)) !== JSON.stringify(expected)) throw Error(`Row mismatch ${q.row}`);
    for (let s=1;s<10;s++){
      const replay=makeQuestion(n,s);
      if (JSON.stringify(columnsFor(replay.answer))!==JSON.stringify(expected)) throw Error(`Replay mismatch ${n}/${s}`);
    }
  }
  return {rows:ROWS.length,pixels:positions.size,connected:true};
}
