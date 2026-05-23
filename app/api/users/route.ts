import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "super_admin" && session.user.role !== "admin")) {
    return Response.json({ rows: [], lastRow: 0 });
  }

  const data = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      userId: users.userId,
      profession: users.profession,
      role: users.role,
      active: users.active,
      avatar: users.avatar,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.name);

  const rows = data.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    active: r.active,
    avatar: r.avatar,
    createdAt: r.createdAt.toISOString(),
  }));

  return Response.json({ rows, lastRow: rows.length });
}
