"use client";

import { useMemo, useRef, useState } from "react";
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
import { Pencil, Ban, Check, Trash2, X } from "lucide-react";
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

type ConfirmAction = "deactivate" | "delete" | null;

function ConfirmDialog({
  action,
  userName,
  onConfirm,
  onCancel,
}: {
  action: ConfirmAction;
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!action) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1d1d1d]">
            {action === "delete" ? "Delete user" : "Deactivate user"}
          </h3>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#a1a1a1] transition-colors hover:bg-[#f5f5f4] hover:text-[#1d1d1d]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-6 text-sm text-[#1d1d1d]/60">
          {action === "delete"
            ? `Are you sure you want to delete "${userName}"? This action cannot be undone.`
            : `Are you sure you want to deactivate "${userName}"? They won't be able to log in.`}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm font-medium text-[#1d1d1d] transition-colors hover:bg-[#f5f5f4]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={
              action === "delete"
                ? "cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                : "cursor-pointer rounded-lg bg-[#1d1d1d] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d1d1d]/80"
            }
          >
            {action === "delete" ? "Delete" : "Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionsRenderer(
  params: ICellRendererParams & {
    isSuperAdmin: boolean;
    currentUserId: string;
    onConfirmAction: (action: ConfirmAction, userId: string, userName: string) => void;
  }
) {
  const data = params.data;
  if (!data) return null;

  const isCurrentUser = data.id === params.currentUserId;

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
      <button
        onClick={() => params.onConfirmAction(data.active ? "deactivate" : null, data.id, data.name)}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#a1a1a1] transition-colors hover:bg-[#f5f5f4] hover:text-[#1d1d1d]"
        title={data.active ? "Deactivate" : "Activate"}
      >
        {data.active ? <Ban className="h-4 w-4" /> : <Check className="h-4 w-4" />}
      </button>
      <button
        onClick={() => params.onConfirmAction("delete", data.id, data.name)}
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
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingUserName, setPendingUserName] = useState<string>("");

  const openConfirm = (action: ConfirmAction, userId: string, userName: string) => {
    if (!action) {
      handleActivate(userId);
      return;
    }
    setConfirmAction(action);
    setPendingUserId(userId);
    setPendingUserName(userName);
  };

  const closeConfirm = () => {
    setConfirmAction(null);
    setPendingUserId(null);
    setPendingUserName("");
  };

  const handleDeactivate = async (userId: string) => {
    try {
      await deactivateUser(userId);
      toast.success("User deactivated");
      gridRef.current?.api?.refreshInfiniteCache();
    } catch {
      toast.error("Failed to deactivate user");
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await activateUser(userId);
      toast.success("User activated");
      gridRef.current?.api?.refreshInfiniteCache();
    } catch {
      toast.error("Failed to activate user");
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success("User deleted");
      gridRef.current?.api?.refreshInfiniteCache();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleConfirm = async () => {
    const userId = pendingUserId;
    const action = confirmAction;
    closeConfirm();
    if (!userId) return;
    if (action === "delete") {
      await handleDelete(userId);
    } else if (action === "deactivate") {
      await handleDeactivate(userId);
    }
  };

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
        if (params.value == null) return null;
        return (
          <Badge
            variant={params.value ? "default" : "destructive"}
            className="rounded-md text-[10px] font-medium"
          >
            {params.value ? "Active" : "Inactive"}
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
        if (!value) return null;
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
        <ActionsRenderer {...params} isSuperAdmin={isSuperAdmin} currentUserId={currentUserId} onConfirmAction={openConfirm} />
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
    <>
      <ConfirmDialog
        action={confirmAction}
        userName={pendingUserName}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
      <div className="ag-theme-custom h-[600px] w-full rounded-xl border shadow-sm">
        <AgGridReact
          ref={gridRef}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          rowModelType="infinite"
          datasource={dataSource}
          animateRows={true}
          rowHeight={56}
          headerHeight={44}
          floatingFiltersHeight={36}
          cacheBlockSize={100}
          maxBlocksInCache={5}
          suppressLoadingOverlay={true}
          suppressNoRowsOverlay={true}
          suppressPaginationPanel={true}
        />
      </div>
    </>
  );
}
