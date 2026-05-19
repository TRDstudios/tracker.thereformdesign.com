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
}: {
  projects?: ProjectOption[];
  users?: UserOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultProjectId = searchParams.get("projectId") || "";

  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await createTask(formData);
      if (result?.id) {
        const pid = formData.get("projectId") as string;
        if (pid) {
          router.push(`/projects/${pid}`);
        } else {
          router.push(`/tasks/${result.id}`);
        }
      }
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input id="title" name="title" required placeholder="Enter task title" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the task"
          rows={4}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="projectId">Project</Label>
          <select
            id="projectId"
            name="projectId"
            defaultValue={defaultProjectId}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            name="priority"
            defaultValue="medium"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="assigneeId">Assignee</Label>
        <select
          id="assigneeId"
          name="assigneeId"
          defaultValue=""
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
        <Label htmlFor="dueDate">Due Date</Label>
        <Input id="dueDate" name="dueDate" type="date" />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create Task"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
