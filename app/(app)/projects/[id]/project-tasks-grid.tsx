"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  TextFilterModule,
  ColumnAutoSizeModule,
  ValidationModule,
} from "ag-grid-community";
import { Eye, Pencil, Trash2, ListTodo } from "lucide-react";
import { deleteTask } from "@/lib/actions/tasks";
import { toast } from "sonner";
import { TaskEditPanel } from "@/app/(app)/tasks/task-edit-panel";
import { CommentsPopover } from "@/components/ui/comments-popover";
import { GridLoadingOverlay } from "@/components/ui/grid-loading-overlay";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  TextFilterModule,
  ColumnAutoSizeModule,
  ValidationModule,
]);

const textFilterParams = { filterOptions: ["contains"] };

interface TaskRowData {
  id: string;
  displayId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: string | null;
  assigneeId: string | null;
  projectName: string;
  assigneeName: string;
  dueDate: string | null;
  createdAt: string;
  commentCount: number;
}

const statusLabels: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const statusStyles: Record<string, string> = {
  todo: "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]",
  in_progress: "bg-[#fef3c7] text-[#d97706] border-[#fde68a]",
  review: "bg-[#f3e8ff] text-[#7c3aed] border-[#d8b4fe]",
  done: "bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]",
};

const priorityStyles: Record<string, string> = {
  low: "bg-blue-50 text-blue-600 border-blue-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

interface GridContext {
  onEdit: (task: TaskRowData) => void;
}

export function ProjectTasksGrid({
  projectId,
  projects,
  users,
  refreshTrigger = 0,
}: {
  projectId: string;
  projects?: ProjectOption[];
  users?: UserOption[];
  refreshTrigger?: number;
}) {
  const router = useRouter();
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<TaskRowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<TaskRowData | null>(null);
  const [commentTaskId, setCommentTaskId] = useState<string | null>(null);

  const ctx: GridContext = useMemo(() => ({ onEdit: setEditingTask }), []);

  const loadData = useCallback(async (showLoading?: boolean) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      const data = await res.json();
      setRowData(data.rows);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (refreshTrigger) loadData(true); }, [refreshTrigger, loadData]);

  const handleDelete = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
      loadData();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const colDefs = useMemo<ColDef[]>(() => [
    {
      field: "displayId",
      headerName: "ID",
      width: 110,
      filter: "agTextColumnFilter",
      filterParams: textFilterParams,
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => (
        <span className="font-mono text-xs font-semibold text-[#a1a1a1]">{params.value || ""}</span>
      ),
    },
    {
      field: "commentCount",
      headerName: "",
      width: 50,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams) => {
        const count = params.value as number;
        if (!count) return null;
        const taskId = params.data?.id as string;
        return (
          <button
            onClick={(e) => { e.stopPropagation(); setCommentTaskId(taskId); }}
            className="flex cursor-pointer items-center gap-1 text-xs text-[#a1a1a1] transition-colors hover:text-[#1d1d1d]"
            title={`${count} comment${count > 1 ? "s" : ""}`}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {count}
          </button>
        );
      },
    },
    {
      field: "title",
      headerName: "Task",
      flex: 2,
      minWidth: 200,
      filter: "agTextColumnFilter",
      filterParams: textFilterParams,
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => {
        const st = params.data?.subtasks as { id: string; title: string }[] | undefined;
        return (
          <div>
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-[#f5eb10]" />
              <span className="font-medium text-[#1d1d1d]">{params.value || ""}</span>
            </div>
            {st?.length ? (
              <div className="mt-0.5 space-y-0.5">
                {st.slice(0, 3).map((s: { id: string; title: string }) => (
                  <div key={s.id} className="flex items-center gap-1.5 pl-7">
                    <div className="h-1 w-1 rounded-full bg-[#a1a1a1]" />
                    <span className="text-[11px] text-[#a1a1a1]">{s.title}</span>
                  </div>
                ))}
                {st.length > 3 ? (
                  <div className="pl-7 text-[11px] text-[#a1a1a1]/50">+{st.length - 3} more</div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      filter: "agTextColumnFilter",
      filterParams: textFilterParams,
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => {
        const value = params.value as string;
        if (!value) return null;
        return (
          <span className={`inline-block rounded-lg border px-3 py-1 text-xs font-semibold ${statusStyles[value] || ""}`}>
            {statusLabels[value] || value}
          </span>
        );
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 110,
      filter: "agTextColumnFilter",
      filterParams: textFilterParams,
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => {
        const value = params.value as string;
        if (!value) return null;
        return (
          <span className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-semibold ${priorityStyles[value] || ""}`}>
            {value}
          </span>
        );
      },
    },
    {
      field: "assigneeName",
      headerName: "Assignee",
      width: 150,
      filter: "agTextColumnFilter",
      filterParams: textFilterParams,
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => (
        <span className="text-[#1d1d1d]/70">{params.value || "—"}</span>
      ),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 120,
      filter: false,
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value) return null;
        return <span className="text-[#1d1d1d]/60">{new Date(params.value).toLocaleDateString()}</span>;
      },
    },
    {
      colId: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filter: false,
      pinned: "right",
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.data) return null;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/tasks/${params.data.displayId || params.data.id}`); }}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#a1a1a1] transition-colors hover:bg-[#f5f5f4] hover:text-[#1d1d1d]"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); const c = params.context as GridContext; c.onEdit(params.data); }}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#a1a1a1] transition-colors hover:bg-[#f5f5f4] hover:text-[#1d1d1d]"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(params.data.id); }}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#a1a1a1] transition-colors hover:bg-red-50 hover:text-red-500"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ], [handleDelete]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    suppressHeaderMenuButton: true,
  }), []);

  return (
    <>
      <div className="ag-theme-custom h-[500px] w-full rounded-xl border shadow-sm">
        <AgGridReact
          ref={gridRef}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          rowData={rowData}
          rowModelType="clientSide"
          loading={loading}
          loadingOverlayComponent={GridLoadingOverlay}
          context={ctx}
          animateRows={true}
          rowHeight={56}
          headerHeight={44}
          floatingFiltersHeight={36}
        />
      </div>
      <TaskEditPanel
        open={!!editingTask}
        onClose={() => { setEditingTask(null); loadData(); }}
        task={editingTask}
        projects={projects}
        users={users}
      />
      {commentTaskId && (
        <CommentsPopover
          taskId={commentTaskId}
          onClose={() => setCommentTaskId(null)}
        />
      )}
    </>
  );
}
