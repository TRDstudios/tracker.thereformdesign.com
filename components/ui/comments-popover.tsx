"use client";

import { useEffect, useRef, useState } from "react";
import { addComment } from "@/lib/actions/tasks";
import { LoaderCircle } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string | null;
  createdAt: string;
}

async function fetchComments(taskId: string) {
  const res = await fetch(`/api/comments?taskId=${taskId}`);
  return res.json();
}

export function CommentsPopover({
  taskId,
  onClose,
}: {
  taskId: string;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [input, setInput] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const load = () => {
    setLoading(true);
    fetchComments(taskId)
      .then(setComments)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [taskId]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      const fd = new FormData();
      fd.set("taskId", taskId);
      fd.set("content", text);
      await addComment(fd);
      setInput("");
      await fetchComments(taskId).then(setComments);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } catch {
      // silently fail
    } finally {
      setPosting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      ref={popoverRef}
      className="animate-in fade-in zoom-in-95 fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div className="relative flex max-h-[70vh] w-full max-w-sm flex-col animate-in slide-in-from-bottom-4 rounded-2xl border bg-white shadow-xl sm:slide-in-from-bottom-0">
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-4 py-3">
          <h4 className="text-sm font-semibold text-[#1d1d1d]">
            Comments {!!comments.length && `(${comments.length})`}
          </h4>
          <button
            onClick={onClose}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-[#a1a1a1] transition-colors hover:bg-[#f5f5f4] hover:text-[#1d1d1d]"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2">
                  <div className="h-7 w-7 animate-pulse rounded-full bg-[#e5e5e5]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-20 animate-pulse rounded bg-[#e5e5e5]" />
                    <div className="h-4 w-full animate-pulse rounded bg-[#e5e5e5]" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#a1a1a1]">No comments yet</p>
          ) : (
            comments.map((c) => {
              const name = c.authorName || "Unknown";
              const initial = name.charAt(0).toUpperCase();
              return (
                <div key={c.id} className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f5eb10]/30 text-xs font-bold text-[#1d1d1d]">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="text-xs font-semibold text-[#1d1d1d]">{name}</p>
                      <p className="text-[10px] text-[#a1a1a1]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-0.5 text-sm text-[#1d1d1d]/70">{c.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-[#e5e5e5] px-4 py-3">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment..."
              rows={1}
              className="min-h-[36px] flex-1 resize-none rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#1d1d1d] placeholder:text-[#a1a1a1] outline-none focus:border-[#f5eb10] focus:ring-1 focus:ring-[#f5eb10]"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || posting}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#f5eb10] text-[#1d1d1d] transition-colors hover:bg-[#f5eb10]/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {posting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
