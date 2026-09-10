// The Mobile Mixery API.
//
// A port of backend/server.py (FastAPI + MongoDB) onto Netlify Functions +
// Netlify Database. Paths, request bodies, response shapes and status codes are
// kept identical to the Python service so the existing Expo client works
// unchanged. Serverless functions are matched before redirects, so this handler
// receives /api/* even though netlify.toml has a SPA catch-all.
import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import Anthropic from "@anthropic-ai/sdk";
import { and, asc, desc, eq, ilike, inArray, isNull, sql } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
  custom_photos,
  event_items,
  events,
  favorites,
  garnishes,
  recipes,
  syrups,
  uploads,
  users,
} from "../../db/schema.js";
import { hashPassword, makeToken, newId, verifyPassword, verifyToken } from "../lib/auth.mjs";
import { computeBatch, computeShoppingList, scaleSyrup } from "../lib/bar-math.mjs";
import { SEED_GARNISHES, SEED_RECIPES, SEED_SYRUPS } from "../lib/seed-data.mjs";

const UPLOAD_STORE = "mobile-mixery-uploads";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

// Mirrors FastAPI's HTTPException: the client reads `detail` off error bodies.
class ApiError extends Error {
  status: number;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
  }
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------
let seedChecked = false;

/**
 * Loads the curated catalog on first use. The Python service did this on
 * startup; a function has no startup hook, so it happens lazily and is skipped
 * once a row exists. Concurrent cold starts are safe — inserts ignore conflicts.
 */
async function ensureSeeded() {
  if (seedChecked) return;
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(recipes);
  if (Number(count) === 0) {
    await db.insert(recipes).values(SEED_RECIPES).onConflictDoNothing();
    await db.insert(garnishes).values(SEED_GARNISHES).onConflictDoNothing();
    await db.insert(syrups).values(SEED_SYRUPS).onConflictDoNothing();
  }
  seedChecked = true;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
type User = typeof users.$inferSelect;

function publicUser(u: User) {
  return { id: u.id, email: u.email, name: u.name };
}

async function requireUser(req: Request): Promise<User> {
  const header = req.headers.get("authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    throw new ApiError(401, "Not authenticated");
  }
  const userId = await verifyToken(header.slice(7).trim());
  if (!userId) throw new ApiError(401, "Invalid or expired token");
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new ApiError(401, "User not found");
  return user;
}

// ---------------------------------------------------------------------------
// Body parsing / validation
// ---------------------------------------------------------------------------
async function readJson(req: Request): Promise<Record<string, any>> {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") throw new Error("not an object");
    return body as Record<string, any>;
  } catch {
    throw new ApiError(422, "Invalid JSON body");
  }
}

function str(body: Record<string, any>, field: string, opts: { min?: number; max?: number } = {}) {
  const value = body[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(422, `${field} is required`);
  }
  const trimmed = value.trim();
  if (opts.min && trimmed.length < opts.min) {
    throw new ApiError(422, `${field} must be at least ${opts.min} characters`);
  }
  if (opts.max && trimmed.length > opts.max) {
    throw new ApiError(422, `${field} must be at most ${opts.max} characters`);
  }
  return trimmed;
}

function optionalStr(body: Record<string, any>, field: string, max?: number) {
  const value = body[field];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new ApiError(422, `${field} must be a string`);
  if (max && value.length > max) throw new ApiError(422, `${field} must be at most ${max} characters`);
  return value;
}

