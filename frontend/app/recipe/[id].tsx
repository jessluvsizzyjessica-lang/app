import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { ArrowLeft, Heart, Camera, Plus, CalendarStar } from "phosphor-react-native";

import { API_BASE, apiFetch, EventT, getToken, Recipe, resolveImage } from "@/src/api";
import { Button } from "@/src/components/ui";
import { useAuth } from "@/src/auth";
import { useToast } from "@/src/toast";
import { queryClient } from "@/src/query-client";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { isAuthed } = useAuth();
  const { show } = useToast();
  const [tab, setTab] = useState<"ingredients" | "steps">("ingredients");
  const sheetRef = useRef<BottomSheet>(null);

  const recipeQ = useQuery({ queryKey: ["recipe", id], queryFn: () => apiFetch<Recipe>(`/recipes/${id}`) });
  const favIdsQ = useQuery({
    queryKey: ["favorites", "ids"],
    queryFn: () => apiFetch<string[]>("/favorites/ids", { auth: true }),
    enabled: isAuthed,
  });
  const eventsQ = useQuery({
    queryKey: ["events"],
    queryFn: () => apiFetch<EventT[]>("/events", { auth: true }),
    enabled: isAuthed,
  });

  const isFav = (favIdsQ.data ?? []).includes(id!);

  const favM = useMutation({
    mutationFn: () =>
      apiFetch(`/favorites/${id}`, { method: isFav ? "DELETE" : "POST", auth: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      show(isFav ? "Removed from favorites" : "Added to favorites", "success");
    },
    onError: (e: any) => show(e?.message || "Failed", "error"),
  });

  const uploadM = useMutation({
    mutationFn: async (uri: string) => {
      const token = await getToken();
      const name = uri.split("/").pop() || "photo.jpg";
      const type = "image/jpeg";
      const form = new FormData();
      if (Platform.OS === "web") {
        const blob = await (await fetch(uri)).blob();
        form.append("file", blob, name);
      } else {
        form.append("file", { uri, name, type } as any);
      }
      form.append("recipe_id", id!);
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe", id] });
      show("Photo added to this recipe", "success");
    },
    onError: (e: any) => show(e?.message || "Upload failed", "error"),
  });

  const addToEventM = useMutation({
    mutationFn: (eventId: string) => {
      const r = recipeQ.data!;
      return apiFetch(`/events/${eventId}/items`, {
        method: "POST",
        auth: true,
        body: { recipe_id: r.id, name: r.name, category: r.category, image_url: r.image_url, garnish: r.garnish },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      sheetRef.current?.close();
      show("Added to your event menu", "success");
    },
    onError: (e: any) => show(e?.message || "Failed to add", "error"),
  });

  const pickImage = useCallback(async () => {
    if (!isAuthed) {
      router.push("/auth");
      return;
    }
    const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
    let status = perm.status;
    if (status !== "granted") {
      if (perm.canAskAgain) {
        const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
        status = req.status;
      }
      if (status !== "granted") {
        show("Enable photo access in Settings to add your own pictures", "error");
        Linking.openSettings();
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      uploadM.mutate(result.assets[0].uri);
    }
  }, [isAuthed, router, show, uploadM]);

  const openAddToEvent = useCallback(() => {
    if (!isAuthed) {
      router.push("/auth");
      return;
    }
    sheetRef.current?.expand();
  }, [isAuthed, router]);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />,
    [],
  );

  if (recipeQ.isLoading) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }
  if (recipeQ.isError || !recipeQ.data) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.muted}>Could not load recipe.</Text>
      </View>
    );
  }

  const r = recipeQ.data;
  const gallery = [r.image_url, ...(r.custom_photos ?? [])];

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.hero}>
          <Image source={{ uri: resolveImage(gallery[0]) }} style={styles.heroImg} contentFit="cover" transition={250} />
          <LinearGradient colors={["rgba(15,23,42,0.35)", "transparent", "rgba(15,23,42,0.9)"]} style={styles.heroScrim} />
          <Pressable testID="recipe-back" onPress={() => router.back()} style={[styles.iconBtn, { top: insets.top + 8, left: 16 }]}>
            <ArrowLeft size={22} color="#FFFFFF" weight="bold" />
          </Pressable>
          <Pressable
            testID="recipe-favorite"
            onPress={() => (isAuthed ? favM.mutate() : router.push("/auth"))}
            style={[styles.iconBtn, { top: insets.top + 8, right: 16 }]}
          >
            <Heart size={22} color={isFav ? colors.error : "#FFFFFF"} weight={isFav ? "fill" : "regular"} />
          </Pressable>
          <View style={styles.heroBody}>
            <Text style={styles.category}>{r.category.toUpperCase()}</Text>
            <Text style={styles.title}>{r.name}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.desc}>{r.description}</Text>

          <View style={styles.tagsRow}>
            {r.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={styles.segment}>
            {(["ingredients", "steps"] as const).map((s) => (
              <Pressable
                key={s}
                testID={`segment-${s}`}
                onPress={() => setTab(s)}
                style={[styles.segItem, tab === s && styles.segItemActive]}
              >
                <Text style={[styles.segText, tab === s && styles.segTextActive]}>
                  {s === "ingredients" ? "Ingredients" : "Steps"}
                </Text>
              </Pressable>
            ))}
          </View>

          {tab === "ingredients" ? (
            <View style={styles.list}>
              {r.ingredients.map((ing, i) => (
                <View key={i} style={styles.ingRow}>
                  <View style={styles.dot} />
                  <Text style={styles.ingText}>{ing}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.list}>
              {r.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.garnishBox}>
            <Text style={styles.garnishLabel}>GARNISH</Text>
            <Text style={styles.garnishText}>{r.garnish}</Text>
          </View>

          {/* Custom photos */}
          <View style={styles.photosHead}>
            <Text style={styles.sectionTitle}>Your Photos</Text>
            <Pressable testID="upload-photo" onPress={pickImage} style={styles.uploadBtn} disabled={uploadM.isPending}>
              {uploadM.isPending ? (
                <ActivityIndicator size="small" color={colors.brandPrimary} />
              ) : (
                <Camera size={18} color={colors.brandPrimary} weight="fill" />
              )}
              <Text style={styles.uploadText}>{uploadM.isPending ? "Uploading" : "Add Photo"}</Text>
            </Pressable>
          </View>
          {gallery.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {gallery.slice(1).map((u, i) => (
                <Image key={i} source={{ uri: resolveImage(u) }} style={styles.userPhoto} contentFit="cover" transition={200} />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.muted}>Add your own photos of this drink to personalise your menus.</Text>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          testID="add-to-event"
          title="Add to Event"
          onPress={openAddToEvent}
          icon={<Plus size={20} color={colors.onBrandPrimary} weight="bold" />}
        />
      </View>

      <BottomSheet ref={sheetRef} index={-1} snapPoints={["55%"]} enablePanDownToClose backdropComponent={renderBackdrop} backgroundStyle={{ backgroundColor: colors.surface }}>
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>Add to which event?</Text>
        </View>
        <BottomSheetFlatList
          data={eventsQ.data ?? []}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.muted}>No events yet. Create one in the Events tab.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable testID={`add-to-event-${item.id}`} style={styles.eventRow} onPress={() => addToEventM.mutate(item.id)}>
              <CalendarStar size={22} color={colors.brandPrimary} weight="fill" />
              <View style={{ flex: 1 }}>
                <Text style={styles.eventName}>{item.name}</Text>
                <Text style={styles.muted}>{item.items.length} drinks</Text>
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
  center: { alignItems: "center", justifyContent: "center", flex: 1, padding: 24 },
  muted: { color: colors.muted, fontFamily: fonts.text, fontSize: 14, textAlign: "center" },
  hero: { height: 380 },
  heroImg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  heroScrim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  iconBtn: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(15,23,42,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBody: { position: "absolute", left: 20, right: 20, bottom: 20 },
  category: { color: colors.brandSecondary, fontFamily: fonts.text, fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: "#FFFFFF", fontFamily: fonts.display, fontSize: 36, fontWeight: "700", marginTop: 4 },
  content: { padding: 20, gap: 16 },
  desc: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: 15, lineHeight: 22 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { backgroundColor: colors.brandTertiary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  tagText: { color: colors.onBrandTertiary, fontFamily: fonts.text, fontSize: 12, fontWeight: "700" },
  segment: { flexDirection: "row", backgroundColor: colors.surfaceTertiary, borderRadius: radius.md, padding: 4 },
  segItem: { flex: 1, height: 40, alignItems: "center", justifyContent: "center", borderRadius: radius.sm },
  segItemActive: { backgroundColor: colors.surface, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  segText: { color: colors.muted, fontFamily: fonts.text, fontSize: 14, fontWeight: "700" },
  segTextActive: { color: colors.brandPrimary },
  list: { gap: 12 },
  ingRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brandSecondary },
  ingText: { color: colors.onSurface, fontFamily: fonts.text, fontSize: 15, flex: 1 },
  stepRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  stepNumText: { color: colors.onBrandPrimary, fontFamily: fonts.text, fontSize: 13, fontWeight: "800" },
  stepText: { color: colors.onSurface, fontFamily: fonts.text, fontSize: 15, flex: 1, lineHeight: 22 },
  garnishBox: { backgroundColor: colors.brandTertiary, borderRadius: radius.md, padding: 14 },
  garnishLabel: { color: colors.onBrandTertiary, fontFamily: fonts.text, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  garnishText: { color: colors.onBrandTertiary, fontFamily: fonts.text, fontSize: 15, marginTop: 2 },
  photosHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 20, fontWeight: "700" },
  uploadBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.brandTertiary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
  uploadText: { color: colors.brandPrimary, fontFamily: fonts.text, fontSize: 13, fontWeight: "700" },
  userPhoto: { width: 120, height: 120, borderRadius: radius.md, backgroundColor: colors.surfaceTertiary },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sheetHead: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
  sheetTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 22, fontWeight: "700" },
  eventRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border },
  eventName: { color: colors.onSurface, fontFamily: fonts.text, fontSize: 15, fontWeight: "700" },
}));
