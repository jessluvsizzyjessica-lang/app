import { DRINKS } from "./data.js";

/* Searchable text blob per drink — every field is keyword-searchable. */
const blob = new Map(
  DRINKS.map((d) => [
    d.id,
    [d.name, d.base, d.season, d.color, d.garnish, ...d.flavors, ...d.ingredients, ...d.tags]
      .join(" ")
      .toLowerCase(),
  ])
);

export const textOf = (d) => blob.get(d.id);
const has = (d, word) => blob.get(d.id).includes(word);

/**
 * Filter groups. Within a group the selections are OR'd; across groups
 * they are AND'd — standard faceted behaviour.
 */
export const GROUPS = [
  {
    key: "season",
    label: "Season",
    values: ["Spring", "Summer", "Fall"],
    test: (d, v) => d.season === v,
  },
  {
    key: "spirit",
    label: "Base spirit",
    values: ["Tequila", "Vodka", "Rum", "Gin", "Bourbon", "Sake", "Melon Liqueur"],
    // substring so "Sake / Gin" is caught by both Sake and Gin
    test: (d, v) => d.base.toLowerCase().includes(v.toLowerCase()),
  },
  {
    key: "flavor",
    label: "Flavour & vibe",
    values: ["Spicy", "Sweet", "Fruity", "Citrus", "Refreshing", "Creamy", "Floral", "Tropical", "Minty", "Berry"],
    test: (d, v) => has(d, v === "Minty" ? "mint" : v.toLowerCase()),
  },
  {
    key: "style",
    label: "Style",
    values: ["Margarita", "Mojito", "Spritz", "Smash", "Paloma", "Mule", "Collins"],
    test: (d, v) => has(d, v.toLowerCase()),
  },
  {
    key: "color",
    label: "Colour",
    values: ["Pink", "Red", "Orange", "Amber", "Yellow", "Green", "Blue", "Purple", "Clear"],
    test: (d, v) => d.color === v,
  },
];

export const GROUP_BY_KEY = Object.fromEntries(GROUPS.map((g) => [g.key, g]));

/** Fresh empty selection state. */
export const emptyState = () => Object.fromEntries(GROUPS.map((g) => [g.key, new Set()]));

function matchesQuery(d, query) {
  if (!query) return true;
  return query.split(/\s+/).every((t) => blob.get(d.id).includes(t));
}

function matchesGroup(d, key, active) {
  const sel = active[key];
  if (!sel.size) return true;
  const g = GROUP_BY_KEY[key];
  return [...sel].some((v) => g.test(d, v));
}

/** Drinks passing the query and every group except `skip` (pass null for all). */
export function passing(active, query, skip = null) {
  return DRINKS.filter(
    (d) => matchesQuery(d, query) && GROUPS.every((g) => g.key === skip || matchesGroup(d, g.key, active))
  );
}

export const results = (active, query) => passing(active, query, null);

export const activeCount = (active) => GROUPS.reduce((n, g) => n + active[g.key].size, 0);

/** How many results a chip would yield, given the other groups' selections. */
export function chipCount(active, query, groupKey, value) {
  const g = GROUP_BY_KEY[groupKey];
  return passing(active, query, groupKey).filter((d) => g.test(d, value)).length;
}
