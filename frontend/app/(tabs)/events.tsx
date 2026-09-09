import React from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { CalendarStar, Plus, Martini, Wine } from "phosphor-react-native";

import { apiFetch, EventT } from "@/src/api";
import { Button } from "@/src/components/ui";
import { useAuth } from "@/src/auth";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

export default function Events() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { isAuthed } = useAuth();
  const router = useRouter();

  const eventsQ = useQuery({
    queryKey: ["events"],
    queryFn: () => apiFetch<EventT[]>("/events", { auth: true }),
    enabled: isAuthed,
  });

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthed) eventsQ.refetch();
    }, [isAuthed]),
  );

  if (!isAuthed) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
        </View>
        <View style={styles.gate}>
          <View style={styles.gateIcon}>
            <CalendarStar size={40} color={colors.brandPrimary} weight="fill" />
          </View>
          <Text style={styles.gateTitle}>Build & save event menus</Text>
          <Text style={styles.gateSub}>Log in to create custom drink menus for each event and save them to your account.</Text>
          <Button testID="events-login" title="Log In / Sign Up" onPress={() => router.push("/auth")} style={{ marginTop: 20, alignSelf: "stretch" }} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>PLAN YOUR EVENTS</Text>
        <Text style={styles.title}>Events</Text>
      </View>

      {eventsQ.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      ) : (
        <FlatList
          testID="events-list"
          data={eventsQ.data ?? []}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100, gap: 14 }}
          renderItem={({ item }) => {
            const cocktails = item.items.filter((i) => i.category === "Cocktails").length;
            const others = item.items.length - cocktails;
            return (
              <Pressable testID={`event-card-${item.id}`} onPress={() => router.push(`/event/${item.id}`)} style={styles.card}>
                <LinearGradient colors={[colors.brandPrimary, colors.brandSecondary]} style={styles.cardAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <CalendarStar size={26} color="#FFFFFF" weight="fill" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                  {!!item.vibe && <Text style={styles.cardVibe} numberOfLines={1}>{item.vibe}{item.guest_count ? ` · ${item.guest_count} guests` : ""}</Text>}
                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Martini size={14} color={colors.brandPrimary} weight="fill" />
                      <Text style={styles.statText}>{cocktails} cocktails</Text>
                    </View>
                    <View style={styles.stat}>
                      <Wine size={14} color={colors.brandSecondary} weight="fill" />
                      <Text style={styles.statText}>{others} more</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.gateIcon}>
                <Martini size={40} color={colors.brandPrimary} weight="fill" />
              </View>
              <Text style={styles.gateTitle}>No events yet</Text>
              <Text style={styles.gateSub}>Start planning your next event menu.</Text>
            </View>
          }
        />
      )}

      <Pressable testID="create-event-fab" style={[styles.fab, { bottom: insets.bottom + 16 }]} onPress={() => router.push("/event/new")}>
        <Plus size={24} color={colors.onBrandPrimary} weight="bold" />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  eyebrow: { color: colors.brandPrimary, fontFamily: fonts.text, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 34, fontWeight: "700", marginTop: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  gate: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  gateIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.brandTertiary, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  gateTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 24, fontWeight: "700", textAlign: "center" },
  gateSub: { color: colors.muted, fontFamily: fonts.text, fontSize: 14, textAlign: "center", marginTop: 6, lineHeight: 20 },
  emptyBox: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border },
  cardAccent: { width: 56, height: 56, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  cardName: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 20, fontWeight: "700" },
  cardVibe: { color: colors.muted, fontFamily: fonts.text, fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 14, marginTop: 8 },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { color: colors.onSurfaceTertiary, fontFamily: fonts.text, fontSize: 12, fontWeight: "600" },
  fab: {
    position: "absolute",
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.brandPrimary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
}));
