import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowLeft, Flask, Drop, Snowflake, ListChecks } from "phosphor-react-native";

import { apiFetch, BatchResult, Recipe, resolveImage } from "@/src/api";
import { usePro, FREE_GUEST_CAP } from "@/src/gating";
import { Button } from "@/src/components/ui";
import { useToast } from "@/src/toast";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

const QUICK = [
  { label: "12 guests", servings: 12 },
  { label: "1 gal · 21", servings: 21 },
  { label: "25 guests", servings: 25 },
  { label: "3 gal · 63", servings: 63 },
  { label: "100 guests", servings: 100 },
];

export default function BatchGuide() {
  const params = useLocalSearchParams<{ recipeId?: string }>();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { show } = useToast();
  const isPro = usePro();

  const [recipeId, setRecipeId] = useState<string | undefined>(params.recipeId);
  const [servings, setServings] = useState("21");

  const recipesQ = useQuery({ queryKey: ["recipes", "all"], queryFn: () => apiFetch<Recipe[]>("/recipes") });
  const selectedRecipe = (recipesQ.data ?? []).find((r) => r.id === recipeId);

  const batchM = useMutation({
    mutationFn: () =>
      apiFetch<BatchResult>("/tools/batch", {
        method: "POST",
        body: { recipe_id: recipeId, servings: parseInt(servings, 10) || 1 },
      }),
    onError: (e: any) => show(e?.message || "Could not calculate", "error"),
  });

  const result = batchM.data;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topbar}>
        <Pressable testID="batch-back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} style={styles.iconBtn}>
          <ArrowLeft size={22} color={colors.onSurface} weight="bold" />
        </Pressable>
        <Text style={styles.topTitle}>Batch Guide</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }} bottomOffset={20} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>Scale any cocktail to a big-batch dispenser with exact bottles, dilution and pours.</Text>

        <Text style={styles.label}>Pick a cocktail</Text>
        {recipesQ.isLoading ? (
          <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: 16 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 8 }}>
            {(recipesQ.data ?? []).map((r) => {
              const on = r.id === recipeId;
              return (
                <Pressable key={r.id} testID={`batch-recipe-${r.id}`} onPress={() => setRecipeId(r.id)} style={[styles.recipeChip, on && styles.recipeChipOn]}>
                  <Image source={{ uri: resolveImage(r.image_url) }} style={styles.chipImg} contentFit="cover" />
                  <Text style={[styles.chipName, on && styles.chipNameOn]} numberOfLines={1}>{r.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <Text style={[styles.label, { marginTop: 16 }]}>Batch size (servings)</Text>
        <TextInput testID="batch-servings" value={servings} onChangeText={setServings} keyboardType="number-pad" style={styles.input} placeholder="21" placeholderTextColor={colors.muted} />
        <View style={styles.quickRow}>
          {QUICK.map((q) => (
            <Pressable key={q.label} testID={`batch-quick-${q.servings}`} onPress={() => setServings(String(q.servings))} style={[styles.quickChip, parseInt(servings, 10) === q.servings && styles.quickChipOn]}>
              <Text style={[styles.quickText, parseInt(servings, 10) === q.servings && styles.quickTextOn]}>{q.label}</Text>
            </Pressable>
          ))}
        </View>

        <Button
          testID="batch-calculate"
          title={selectedRecipe ? `Batch ${selectedRecipe.name}` : "Batch it"}
          onPress={() => {
            if (!recipeId) { show("Pick a cocktail first", "info"); return; }
            if (!isPro && (parseInt(servings, 10) || 0) > FREE_GUEST_CAP) {
              show(`Free plan is capped at ${FREE_GUEST_CAP} servings`, "info");
              router.push("/paywall");
              return;
            }
            batchM.mutate();
          }}
          loading={batchM.isPending}
          icon={<Flask size={20} color={colors.onBrandPrimary} weight="fill" />}
          style={{ marginTop: 16 }}
        />

        {result && (
          <Animated.View entering={FadeInDown} style={styles.results}>
            <Text style={styles.resultsTitle}>{result.name}</Text>
            <View style={styles.metricRow}>
              <Metric label="Servings" value={String(result.pours)} />
              <Metric label="Total volume" value={`${result.gallons} gal`} />
              <Metric label="Dilution" value={`${result.dilution_oz} oz`} />
            </View>

            <View style={styles.containerCard}>
              <Snowflake size={20} color={colors.brandPrimary} weight="fill" />
              <Text style={styles.containerText}>{result.container}</Text>
            </View>

            <Text style={styles.resultsSubTitle}>Build ({result.servings} servings)</Text>
            {result.ingredients.map((row, i) => (
              <View key={i} style={styles.itemRow} testID={`batch-ing-${i}`}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{row.name}</Text>
                  <Text style={styles.itemSub}>{row.per_serving} each · {row.amount_display}</Text>
                </View>
                {!!row.bottles_display && <Text style={styles.bottles}>{row.bottles_display}</Text>}
              </View>
            ))}

            <View style={styles.dilutionCard}>
              <Drop size={20} color={colors.info} weight="fill" />
              <Text style={styles.dilutionText}>Add ~{result.dilution_oz} oz water · total batch {result.batch_volume_display}</Text>
            </View>

            <Text style={styles.resultsSubTitle}>Pro tips</Text>
            {result.notes.map((n, i) => (
              <View key={i} style={styles.noteRow}>
                <ListChecks size={18} color={colors.brandPrimary} weight="bold" />
                <Text style={styles.noteText}>{n}</Text>
              </View>
            ))}
          </Animated.View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 6 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  topTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 20, fontWeight: "700" },
  lead: { color: colors.muted, fontFamily: fonts.text, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  label: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: 13, fontWeight: "700" },
  input: { height: 50, backgroundColor: colors.surfaceTertiary, borderRadius: radius.md, paddingHorizontal: 14, fontFamily: fonts.text, fontSize: 16, color: colors.onSurface, marginTop: 8 },
  recipeChip: { width: 120, borderRadius: radius.md, overflow: "hidden", borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
  recipeChipOn: { borderColor: colors.brandPrimary },
  chipImg: { width: "100%", height: 80, backgroundColor: colors.surfaceTertiary },
  chipName: { color: colors.onSurface, fontFamily: fonts.text, fontSize: 13, fontWeight: "700", padding: 8 },
  chipNameOn: { color: colors.brandPrimary },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  quickChip: { height: 36, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  quickChipOn: { backgroundColor: colors.brandPrimary },
  quickText: { color: colors.onSurfaceTertiary, fontFamily: fonts.text, fontSize: 13, fontWeight: "600" },
  quickTextOn: { color: colors.onBrandPrimary },
  results: { marginTop: 24 },
  resultsTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 26, fontWeight: "700", marginBottom: 12 },
  resultsSubTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 18, fontWeight: "700", marginTop: 16, marginBottom: 4 },
  metricRow: { flexDirection: "row", gap: 10 },
  metric: { flex: 1, backgroundColor: colors.brandTertiary, borderRadius: radius.md, padding: 14, alignItems: "center" },
  metricValue: { color: colors.onBrandTertiary, fontFamily: fonts.display, fontSize: 20, fontWeight: "700" },
  metricLabel: { color: colors.onBrandTertiary, fontFamily: fonts.text, fontSize: 11, fontWeight: "600", marginTop: 2, opacity: 0.8 },
  containerCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 14, marginTop: 10, borderWidth: 1, borderColor: colors.border },
  containerText: { color: colors.onSurface, fontFamily: fonts.text, fontSize: 15, fontWeight: "700", flex: 1 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  itemName: { color: colors.onSurface, fontFamily: fonts.text, fontSize: 15, fontWeight: "700", textTransform: "capitalize" },
  itemSub: { color: colors.muted, fontFamily: fonts.text, fontSize: 12, marginTop: 2 },
  bottles: { color: colors.brandPrimary, fontFamily: fonts.text, fontSize: 13, fontWeight: "700", textAlign: "right", maxWidth: 120 },
  dilutionCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#EFF6FF", borderRadius: radius.md, padding: 14, marginTop: 12 },
  dilutionText: { color: colors.info, fontFamily: fonts.text, fontSize: 13, fontWeight: "600", flex: 1 },
  noteRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", paddingVertical: 6 },
  noteText: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: 13, lineHeight: 19, flex: 1 },
}));
