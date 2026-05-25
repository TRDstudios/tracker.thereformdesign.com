"use client";

import { Button } from "@/components/ui/button";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { toast } from "sonner";

const statuses = [
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
      toast.success(
        `Status updated to ${statuses.find((s) => s.value === status)?.label}`,
      );
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
          className={
            s.value === currentStatus
              ? "rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm"
              : "rounded-lg border-[#e5e5e5] text-[#1d1d1d]/60 hover:bg-[#f5eb10]/20 hover:text-[#1d1d1d]"
          }
        >
          {s.label}
        </Button>
      ))}
    </div>
  );
}
