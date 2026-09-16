
import { View, Text, ScrollView, Pressable } from "react-native";
import { Link } from "expo-router";

const boards = [
  { id: 1, name: "The Sicka Signature", tag: "BEST SELLER", price: "$14", drinks: ["Spicy Mango Marg", "Paloma Fresca", "Cucumber Cooler"] },
  { id: 2, name: "Rowland Heights Nights", tag: "TEQUILA", price: "$13", drinks: ["Classic Marg", "Strawberry Marg", "Tequila Sunrise"] },
  { id: 3, name: "Riverside Romance", tag: "WEDDING", price: "$15", drinks: ["French 75", "Espresso Martini", "Whiskey Sour"] },
  { id: 4, name: "Neon 60th", tag: "BIRTHDAY", price: "$12", drinks: ["Vodka Cran", "Mojito", "Shots Board"] },
  { id: 5, name: "Borra-guita Bonita", tag: "CUSTOM SIGNS", price: "Custom", drinks: ["Name Cocktails", "Floral Garnish", "Light-Up Letters"] },
  { id: 6, name: "Patty's Paradise", tag: "TROPICAL", price: "$13", drinks: ["Pina Colada", "Bahama Mama", "Blue Hawaiian"] },
];

export default function Menu() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0A0B14" }} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, borderBottomWidth: 1, borderBottomColor: "#1f2340" }}>
        <Link href="/" asChild>
          <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#8B5CF6" }} />
            <Text style={{ color: "#fff", fontWeight: "800", letterSpacing: 2, fontSize: 11 }}>THE MOBILE MIXERY</Text>
          </Pressable>
        </Link>
        <Link href="/" asChild>
          <Pressable style={{ borderWidth: 1, borderColor: "#2a2f5a", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#151735" }}>
            <Text style={{ color: "#E5E7EB", fontSize: 11 }}>← HOME</Text>
          </Pressable>
        </Link>
      </View>

      <View style={{ padding: 20, gap: 18, maxWidth: 1100, alignSelf: "center", width: "100%" }}>
        <View style={{ borderWidth: 1, borderColor: "#2a2f5a", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#151735" }}>
          <Text style={{ color: "#A5B4FC", fontSize: 10 }}>● 20 BOARDS • RIVERSIDE, CA • BOOK YOUR DATE</Text>
        </View>

        <Text style={{ color: "#fff", fontSize: 42, fontWeight: "800", lineHeight: 42 }}>
          Menu Boards,{"\n"}<Text style={{ fontStyle: "italic", fontWeight: "400", color: "#E9E6FF" }}>Curated for</Text>{"\n"}<Text style={{ color: "#8B5CF6" }}>Every Party.</Text>
        </Text>

        <Text style={{ color: "#94A3B8", fontSize: 12 }}>Tap a board to book — this fixes your Unmatched Route error.</Text>

        <View style={{ gap: 12, marginTop: 6 }}>
          {boards.map((board) => (
            <View key={board.id} style={{ borderRadius: 20, backgroundColor: "#141626", borderWidth: 1, borderColor: "#22264a", padding: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>{board.id}. {board.name}</Text>
                <Text style={{ color: "#8B5CF6", fontWeight: "800", fontSize: 12 }}>{board.price}</Text>
              </View>
              <View style={{ marginTop: 8, backgroundColor: "#1e1b4b", borderWidth: 1, borderColor: "#312e81", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ color: "#A5B4FC", fontSize: 9, fontWeight: "700" }}>{board.tag}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {board.drinks.map((d) => (
                  <View key={d} style={{ backgroundColor: "#0A0B14", borderWidth: 1, borderColor: "#2a2f5a", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                    <Text style={{ color: "#CBD5E1", fontSize: 11 }}>{d}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <Link href="https://ig.me/m/the_mobile_mixery_" asChild>
          <Pressable style={{ backgroundColor: "#8B5CF6", paddingHorizontal: 18, paddingVertical: 16, borderRadius: 999, alignItems: "center", marginTop: 10 }}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>Book This Menu on Instagram →</Text>
          </Pressable>
        </Link>

        <Text style={{ color: "#475569", fontSize: 10, textAlign: "center", marginTop: 4 }}>
          Full 20 boards live in your app • themobilemixeryca.com/menu • riverside, ca
        </Text>
      </View>
    </ScrollView>
  );
}
