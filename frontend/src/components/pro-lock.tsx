import React from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Crown } from "phosphor-react-native";

import { Button } from "@/src/components/ui";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

export function ProLock({ title, body }: { title: string; body: string }) {
  const styles = useStyles();
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <LinearGradient colors={[colors.brandPrimary, colors.brandSecondary]} style={styles.badge}>
        <Crown size={40} color="#FFFFFF" weight="fill" />
      </LinearGradient>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <Button testID="prolock-upgrade" title="Go Pro" onPress={() => router.push("/paywall")} style={{ alignSelf: "stretch", marginTop: 20 }} />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  badge: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 26, fontWeight: "700", textAlign: "center" },
  body: { color: colors.muted, fontFamily: fonts.text, fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 },
}));
