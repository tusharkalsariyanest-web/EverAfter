import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function test() {
  try {
    const users = await db.query.users.findFirst();
    console.log("Users query successful:", users);
  } catch (err: any) {
    console.error("Error querying users:", err.message);
  }
}
test();
