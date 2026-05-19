"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, tasks, comments, activityLogs, projectMembers } from "@/lib/db/schema";

export async function updateUserRole(userId: string, role: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "super_admin") {
    throw new Error("Unauthorized");
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
    throw new Error("Unauthorized");
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
