"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProject } from "@/lib/actions/projects";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
}

export function EditProjectForm({ project }: { project: Project }) {
  const router = useRouter();

  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      await updateProject(project.id, formData);
      router.push(`/projects/${project.id}`);
      router.refresh();
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-[#1d1d1d]">
          Project Name
        </Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={project.name}
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
          defaultValue={project.description || ""}
          className="rounded-lg border-[#e5e5e5] bg-white text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status" className="text-sm font-medium text-[#1d1d1d]">
          Status
        </Label>
        <select
          id="status"
          name="status"
          defaultValue={project.status}
          className="flex h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-1 text-sm text-[#1d1d1d] shadow-xs transition-colors focus:border-[#f5eb10] focus:ring-[#f5eb10] focus-visible:outline-none focus-visible:ring-1"
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm"
        >
          {pending ? "Saving..." : "Save"}
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
