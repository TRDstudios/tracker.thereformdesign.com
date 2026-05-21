"use client";

import { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, IDatasource } from "ag-grid-community";
import {
  ModuleRegistry,
  InfiniteRowModelModule,
  TextFilterModule,
  PaginationModule,
  ColumnAutoSizeModule,
  ValidationModule,
} from "ag-grid-community";
import { Pencil, Ban, Check, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { deleteUser, deactivateUser, activateUser } from "@/lib/actions/admin";
import { toast } from "sonner";

ModuleRegistry.registerModules([
  InfiniteRowModelModule,
  TextFilterModule,
  PaginationModule,
  ColumnAutoSizeModule,
  ValidationModule,
]);

function ActionsRenderer(params: ICellRendererParams & { isSuperAdmin: boolean; currentUserId: string }) {
  const data = params.data;
  if (!data) return null;

  const isCurrentUser = data.id === params.currentUserId;

  const handleDeactivate = async () => {
    try {
      await deactivateUser(data.id);
      toast.success("User deactivated");
      params.api?.refreshInfiniteCache();
    } catch {
      toast.error("Failed to deactivate user");
    }
  };

  const handleActivate = async () => {
    try {
      await activateUser(data.id);
      toast.success("User activated");
      params.api?.refreshInfiniteCache();
    } catch {
      toast.error("Failed to activate user");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this user and all their data?")) return;
    try {
      await deleteUser(data.id);
      toast.success("User deleted");
      params.api?.refreshInfiniteCache();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  if (!params.isSuperAdmin || isCurrentUser) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <button
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#a1a1a1] transition-colors hover:bg-[#f5f5f4] hover:text-[#1d1d1d]"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      {data.active ? (
        <button
          onClick={() => { if (confirm("Deactivate this user? They won't be able to log in.")) handleDeactivate(); }}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#a1a1a1] transition-colors hover:bg-[#f5f5f4] hover:text-[#1d1d1d]"
          title="Deactivate"
        >
          <Ban className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={handleActivate}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#a1a1a1] transition-colors hover:bg-[#f5f5f4] hover:text-[#1d1d1d]"
          title="Activate"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={handleDelete}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#a1a1a1] transition-colors hover:bg-red-50 hover:text-red-500"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AgGridUsers({
  isSuperAdmin,
  currentUserId,
}: {
  isSuperAdmin: boolean;
  currentUserId: string;
}) {
  const gridRef = useRef<AgGridReact>(null);

  const colDefs = useMemo<ColDef[]>(() => [
    {
      field: "name",
      headerName: "Name",
      flex: 1.5,
      minWidth: 200,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value) return null;
        const initials = params.value
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-[#f5eb10]/20 text-[#1d1d1d] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-[#1d1d1d]">{params.value}</p>
              <p className="text-xs text-[#1d1d1d]/50">{params.data.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 200,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => (
        <span className="text-sm text-[#1d1d1d]/70">{params.value}</span>
      ),
    },
    {
      field: "active",
      headerName: "Status",
      width: 110,
      sortable: true,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => {
        const isActive = params.value as boolean;
        return (
          <Badge
            variant={isActive ? "default" : "destructive"}
            className="rounded-md text-[10px] font-medium"
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      field: "role",
      headerName: "Role",
      width: 140,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => {
        const value = params.value as string;
        return (
          <Badge
            variant={
              value === "super_admin"
                ? "default"
                : value === "admin"
                  ? "secondary"
                  : "outline"
            }
            className="rounded-md text-[10px] font-medium"
          >
            {value}
          </Badge>
        );
      },
    },
    {
      colId: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams) => (
        <ActionsRenderer {...params} isSuperAdmin={isSuperAdmin} currentUserId={currentUserId} />
      ),
    },
  ], [isSuperAdmin, currentUserId]);

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
      });

      fetch(`/api/users?${queryParams}`)
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
    <div className="ag-theme-custom h-[600px] w-full rounded-xl border shadow-sm">
      <AgGridReact
        ref={gridRef}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        rowModelType="infinite"
        datasource={dataSource}
        pagination={true}
        paginationPageSize={20}
        paginationPageSizeSelector={[10, 20, 50, 100]}
        animateRows={true}
        rowHeight={56}
        headerHeight={44}
        floatingFiltersHeight={36}
        cacheBlockSize={50}
        maxBlocksInCache={5}
      />
    </div>
  );
}
