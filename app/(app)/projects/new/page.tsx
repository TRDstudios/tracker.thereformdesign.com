import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProjectForm } from "../project-form";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1d]">
          Create Project
        </h1>
        <p className="mt-1 text-sm text-[#1d1d1d]/50">
          Set up a new project for your team
        </p>
      </div>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <ProjectForm />
      </div>
    </div>
  );
}
