import { View, Text, ScrollView, Pressable, Linking } from "react-native";

export default function MenuPage() {
  const boards = [
    "Margarita Bar - Classic Lime, Strawberry, Mango",
    "Mojito Station - Custom Cups 'In Honor Of'",
    "Paloma & Cantaritos - Grapefruit Tajin Rim",
    "Whiskey Sour & Old Fashioned - Borra-guita Bonita",
    "Tequila Sunrise & Sunset - Neon 60th",
    "Spiked Horchata & RumChata - Late Night",
    "Michelada Bar - Clamato + Tajin",
    "Pina Colada & Coquito - Tropical",
    "Rosé & Spritz Bar - Floral Garnish",
    "Bloody Mary Bar - Brunch Service",
    "20 More - Ask for Full PDF",
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0A0B14", padding: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800", marginBottom: 8 }}>20 Menu Boards</Text>
      <Text style={{ color: "#9CA3AF", marginBottom: 20 }}>Tap to book on Instagram — real events from Riverside & Rowland Heights</Text>
      {boards.map((b, i) => (
        <View key={i} style={{ backgroundColor: "#141626", borderWidth: 1, borderColor: "#22264a", borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>{i+1}. {b}</Text>
        </View>
      ))}
      <Pressable onPress={() => Linking.openURL("https://ig.me/m/the_mobile_mixery_")} style={{ backgroundColor: "#E1306C", padding: 16, borderRadius: 999, alignItems: "center", marginTop: 20 }}>
        <Text style={{ color: "#fff", fontWeight: "800" }}>Book on Instagram @the_mobile_mixery_</Text>
      </Pressable>
      <Pressable onPress={() => Linking.openURL("https://themobilemixeryca.com")} style={{ borderWidth: 1, borderColor: "#2a2f5a", padding: 16, borderRadius: 999, alignItems: "center", marginTop: 12 }}>
        <Text style={{ color: "#E5E7EB" }}>← Back to Home</Text>
      </Pressable>
    </ScrollView>
  );
}
