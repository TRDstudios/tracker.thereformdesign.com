import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tasks, projects, users } from "@/lib/db/schema";
import { eq, sql, desc, asc, and, ilike, type SQL } from "drizzle-orm";
import { auth } from "@/lib/auth";

function getSortField(colId: string) {
  switch (colId) {
    case "projectName": return projects.name;
    case "title": return tasks.title;
    case "status": return tasks.status;
    case "priority": return tasks.priority;
    case "assigneeName": return users.name;
    case "dueDate": return tasks.dueDate;
    case "createdAt": return tasks.createdAt;
    default: return null;
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ rows: [], lastRow: 0 });
  }

  const searchParams = request.nextUrl.searchParams;
  const startRow = parseInt(searchParams.get("startRow") || "0");
  const endRow = parseInt(searchParams.get("endRow") || "100");
  const sortModel = JSON.parse(searchParams.get("sortModel") || "[]") as {
    colId: string;
    sort: "asc" | "desc";
  }[];
  const filterModel = JSON.parse(searchParams.get("filterModel") || "{}") as Record<
    string,
    { filterType: string; type: string; filter?: string; filterTo?: string }
  >;

  const isAdmin =
    session.user.role === "super_admin" || session.user.role === "admin";

  const conditions: SQL[] = [];

  if (!isAdmin) {
    conditions.push(eq(tasks.assigneeId, session.user.id));
  }

  for (const [field, filter] of Object.entries(filterModel)) {
    if (!filter.filter) continue;
    if (field === "projectName") {
      conditions.push(ilike(projects.name, `%${filter.filter}%`));
    } else if (field === "assigneeName") {
      conditions.push(ilike(users.name, `%${filter.filter}%`));
    } else if (field === "title") {
      conditions.push(ilike(tasks.title, `%${filter.filter}%`));
    } else if (field === "status") {
      conditions.push(eq(tasks.status, filter.filter as "todo" | "in_progress" | "review" | "done"));
    } else if (field === "priority") {
      conditions.push(eq(tasks.priority, filter.filter as "low" | "medium" | "high"));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const orderByClauses = sortModel.length > 0
    ? sortModel.map((s) => {
        const col = getSortField(s.colId);
        return col ? (s.sort === "desc" ? desc(col) : asc(col)) : desc(tasks.createdAt);
      })
    : [desc(tasks.createdAt)];

  const pageSize = endRow - startRow;

  const data = await db
    .select({
      id: tasks.id,
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
    .orderBy(...orderByClauses)
    .limit(pageSize)
    .offset(startRow);

  const countResult = await db
    .select({ value: sql<number>`count(*)` })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(whereClause);

  const lastRow = countResult[0]?.value ?? 0;

  const rows = data.map((r) => ({
    ...r,
    dueDate: r.dueDate ? r.dueDate.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    projectName: r.projectName ?? "",
    assigneeName: r.assigneeName ?? "",
  }));

  return Response.json({ rows, lastRow });
}
