"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SlidePanel } from "@/components/ui/slide-panel";
import { ProjectForm } from "./project-form";
import { Plus } from "lucide-react";

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export function ProjectCreatePanel({
  onSuccess,
  users = [],
}: {
  onSuccess?: () => void;
  users?: UserOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm"
      >
        <Plus className="mr-1 h-4 w-4" /> New Project
      </Button>

      <SlidePanel open={open} onClose={() => setOpen(false)} title="Create Project">
        <ProjectForm users={users} onSuccess={() => { setOpen(false); onSuccess?.(); }} />
      </SlidePanel>
    </>
  );
}
