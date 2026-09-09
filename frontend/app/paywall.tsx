import React, { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { PurchasesPackage } from "react-native-purchases";
import { X, Check, Sparkle, Crown } from "phosphor-react-native";

import { Button } from "@/src/components/ui";
import { useAuth } from "@/src/auth";
import { useToast } from "@/src/toast";
import { useSubscription } from "@/src/revenuecat";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

const BENEFITS = [
  "Unlimited AI menu generation",
  "Batch & Shopping tools for any party size",
  "Full Syrup Lab — 10 signature syrups",
  "Priority access to new pro features",
];

export default function Paywall() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { show } = useToast();
  const { user } = useAuth();
  const { offerings, isSubscribed, purchase, restore, isPurchasing, isRestoring, identityReady, identityError, rcEnabled } = useSubscription();

  const packages = offerings?.current?.availablePackages ?? [];
  const monthly = useMemo(() => packages.find((p) => p.identifier === "$rc_monthly") || packages.find((p) => p.packageType === "MONTHLY"), [packages]);
  const annual = useMemo(() => packages.find((p) => p.identifier === "$rc_annual") || packages.find((p) => p.packageType === "ANNUAL"), [packages]);

  const [selected, setSelected] = useState<"annual" | "monthly">("annual");
  const [confirm, setConfirm] = useState<PurchasesPackage | null>(null);

  const chosen = selected === "annual" ? annual : monthly;

  const close = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)"));

  const doPurchase = async (pkg: PurchasesPackage) => {
    setConfirm(null);
    try {
      const info = await purchase(pkg);
      if (info.entitlements.active?.pro) {
        show("Welcome to Pro! 🎉", "success");
        close();
      }
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg.toLowerCase().includes("cancel")) return;
      if (msg.includes("identity_not_ready")) show("Please log in first to subscribe", "error");
      else show("Purchase failed. Please try again.", "error");
    }
  };

  const onSubscribe = () => {
    if (!user) {
      router.replace("/auth");
      return;
    }
    if (!chosen) {
      show("Subscription options are unavailable right now.", "error");
      return;
    }
    setConfirm(chosen);
  };

  const onRestore = async () => {
    try {
      const info = await restore();
      if (info.entitlements.active?.pro) {
        show("Purchases restored 🎉", "success");
        close();
      } else {
        show("No active subscription found", "info");
      }
    } catch {
      show("Could not restore purchases", "error");
    }
  };

  const noOptions = rcEnabled && packages.length > 0 && !monthly && !annual;

  return (
    <View style={styles.screen}>
      <LinearGradient colors={[colors.brandPrimary, colors.brandSecondary]} style={styles.hero}>
        <Pressable testID="paywall-close" onPress={close} style={[styles.close, { top: insets.top + 8 }]}>
          <X size={20} color="#FFFFFF" weight="bold" />
        </Pressable>
        <View style={[styles.heroBody, { paddingTop: insets.top + 40 }]}>
          <View style={styles.crown}><Crown size={30} color={colors.brandPrimary} weight="fill" /></View>
          <Text style={styles.heroTitle}>Mixery Pro</Text>
          <Text style={styles.heroSub}>Everything you need to run a pro mobile bar.</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        {isSubscribed ? (
          <View style={styles.activeBox}>
            <Sparkle size={26} color={colors.success} weight="fill" />
            <Text style={styles.activeTitle}>You're Pro ✨</Text>
            <Text style={styles.activeSub}>All premium features are unlocked. Thank you!</Text>
            <Button testID="paywall-done" title="Done" onPress={close} style={{ alignSelf: "stretch", marginTop: 16 }} />
          </View>
        ) : (
          <>
            <View style={styles.benefits}>
              {BENEFITS.map((b) => (
                <View key={b} style={styles.benefitRow}>
                  <View style={styles.tick}><Check size={14} color={colors.onBrandPrimary} weight="bold" /></View>
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>

            {(!rcEnabled || (!monthly && !annual)) ? (
              <View style={styles.unavailable}>
                <Text style={styles.unavailableText}>
                  {rcEnabled
                    ? "Subscription options are unavailable right now. Please try again later."
                    : "Subscriptions aren't available in this environment. Open the app on a device to subscribe."}
                </Text>
              </View>
            ) : (
              <>
                {annual && (
                  <Pressable testID="plan-annual" onPress={() => setSelected("annual")} style={[styles.plan, selected === "annual" && styles.planOn]}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.planHead}>
                        <Text style={styles.planName}>Annual</Text>
                        <View style={styles.saveBadge}><Text style={styles.saveText}>BEST VALUE</Text></View>
                      </View>
                      <Text style={styles.planPrice}>{annual.product.priceString}<Text style={styles.planPer}> / year</Text></Text>
                    </View>
                    <View style={[styles.radio, selected === "annual" && styles.radioOn]}>{selected === "annual" && <View style={styles.radioDot} />}</View>
                  </Pressable>
                )}
                {monthly && (
                  <Pressable testID="plan-monthly" onPress={() => setSelected("monthly")} style={[styles.plan, selected === "monthly" && styles.planOn]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.planName}>Monthly</Text>
                      <Text style={styles.planPrice}>{monthly.product.priceString}<Text style={styles.planPer}> / month</Text></Text>
                    </View>
                    <View style={[styles.radio, selected === "monthly" && styles.radioOn]}>{selected === "monthly" && <View style={styles.radioDot} />}</View>
                  </Pressable>
                )}

                {!!identityError && <Text style={styles.errBanner}>Sign-in issue: log out and back in before subscribing.</Text>}

                <Button
                  testID="paywall-subscribe"
                  title={user ? "Start Pro" : "Log in to Subscribe"}
                  onPress={onSubscribe}
                  loading={isPurchasing}
                  disabled={!!user && !identityReady}
                  style={{ marginTop: 16 }}
                />

                <Pressable testID="paywall-restore" onPress={onRestore} style={styles.restore} disabled={isRestoring}>
                  <Text style={styles.restoreText}>{isRestoring ? "Restoring…" : "Restore purchases"}</Text>
                </Pressable>

                {(rcEnabled && __DEV__) && (
                  <Text style={styles.simNote}>Preview mode: purchases run on the RevenueCat Test Store (simulated).</Text>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Custom confirm modal (no Alert per guidelines) */}
      <Modal visible={!!confirm} transparent animationType="fade" onRequestClose={() => setConfirm(null)}>
        <Pressable style={styles.backdrop} onPress={() => setConfirm(null)}>
          <Pressable style={styles.confirmCard} onPress={() => {}}>
            <Text style={styles.confirmTitle}>Confirm subscription</Text>
            <Text style={styles.confirmBody}>
              Subscribe to Mixery Pro for {confirm?.product.priceString}
              {selected === "annual" ? " / year" : " / month"}?
            </Text>
            <Button testID="confirm-purchase" title="Confirm" onPress={() => confirm && doPurchase(confirm)} loading={isPurchasing} style={{ alignSelf: "stretch", marginTop: 12 }} />
            <Pressable testID="confirm-cancel" onPress={() => setConfirm(null)} style={styles.restore}>
              <Text style={styles.restoreText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  hero: { height: 220 },
  close: { position: "absolute", right: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", zIndex: 2 },
  heroBody: { flex: 1, alignItems: "center", justifyContent: "center" },
  crown: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  heroTitle: { color: "#FFFFFF", fontFamily: fonts.display, fontSize: 32, fontWeight: "700" },
  heroSub: { color: "rgba(255,255,255,0.9)", fontFamily: fonts.text, fontSize: 14, marginTop: 4 },
  benefits: { gap: 12, marginBottom: 20 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  tick: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  benefitText: { color: colors.onSurface, fontFamily: fonts.text, fontSize: 15, fontWeight: "600", flex: 1 },
  plan: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 2, borderColor: colors.border, borderRadius: radius.lg, padding: 16, marginBottom: 12 },
  planOn: { borderColor: colors.brandPrimary, backgroundColor: colors.brandTertiary },
  planHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  planName: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 20, fontWeight: "700" },
  saveBadge: { backgroundColor: colors.success, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  saveText: { color: colors.onSuccess, fontFamily: fonts.text, fontSize: 10, fontWeight: "800" },
  planPrice: { color: colors.brandPrimary, fontFamily: fonts.display, fontSize: 22, fontWeight: "700", marginTop: 2 },
  planPer: { color: colors.muted, fontFamily: fonts.text, fontSize: 13, fontWeight: "600" },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: colors.brandPrimary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.brandPrimary },
  errBanner: { color: colors.error, fontFamily: fonts.text, fontSize: 13, marginTop: 8 },
  restore: { alignItems: "center", paddingVertical: 14 },
  restoreText: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: 15, fontWeight: "700" },
  simNote: { color: colors.muted, fontFamily: fonts.text, fontSize: 12, textAlign: "center", marginTop: 4 },
  unavailable: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border },
  unavailableText: { color: colors.muted, fontFamily: fonts.text, fontSize: 14, textAlign: "center", lineHeight: 20 },
  activeBox: { alignItems: "center", padding: 24, gap: 6 },
  activeTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 24, fontWeight: "700", marginTop: 8 },
  activeSub: { color: colors.muted, fontFamily: fonts.text, fontSize: 14, textAlign: "center" },
  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  confirmCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 20, width: "100%", maxWidth: 400 },
  confirmTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 20, fontWeight: "700" },
  confirmBody: { color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: 14, marginTop: 8, lineHeight: 20 },
}));
