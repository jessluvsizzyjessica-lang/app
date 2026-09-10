// Auth primitives for the API function: HS256 JWTs and password hashing.
//
// Both are built on node:crypto rather than `jsonwebtoken`/`bcrypt` so the
// function bundle stays free of native modules. The Mongo-era bcrypt hashes are
// not carried over — this deployment starts from an empty user table.
import {
  createHmac,
  randomBytes,
  randomUUID,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { getStore } from "@netlify/blobs";

const scrypt = promisify(scryptCb);

export const TOKEN_DAYS = 30;
const SCRYPT_KEYLEN = 64;
const SIGNING_KEY_STORE = "mobile-mixery-secrets";
const SIGNING_KEY_NAME = "jwt-signing-key";

let cachedKey: string | null = null;

/**
 * The key used to sign session tokens.
 *
 * Prefers a JWT_SECRET environment variable so it can be rotated or shared
 * deliberately. When none is set, a random key is generated once and kept in
 * Netlify Blobs, which persists across deploys — otherwise every deploy would
 * silently sign with a new key and log every user out.
 */
export async function getSigningKey(): Promise<string> {
  if (cachedKey) return cachedKey;

  const fromEnv = (process.env.JWT_SECRET ?? "").trim();
  if (fromEnv) {
    cachedKey = fromEnv;
    return cachedKey;
  }

  const store = getStore({ name: SIGNING_KEY_STORE, consistency: "strong" });
  const existing = await store.get(SIGNING_KEY_NAME, { type: "text" });
  if (existing) {
    cachedKey = existing;
    return cachedKey;
  }

  const generated = randomBytes(48).toString("base64url");
  // onlyIfNew loses the race deliberately: whoever wrote first wins, so
  // concurrent cold starts converge on one key instead of overwriting.
  const written = await store.set(SIGNING_KEY_NAME, generated, { onlyIfNew: true });
  if (!written.modified) {
    const winner = await store.get(SIGNING_KEY_NAME, { type: "text" });
    if (winner) {
      cachedKey = winner;
      return cachedKey;
    }
  }
  cachedKey = generated;
  return cachedKey;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string, key: string): string {
  return createHmac("sha256", key).update(data).digest("base64url");
}

export async function makeToken(userId: string): Promise<string> {
  const key = await getSigningKey();
  const iat = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({ sub: userId, iat, exp: iat + TOKEN_DAYS * 24 * 60 * 60 }),
  );
  const body = `${header}.${payload}`;
  return `${body}.${sign(body, key)}`;
}

/** Returns the subject claim, or null when the token is malformed or expired. */
export async function verifyToken(token: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const key = await getSigningKey();
  const expected = sign(`${parts[0]}.${parts[1]}`, key);
  const a = Buffer.from(parts[2]);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (typeof claims.exp === "number" && claims.exp < Math.floor(Date.now() / 1000)) return null;
    return typeof claims.sub === "string" ? claims.sub : null;
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(plain, salt, SCRYPT_KEYLEN)) as Buffer;
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  try {
    const [scheme, salt, expected] = stored.split("$");
    if (scheme !== "scrypt" || !salt || !expected) return false;
    const derived = (await scrypt(plain, Buffer.from(salt, "base64url"), SCRYPT_KEYLEN)) as Buffer;
    const known = Buffer.from(expected, "base64url");
    return derived.length === known.length && timingSafeEqual(derived, known);
  } catch {
    return false;
  }
}

export function newId(): string {
  return randomUUID();
}
