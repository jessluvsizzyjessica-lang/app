import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Envelope, LockSimple, User, Martini } from "phosphor-react-native";

import { Button } from "@/src/components/ui";
import { useAuth } from "@/src/auth";
import { useToast } from "@/src/toast";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { login, register } = useAuth();
  const { show } = useToast();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      show("Enter your email and password", "info");
      return;
    }
    if (mode === "register" && password.length < 6) {
      show("Password must be at least 6 characters", "info");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") await login(email.trim(), password);
      else await register(email.trim(), password, name.trim() || undefined);
      show("Welcome to The Mobile Mixery", "success");
      router.back();
    } catch (e: any) {
      show(e?.message || "Authentication failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <LinearGradient colors={[colors.brandPrimary, colors.brandSecondary]} style={StyleSheetAbsolute} />
        <Pressable testID="close-auth" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} style={[styles.closeBtn, { top: insets.top + 8 }]}>
          <X size={20} color="#FFFFFF" weight="bold" />
        </Pressable>
        <View style={[styles.heroBody, { paddingTop: insets.top + 40 }]}>
          <View style={styles.logoCircle}>
            <Martini size={30} color={colors.brandPrimary} weight="fill" />
          </View>
          <Text style={styles.heroTitle}>{mode === "login" ? "Welcome back" : "Create account"}</Text>
          <Text style={styles.heroSub}>Save your favorite recipes and event menus.</Text>
        </View>
      </View>

      <KeyboardAwareScrollView contentContainerStyle={styles.form} bottomOffset={20} showsVerticalScrollIndicator={false}>
        {mode === "register" && (
          <InputRow icon={<User size={18} color={colors.muted} />}>
            <TextInput testID="auth-name" placeholder="Your name" placeholderTextColor={colors.muted} value={name} onChangeText={setName} style={styles.input} autoCapitalize="words" />
          </InputRow>
        )}
        <InputRow icon={<Envelope size={18} color={colors.muted} />}>
          <TextInput testID="auth-email" placeholder="Email" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        </InputRow>
        <InputRow icon={<LockSimple size={18} color={colors.muted} />}>
          <TextInput testID="auth-password" placeholder="Password" placeholderTextColor={colors.muted} value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
        </InputRow>

        <Button testID="auth-submit" title={mode === "login" ? "Log In" : "Sign Up"} onPress={submit} loading={busy} style={{ marginTop: 8 }} />

        <Pressable testID="auth-toggle" onPress={() => setMode(mode === "login" ? "register" : "login")} style={styles.toggle}>
          <Text style={styles.toggleText}>
            {mode === "login" ? "New here? " : "Already have an account? "}
            <Text style={styles.toggleLink}>{mode === "login" ? "Create an account" : "Log in"}</Text>
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

const StyleSheetAbsolute = { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };

function InputRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.inputRow}>
      {icon}
      {children}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  hero: { height: 240, overflow: "hidden" },
  closeBtn: { position: "absolute", right: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", zIndex: 2 },
  heroBody: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  logoCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  heroTitle: { color: "#FFFFFF", fontFamily: fonts.display, fontSize: 30, fontWeight: "700" },
  heroSub: { color: "rgba(255,255,255,0.9)", fontFamily: fonts.text, fontSize: 14, marginTop: 4, textAlign: "center" },
  form: { padding: 20, gap: 12 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surfaceTertiary, borderRadius: radius.md, paddingHorizontal: 14, height: 54 },
  input: { flex: 1, fontFamily: fonts.text, fontSize: 15, color: colors.onSurface },
  toggle: { alignItems: "center", marginTop: 8 },
  toggleText: { color: colors.muted, fontFamily: fonts.text, fontSize: 14 },
  toggleLink: { color: colors.brandPrimary, fontWeight: "700" },
}));
