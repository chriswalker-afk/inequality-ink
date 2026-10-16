// Sparse, transparent sprite paths for the connected mural.
// The original completed artwork geometry, colours and finishing details are
// reused unchanged. No background pixel or unfinished mystery is drawn here.
import {
  fullPictureWidth,picturePixelAt,pictureColourAt,pictureFinalDetails
} from "./picture-engine.mjs";

export function muralSpritePaths(picture){
  const fills=new Map(),width=fullPictureWidth(picture);
  function add(colour,path){
    fills.set(colour,(fills.get(colour)||"")+path);
  }
  for(let y=0;y<picture.height;y++)for(let x=0;x<width;x++){
    if(!picturePixelAt(picture,x,y,{full:true}))continue;
    add(pictureColourAt(picture,x,y,{full:true}),
      "M"+x+" "+y+"h1v1h-1z");
  }
  for(const mark of pictureFinalDetails(picture)){
    const y=mark.y+(1-mark.height)/2;
    add(mark.color,"M"+mark.x+" "+y+"h1v"+mark.height+"h-1z");
  }
  return [...fills].map(([fill,d])=>Object.freeze({fill,d}));
}
