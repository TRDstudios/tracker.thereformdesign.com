"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/lib/actions/tasks";
import { LoaderCircle } from "lucide-react";

export function CommentForm({ taskId }: { taskId: string }) {
  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      await addComment(formData);
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="taskId" value={taskId} />
      <Textarea
        name="content"
        placeholder="Add a comment..."
        rows={2}
        required
        className="rounded-lg border-[#e5e5e5] bg-white text-sm text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
      />
      <Button
        type="submit"
        size="sm"
        disabled={pending}
        className="rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm"
      >
        {pending ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Posting...</> : "Comment"}
      </Button>
    </form>
  );
}
