import { View, Text, ScrollView, Pressable, Linking, TextInput, Image } from "react-native";
import { useState, useMemo } from "react";

const BOARDS = [
  { id:"french", name:"French Menu", theme:"Pink Floral Tile", colors:["Pink","White"], vibe:"Wedding", season:"Spring" },
  { id:"arcade", name:"Ezra Arcade - Pac-Man", theme:"Arcade Birthday - Cherry Blossom-tini", colors:["Pink","Yellow","Neon"], vibe:"Birthday", season:"Spring" },
  { id:"ramiro", name:"Ramiro 50th - PEREZ", theme:"50th Black & Gold", colors:["Black","Gold"], vibe:"Birthday", season:"Fall" },
  { id:"gothic", name:"Gothic Halloween - Skulls", theme:"Halloween Gothic Skulls", colors:["Black","Red"], vibe:"Halloween", season:"Fall" },
  { id:"fairy", name:"Fairy Garden", theme:"Garden Party - Pastel", colors:["Pink","Green"], vibe:"Birthday", season:"Spring" },
  { id:"camilla", name:"Camilla's Sweet 16 - Western", theme:"Sweet 16 Cowboy Boots - Lime-Sunrise", colors:["Brown","Pink"], vibe:"Birthday", season:"Summer" },
  { id:"carolyn", name:"Carolyn's 50th Fiesta", theme:"Papel Picado Fiesta - Mangonada + Paloma", colors:["Orange","Pink"], vibe:"Fiesta", season:"Summer" },
  { id:"millans", name:"The Millan's Wedding", theme:"Wedding - Open Bar Menu + Beer Menu", colors:["Gold","Black"], vibe:"Wedding", season:"Summer", real:true },
  { id:"grad", name:"Grad Rooftop - Pink & Purple", theme:"Real Client Tag @the_mobile_mixery_ - Cherry + Pineapple", colors:["Pink","Purple"], vibe:"Graduation", season:"Summer", real:true },
  { id:"patty", name:"Patty Ramirez - Custom Cups", theme:"Custom Cups In Honor Of - Mojito Station", colors:["Green","White"], vibe:"Birthday", season:"Summer" },
  { id:"borraguita", name:"Borra-guita Bonita", theme:"Whiskey Sour & Old Fashioned", colors:["Amber","Brown"], vibe:"Fiesta", season:"Fall" },
  { id:"margarita", name:"Margarita Bar", theme:"Classic Lime, Strawberry, Mango", colors:["Yellow","Pink","Orange"], vibe:"Wedding", season:"Spring" },
  { id:"mojito", name:"Mojito Station", theme:"Custom Cups In Honor Of - Mint", colors:["Green"], vibe:"Wedding", season:"Summer" },
  { id:"paloma", name:"Paloma & Cantaritos", theme:"Grapefruit Tajin Rim", colors:["Pink"], vibe:"Fiesta", season:"Summer" },
  { id:"tequila-sunrise", name:"Tequila Sunrise & Sunset", theme:"Neon 60th", colors:["Orange","Red"], vibe:"Birthday", season:"Summer" },
  { id:"horchata", name:"Spiked Horchata & RumChata", theme:"Late Night Creamy", colors:["White","Brown"], vibe:"Fiesta", season:"Fall" },
  { id:"michelada", name:"Michelada Bar", theme:"Clamato + Tajin", colors:["Red"], vibe:"Fiesta", season:"Summer" },
  { id:"pina", name:"Pina Colada & Coquito", theme:"Tropical Coconut", colors:["White","Blue"], vibe:"Tropical", season:"Summer" },
  { id:"rose", name:"Rosé & Spritz Bar", theme:"Floral Garnish - Hibiscus Spritz", colors:["Pink","Red"], vibe:"Wedding", season:"Summer" },
  { id:"bloody", name:"Bloody Mary Bar", theme:"Brunch Service", colors:["Red","Green"], vibe:"Brunch", season:"Fall" },
];

