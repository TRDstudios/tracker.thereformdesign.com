import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tasks, projects, users } from "@/lib/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ rows: [], lastRow: 0 });
  }

  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get("projectId");

  const isAdmin =
    session.user.role === "super_admin" || session.user.role === "admin";

  const conditions = [];

  if (!isAdmin) {
    conditions.push(eq(tasks.assigneeId, session.user.id));
  }

  if (projectId) {
    conditions.push(eq(tasks.projectId, projectId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select({
      id: tasks.id,
      displayId: tasks.displayId,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      projectId: tasks.projectId,
      assigneeId: tasks.assigneeId,
      projectName: projects.name,
      assigneeName: users.name,
      dueDate: tasks.dueDate,
      createdAt: tasks.createdAt,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(whereClause)
    .orderBy(desc(tasks.createdAt));

  const taskIds = data.map((r) => r.id);
  const subtaskRows = taskIds.length > 0
    ? await db
        .select({ id: tasks.id, title: tasks.title, parentId: tasks.parentId })
        .from(tasks)
        .where(inArray(tasks.parentId, taskIds))
    : [];

  const subtaskMap = new Map<string, { id: string; title: string }[]>();
  for (const st of subtaskRows) {
    const list = subtaskMap.get(st.parentId!) || [];
    list.push({ id: st.id, title: st.title });
    subtaskMap.set(st.parentId!, list);
  }

  const rows = data.map((r) => ({
    ...r,
    dueDate: r.dueDate ? r.dueDate.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    projectName: r.projectName ?? "",
    assigneeName: r.assigneeName ?? "",
    subtasks: subtaskMap.get(r.id) || [],
  }));

  return Response.json({ rows, lastRow: rows.length });
}
