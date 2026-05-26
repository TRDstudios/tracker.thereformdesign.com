import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageTitleSetter } from "@/lib/page-title-context";
import { ProjectsPageClient } from "./projects-page-client";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "super_admin" || session.user.role === "admin";
  const isSuperAdmin = session.user.role === "super_admin";

  return (
    <>
      <PageTitleSetter title="Projects" />
      <ProjectsPageClient isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />
    </>
  );
}
