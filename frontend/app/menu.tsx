
import { View, Text, ScrollView, Pressable, Linking, TextInput } from "react-native";
import { useState, useMemo } from "react";

export const GROUPS = [
  { key: "season", label: "Season", values: ["Spring","Summer","Fall"] },
  { key: "base", label: "Spirit", values: ["Bourbon","Tequila","Rum","Vodka","Gin","Sake / Gin","Melon Liqueur","Tequila / Vodka"] },
  { key: "color", label: "Color", values: ["Pink","Amber","Green","Red","Yellow","Purple","Orange","Blue","Clear"] },
  { key: "flavor", label: "Flavor", values: ["Citrus","Tropical","Spicy","Minty","Floral","Sweet","Fruity","Fresh","Creamy","Refreshing","Tamarind","Coconut","Mint","Tart"] },
];

const DRINKS = [

  { id:"raspberry-hibiscus-marg", name:"Raspberry Hibiscus Margarita", base:"Tequila", season:"Spring", color:"Pink", flavors:["Fruity", "Floral", "Sweet"], ingredients:["tequila", "raspberry", "hibiscus"], tags:["betty boop", "board betty"] },
  { id:"cucumber-cooler", name:"Cucumber Cooler", base:"Vodka", season:"Spring", color:"Green", flavors:["Fresh", "Citrus", "Refreshing"], ingredients:["vodka", "cucumber", "lime"], tags:["betty boop"] },
  { id:"mangonada-betty", name:"Mangonada", base:"Tequila", season:"Summer", color:"Orange", flavors:["Spicy", "Tamarind", "Fruity", "Tropical"], ingredients:["tequila", "mango", "chamoy", "tajin"], tags:["betty boop", "mangonada"] },
  { id:"cherry-cream-spritz", name:"Cherry Cream Spritz", base:"Gin", season:"Spring", color:"Pink", flavors:["Creamy", "Fruity", "Floral"], ingredients:["gin", "cherry", "cream", "prosecco"], tags:["betty boop", "spritz"] },
  { id:"mexican-candy-shot-betty", name:"Mexican Candy Shot", base:"Tequila", season:"Fall", color:"Red", flavors:["Spicy", "Tamarind", "Sweet"], ingredients:["tequila", "watermelon", "tajin"], tags:["betty boop", "shot"] },
  { id:"strawberry-mojito-blossom", name:"Strawberry Mojito", base:"Rum", season:"Summer", color:"Pink", flavors:["Minty", "Fruity", "Fresh", "Mint"], ingredients:["rum", "strawberry", "mint"], tags:["blue blossom"] },
  { id:"blue-hawaiian", name:"Blue Hawaiian", base:"Rum", season:"Summer", color:"Blue", flavors:["Tropical", "Coconut", "Sweet", "Fruity"], ingredients:["rum", "blue curacao", "pineapple", "coconut"], tags:["blue blossom"] },
  { id:"blackberry-spritz", name:"Blackberry Spritz", base:"Gin", season:"Summer", color:"Purple", flavors:["Fruity", "Floral", "Refreshing"], ingredients:["gin", "blackberry", "prosecco"], tags:["blue blossom", "spritz"] },
  { id:"watermelon-mojito", name:"Watermelon Mojito", base:"Rum", season:"Summer", color:"Pink", flavors:["Minty", "Fruity", "Fresh", "Mint"], ingredients:["rum", "watermelon", "mint"], tags:["blue blossom"] },
  { id:"mexican-candy-shot-blossom", name:"Mexican Candy Shot", base:"Tequila", season:"Fall", color:"Red", flavors:["Spicy", "Tamarind"], ingredients:["tequila", "watermelon"], tags:["blue blossom", "shot"] },
  { id:"peachy-stardust-spritz", name:"Peachy Stardust Spritz - Athena", base:"Gin", season:"Spring", color:"Pink", flavors:["Fruity", "Floral", "Citrus", "Tart"], ingredients:["gin", "lemon", "egg white", "raspberry", "peach"], tags:["athena", "cyrus", "arcade", "stardust"] },
  { id:"yoshis-island-zing", name:"Yoshi's Island Zing", base:"Rum", season:"Summer", color:"Blue", flavors:["Tropical", "Citrus", "Fruity"], ingredients:["rum", "lime", "blue curacao", "pineapple juice"], tags:["cyrus", "yoshi", "tropical"] },
  { id:"rosalinas-cosmic-cascade", name:"Rosalina's Cosmic Cascade", base:"Vodka", season:"Summer", color:"Blue", flavors:["Citrus", "Tropical", "Sweet"], ingredients:["vodka", "blue curacao", "lime"], tags:["cyrus", "rosalina", "cosmic"] },
  { id:"paloma-halloween", name:"Paloma - Albert + Nicole Halloween", base:"Tequila", season:"Fall", color:"Pink", flavors:["Citrus", "Refreshing"], ingredients:["tequila", "grapefruit"], tags:["halloween", "albert nicole"] },
  { id:"mangonada-halloween", name:"Mangonada - Halloween Edition", base:"Tequila", season:"Fall", color:"Orange", flavors:["Spicy", "Tamarind", "Fruity"], ingredients:["mango", "chamoy", "tajin"], tags:["halloween"] },
  { id:"pomegranate-margarita-halloween", name:"Pomegranate Margarita", base:"Tequila", season:"Fall", color:"Red", flavors:["Fruity", "Tart", "Citrus"], ingredients:["tequila", "pomegranate", "lime"], tags:["halloween"] },
  { id:"hibiscus-spritz-halloween", name:"Hibiscus Spritz", base:"Gin", season:"Fall", color:"Red", flavors:["Floral", "Refreshing", "Citrus"], ingredients:["gin", "hibiscus", "prosecco"], tags:["halloween", "spritz"] },
  { id:"strawberry-mojito-halloween", name:"Strawberry Mojito - Halloween", base:"Rum", season:"Fall", color:"Red", flavors:["Minty", "Fruity", "Mint"], ingredients:["rum", "strawberry", "mint"], tags:["halloween"] },
  { id:"mexican-candy-shot-halloween", name:"Mexican Candy Shot - Halloween", base:"Tequila", season:"Fall", color:"Red", flavors:["Spicy", "Tamarind"], ingredients:["tequila"], tags:["halloween", "shot", "beware"] },
  { id:"mojito-custom", name:"Mojito Station - Custom Cups", base:"Rum", season:"Summer", color:"Green", flavors:["Minty", "Mint", "Fresh"], ingredients:["rum", "mint"], tags:["custom cups", "patty ramirez"] },
  { id:"tequila-sunrise", name:"Tequila Sunrise - Neon 60th", base:"Tequila / Vodka", season:"Summer", color:"Orange", flavors:["Fruity", "Tropical"], ingredients:["tequila", "oj", "grenadine"], tags:["neon 60th"] },

  { id:"paloma-watermelon-burgundy", name:"Paloma Watermelon - Burgundy Classic", base:"Tequila", season:"Spring", color:"Pink", flavors:["Citrus", "Fruity", "Refreshing"], ingredients:["tequila", "watermelon", "grapefruit soda"], tags:["burgundy classic", "watermelon"] },
  { id:"jack-coke-burgundy", name:"Jack and Coke", base:"Bourbon", season:"Fall", color:"Amber", flavors:["Sweet", "Citrus"], ingredients:["jack daniels", "coke"], tags:["burgundy classic", "classic"] },
  { id:"tequila-sunrise-burgundy", name:"Tequila Sunrise", base:"Tequila", season:"Summer", color:"Orange", flavors:["Fruity", "Tropical", "Sweet"], ingredients:["tequila", "oj", "grenadine"], tags:["burgundy classic"] },
  { id:"old-fashioned-burgundy", name:"Old Fashioned", base:"Bourbon", season:"Fall", color:"Amber", flavors:["Sweet", "Citrus"], ingredients:["bourbon", "bitters", "orange"], tags:["burgundy classic"] },
  { id:"margarita-burgundy", name:"Margarita - Burgundy", base:"Tequila", season:"Spring", color:"Yellow", flavors:["Citrus", "Tart"], ingredients:["tequila", "lime", "triple sec"], tags:["burgundy classic"] },
  { id:"mexican-candy-shot-burgundy", name:"Mexican Candy Shot", base:"Tequila", season:"Fall", color:"Red", flavors:["Spicy", "Tamarind"], ingredients:["tequila", "watermelon"], tags:["burgundy classic", "shot"] },
  { id:"lime-sunrise-camilla", name:"Lime-Sunrise - Camilla's Sweet 16", base:"Tequila / Vodka", season:"Summer", color:"Yellow", flavors:["Citrus", "Fruity", "Tropical"], ingredients:["lime", "oj", "tequila"], tags:["camilla", "sweet 16", "western"] },
  { id:"berry-temple-camilla", name:"Berry Temple - Camilla's 16", base:"Vodka", season:"Summer", color:"Pink", flavors:["Fruity", "Sweet"], ingredients:["berries", "lemon"], tags:["camilla", "sweet 16", "temple"] },
  { id:"coco-pina-camilla", name:"Coco-Pina - Camilla's 16", base:"Rum", season:"Summer", color:"Clear", flavors:["Coconut", "Creamy", "Tropical"], ingredients:["coconut", "pineapple"], tags:["camilla", "sweet 16", "coco"] },
  { id:"jack-coke-carolyn", name:"Jack & Coke - Carolyn's 50th", base:"Bourbon", season:"Fall", color:"Amber", flavors:["Sweet"], ingredients:["jack", "coke"], tags:["carolyn", "50th", "fiesta"] },
  { id:"mangonada-carolyn", name:"Mangonada - Carolyn's 50th", base:"Tequila", season:"Summer", color:"Orange", flavors:["Spicy", "Tamarind", "Tropical"], ingredients:["mango", "chamoy", "tajin"], tags:["carolyn", "50th", "mangonada"] },
  { id:"pina-colada-carolyn", name:"Pina Colada - Carolyn's 50th", base:"Rum", season:"Summer", color:"Clear", flavors:["Coconut", "Creamy", "Tropical"], ingredients:["rum", "coconut", "pineapple"], tags:["carolyn", "50th"] },
  { id:"cranberry-vodka-carolyn", name:"Cranberry Vodka - Carolyn's 50th", base:"Vodka", season:"Fall", color:"Red", flavors:["Fruity", "Tart"], ingredients:["vodka", "cranberry"], tags:["carolyn", "50th"] },
  { id:"mexican-candy-shot-carolyn", name:"Mexican Candy Shot - Carolyn's 50th", base:"Tequila", season:"Fall", color:"Red", flavors:["Spicy", "Tamarind"], ingredients:["tequila"], tags:["carolyn", "50th", "shot"] },
  { id:"blueberry-mule-60", name:"Blueberry Mule - 60 Años", base:"Tequila", season:"Spring", color:"Blue", flavors:["Fruity", "Citrus", "Refreshing"], ingredients:["tequila", "blueberry syrup", "lime", "ginger beer"], tags:["60 anos", "celebrando", "mule"] },
  { id:"tamarindo-tequila-60", name:"Tamarindo & Tequila - 60 Años", base:"Tequila", season:"Fall", color:"Amber", flavors:["Tamarind", "Citrus", "Sweet"], ingredients:["tequila", "tamarindo syrup", "lime", "triple sec"], tags:["60 anos", "tamarindo"] },
  { id:"salted-watermelon-paloma-60", name:"Salted Watermelon Paloma - 60 Años", base:"Tequila", season:"Summer", color:"Pink", flavors:["Fruity", "Citrus", "Refreshing"], ingredients:["tequila", "squirt", "watermelon juice", "lime"], tags:["60 anos", "paloma", "watermelon"] },
  { id:"blackberry-mule-60", name:"Blackberry Mule - 60 Años", base:"Vodka", season:"Summer", color:"Purple", flavors:["Fruity", "Refreshing"], ingredients:["vodka", "blackberries", "ginger beer", "hibiscus syrup", "spritz"], tags:["60 anos", "mule"] },
  { id:"hibiscus-spritz-60", name:"Hibiscus Spritz - 60 Años", base:"Tequila", season:"Spring", color:"Pink", flavors:["Floral", "Fruity", "Refreshing"], ingredients:["tequila", "raspberries", "hibiscus syrup", "club soda", "spritz"], tags:["60 anos", "spritz", "hibiscus"] },
  { id:"cucumber-margarita-danny", name:"Cucumber Margarita - Danny's 21st", base:"Tequila", season:"Spring", color:"Green", flavors:["Fresh", "Citrus", "Refreshing"], ingredients:["tequila", "cucumber", "lime"], tags:["danny", "21st", "margarita"] },
  { id:"jack-coke-danny", name:"Jack & Coke - Danny's 21st", base:"Bourbon", season:"Fall", color:"Amber", flavors:["Sweet"], ingredients:["jack", "coke"], tags:["danny", "21st"] },
  { id:"malibu-spritz-danny", name:"Malibu Spritz - Danny's 21st", base:"Rum", season:"Summer", color:"Clear", flavors:["Coconut", "Tropical", "Fruity"], ingredients:["malibu", "prosecco", "pineapple"], tags:["danny", "21st", "spritz"] },
  { id:"cherry-blossom-tini-ezra", name:"Cherry Blossom-Tini - Ezra Arcade", base:"Sake / Gin", season:"Spring", color:"Pink", flavors:["Floral", "Citrus", "Fruity"], ingredients:["sake gin", "triple sec", "cranberry juice", "bitters"], tags:["ezra", "arcade", "pacman", "cherry blossom"] },
  { id:"citrus-whiskey-smash-ezra", name:"Citrus Whiskey Smash - Ezra", base:"Bourbon", season:"Spring", color:"Yellow", flavors:["Citrus", "Mint", "Minty", "Fresh"], ingredients:["bourbon", "spearmint", "lemon", "simple syrup", "soda water"], tags:["ezra", "arcade", "whiskey smash"] },
  { id:"salted-paloma-ezra", name:"Salted Paloma - Ezra", base:"Tequila", season:"Summer", color:"Pink", flavors:["Citrus", "Refreshing", "Fruity"], ingredients:["tequila", "watermelon", "grapefruit soda", "lime"], tags:["ezra", "arcade", "paloma"] },
  { id:"hibiscus-margarita-ezra", name:"Hibiscus Margarita - Ezra", base:"Tequila", season:"Spring", color:"Red", flavors:["Floral", "Citrus", "Tart"], ingredients:["tequila", "sweet and sour", "lime", "triple sec", "hibiscus"], tags:["ezra", "arcade", "margarita"] },
  { id:"green-tea-shot-ezra", name:"Green Tea Shot - Ezra", base:"Tequila / Vodka", season:"Spring", color:"Green", flavors:["Sweet", "Refreshing"], ingredients:["jameson", "peach schnapps", "sweet and sour"], tags:["ezra", "arcade", "shot", "green tea"] },
  { id:"paloma-fairy", name:"Paloma - Fairy Garden", base:"Tequila", season:"Spring", color:"Pink", flavors:["Citrus", "Refreshing"], ingredients:["tequila", "grapefruit soda"], tags:["fairy garden", "fairy"] },
  { id:"whiskey-coke-fairy", name:"Whiskey & Coke - Fairy Garden", base:"Bourbon", season:"Fall", color:"Amber", flavors:["Sweet"], ingredients:["whiskey", "coke"], tags:["fairy garden"] },
  { id:"watermelon-margarita-fairy", name:"Watermelon Margarita - Fairy Garden", base:"Tequila", season:"Summer", color:"Pink", flavors:["Fruity", "Sweet", "Citrus"], ingredients:["tequila", "watermelon"], tags:["fairy garden", "watermelon"] },
  { id:"tamarindo-margarita-fairy", name:"Tamarindo Margarita - Fairy Garden", base:"Tequila", season:"Fall", color:"Amber", flavors:["Tamarind", "Spicy", "Sweet"], ingredients:["tequila", "tamarindo"], tags:["fairy garden", "tamarindo"] },
  { id:"strawberry-margarita-fairy", name:"Strawberry Margarita - Fairy Garden", base:"Tequila", season:"Summer", color:"Pink", flavors:["Fruity", "Sweet"], ingredients:["tequila", "strawberry"], tags:["fairy garden", "strawberry"] },
  { id:"cherry-blossom-tini-floral", name:"Cherry Blossom-tini - Floral", base:"Sake / Gin", season:"Spring", color:"Pink", flavors:["Floral", "Citrus"], ingredients:["sake", "gin", "cran", "lime"], tags:["floral", "cherry blossom"] },
  { id:"strawberry-mojito-floral", name:"Strawberry Mojito - Floral", base:"Rum", season:"Summer", color:"Pink", flavors:["Minty", "Fruity", "Mint", "Fresh"], ingredients:["rum", "mint", "strawberry"], tags:["floral", "mojito"] },
  { id:"paloma-floral", name:"Paloma - Floral Tile", base:"Tequila", season:"Spring", color:"Pink", flavors:["Citrus", "Refreshing"], ingredients:["tequila", "grapefruit soda"], tags:["floral", "paloma"] },
  { id:"hibiscus-spritz-floral", name:"Hibiscus Spritz - Floral", base:"Tequila", season:"Spring", color:"Red", flavors:["Floral", "Refreshing"], ingredients:["tequila", "hibiscus", "lemon"], tags:["floral", "spritz"] },
  { id:"coco-sunset-floral", name:"Coco Sunset - Floral", base:"Rum", season:"Summer", color:"Yellow", flavors:["Coconut", "Tropical", "Creamy"], ingredients:["malibu", "pineapple"], tags:["floral", "coco sunset"] },
  { id:"moscow-mule-gothic", name:"Moscow Mule - Gothic Halloween", base:"Vodka", season:"Fall", color:"Clear", flavors:["Refreshing", "Citrus", "Spicy"], ingredients:["vodka", "ginger beer", "lime"], tags:["gothic", "halloween", "mule"] },
  { id:"witches-heart-gothic", name:"Witches Heart - Gothic Halloween", base:"Tequila", season:"Fall", color:"Red", flavors:["Fruity", "Sweet", "Tart"], ingredients:["tequila", "pomegranate", "lime"], tags:["gothic", "halloween", "witches heart"] },
  { id:"paloma-gothic", name:"Paloma - Gothic Halloween", base:"Tequila", season:"Fall", color:"Pink", flavors:["Citrus", "Refreshing"], ingredients:["tequila", "grapefruit"], tags:["gothic", "halloween", "paloma"] },
  { id:"spicy-mango-margarita-gothic", name:"Spicy Mango Margarita - Gothic", base:"Tequila", season:"Fall", color:"Orange", flavors:["Spicy", "Fruity", "Tropical"], ingredients:["tequila", "mango", "jalapeno"], tags:["gothic", "halloween", "mango"] },
  { id:"ranch-water-gothic", name:"Ranch Water - Gothic Halloween", base:"Tequila", season:"Fall", color:"Clear", flavors:["Citrus", "Refreshing"], ingredients:["tequila", "lime", "topo chico"], tags:["gothic", "halloween", "ranch water"] },
  { id:"citrus-whiskey-smash-ramiro", name:"Citrus Whiskey Smash - Ramiro 50th", base:"Bourbon", season:"Spring", color:"Amber", flavors:["Citrus", "Fresh", "Refreshing"], ingredients:["bourbon", "lemon", "mint"], tags:["ramiro", "50th", "smash"] },
  { id:"pina-pepper-rita-ramiro", name:"Pina-Pepper-Rita - Ramiro 50th", base:"Tequila", season:"Summer", color:"Yellow", flavors:["Spicy", "Tropical", "Coconut"], ingredients:["tequila", "pineapple", "jalapeno"], tags:["ramiro", "50th", "pina pepper"] },
  { id:"lychee-mojito-ramiro", name:"Lychee Mojito - Ramiro 50th", base:"Rum", season:"Summer", color:"Clear", flavors:["Minty", "Fruity", "Mint", "Floral"], ingredients:["rum", "lychee", "mint"], tags:["ramiro", "50th", "lychee", "mojito"] },
  { id:"paloma-ramiro", name:"Paloma - Ramiro 50th", base:"Tequila", season:"Fall", color:"Pink", flavors:["Citrus", "Refreshing"], ingredients:["tequila", "grapefruit soda"], tags:["ramiro", "50th", "paloma"] },
  { id:"pomegranate-margarita-ramiro", name:"Pomegranate Margarita - Ramiro 50th", base:"Tequila", season:"Fall", color:"Red", flavors:["Fruity", "Tart", "Citrus"], ingredients:["tequila", "pomegranate", "lime"], tags:["ramiro", "50th", "pomegranate"] },
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
      <Text style={{ color: "#fff", fontSize: 36, fontWeight: "800", marginBottom: 4 }}>68 Menu Boards</Text>
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
