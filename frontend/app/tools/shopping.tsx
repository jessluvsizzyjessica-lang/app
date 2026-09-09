import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowLeft, ShoppingCartSimple, Check, Confetti } from "phosphor-react-native";

import { apiFetch, EventT, Recipe, resolveImage, ShoppingResult } from "@/src/api";
import { useAuth } from "@/src/auth";
import { usePro, FREE_GUEST_CAP } from "@/src/gating";
import { Button } from "@/src/components/ui";
import { useToast } from "@/src/toast";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

export default function ShoppingCalculator() {
  const params = useLocalSearchParams<{ recipeIds?: string; eventId?: string; guests?: string }>();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { show } = useToast();
  const { isAuthed } = useAuth();
  const isPro = usePro();

  const [guests, setGuests] = useState(params.guests || "50");
  const [perGuest, setPerGuest] = useState("3");
  const [selected, setSelected] = useState<string[]>(
    params.recipeIds ? params.recipeIds.split(",").filter(Boolean) : [],
  );

  const recipesQ = useQuery({ queryKey: ["recipes", "all"], queryFn: () => apiFetch<Recipe[]>("/recipes") });

  // Prefill from an event's menu (library items only)
  useQuery({
    queryKey: ["event", params.eventId, "for-shopping"],
    enabled: !!params.eventId && isAuthed,
    queryFn: async () => {
      const ev = await apiFetch<EventT>(`/events/${params.eventId}`, { auth: true });
      const ids = ev.items.map((i) => i.recipe_id).filter(Boolean) as string[];
      if (ids.length) setSelected(Array.from(new Set(ids)));
      if (ev.guest_count) setGuests(String(ev.guest_count));
      return ev;
    },
  });

  const calcM = useMutation({
    mutationFn: () =>
      apiFetch<ShoppingResult>("/tools/shopping-list", {
        method: "POST",
        body: { guests: parseInt(guests, 10) || 1, drinks_per_guest: parseFloat(perGuest) || 1, recipe_ids: selected },
      }),
    onError: (e: any) => show(e?.message || "Could not calculate", "error"),
  });

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const result = calcM.data;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topbar}>
        <Pressable testID="shopping-back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} style={styles.iconBtn}>
          <ArrowLeft size={22} color={colors.onSurface} weight="bold" />
        </Pressable>
        <Text style={styles.topTitle}>Shopping List</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }} bottomOffset={20} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>Never over-buy or run dry again. Enter your party size and pick the drinks.</Text>

        <View style={styles.rowInputs}>
          <View style={styles.half}>
            <Text style={styles.label}>Guests</Text>
            <TextInput testID="shopping-guests" value={guests} onChangeText={setGuests} keyboardType="number-pad" style={styles.input} placeholder="50" placeholderTextColor={colors.muted} />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Drinks / guest</Text>
            <TextInput testID="shopping-per-guest" value={perGuest} onChangeText={setPerGuest} keyboardType="decimal-pad" style={styles.input} placeholder="3" placeholderTextColor={colors.muted} />
          </View>
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Drinks on the menu ({selected.length})</Text>
        {recipesQ.isLoading ? (
          <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: 20 }} />
        ) : (
          <View style={{ gap: 8, marginTop: 8 }}>
            {(recipesQ.data ?? []).map((r) => {
              const on = selected.includes(r.id);
              return (
                <Pressable key={r.id} testID={`shopping-pick-${r.id}`} onPress={() => toggle(r.id)} style={[styles.pickRow, on && styles.pickRowOn]}>
                  <Image source={{ uri: resolveImage(r.image_url) }} style={styles.thumb} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickName} numberOfLines={1}>{r.name}</Text>
                    <Text style={styles.pickMeta}>{r.category} · {r.base_spirit}</Text>
                  </View>
                  <View style={[styles.checkbox, on && styles.checkboxOn]}>{on && <Check size={14} color={colors.onBrandPrimary} weight="bold" />}</View>
                </Pressable>
              );
            })}
          </View>
        )}

        <Button
          testID="shopping-calculate"
          title="Build Shopping List"
          onPress={() => {
            if (!selected.length) { show("Pick at least one drink", "info"); return; }
            if (!isPro && (parseInt(guests, 10) || 0) > FREE_GUEST_CAP) {
              show(`Free plan is capped at ${FREE_GUEST_CAP} guests`, "info");
              router.push("/paywall");
              return;
            }
            calcM.mutate();
          }}
          loading={calcM.isPending}
          icon={<ShoppingCartSimple size={20} color={colors.onBrandPrimary} weight="fill" />}
          style={{ marginTop: 16 }}
        />

        {result && (
          <Animated.View entering={FadeInDown} style={styles.results}>
            <View style={styles.summaryCard}>
              <Confetti size={24} color={colors.brandPrimary} weight="fill" />
              <Text style={styles.summaryText}>{result.total_drinks} drinks for {result.guests} guests</Text>
            </View>

            <Text style={styles.resultsTitle}>Shopping list</Text>
            {result.shopping.map((s, i) => (
              <View key={i} style={styles.itemRow} testID={`shopping-item-${i}`}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{s.name}</Text>
                  <Text style={styles.itemSub}>{s.amount_display}</Text>
                </View>
                <Text style={styles.bottles}>{s.bottles_display}</Text>
              </View>
            ))}

            {result.counts.length > 0 && (
              <>
                <Text style={styles.resultsSubTitle}>Also grab</Text>
                {result.counts.map((c, i) => (
                  <View key={i} style={styles.miniRow}>
                    <Text style={styles.itemName}>{c.name}</Text>
                    <Text style={styles.itemSub}>{c.amount_display}</Text>
                  </View>
                ))}
              </>
            )}

            {result.extras.length > 0 && (
              <View style={styles.extrasBox}>
                <Text style={styles.extrasLabel}>To taste / top up</Text>
                <Text style={styles.extrasText}>{result.extras.join(" · ")}</Text>
              </View>
            )}
          </Animated.View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 6 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  topTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 20, fontWeight: "700" },
  lead: { color: colors.muted, fontFamily: fonts.text, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  rowInputs: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  label: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: 13, fontWeight: "700", marginBottom: 6 },
  input: { height: 50, backgroundColor: colors.surfaceTertiary, borderRadius: radius.md, paddingHorizontal: 14, fontFamily: fonts.text, fontSize: 16, color: colors.onSurface },
  pickRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 10, borderWidth: 1, borderColor: colors.border },
  pickRowOn: { borderColor: colors.brandPrimary, backgroundColor: colors.brandTertiary },
  thumb: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceTertiary },
  pickName: { color: colors.onSurface, fontFamily: fonts.text, fontSize: 15, fontWeight: "700" },
  pickMeta: { color: colors.muted, fontFamily: fonts.text, fontSize: 12, marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center" },
  checkboxOn: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  results: { marginTop: 24, gap: 8 },
  summaryCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.brandTertiary, borderRadius: radius.md, padding: 16, marginBottom: 8 },
  summaryText: { color: colors.onBrandTertiary, fontFamily: fonts.display, fontSize: 18, fontWeight: "700" },
  resultsTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 22, fontWeight: "700", marginBottom: 4 },
  resultsSubTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 18, fontWeight: "700", marginTop: 12, marginBottom: 4 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  miniRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  itemName: { color: colors.onSurface, fontFamily: fonts.text, fontSize: 15, fontWeight: "700", textTransform: "capitalize" },
  itemSub: { color: colors.muted, fontFamily: fonts.text, fontSize: 12, marginTop: 2 },
  bottles: { color: colors.brandPrimary, fontFamily: fonts.text, fontSize: 13, fontWeight: "700", textAlign: "right", maxWidth: 130 },
  extrasBox: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 14, marginTop: 12, borderWidth: 1, borderColor: colors.border },
  extrasLabel: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  extrasText: { color: colors.muted, fontFamily: fonts.text, fontSize: 13, marginTop: 4, textTransform: "capitalize" },
}));
