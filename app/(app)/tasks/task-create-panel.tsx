"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SlidePanel } from "@/components/ui/slide-panel";
import { TaskForm } from "./task-form";

interface ProjectOption {
  id: string;
  name: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export function TaskCreatePanel({
  projects = [],
  users = [],
  defaultProjectId,
  children,
}: {
  projects?: ProjectOption[];
  users?: UserOption[];
  defaultProjectId?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children ? (
        <div onClick={() => setOpen(true)}>{children}</div>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm"
        >
          <Plus className="mr-1 h-4 w-4" /> New Task
        </Button>
      )}

      <SlidePanel open={open} onClose={() => setOpen(false)} title="Create Task">
        <TaskForm
          projects={projects}
          users={users}
          defaultProjectId={defaultProjectId}
          onSuccess={() => setOpen(false)}
        />
      </SlidePanel>
    </>
  );
}
