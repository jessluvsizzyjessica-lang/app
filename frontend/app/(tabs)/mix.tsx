import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Martini, Sparkle, FloppyDisk } from "phosphor-react-native";

import { AIMenu, apiFetch } from "@/src/api";
import { Button } from "@/src/components/ui";
import { useAuth } from "@/src/auth";
import { useAiQuota } from "@/src/gating";
import { useToast } from "@/src/toast";
import { queryClient } from "@/src/query-client";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";
import { useRouter } from "expo-router";

const HERO =
  "https://images.unsplash.com/photo-1621109328469-0e7c5f0c3fc7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNTl8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBiYXJ0ZW5kZXIlMjBwb3VyaW5nJTIwZHJpbmslMjBldmVudHxlbnwwfHx8fDE3ODg5NDAyNTN8MA&ixlib=rb-4.1.0&q=85";

export default function MixMagic() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { isAuthed } = useAuth();
  const { show } = useToast();
  const router = useRouter();

  const [desc, setDesc] = useState("");
  const [guests, setGuests] = useState("");
  const [vibe, setVibe] = useState("");

  const { canUseAI, remaining, isPro, record } = useAiQuota();

  const genM = useMutation({
    mutationFn: () =>
      apiFetch<AIMenu>("/ai/generate-menu", {
        method: "POST",
        body: { event_description: desc, guest_count: guests ? parseInt(guests, 10) : undefined, vibe: vibe || undefined },
      }),
    onSuccess: () => record(),
    onError: (e: any) => show(e?.message || "AI failed. Try again.", "error"),
  });

  const saveM = useMutation({
    mutationFn: async () => {
      const menu = genM.data!;
      const ev = await apiFetch<{ id: string }>("/events", {
        method: "POST",
        auth: true,
        body: { name: menu.menu_title, vibe: vibe || undefined, guest_count: guests ? parseInt(guests, 10) : undefined, notes: menu.summary },
      });
      for (const d of menu.drinks) {
        await apiFetch(`/events/${ev.id}/items`, {
          method: "POST",
          auth: true,
          body: { name: d.name, category: d.type.includes("Mock") ? "Mocktails" : d.type.includes("Wine") || d.type.includes("Beer") ? "Wine/Beer" : "Cocktails", garnish: d.garnish },
        });
      }
      return ev;
    },
    onSuccess: (ev) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      show("Saved as an event menu", "success");
      router.push(`/event/${ev.id}`);
    },
    onError: (e: any) => show(e?.message || "Could not save", "error"),
  });

  const menu = genM.data;

  return (
    <KeyboardAwareScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      bottomOffset={20}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Image source={{ uri: HERO }} style={styles.heroImg} contentFit="cover" transition={250} />
        <LinearGradient colors={["rgba(126,34,206,0.55)", "rgba(15,23,42,0.9)"]} style={styles.heroScrim} />
        <View style={[styles.heroContent, { paddingTop: insets.top + 16 }]}>
          <View style={styles.pill}>
            <Sparkle size={14} color={colors.onBrandPrimary} weight="fill" />
            <Text style={styles.pillText}>AI MIXOLOGIST</Text>
          </View>
          <Text style={styles.heroTitle}>Mix Magic</Text>
          <Text style={styles.heroSub}>Describe your event and get a custom drink menu in seconds.</Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Tell me about your event</Text>
        <TextInput
          testID="ai-event-input"
          placeholder="e.g. Summer beach wedding, boho vibe, 80 guests, lots of fresh fruit..."
          placeholderTextColor={colors.muted}
          value={desc}
          onChangeText={setDesc}
          multiline
          style={styles.textarea}
        />

        <View style={styles.rowInputs}>
          <View style={styles.half}>
            <Text style={styles.label}>Guests</Text>
            <TextInput
              testID="ai-guests-input"
              placeholder="80"
              placeholderTextColor={colors.muted}
              value={guests}
              onChangeText={setGuests}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Vibe</Text>
            <TextInput
              testID="ai-vibe-input"
              placeholder="Elegant, tropical..."
              placeholderTextColor={colors.muted}
              value={vibe}
              onChangeText={setVibe}
              style={styles.input}
            />
          </View>
        </View>

        <Button
          testID="ai-generate-button"
          title={genM.isPending ? "Shaking up ideas..." : "Generate Menu"}
          onPress={() => {
            if (desc.trim().length < 3) { show("Describe your event first", "info"); return; }
            if (!canUseAI) { router.push("/paywall"); return; }
            genM.mutate();
          }}
          loading={genM.isPending}
          icon={<Martini size={20} color={colors.onBrandPrimary} weight="fill" />}
          style={{ marginTop: 8 }}
        />
        {!isPro && (
          <Pressable testID="ai-quota" onPress={() => router.push("/paywall")} style={styles.quotaRow}>
            <Text style={styles.quotaText}>
              {remaining > 0 ? `${remaining} free menu${remaining === 1 ? "" : "s"} left · ` : "Free menus used · "}
              <Text style={styles.quotaLink}>Go Pro for unlimited</Text>
            </Text>
          </Pressable>
        )}
      </View>

      {genM.isPending && (
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Our AI bartender is crafting your menu…</Text>
        </View>
      )}

      {menu && !genM.isPending && (
        <View style={styles.results}>
          <Text style={styles.menuTitle}>{menu.menu_title}</Text>
          <Text style={styles.menuSummary}>{menu.summary}</Text>

          {menu.drinks.map((d, i) => (
            <Animated.View key={`${d.name}-${i}`} entering={FadeInDown.delay(i * 70)} style={styles.drinkCard} testID={`ai-drink-${i}`}>
              <View style={styles.drinkHead}>
                <Text style={styles.drinkName}>{d.name}</Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{d.type}</Text>
                </View>
              </View>
              <Text style={styles.drinkMeta}>Base: {d.base_spirit}</Text>
              <Text style={styles.drinkIngredients}>{d.ingredients.join(" · ")}</Text>
              <Text style={styles.drinkGarnish}>Garnish: {d.garnish}</Text>
              <Text style={styles.drinkWhy}>{d.why}</Text>
            </Animated.View>
          ))}

          <Button
            testID="ai-save-event-button"
            title={isAuthed ? "Save as Event Menu" : "Log in to Save Menu"}
            variant="secondary"
            loading={saveM.isPending}
            onPress={() => (isAuthed ? saveM.mutate() : router.push("/auth"))}
            icon={<FloppyDisk size={20} color={colors.onBrandTertiary} weight="fill" />}
            style={{ marginTop: 8 }}
          />
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  hero: { height: 260, justifyContent: "flex-end" },
  heroImg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  heroScrim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  heroContent: { padding: 20, paddingBottom: 22 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(126,34,206,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  pillText: { color: "#FFFFFF", fontFamily: fonts.text, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  heroTitle: { color: "#FFFFFF", fontFamily: fonts.display, fontSize: 38, fontWeight: "700", marginTop: 10 },
  heroSub: { color: "rgba(255,255,255,0.9)", fontFamily: fonts.text, fontSize: 14, marginTop: 4, maxWidth: 320 },
  form: { padding: 16, gap: 8 },
  label: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: 13, fontWeight: "700", marginBottom: 6, marginTop: 6 },
  textarea: {
    minHeight: 110,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    padding: 14,
    fontFamily: fonts.text,
    fontSize: 15,
    color: colors.onSurface,
    textAlignVertical: "top",
  },
  input: {
    height: 48,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontFamily: fonts.text,
    fontSize: 15,
    color: colors.onSurface,
  },
  rowInputs: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  quotaRow: { alignItems: "center", paddingVertical: 12 },
  quotaText: { color: colors.muted, fontFamily: fonts.text, fontSize: 13 },
  quotaLink: { color: colors.brandPrimary, fontWeight: "700" },
  loadingBox: { padding: 24, alignItems: "center" },
  loadingText: { color: colors.muted, fontFamily: fonts.text, fontSize: 14, textAlign: "center" },
  results: { padding: 16, gap: 12 },
  menuTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 26, fontWeight: "700" },
  menuSummary: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: 14, lineHeight: 20 },
  drinkCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  drinkHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  drinkName: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 19, fontWeight: "700", flexShrink: 1 },
  typeBadge: { backgroundColor: colors.brandTertiary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  typeText: { color: colors.onBrandTertiary, fontFamily: fonts.text, fontSize: 11, fontWeight: "700" },
  drinkMeta: { color: colors.brandPrimary, fontFamily: fonts.text, fontSize: 12, fontWeight: "700", marginTop: 2 },
  drinkIngredients: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: 13, marginTop: 2 },
  drinkGarnish: { color: colors.onSurfaceTertiary, fontFamily: fonts.text, fontSize: 13, marginTop: 2 },
  drinkWhy: { color: colors.muted, fontFamily: fonts.text, fontSize: 13, fontStyle: "italic", marginTop: 4 },
}));
