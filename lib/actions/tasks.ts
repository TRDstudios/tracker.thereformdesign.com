"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tasks, comments, activityLogs } from "@/lib/db/schema";
import { createTaskSchema, addCommentSchema, updateTaskSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { nextTaskDisplayId } from "@/lib/display-id";

async function checkRateLimit(key: string) {
  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  const rl = rateLimit(`${key}:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    throw new Error("Too many requests. Please slow down.");
  }
}

export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await checkRateLimit("createTask");

  const raw = Object.fromEntries(formData);
  const parsed = createTaskSchema.parse({
    ...raw,
    subtaskTitles: raw.subtaskTitles ? JSON.parse(raw.subtaskTitles as string) : undefined,
  });

  const displayId = await nextTaskDisplayId();

  const [task] = await db
    .insert(tasks)
    .values({
      displayId,
      title: parsed.title,
      description: parsed.description ?? null,
      projectId: parsed.projectId ?? null,
      assigneeId: parsed.assigneeId ?? null,
      priority: parsed.priority,
      creatorId: session.user.id,
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
    })
    .returning();

  if (parsed.subtaskTitles?.length) {
    const subs = await Promise.all(
      parsed.subtaskTitles.map(async (title) => ({
        displayId: await nextTaskDisplayId(),
        title,
        projectId: parsed.projectId ?? null,
        assigneeId: null,
        priority: "medium" as const,
        creatorId: session.user.id,
        parentId: task.id,
        status: "todo" as const,
      })),
    );
    await db.insert(tasks).values(subs);
  }

  await db.insert(activityLogs).values({
    userId: session.user.id,
    action: "created_task",
    entityType: "task",
    entityId: task.id,
    metadata: { projectId: parsed.projectId },
  });

  if (parsed.projectId) revalidatePath(`/projects/${parsed.projectId}`);
  revalidatePath("/tasks");
  return { id: task.id, displayId: task.displayId };
}

export async function updateTaskStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await checkRateLimit("updateTaskStatus");

  await db
    .update(tasks)
    .set({
      status: status as "todo" | "in_progress" | "review" | "done",
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));

  await db.insert(activityLogs).values({
    userId: session.user.id,
    action: "updated_task_status",
    entityType: "task",
    entityId: id,
    metadata: { status },
  });

  revalidatePath(`/tasks/${id}`);
  revalidatePath("/tasks");
}

export async function addComment(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await checkRateLimit("addComment");

  const parsed = addCommentSchema.parse(Object.fromEntries(formData));

  await db.insert(comments).values({
    content: parsed.content,
    taskId: parsed.taskId,
    authorId: session.user.id,
  });

  await db.insert(activityLogs).values({
    userId: session.user.id,
    action: "commented_on_task",
    entityType: "task",
    entityId: parsed.taskId,
  });

  revalidatePath(`/tasks/${parsed.taskId}`);
}

export async function updateTask(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await checkRateLimit("updateTask");

  const raw = Object.fromEntries(formData);
  const parsed = updateTaskSchema.parse({
    ...raw,
    subtaskTitles: raw.subtaskTitles ? JSON.parse(raw.subtaskTitles as string) : undefined,
  });

  await db
    .update(tasks)
    .set({
      title: parsed.title,
      description: parsed.description ?? null,
      projectId: parsed.projectId ?? null,
      assigneeId: parsed.assigneeId ?? null,
      priority: parsed.priority,
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));

  await db.delete(tasks).where(eq(tasks.parentId, id));

  if (parsed.subtaskTitles?.length) {
    const subs = await Promise.all(
      parsed.subtaskTitles.map(async (title) => ({
        displayId: await nextTaskDisplayId(),
        title,
        projectId: parsed.projectId ?? null,
        assigneeId: null,
        priority: "medium" as const,
        creatorId: session.user.id,
        parentId: id,
        status: "todo" as const,
      })),
    );
    await db.insert(tasks).values(subs);
  }

  await db.insert(activityLogs).values({
    userId: session.user.id,
    action: "updated_task",
    entityType: "task",
    entityId: id,
  });

  revalidatePath(`/tasks/${id}`);
  revalidatePath("/tasks");
}

export async function deleteTask(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "super_admin") throw new Error("Unauthorized");
  await checkRateLimit("deleteTask");

  await db.update(tasks).set({ parentId: null }).where(eq(tasks.parentId, id));
  await db.delete(comments).where(eq(comments.taskId, id));
  await db.delete(tasks).where(eq(tasks.id, id));

  await db.insert(activityLogs).values({
    userId: session.user.id,
    action: "deleted_task",
    entityType: "task",
    entityId: id,
  });

  revalidatePath("/tasks");
  revalidatePath("/projects");
}
