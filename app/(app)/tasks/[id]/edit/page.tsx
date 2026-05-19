import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tasks, projects, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EditTaskForm } from "./edit-form";
import { Card, CardContent } from "@/components/ui/card";
import { sql } from "drizzle-orm";

export default async function EditTaskPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await props.params;

  const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
  if (!task) redirect("/tasks");

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
        <h1 className="text-2xl font-semibold tracking-tight">Edit Task</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <EditTaskForm task={task} projects={allProjects} users={allUsers} />
        </CardContent>
      </Card>
    </div>
  );
}
