import { ScrollView, View, Text, Pressable, StyleSheet, Linking } from "react-native";

const REAL_BOARDS = [
  { id: "ezra-arcade", name: "Ezra Arcade - Pac-Man", event: "Arcade Birthday", drinks: ["Cherry Blossom-Tini: Sake Gin, Triple Sec, Cranberry, Bitters", "Citrus Whiskey Smash: Bourbon, Spearmint, Lemon", "Salted Paloma: Tequila, Watermelon, Grapefruit Soda"], colors: ["Pink", "Yellow", "Neon"], batch: "cherry-blossom-tini" },
  { id: "ramiro-50th", name: "Ramiro 50th - PEREZ", event: "50th Birthday Black & Gold", drinks: ["Citrus Whiskey Smash: Bourbon, Lemon, Mint", "Pina-Pepper-Rita: Tequila, Pineapple, Jalapeno", "Lychee Mojito: Rum, Lychee, Mint"], colors: ["Black", "Gold"], batch: "pina-pepper-rita" },
  { id: "gothic-halloween", name: "Gothic Halloween - Skulls", event: "Halloween Albert + Nicole", drinks: ["Moscow Mule: Vodka, Ginger Beer, Lime", "Witches Heart: Tequila, Pomegranate, Lime", "Spicy Mango Margarita"], colors: ["Black", "Orange", "Purple"], batch: "witches-heart" },
  { id: "fairy-garden", name: "Fairy Garden", event: "Garden Party", drinks: ["Paloma", "Whiskey & Coke", "Watermelon / Tamarindo / Strawberry Margaritas"], colors: ["Pink", "Green"], batch: "paloma" },
  { id: "floral-tile", name: "Floral Tile - Blue Blossom", event: "Floral Tile Design", drinks: ["Cherry Blossom-tini", "Strawberry Mojito", "Hibiscus Spritz", "Coco Sunset"], colors: ["Blue", "Pink"], batch: "hibiscus-spritz" },
  { id: "camilla-sweet16", name: "Camilla's Sweet 16 - Western", event: "Sweet 16 Cowboy Boots", drinks: ["Lime-Sunrise: Lime, OJ, Tequila", "Berry Temple: Berries, Lemon", "Coco-Pina: Coconut, Pineapple"], colors: ["Pink", "White"], batch: "lime-sunrise" },
  { id: "carolyn-50th", name: "Carolyn's 50th - Fiesta", event: "50th Papel Picado", drinks: ["Mangonada: Mango, Chamoy, Tajin", "Pina Colada: Rum, Coconut, Pineapple", "Cranberry Vodka"], colors: ["Pink", "Orange"], batch: "mangonada" },
  { id: "danny-21st", name: "Danny's 21st - Gold", event: "21st Black & Gold", drinks: ["Cucumber Margarita: Tequila, Cucumber, Lime", "Malibu Spritz: Malibu, Prosecco, Pineapple"], colors: ["Black", "Gold"], batch: "cucumber-margarita" },
];

