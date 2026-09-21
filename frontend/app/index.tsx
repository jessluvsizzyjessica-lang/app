// frontend/app/_layout.tsx — Tab bar with 📱 Batch tab
// Paste this into your Expo repo at frontend/app/_layout.tsx
// Works with your existing files:
// - frontend/app/index.tsx (FIXED_INDEX_FINAL.tsx or FIXED_index_LIGHT.tsx)
// - frontend/app/menu/index.tsx (menu_index.tsx)
// - frontend/app/batch/index.tsx (batch_index.tsx — the WebView wrapper)

import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>{icon}</Text>;
}

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#C26A4A", // coral — matches Batch OS
        tabBarInactiveTintColor: "#8A847A",
        tabBarStyle: {
          backgroundColor: "#FFFCF7",
          borderTopColor: "#E8DDD0",
          borderTopWidth: 1,
          paddingBottom: 18,
          paddingTop: 8,
          height: 78,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="menu/index"
        options={{
          title: "Real Menus",
          tabBarIcon: ({ focused }) => <TabIcon icon="🪧" focused={focused} />,
          // 20 boards — your real gallery
        }}
      />
      <Tabs.Screen
        name="batch/index"
        options={{
          title: "Batch OS",
          tabBarIcon: ({ focused }) => <TabIcon icon="📱" focused={focused} />,
          // Loads themobilemixeryca.com/app/ inside WebView
          // $29/mo Stripe: https://buy.stripe.com/aFadR8cuLduyfn9aEv3AY0a
        }}
      />
      <Tabs.Screen
        name="bio"
        options={{
          title: "Bio",
          tabBarIcon: ({ focused }) => <TabIcon icon="💛" focused={focused} />,
          href: "/?tab=bio", // or create frontend/app/bio.tsx with behind-bar pics
        }}
      />
      <Tabs.Screen
        name="inquire"
        options={{
          title: "Inquire",
          tabBarIcon: ({ focused }) => <TabIcon icon="✉️" focused={focused} />,
          href: "https://ig.me/m/the_mobile_mixery_",
        }}
      />
    </Tabs>
  );
}

// --- Optional: if you don't use Expo Router Tabs yet, use this manual version ---
// Put this in frontend/components/BottomTabs.tsx and render at bottom of FIXED_INDEX_FINAL.tsx:

/*
import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";

const TABS = [
  { route: "/", label: "Home", icon: "🏠" },
  { route: "/menu/", label: "Menus", icon: "🪧" },
  { route: "/batch", label: "Batch OS", icon: "📱", highlight: true },
  { route: "/?tab=bio", label: "Bio", icon: "💛" },
];

export function BottomTabs() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 10, paddingBottom: 22, borderTopWidth: 1, borderTopColor: "#E8DDD0", backgroundColor: "#FFFCF7" }}>
      {TABS.map(t => {
        const active = pathname === t.route;
        return (
          <Pressable key={t.route} onPress={() => router.push(t.route as any)} style={{ alignItems: "center", backgroundColor: t.highlight && active ? "#C26A4A" : "transparent", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 }}>
            <Text style={{ fontSize: 20 }}>{t.icon}</Text>
            <Text style={{ fontSize: 10, fontWeight: "700", color: active ? "#C26A4A" : "#8A847A" }}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
*/
