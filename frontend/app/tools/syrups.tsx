import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CaretRight, Hourglass } from "phosphor-react-native";

import { apiFetch } from "@/src/api";
import { usePro } from "@/src/gating";
import { ProLock } from "@/src/components/pro-lock";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

type Syrup = { id: string; name: string; color: string; base_yield_oz: number; shelf_life: string };

export default function SyrupLab() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const isPro = usePro();

  const syrupsQ = useQuery({ queryKey: ["syrups"], queryFn: () => apiFetch<Syrup[]>("/syrups") });

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topbar}>
        <Pressable testID="syrups-back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} style={styles.iconBtn}>
          <ArrowLeft size={22} color={colors.onSurface} weight="bold" />
        </Pressable>
        <Text style={styles.topTitle}>Syrup Lab</Text>
        <View style={{ width: 40 }} />
      </View>

      {!isPro ? (
        <ProLock
          title="Unlock the Syrup Lab"
          body="10 signature syrups with yields, shelf life and batch scaling — Demerara, Honey Ginger, Lavender, Jalapeño Agave and more."
        />
      ) : syrupsQ.isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.brandPrimary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 12 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.lead}>Signature syrups scaled to any batch — with yield and shelf life.</Text>
          {(syrupsQ.data ?? []).map((s) => (
            <Pressable key={s.id} testID={`syrup-${s.id}`} onPress={() => router.push(`/tools/syrup/${s.id}`)} style={styles.card}>
              <View style={[styles.swatch, { backgroundColor: s.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{s.name}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>Yields ~{s.base_yield_oz} oz</Text>
                  <View style={styles.dot} />
                  <Hourglass size={12} color={colors.muted} weight="fill" />
                  <Text style={styles.meta}>{s.shelf_life}</Text>
                </View>
              </View>
              <CaretRight size={18} color={colors.muted} weight="bold" />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 6 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  topTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 20, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  lead: { color: colors.muted, fontFamily: fonts.text, fontSize: 14, lineHeight: 20, marginBottom: 4 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border },
  swatch: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  name: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 18, fontWeight: "700" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  meta: { color: colors.muted, fontFamily: fonts.text, fontSize: 12 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.muted },
}));
