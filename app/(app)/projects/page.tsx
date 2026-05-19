import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const isAdmin =
    session.user.role === "super_admin" || session.user.role === "admin";

  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(projects.createdAt);

  const visibleProjects = isAdmin
    ? allProjects
    : allProjects.filter(
        (p) =>
          p.ownerId === userId,
      );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-zinc-500">Manage your projects</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProjects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="transition-colors hover:bg-zinc-50">
              <CardHeader>
                <CardTitle className="text-base">{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 line-clamp-2 text-sm text-zinc-500">
                  {project.description || "No description"}
                </p>
                <Badge
                  variant={
                    project.status === "active" ? "default" : "secondary"
                  }
                >
                  {project.status}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
        {visibleProjects.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-zinc-500">
            No projects yet. Create your first project.
          </div>
        )}
      </div>
    </div>
  );
}
