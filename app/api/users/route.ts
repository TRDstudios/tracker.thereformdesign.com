import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql, desc, asc, and, ilike, type SQL } from "drizzle-orm";
import { auth } from "@/lib/auth";

function getSortField(colId: string) {
  switch (colId) {
    case "name": return users.name;
    case "email": return users.email;
    case "role": return users.role;
    case "active": return users.active;
    case "createdAt": return users.createdAt;
    default: return null;
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "super_admin" && session.user.role !== "admin")) {
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

  const conditions: SQL[] = [];

  for (const [field, filter] of Object.entries(filterModel)) {
    if (!filter.filter) continue;
    if (field === "name") {
      conditions.push(ilike(users.name, `%${filter.filter}%`));
    } else if (field === "email") {
      conditions.push(ilike(users.email, `%${filter.filter}%`));
    } else if (field === "role") {
      conditions.push(eq(users.role, filter.filter as "super_admin" | "admin" | "user"));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const orderByClauses = sortModel.length > 0
    ? sortModel.map((s) => {
        const col = getSortField(s.colId);
        return col ? (s.sort === "desc" ? desc(col) : asc(col)) : desc(users.createdAt);
      })
    : [desc(users.createdAt)];

  const pageSize = endRow - startRow;

  const data = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      active: users.active,
      avatar: users.avatar,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(whereClause)
    .orderBy(...orderByClauses)
    .limit(pageSize)
    .offset(startRow);

  const countResult = await db
    .select({ value: sql<number>`count(*)` })
    .from(users)
    .where(whereClause);

  const lastRow = countResult[0]?.value ?? 0;

  const rows = data.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    active: r.active,
    avatar: r.avatar,
    createdAt: r.createdAt.toISOString(),
  }));

  return Response.json({ rows, lastRow });
}
