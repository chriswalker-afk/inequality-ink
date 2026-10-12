// Mathematical generator and validator for Paint by Inequalities.
// Rules are genuine inequalities on the integer-labelled canvas; display
// clipping never changes their mathematical solution over the real numbers.
import {isInInterval,formatInterval} from "./model.mjs";
import {mathematicalStage,paintStrictPreference} from "./math-progression.mjs";

const hex=s=>typeof s==="string"&&/^#[0-9a-f]{6}$/i.test(s);
export function paintTarget(picture,index){
 const grid=picture.paint?.grid;
 if(!grid||!Number.isInteger(index)||index<0||index>=grid.length)
   throw Error("Invalid paint question");
 return [...grid[grid.length-1-index]]; // Draw from the bottom upwards.
}
function makeRunSolution(picture,run,index,replay,runIndex,count,stage){
 const {min}=picture.window;
 const strict=paintStrictPreference(stage,index,replay,runIndex,"lower");
 if(count===1)return {
   direction:"left",at:min+run.end+(strict?1:0),included:!strict
 };
 if(runIndex===0)return {
   direction:"left",at:min+run.end+(strict?1:0),included:!strict
 };
 if(runIndex===count-1)return {
   direction:"right",at:min+run.start-(strict?1:0),included:!strict
 };
 const upperStrict=paintStrictPreference(stage,index,replay,runIndex,"upper");
 return {
   direction:"between",
   lower:min+run.start-(strict?1:0),
   upper:min+run.end+(upperStrict?1:0),
   lowerIncluded:!strict,upperIncluded:!upperStrict
 };
}
export function makePaintQuestion(picture,index,replay=0){
 const target=paintTarget(picture,index),runs=[];
 for(let col=0;col<target.length;col++){
   if(!col||target[col]!==target[col-1])
     runs.push({start:col,end:col,key:target[col]});
   else runs[runs.length-1].end=col;
 }
 const stage=mathematicalStage(picture,"paint");
 const rules=runs.map((run,i)=>{
   const swatch=picture.paint.colours[run.key];
   const solution=makeRunSolution(picture,run,index,replay,i,runs.length,stage);
   return {
     key:run.key,colour:swatch.hex,name:swatch.name,
     inequality:formatInterval(solution),solution,
     from:run.start,to:run.end
   };
 });
 return {
   index,row:target.length?picture.paint.grid.length-index:0,
   pictureId:picture.id,mode:"paint",artMode:"full",
   prompt:"Read the colour rules. Paint every integer square in this row.",
   target,rules
 };
}
export function checkPaintRow(picture,index,painted){
 const expected=paintTarget(picture,index);
 const wrong=expected.map((value,i)=>i).filter(i=>painted?.[i]!==expected[i]);
 const unpainted=wrong.filter(i=>painted?.[i]==null);
 return {correct:wrong.length===0,wrong,unpainted,expected};
}
export function validatePaintPicture(picture){
 const paint=picture.paint;
 if(!paint||picture.family!=="full"||
    picture.levels.length!==1||picture.levels[0]!=="paint")
   throw Error(picture.id+": Paint by Inequalities needs its own full picture");
 const width=picture.window.max-picture.window.min;
 if(width<6||width>16||!paint.colours||!paint.colours[paint.backgroundId])
   throw Error(picture.id+": invalid paint palette or width");
 const entries=Object.entries(paint.colours);
 if(entries.length<2||entries.length>8||entries.some(([id,c])=>
     !/^[A-Z]$/.test(id)||!c||!hex(c.hex)||typeof c.name!=="string"||
     !c.name.trim()))
   throw Error(picture.id+": invalid colour swatches");
 if(!Array.isArray(paint.grid)||paint.grid.length!==picture.rows.length||
   paint.grid.length<6||paint.grid.length>14)
   throw Error(picture.id+": expected six to fourteen painted rows");
 for(const [i,line] of paint.grid.entries()){
   const keys=[...line];
   if(keys.length!==width||keys.some(key=>!paint.colours[key]))
     throw Error(picture.id+": invalid colour grid row "+(i+1));
   const runs=keys.filter((v,j)=>j===0||v!==keys[j-1]).length;
   if(runs<1||runs>4)
     throw Error(picture.id+": row "+(i+1)+" needs one to four colour intervals");
 }
 for(let index=0;index<paint.grid.length;index++){
   for(let replay=0;replay<8;replay++){
     const q=makePaintQuestion(picture,index,replay);
     const projected=Array(width).fill(null);
     for(const rule of q.rules){
       for(let x=0;x<width;x++){
         if(isInInterval(picture.window.min+x,rule.solution)){
           if(projected[x]!==null)
             throw Error(picture.id+": overlapping colour rules");
           projected[x]=rule.key;
         }
       }
     }
     if(projected.some((key,x)=>key!==q.target[x]))
       throw Error(picture.id+": colour inequality does not cover row "+index);
   }
 }
 return {id:picture.id,rows:paint.grid.length,width};
}
