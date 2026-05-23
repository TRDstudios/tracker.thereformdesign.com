"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateTask } from "@/lib/actions/tasks";
import { LoaderCircle } from "lucide-react";

interface Task {
  id: string;
  displayId: string | null;
  title: string;
  description: string | null;
  projectId: string | null;
  assigneeId: string | null;
  priority: string;
  dueDate: Date | string | null;
}

interface ProjectOption {
  id: string;
  name: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export function EditTaskForm({
  task,
  projects = [],
  users = [],
}: {
  task: Task;
  projects?: ProjectOption[];
  users?: UserOption[];
}) {
  const router = useRouter();

  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      await updateTask(task.id, formData);
      router.push(`/tasks/${task.displayId || task.id}`);
      router.refresh();
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-[#1d1d1d]">
          Task Title
        </Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={task.title}
          className="h-10 rounded-lg border-[#e5e5e5] bg-white text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-[#1d1d1d]">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={task.description || ""}
          className="rounded-lg border-[#e5e5e5] bg-white text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="projectId" className="text-sm font-medium text-[#1d1d1d]">
            Project
          </Label>
          <select
            id="projectId"
            name="projectId"
            defaultValue={task.projectId || ""}
            className="flex h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-1 text-sm text-[#1d1d1d] transition-colors focus:border-[#f5eb10] focus:ring-[#f5eb10] focus-visible:outline-none focus-visible:ring-1"
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority" className="text-sm font-medium text-[#1d1d1d]">
            Priority
          </Label>
          <select
            id="priority"
            name="priority"
            defaultValue={task.priority}
            className="flex h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-1 text-sm text-[#1d1d1d] transition-colors focus:border-[#f5eb10] focus:ring-[#f5eb10] focus-visible:outline-none focus-visible:ring-1"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="assigneeId" className="text-sm font-medium text-[#1d1d1d]">
          Assignee
        </Label>
        <select
          id="assigneeId"
          name="assigneeId"
          defaultValue={task.assigneeId || ""}
          className="flex h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-1 text-sm text-[#1d1d1d] transition-colors focus:border-[#f5eb10] focus:ring-[#f5eb10] focus-visible:outline-none focus-visible:ring-1"
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dueDate" className="text-sm font-medium text-[#1d1d1d]">
          Due Date
        </Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          defaultValue={
            task.dueDate
              ? new Date(task.dueDate).toISOString().split("T")[0]
              : ""
          }
          className="h-10 rounded-lg border-[#e5e5e5] bg-white text-[#1d1d1d] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
        />
      </div>
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm"
        >
          {pending ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Saving...</> : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="rounded-lg border-[#e5e5e5] text-[#1d1d1d]/60"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
