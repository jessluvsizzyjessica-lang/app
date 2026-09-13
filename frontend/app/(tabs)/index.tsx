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
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MagnifyingGlass } from "phosphor-react-native";
import { apiFetch, Garnish, resolveImage } from "@/src/api";
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
    queryKey: ['recipes', category, search],
    queryFn: async () => {
      try {
        const res = await fetch('/api/recipes');
        if (!res.ok) throw new Error('api down');
        return await res.json();
      } catch {
        try { return require('@/assets/data/cocktails.json'); } catch {
          return [
            { id: '1', name: 'Spiced Mule', spirit: 'vodka', category: 'All' },
            { id: '2', name: 'Old Fashioned', spirit: 'whiskey', category: 'All' },
            { id: '3', name: 'Margarita', spirit: 'tequila', category: 'All' },
          ];
        }
      }
    },
  });
  const cats = categoriesQ.data ?? ["All"];
  const ListHeader = useMemo(() => (
    <View>
      {(garnishesQ.data?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Garnish Inspiration</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.garnishRow}>
            {garnishesQ.data!.map((g) => (
              <View key={g.id} style={styles.garnishCard}><Image source={{ uri: resolveImage(g.image_url) }} style={styles.garnishImg} contentFit="cover" /><LinearGradient colors={["transparent", "rgba(15,23,42,0.9)"]} style={styles.garnishScrim} /><View style={styles.garnishBody}><Text style={styles.garnishTitle}>{g.title}</Text><Text style={styles.garnishTip}>{g.tip}</Text></View></View>
            ))}
          </ScrollView>
        </View>
      )}
      <Text style={[styles.sectionTitle, { marginTop: 8, marginBottom: 12 }]}>Signature Cocktails</Text>
    </View>
  ), [garnishesQ.data, styles]);
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>THE MOBILE MIXERY</Text>
        <Text style={styles.title}>Discover</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Pressable onPress={() => Linking.openURL('https://app.themobilemixeryca.com')} style={[styles.appButton, { backgroundColor: colors.brandPrimary }]}><Text style={styles.appButtonText}>Open App →</Text></Pressable>
          <Pressable onPress={() => Linking.openURL('https://ig.me/m/___sicka___')} style={[styles.appButton, styles.appButtonSecondary]}><Text style={[styles.appButtonText, { color: colors.onSurface }]}>Book Event</Text></Pressable>
        </View>
        <View style={styles.searchBar}><MagnifyingGlass size={18} color={colors.muted} /><TextInput placeholder="Search cocktails, spirits..." placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} style={styles.searchInput} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>{cats.map((c) => { const active = c === category; return (<Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, active && styles.chipActive]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text></Pressable>); })}</ScrollView>
      </View>
      {recipesQ.isLoading ? (<View style={styles.center}><ActivityIndicator color={colors.brandPrimary} /></View>) : (<FlatList data={recipesQ.data ?? []} keyExtractor={(r) => r.id} numColumns={2} columnWrapperStyle={styles.columnWrap} contentContainerStyle={styles.listContent} ListHeaderComponent={ListHeader} renderItem={({ item }) => <RecipeCard recipe={item} />} refreshControl={<RefreshControl refreshing={recipesQ.isFetching} onRefresh={() => recipesQ.refetch()} />} />)}
    </View>
  );
}
const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 16, paddingBottom: 8, backgroundColor: colors.surface },
  eyebrow: { color: colors.brandPrimary, fontFamily: fonts.text, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 34, fontWeight: "700", marginTop: 2 },
  appButton: { paddingHorizontal: 18, height: 40, borderRadius: 100, alignItems: 'center', justifyContent: 'center' },
  appButtonSecondary: { backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border },
  appButtonText: { color: 'white', fontWeight: '800', fontSize: 13 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surfaceTertiary, borderRadius: 16, paddingHorizontal: 14, height: 46, marginTop: 14 },
  searchInput: { flex: 1, fontSize: 15, color: colors.onSurface },
  chipsRow: { gap: 8, paddingVertical: 12 }, chip: { height: 36, paddingHorizontal: 16, borderRadius: 100, backgroundColor: colors.surfaceTertiary, alignItems: 'center', justifyContent: 'center' }, chipActive: { backgroundColor: colors.brandPrimary }, chipText: { fontSize: 13, fontWeight: '600' }, chipTextActive: { color: 'white' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 }, columnWrap: { gap: 12, marginBottom: 12 }, section: { marginBottom: 4 }, sectionTitle: { fontSize: 22, fontWeight: '700' }, garnishRow: { gap: 12, paddingVertical: 12 }, garnishCard: { width: 220, height: 140, borderRadius: 16, overflow: 'hidden' }, garnishImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, garnishScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '80%' }, garnishBody: { position: 'absolute', left: 12, right: 12, bottom: 10 }, garnishTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' }, garnishTip: { color: 'rgba(255,255,255,0.85)', fontSize: 11 }, center: { padding: 40, alignItems: 'center' },
}));
