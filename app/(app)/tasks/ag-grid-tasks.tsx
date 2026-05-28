"use client";

import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  RowSelectionModule,
  ColumnAutoSizeModule,
  ValidationModule,
} from "ag-grid-community";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { updateTaskStatus, deleteTask } from "@/lib/actions/tasks";
import type { GridContext, TaskRowData } from "./ag-grid-constants";
import {
  StatusCellRenderer,
  PriorityCellRenderer,
  ProjectCellRenderer,
  DateCellRenderer,
} from "./ag-grid-cell-renderers";
import { StatusDropdown } from "./ag-grid-status-dropdown";
import { TaskEditPanel } from "./task-edit-panel";
import { CommentsPopover } from "@/components/ui/comments-popover";
import { toast } from "sonner";
import { GridLoadingOverlay } from "@/components/ui/grid-loading-overlay";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  RowSelectionModule,
  ColumnAutoSizeModule,
  ValidationModule,
]);

const textFilterParams = { filterOptions: ["contains"] };
const dateFilterParams = { filterOptions: ["contains"] };

export function AgGridTasks({
  userRole,
  projects,
  users,
  refreshTrigger = 0,
}: {
  userRole?: string;
  projects?: { id: string; name: string }[];
  users?: { id: string; name: string; email: string }[];
  refreshTrigger?: number;
}) {
  const router = useRouter();
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<TaskRowData[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = userRole === "super_admin" || userRole === "admin";
  const isSuperAdmin = userRole === "super_admin";
  const [statusTarget, setStatusTarget] = useState<{
    rowId: string;
    current: string;
    rect: DOMRect;
  } | null>(null);
  const [editingTask, setEditingTask] = useState<TaskRowData | null>(null);
  const [commentTaskId, setCommentTaskId] = useState<string | null>(null);

  const ctx: GridContext = useMemo(() => ({ setStatusTarget, onEdit: setEditingTask }), []);

  const loadData = useCallback((showLoading?: boolean) => {
    if (showLoading) setLoading(true);
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => setRowData(data.rows))
      .catch(() => toast.error("Failed to load tasks"))
      .finally(() => setLoading(false));
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (refreshTrigger) loadData(true); }, [refreshTrigger, loadData]);

  const handleDelete = useCallback(async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
      loadData();
    } catch {
      toast.error("Failed to delete task");
    }
  }, [loadData]);

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
      field: "projectName",
      headerName: "Project",
      flex: 1,
      minWidth: 150,
      filter: "agTextColumnFilter",
      filterParams: textFilterParams,
      floatingFilter: true,
      cellRenderer: ProjectCellRenderer,
    },
    {
      field: "title",
      headerName: "Title",
      flex: 2,
      minWidth: 200,
      filter: "agTextColumnFilter",
      filterParams: textFilterParams,
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => (
        <span className="font-medium text-[#1d1d1d]">{params.value || ""}</span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      filter: "agTextColumnFilter",
      filterParams: textFilterParams,
      floatingFilter: true,
      cellRenderer: StatusCellRenderer,
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 110,
      filter: "agTextColumnFilter",
      filterParams: textFilterParams,
      floatingFilter: true,
      cellRenderer: PriorityCellRenderer,
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
      filter: "agDateColumnFilter",
      filterParams: dateFilterParams,
      floatingFilter: true,
      cellRenderer: DateCellRenderer,
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 120,
      filter: "agDateColumnFilter",
      filterParams: dateFilterParams,
      floatingFilter: true,
      cellRenderer: DateCellRenderer,
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
              onClick={(e) => { e.stopPropagation(); if (isAdmin) { const ctx = params.context as GridContext; ctx.onEdit(params.data); } }}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors ${
                isAdmin
                  ? "text-[#a1a1a1] hover:bg-[#f5f5f4] hover:text-[#1d1d1d]"
                  : "text-[#e5e5e5] cursor-not-allowed"
              }`}
              title="Edit"
              disabled={!isAdmin}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (isSuperAdmin) handleDelete(params.data.id); }}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors ${
                isSuperAdmin
                  ? "text-[#a1a1a1] hover:bg-red-50 hover:text-red-500"
                  : "text-[#e5e5e5] cursor-not-allowed"
              }`}
              title="Delete"
              disabled={!isSuperAdmin}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ], [isAdmin, isSuperAdmin, handleDelete]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    suppressHeaderMenuButton: true,
  }), []);

  const handleStatusSelect = useCallback(async (value: string) => {
    if (!statusTarget || value === statusTarget.current) {
      setStatusTarget(null);
      return;
    }
    await updateTaskStatus(statusTarget.rowId, value);
    setStatusTarget(null);
    loadData();
  }, [statusTarget, loadData]);

  return (
    <>
      <div className="ag-theme-custom h-[600px] w-full rounded-xl border shadow-sm">
        <AgGridReact
          ref={gridRef}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          context={ctx}
          rowData={rowData}
          rowModelType="clientSide"
          loading={loading}
          loadingOverlayComponent={GridLoadingOverlay}
          rowSelection="multiple"
          animateRows={true}
          suppressRowClickSelection={true}
          rowHeight={44}
          headerHeight={44}
          floatingFiltersHeight={36}
        />
      </div>
      {statusTarget && (
        <StatusDropdown
          current={statusTarget.current}
          rect={statusTarget.rect}
          onSelect={handleStatusSelect}
          onClose={() => setStatusTarget(null)}
        />
      )}
      <TaskEditPanel
        key={editingTask?.id}
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
