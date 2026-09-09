import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowLeft, Hourglass, Drop } from "phosphor-react-native";

import { apiFetch } from "@/src/api";
import { usePro } from "@/src/gating";
import { ProLock } from "@/src/components/pro-lock";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

type ScaledSyrup = {
  id: string;
  name: string;
  multiplier: number;
  yield_oz: number;
  yield_display: string;
  shelf_life: string;
  ingredients: { name: string; amount_display: string }[];
  steps: string[];
  tip: string;
};

const MULTIPLIERS = [1, 2, 4];

export default function SyrupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const isPro = usePro();
  const [mult, setMult] = useState(1);

  const scaleM = useMutation({
    mutationFn: (m: number) => apiFetch<ScaledSyrup>("/tools/syrup-scale", { method: "POST", body: { syrup_id: id, multiplier: m } }),
  });

  // Load 1x on first render.
  React.useEffect(() => {
    if (isPro) scaleM.mutate(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const data = scaleM.data;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topbar}>
        <Pressable testID="syrup-back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/tools/syrups"))} style={styles.iconBtn}>
          <ArrowLeft size={22} color={colors.onSurface} weight="bold" />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>{data?.name || "Syrup"}</Text>
        <View style={{ width: 40 }} />
      </View>

      {!isPro ? (
        <ProLock title="Unlock the Syrup Lab" body="Subscribe to Mixery Pro to view and scale every signature syrup recipe." />
      ) : !data ? (
        <View style={styles.center}><ActivityIndicator color={colors.brandPrimary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{data.name}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Drop size={14} color={colors.brandPrimary} weight="fill" /><Text style={styles.badgeText}>Yields {data.yield_display}</Text></View>
            <View style={styles.badge}><Hourglass size={14} color={colors.brandPrimary} weight="fill" /><Text style={styles.badgeText}>{data.shelf_life}</Text></View>
          </View>

          <Text style={styles.label}>Batch size</Text>
          <View style={styles.multRow}>
            {MULTIPLIERS.map((m) => (
              <Pressable key={m} testID={`syrup-mult-${m}`} onPress={() => { setMult(m); scaleM.mutate(m); }} style={[styles.multChip, mult === m && styles.multChipOn]}>
                <Text style={[styles.multText, mult === m && styles.multTextOn]}>{m}×</Text>
              </Pressable>
            ))}
          </View>

          <Animated.View key={data.multiplier} entering={FadeInDown}>
            <Text style={styles.section}>Ingredients</Text>
            {data.ingredients.map((ing, i) => (
              <View key={i} style={styles.ingRow} testID={`syrup-ing-${i}`}>
                <Text style={styles.ingName}>{ing.name}</Text>
                <Text style={styles.ingAmt}>{ing.amount_display}</Text>
              </View>
            ))}

            <Text style={styles.section}>Method</Text>
            {data.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}

            <View style={styles.tipBox}>
              <Text style={styles.tipLabel}>PRO TIP</Text>
              <Text style={styles.tipText}>{data.tip}</Text>
            </View>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 6 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  topTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 18, fontWeight: "700", flex: 1, textAlign: "center", marginHorizontal: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 28, fontWeight: "700" },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.brandTertiary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  badgeText: { color: colors.onBrandTertiary, fontFamily: fonts.text, fontSize: 12, fontWeight: "700" },
  label: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: 13, fontWeight: "700", marginTop: 20, marginBottom: 8 },
  multRow: { flexDirection: "row", gap: 8 },
  multChip: { flex: 1, height: 48, borderRadius: radius.md, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  multChipOn: { backgroundColor: colors.brandPrimary },
  multText: { color: colors.onSurfaceTertiary, fontFamily: fonts.display, fontSize: 18, fontWeight: "700" },
  multTextOn: { color: colors.onBrandPrimary },
  section: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 20, fontWeight: "700", marginTop: 20, marginBottom: 8 },
  ingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  ingName: { color: colors.onSurface, fontFamily: fonts.text, fontSize: 15, fontWeight: "700", textTransform: "capitalize" },
  ingAmt: { color: colors.brandPrimary, fontFamily: fonts.text, fontSize: 15, fontWeight: "700" },
  stepRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", paddingVertical: 6 },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  stepNumText: { color: colors.onBrandPrimary, fontFamily: fonts.text, fontSize: 13, fontWeight: "800" },
  stepText: { color: colors.onSurface, fontFamily: fonts.text, fontSize: 15, flex: 1, lineHeight: 22 },
  tipBox: { backgroundColor: colors.brandTertiary, borderRadius: radius.md, padding: 14, marginTop: 20 },
  tipLabel: { color: colors.onBrandTertiary, fontFamily: fonts.text, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  tipText: { color: colors.onBrandTertiary, fontFamily: fonts.text, fontSize: 14, marginTop: 4, lineHeight: 20 },
}));
