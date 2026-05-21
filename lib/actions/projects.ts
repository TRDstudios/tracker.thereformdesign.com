"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, projectMembers, activityLogs, tasks } from "@/lib/db/schema";
import { createProjectSchema, updateProjectSchema, addProjectMemberSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

async function checkRateLimit(key: string) {
  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  const rl = rateLimit(`${key}:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    throw new Error("Too many requests. Please slow down.");
  }
}

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await checkRateLimit("createProject");

  const parsed = createProjectSchema.parse(Object.fromEntries(formData));

  const [project] = await db
    .insert(projects)
    .values({ name: parsed.name, description: parsed.description ?? null, ownerId: session.user.id })
    .returning();

  await db.insert(projectMembers).values({
    projectId: project.id,
    userId: session.user.id,
    role: "admin",
  });

  await db.insert(activityLogs).values({
    userId: session.user.id,
    action: "created_project",
    entityType: "project",
    entityId: project.id,
  });

  revalidatePath("/projects");
  return { id: project.id };
}

export async function updateProject(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await checkRateLimit("updateProject");

  const parsed = updateProjectSchema.parse(Object.fromEntries(formData));

  await db
    .update(projects)
    .set({
      name: parsed.name,
      description: parsed.description ?? null,
      status: parsed.status,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));

  await db.insert(activityLogs).values({
    userId: session.user.id,
    action: "updated_project",
    entityType: "project",
    entityId: id,
  });

  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
}

export async function deleteProject(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role === "user") {
    throw new Error("Unauthorized");
  }
  await checkRateLimit("deleteProject");

  await db.delete(tasks).where(eq(tasks.projectId, id));
  await db.delete(projectMembers).where(eq(projectMembers.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));

  revalidatePath("/projects");
}

export async function addProjectMember(projectId: string, userId: string, role: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await checkRateLimit("addProjectMember");

  const parsed = addProjectMemberSchema.parse({ projectId, userId, role });

  await db
    .insert(projectMembers)
    .values({
      projectId: parsed.projectId,
      userId: parsed.userId,
      role: parsed.role,
    })
    .onConflictDoNothing();

  await db.insert(activityLogs).values({
    userId: session.user.id,
    action: "added_project_member",
    entityType: "project",
    entityId: parsed.projectId,
    metadata: { userId: parsed.userId, role: parsed.role },
  });

  revalidatePath(`/projects/${parsed.projectId}`);
}

export async function removeProjectMember(projectId: string, userId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await checkRateLimit("removeProjectMember");

  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId),
      ),
    );

  await db.insert(activityLogs).values({
    userId: session.user.id,
    action: "removed_project_member",
    entityType: "project",
    entityId: projectId,
    metadata: { userId },
  });

  revalidatePath(`/projects/${projectId}`);
}
