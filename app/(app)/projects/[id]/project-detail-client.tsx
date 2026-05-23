"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskCreatePanel } from "@/app/(app)/tasks/task-create-panel";
import { ProjectTasksGrid } from "./project-tasks-grid";

interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

export function ProjectDetailClient({
  projectId,
  projects,
  users,
}: {
  projectId: string;
  projects: ProjectOption[];
  users: UserOption[];
}) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1d1d1d]">Tasks</h2>
        <TaskCreatePanel
          projects={projects}
          users={users}
          defaultProjectId={projectId}
          onSuccess={() => setRefreshTrigger((t) => t + 1)}
        >
          <Button
            size="sm"
            className="rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm"
          >
            <Plus className="mr-1 h-4 w-4" /> New Task
          </Button>
        </TaskCreatePanel>
      </div>
      <ProjectTasksGrid
        projectId={projectId}
        projects={projects}
        users={users}
        refreshTrigger={refreshTrigger}
      />
    </>
  );
}
