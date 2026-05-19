"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteProject } from "@/lib/actions/projects";
import { toast } from "sonner";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      await deleteProject(projectId);
      toast.success("Project deleted");
      router.push("/projects");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      <Trash2 className="mr-1 h-4 w-4" /> Delete
    </Button>
  );
}
