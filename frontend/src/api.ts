import { Platform } from "react-native";

import { storage } from "@/src/utils/storage";

// EXPO_PUBLIC_* values are inlined at build time, so an unset var silently
// becomes undefined and every request goes to "undefined/api/...". Normalise the
// trailing slash so the value can be concatenated safely.
const CONFIGURED_BASE = (process.env.EXPO_PUBLIC_BACKEND_URL ?? "").trim().replace(/\/+$/, "");

// The API runs as a Netlify Function on the same site as the web build, so an
// empty base is the correct default there: requests resolve against the current
// origin. A native build has no origin to fall back on, so it still needs
// EXPO_PUBLIC_BACKEND_URL and should say so plainly instead of requesting
// "undefined/api/...".
export const API_BASE = CONFIGURED_BASE;
export const API_CONFIGURED = CONFIGURED_BASE !== "" || Platform.OS === "web";
export const TOKEN_KEY = "mm_token";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function getToken(): Promise<string | null> {
  return storage.secureGet<string>(TOKEN_KEY, "").then((v) => v || null);
}
export async function setToken(token: string) {
  await storage.secureSet(TOKEN_KEY, token);
}
export async function clearToken() {
  await storage.secureRemove(TOKEN_KEY);
}

type Options = {
  method?: string;
  body?: any;
  auth?: boolean;
};

export async function apiFetch<T = any>(path: string, opts: Options = {}): Promise<T> {
  const { method = "GET", body, auth = false } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (!API_CONFIGURED) {
    throw new ApiError("Backend URL is not configured (EXPO_PUBLIC_BACKEND_URL is unset in this build).", 0);
  }
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = "Something went wrong";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {}
    throw new ApiError(detail, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Resolve backend-relative image paths (e.g. /api/files/...) to absolute URLs.
export function resolveImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  if (!API_CONFIGURED) return undefined;
  return `${API_BASE}${url}`;
}

// ---- Types ----
export type Recipe = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  image_url: string;
  glass: string;
  base_spirit: string;
  ingredients: string[];
  steps: string[];
  garnish: string;
  difficulty: string;
  custom_photos?: string[];
};

export type Garnish = { id: string; title: string; image_url: string; tip: string };

export type MenuItemT = {
  item_id?: string;
  recipe_id?: string | null;
  name: string;
  category: string;
  image_url?: string | null;
  garnish?: string | null;
};

export type EventT = {
  id: string;
  name: string;
  date?: string | null;
  vibe?: string | null;
  guest_count?: number | null;
  notes?: string | null;
  items: MenuItemT[];
  created_at: string;
};

export type AIDrink = {
  name: string;
  type: string;
  base_spirit: string;
  ingredients: string[];
  garnish: string;
  why: string;
};
export type AIMenu = { menu_title: string; summary: string; drinks: AIDrink[] };

export type ShoppingItem = { name: string; total_oz?: number; amount_display: string; bottles_display?: string };
export type ShoppingResult = {
  guests: number;
  drinks_per_guest: number;
  total_drinks: number;
  per_recipe: { id: string; name: string; servings: number }[];
  shopping: ShoppingItem[];
  counts: { name: string; amount_display: string }[];
  extras: string[];
};

export type BatchRow = {
  name: string;
  per_serving: string;
  total_oz: number;
  amount_display: string;
  bottles_display: string;
  kind: "oz" | "count" | "to_taste";
};
export type BatchResult = {
  name: string;
  glass?: string | null;
  servings: number;
  ingredients: BatchRow[];
  concentrate_oz: number;
  dilution_oz: number;
  batch_volume_oz: number;
  batch_volume_display: string;
  gallons: number;
  pours: number;
  container: string;
  notes: string[];
};
