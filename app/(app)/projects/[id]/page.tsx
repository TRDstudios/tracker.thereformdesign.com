import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, FolderKanban } from "lucide-react";
import { DeleteProjectButton } from "./delete-project-button";
import { TaskCreatePanel } from "@/app/(app)/tasks/task-create-panel";
import { getAllUsers, getAllProjects } from "@/lib/data";
import { ProjectTasksGrid } from "./project-tasks-grid";

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

  const allUsers = await getAllUsers();
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

      <div className="grid grid-cols-3 gap-4">
        {project.stack?.length ? (
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1d1d1d]">
              <svg className="h-4 w-4 text-[#f5eb10]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
              Stack
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.stack.map((s: string) => (
                <span key={s} className="rounded-md bg-[#f5f5f4] px-2.5 py-1 text-xs font-medium text-[#1d1d1d]/70">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {(project.liveUrl || project.demoUrl) ? (
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1d1d1d]">
              <svg className="h-4 w-4 text-[#f5eb10]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.035-.529A4.5 4.5 0 008.242 4.5l-4.5 4.5" /></svg>
              URLs
            </h3>
            <div className="mt-3 space-y-1.5">
              {project.liveUrl ? (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-[#1d1d1d]/70 hover:text-[#f5eb10] hover:underline transition-colors">
                  <span className="font-medium text-[#1d1d1d]/50">Live:</span> {project.liveUrl}
                </a>
              ) : null}
              {project.demoUrl ? (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-[#1d1d1d]/70 hover:text-[#f5eb10] hover:underline transition-colors">
                  <span className="font-medium text-[#1d1d1d]/50">Demo:</span> {project.demoUrl}
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        {(project.serverDetails || project.domainDetails) ? (
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1d1d1d]">
              <svg className="h-4 w-4 text-[#f5eb10]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
              Hosting
            </h3>
            <div className="mt-3 space-y-1.5">
              {project.serverDetails ? (
                <p className="text-xs text-[#1d1d1d]/70">
                  <span className="font-medium text-[#1d1d1d]/50">Server:</span> {project.serverDetails}
                </p>
              ) : null}
              {project.domainDetails ? (
                <p className="text-xs text-[#1d1d1d]/70">
                  <span className="font-medium text-[#1d1d1d]/50">Domain:</span> {project.domainDetails}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {project.features?.length ? (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1d1d1d]">
            <svg className="h-4 w-4 text-[#f5eb10]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Features ({project.features.filter((f: { name: string; completed: boolean }) => f.completed).length}/{project.features.length})
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {project.features.map((f: { name: string; completed: boolean }, i: number) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-[#e5e5e5] px-3 py-2">
                <div className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                  f.completed ? "border-[#22c55e] bg-[#22c55e]" : "border-[#d4d4d4]"
                }`}>
                  {f.completed && (
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  )}
                </div>
                <span className={`text-sm ${f.completed ? "text-[#a1a1a1] line-through" : "text-[#1d1d1d]"}`}>
                  {f.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1d1d1d]">Tasks</h2>
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
        <ProjectTasksGrid
          projectId={id}
          projects={allProjects}
          users={allUsers}
        />
      </div>
    </div>
  );
}
