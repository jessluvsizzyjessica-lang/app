import { ScrollView, View, Text, Pressable, StyleSheet, useWindowDimensions, Linking } from "react-native";

export default function Home() {
  const { width } = useWindowDimensions();
  const isMobile = width < 900;
  return (
    <ScrollView style={styles.bg} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.nav}>
        <Text style={styles.logo}>THE MOBILE MIXERY</Text>
        <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
          <Pressable onPress={() => Linking.openURL("/menu/")}><Text style={styles.navLink}>MENUS • 20 boards</Text></Pressable>
          <Pressable onPress={() => Linking.openURL("/app/")} style={styles.pill}><Text style={styles.pillText}>Open App →</Text></Pressable>
        </View>
      </View>
      <View style={[styles.hero, isMobile && { flexDirection: "column" }]}>
        <View style={{ flex: 1.1 }}>
          <View style={styles.badge}><Text style={styles.badgeText}>● RIVERSIDE, CA • BOOKING SPRING '26 • REAL EVENTS</Text></View>
          <Text style={styles.h1}>Cocktails,{"\n"}<Text style={styles.h1Light}>Curated.</Text>{"\n"}Bar,{"\n"}<Text style={styles.h1Purple}>Mobile.</Text></Text>
          <Text style={styles.sub}>A private bartending experience for weddings, birthdays, and late-night celebrations across Southern California. We bring the bar, the craft, and the mood — you bring the people.</Text>
          <View style={styles.ctas}>
            <Pressable onPress={() => Linking.openURL("/app/")} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>Launch App →</Text></Pressable>
            <Pressable onPress={() => Linking.openURL("/app/")} style={[styles.btnPrimary, {backgroundColor:"#C26A4A"}]}><Text style={styles.btnPrimaryText}>📱 Batch OS • $29/mo</Text></Pressable>
            <Pressable onPress={() => Linking.openURL("https://ig.me/m/the_mobile_mixery_")} style={styles.btnIg}><Text style={styles.btnIgText}>Book on Instagram</Text></Pressable>
            <Pressable onPress={() => Linking.openURL("/menu/")} style={styles.btnGhost}><Text style={styles.btnGhostText}>View 20 Menu Boards</Text></Pressable>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>© The Mobile Mixery • Instagram: @the_mobile_mixery_</Text>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  bg: { backgroundColor: "#0A0B14", flex: 1 },
  nav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#1f2340", backgroundColor: "rgba(10,11,20,0.95)" },
  logo: { color: "#fff", fontWeight: "700", letterSpacing: 3, fontSize: 12 },
  navLink: { color: "#9CA3AF", fontSize: 11, letterSpacing: 1 },
  pill: { backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  pillText: { color: "#000", fontWeight: "600", fontSize: 12 },
  badge: { borderWidth: 1, borderColor: "#2a2f5a", backgroundColor: "#151735", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, alignSelf: "flex-start", marginBottom: 12 },
  badgeText: { color: "#A5B4FC", fontSize: 10, letterSpacing: 1 },
  hero: { flexDirection: "row", maxWidth: 1280, alignSelf: "center", padding: 24, gap: 24, marginTop: 20 },
  h1: { fontSize: 64, lineHeight: 62, color: "#fff", fontWeight: "700", marginBottom: 12 },
  h1Light: { fontWeight: "400", fontStyle: "italic", color: "#E9E6FF" },
  h1Purple: { color: "#8B5CF6" },
  sub: { color: "#CBD5E1", lineHeight: 22, maxWidth: 500, marginBottom: 20, fontSize: 15 },
  ctas: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  btnPrimary: { backgroundColor: "#8B5CF6", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 },
  btnPrimaryText: { color: "#fff", fontWeight: "600" },
  btnIg: { backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: "#E1306C" },
  btnIgText: { color: "#E1306C", fontWeight: "600" },
  btnGhost: { borderWidth: 1, borderColor: "#2a2f5a", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 },
  btnGhostText: { color: "#E5E7EB", fontWeight: "500" },
  footer: { borderTopWidth: 1, borderTopColor: "#1c2040", padding: 20, flexDirection: "row", justifyContent: "space-between", marginTop: 30, flexWrap: "wrap", gap: 10 },
  footerText: { color: "#6B7280", fontSize: 11 },
});
