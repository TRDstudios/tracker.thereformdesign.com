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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil } from "lucide-react";
import { StatusButtons } from "./status-buttons";
import { CommentForm } from "./comment-form";
import { DeleteTaskButton } from "./delete-task-button";

const statusLabels: Record<string, string> = {
  backlog: "Backlog",
  todo: "Todo",
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

const priorityColors: Record<string, "outline" | "secondary" | "default"> = {
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

  const [author] = await db
    .select()
    .from(users)
    .where(eq(users.id, task.creatorId));

  const [assignee] = task.assigneeId
    ? await db.select().from(users).where(eq(users.id, task.assigneeId))
    : [];

  const [project] = task.projectId
    ? await db.select().from(projects).where(eq(projects.id, task.projectId))
    : [];

  const taskComments = await db
    .select()
    .from(comments)
    .where(eq(comments.taskId, id))
    .orderBy(comments.createdAt);

  const allUsers = await db.select().from(users);
  const userNames = new Map(allUsers.map((u) => [u.id, u.name]));

  const logs = await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.entityId, id))
    .orderBy(desc(activityLogs.createdAt));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {task.title}
          </h1>
          <Badge variant={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusColors[task.status]}`}
          >
            {statusLabels[task.status]}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {project?.name && `${project.name} · `}
            Created by {author?.name || "Unknown"}
            {assignee?.name && ` · Assigned to ${assignee.name}`}
            {task.dueDate &&
              ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
          </p>
          <div className="flex items-center gap-2">
            <Link href={`/tasks/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-1 h-4 w-4" /> Edit
              </Button>
            </Link>
            <DeleteTaskButton taskId={id} />
          </div>
        </div>
      </div>

      <StatusButtons taskId={id} currentStatus={task.status} />

      {task.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="whitespace-pre-wrap text-sm">{task.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {taskComments.map((comment) => (
            <div key={comment.id} className="space-y-1">
              <p className="text-xs text-zinc-500">
                {userNames.get(comment.authorId) || "Unknown"}
              </p>
              <p className="text-sm">{comment.content}</p>
            </div>
          ))}
          <Separator />
          {logs.map((log) => (
            <p key={log.id} className="text-xs text-zinc-400">
              {userNames.get(log.userId) || "Someone"}{" "}
              {log.action.replace(/_/g, " ")}
            </p>
          ))}
          <CommentForm taskId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
