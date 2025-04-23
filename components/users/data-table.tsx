// components/users/data-table.tsx
"use client"

import React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  PaginationState,
   ColumnFiltersState,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTableToolbar } from "./data-table-toolbar"
// --- Import Role type ---
import { Role } from "@/lib/types"; // Import Role type

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  pagination: PaginationState
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
  pageCount: number
  globalFilter: string
  setGlobalFilter: (value: string) => void
  columnFilters: ColumnFiltersState
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
  filterColumnIds?: string[]
  availableRoles?: Role[] // <-- Add prop for available roles
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pagination,
  setPagination,
  pageCount,
  globalFilter,
  setGlobalFilter,
  columnFilters,
  setColumnFilters,
  filterColumnIds,
  availableRoles // <-- Destructure prop
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: pageCount,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    manualFiltering: true,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      pagination,
      rowSelection,
      globalFilter,
      columnFilters,
    },
  })

  const renderTableBody = () => {
    // ... (skeleton/no results rendering remains the same) ...
    if (isLoading) {
      return Array.from({ length: pagination.pageSize }).map((_, i) => (
          <TableRow key={`skeleton-${i}`}>
              {columns.map((column, j) => (
                  <TableCell key={`skeleton-cell-${i}-${j}`}>
                      <Skeleton className="h-6 w-full" />
                  </TableCell>
              ))}
          </TableRow>
      ));
    }
    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row) => (
        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ));
    }
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          No results found.
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-4">
       {/* Pass availableRoles down to the Toolbar */}
       <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          filterColumnIds={filterColumnIds}
          availableRoles={availableRoles} // <-- Pass prop here
        />
      <div className="rounded-md border">
        <Table>
           <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader><TableBody>
            {renderTableBody()}
          </TableBody>
        </Table>
      </div>
      {/* ... (Pagination Controls remain the same) ... */}
       <div className="flex items-center justify-between space-x-2 py-4">
           <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} > Previous </Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} > Next </Button>
            </div>
        </div>
    </div>
  )
}