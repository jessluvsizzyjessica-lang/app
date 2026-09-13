export const GROUPS = [
  { key: "season", label: "Season", values: ["Spring","Summer","Fall"] },
  { key: "base", label: "Spirit", values: ["Bourbon","Tequila","Rum","Vodka","Gin","Sake / Gin","Melon Liqueur","Tequila / Vodka"] },
  { key: "color", label: "Color", values: ["Pink","Amber","Green","Red","Yellow","Purple","Orange","Blue","Clear"] },
  { key: "flavor", label: "Flavor", values: ["Citrus","Tropical","Spicy","Minty","Floral","Sweet","Fruity","Fresh","Creamy","Refreshing","Tamarind","Coconut","Mint","Tart"] },
];

export function emptyState(){
  const s={};
  for(const g of GROUPS) s[g.key]=new Set();
  return s;
}
function norm(s){ return (s||"").toString().toLowerCase().trim(); }
function drinkMatches(d, active, query){
  if(query){
    const q=norm(query);
    const hay=[d.name,d.base,d.season,d.color,d.garnish,...(d.flavors||[]),...(d.ingredients||[]),...(d.tags||[])].join(" ").toLowerCase();
    if(!hay.includes(q)) return false;
  }
  for(const g of GROUPS){
    const set=active[g.key];
    if(!set || set.size===0) continue;
    const vals=Array.from(set).map(norm);
    if(g.key==="season"){ if(!vals.includes(norm(d.season))) return false; }
    else if(g.key==="base"){ if(!vals.includes(norm(d.base))) return false; }
    else if(g.key==="color"){ if(!vals.includes(norm(d.color))) return false; }
    else if(g.key==="flavor"){
      const dFlav=(d.flavors||[]).map(norm);
      if(!vals.some(v=>dFlav.includes(v))) return false;
    }
  }
  return true;
}
import { DRINKS } from "./data.js";
export function results(active, query){ return DRINKS.filter(d=>drinkMatches(d,active,query)); }
export function activeCount(active){ let c=0; for(const k of Object.keys(active)) c+=active[k].size; return c; }
export function chipCount(active, query, groupKey, value){
  const clone={}; for(const k of Object.keys(active)) clone[k]=new Set(active[k]);
  if(!clone[groupKey]) clone[groupKey]=new Set();
  const was=clone[groupKey].has(value);
  if(was) clone[groupKey].delete(value); else clone[groupKey].add(value);
  return DRINKS.filter(d=>drinkMatches(d,clone,query)).length;
}
