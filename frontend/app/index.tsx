import { View, Text, ScrollView, Pressable, Image, Linking } from "react-native";
import { Link } from "expo-router";

const heroUri = "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&auto=format&fit=crop";
const mojitoUri = "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&auto=format&fit=crop";
const signUri = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop";

export default function Index() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0A0B14" }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 18,
          borderBottomWidth: 1,
          borderBottomColor: "#1f2340",
          backgroundColor: "#0A0B14",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "#8B5CF6",
            }}
          />
          <Text
            style={{
              color: "#fff",
              fontWeight: "800",
              letterSpacing: 2,
              fontSize: 11,
            }}
          >
            THE MOBILE MIXERY
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Link href="/menu" asChild>
            <Pressable
              style={{
                borderWidth: 1,
                borderColor: "#2a2f5a",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#E5E7EB", fontSize: 11 }}>
                MENUS • 20 BOARDS
              </Text>
            </Pressable>
          </Link>
          <Link href="/menu" asChild>
            <Pressable
              style={{
                backgroundColor: "#fff",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#000", fontWeight: "700", fontSize: 11 }}>
                Open Menus -&gt;
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <View
        style={{
          padding: 20,
          gap: 16,
          maxWidth: 1100,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: "#2a2f5a",
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: "#151735",
          }}
        >
          <Text style={{ color: "#A5B4FC", fontSize: 10 }}>
            RIVERSIDE, CA • BOOKING SPRING 26 • REAL EVENTS
          </Text>
        </View>

        <Text
          style={{ color: "#fff", fontSize: 52, fontWeight: "800", lineHeight: 50 }}
        >
          Cocktails,
          {"\n"}
          <Text
            style={{
              fontStyle: "italic",
              fontWeight: "400",
              color: "#E9E6FF",
            }}
          >
            Curated.
          </Text>
          {"\n"}Bar,{"\n"}
          <Text style={{ color: "#8B5CF6" }}>Mobile.</Text>
        </Text>

        <Text
          style={{
            color: "#CBD5E1",
            fontSize: 14,
            lineHeight: 20,
            maxWidth: 520,
          }}
        >
          Private bartending for weddings, birthdays &amp; late-night
          celebrations across SoCal.
        </Text>

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <Link href="/menu" asChild>
            <Pressable
              style={{
                backgroundColor: "#8B5CF6",
                paddingHorizontal: 18,
                paddingVertical: 13,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Launch App →
              </Text>
            </Pressable>
          </Link>
          <Link href="/menu" asChild>
            <Pressable
              style={{
                borderWidth: 1,
                borderColor: "#2a2f5a",
                paddingHorizontal: 18,
                paddingVertical: 13,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: "#E5E7EB", fontWeight: "600" }}>
                View 20 Menu Boards
              </Text>
            </Pressable>
          </Link>
          <Pressable
            onPress={() => Linking.openURL("https://ig.me/m/the_mobile_mixery_")}
            style={{
              backgroundColor: "#fff",
              paddingHorizontal: 18,
              paddingVertical: 13,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#E1306C",
            }}
          >
            <Text style={{ color: "#E1306C", fontWeight: "700" }}>
              Book on Instagram
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            borderRadius: 22,
            overflow: "hidden",
            backgroundColor: "#141626",
            borderWidth: 1,
            borderColor: "#22264a",
          }}
        >
          <Image
            source={{ uri: heroUri }}
            style={{ width: "100%", height: 320 }}
            resizeMode="cover"
          />
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View
            style={{
              flex: 1,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#141626",
              borderWidth: 1,
              borderColor: "#22264a",
            }}
          >
            <Image
              source={{ uri: mojitoUri }}
              style={{ width: "100%", height: 150 }}
              resizeMode="cover"
            />
            <View style={{ padding: 10 }}>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                Custom Cups
              </Text>
              <Text style={{ color: "#9CA3AF", fontSize: 10 }}>
                Patty Ramirez
              </Text>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#141626",
              borderWidth: 1,
              borderColor: "#22264a",
            }}
          >
            <Image
              source={{ uri: signUri }}
              style={{ width: "100%", height: 150 }}
              resizeMode="cover"
            />
            <View style={{ padding: 10 }}>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                Custom Signs
              </Text>
              <Text style={{ color: "#9CA3AF", fontSize: 10 }}>
                Borra-guita Bonita
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
