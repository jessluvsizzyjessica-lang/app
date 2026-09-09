import React, { useCallback, useRef } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { Globe, SignOut, Heart, CaretRight, ForkKnife, Trash, WarningCircle, Flask, ShoppingCartSimple, Crown, TestTube } from "phosphor-react-native";

import { apiFetch, Recipe, resolveImage } from "@/src/api";
import { Button } from "@/src/components/ui";
import { useAuth } from "@/src/auth";
import { usePro } from "@/src/gating";
import { useToast } from "@/src/toast";
import { queryClient } from "@/src/query-client";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

const BOOKING_URL = "https://www.themobilemixeryca.com";
const BOOKING_HERO =
  "https://images.unsplash.com/photo-1621109328469-0e7c5f0c3fc7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNTl8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBiYXJ0ZW5kZXIlMjBwb3VyaW5nJTIwZHJpbmslMjBldmVudHxlbnwwfHx8fDE3ODg5NDAyNTN8MA&ixlib=rb-4.1.0&q=85";

export default function Profile() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { user, isAuthed, logout } = useAuth();
  const router = useRouter();
  const { show } = useToast();
  const isPro = usePro();

  const favQ = useQuery({
    queryKey: ["favorites"],
    queryFn: () => apiFetch<Recipe[]>("/favorites", { auth: true }),
    enabled: isAuthed,
  });

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthed) favQ.refetch();
    }, [isAuthed]),
  );

  const openBooking = async () => {
    try {
      await WebBrowser.openBrowserAsync(BOOKING_URL);
    } catch {
      Linking.openURL(BOOKING_URL);
    }
  };

  const deleteSheetRef = useRef<BottomSheet>(null);
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />,
    [],
  );

  const deleteM = useMutation({
    mutationFn: () => apiFetch("/auth/me", { method: "DELETE", auth: true }),
    onSuccess: async () => {
      deleteSheetRef.current?.close();
      await logout();
      queryClient.clear();
      show("Your account has been deleted", "info");
    },
    onError: (e: any) => show(e?.message || "Could not delete account", "error"),
  });

  return (
    <>
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>THE MOBILE MIXERY</Text>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Account */}
      <View style={styles.section}>
        {isAuthed ? (
          <View style={styles.accountCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name || user?.email || "?").charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>{user?.name}</Text>
              <Text style={styles.accountEmail}>{user?.email}</Text>
            </View>
            <Pressable testID="logout-button" onPress={async () => { await logout(); show("Signed out", "info"); }} style={styles.logoutBtn}>
              <SignOut size={20} color={colors.error} weight="bold" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.accountCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>Guest</Text>
              <Text style={styles.accountEmail}>Log in to save favorites & menus</Text>
            </View>
            <Button testID="profile-login" title="Log In" onPress={() => router.push("/auth")} style={{ height: 44, paddingHorizontal: 20 }} />
          </View>
        )}
      </View>

      {/* Favorites */}
      {isAuthed && (
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Favorites</Text>
            <Heart size={20} color={colors.error} weight="fill" />
          </View>
          {(favQ.data?.length ?? 0) === 0 ? (
            <Text style={styles.muted}>Tap the heart on any recipe to save it here.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 8 }}>
              {favQ.data!.map((r) => (
                <Pressable key={r.id} testID={`fav-${r.id}`} onPress={() => router.push(`/recipe/${r.id}`)} style={styles.favCard}>
                  <Image source={{ uri: resolveImage(r.image_url) }} style={styles.favImg} contentFit="cover" transition={200} />
                  <LinearGradient colors={["transparent", "rgba(15,23,42,0.85)"]} style={styles.favScrim} />
                  <Text style={styles.favName} numberOfLines={2}>{r.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Pro status / upsell */}
      <View style={styles.section}>
        {isPro ? (
          <View style={styles.proActive}>
            <Crown size={24} color={colors.warning} weight="fill" />
            <View style={{ flex: 1 }}>
              <Text style={styles.proActiveTitle}>Mixery Pro</Text>
              <Text style={styles.muted}>Unlimited AI menus, full tools & Syrup Lab unlocked.</Text>
            </View>
          </View>
        ) : (
          <Pressable testID="go-pro-card" onPress={() => router.push("/paywall")} style={styles.proCard}>
            <LinearGradient colors={[colors.brandPrimary, colors.brandSecondary]} style={styles.proGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Crown size={26} color="#FFFFFF" weight="fill" />
              <View style={{ flex: 1 }}>
                <Text style={styles.proTitle}>Go Pro</Text>
                <Text style={styles.proSub}>Unlimited AI menus, full batch tools & Syrup Lab</Text>
              </View>
              <CaretRight size={18} color="#FFFFFF" weight="bold" />
            </LinearGradient>
          </Pressable>
        )}
      </View>

      {/* Bar Tools */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bar Tools</Text>
        <Pressable testID="tool-batch" onPress={() => router.push("/tools/batch")} style={styles.infoRow}>
          <View style={styles.infoIcon}><Flask size={20} color={colors.brandPrimary} weight="fill" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Batch Guide</Text>
            <Text style={styles.muted}>Scale any cocktail to a big-batch dispenser with bottles & dilution.</Text>
          </View>
          <CaretRight size={16} color={colors.muted} weight="bold" />
        </Pressable>
        <Pressable testID="tool-shopping" onPress={() => router.push("/tools/shopping")} style={styles.infoRow}>
          <View style={styles.infoIcon}><ShoppingCartSimple size={20} color={colors.brandPrimary} weight="fill" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Shopping List Calculator</Text>
            <Text style={styles.muted}>Enter guests & drinks, get an exact shopping list.</Text>
          </View>
          <CaretRight size={16} color={colors.muted} weight="bold" />
        </Pressable>
        <Pressable testID="tool-syrups" onPress={() => router.push("/tools/syrups")} style={styles.infoRow}>
          <View style={styles.infoIcon}><TestTube size={20} color={colors.brandPrimary} weight="fill" /></View>
          <View style={{ flex: 1 }}>
            <View style={styles.rowInline}>
              <Text style={styles.infoTitle}>Syrup Lab</Text>
              {!isPro && <View style={styles.proPill}><Text style={styles.proPillText}>PRO</Text></View>}
            </View>
            <Text style={styles.muted}>10 signature syrups with yields, shelf life & scaling.</Text>
          </View>
          <CaretRight size={16} color={colors.muted} weight="bold" />
        </Pressable>
      </View>

      {/* Book Us */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Book Us</Text>
        <Pressable testID="book-us-card" onPress={openBooking} style={styles.bookCard}>
          <Image source={{ uri: BOOKING_HERO }} style={styles.bookImg} contentFit="cover" transition={250} />
          <LinearGradient colors={["rgba(126,34,206,0.5)", "rgba(15,23,42,0.92)"]} style={styles.bookScrim} />
          <View style={styles.bookBody}>
            <Text style={styles.bookTitle}>The Mobile Mixery</Text>
            <Text style={styles.bookBlurb}>Professional mobile bartending for weddings, corporate events & private parties across California.</Text>
            <View style={styles.bookCta}>
              <Globe size={18} color="#FFFFFF" weight="fill" />
              <Text style={styles.bookCtaText}>Book & learn more</Text>
              <CaretRight size={16} color="#FFFFFF" weight="bold" />
            </View>
          </View>
        </Pressable>
      </View>

      {/* Coordinator info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>For Event Coordinators</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}><ForkKnife size={20} color={colors.brandPrimary} weight="fill" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Full-service bar packages</Text>
            <Text style={styles.muted}>Signature menus, mocktails, glassware and licensed, insured bartenders.</Text>
          </View>
        </View>
        <Pressable onPress={openBooking} testID="coordinator-contact" style={styles.infoRow}>
          <View style={styles.infoIcon}><Globe size={20} color={colors.brandPrimary} weight="fill" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Request a quote</Text>
            <Text style={styles.muted}>themobilemixeryca.com</Text>
          </View>
          <CaretRight size={16} color={colors.muted} weight="bold" />
        </Pressable>
      </View>

      {/* Danger zone */}
      {isAuthed && (
        <View style={styles.section}>
          <Pressable testID="delete-account-open" onPress={() => deleteSheetRef.current?.expand()} style={styles.deleteRow}>
            <Trash size={18} color={colors.error} weight="bold" />
            <Text style={styles.deleteText}>Delete my account</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>

    <BottomSheet ref={deleteSheetRef} index={-1} snapPoints={["45%"]} enablePanDownToClose backdropComponent={renderBackdrop} backgroundStyle={{ backgroundColor: colors.surface }}>
      <BottomSheetView style={styles.deleteSheet}>
        <View style={styles.warnIcon}>
          <WarningCircle size={34} color={colors.error} weight="fill" />
        </View>
        <Text style={styles.deleteTitle}>Delete your account?</Text>
        <Text style={styles.deleteBody}>This permanently deletes your account and all associated data — favorites, event menus and uploaded photos. This cannot be undone.</Text>
        <Button testID="delete-account-confirm" title="Delete Permanently" onPress={() => deleteM.mutate()} loading={deleteM.isPending} style={{ alignSelf: "stretch", marginTop: 16, backgroundColor: colors.error }} />
        <Pressable testID="delete-account-cancel" onPress={() => deleteSheetRef.current?.close()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
    </>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 16, paddingBottom: 4 },
  eyebrow: { color: colors.brandPrimary, fontFamily: fonts.text, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 34, fontWeight: "700", marginTop: 2 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 22, fontWeight: "700", marginBottom: 10 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  accountCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.onBrandPrimary, fontFamily: fonts.display, fontSize: 22, fontWeight: "700" },
  accountName: { color: colors.onSurface, fontFamily: fonts.text, fontSize: 17, fontWeight: "700" },
  accountEmail: { color: colors.muted, fontFamily: fonts.text, fontSize: 13, marginTop: 2 },
  logoutBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  muted: { color: colors.muted, fontFamily: fonts.text, fontSize: 13, lineHeight: 19 },
  favCard: { width: 130, height: 160, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.surfaceTertiary },
  favImg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  favScrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: "70%" },
  favName: { position: "absolute", left: 10, right: 10, bottom: 10, color: "#FFFFFF", fontFamily: fonts.display, fontSize: 15, fontWeight: "700" },
  bookCard: { height: 200, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.surfaceTertiary },
  bookImg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  bookScrim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  bookBody: { position: "absolute", left: 16, right: 16, bottom: 16 },
  bookTitle: { color: "#FFFFFF", fontFamily: fonts.display, fontSize: 24, fontWeight: "700" },
  bookBlurb: { color: "rgba(255,255,255,0.9)", fontFamily: fonts.text, fontSize: 13, marginTop: 4, lineHeight: 18 },
  bookCta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  bookCtaText: { color: "#FFFFFF", fontFamily: fonts.text, fontSize: 14, fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  infoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brandTertiary, alignItems: "center", justifyContent: "center" },
  infoTitle: { color: colors.onSurface, fontFamily: fonts.text, fontSize: 15, fontWeight: "700" },
  rowInline: { flexDirection: "row", alignItems: "center", gap: 8 },
  proPill: { backgroundColor: colors.brandPrimary, paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.pill },
  proPillText: { color: colors.onBrandPrimary, fontFamily: fonts.text, fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  proCard: { borderRadius: radius.lg, overflow: "hidden" },
  proGrad: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18 },
  proTitle: { color: "#FFFFFF", fontFamily: fonts.display, fontSize: 22, fontWeight: "700" },
  proSub: { color: "rgba(255,255,255,0.9)", fontFamily: fonts.text, fontSize: 13, marginTop: 2 },
  proActive: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  proActiveTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 18, fontWeight: "700" },
  deleteRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12 },
  deleteText: { color: colors.error, fontFamily: fonts.text, fontSize: 14, fontWeight: "700" },
  deleteSheet: { padding: 24, alignItems: "center" },
  warnIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  deleteTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 24, fontWeight: "700", textAlign: "center" },
  deleteBody: { color: colors.muted, fontFamily: fonts.text, fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 },
  cancelBtn: { paddingVertical: 14, marginTop: 4 },
  cancelText: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: 15, fontWeight: "700" },
}));