const FILTERS = ["All","Wedding","Birthday","Fiesta","Baby Shower","Halloween","Tropical","Graduation","50th","Sweet 16"];

export default function MenuPage(){
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(()=>{
    return BOARDS.filter(b=>{
      if(activeFilter!=="All" && !b.vibe.toLowerCase().includes(activeFilter.toLowerCase()) && !b.name.toLowerCase().includes(activeFilter.toLowerCase())) return false;
      if(query){
        const q=query.toLowerCase();
        const hay=[b.name,b.theme,...b.colors,b.vibe].join(" ").toLowerCase();
        if(!hay.includes(q)) return false;
      }
      return true;
    });
  }, [activeFilter, query]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F6F1E9" }} contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
      <Pressable onPress={() => Linking.openURL("/")} style={{ alignSelf: "flex-start", borderWidth: 1, borderColor: "#E8DDD0", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 16, backgroundColor:"#FFFCF7" }}>
        <Text style={{ color: "#8A847A", fontSize: 11, fontWeight:"700" }}>← Back to Home • Bio on Tab</Text>
      </Pressable>

      <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:12, marginBottom:8 }}>
        <View>
          <Text style={{ color: "#111", fontSize: 36, fontWeight: "800", marginBottom: 4 }}>Real Custom Menus — Gallery</Text>
          <Text style={{ color: "#8A847A", marginBottom: 8, fontSize:13, lineHeight:18, maxWidth:600 }}>Every board designer-designed to match theme — from floral tile to neon 60th, arcade Pac-Man, black & gold PEREZ, gothic skulls. Logo subtle in background like you loved. {filtered.length} real designs — reference my talent. Each links to Bar Batch Bible + My App.</Text>
        </View>
        <View style={{ flexDirection:"row", gap:8 }}>
        <Pressable onPress={()=>Linking.openURL("/app/")} style={{ backgroundColor:"#C26A4A", paddingHorizontal:16, paddingVertical:10, borderRadius:999 }}>
          <Text style={{ color:"#fff", fontWeight:"800", fontSize:11 }}>📱 Batch OS App</Text>
        </Pressable>
        <Pressable onPress={()=>Linking.openURL("https://barbatchbible.netlify.app")} style={{ backgroundColor:"#F5B400", paddingHorizontal:16, paddingVertical:10, borderRadius:999 }}>
          <Text style={{ color:"#000", fontWeight:"800", fontSize:11 }}>📖 Bar Batch Bible</Text>
        </Pressable>
        </View>
      </View>

      <View style={{ backgroundColor: "#FFFCF7", borderWidth: 1, borderColor: "#E8DDD0", borderRadius: 16, padding: 12, marginBottom: 16 }}>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search French, Arcade, 50th, Halloween, Pink..." placeholderTextColor="#8A847A" style={{ color: "#111", borderWidth: 1, borderColor: "#E8DDD0", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, backgroundColor:"#F6F1E9" }} />
        <Text style={{ color: "#8A847A", fontSize: 10, fontWeight: "700", marginBottom: 6, letterSpacing: 1 }}>FILTER BY VIBE</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {FILTERS.map(v=>{
            const isActive = activeFilter===v;
            return (
              <Pressable key={v} onPress={()=>setActiveFilter(v)} style={{ backgroundColor: isActive ? "#111" : "#fff", borderWidth: 1, borderColor: isActive ? "#111" : "#E8DDD0", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 }}>
                <Text style={{ color: isActive ? "#fff" : "#8A847A", fontSize: 11, fontWeight: isActive ? "700" : "500" }}>{v}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={{ color:"#8A847A", fontSize:11, marginTop:10 }}>{filtered.length} menus • Real work: Millan's wedding (behind bar), Grad rooftop (pink & purple), Polaroids</Text>
      </View>

      <View style={{ flexDirection:"row", flexWrap:"wrap", gap:14 }}>
        {filtered.map((b, i)=>(
          <View key={b.id} style={{ backgroundColor: "#FFFCF7", borderWidth: 1, borderColor: "#E8DDD0", borderRadius: 16, overflow:"hidden", width: 340, minWidth: 300, flexGrow:1 }}>
            <View style={{ height: 220, backgroundColor: "#EDE6D8", alignItems:"center", justifyContent:"center", position:"relative" }}>
              <Text style={{ fontSize: 40 }}>🪧</Text>
              <Text style={{ fontSize: 11, fontWeight:"800", marginTop:6, color:"#111" }}>{b.name}</Text>
              <Text style={{ fontSize: 9, color:"#8A847A" }}>{b.theme}</Text>
              <View style={{ position:"absolute", top:8, left:8, backgroundColor:"rgba(255,252,247,0.9)", paddingHorizontal:8, paddingVertical:4, borderRadius:999, borderWidth:1, borderColor:"#E8DDD0" }}>
                <Text style={{ fontSize:9, color:"#8A847A", fontWeight:"700" }}>{b.vibe} • {b.season}</Text>
              </View>
              {b.real && (
                <View style={{ position:"absolute", bottom:8, right:8, backgroundColor:"#F5B400", paddingHorizontal:8, paddingVertical:4, borderRadius:999 }}>
                  <Text style={{ fontSize:8, fontWeight:"800", color:"#000" }}>REAL WORK</Text>
                </View>
              )}
              <Text style={{ position:"absolute", bottom:40, opacity:0.06, fontSize:36, fontWeight:"800" }}>MIXERY</Text>
            </View>
            <View style={{ padding: 14 }}>
              <Text style={{ color: "#111", fontWeight: "700", fontSize:13 }}>{b.name}</Text>
              <Text style={{ color: "#8A847A", fontSize: 11, marginTop: 2 }}>{b.theme}</Text>
              <View style={{ flexDirection:"row", gap:6, marginTop:8, flexWrap:"wrap" }}>
                {b.colors.map(c=>(
                  <View key={c} style={{ borderWidth:1, borderColor:"#E8DDD0", borderRadius:999, paddingHorizontal:8, paddingVertical:3, backgroundColor:"#fff" }}>
                    <Text style={{ fontSize:9, color:"#8A847A" }}>{c}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection:"row", gap:8, marginTop:12 }}>
                <Pressable onPress={()=>Linking.openURL(`https://barbatchbible.netlify.app/?drink=${encodeURIComponent(b.name)}`)} style={{ backgroundColor:"#F5B400", paddingHorizontal:12, paddingVertical:8, borderRadius:999, flex:1, alignItems:"center" }}>
                  <Text style={{ fontSize:10, fontWeight:"800", color:"#000" }}>📖 Batch</Text>
                </Pressable>
                <Pressable onPress={()=>Linking.openURL("/app/")} style={{ backgroundColor:"#111", paddingHorizontal:12, paddingVertical:8, borderRadius:999, flex:1, alignItems:"center" }}>
                  <Text style={{ fontSize:10, fontWeight:"700", color:"#fff" }}>View →</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>

      <Pressable onPress={() => Linking.openURL("https://ig.me/m/the_mobile_mixery_")} style={{ backgroundColor: "#E1306C", padding: 18, borderRadius: 999, alignItems: "center", marginTop: 28 }}>
        <Text style={{ color: "#fff", fontWeight: "800" }}>Book on Instagram - @the_mobile_mixery_ • Real Menus Gallery Fixed</Text>
      </Pressable>
      <Pressable onPress={() => Linking.openURL("/")} style={{ borderWidth: 1, borderColor: "#E8DDD0", padding: 16, borderRadius: 999, alignItems: "center", marginTop: 12, backgroundColor:"#FFFCF7" }}>
        <Text style={{ color: "#8A847A" }}>← Back to Home — Bio on Tab • Logo Subtle</Text>
      </Pressable>
    </ScrollView>
  );
}
