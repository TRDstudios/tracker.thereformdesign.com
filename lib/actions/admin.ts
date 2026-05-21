"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, tasks, comments, activityLogs, projectMembers, projects } from "@/lib/db/schema";
import { createUserSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

async function checkRateLimit(key: string) {
  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  const rl = rateLimit(`${key}:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    throw new Error("Too many requests. Please slow down.");
  }
}

function isAdmin(role: string | undefined) {
  return role === "super_admin" || role === "admin";
}

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }
  await checkRateLimit("createUser");

  const parsed = createUserSchema.parse(Object.fromEntries(formData));

  if (parsed.role === "super_admin" && session.user.role !== "super_admin") {
    throw new Error("Only super admin can create super admin accounts");
  }

  const existingEmail = await db.select().from(users).where(eq(users.email, parsed.email));
  if (existingEmail.length > 0) {
    return { error: "Email already in use" };
  }

  const existingUserId = await db.select().from(users).where(eq(users.userId, parsed.userId));
  if (existingUserId.length > 0) {
    return { error: "User ID already taken" };
  }

  const passwordHash = await hash(parsed.password, 12);

  await db.insert(users).values({
    name: parsed.name,
    email: parsed.email,
    userId: parsed.userId,
    profession: parsed.profession,
    passwordHash,
    role: parsed.role,
  });

  revalidatePath("/admin");
}

export async function updateUserRole(userId: string, role: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "super_admin") {
    throw new Error("Only super admin can change roles");
  }
  await checkRateLimit("updateUserRole");

  await db
    .update(users)
    .set({ role: role as "super_admin" | "admin" | "user" })
    .where(eq(users.id, userId));

  revalidatePath("/admin");
}

export async function deactivateUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "super_admin") {
    throw new Error("Only super admin can deactivate users");
  }
  await checkRateLimit("deactivateUser");

  await db.update(users).set({ active: false }).where(eq(users.id, userId));

  revalidatePath("/admin");
}

export async function activateUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "super_admin") {
    throw new Error("Only super admin can activate users");
  }
  await checkRateLimit("activateUser");

  await db.update(users).set({ active: true }).where(eq(users.id, userId));

  revalidatePath("/admin");
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "super_admin") {
    throw new Error("Only super admin can delete users");
  }
  await checkRateLimit("deleteUser");

  const actingUserId = session.user.id;

  // neon-http driver doesn't support db.transaction(), run sequentially
  await db.update(projects).set({ ownerId: actingUserId }).where(eq(projects.ownerId, userId));
  await db.update(tasks).set({ creatorId: actingUserId }).where(eq(tasks.creatorId, userId));
  await db.update(tasks).set({ assigneeId: null }).where(eq(tasks.assigneeId, userId));
  await db.delete(activityLogs).where(eq(activityLogs.userId, userId));
  await db.delete(comments).where(eq(comments.authorId, userId));
  await db.delete(projectMembers).where(eq(projectMembers.userId, userId));
  await db.delete(users).where(eq(users.id, userId));

  revalidatePath("/admin");
}
