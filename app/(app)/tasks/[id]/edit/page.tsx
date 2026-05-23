import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tasks, projects, users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { EditTaskForm } from "./edit-form";
import { sql } from "drizzle-orm";

export default async function EditTaskPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await props.params;

  const [task] = await db
    .select()
    .from(tasks)
    .where(
      id.startsWith("TASK-")
        ? eq(tasks.displayId, id)
        : or(eq(tasks.displayId, id), eq(tasks.id, id)),
    );
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
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1d]">
          Edit Task
        </h1>
      </div>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <EditTaskForm task={task} projects={allProjects} users={allUsers} />
      </div>
    </div>
  );
}