export default function GalleryPage() {
  return (
    <ScrollView style={styles.bg} contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <Pressable onPress={() => Linking.openURL("/")} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Home</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL("https://barbatchbible.netlify.app")} style={styles.batchTopBtn}>
          <Text style={styles.batchTopText}>📖 Bar Batch Bible → Batch Calculator</Text>
        </Pressable>
      </View>
      <Text style={styles.h1}>Real Menu Boards Gallery</Text>
      <Text style={styles.sub}>8 real designs from Riverside & Rowland Heights — each board links directly to Bar Batch Bible to calculate batches for your guest count.</Text>
      
      <View style={styles.grid}>
        {REAL_BOARDS.map((b) => (
          <View key={b.id} style={styles.card}>
            <View style={styles.imgPlaceholder}>
              <Text style={{ fontSize: 32 }}>🍸</Text>
              <Text style={styles.imgLabel}>{b.name}</Text>
              <Text style={styles.imgHint}>{b.event}</Text>
            </View>
            <View style={{ padding: 14 }}>
              <Text style={styles.cardName}>{b.name}</Text>
              <Text style={styles.cardEvent}>{b.event.toUpperCase()}</Text>
              <View style={{ marginTop: 8, gap: 4 }}>
                {b.drinks.map((d, i) => (
                  <Text key={i} style={styles.drink}>• {d}</Text>
                ))}
              </View>
              <View style={{ flexDirection: "row", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {b.colors.map(c => (
                  <View key={c} style={styles.colorChip}><Text style={styles.colorText}>{c}</Text></View>
                ))}
              </View>
              <Pressable onPress={() => Linking.openURL(`https://barbatchbible.netlify.app/?drink=${b.batch}`)} style={styles.batchBtn}>
                <Text style={styles.batchBtnText}>📖 Calculate Batch for This Board →</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <Pressable onPress={() => Linking.openURL("https://barbatchbible.netlify.app")} style={styles.bookBtn}>
        <Text style={styles.bookText}>📖 Open Bar Batch Bible — All Calculators</Text>
      </Pressable>
      <Pressable onPress={() => Linking.openURL("/menu/")} style={styles.menuBtn}>
        <Text style={styles.menuText}>View 68 Filterable Boards →</Text>
      </Pressable>
      <Pressable onPress={() => Linking.openURL("https://ig.me/m/the_mobile_mixery_")} style={styles.igBtn}>
        <Text style={styles.igBtnText}>Book on Instagram @the_mobile_mixery_</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: "#0A0B14", flex: 1 },
  backBtn: { borderWidth: 1, borderColor: "#2a2f5a", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  backText: { color: "#A5B4FC", fontSize: 11 },
  batchTopBtn: { backgroundColor: "#F59E0B", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  batchTopText: { color: "#000", fontSize: 11, fontWeight: "800" },
  h1: { color: "#fff", fontSize: 36, fontWeight: "800", marginBottom: 8 },
  sub: { color: "#9CA3AF", fontSize: 13, lineHeight: 18, marginBottom: 20, maxWidth: 700 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  card: { backgroundColor: "#141626", borderWidth: 1, borderColor: "#22264a", borderRadius: 20, overflow: "hidden", width: 360, maxWidth: "100%" },
  imgPlaceholder: { height: 160, backgroundColor: "#1E2142", justifyContent: "center", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#22264a" },
  imgLabel: { color: "#fff", fontSize: 11, fontWeight: "700", marginTop: 8 },
  imgHint: { color: "#6B7280", fontSize: 9, marginTop: 4, textAlign: "center" },
  cardName: { color: "#fff", fontWeight: "800", fontSize: 14 },
  cardEvent: { color: "#8B5CF6", fontSize: 10, fontWeight: "700", marginTop: 4, letterSpacing: 1 },
  drink: { color: "#CBD5E1", fontSize: 11, lineHeight: 14 },
  colorChip: { backgroundColor: "#1E2142", borderWidth: 1, borderColor: "#2a2f5a", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  colorText: { color: "#A5B4FC", fontSize: 9, fontWeight: "600" },
  batchBtn: { backgroundColor: "#F59E0B", padding: 10, borderRadius: 12, alignItems: "center", marginTop: 12 },
  batchBtnText: { color: "#000", fontWeight: "800", fontSize: 11 },
  bookBtn: { backgroundColor: "#F59E0B", padding: 18, borderRadius: 999, alignItems: "center", marginTop: 28 },
  bookText: { color: "#000", fontWeight: "800" },
  menuBtn: { borderWidth: 1, borderColor: "#2a2f5a", padding: 18, borderRadius: 999, alignItems: "center", marginTop: 12 },
  menuText: { color: "#E5E7EB", fontWeight: "600" },
  igBtn: { backgroundColor: "#E1306C", padding: 18, borderRadius: 999, alignItems: "center", marginTop: 12 },
  igBtnText: { color: "#fff", fontWeight: "800" },
});