function num(body: Record<string, any>, field: string, min: number, max: number, fallback?: number) {
  const raw = body[field];
  if (raw === undefined || raw === null) {
    if (fallback !== undefined) return fallback;
    throw new ApiError(422, `${field} is required`);
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new ApiError(422, `${field} must be a number`);
  if (value < min || value > max) {
    throw new ApiError(422, `${field} must be between ${min} and ${max}`);
  }
  return value;
}

function optionalInt(body: Record<string, any>, field: string) {
  const raw = body[field];
  if (raw === undefined || raw === null || raw === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new ApiError(422, `${field} must be a number`);
  return Math.trunc(value);
}

// Deliberately permissive, matching pydantic's EmailStr closely enough to reject
// obvious typos without turning into an address parser.
function email(body: Record<string, any>) {
  const value = str(body, "email", { max: 254 }).toLowerCase();
  if (!/^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/.test(value)) {
    throw new ApiError(422, "Enter a valid email address");
  }
  return value;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
function itemPayload(row: typeof event_items.$inferSelect) {
  return {
    item_id: row.item_id,
    recipe_id: row.recipe_id,
    name: row.name,
    category: row.category,
    image_url: row.image_url,
    garnish: row.garnish,
  };
}

async function eventWithItems(eventId: string, userId: string) {
  const [row] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.user_id, userId), isNull(events.deleted_at)))
    .limit(1);
  if (!row) throw new ApiError(404, "Event not found");
  const items = await db
    .select()
    .from(event_items)
    .where(eq(event_items.event_id, eventId))
    .orderBy(asc(event_items.created_at));
  return { ...row, items: items.map(itemPayload) };
}

// ---------------------------------------------------------------------------
// AI menu generation
// ---------------------------------------------------------------------------
const AI_SYSTEM =
  "You are an expert mobile bartender and event mixologist for a company called The Mobile Mixery. " +
  "Given an event brief, you design a cohesive, crowd-pleasing drink menu with creative combinations and " +
  "fresh garnish ideas. Always respond with STRICT JSON only, no markdown, no commentary.";

function extractJson(text: string): unknown {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) cleaned = cleaned.slice(start, end + 1);
  return JSON.parse(cleaned);
}

async function generateMenu(body: Record<string, any>) {
  const description = str(body, "event_description", { min: 3, max: 1000 });
  const guestCount = optionalInt(body, "guest_count");
  const vibe = optionalStr(body, "vibe", 120);

  const prompt = `Design a drink menu for this event.

Event: ${description}
Guests: ${guestCount ?? "unspecified"}
Vibe: ${vibe ?? "unspecified"}

Return STRICT JSON with this exact shape:
{
  "menu_title": "short catchy menu name",
  "summary": "1-2 sentence overview of the menu concept",
  "drinks": [
    {
      "name": "drink name",
      "type": "Cocktail | Mocktail | Wine | Beer | Punch",
      "base_spirit": "main spirit or base",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "garnish": "garnish idea",
      "why": "one sentence on why it fits this event"
    }
  ]
}
Include 5 to 6 drinks with at least one mocktail. Keep it fresh, seasonal and elegant.`;

  // Credentials are injected by Netlify AI Gateway at runtime.
  let text: string;
  try {
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2048,
      system: AI_SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });
    text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");
  } catch (err) {
    throw new ApiError(502, `AI generation failed: ${(err as Error).message}`);
  }

  try {
    return extractJson(text);
  } catch {
    throw new ApiError(502, "AI returned an unexpected format. Please try again.");
  }
}

// ---------------------------------------------------------------------------
// Uploads
// ---------------------------------------------------------------------------
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "heic"]);

async function handleUpload(req: Request) {
  const user = await requireUser(req);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new ApiError(422, "Expected a multipart form upload");
  }

  const file = form.get("file");
  if (!(file instanceof File)) throw new ApiError(422, "file is required");

  const recipeId = typeof form.get("recipe_id") === "string" ? (form.get("recipe_id") as string) : null;
  const ext = (file.name || "photo.jpg").split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ALLOWED_EXT.has(ext) ? ext : "jpg";
  const contentType = file.type || "image/jpeg";
  const storagePath = `uploads/${user.id}/${newId()}.${safeExt}`;

  try {
    const store = getStore(UPLOAD_STORE);
    await store.set(storagePath, await file.arrayBuffer(), { metadata: { contentType } });
  } catch (err) {
    throw new ApiError(502, `Upload failed: ${(err as Error).message}`);
  }

  const record = {
    id: newId(),
    user_id: user.id,
    recipe_id: recipeId,
    storage_path: storagePath,
    url: `/api/files/${storagePath}`,
    content_type: contentType,
  };
  const [saved] = await db.insert(uploads).values(record).returning();

  if (recipeId) {
    await db.insert(custom_photos).values({
      id: newId(),
      user_id: user.id,
      recipe_id: recipeId,
      url: record.url,
    });
  }
  return json(saved);
}

