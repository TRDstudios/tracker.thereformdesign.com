import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { comments, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json([]);
  }

  const taskId = request.nextUrl.searchParams.get("taskId");
  if (!taskId) return Response.json([]);

  const rows = await db
    .select({
      id: comments.id,
      content: comments.content,
      authorId: comments.authorId,
      authorName: users.name,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.taskId, taskId))
    .orderBy(desc(comments.createdAt));

  return Response.json(rows);
}
