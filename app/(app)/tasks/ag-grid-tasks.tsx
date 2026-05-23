"use client";

import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, IDatasource } from "ag-grid-community";
import {
  ModuleRegistry,
  InfiniteRowModelModule,
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
import { toast } from "sonner";
import { GridLoadingOverlay } from "@/components/ui/grid-loading-overlay";

ModuleRegistry.registerModules([
  InfiniteRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  RowSelectionModule,
  ColumnAutoSizeModule,
  ValidationModule,
]);

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

  useEffect(() => {
    gridRef.current?.api?.refreshInfiniteCache();
  }, [refreshTrigger]);
  const isAdmin = userRole === "super_admin" || userRole === "admin";
  const [statusTarget, setStatusTarget] = useState<{
    rowId: string;
    current: string;
    rect: DOMRect;
  } | null>(null);
  const [editingTask, setEditingTask] = useState<TaskRowData | null>(null);

  const ctx: GridContext = useMemo(() => ({ setStatusTarget, onEdit: setEditingTask }), []);

  const handleDelete = useCallback(async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
      gridRef.current?.api?.refreshInfiniteCache();
    } catch {
      toast.error("Failed to delete task");
    }
  }, []);

  const colDefs = useMemo<ColDef[]>(() => [
    {
      field: "projectName",
      headerName: "Project",
      flex: 1,
      minWidth: 150,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      cellRenderer: ProjectCellRenderer,
    },
    {
      field: "title",
      headerName: "Title",
      flex: 2,
      minWidth: 200,
      filter: "agTextColumnFilter",
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
      floatingFilter: true,
      cellRenderer: StatusCellRenderer,
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 110,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      cellRenderer: PriorityCellRenderer,
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
      filter: "agDateColumnFilter",
      floatingFilter: true,
      cellRenderer: DateCellRenderer,
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 120,
      filter: "agDateColumnFilter",
      floatingFilter: true,
      cellRenderer: DateCellRenderer,
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
              onClick={(e) => { e.stopPropagation(); if (isAdmin) handleDelete(params.data.id); }}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors ${
                isAdmin
                  ? "text-[#a1a1a1] hover:bg-red-50 hover:text-red-500"
                  : "text-[#e5e5e5] cursor-not-allowed"
              }`}
              title="Delete"
              disabled={!isAdmin}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ], [isAdmin, handleDelete]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    suppressHeaderMenuButton: false,
    suppressHeaderFilterButton: false,
  }), []);

  const handleStatusSelect = useCallback(async (value: string) => {
    if (!statusTarget || value === statusTarget.current) {
      setStatusTarget(null);
      return;
    }
    await updateTaskStatus(statusTarget.rowId, value);
    setStatusTarget(null);
  }, [statusTarget]);

  const dataSource = useMemo<IDatasource>(() => ({
    getRows: (params) => {
      const queryParams = new URLSearchParams({
        startRow: String(params.startRow),
        endRow: String(params.endRow),
        sortModel: JSON.stringify(params.sortModel),
        filterModel: JSON.stringify(params.filterModel),
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
  }), []);

  return (
    <>
      <div className="ag-theme-custom h-[600px] w-full rounded-xl border shadow-sm">
        <AgGridReact
          ref={gridRef}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          context={ctx}
          rowModelType="infinite"
          datasource={dataSource}
          rowSelection="multiple"
          animateRows={true}
          suppressRowClickSelection={true}
          rowHeight={44}
          headerHeight={44}
          floatingFiltersHeight={36}
          cacheBlockSize={50}
          maxBlocksInCache={5}
          loadingOverlayComponent={GridLoadingOverlay}
          suppressNoRowsOverlay={true}
          suppressPaginationPanel={true}
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
        open={!!editingTask}
        onClose={() => { setEditingTask(null); gridRef.current?.api?.refreshInfiniteCache(); }}
        task={editingTask}
        projects={projects}
        users={users}
      />
    </>
  );
}
