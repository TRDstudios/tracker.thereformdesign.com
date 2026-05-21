"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, IDatasource } from "ag-grid-community";
import {
  ModuleRegistry,
  InfiniteRowModelModule,
  TextFilterModule,
  ColumnAutoSizeModule,
  ValidationModule,
} from "ag-grid-community";
import { Eye, Pencil, Trash2, ListTodo } from "lucide-react";
import { deleteTask } from "@/lib/actions/tasks";
import { toast } from "sonner";
import { TaskEditPanel } from "@/app/(app)/tasks/task-edit-panel";

ModuleRegistry.registerModules([
  InfiniteRowModelModule,
  TextFilterModule,
  ColumnAutoSizeModule,
  ValidationModule,
]);

interface TaskRowData {
  id: string;
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
  low: "bg-[#f0fdf4] text-[#16a34a]",
  medium: "bg-[#fef3c7] text-[#d97706]",
  high: "bg-[#fef2f2] text-[#dc2626]",
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
}: {
  projectId: string;
  projects?: ProjectOption[];
  users?: UserOption[];
}) {
  const router = useRouter();
  const gridRef = useRef<AgGridReact>(null);
  const [editingTask, setEditingTask] = useState<TaskRowData | null>(null);

  const ctx: GridContext = useMemo(() => ({ onEdit: setEditingTask }), []);

  const handleDelete = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
      gridRef.current?.api?.refreshInfiniteCache();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const colDefs = useMemo<ColDef[]>(() => [
    {
      field: "title",
      headerName: "Task",
      flex: 2,
      minWidth: 200,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-[#f5eb10]" />
          <span className="font-medium text-[#1d1d1d]">{params.value || ""}</span>
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      filter: "agTextColumnFilter",
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
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => {
        const value = params.value as string;
        if (!value) return null;
        return (
          <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityStyles[value] || ""}`}>
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
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.data) return null;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/tasks/${params.data.id}`); }}
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
    suppressHeaderMenuButton: false,
    suppressHeaderFilterButton: false,
  }), []);

  const dataSource = useMemo<IDatasource>(() => ({
    getRows: (params) => {
      const queryParams = new URLSearchParams({
        startRow: String(params.startRow),
        endRow: String(params.endRow),
        sortModel: JSON.stringify(params.sortModel),
        filterModel: JSON.stringify(params.filterModel),
        projectId,
      });

      fetch(`/api/tasks?${queryParams}`)
        .then((res) => res.json())
        .then((data) => {
          params.successCallback(data.rows, data.lastRow);
        })
        .catch(() => {
          params.failCallback();
        });
    },
  }), [projectId]);

  return (
    <>
      <div className="ag-theme-custom h-[500px] w-full rounded-xl border shadow-sm">
        <AgGridReact
          ref={gridRef}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          rowModelType="infinite"
          datasource={dataSource}
          context={ctx}
          animateRows={true}
          rowHeight={56}
          headerHeight={44}
          floatingFiltersHeight={36}
          cacheBlockSize={50}
          maxBlocksInCache={5}
          suppressLoadingOverlay={true}
          suppressNoRowsOverlay={true}
          suppressPaginationPanel={true}
        />
      </div>
      <TaskEditPanel
        open={!!editingTask}
        onClose={() => { setEditingTask(null); gridRef.current?.api?.refreshInfiniteCache(); }}
        task={editingTask}
        projects={projects}
        users={users}
      />
    </>
  );
}
