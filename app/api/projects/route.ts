import { db } from "@/lib/db";
import { projects, users } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ rows: [], lastRow: 0 });
  }

  // All authenticated users should see all projects; no owner-only filter.

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
    .orderBy(desc(projects.createdAt));

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

  return Response.json({ rows, lastRow: rows.length });
}
