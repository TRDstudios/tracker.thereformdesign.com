"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tasks, comments, activityLogs } from "@/lib/db/schema";

export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const projectId = formData.get("projectId") as string;
  const assigneeId = formData.get("assigneeId") as string;
  const priority = (formData.get("priority") as string) || "medium";
  const dueDate = formData.get("dueDate") as string;

  const [task] = await db
    .insert(tasks)
    .values({
      title,
      description,
      projectId: projectId || null,
      assigneeId: assigneeId || null,
      priority: priority as "low" | "medium" | "high",
      creatorId: session.user.id,
      dueDate: dueDate ? new Date(dueDate) : null,
    })
    .returning();

  await db.insert(activityLogs).values({
    userId: session.user.id,
    action: "created_task",
    entityType: "task",
    entityId: task.id,
    metadata: JSON.stringify({ projectId }),
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/tasks");
  return { id: task.id };
}

export async function updateTaskStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db
    .update(tasks)
    .set({
      status: status as "backlog" | "todo" | "in_progress" | "review" | "done",
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));

  await db.insert(activityLogs).values({
    userId: session.user.id,
    action: "updated_task_status",
    entityType: "task",
    entityId: id,
    metadata: JSON.stringify({ status }),
  });

  revalidatePath(`/tasks/${id}`);
  revalidatePath("/tasks");
}

export async function addComment(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const content = formData.get("content") as string;
  const taskId = formData.get("taskId") as string;

  await db.insert(comments).values({
    content,
    taskId,
    authorId: session.user.id,
  });

  await db.insert(activityLogs).values({
    userId: session.user.id,
    action: "commented_on_task",
    entityType: "task",
    entityId: taskId,
  });

  revalidatePath(`/tasks/${taskId}`);
}

export async function updateTask(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const projectId = formData.get("projectId") as string;
  const assigneeId = formData.get("assigneeId") as string;
  const priority = (formData.get("priority") as string) || "medium";
  const dueDate = formData.get("dueDate") as string;

  await db
    .update(tasks)
    .set({
      title,
      description,
      projectId: projectId || null,
      assigneeId: assigneeId || null,
      priority: priority as "low" | "medium" | "high",
      dueDate: dueDate ? new Date(dueDate) : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));

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
  if (!session?.user) throw new Error("Unauthorized");

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
