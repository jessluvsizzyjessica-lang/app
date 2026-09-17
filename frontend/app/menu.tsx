import { View, Text, ScrollView, Pressable, Linking, TextInput } from "react-native";
import { useState, useMemo } from "react";

export const GROUPS = [
  { key: "season", label: "Season", values: ["Spring","Summer","Fall"] },
  { key: "base", label: "Spirit", values: ["Bourbon","Tequila","Rum","Vodka","Gin","Sake / Gin","Melon Liqueur","Tequila / Vodka"] },
  { key: "color", label: "Color", values: ["Pink","Amber","Green","Red","Yellow","Purple","Orange","Blue","Clear"] },
  { key: "flavor", label: "Flavor", values: ["Citrus","Tropical","Spicy","Minty","Floral","Sweet","Fruity","Fresh","Creamy","Refreshing","Tamarind","Coconut","Mint","Tart"] },
];

const DRINKS = [
  { id:"raspberry-hibiscus-marg", name:"Raspberry Hibiscus Margarita", base:"Tequila", season:"Spring", color:"Pink", flavors:["Fruity", "Floral", "Sweet"], ingredients:["tequila", "raspberry", "hibiscus"], tags:["betty boop"] },
  { id:"cucumber-cooler", name:"Cucumber Cooler", base:"Vodka", season:"Spring", color:"Green", flavors:["Fresh", "Citrus", "Refreshing"], ingredients:["vodka", "cucumber", "lime"], tags:["betty boop"] },
  { id:"mangonada-betty", name:"Mangonada", base:"Tequila", season:"Summer", color:"Orange", flavors:["Spicy", "Tamarind", "Fruity", "Tropical"], ingredients:["tequila", "mango", "chamoy", "tajin"], tags:["betty boop"] },
  { id:"paloma-watermelon-burgundy", name:"Paloma Watermelon - Burgundy Classic", base:"Tequila", season:"Spring", color:"Pink", flavors:["Citrus", "Fruity"], ingredients:["tequila", "watermelon", "grapefruit soda"], tags:["burgundy"] },
  { id:"jack-coke-burgundy", name:"Jack and Coke", base:"Bourbon", season:"Fall", color:"Amber", flavors:["Sweet"], ingredients:["jack daniels", "coke"], tags:["burgundy"] },
  { id:"citrus-whiskey-smash-ramiro", name:"Citrus Whiskey Smash - Ramiro 50th", base:"Bourbon", season:"Spring", color:"Amber", flavors:["Citrus", "Fresh"], ingredients:["bourbon", "lemon", "mint"], tags:["ramiro", "50th"] },
  { id:"pina-pepper-rita-ramiro", name:"Pina-Pepper-Rita - Ramiro 50th", base:"Tequila", season:"Summer", color:"Yellow", flavors:["Spicy", "Tropical"], ingredients:["tequila", "pineapple", "jalapeno"], tags:["ramiro"] },
  { id:"lychee-mojito-ramiro", name:"Lychee Mojito - Ramiro 50th", base:"Rum", season:"Summer", color:"Clear", flavors:["Minty", "Fruity", "Floral"], ingredients:["rum", "lychee", "mint"], tags:["ramiro"] },
  { id:"cherry-blossom-tini-ezra", name:"Cherry Blossom-Tini - Ezra Arcade", base:"Sake / Gin", season:"Spring", color:"Pink", flavors:["Floral", "Fruity", "Tart"], ingredients:["sake gin", "triple sec", "cranberry", "bitters"], tags:["ezra", "arcade"] },
  { id:"citrus-whiskey-ezra", name:"Citrus Whiskey Smash - Ezra Arcade", base:"Bourbon", season:"Spring", color:"Amber", flavors:["Citrus", "Fresh"], ingredients:["bourbon", "spearmint", "lemon", "simple"], tags:["ezra"] },
  { id:"salted-paloma-ezra", name:"Salted Paloma - Ezra Arcade", base:"Tequila", season:"Summer", color:"Pink", flavors:["Citrus", "Refreshing"], ingredients:["tequila", "watermelon", "grapefruit soda", "lime"], tags:["ezra"] },
  { id:"moscow-mule-gothic", name:"Moscow Mule - Gothic Halloween", base:"Vodka", season:"Fall", color:"Clear", flavors:["Refreshing"], ingredients:["vodka", "ginger beer", "lime"], tags:["gothic", "halloween"] },
  { id:"witches-heart-gothic", name:"Witches Heart - Gothic", base:"Tequila", season:"Fall", color:"Red", flavors:["Fruity", "Tart"], ingredients:["tequila", "pomegranate", "lime"], tags:["gothic"] },
  { id:"mangonada-carolyn", name:"Mangonada - Carolyn's 50th", base:"Tequila", season:"Summer", color:"Orange", flavors:["Spicy", "Tamarind", "Fruity"], ingredients:["mango", "chamoy", "tajin"], tags:["carolyn", "50th"] },
];

