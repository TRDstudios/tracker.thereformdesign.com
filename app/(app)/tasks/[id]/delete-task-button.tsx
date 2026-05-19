"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteTask } from "@/lib/actions/tasks";
import { toast } from "sonner";

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this task? This action cannot be undone.")) return;
    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
      router.push("/tasks");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      className="rounded-lg"
    >
      <Trash2 className="mr-1 h-4 w-4" /> Delete
    </Button>
  );
}
