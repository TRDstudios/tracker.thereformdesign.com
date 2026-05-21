"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SlidePanel } from "@/components/ui/slide-panel";
import { updateProject } from "@/lib/actions/projects";
import { X, Plus, LoaderCircle } from "lucide-react";

const STACK_OPTIONS = [
  "HTML static Version",
  "Wordpress",
  "React",
  "Next Js",
  "Node js",
  "Woocommerce",
];

const SERVER_OPTIONS = ["Godaddy", "Hostinger", "AWS", "Vercel", "Netlify", "DigitalOcean", "Linode", "Other"];
const DOMAIN_OPTIONS = ["Godaddy", "Hostinger", "Namecheap", "Cloudflare", "Google Domains", "Other"];

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  stack: string[] | null;
  liveUrl: string | null;
  demoUrl: string | null;
  features: { name: string; completed: boolean }[] | null;
  serverDetails: string | null;
  domainDetails: string | null;
}

export function ProjectEditPanel({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project: ProjectData | null;
}) {
  const [stack, setStack] = useState<string[]>(project?.stack ?? []);
  const [features, setFeatures] = useState<{ name: string; completed: boolean }[]>(project?.features ?? []);
  const [newFeature, setNewFeature] = useState("");
  const [newStack, setNewStack] = useState("");
  const [showCustomStack, setShowCustomStack] = useState(false);

  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      if (!project) return null;
      formData.set("stack", JSON.stringify(stack));
      formData.set("features", JSON.stringify(features));
      await updateProject(project.id, formData);
      onClose();
      return null;
    },
    null,
  );

  if (!project) return null;

  const toggleStack = (s: string) => {
    setStack((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const addCustomStack = () => {
    const trimmed = newStack.trim();
    if (trimmed && !stack.includes(trimmed)) {
      setStack((prev) => [...prev, trimmed]);
    }
    setNewStack("");
    setShowCustomStack(false);
  };

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (trimmed) {
      setFeatures((prev) => [...prev, { name: trimmed, completed: false }]);
    }
    setNewFeature("");
  };

  const toggleFeature = (index: number) => {
    setFeatures((prev) =>
      prev.map((f, i) => (i === index ? { ...f, completed: !f.completed } : f)),
    );
  };

  const removeFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <SlidePanel open={open} onClose={onClose} title="Edit Project">
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
            rows={3}
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
            className="flex h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-1 text-sm text-[#1d1d1d] transition-colors focus:border-[#f5eb10] focus:ring-[#f5eb10]"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#1d1d1d]">Project Stack</Label>
          <div className="flex flex-wrap gap-2">
            {STACK_OPTIONS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => toggleStack(s)}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  stack.includes(s)
                    ? "border-[#f5eb10] bg-[#f5eb10]/20 text-[#1d1d1d]"
                    : "border-[#e5e5e5] text-[#a1a1a1] hover:border-[#1d1d1d]/20"
                }`}
              >
                {s}
              </button>
            ))}
            {stack.filter((s) => !STACK_OPTIONS.includes(s)).map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => toggleStack(s)}
                className="cursor-pointer rounded-lg border border-[#f5eb10] bg-[#f5eb10]/20 px-3 py-1.5 text-xs font-medium text-[#1d1d1d]"
              >
                {s}
              </button>
            ))}
            {!showCustomStack ? (
              <button
                type="button"
                onClick={() => setShowCustomStack(true)}
                className="cursor-pointer rounded-lg border border-dashed border-[#e5e5e5] px-3 py-1.5 text-xs font-medium text-[#a1a1a1] transition-colors hover:border-[#1d1d1d]/20"
              >
                + Add custom
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <Input
                  value={newStack}
                  onChange={(e) => setNewStack(e.target.value)}
                  placeholder="Stack name"
                  className="h-7 w-32 rounded-lg border-[#e5e5e5] text-xs"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomStack(); } }}
                />
                <button
                  type="button"
                  onClick={addCustomStack}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-[#f5eb10] text-xs font-bold text-[#1d1d1d]"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="liveUrl" className="text-sm font-medium text-[#1d1d1d]">
              Live URL <span className="text-[#a1a1a1]">(optional)</span>
            </Label>
            <Input
              id="liveUrl"
              name="liveUrl"
              placeholder="https://..."
              defaultValue={project.liveUrl ?? ""}
              className="h-10 rounded-lg border-[#e5e5e5] bg-white text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demoUrl" className="text-sm font-medium text-[#1d1d1d]">
              Demo URL <span className="text-[#a1a1a1]">(optional)</span>
            </Label>
            <Input
              id="demoUrl"
              name="demoUrl"
              placeholder="https://..."
              defaultValue={project.demoUrl ?? ""}
              className="h-10 rounded-lg border-[#e5e5e5] bg-white text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#1d1d1d]">
            Features <span className="text-[#a1a1a1]">(optional)</span>
          </Label>
          <div className="space-y-1.5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-[#e5e5e5] px-3 py-2">
                <input
                  type="checkbox"
                  checked={f.completed}
                  onChange={() => toggleFeature(i)}
                  className="h-4 w-4 accent-[#f5eb10]"
                />
                <span className={`flex-1 text-sm ${f.completed ? "text-[#a1a1a1] line-through" : "text-[#1d1d1d]"}`}>
                  {f.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[#a1a1a1] hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature"
                className="h-9 flex-1 rounded-lg border-[#e5e5e5] text-sm"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
              />
              <button
                type="button"
                onClick={addFeature}
                disabled={!newFeature.trim()}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-[#f5eb10] text-[#1d1d1d] transition-colors hover:bg-[#f5eb10]/90 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serverDetails" className="text-sm font-medium text-[#1d1d1d]">
              Server <span className="text-[#a1a1a1]">(optional)</span>
            </Label>
            <select
              id="serverDetails"
              name="serverDetails"
              defaultValue={project.serverDetails ?? ""}
              className="flex h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-1 text-sm text-[#1d1d1d] transition-colors focus:border-[#f5eb10] focus:ring-[#f5eb10]"
            >
              <option value="">None</option>
              {SERVER_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="domainDetails" className="text-sm font-medium text-[#1d1d1d]">
              Domain <span className="text-[#a1a1a1]">(optional)</span>
            </Label>
            <select
              id="domainDetails"
              name="domainDetails"
              defaultValue={project.domainDetails ?? ""}
              className="flex h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-1 text-sm text-[#1d1d1d] transition-colors focus:border-[#f5eb10] focus:ring-[#f5eb10]"
            >
              <option value="">None</option>
              {DOMAIN_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
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
