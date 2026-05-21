"use client";

import type { ICellRendererParams } from "ag-grid-community";
import { FolderKanban, ChevronDown } from "lucide-react";
import { statusLabels, statusStyles, priorityStyles, type GridContext } from "./ag-grid-constants";

export function StatusCellRenderer(params: ICellRendererParams) {
  const value = params.value as string;
  const ctx = params.context as GridContext;

  return (
    <span
      className="inline-flex items-center gap-1 cursor-pointer size-full"
      onClick={(e) => {
        const cell = (e.currentTarget as HTMLElement).closest(".ag-cell");
        if (cell) {
          ctx.setStatusTarget({
            rowId: params.data.id,
            current: value,
            rect: cell.getBoundingClientRect(),
          });
        }
      }}
    >
      <span className={`inline-block rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${statusStyles[value] || "bg-zinc-50 text-zinc-600 border-zinc-200"}`}>
        {statusLabels[value] || value}
      </span>
      <ChevronDown className="h-3.5 w-3.5 text-[#1d1d1d]/30" />
    </span>
  );
}

export function PriorityCellRenderer(params: ICellRendererParams) {
  const value = params.value as string;
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityStyles[value] || ""}`}>
      {value}
    </span>
  );
}

export function ProjectCellRenderer(params: ICellRendererParams) {
  if (!params.value) return <span className="text-[#a1a1a1]">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-[#1d1d1d]/80">
      <FolderKanban className="h-3.5 w-3.5 text-[#f5eb10]" />
      {params.value}
    </span>
  );
}

export function DateCellRenderer(params: ICellRendererParams) {
  if (!params.value) return null;
  return <span className="text-[#1d1d1d]/60">{new Date(params.value).toLocaleDateString()}</span>;
}