async function serveFile(path: string) {
  const store = getStore(UPLOAD_STORE);
  const result = await store.getWithMetadata(path, { type: "arrayBuffer" });
  if (!result) throw new ApiError(404, "File not found");
  const contentType = (result.metadata?.contentType as string) || "application/octet-stream";
  return new Response(result.data, {
    headers: { ...CORS_HEADERS, "Content-Type": contentType, "Cache-Control": "public, max-age=86400" },
  });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
type Handler = (ctx: {
  req: Request;
  segments: string[];
  url: URL;
}) => Promise<Response>;

const ROUTES: Array<{ method: string; pattern: string[]; handler: Handler }> = [
  { method: "GET", pattern: ["health"], handler: async () => json({ status: "ok" }) },
  { method: "GET", pattern: [], handler: async () => json({ message: "The Mobile Mixery API" }) },

  // --- Auth ---
  {
    method: "POST",
    pattern: ["auth", "register"],
    handler: async ({ req }) => {
      const body = await readJson(req);
      const addr = email(body);
      const password = str(body, "password", { min: 6, max: 128 });
      const name = optionalStr(body, "name", 80);

      const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, addr)).limit(1);
      if (existing) throw new ApiError(409, "An account with this email already exists");

      const [user] = await db
        .insert(users)
        .values({
          id: newId(),
          email: addr,
          name: name || addr.split("@")[0],
          password_hash: await hashPassword(password),
        })
        .returning();
      return json({ access_token: await makeToken(user.id), user: publicUser(user) });
    },
  },
  {
    method: "POST",
    pattern: ["auth", "login"],
    handler: async ({ req }) => {
      const body = await readJson(req);
      const addr = email(body);
      const password = str(body, "password");
      const [user] = await db.select().from(users).where(eq(users.email, addr)).limit(1);
      if (!user || !(await verifyPassword(password, user.password_hash))) {
        throw new ApiError(401, "Invalid email or password");
      }
      return json({ access_token: await makeToken(user.id), user: publicUser(user) });
    },
  },
  {
    method: "GET",
    pattern: ["auth", "me"],
    handler: async ({ req }) => json(publicUser(await requireUser(req))),
  },
  {
    method: "DELETE",
    pattern: ["auth", "me"],
    // Permanently deletes the account and everything attached to it (Apple App
    // Store review requirement). The user comes from the verified token, never
    // from the request body. Dependent rows cascade from the users row.
    handler: async ({ req }) => {
      const user = await requireUser(req);
      await db.delete(users).where(eq(users.id, user.id));
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    },
  },

  // --- Recipes & garnishes (public) ---
  {
    method: "GET",
    pattern: ["recipes"],
    handler: async ({ url }) => {
      await ensureSeeded();
      const category = url.searchParams.get("category");
      const q = url.searchParams.get("q");
      const filters = [];
      if (category && category.toLowerCase() !== "all") filters.push(eq(recipes.category, category));
      // The Python version matched with a case-insensitive regex; ILIKE is the
      // equivalent, but its wildcards have to be escaped out of user input.
      if (q) filters.push(ilike(recipes.name, `%${q.replace(/[\\%_]/g, "\\$&")}%`));
      const rows = await db
        .select()
        .from(recipes)
        .where(filters.length ? and(...filters) : undefined)
        .limit(500);
      return json(rows);
    },
  },
  {
    method: "GET",
    pattern: ["recipes", ":id"],
    handler: async ({ segments }) => {
      await ensureSeeded();
      const [row] = await db.select().from(recipes).where(eq(recipes.id, segments[1])).limit(1);
      if (!row) throw new ApiError(404, "Recipe not found");
      const photos = await db
        .select({ url: custom_photos.url })
        .from(custom_photos)
        .where(eq(custom_photos.recipe_id, segments[1]))
        .limit(50);
      return json({ ...row, custom_photos: photos.map((p) => p.url) });
    },
  },
  {
    method: "GET",
    pattern: ["garnishes"],
    handler: async () => {
      await ensureSeeded();
      return json(await db.select().from(garnishes).limit(100));
    },
  },
  {
    method: "GET",
    pattern: ["categories"],
    handler: async () => {
      await ensureSeeded();
      const rows = await db.selectDistinct({ category: recipes.category }).from(recipes);
      return json(["All", ...rows.map((r) => r.category).sort()]);
    },
  },

  // --- Favorites (auth) ---
  {
    method: "GET",
    pattern: ["favorites"],
    handler: async ({ req }) => {
      const user = await requireUser(req);
      const favs = await db
        .select({ recipe_id: favorites.recipe_id })
        .from(favorites)
        .where(eq(favorites.user_id, user.id))
        .limit(500);
      const ids = favs.map((f) => f.recipe_id);
      if (!ids.length) return json([]);
      return json(await db.select().from(recipes).where(inArray(recipes.id, ids)).limit(500));
    },
  },
  {
    method: "GET",
    pattern: ["favorites", "ids"],
    handler: async ({ req }) => {
      const user = await requireUser(req);
      const favs = await db
        .select({ recipe_id: favorites.recipe_id })
        .from(favorites)
        .where(eq(favorites.user_id, user.id))
        .limit(500);
      return json(favs.map((f) => f.recipe_id));
    },
  },
  {
    method: "POST",
    pattern: ["favorites", ":recipeId"],
    handler: async ({ req, segments }) => {
      const user = await requireUser(req);
      await db
        .insert(favorites)
        .values({ user_id: user.id, recipe_id: segments[1] })
        .onConflictDoNothing();
      return json({ saved: true, recipe_id: segments[1] });
    },
  },
  {
    method: "DELETE",
    pattern: ["favorites", ":recipeId"],
    handler: async ({ req, segments }) => {
      const user = await requireUser(req);
      await db
        .delete(favorites)
        .where(and(eq(favorites.user_id, user.id), eq(favorites.recipe_id, segments[1])));
      return json({ saved: false, recipe_id: segments[1] });
    },
  },

  // --- Events / menus (auth) ---
  {
    method: "GET",
    pattern: ["events"],
    handler: async ({ req }) => {
      const user = await requireUser(req);
      const rows = await db
        .select()
        .from(events)
        .where(and(eq(events.user_id, user.id), isNull(events.deleted_at)))
        .orderBy(desc(events.created_at))
        .limit(200);
      if (!rows.length) return json([]);
      const items = await db
        .select()
        .from(event_items)
        .where(inArray(event_items.event_id, rows.map((r) => r.id)))
        .orderBy(asc(event_items.created_at));
      const grouped = new Map<string, ReturnType<typeof itemPayload>[]>();
      for (const item of items) {
        const list = grouped.get(item.event_id) ?? [];
        list.push(itemPayload(item));
        grouped.set(item.event_id, list);
      }
      return json(rows.map((r) => ({ ...r, items: grouped.get(r.id) ?? [] })));
    },
  },
  {
    method: "POST",
    pattern: ["events"],
    handler: async ({ req }) => {
      const user = await requireUser(req);
      const body = await readJson(req);
      const [row] = await db
        .insert(events)
        .values({
          id: newId(),
          user_id: user.id,
          name: str(body, "name", { min: 1, max: 120 }),
          date: optionalStr(body, "date"),
          vibe: optionalStr(body, "vibe", 120),
          guest_count: optionalInt(body, "guest_count"),
          notes: optionalStr(body, "notes", 1000),
        })
        .returning();
      return json({ ...row, items: [] });
    },
  },
  {
    method: "GET",
    pattern: ["events", ":id"],
    handler: async ({ req, segments }) => {
      const user = await requireUser(req);
      return json(await eventWithItems(segments[1], user.id));
    },
  },
  {
    method: "PUT",
    pattern: ["events", ":id"],
    handler: async ({ req, segments }) => {
      const user = await requireUser(req);
      const body = await readJson(req);
      // Matches the Python behaviour: only non-null fields are applied.
      const updates: Record<string, unknown> = {};
      if (body.name !== undefined && body.name !== null) updates.name = str(body, "name", { min: 1, max: 120 });
      if (body.date !== undefined && body.date !== null) updates.date = body.date;
      if (body.vibe !== undefined && body.vibe !== null) updates.vibe = body.vibe;
      if (body.guest_count !== undefined && body.guest_count !== null) {
        updates.guest_count = optionalInt(body, "guest_count");
      }
      if (body.notes !== undefined && body.notes !== null) updates.notes = body.notes;

      if (Object.keys(updates).length) {
        await db
          .update(events)
          .set(updates)
          .where(and(eq(events.id, segments[1]), eq(events.user_id, user.id)));
      }
      return json(await eventWithItems(segments[1], user.id));
    },
  },
  {
    method: "DELETE",
    pattern: ["events", ":id"],
    handler: async ({ req, segments }) => {
      const user = await requireUser(req);
      // Soft delete, as before — history is kept, the event drops out of lists.
      await db
        .update(events)
        .set({ deleted_at: new Date() })
        .where(and(eq(events.id, segments[1]), eq(events.user_id, user.id)));
      return json({ deleted: true });
    },
  },
  {
    method: "POST",
    pattern: ["events", ":id", "items"],
    handler: async ({ req, segments }) => {
      const user = await requireUser(req);
      const body = await readJson(req);
      await eventWithItems(segments[1], user.id); // 404s when not the caller's event
      await db.insert(event_items).values({
        item_id: newId(),
        event_id: segments[1],
        recipe_id: optionalStr(body, "recipe_id"),
        name: str(body, "name", { max: 200 }),
        category: optionalStr(body, "category", 80) ?? "Cocktails",
        image_url: optionalStr(body, "image_url"),
        garnish: optionalStr(body, "garnish"),
      });
      return json(await eventWithItems(segments[1], user.id));
    },
  },
  {
    method: "DELETE",
    pattern: ["events", ":id", "items", ":itemId"],
    handler: async ({ req, segments }) => {
      const user = await requireUser(req);
      await eventWithItems(segments[1], user.id);
      await db
        .delete(event_items)
        .where(and(eq(event_items.event_id, segments[1]), eq(event_items.item_id, segments[3])));
      return json(await eventWithItems(segments[1], user.id));
    },
  },

  // --- AI ---
  {
    method: "POST",
    pattern: ["ai", "generate-menu"],
    handler: async ({ req }) => json(await generateMenu(await readJson(req))),
  },

  // --- Uploads ---
  { method: "POST", pattern: ["upload"], handler: async ({ req }) => handleUpload(req) },
  {
    method: "GET",
    pattern: ["files", "*"],
    handler: async ({ segments }) => serveFile(segments.slice(1).join("/")),
  },

  // --- Bar tools (public, deterministic math) ---
  {
    method: "POST",
    pattern: ["tools", "shopping-list"],
    handler: async ({ req }) => {
      await ensureSeeded();
      const body = await readJson(req);
      const guests = Math.trunc(num(body, "guests", 1, 2000));
      const drinksPerGuest = num(body, "drinks_per_guest", 0.5, 20, 2.0);
      const recipeIds = Array.isArray(body.recipe_ids) ? body.recipe_ids.filter((v: unknown) => typeof v === "string") : [];
      if (!recipeIds.length) throw new ApiError(422, "recipe_ids must not be empty");

      const rows = await db.select().from(recipes).where(inArray(recipes.id, recipeIds)).limit(500);
      if (!rows.length) throw new ApiError(404, "No matching recipes found");

      const totalDrinks = Math.round(guests * drinksPerGuest);
      const base = Math.floor(totalDrinks / rows.length);
      const remainder = totalDrinks % rows.length;

      const perRecipe = rows.map((r, i) => ({
        id: r.id,
        name: r.name,
        servings: base + (i < remainder ? 1 : 0),
      }));
      const result = computeShoppingList(
        rows.map((r, i) => ({
          name: r.name,
          servings: perRecipe[i].servings,
          ingredients: r.ingredients ?? [],
        })),
      );
      return json({
        guests,
        drinks_per_guest: drinksPerGuest,
        total_drinks: totalDrinks,
        per_recipe: perRecipe,
        ...result,
      });
    },
  },
  {
    method: "POST",
    pattern: ["tools", "batch"],
    handler: async ({ req }) => {
      await ensureSeeded();
      const body = await readJson(req);
      const recipeId = str(body, "recipe_id");
      const servings = Math.trunc(num(body, "servings", 1, 2000));
      const [row] = await db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1);
      if (!row) throw new ApiError(404, "Recipe not found");
      return json(computeBatch(row.name, row.glass, row.ingredients ?? [], servings));
    },
  },
  {
    method: "GET",
    pattern: ["syrups"],
    handler: async () => {
      await ensureSeeded();
      return json(await db.select().from(syrups).limit(100));
    },
  },
  {
    method: "GET",
    pattern: ["syrups", ":id"],
    handler: async ({ segments }) => {
      await ensureSeeded();
      const [row] = await db.select().from(syrups).where(eq(syrups.id, segments[1])).limit(1);
      if (!row) throw new ApiError(404, "Syrup not found");
      return json(row);
    },
  },
  {
    method: "POST",
    pattern: ["tools", "syrup-scale"],
    handler: async ({ req }) => {
      await ensureSeeded();
      const body = await readJson(req);
      const syrupId = str(body, "syrup_id");
      const multiplier = Math.trunc(num(body, "multiplier", 1, 20, 1));
      const [row] = await db.select().from(syrups).where(eq(syrups.id, syrupId)).limit(1);
      if (!row) throw new ApiError(404, "Syrup not found");
      return json(scaleSyrup(row, multiplier));
    },
  },

  // --- Company info ---
  {
    method: "GET",
    pattern: ["company"],
    handler: async () =>
      json({
        name: "The Mobile Mixery",
        tagline: "Craft cocktails, delivered to your event.",
        website: "https://www.themobilemixeryca.com",
        booking_url: "https://www.themobilemixeryca.com",
        blurb:
          "Professional mobile bartending for weddings, corporate events and private parties across California.",
      }),
  },
];

