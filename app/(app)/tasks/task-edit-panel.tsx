"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SlidePanel } from "@/components/ui/slide-panel";
import { updateTask } from "@/lib/actions/tasks";
import { LoaderCircle, Plus, X } from "lucide-react";

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: string | null;
  assigneeId: string | null;
  dueDate: string | null;
  subtasks?: { id: string; title: string }[];
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

export function TaskEditPanel({
  open,
  onClose,
  task,
  projects = [],
  users = [],
}: {
  open: boolean;
  onClose: () => void;
  task: TaskData | null;
  projects?: ProjectOption[];
  users?: UserOption[];
}) {
  const [selectedProject, setSelectedProject] = useState(task?.projectId || "");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [subtaskTitles, setSubtaskTitles] = useState<string[]>(task?.subtasks?.map((s) => s.title) || []);

  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      if (!task) return null;
      formData.set("subtaskTitles", JSON.stringify(subtaskTitles));
      await updateTask(task.id, formData);
      onClose();
      return null;
    },
    null,
  );

  if (!task) return null;

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
    <SlidePanel open={open} onClose={onClose} title="Edit Task">
      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-[#1d1d1d]">
            Task Title <span className="text-red-500">*</span>
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
            rows={4}
            defaultValue={task.description || ""}
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
              defaultValue={task.priority}
              className="flex h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-1 text-sm text-[#1d1d1d] transition-colors focus:border-[#f5eb10] focus:ring-[#f5eb10] focus-visible:outline-none focus-visible:ring-1"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-medium text-[#1d1d1d]">
              Due Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              required
              defaultValue={
                task.dueDate
                  ? new Date(task.dueDate).toISOString().split("T")[0]
                  : ""
              }
              className="h-10 rounded-lg border-[#e5e5e5] bg-white text-[#1d1d1d] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assigneeId" className="text-sm font-medium text-[#1d1d1d]">
            Assignee <span className="text-red-500">*</span>
          </Label>
          <select
            id="assigneeId"
            name="assigneeId"
            required
            defaultValue={task.assigneeId || ""}
            className="flex h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-1 text-sm text-[#1d1d1d] transition-colors focus:border-[#f5eb10] focus:ring-[#f5eb10] focus-visible:outline-none focus-visible:ring-1"
          >
            <option value="" disabled>Select assignee</option>
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
            {pending ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Saving...</> : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-lg border-[#e5e5e5] text-[#1d1d1d]/60"
          >
            Cancel
          </Button>
        </div>
      </form>
    </SlidePanel>
  );
}
