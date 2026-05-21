import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderKanban } from "lucide-react";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const isAdmin =
    session.user.role === "super_admin" || session.user.role === "admin";

  const allProjects = await db
    .select()
    .from(projects)
    .where(isAdmin ? sql`TRUE` : eq(projects.ownerId, userId))
    .orderBy(projects.createdAt);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1d]">
            Projects
          </h1>
          <p className="mt-1 text-sm text-[#1d1d1d]/50">
            Manage your projects
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm">
            <Plus className="mr-1 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {allProjects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <div className="group rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5eb10]/20">
                  <FolderKanban className="h-5 w-5 text-[#1d1d1d]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#1d1d1d] truncate">
                    {project.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#1d1d1d]/50">
                    {project.description
                      ? project.description.length > 60
                        ? project.description.slice(0, 60) + "..."
                        : project.description
                      : "No description"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge
                  variant={project.status === "active" ? "default" : "secondary"}
                  className="rounded-md text-[10px] font-medium"
                >
                  {project.status}
                </Badge>
              </div>
            </div>
          </Link>
        ))}
        {allProjects.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-[#1d1d1d]/40">
            No projects yet. Create your first project.
          </div>
        )}
      </div>
    </div>
  );
}
