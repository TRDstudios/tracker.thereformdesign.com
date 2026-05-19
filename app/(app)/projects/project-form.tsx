"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/lib/actions/projects";

export function ProjectForm() {
  const router = useRouter();
  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await createProject(formData);
      if (result?.id) {
        router.push(`/projects/${result.id}`);
      }
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
          placeholder="Enter project name"
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
          placeholder="Describe the project"
          rows={4}
          className="rounded-lg border-[#e5e5e5] bg-white text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
        />
      </div>
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm"
        >
          {pending ? "Creating..." : "Create Project"}
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
