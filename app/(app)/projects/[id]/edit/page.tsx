import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EditProjectForm } from "./edit-form";
import { Card, CardContent } from "@/components/ui/card";

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

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Project</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <EditProjectForm project={project} />
        </CardContent>
      </Card>
    </div>
  );
}
