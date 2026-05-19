import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { tasks, projects } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ListTodo } from "lucide-react";

const statusLabels: Record<string, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const statusStyles: Record<string, string> = {
  backlog: "bg-zinc-100 text-zinc-700",
  todo: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  review: "bg-purple-100 text-purple-700",
  done: "bg-green-100 text-green-700",
};

const priorityBadge: Record<string, "outline" | "secondary" | "default"> = {
  low: "outline",
  medium: "secondary",
  high: "default",
};

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

  const allProjects = await db.select().from(projects);
  const projectMap = new Map(allProjects.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1d]">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-[#1d1d1d]/50">
            View and manage all tasks
          </p>
        </div>
        <Link href="/tasks/new">
          <Button className="rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm">
            <Plus className="mr-1 h-4 w-4" /> New Task
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {allTasks.map((task) => (
          <Link
            key={task.id}
            href={`/tasks/${task.id}`}
            className="group flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f5eb10]/20">
              <ListTodo className="h-5 w-5 text-[#1d1d1d]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1d1d1d]">
                {task.title}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#1d1d1d]/50">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${statusStyles[task.status]}`}
                >
                  {statusLabels[task.status]}
                </span>
                <Badge
                  variant={priorityBadge[task.priority]}
                  className="rounded-md text-[10px]"
                >
                  {task.priority}
                </Badge>
                {task.projectId && projectMap.has(task.projectId) && (
                  <span>{projectMap.get(task.projectId)}</span>
                )}
                {task.dueDate && (
                  <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
        {allTasks.length === 0 && (
          <div className="py-16 text-center text-sm text-[#1d1d1d]/40">
            No tasks yet. Create your first task.
          </div>
        )}
      </div>
    </div>
  );
}
