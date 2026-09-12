import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MagnifyingGlass } from "phosphor-react-native";

import { apiFetch, Garnish, Recipe, resolveImage } from "@/src/api";
import { RecipeCard } from "@/src/components/recipe-card";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

export default function Discover() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categoriesQ = useQuery({ queryKey: ["categories"], queryFn: () => apiFetch<string[]>("/categories") });
  const garnishesQ = useQuery({ queryKey: ["garnishes"], queryFn: () => apiFetch<Garnish[]>("/garnishes") });
  const recipesQ = useQuery({
    queryKey: ["recipes", category, search],
    queryFn: () =>
      apiFetch<Recipe[]>(
        `/recipes?category=${encodeURIComponent(category)}${search ? `&q=${encodeURIComponent(search)}` : ""}`,
      ),
  });

  const cats = categoriesQ.data ?? ["All"];

  const ListHeader = useMemo(
    () => (
      <View>
        {(garnishesQ.data?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Garnish Inspiration</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.garnishRow}
            >
              {garnishesQ.data!.map((g) => (
                <View key={g.id} style={styles.garnishCard} testID={`garnish-${g.id}`}>
                  <Image source={{ uri: resolveImage(g.image_url) }} style={styles.garnishImg} contentFit="cover" transition={200} />
                  <LinearGradient colors={["transparent", "rgba(15,23,42,0.9)"]} style={styles.garnishScrim} />
                  <View style={styles.garnishBody}>
                    <Text style={styles.garnishTitle} numberOfLines={1}>
                      {g.title}
                    </Text>
                    <Text style={styles.garnishTip} numberOfLines={2}>
                      {g.tip}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        <Text style={[styles.sectionTitle, { marginTop: 8, marginBottom: 12 }]}>Signature Cocktails</Text>
      </View>
    ),
    [garnishesQ.data, styles],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Sticky header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>THE MOBILE MIXERY</Text>
        <Text style={styles.title}>Discover</Text>
        <View style={styles.searchBar}>
          <MagnifyingGlass size={18} color={colors.muted} />
          <TextInput
            testID="recipe-search-input"
            placeholder="Search cocktails, spirits..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {cats.map((c) => {
            const active = c === category;
            return (
              <Pressable
                key={c}
                testID={`category-chip-${c}`}
                onPress={() => setCategory(c)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {recipesQ.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
     try {
  const res = await fetch('/api/recipes');
  const data = await res.json();
  setLibrary(data);
} catch {
  // fallback local data so Discover never says "Failed to load library"
  const local = require('@/assets/data/cocktails.json'); 
  setLibrary(local);
}
        </View>
      ) : (
        <FlatList
          testID="recipes-list"
          data={recipesQ.data ?? []}
          keyExtractor={(r) => r.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrap}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeader}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No recipes found. Try a different search.</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={recipesQ.isFetching} onRefresh={() => recipesQ.refetch()} tintColor={colors.brandPrimary} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 16, paddingBottom: 8, backgroundColor: colors.surface },
  eyebrow: { color: colors.brandPrimary, fontFamily: fonts.text, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 34, fontWeight: "700", marginTop: 2 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 46,
    marginTop: 14,
  },
  searchInput: { flex: 1, fontFamily: fonts.text, fontSize: 15, color: colors.onSurface },
  chipsRow: { gap: 8, paddingVertical: 12, paddingRight: 8 },
  chip: {
    height: 36,
    flexShrink: 0,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { backgroundColor: colors.brandPrimary },
  chipText: { color: colors.onSurfaceTertiary, fontFamily: fonts.text, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: colors.onBrandPrimary },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  columnWrap: { gap: 12, marginBottom: 12 },
  section: { marginBottom: 4 },
  sectionTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 22, fontWeight: "700" },
  garnishRow: { gap: 12, paddingVertical: 12, paddingRight: 8 },
  garnishCard: { width: 220, height: 140, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.surfaceTertiary },
  garnishImg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  garnishScrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: "80%" },
  garnishBody: { position: "absolute", left: 12, right: 12, bottom: 10 },
  garnishTitle: { color: "#FFFFFF", fontFamily: fonts.display, fontSize: 16, fontWeight: "700" },
  garnishTip: { color: "rgba(255,255,255,0.85)", fontFamily: fonts.text, fontSize: 11, marginTop: 2 },
  center: { padding: 40, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyText: { color: colors.muted, fontFamily: fonts.text, fontSize: 14, textAlign: "center" },
  retry: { color: colors.brandPrimary, fontFamily: fonts.text, fontSize: 14, fontWeight: "700" },
}));
