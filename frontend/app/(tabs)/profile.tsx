import React from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { Globe, SignOut, Heart, CaretRight, ForkKnife } from "phosphor-react-native";

import { apiFetch, Recipe, resolveImage } from "@/src/api";
import { Button } from "@/src/components/ui";
import { useAuth } from "@/src/auth";
import { useToast } from "@/src/toast";
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

  return (
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
    </ScrollView>
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
}));
