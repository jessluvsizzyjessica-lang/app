import { View, Text, ScrollView, Pressable, Linking } from "react-native";

export default function MenuPage() {
  const boards = [
    "Margarita Bar — Classic Lime, Strawberry, Mango, Spicy",
    "Mojito Station — Custom Cups 'In Honor Of' + Floral",
    "Paloma & Cantaritos — Grapefruit, Tajin Rim, Clay Cup",
    "Whiskey Sour & Old Fashioned — Borra-guita Bonita",
    "Tequila Sunrise & Sunset — Neon 60th Birthday",
    "Spiked Horchata & RumChata — Late Night Creamy",
    "Michelada Bar — Clamato + Tajin + Chamoy",
    "Pina Colada & Coquito — Tropical Coconut",
    "Rosé & Spritz Bar — Aperol, Floral Garnish",
    "Bloody Mary Bar — Brunch Service",
    "Gin & Tonic Bar — Cucumber, Botanicals",
    "Vodka Lemonade — Custom Sign",
    "Mezcal Cocktails — Smoky + Citrus",
    "Non-Alcoholic — Agua Frescas, Mocktails",
    "Shots & Shooters — Birthday Lineup",
    "Champagne Toast — Custom Cups",
    "Coffee Bar — Espresso Martinis",
    "Sangria Station — Red & White",
    "Seasonal Specials — Fall / Winter",
    "Full PDF — Ask for detailed menu with prices",
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0A0B14" }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Pressable onPress={() => Linking.openURL("/")} style={{ alignSelf: "flex-start", borderWidth: 1, borderColor: "#2a2f5a", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 16 }}>
        <Text style={{ color: "#A5B4FC", fontSize: 11 }}>← Back to Home</Text>
      </Pressable>
      <Text style={{ color: "#fff", fontSize: 36, fontWeight: "800", marginBottom: 8 }}>20 Menu Boards</Text>
      <Text style={{ color: "#9CA3AF", marginBottom: 20, lineHeight: 18 }}>Real events from Riverside & Rowland Heights. Tap Book to DM @the_mobile_mixery_</Text>
      {boards.map((b, i) => (
        <View key={i} style={{ backgroundColor: "#141626", borderWidth: 1, borderColor: "#22264a", borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "600", flex: 1, paddingRight: 10 }}>{i+1}. {b}</Text>
          <Text style={{ color: "#8B5CF6", fontSize: 10, fontWeight: "700" }}>BOARD {i+1}</Text>
        </View>
      ))}
      <Pressable onPress={() => Linking.openURL("https://ig.me/m/the_mobile_mixery_")} style={{ backgroundColor: "#E1306C", padding: 18, borderRadius: 999, alignItems: "center", marginTop: 24 }}>
        <Text style={{ color: "#fff", fontWeight: "800" }}>Book on Instagram → @the_mobile_mixery_</Text>
      </Pressable>
      <Pressable onPress={() => Linking.openURL("/")} style={{ borderWidth: 1, borderColor: "#2a2f5a", padding: 16, borderRadius: 999, alignItems: "center", marginTop: 12 }}>
        <Text style={{ color: "#E5E7EB", fontWeight: "600" }}>Back to Cocktails, Curated.</Text>
      </Pressable>
    </ScrollView>
  );
}
