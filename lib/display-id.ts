import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";

export async function nextTaskDisplayId(): Promise<string> {
  const [row] = await db
    .select({ value: sql<string>`max(display_id)` })
    .from(tasks);
  const lastId = row?.value || "TASK-0000";
  const num = parseInt(lastId.replace("TASK-", ""), 10);
  return `TASK-${String(num + 1).padStart(4, "0")}`;
}
