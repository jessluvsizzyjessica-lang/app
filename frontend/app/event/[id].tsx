import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Share, Text, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { ArrowLeft, Plus, TrashSimple, ShareNetwork } from "phosphor-react-native";

import { apiFetch, EventT, Recipe, resolveImage } from "@/src/api";
import { Button } from "@/src/components/ui";
import { useToast } from "@/src/toast";
import { queryClient } from "@/src/query-client";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

const CATS = ["All", "Cocktails", "Mocktails", "Wine/Beer"];

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { show } = useToast();
  const [cat, setCat] = useState("All");
  const sheetRef = useRef<BottomSheet>(null);

  const eventQ = useQuery({ queryKey: ["event", id], queryFn: () => apiFetch<EventT>(`/events/${id}`, { auth: true }) });
  const recipesQ = useQuery({ queryKey: ["recipes", "all-for-picker"], queryFn: () => apiFetch<Recipe[]>("/recipes") });

  const addM = useMutation({
    mutationFn: (r: Recipe) =>
      apiFetch(`/events/${id}/items`, {
        method: "POST",
        auth: true,
        body: { recipe_id: r.id, name: r.name, category: r.category, image_url: r.image_url, garnish: r.garnish },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      show("Added to menu", "success");
    },
    onError: (e: any) => show(e?.message || "Failed", "error"),
  });

  const removeM = useMutation({
    mutationFn: (itemId: string) => apiFetch(`/events/${id}/items/${itemId}`, { method: "DELETE", auth: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (e: any) => show(e?.message || "Failed", "error"),
  });

  const deleteM = useMutation({
    mutationFn: () => apiFetch(`/events/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      show("Event deleted", "success");
      router.back();
    },
  });

  const ev = eventQ.data;
  const filtered = useMemo(() => {
    if (!ev) return [];
    if (cat === "All") return ev.items;
    return ev.items.filter((i) => i.category === cat);
  }, [ev, cat]);

  const shareMenu = useCallback(async () => {
    if (!ev) return;
    const lines = [`🍸 ${ev.name}${ev.vibe ? ` — ${ev.vibe}` : ""}`, ""];
    ev.items.forEach((i) => lines.push(`• ${i.name}${i.garnish ? ` (${i.garnish})` : ""}`));
    lines.push("", "Booking: www.themobilemixeryca.com");
    try {
      await Share.share({ message: lines.join("\n") });
    } catch {}
  }, [ev]);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />,
    [],
  );

  if (eventQ.isLoading) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }
  if (!ev) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.muted}>Event not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topbar}>
        <Pressable testID="event-back" onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={22} color={colors.onSurface} weight="bold" />
        </Pressable>
        <Pressable testID="delete-event" onPress={() => deleteM.mutate()} style={styles.iconBtn}>
          <TrashSimple size={20} color={colors.error} weight="bold" />
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>{ev.name}</Text>
        {(!!ev.vibe || !!ev.guest_count) && (
          <Text style={styles.sub}>
            {[ev.vibe, ev.guest_count ? `${ev.guest_count} guests` : null, ev.date].filter(Boolean).join(" · ")}
          </Text>
        )}
        {!!ev.notes && <Text style={styles.notes}>{ev.notes}</Text>}
      </View>

      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {CATS.map((c) => {
            const active = c === cat;
            return (
              <Pressable key={c} testID={`event-cat-${c}`} onPress={() => setCat(c)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 180, gap: 12 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.muted}>No drinks in this category yet. Tap “Add Drinks” to build your menu.</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <View key={item.item_id} style={styles.itemRow} testID={`menu-item-${item.item_id}`}>
              <Image source={{ uri: resolveImage(item.image_url) }} style={styles.thumb} contentFit="cover" transition={200} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemMeta} numberOfLines={1}>{item.category}{item.garnish ? ` · ${item.garnish}` : ""}</Text>
              </View>
              <Pressable testID={`remove-item-${item.item_id}`} onPress={() => item.item_id && removeM.mutate(item.item_id)} hitSlop={10}>
                <TrashSimple size={20} color={colors.muted} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={{ flex: 1 }}>
          <Button testID="add-drinks-button" title="Add Drinks" variant="secondary" onPress={() => sheetRef.current?.expand()} icon={<Plus size={20} color={colors.onBrandTertiary} weight="bold" />} />
        </View>
        <View style={{ flex: 1 }}>
          <Button testID="share-menu-button" title="Share Menu" onPress={shareMenu} icon={<ShareNetwork size={20} color={colors.onBrandPrimary} weight="fill" />} />
        </View>
      </View>

      <BottomSheet ref={sheetRef} index={-1} snapPoints={["75%"]} enablePanDownToClose backdropComponent={renderBackdrop} backgroundStyle={{ backgroundColor: colors.surface }}>
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>Add drinks from library</Text>
        </View>
        <BottomSheetFlatList
          data={recipesQ.data ?? []}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <Pressable testID={`picker-recipe-${item.id}`} style={styles.pickRow} onPress={() => addM.mutate(item)}>
              <Image source={{ uri: resolveImage(item.image_url) }} style={styles.thumbSm} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.category} · {item.base_spirit}</Text>
              </View>
              <Plus size={20} color={colors.brandPrimary} weight="bold" />
            </Pressable>
          )}
        />
      </BottomSheet>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  center: { alignItems: "center", justifyContent: "center" },
  muted: { color: colors.muted, fontFamily: fonts.text, fontSize: 14, textAlign: "center" },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 16, paddingTop: 4 },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 30, fontWeight: "700" },
  sub: { color: colors.brandPrimary, fontFamily: fonts.text, fontSize: 13, fontWeight: "600", marginTop: 4 },
  notes: { color: colors.muted, fontFamily: fonts.text, fontSize: 13, marginTop: 6, lineHeight: 19 },
  chipsWrap: { height: 56, justifyContent: "center" },
  chipsRow: { gap: 8, paddingHorizontal: 16 },
  chip: { height: 36, flexShrink: 0, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  chipActive: { backgroundColor: colors.brandPrimary },
  chipText: { color: colors.onSurfaceTertiary, fontFamily: fonts.text, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: colors.onBrandPrimary },
  emptyBox: { paddingTop: 40, paddingHorizontal: 24 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 10, borderWidth: 1, borderColor: colors.border },
  thumb: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: colors.surfaceTertiary },
  thumbSm: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.surfaceTertiary },
  itemName: { color: colors.onSurface, fontFamily: fonts.text, fontSize: 15, fontWeight: "700" },
  itemMeta: { color: colors.muted, fontFamily: fonts.text, fontSize: 12, marginTop: 2 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  sheetHead: { paddingHorizontal: 16, paddingBottom: 8 },
  sheetTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 22, fontWeight: "700" },
  pickRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 10, borderWidth: 1, borderColor: colors.border },
}));
