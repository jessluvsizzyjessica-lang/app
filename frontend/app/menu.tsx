
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { Link } from "expo-router";

const boards = [
  { id: 1, name: "The Sicka Signature", tag: "BEST SELLER", drinks: ["Spicy Mango Marg", "Paloma Fresca", "Cucumber Cooler"] },
  { id: 2, name: "Rowland Heights Nights", tag: "TEQUILA", drinks: ["Classic Marg", "Strawberry Marg", "Tequila Sunrise"] },
  { id: 3, name: "Riverside Romance", tag: "WEDDING", drinks: ["French 75", "Espresso Martini", "Whiskey Sour"] },
  { id: 4, name: "Neon 60th", tag: "BIRTHDAY", drinks: ["Vodka Cran", "Mojito", "Tequila Shots"] },
  { id: 5, name: "Borra-guita Bonita", tag: "CUSTOM SIGNS", drinks: ["Custom Name Cocktails", "Floral Garnish", "Light-Up Letters"] },
];

export default function Menu() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0A0B14" }} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Header - same as home */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, borderBottomWidth: 1, borderBottomColor: "#1f2340" }}>
        <Link href="/" asChild>
          <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#8B5CF6" }} />
            <Text style={{ color: "#fff", fontWeight: "800", letterSpacing: 2, fontSize: 11 }}>THE MOBILE MIXERY</Text>
          </Pressable>
        </Link>
        <Link href="/" asChild>
          <Pressable style={{ borderWidth: 1, borderColor: "#2a2f5a", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
            <Text style={{ color: "#E5E7EB", fontSize: 11 }}>← HOME</Text>
          </Pressable>
        </Link>
      </View>

      <View style={{ padding: 20, gap: 16, maxWidth: 1100, alignSelf: "center", width: "100%" }}>
        <View style={{ borderWidth: 1, borderColor: "#2a2f5a", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#151735" }}>
          <Text style={{ color: "#A5B4FC", fontSize: 10 }}>● 20 BOARDS • RIVERSIDE, CA • BOOK YOUR DATE</Text>
        </View>

        <Text style={{ color: "#fff", fontSize: 42, fontWeight: "800", lineHeight: 42 }}>
          Menu Boards,{"\n"}<Text style={{ fontStyle: "italic", fontWeight: "400", color: "#E9E6FF" }}>Curated for</Text>{"\n"}<Text style={{ color: "#8B5CF6" }}>Every Party.</Text>
        </Text>

        <View style={{ gap: 12, marginTop: 8 }}>
          {boards.map((board) => (
            <View key={board.id} style={{ borderRadius: 20, backgroundColor: "#141626", borderWidth: 1, borderColor: "#22264a", padding: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>{board.name}</Text>
                <View style={{ backgroundColor: "#1e1b4b", borderWidth: 1, borderColor: "#312e81", paddingHorizontal: 8, padding
