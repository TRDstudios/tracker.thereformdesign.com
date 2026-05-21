"use client";

import { useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, IDatasource } from "ag-grid-community";
import {
  ModuleRegistry,
  InfiniteRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  PaginationModule,
  RowSelectionModule,
  ColumnAutoSizeModule,
  ValidationModule,
} from "ag-grid-community";
import { updateTaskStatus } from "@/lib/actions/tasks";
import type { GridContext } from "./ag-grid-constants";
import {
  StatusCellRenderer,
  PriorityCellRenderer,
  ProjectCellRenderer,
  DateCellRenderer,
} from "./ag-grid-cell-renderers";
import { StatusDropdown } from "./ag-grid-status-dropdown";

ModuleRegistry.registerModules([
  InfiniteRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  PaginationModule,
  RowSelectionModule,
  ColumnAutoSizeModule,
  ValidationModule,
]);

export function AgGridTasks() {
  const router = useRouter();
  const [statusTarget, setStatusTarget] = useState<{
    rowId: string;
    current: string;
    rect: DOMRect;
  } | null>(null);

  const ctx: GridContext = useMemo(() => ({ setStatusTarget }), []);

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
        <span className="font-medium text-[#1d1d1d]">{params.value}</span>
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
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    suppressHeaderMenuButton: false,
    suppressHeaderFilterButton: false,
  }), []);

  const onCellClicked = useCallback((params: { column: { getColId: () => string }; data: { id: string } }) => {
    if (params.column.getColId() === "status") return;
    router.push(`/tasks/${params.data.id}`);
  }, [router]);

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
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          context={ctx}
          rowModelType="infinite"
          datasource={dataSource}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          rowSelection="multiple"
          onCellClicked={onCellClicked}
          animateRows={true}
          suppressRowClickSelection={true}
          rowHeight={44}
          headerHeight={44}
          floatingFiltersHeight={36}
          cacheBlockSize={50}
          maxBlocksInCache={5}
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
    </>
  );
}
