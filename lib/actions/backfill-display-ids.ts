"use server";

import { eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";

export async function backfillDisplayIds() {
  const rows = await db
    .select({ id: tasks.id, createdAt: tasks.createdAt })
    .from(tasks)
    .where(isNull(tasks.displayId))
    .orderBy(tasks.createdAt);

  for (let i = 0; i < rows.length; i++) {
    const displayId = `TASK-${String(i + 1).padStart(4, "0")}`;
    await db.update(tasks).set({ displayId }).where(eq(tasks.id, rows[i].id));
  }

  return { count: rows.length };
}
