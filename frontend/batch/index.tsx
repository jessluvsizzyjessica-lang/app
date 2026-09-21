import { useState, useRef } from "react";
import { View, Text, Pressable, ActivityIndicator, Linking, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";

// frontend/app/batch/index.tsx
// Native wrapper for Batch OS — loads themobilemixeryca.com/app/ inside your Expo app
// Works with your existing GitHub structure: frontend/ (Expo) + landing/app/index.html (web app)

const APP_URL = "https://themobilemixeryca.com/app/";
// Fallback for local dev / if custom domain not yet deployed:
const FALLBACK_URL = "/app/";

export default function BatchScreen() {
  const router = useRouter();
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [url, setUrl] = useState(APP_URL);

  return (
    <View style={styles.container}>
      {/* Header — matches your site: Bio on Tab, behind-bar, logo subtle */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Home</Text>
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>BATCH OS</Text>
          <Text style={styles.subtitle}>Inside themobilemixeryca.com • $29/mo</Text>
        </View>
        <Pressable
          onPress={() => Linking.openURL("https://buy.stripe.com/aFadR8cuLduyfn9aEv3AY0a")}
          style={styles.proBtn}
        >
          <Text style={styles.proText}>PRO $29</Text>
        </Pressable>
      </View>

      {/* WebView — loads /app/ */}
      <View style={{ flex: 1 }}>
        <WebView
          ref={webRef}
          source={{ uri: url }}
          style={{ flex: 1, backgroundColor: "#FFF9F5" }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={(nav) => setCanGoBack(nav.canGoBack)}
          // Allow Stripe checkout to open externally
          onShouldStartLoadWithRequest={(req) => {
            if (req.url.includes("stripe.com") || req.url.includes("buy.stripe")) {
              Linking.openURL(req.url);
              return false;
            }
            // Keep navigation inside /app/
            if (req.url.includes("themobilemixeryca.com/app") || req.url.startsWith(FALLBACK_URL)) {
              return true;
            }
            // Instagram / external links open in browser
            if (req.url.includes("instagram.com") || req.url.includes("ig.me")) {
              Linking.openURL(req.url);
              return false;
            }
            return true;
          }}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          allowsInlineMediaPlayback
          startInLoadingState
        />
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#C26A4A" />
            <Text style={styles.loaderText}>Loading Batch OS…{"\n"}12 recipes • Calculator • 10 syrups • 20 menus</Text>
          </View>
        )}
      </View>

      {/* Bottom bar — native controls */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => canGoBack ? webRef.current?.goBack() : router.back()}
          style={styles.bottomBtn}
        >
          <Text style={styles.bottomBtnText}>{canGoBack ? "‹ Back" : "‹ Home"}</Text>
        </Pressable>
        <Pressable onPress={() => webRef.current?.reload()} style={styles.bottomBtn}>
          <Text style={styles.bottomBtnText}>↻ Reload</Text>
        </Pressable>
        <Pressable onPress={() => setUrl(APP_URL + "?t=" + Date.now())} style={styles.bottomBtn}>
          <Text style={styles.bottomBtnText}>🪧 Menus</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL("https://ig.me/m/the_mobile_mixery_")} style={[styles.bottomBtn, styles.igBtn]}>
          <Text style={[styles.bottomBtnText, { color: "#E1306C" }]}>Book IG</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF9F5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "ios" ? 54 : 14,
    paddingBottom: 10,
    backgroundColor: "rgba(255,249,245,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#E8DDD0",
  },
  backBtn: {
    borderWidth: 1, borderColor: "#E8DDD0", backgroundColor: "#fff",
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
  },
  backText: { fontSize: 11, fontWeight: "700", color: "#8A847A" },
  title: { fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  subtitle: { fontSize: 9, color: "#8A847A", marginTop: 2 },
  proBtn: { backgroundColor: "#C26A4A", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  proText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center", alignItems: "center",
    backgroundColor: "#FFF9F5",
  },
  loaderText: { marginTop: 12, textAlign: "center", color: "#8A847A", fontSize: 11, lineHeight: 18 },
  bottomBar: {
    flexDirection: "row", justifyContent: "space-around",
    paddingVertical: 10, paddingBottom: 22,
    borderTopWidth: 1, borderTopColor: "#E8DDD0",
    backgroundColor: "#fff",
  },
  bottomBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1, borderColor: "#E8DDD0",
    backgroundColor: "#FFFCF7",
  },
  bottomBtnText: { fontSize: 11, fontWeight: "700", color: "#111" },
  igBtn: { borderColor: "#E1306C" },
});
