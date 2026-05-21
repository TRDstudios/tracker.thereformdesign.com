import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tasks, projects, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { AgGridTasks } from "./ag-grid-tasks";
import { TaskCreatePanel } from "./task-create-panel";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin =
    session.user.role === "super_admin" || session.user.role === "admin";

  const whereClause = isAdmin
    ? sql`TRUE`
    : eq(tasks.assigneeId, session.user.id);

  const allTasks = await db
    .select()
    .from(tasks)
    .where(whereClause)
    .orderBy(tasks.createdAt);

  const allProjects = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .orderBy(projects.createdAt);

  const projectMap = new Map(allProjects.map((p) => [p.id, p.name]));

  const allUsers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .orderBy(users.name);

  const userMap = new Map(allUsers.map((u) => [u.id, u.name]));

  const taskRows = allTasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    projectName: t.projectId ? projectMap.get(t.projectId) || "" : "",
    assigneeName: t.assigneeId ? userMap.get(t.assigneeId) || "" : "",
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1d]">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-[#1d1d1d]/50">
            View and manage all tasks
          </p>
        </div>
        <TaskCreatePanel projects={allProjects} users={allUsers} />
      </div>
      <AgGridTasks tasks={taskRows} />
    </div>
  );
}
