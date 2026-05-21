"use client";

import { useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTask } from "@/lib/actions/tasks";

interface ProjectOption {
  id: string;
  name: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export function TaskForm({
  projects = [],
  users = [],
  defaultProjectId: externalProjectId,
  onSuccess,
}: {
  projects?: ProjectOption[];
  users?: UserOption[];
  defaultProjectId?: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultProjectId = externalProjectId || searchParams.get("projectId") || "";

  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await createTask(formData);
      if (result?.id) {
        if (onSuccess) {
          onSuccess();
        } else {
          const pid = formData.get("projectId") as string;
          if (pid) {
            router.push(`/projects/${pid}`);
          } else {
            router.push(`/tasks/${result.id}`);
          }
        }
      }
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
          placeholder="Enter task title"
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
          placeholder="Describe the task"
          rows={4}
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
            defaultValue={defaultProjectId}
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
            defaultValue="medium"
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
          defaultValue=""
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
          className="h-10 rounded-lg border-[#e5e5e5] bg-white text-[#1d1d1d] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
        />
      </div>
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm"
        >
          {pending ? "Creating..." : "Create Task"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => (onSuccess ? onSuccess() : router.back())}
          className="rounded-lg border-[#e5e5e5] text-[#1d1d1d]/60"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
