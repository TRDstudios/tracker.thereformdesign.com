"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/lib/actions/tasks";

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
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Posting..." : "Comment"}
      </Button>
    </form>
  );
}
