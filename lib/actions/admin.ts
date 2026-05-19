"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, tasks, comments, activityLogs, projectMembers } from "@/lib/db/schema";

function isAdmin(role: string | undefined) {
  return role === "super_admin" || role === "admin";
}

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "user";

  if (role === "super_admin" && session.user.role !== "super_admin") {
    throw new Error("Only super admin can create super admin accounts");
  }

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return { error: "Email already in use" };
  }

  const passwordHash = await hash(password, 12);

  await db.insert(users).values({
    name,
    email,
    passwordHash,
    role: role as "super_admin" | "admin" | "user",
  });

  revalidatePath("/admin");
}

export async function updateUserRole(userId: string, role: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "super_admin") {
    throw new Error("Only super admin can change roles");
  }

  await db
    .update(users)
    .set({ role: role as "super_admin" | "admin" | "user" })
    .where(eq(users.id, userId));

  revalidatePath("/admin");
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "super_admin") {
    throw new Error("Only super admin can delete users");
  }

  await db.delete(activityLogs).where(eq(activityLogs.userId, userId));
  await db.delete(comments).where(eq(comments.authorId, userId));
  await db.delete(projectMembers).where(eq(projectMembers.userId, userId));

  const userTasks = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.assigneeId, userId));
  for (const t of userTasks) {
    await db.update(tasks).set({ assigneeId: null }).where(eq(tasks.id, t.id));
  }

  await db.delete(users).where(eq(users.id, userId));

  revalidatePath("/admin");
}
