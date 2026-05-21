"use server";

import { eq, or } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { signOut } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function validateLogin(formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for") || "unknown";

  const rl = rateLimit(`login:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return { error: "Too many login attempts. Please try again later." };
  }

  let identifier: string, password: string;
  try {
    const parsed = loginSchema.parse(Object.fromEntries(formData));
    identifier = parsed.email;
    password = parsed.password;
  } catch {
    return { error: "Invalid email or password format" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(or(eq(users.email, identifier), eq(users.userId, identifier)));
  if (!user) {
    return { error: "Invalid email or password" };
  }

  const { compare } = await import("bcryptjs");
  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  return { success: true, email: user.email, password };
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
