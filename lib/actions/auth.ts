"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { signIn, signOut } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function register(formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for") || "unknown";

  const rl = rateLimit(`register:${ip}`, 5, 900_000);
  if (!rl.allowed) {
    return { error: "Too many registration attempts. Please try again later." };
  }

  const parsed = registerSchema.parse(Object.fromEntries(formData));

  const existing = await db.select().from(users).where(eq(users.email, parsed.email));
  if (existing.length > 0) {
    return { error: "Email already in use" };
  }

  const passwordHash = await hash(parsed.password, 12);

  await db.insert(users).values({
    name: parsed.name,
    email: parsed.email,
    passwordHash,
  });

  await signIn("credentials", { email: parsed.email, password: parsed.password, redirectTo: "/dashboard" });
}

export async function login(formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for") || "unknown";

  const rl = rateLimit(`login:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return { error: "Too many login attempts. Please try again later." };
  }

  const parsed = loginSchema.parse(Object.fromEntries(formData));

  await signIn("credentials", { email: parsed.email, password: parsed.password, redirectTo: "/dashboard" });
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
