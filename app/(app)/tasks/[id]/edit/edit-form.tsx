"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateTask } from "@/lib/actions/tasks";

interface Task {
  id: string;
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
      router.push(`/tasks/${task.id}`);
      router.refresh();
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input id="title" name="title" required defaultValue={task.title} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={task.description || ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="projectId">Project</Label>
          <select
            id="projectId"
            name="projectId"
            defaultValue={task.projectId || ""}
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
            defaultValue={task.priority}
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
          defaultValue={task.assigneeId || ""}
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
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          defaultValue={
            task.dueDate
              ? new Date(task.dueDate).toISOString().split("T")[0]
              : ""
          }
        />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
