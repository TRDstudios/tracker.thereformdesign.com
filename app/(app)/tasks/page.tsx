import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllProjects, getAllUsers } from "@/lib/data";
import { AgGridTasks } from "./ag-grid-tasks";
import { TaskCreatePanel } from "./task-create-panel";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const allProjects = await getAllProjects();
  const allUsers = await getAllUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1d]">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-[#1d1d1d]/50">
            View and manage all tasks
          </p>
        </div>
        <TaskCreatePanel projects={allProjects} users={allUsers} />
      </div>
      <AgGridTasks userRole={session.user.role} projects={allProjects} users={allUsers} />
    </div>
  );
}
