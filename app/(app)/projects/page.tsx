import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ProjectsPageClient } from "./projects-page-client";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "super_admin" || session.user.role === "admin";

  const allUsers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.active, true))
    .orderBy(users.name);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5eb10]/20">
            <FolderKanban className="h-6 w-6 text-[#1d1d1d]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1d]">
              Projects
            </h1>
            <p className="mt-1 text-sm text-[#1d1d1d]/50">
              Manage your projects
            </p>
          </div>
        </div>
      </div>

      <ProjectsPageClient isAdmin={isAdmin} users={allUsers} />
    </div>
  );
}
