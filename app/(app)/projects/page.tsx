import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { PageTitleSetter } from "@/lib/page-title-context";
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
    <>
      <PageTitleSetter title="Projects" />
      <ProjectsPageClient isAdmin={isAdmin} users={allUsers} />
    </>
  );
}
