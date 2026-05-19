import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { tasks, projects } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const statusLabels: Record<string, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-zinc-500">View and manage all tasks</p>
        </div>
        <Link href="/tasks/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" /> New Task
          </Button>
        </Link>
      </div>
      <div className="space-y-2">
        {allTasks.map((task) => (
          <Link
            key={task.id}
            href={`/tasks/${task.id}`}
            className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-zinc-50"
          >
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{task.title}</p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Badge variant="outline" className="text-xs">
                  {statusLabels[task.status]}
                </Badge>
                <Badge variant={priorityBadge[task.priority]} className="text-xs">
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
          <div className="py-12 text-center text-sm text-zinc-500">
            No tasks yet. Create your first task.
          </div>
        )}
      </div>
    </div>
  );
}
