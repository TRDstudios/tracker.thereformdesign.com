import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProjectForm } from "../project-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Project
        </h1>
        <p className="text-sm text-zinc-500">
          Set up a new project for your team
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <ProjectForm />
        </CardContent>
      </Card>
    </div>
  );
}
