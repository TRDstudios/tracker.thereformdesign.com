"use client";

import { useState } from "react";
import { AgGridProjects } from "./ag-grid-projects";
import { ProjectCreatePanel } from "./project-create-panel";

export function ProjectsPageClient({ isAdmin, isSuperAdmin }: { isAdmin: boolean; isSuperAdmin: boolean }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <>
      <div className="flex justify-end mb-4">
        <ProjectCreatePanel onSuccess={() => setRefreshTrigger((t) => t + 1)} />
      </div>
      <AgGridProjects
        isAdmin={isAdmin}
        isSuperAdmin={isSuperAdmin}
        refreshTrigger={refreshTrigger}
      />
    </>
  );
}
