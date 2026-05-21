import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { projects, users } from "@/lib/db/schema";
import { eq, sql, desc, asc, and, ilike, type SQL } from "drizzle-orm";
import { auth } from "@/lib/auth";

function getSortField(colId: string) {
  switch (colId) {
    case "name": return projects.name;
    case "status": return projects.status;
    case "createdAt": return projects.createdAt;
    default: return null;
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ rows: [], lastRow: 0 });
  }

  const isAdmin = session.user.role === "super_admin" || session.user.role === "admin";

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

  const conditions: SQL[] = [];

  if (!isAdmin) {
    conditions.push(eq(projects.ownerId, session.user.id));
  }

  for (const [field, filter] of Object.entries(filterModel)) {
    if (!filter.filter) continue;
    if (field === "name") {
      conditions.push(ilike(projects.name, `%${filter.filter}%`));
    } else if (field === "status") {
      conditions.push(eq(projects.status, filter.filter as "active" | "archived"));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const orderByClauses = sortModel.length > 0
    ? sortModel.map((s) => {
        const col = getSortField(s.colId);
        return col ? (s.sort === "desc" ? desc(col) : asc(col)) : desc(projects.createdAt);
      })
    : [desc(projects.createdAt)];

  const pageSize = endRow - startRow;

  const data = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      ownerId: projects.ownerId,
      ownerName: users.name,
      stack: projects.stack,
      liveUrl: projects.liveUrl,
      demoUrl: projects.demoUrl,
      features: projects.features,
      serverDetails: projects.serverDetails,
      domainDetails: projects.domainDetails,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .leftJoin(users, eq(projects.ownerId, users.id))
    .where(whereClause)
    .orderBy(...orderByClauses)
    .limit(pageSize)
    .offset(startRow);

  const countResult = await db
    .select({ value: sql<number>`count(*)` })
    .from(projects)
    .leftJoin(users, eq(projects.ownerId, users.id))
    .where(whereClause);

  const lastRow = countResult[0]?.value ?? 0;

  const rows = data.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    status: r.status,
    ownerId: r.ownerId,
    ownerName: r.ownerName ?? "",
    stack: r.stack,
    liveUrl: r.liveUrl,
    demoUrl: r.demoUrl,
    features: r.features,
    serverDetails: r.serverDetails,
    domainDetails: r.domainDetails,
    createdAt: r.createdAt.toISOString(),
  }));

  return Response.json({ rows, lastRow });
}
