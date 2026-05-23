"use client";

import { useActionState, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTask } from "@/lib/actions/tasks";
import { LoaderCircle, Plus, X } from "lucide-react";

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

  const [selectedProject, setSelectedProject] = useState(defaultProjectId);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [subtaskTitles, setSubtaskTitles] = useState<string[]>([]);

  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      formData.set("subtaskTitles", JSON.stringify(subtaskTitles));
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

  const addSubtask = () => {
    const trimmed = subtaskInput.trim();
    if (trimmed && !subtaskTitles.includes(trimmed)) {
      setSubtaskTitles((prev) => [...prev, trimmed]);
      setSubtaskInput("");
    }
  };

  const removeSubtask = (title: string) => {
    setSubtaskTitles((prev) => prev.filter((t) => t !== title));
  };

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
        <Label htmlFor="projectId" className="text-sm font-medium text-[#1d1d1d]">
          Project
        </Label>
        <select
          id="projectId"
          name="projectId"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
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
        <Label className="text-sm font-medium text-[#1d1d1d]">
          Sub-tasks <span className="text-[#a1a1a1]">(manual)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            placeholder="Type subtask title and add"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubtask(); } }}
            className="h-10 rounded-lg border-[#e5e5e5] bg-white text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
          />
          <Button
            type="button"
            onClick={addSubtask}
            size="icon"
            className="h-10 w-10 shrink-0 rounded-lg bg-[#f5eb10] text-[#1d1d1d] hover:bg-[#f5eb10]/90"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {subtaskTitles.length > 0 && (
          <div className="rounded-lg border border-[#e5e5e5] p-2 space-y-1">
            {subtaskTitles.map((title) => (
              <div
                key={title}
                className="flex items-center justify-between rounded-md bg-[#f5f5f4] px-3 py-1.5 text-sm text-[#1d1d1d]"
              >
                <span>{title}</span>
                <button
                  type="button"
                  onClick={() => removeSubtask(title)}
                  className="text-[#a1a1a1] hover:text-red-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm"
        >
          {pending ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Creating...</> : "Create Task"}
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
