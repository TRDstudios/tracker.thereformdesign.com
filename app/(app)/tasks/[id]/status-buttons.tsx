"use client";

import { Button } from "@/components/ui/button";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { toast } from "sonner";


const statuses = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

export function StatusButtons({
  taskId,
  currentStatus,
}: {
  taskId: string;
  currentStatus: string;
}) {
  const changeStatus = async (status: string) => {
    try {
      await updateTaskStatus(taskId, status);
      toast.success(`Status updated to ${statuses.find((s) => s.value === status)?.label}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((s) => (
        <Button
          key={s.value}
          variant={s.value === currentStatus ? "default" : "outline"}
          size="sm"
          onClick={() => changeStatus(s.value)}
        >
          {s.label}
        </Button>
      ))}
    </div>
  );
}