function norm(s){ return (s||"").toString().toLowerCase().trim(); }
function drinkMatches(d, active, query){
  if(query){
    const q=norm(query);
    const hay=[d.name,d.base,d.season,d.color,d.garnish||"",...(d.flavors||[]),...(d.ingredients||[]),...(d.tags||[])].join(" ").toLowerCase();
    if(!hay.includes(q)) return false;
  }
  for(const g of [{key:"season"},{key:"base"},{key:"color"},{key:"flavor"}]){
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
function emptyState(){ return {season:new Set(), base:new Set(), color:new Set(), flavor:new Set()}; }

export default function MenuPage(){
  const [active, setActive] = useState(()=>emptyState());
  const [query, setQuery] = useState("");
  const filtered = useMemo(()=>DRINKS.filter(d=>drinkMatches(d,active,query)), [active,query]);
  const toggle = (groupKey, value)=>{
    setActive(prev=>{
      const next={}; for(const k of Object.keys(prev)) next[k]=new Set(prev[k]);
      if(!next[groupKey]) next[groupKey]=new Set();
      if(next[groupKey].has(value)) next[groupKey].delete(value); else next[groupKey].add(value);
      return next;
    });
  };
  const clearAll = ()=>{ setActive(emptyState()); setQuery(""); };
  const activeCount = Object.values(active).reduce((c,s)=>c+s.size,0);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0A0B14" }} contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <Pressable onPress={() => Linking.openURL("/")} style={{ borderWidth: 1, borderColor: "#2a2f5a", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 }}>
          <Text style={{ color: "#A5B4FC", fontSize: 11 }}>← Back to Home</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL("https://barbatchbible.netlify.app")} style={{ backgroundColor: "#F59E0B", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 }}>
          <Text style={{ color: "#000", fontSize: 11, fontWeight: "800" }}>📖 Bar Batch Bible → Batch Calculator</Text>
        </Pressable>
      </View>
      <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800", marginBottom: 4 }}>68 Menu Boards</Text>
      <Text style={{ color: "#9CA3AF", marginBottom: 14 }}>{filtered.length} matches • Filter by Spirit, Color, Flavor • Riverside & Rowland Heights</Text>
      <Pressable onPress={() => Linking.openURL("https://barbatchbible.netlify.app")} style={{ backgroundColor: "#1a1500", borderWidth: 1, borderColor: "#F59E0B", borderRadius: 16, padding: 14, marginBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ color: "#FDE68A", fontWeight: "800", fontSize: 13 }}>📖 Bar Batch Bible — Batch Calculator</Text>
          <Text style={{ color: "#F59E0B", fontSize: 11, marginTop: 2 }}>Calculate batches for big events • Link your menus to batch sizes</Text>
        </View>
        <Text style={{ color: "#F59E0B", fontWeight: "800" }}>→</Text>
      </Pressable>
      <View style={{ backgroundColor: "#141626", borderWidth: 1, borderColor: "#22264a", borderRadius: 16, padding: 12, marginBottom: 16 }}>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search Margarita, Spicy, Pink..." placeholderTextColor="#6B7280" style={{ color: "#fff", borderWidth: 1, borderColor: "#2a2f5a", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }} />
        {GROUPS.map(g=>(
          <View key={g.key} style={{ marginBottom: 10 }}>
            <Text style={{ color: "#A5B4FC", fontSize: 10, fontWeight: "700", marginBottom: 6, letterSpacing: 1 }}>{g.label.toUpperCase()}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {g.values.map(v=>{
                const isActive = active[g.key]?.has(v);
                return (
                  <Pressable key={v} onPress={()=>toggle(g.key,v)} style={{ backgroundColor: isActive ? "#8B5CF6" : "#1E2142", borderWidth: 1, borderColor: isActive ? "#8B5CF6" : "#2a2f5a", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                    <Text style={{ color: isActive ? "#fff" : "#CBD5E1", fontSize: 11, fontWeight: isActive ? "700" : "500" }}>{v}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
        {activeCount>0 && (
          <Pressable onPress={clearAll} style={{ marginTop: 6, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "#2a2f5a" }}>
            <Text style={{ color: "#E5E7EB", fontSize: 11 }}>Clear {activeCount} filters</Text>
          </Pressable>
        )}
      </View>
      {filtered.map((d,i)=>(
        <View key={d.id} style={{ backgroundColor: "#141626", borderWidth: 1, borderColor: "#22264a", borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{d.name}</Text>
            <Text style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>{d.base} • {d.season} • {d.color} • {d.flavors.join(", ")}</Text>
          </View>
          <Text style={{ color: "#8B5CF6", fontSize: 10, fontWeight: "700" }}>BOARD {i+1}</Text>
        </View>
      ))}
      <Pressable onPress={() => Linking.openURL("https://barbatchbible.netlify.app")} style={{ backgroundColor: "#F59E0B", padding: 18, borderRadius: 999, alignItems: "center", marginTop: 24 }}>
        <Text style={{ color: "#000", fontWeight: "800" }}>📖 Open Bar Batch Bible — Batch Calculator</Text>
      </Pressable>
      <Pressable onPress={() => Linking.openURL("https://ig.me/m/the_mobile_mixery_")} style={{ backgroundColor: "#E1306C", padding: 18, borderRadius: 999, alignItems: "center", marginTop: 12 }}>
        <Text style={{ color: "#fff", fontWeight: "800" }}>Book on Instagram — @the_mobile_mixery_</Text>
      </Pressable>
    </ScrollView>
  );
}
