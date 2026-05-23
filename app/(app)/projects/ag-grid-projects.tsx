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
import { Eye, Pencil, Trash2, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { deleteProject } from "@/lib/actions/projects";
import { toast } from "sonner";
import { ProjectEditPanel } from "./project-edit-panel";
import { GridLoadingOverlay } from "@/components/ui/grid-loading-overlay";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  TextFilterModule,
  ColumnAutoSizeModule,
  ValidationModule,
]);

const textFilterParams = { filterOptions: ["contains"] };

interface ProjectRowData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  ownerId: string;
  ownerName: string;
  stack: string[] | null;
  liveUrl: string | null;
  demoUrl: string | null;
  features: { name: string; completed: boolean }[] | null;
  serverDetails: string | null;
  domainDetails: string | null;
  createdAt: string;
}

interface GridContext {
  onEdit: (project: ProjectRowData) => void;
}

export function AgGridProjects({
  isAdmin,
  refreshTrigger = 0,
}: {
  isAdmin: boolean;
  refreshTrigger?: number;
}) {
  const router = useRouter();
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<ProjectRowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<ProjectRowData | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setRowData(data.rows);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (refreshTrigger) loadData(); }, [refreshTrigger, loadData]);

  const handleDelete = async (projectId: string) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      await deleteProject(projectId);
      toast.success("Project deleted");
      loadData();
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const ctx: GridContext = useMemo(() => ({ onEdit: setEditingProject }), []);

  const colDefs = useMemo<ColDef[]>(() => [
    {
      field: "name",
      headerName: "Project",
      flex: 2,
      minWidth: 200,
      filter: "agTextColumnFilter",
      filterParams: textFilterParams,
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-[#f5eb10]" />
          <span className="font-medium text-[#1d1d1d]">{params.value || ""}</span>
        </div>
      ),
    },
    {
      field: "ownerName",
      headerName: "Owner",
      flex: 1,
      minWidth: 150,
      filter: "agTextColumnFilter",
      filterParams: textFilterParams,
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => (
        <span className="text-sm text-[#1d1d1d]/70">{params.value || "—"}</span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      filter: "agTextColumnFilter",
      filterParams: textFilterParams,
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value) return null;
        return (
          <Badge
            variant={params.value === "active" ? "default" : "secondary"}
            className="rounded-md text-[10px] font-medium"
          >
            {params.value}
          </Badge>
        );
      },
    },
    {
      field: "stack",
      headerName: "Stack",
      flex: 1,
      minWidth: 160,
      filter: false,
      sortable: false,
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value?.length) return <span className="text-sm text-[#a1a1a1]">—</span>;
        return (
          <div className="flex flex-wrap gap-1 py-1">
            {(params.value as string[]).map((s: string) => (
              <span key={s} className="rounded-md bg-[#f5f5f4] px-2 py-0.5 text-[10px] font-medium text-[#1d1d1d]/70">
                {s}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 130,
      sortable: true,
      filter: false,
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value) return null;
        return <span className="text-sm text-[#1d1d1d]/60">{new Date(params.value).toLocaleDateString()}</span>;
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
              onClick={(e) => { e.stopPropagation(); router.push(`/projects/${params.data.id}`); }}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#a1a1a1] transition-colors hover:bg-[#f5f5f4] hover:text-[#1d1d1d]"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (isAdmin) { const c = params.context as GridContext; c.onEdit(params.data); } }}
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
    suppressHeaderMenuButton: true,
  }), []);

  return (
    <>
    <div className="ag-theme-custom h-[600px] w-full rounded-xl border shadow-sm">
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
      <ProjectEditPanel
        open={!!editingProject}
        onClose={() => { setEditingProject(null); loadData(); }}
        project={editingProject}
      />
    </>
  );
}
