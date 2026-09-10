import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  // Netlify only applies migrations it finds in this directory.
  out: "netlify/database/migrations",
});
