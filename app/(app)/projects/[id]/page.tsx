import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { projects, tasks, projectMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Users, FolderKanban } from "lucide-react";
import { DeleteProjectButton } from "./delete-project-button";
import { ProjectMembers } from "./project-members";
import { TaskCreatePanel } from "@/app/(app)/tasks/task-create-panel";
import { getAllUsers, getAllProjects } from "@/lib/data";

const statusLabels: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const statusColors: Record<string, string> = {
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

  const allUsers = await getAllUsers();
  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const members = memberRows.map((m) => ({
    ...m,
    user: userMap.get(m.userId) || { name: "Unknown", email: "" },
  }));

  const allProjects = await getAllProjects();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f5eb10]/20">
            <FolderKanban className="h-6 w-6 text-[#1d1d1d]" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1d]">
                {project.name}
              </h1>
              <Badge
                variant={project.status === "active" ? "default" : "secondary"}
                className="rounded-md"
              >
                {project.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[#1d1d1d]/50">
              {project.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/projects/${project.id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-[#e5e5e5]"
            >
              <Pencil className="mr-1 h-4 w-4" /> Edit
            </Button>
          </Link>
          {session.user.role !== "user" && (
            <DeleteProjectButton projectId={project.id} />
          )}
          <TaskCreatePanel
            projects={allProjects}
            users={allUsers}
            defaultProjectId={id}
          >
            <Button
              size="sm"
              className="rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm"
            >
              <Plus className="mr-1 h-4 w-4" /> New Task
            </Button>
          </TaskCreatePanel>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1d1d1d]">
          <Users className="h-4 w-4 text-[#f5eb10]" /> Members ({members.length})
        </h3>
        <div className="mt-4">
          <ProjectMembers
            members={members}
            allUsers={allUsers}
            projectId={id}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {(["todo", "in_progress", "review", "done"] as const).map(
          (status) => {
            const columnTasks = projectTasks.filter(
              (t) => t.status === status,
            );
            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm border">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${statusColors[status]}`}
                  >
                    {statusLabels[status]}
                  </span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f5f5f4] text-[11px] font-medium text-[#1d1d1d]/60">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="block rounded-lg border bg-white p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                      <p className="text-sm font-medium text-[#1d1d1d]">
                        {task.title}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-[#1d1d1d]/50">
                        <Badge variant="outline" className="rounded text-[10px]">
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
                    <div className="rounded-lg border border-dashed border-[#e5e5e5] p-4 text-center text-xs text-[#1d1d1d]/30">
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
