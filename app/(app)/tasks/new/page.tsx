import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { projects, users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { TaskForm } from "../task-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewTaskPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const allProjects = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(sql`TRUE`)
    .orderBy(projects.createdAt);

  const allUsers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .orderBy(users.name);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Task</h1>
        <p className="text-sm text-zinc-500">Add a new task</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Suspense>
            <TaskForm projects={allProjects} users={allUsers} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
