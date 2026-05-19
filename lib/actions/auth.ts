"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { signIn, signOut } from "@/lib/auth";

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return { error: "Email already in use" };
  }

  const passwordHash = await hash(password, 12);

  await db.insert(users).values({
    name,
    email,
    passwordHash,
  });

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
