// Schema for The Mobile Mixery API.
//
// Column property names are snake_case on purpose: the mobile/web client (and
// the Python test suites in backend/tests) consume snake_case JSON, so keeping
// the Drizzle property names identical to the Postgres columns lets query
// results be returned as-is without a translation layer.
import { doublePrecision, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  password_hash: text("password_hash").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Catalog tables (recipes/garnishes/syrups) are seeded from netlify/lib/seed-data.mts.
export const recipes = pgTable("recipes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().notNull().default([]),
  description: text("description").notNull().default(""),
  image_url: text("image_url").notNull().default(""),
  glass: text("glass"),
  base_spirit: text("base_spirit"),
  ingredients: text("ingredients").array().notNull().default([]),
  steps: text("steps").array().notNull().default([]),
  garnish: text("garnish"),
  difficulty: text("difficulty").notNull().default("Easy"),
});

export const garnishes = pgTable("garnishes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  image_url: text("image_url").notNull().default(""),
  tip: text("tip").notNull().default(""),
});

export const syrups = pgTable("syrups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color"),
  base_yield_oz: doublePrecision("base_yield_oz").notNull().default(0),
  shelf_life: text("shelf_life"),
  ingredients: text("ingredients").array().notNull().default([]),
  steps: text("steps").array().notNull().default([]),
  tip: text("tip"),
});

export const favorites = pgTable(
  "favorites",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipe_id: text("recipe_id").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.recipe_id] })],
);

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // Kept as text: the client sends a plain calendar date, so storing it as a
  // timestamp would drag timezone conversion into a value that has none.
  date: text("date"),
  vibe: text("vibe"),
  guest_count: integer("guest_count"),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
});

// Menu items were an embedded array in Mongo; as rows they can be removed by id
// without rewriting the whole event.
export const event_items = pgTable("event_items", {
  item_id: text("item_id").primaryKey(),
  event_id: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  recipe_id: text("recipe_id"),
  name: text("name").notNull(),
  category: text("category").notNull().default("Cocktails"),
  image_url: text("image_url"),
  garnish: text("garnish"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Uploaded photo bytes live in Netlify Blobs; these rows hold the metadata.
export const uploads = pgTable("uploads", {
  id: text("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipe_id: text("recipe_id"),
  storage_path: text("storage_path").notNull(),
  url: text("url").notNull(),
  content_type: text("content_type"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const custom_photos = pgTable("custom_photos", {
  id: text("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipe_id: text("recipe_id").notNull(),
  url: text("url").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
