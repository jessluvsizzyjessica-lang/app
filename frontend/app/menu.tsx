import { View, Text, ScrollView, Pressable, Linking, TextInput } from "react-native";
import { useState, useMemo } from "react";

export const GROUPS = [
  { key: "season", label: "Season", values: ["Spring","Summer","Fall"] },
  { key: "base", label: "Spirit", values: ["Bourbon","Tequila","Rum","Vodka","Gin","Sake / Gin","Melon Liqueur","Tequila / Vodka"] },
  { key: "color", label: "Color", values: ["Pink","Amber","Green","Red","Yellow","Purple","Orange","Blue","Clear"] },
  { key: "flavor", label: "Flavor", values: ["Citrus","Tropical","Spicy","Minty","Floral","Sweet","Fruity","Fresh","Creamy","Refreshing","Tamarind","Coconut","Mint","Tart"] },
];

const DRINKS = [
  { id:"margarita-classic", name:"Classic Lime Margarita", base:"Tequila", season:"Spring", color:"Yellow", flavors:["Citrus","Refreshing","Tart"], ingredients:["tequila","lime","triple sec"], tags:["margarita bar","board 1"] },
  { id:"strawberry-marg", name:"Strawberry Margarita", base:"Tequila", season:"Summer", color:"Pink", flavors:["Fruity","Sweet","Citrus"], ingredients:["tequila","strawberry","lime"], tags:["margarita bar"] },
  { id:"mango-marg", name:"Mango Margarita", base:"Tequila", season:"Summer", color:"Orange", flavors:["Tropical","Fruity","Sweet"], ingredients:["tequila","mango","lime"], tags:["margarita bar"] },
  { id:"spicy-marg", name:"Spicy Margarita", base:"Tequila", season:"Fall", color:"Red", flavors:["Spicy","Citrus","Tamarind"], ingredients:["tequila","jalapeno","lime"], tags:["margarita bar"] },
  { id:"mojito-custom", name:"Mojito Station - Custom Cups", base:"Rum", season:"Summer", color:"Green", flavors:["Minty","Mint","Fresh","Citrus"], ingredients:["rum","mint","lime"], tags:["custom cups","patty ramirez"] },
  { id:"paloma", name:"Paloma & Cantaritos", base:"Tequila", season:"Spring", color:"Pink", flavors:["Citrus","Refreshing","Tart"], ingredients:["tequila","grapefruit","tajin"], tags:["paloma bar","clay cup"] },
  { id:"whiskey-sour", name:"Whiskey Sour - Borra-guita", base:"Bourbon", season:"Fall", color:"Amber", flavors:["Citrus","Sweet","Refreshing"], ingredients:["bourbon","lemon","simple"], tags:["whiskey","borra-guita bonita"] },
  { id:"old-fashioned", name:"Old Fashioned", base:"Bourbon", season:"Fall", color:"Amber", flavors:["Sweet","Citrus"], ingredients:["bourbon","bitters","orange"], tags:["whiskey"] },
  { id:"tequila-sunrise", name:"Tequila Sunrise", base:"Tequila / Vodka", season:"Summer", color:"Orange", flavors:["Fruity","Sweet","Tropical"], ingredients:["tequila","oj","grenadine"], tags:["sunset","neon 60th"] },
  { id:"tequila-sunset", name:"Tequila Sunset", base:"Tequila", season:"Summer", color:"Red", flavors:["Fruity","Sweet"], ingredients:["tequila","oj","grenadine"], tags:["neon 60th"] },
  { id:"spiked-horchata", name:"Spiked Horchata", base:"Rum", season:"Fall", color:"Clear", flavors:["Creamy","Sweet","Coconut"], ingredients:["rum","horchata","cinnamon"], tags:["late night","creamy"] },
  { id:"rumchata", name:"RumChata Cream", base:"Rum", season:"Fall", color:"Clear", flavors:["Creamy","Sweet","Coconut"], ingredients:["rumchata","cinnamon"], tags:["creamy"] },
  { id:"michelada", name:"Michelada Bar", base:"Tequila / Vodka", season:"Summer", color:"Red", flavors:["Spicy","Tamarind","Refreshing"], ingredients:["beer","clamato","tajin","chamoy"], tags:["michelada"] },
  { id:"pina-colada", name:"Pina Colada", base:"Rum", season:"Summer", color:"Clear", flavors:["Tropical","Coconut","Creamy","Sweet"], ingredients:["rum","coconut","pineapple"], tags:["tropical"] },
  { id:"coquito", name:"Coquito", base:"Rum", season:"Fall", color:"Clear", flavors:["Coconut","Creamy","Sweet"], ingredients:["rum","coconut cream"], tags:["tropical"] },
  { id:"rose-spritz", name:"Rose & Aperol Spritz", base:"Gin", season:"Spring", color:"Pink", flavors:["Floral","Refreshing","Citrus","Fruity"], ingredients:["aperol","rose","prosecco"], tags:["spritz","floral garnish"] },
  { id:"bloody-mary", name:"Bloody Mary Bar", base:"Vodka", season:"Spring", color:"Red", flavors:["Spicy","Fresh","Tamarind"], ingredients:["vodka","tomato","tajin"], tags:["brunch"] },
  { id:"gin-tonic", name:"Gin & Tonic Botanicals", base:"Gin", season:"Spring", color:"Clear", flavors:["Floral","Fresh","Citrus","Refreshing"], ingredients:["gin","tonic","cucumber"], tags:["botanicals"] },
  { id:"vodka-lemonade", name:"Vodka Lemonade", base:"Vodka", season:"Summer", color:"Yellow", flavors:["Citrus","Refreshing","Sweet","Tart"], ingredients:["vodka","lemonade"], tags:["custom sign"] },
  { id:"mezcal-paloma", name:"Mezcal Smoky Paloma", base:"Sake / Gin", season:"Fall", color:"Orange", flavors:["Citrus","Smoky","Tropical"], ingredients:["mezcal","grapefruit","agave"], tags:["mezcal","smoky"] },
];