function matches(pattern: string[], segments: string[]): boolean {
  if (pattern[pattern.length - 1] === "*") {
    return segments.length >= pattern.length && pattern.slice(0, -1).every((p, i) => p.startsWith(":") || p === segments[i]);
  }
  if (pattern.length !== segments.length) return false;
  return pattern.every((p, i) => p.startsWith(":") || p === segments[i]);
}

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  // Strip the /api prefix (and the direct function path, when invoked that way)
  // so routes are matched on the part that identifies the resource. /health has
  // no prefix and is matched as-is.
  const segments = url.pathname
    .replace(/^\/+/, "")
    .replace(/^\.netlify\/functions\/api(?:\/|$)/, "")
    .replace(/^api(?:\/|$)/, "")
    .split("/")
    .filter(Boolean);

  try {
    const pathMatch = ROUTES.filter((r) => matches(r.pattern, segments));
    if (!pathMatch.length) throw new ApiError(404, "Not Found");
    const route = pathMatch.find((r) => r.method === req.method);
    if (!route) throw new ApiError(405, "Method Not Allowed");
    return await route.handler({ req, segments, url });
  } catch (err) {
    if (err instanceof ApiError) return json({ detail: err.message }, err.status);
    console.error("Unhandled API error", err);
    return json({ detail: "Something went wrong" }, 500);
  }
};

export const config: Config = {
  path: ["/api", "/api/*", "/health"],
};
