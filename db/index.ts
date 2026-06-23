import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";

// 1. Safety Check: Fails immediately if your .env is missing or named incorrectly
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from your .env file!");
}

// 2. Setup the connection
const sql = neon(process.env.DATABASE_URL);

// 3. Export the db instance
export const db = drizzle(sql, { schema });

