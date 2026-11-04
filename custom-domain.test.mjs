import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";

const read=path=>readFileSync(new URL("./"+path,import.meta.url),"utf8");
const roots=[
  "https://chriswalker-afk.github.io/inequality-ink/",
  "https://inequalities.mrwalkermaths.com/"
];
const pages=[
  "index.html","mural.html",
  "regions/index.html","regions/graph-mural.html",
  "regions/complex.html","regions/curve.html","regions/plot.html"
];

test("GitHub Pages CNAME matches the intended new website origin",()=>{
  assert.equal(read("CNAME").trim(),"inequalities.mrwalkermaths.com");
});

test("Pixel Art, Graph Art and murals use portable relative links",()=>{
  const names=new Set();
  for(const page of pages){
    const html=read(page);
    assert.match(html,/<html\b/i,"Expected a normal HTML page: "+page);
    assert.doesNotMatch(html,/<base\b/i,"No fixed base path: "+page);
    const refs=[...html.matchAll(/\b(src|href)=["']([^"']+)["']/gi)]
      .map(match=>({attribute:match[1].toLowerCase(),value:match[2]}))
      .filter(({value})=>!value.startsWith("#")
        && !/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value));
    assert.ok(refs.length>2,"Expected navigable links and assets in "+page);
    for(const {attribute,value} of refs){
      assert.ok(!value.startsWith("/"),"No root-absolute link: "+page+" -> "+value);
      for(const root of roots){
        const absolute=new URL(value,new URL(page,root));
        assert.equal(absolute.origin,new URL(root).origin,
          "Link must remain on the same website: "+page+" -> "+value);
        assert.ok(absolute.pathname.startsWith(new URL(root).pathname),
          "Link must stay within this website: "+page+" -> "+value);
      }
      const fromProject=new URL(value,new URL(page,roots[0]));
      const asset=decodeURIComponent(fromProject.pathname.slice(new URL(roots[0]).pathname.length));
      if(/\.(?:css|mjs|js)$/i.test(asset)){
        assert.ok(existsSync(new URL("./"+asset,import.meta.url)),
          "Linked JavaScript/CSS asset must exist: "+page+" -> "+value);
      }
      if(attribute==="href" && /\.html(?:\?|$)/i.test(value))names.add(asset);
    }
  }
  assert.ok(names.has("mural.html"),"Pixel Art mural navigation remains linked");
  assert.ok(names.has("regions/graph-mural.html"),"Graph Art mural remains linked");
});

test("Progress save keys remain unchanged during the domain migration",()=>{
  assert.match(read("app.mjs"),/inequality-ink-v5/);
  assert.match(read("mural-model.mjs"),/inequality-ink-mural-v1/);
});
