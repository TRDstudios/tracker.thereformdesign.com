import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllProjects, getAllUsers } from "@/lib/data";
import { PageTitleSetter } from "@/lib/page-title-context";
import { TasksPageClient } from "./tasks-page-client";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const allProjects = await getAllProjects();
  const allUsers = await getAllUsers();

  return (
    <>
      <PageTitleSetter title="Tasks" />
      <TasksPageClient
        userRole={session.user.role}
        projects={allProjects}
        users={allUsers}
      />
    </>
  );
}
