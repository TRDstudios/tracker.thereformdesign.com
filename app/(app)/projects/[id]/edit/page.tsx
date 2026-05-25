import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EditProjectForm } from "./edit-form";

export default async function EditProjectPage(props: {
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

  // member/user lists removed — projects are visible to all authenticated users by default

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1d]">
          Edit Project
        </h1>
      </div>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <EditProjectForm project={project} />
      </div>
    </div>
  );
}
