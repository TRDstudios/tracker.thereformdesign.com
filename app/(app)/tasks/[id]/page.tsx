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
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, ListTodo } from "lucide-react";
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

  const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
  if (!task) redirect("/tasks");

  const allUsers = await db.select().from(users);
  const userNames = new Map(allUsers.map((u) => [u.id, u.name]));

  const [project] = task.projectId
    ? await db.select({ name: projects.name }).from(projects).where(eq(projects.id, task.projectId))
    : [];

  const taskComments = await db
    .select()
    .from(comments)
    .where(eq(comments.taskId, id))
    .orderBy(comments.createdAt);

  const logs = await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.entityId, id))
    .orderBy(desc(activityLogs.createdAt));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f5eb10]/20">
          <ListTodo className="h-6 w-6 text-[#1d1d1d]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1d]">
              {task.title}
            </h1>
            <Badge variant={priorityBadge[task.priority]} className="rounded-md">
              {task.priority}
            </Badge>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusColors[task.status]}`}
            >
              {statusLabels[task.status]}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-4">
            <p className="text-sm text-[#1d1d1d]/50">
              {project?.name && `${project.name} · `}
              Created by {userNames.get(task.creatorId) || "Unknown"}
              {task.assigneeId && ` · Assigned to ${userNames.get(task.assigneeId) || "Unknown"}`}
              {task.dueDate &&
                ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/tasks/${id}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-[#e5e5e5]"
                >
                  <Pencil className="mr-1 h-4 w-4" /> Edit
                </Button>
              </Link>
              <DeleteTaskButton taskId={id} />
            </div>
          </div>
        </div>
      </div>

      <StatusButtons taskId={id} currentStatus={task.status} />

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
        <div className="mt-5 space-y-4">
          {taskComments.map((comment) => (
            <div key={comment.id} className="space-y-1">
              <p className="text-xs font-medium text-[#f5eb10]">
                {userNames.get(comment.authorId) || "Unknown"}
              </p>
              <p className="text-sm text-[#1d1d1d]/80">{comment.content}</p>
            </div>
          ))}
          <div className="border-t border-[#e5e5e5]" />
          {logs.map((log) => (
            <p key={log.id} className="text-xs text-[#1d1d1d]/40">
              {userNames.get(log.userId) || "Someone"}{" "}
              {log.action.replace(/_/g, " ")}
            </p>
          ))}
          <div className="border-t border-[#e5e5e5]" />
          <CommentForm taskId={id} />
        </div>
      </div>
    </div>
  );
}
