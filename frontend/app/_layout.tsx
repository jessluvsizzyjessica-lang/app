import { Stack } from "expo-router";
import { View } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/src/query-client";
import { AuthProvider } from "@/src/auth";
import { ToastProvider } from "@/src/toast";
import { SubscriptionProvider } from "@/src/revenuecat";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <SubscriptionProvider>
            <View style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
              </Stack>
            </View>
          </SubscriptionProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
