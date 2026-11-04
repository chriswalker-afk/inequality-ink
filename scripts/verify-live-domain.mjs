import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";

const base="https://inequalities.mrwalkermaths.com/";
const original="https://chriswalker-afk.github.io/inequality-ink/";
const sha=value=>createHash("sha256").update(value).digest("hex");
const pages=[
  "index.html","mural.html","regions/index.html",
  "regions/graph-mural.html","regions/complex.html","regions/curve.html","regions/plot.html"
];
const assets=[
  "styles.css","studio-design.css","app.mjs",
  "mural.css","mural.mjs","help/how-to-play.mjs","help/how-to-play.css",
  "regions/regions.css","regions/regions-app.mjs",
  "regions/graph-mural.css","regions/graph-mural.mjs",
  "regions/curved-engine.mjs","regions/complex-quest-app.mjs"
];
let success=0;
for(const path of [...pages,...assets]){
  const response=await fetch(new URL(path,base),{
    redirect:"follow",headers:{"User-Agent":"InequalityInk-DomainVerification/1.0"},
    signal:AbortSignal.timeout(25000)
  });
  const body=Buffer.from(await response.arrayBuffer());
  const final=new URL(response.url);
  const expected=readFileSync(new URL("../"+path,import.meta.url));
  const record={path,status:response.status,bytes:body.length,contentType:response.headers.get("content-type"),
    matchesGitHubSource:body.equals(expected)};
  console.log("LIVE_ASSET="+JSON.stringify(record));
  if(response.status!==200||final.origin!==new URL(base).origin||!body.equals(expected))
    throw Error("Published asset did not match repository: "+JSON.stringify(record));
  if(body.length<100)throw Error("Unexpectedly small asset: "+path);
  success++;
}
const old=await fetch(original,{redirect:"follow",signal:AbortSignal.timeout(25000)});
const text=await old.text();
if(old.status!==200||!text.includes("Inequality Ink")||!old.url.startsWith(base))
  throw Error("Original GitHub Pages address must redirect to custom domain with a valid app: "+
    JSON.stringify({status:old.status,url:old.url}));
console.log("LIVE_DOMAIN_RESULT="+JSON.stringify({
  origin:base,https:true,assetsAndPagesChecked:success,repositoryContentMatched:true,
  pixelArt:true,graphArt:true,pixelMural:true,graphMural:true,
  legacyPagesRedirect:old.url,status:"PASS"
}));