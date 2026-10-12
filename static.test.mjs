import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";
const root=dirname(fileURLToPath(import.meta.url));
const read=filename=>readFileSync(join(root,filename),"utf8");
const html=read("index.html"),script=read("app.mjs"),css=read("styles.css");

test("all DOM elements addressed by the game exist and have unique IDs",()=>{
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(ids).size,ids.length,"Duplicate HTML IDs");
 for(const [,id] of script.matchAll(/\$\("([^"]+)"\)/g)){
   assert.ok(ids.includes(id),"Missing DOM element: "+id);
 }
});
test("all four difficulty choices have accessible, wired controls",()=>{
 for(const id of ["mirror","full","solve","mixed"]){
   assert.ok(html.includes('data-level="'+id+'"'));
 }
 assert.ok(script.includes('addEventListener("click",()=>selectLevel('));
 for(const id of ["changeLevelButton","chooseLevelButton","mirrorNotice",
                  "mirrorExplainer","mirrorSideLabel","directionChooser"]){
   assert.ok(html.includes('id="'+id+'"'));
 }
 assert.ok(html.includes('aria-pressed="true"'));
});
test("static site needs no build process or remote assets",()=>{
 for(const path of ["index.html","styles.css","model.mjs","app.mjs","model.test.mjs"]){
   assert.ok(existsSync(join(root,path)),path+" is missing");
 }
 assert.ok(html.includes('src="./app.mjs"'));
 assert.ok(html.includes('href="./styles.css"'));
 assert.ok(script.includes('from "./model.mjs"'));
});
test("the CSS includes a clear reflection animation and reduced motion option",()=>{
 assert.ok(css.includes(".ink-new-primary"));
 assert.ok(css.includes(".ink-new-reflection"));
 assert.ok(css.includes("prefers-reduced-motion:reduce"));
});
