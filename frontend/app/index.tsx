import { View, Text, ScrollView, Pressable, Image, Linking } from "react-native";
import { Link } from "expo-router";

const heroUri = "data:image/jpeg;base64,[PASTE_YOUR_LONG_HERO_BASE64_STRING_HERE]";
const mojitoUri = "data:image/jpeg;base64,[PASTE_YOUR_LONG_MOJITO_BASE64_STRING_HERE]";
const signUri = "data:image/jpeg;base64,[PASTE_YOUR_LONG_SIGN_BASE64_STRING_HERE]";

export default function Index() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0A0B14" }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* TOP NAV */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, borderBottomWidth: 1, borderBottomColor: "#1f2340", backgroundColor: "#0A0B14" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#8B5CF6" }} />
          <Text style={{ color: "#fff", fontWeight: "800", letterSpacing: 2, fontSize: 11 }}>THE MOBILE MIXERY</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Link href="/menu" asChild>
            <Pressable style={{ borderWidth: 1, borderColor: "#2a2f5a", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
              <Text style={{ color: "#E5E7EB", fontSize: 11 }}>MENUS • 20 BOARDS</Text>
            </Pressable>
          </Link>
          <Link href="/menu" asChild>
            <Pressable style={{ backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}>
              <Text style={{ color: "#000", fontWeight: "700", fontSize: 11 }}>Open Menus -></Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {/* HERO */}
      <View style={{ padding: 20, gap: 16, maxWidth: 1100, alignSelf: "center", width: "100%" }}>
        <View style={{ borderWidth: 1, borderColor: "#2a2f5a", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#151735" }}>
          <Text style={{ color: "#A5B4FC", fontSize: 10 }}>● RIVERSIDE, CA • BOOKING SPRING '26 • REAL EVENTS</Text>
        </View>
        <Text style={{ color: "#fff", fontSize: 52, fontWeight: "800", lineHeight: 50 }}>
          Cocktails,{"\n"}<Text style={{ fontStyle:
