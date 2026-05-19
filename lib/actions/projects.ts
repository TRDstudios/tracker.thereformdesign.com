"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, projectMembers, activityLogs, tasks } from "@/lib/db/schema";

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const [project] = await db
    .insert(projects)
    .values({ name, description, ownerId: session.user.id })
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

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;

  await db
    .update(projects)
    .set({
      name,
      description,
      status: status as "active" | "archived",
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

  await db.delete(tasks).where(eq(tasks.projectId, id));
  await db.delete(projectMembers).where(eq(projectMembers.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));

  revalidatePath("/projects");
}

export async function addProjectMember(projectId: string, userId: string, role: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db
    .insert(projectMembers)
    .values({
      projectId,
      userId,
      role: role as "admin" | "member",
    })
    .onConflictDoNothing();

  await db.insert(activityLogs).values({
    userId: session.user.id,
    action: "added_project_member",
    entityType: "project",
    entityId: projectId,
    metadata: JSON.stringify({ userId, role }),
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function removeProjectMember(projectId: string, userId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

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
    metadata: JSON.stringify({ userId }),
  });

  revalidatePath(`/projects/${projectId}`);
}
