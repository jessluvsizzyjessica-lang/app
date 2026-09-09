import React from "react";
import { ActivityIndicator, Pressable, Text, View, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  style,
  testID,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const bg =
    variant === "primary" ? styles.primary : variant === "secondary" ? styles.secondary : styles.ghost;
  const txt =
    variant === "primary" ? styles.primaryText : variant === "secondary" ? styles.secondaryText : styles.ghostText;

  const spinnerColor = variant === "primary" ? colors.onBrandPrimary : colors.brandPrimary;

  return (
    <Pressable
      testID={testID}
      disabled={isDisabled}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        bg,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[styles.text, txt]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  base: {
    height: 54,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  primary: { backgroundColor: colors.brandPrimary },
  secondary: { backgroundColor: colors.brandTertiary },
  ghost: { backgroundColor: "transparent" },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  text: { fontFamily: fonts.text, fontSize: 16, fontWeight: "700" },
  primaryText: { color: colors.onBrandPrimary },
  secondaryText: { color: colors.onBrandTertiary },
  ghostText: { color: colors.brandPrimary },
}));
