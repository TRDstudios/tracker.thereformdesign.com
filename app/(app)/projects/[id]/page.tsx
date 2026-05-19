import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { projects, tasks, projectMembers, users } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Pencil, Users } from "lucide-react";
import { DeleteProjectButton } from "./delete-project-button";
import { ProjectMembers } from "./project-members";

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

export default async function ProjectDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await props.params;

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));

  if (!project) redirect("/projects");

  const projectTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, id))
    .orderBy(tasks.createdAt);

  const memberRows = await db
    .select()
    .from(projectMembers)
    .where(eq(projectMembers.projectId, id));

  const userIds = memberRows.map((m) => m.userId);
  const memberUsers = userIds.length > 0
    ? await db.select().from(users).where(inArray(users.id, userIds))
    : [];

  const members = memberRows.map((m) => ({
    ...m,
    user: memberUsers.find((u) => u.id === m.userId) || { name: "Unknown", email: "" },
  }));

  const allUsers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .orderBy(users.name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {project.name}
            </h1>
            <Badge
              variant={project.status === "active" ? "default" : "secondary"}
            >
              {project.status}
            </Badge>
          </div>
          <p className="text-sm text-zinc-500">
            {project.description || "No description"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/projects/${project.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-1 h-4 w-4" /> Edit
            </Button>
          </Link>
          {session.user.role !== "user" && (
            <DeleteProjectButton projectId={project.id} />
          )}
          <Link href={`/tasks/new?projectId=${project.id}`}>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> New Task
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" /> Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectMembers
            members={members}
            allUsers={allUsers}
            projectId={id}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-4">
        {(["backlog", "todo", "in_progress", "review", "done"] as const).map(
          (status) => {
            const columnTasks = projectTasks.filter(
              (t) => t.status === status,
            );
            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3
                    className={`rounded-md px-2 py-1 text-xs font-medium ${statusColors[status]}`}
                  >
                    {statusLabels[status]}
                  </h3>
                  <span className="text-xs text-zinc-400">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="block rounded-lg border bg-white p-3 transition-colors hover:bg-zinc-50"
                    >
                      <p className="text-sm font-medium">{task.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                        <Badge variant="outline" className="text-[10px]">
                          {task.priority}
                        </Badge>
                        {task.dueDate && (
                          <span>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="rounded-lg border border-dashed p-3 text-center text-xs text-zinc-400">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
