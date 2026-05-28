import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  tasks,
  comments,
  users,
  activityLogs,
  projects,
} from "@/lib/db/schema";
import { eq, desc, and, gte, or } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { StatusButtons } from "./status-buttons";
import { CommentForm } from "./comment-form";
import { DeleteTaskButton } from "./delete-task-button";

const statusLabels: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const statusColors: Record<string, string> = {
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

export default async function TaskDetailPage(props: {
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

  const allUsers = await db.select({ id: users.id, name: users.name }).from(users);
  const userNames = new Map(allUsers.map((u) => [u.id, u.name]));

  const [project] = task.projectId
    ? await db.select({ name: projects.name }).from(projects).where(eq(projects.id, task.projectId))
    : [];

  const taskComments = await db
    .select()
    .from(comments)
    .where(eq(comments.taskId, task.id))
    .orderBy(comments.createdAt);

  // eslint-disable-next-line react-hooks/purity
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const logs = await db
    .select()
    .from(activityLogs)
    .where(and(eq(activityLogs.entityId, task.id), gte(activityLogs.createdAt, ninetyDaysAgo)))
    .orderBy(desc(activityLogs.createdAt));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <nav className="flex items-center gap-2 text-sm text-[#a1a1a1]">
        <Link href="/dashboard" className="hover:text-[#1d1d1d] transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/tasks" className="hover:text-[#1d1d1d] transition-colors">Tasks</Link>
        <span>/</span>
        <span className="text-[#1d1d1d] font-medium truncate max-w-[200px]">{task.displayId || task.id}</span>
      </nav>

      <div className="flex items-center gap-3">
        {task.displayId && (
          <span className="rounded-md bg-[#f5eb10]/20 px-2 py-0.5 font-mono text-xs font-semibold text-[#1d1d1d]">
            {task.displayId}
          </span>
        )}
        <Badge variant={priorityBadge[task.priority]} className="rounded-md text-xs">
          {task.priority}
        </Badge>
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusColors[task.status]}`}
        >
          {statusLabels[task.status]}
        </span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-[#1d1d1d]">
            {task.title}
          </h1>
          <p className="mt-1 text-sm text-[#1d1d1d]/50">
            {project?.name && `${project.name} · `}
            Created by {userNames.get(task.creatorId) || "Unknown"}
            {task.assigneeId && ` · Assigned to ${userNames.get(task.assigneeId) || "Unknown"}`}
            {task.dueDate &&
              ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/tasks/${task.displayId || task.id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-[#e5e5e5]"
            >
              <Pencil className="mr-1 h-4 w-4" /> Edit
            </Button>
          </Link>
          {session.user.role === "super_admin" && (
            <DeleteTaskButton taskId={task.id} />
          )}
        </div>
      </div>

      <StatusButtons taskId={task.id} currentStatus={task.status} />

      {task.description && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="whitespace-pre-wrap text-sm text-[#1d1d1d]/80 leading-relaxed">
            {task.description}
          </p>
        </div>
      )}

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#1d1d1d]">
          Activity
        </h3>
        <div className="mt-5 space-y-5">
          {taskComments.map((comment) => {
            const name = userNames.get(comment.authorId) || "Unknown";
            const initial = name.charAt(0).toUpperCase();
            return (
              <div key={comment.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f5eb10]/30 text-xs font-bold text-[#1d1d1d]">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#1d1d1d]">{name}</p>
                  <p className="mt-0.5 text-sm text-[#1d1d1d]/70">{comment.content}</p>
                </div>
              </div>
            );
          })}
          <div className="border-t border-[#e5e5e5]" />
          {logs.map((log) => {
            const name = userNames.get(log.userId) || "Someone";
            const initial = name.charAt(0).toUpperCase();
            return (
              <div key={log.id} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e5e5e5] text-xs font-bold text-[#a1a1a1]">
                  {initial}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-xs text-[#a1a1a1]">
                    <span className="font-medium text-[#1d1d1d]">{name}</span>{" "}
                    {log.action.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            );
          })}
          <div className="border-t border-[#e5e5e5]" />
          <CommentForm taskId={task.id} />
        </div>
      </div>
    </div>
  );
}
