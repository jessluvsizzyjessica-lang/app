import { drizzle } from "drizzle-orm/netlify-db";
import * as schema from "./schema.js";

// Connection details are supplied by the platform — no connection string here.
export const db = drizzle({ schema });
