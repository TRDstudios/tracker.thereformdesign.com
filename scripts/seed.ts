import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import { users } from "../lib/db/schema";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const email = "admin@tracker.com";
  const existing = await db.select().from(users);
  if (existing.length > 0) {
    console.log("Users already exist, skipping seed.");
    return;
  }

  const passwordHash = await hash("admin123", 12);

  await db.insert(users).values({
    name: "Super Admin",
    email,
    passwordHash,
    role: "super_admin",
  });

  console.log("Super admin created:", email, "/ admin123");
}

main().catch(console.error);
