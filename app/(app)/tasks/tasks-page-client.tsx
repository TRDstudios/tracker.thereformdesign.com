"use client";

import { useState } from "react";
import { AgGridTasks } from "./ag-grid-tasks";
import { TaskCreatePanel } from "./task-create-panel";

export function TasksPageClient({
  userRole,
  projects,
  users,
}: {
  userRole?: string;
  projects: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
}) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <>
      <TaskCreatePanel
        projects={projects}
        users={users}
        onSuccess={() => setRefreshTrigger((t) => t + 1)}
      />
      <AgGridTasks
        userRole={userRole}
        projects={projects}
        users={users}
        refreshTrigger={refreshTrigger}
      />
    </>
  );
}