function norm(s){ return (s||"").toString().toLowerCase().trim(); }
function drinkMatches(d, active, query){
  if(query){
    const q=norm(query);
    const hay=[d.name,d.base,d.season,d.color,d.garnish||"",...(d.flavors||[]),...(d.ingredients||[]),...(d.tags||[])].join(" ").toLowerCase();
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
function emptyState(){
  const s={};
  for(const g of GROUPS) s[g.key]=new Set();
  return s;
}

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
      <Pressable onPress={() => Linking.openURL("/")} style={{ alignSelf: "flex-start", borderWidth: 1, borderColor: "#2a2f5a", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 16 }}>
        <Text style={{ color: "#A5B4FC", fontSize: 11 }}>Back to Home</Text>
      </Pressable>
      <Text style={{ color: "#fff", fontSize: 36, fontWeight: "800", marginBottom: 4 }}>20 Menu Boards</Text>
      <Text style={{ color: "#9CA3AF", marginBottom: 14 }}>Filter by Spirit, Color, Flavor - {filtered.length} matches - Riverside & Rowland Heights</Text>
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
            <Text style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>{d.base} - {d.season} - {d.color} - {d.flavors.join(", ")}</Text>
          </View>
          <Text style={{ color: "#8B5CF6", fontSize: 10, fontWeight: "700" }}>BOARD {i+1}</Text>
        </View>
      ))}
      <Pressable onPress={() => Linking.openURL("https://ig.me/m/the_mobile_mixery_")} style={{ backgroundColor: "#E1306C", padding: 18, borderRadius: 999, alignItems: "center", marginTop: 24 }}>
        <Text style={{ color: "#fff", fontWeight: "800" }}>Book on Instagram - @the_mobile_mixery_</Text>
      </Pressable>
    </ScrollView>
  );
}
