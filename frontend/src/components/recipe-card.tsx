import React from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { Recipe, resolveImage } from "@/src/api";
import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const styles = useStyles();
  const router = useRouter();
  const cover = recipe.custom_photos?.[0] || recipe.image_url;

  return (
    <Pressable
      testID={`recipe-card-${recipe.id}`}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image source={{ uri: resolveImage(cover) }} style={styles.image} contentFit="cover" transition={250} />
      <LinearGradient colors={["transparent", "rgba(15,23,42,0.85)"]} style={styles.scrim} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{recipe.category}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {recipe.name}
        </Text>
        <Text style={styles.spirit} numberOfLines={1}>
          {recipe.base_spirit} · {recipe.difficulty}
        </Text>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    flex: 1,
    height: 220,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceTertiary,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  image: { ...({ position: "absolute" } as object), top: 0, left: 0, right: 0, bottom: 0 },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: "70%" },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: { color: colors.onBrandTertiary, fontFamily: fonts.text, fontSize: 11, fontWeight: "700" },
  body: { position: "absolute", left: 12, right: 12, bottom: 12 },
  name: { color: "#FFFFFF", fontFamily: fonts.display, fontSize: 20, fontWeight: "700" },
  spirit: { color: "rgba(255,255,255,0.85)", fontFamily: fonts.text, fontSize: 12, marginTop: 2 },
}));
