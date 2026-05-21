import { cache } from "react";
import { db } from "@/lib/db";
import { tasks, projects, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const getTaskCount = cache(async () => {
  const [row] = await db.select({ value: sql<number>`count(*)` }).from(tasks);
  return row.value;
});

export const getProjectCount = cache(async () => {
  const [row] = await db.select({ value: sql<number>`count(*)` }).from(projects);
  return row.value;
});

export const getUserCount = cache(async () => {
  const [row] = await db.select({ value: sql<number>`count(*)` }).from(users);
  return row.value;
});

export const getInProgressTaskCount = cache(async () => {
  const [row] = await db
    .select({ value: sql<number>`count(*)` })
    .from(tasks)
    .where(eq(tasks.status, "in_progress"));
  return row.value;
});

export const getAllProjects = cache(async () => {
  return db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .orderBy(projects.createdAt);
});

export const getAllUsers = cache(async () => {
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .orderBy(users.name);
});
