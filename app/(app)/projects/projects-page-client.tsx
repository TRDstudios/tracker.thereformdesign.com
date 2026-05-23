"use client";

import { useState } from "react";
import { AgGridProjects } from "./ag-grid-projects";
import { ProjectCreatePanel } from "./project-create-panel";

export function ProjectsPageClient({
  isAdmin,
  users,
}: {
  isAdmin: boolean;
  users: { id: string; name: string; email: string }[];
}) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <>
      <ProjectCreatePanel
        users={users}
        onSuccess={() => setRefreshTrigger((t) => t + 1)}
      />
      <AgGridProjects
        isAdmin={isAdmin}
        refreshTrigger={refreshTrigger}
      />
    </>
  );
}
