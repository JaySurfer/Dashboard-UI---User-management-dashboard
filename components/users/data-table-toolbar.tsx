// components/users/data-table-toolbar.tsx
"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
// --- Import Role type ---
import { UserStatus, Role } from "@/lib/types" // Adjusted import if Role wasn't here
// --- End Import ---
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface DataTableToolbarProps<TData> {
  table: Table<TData>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  filterColumnIds?: string[]
  availableRoles?: Role[] // <-- Add prop for available roles
}

// Remove hardcoded roles - we get them from props now
// const roleOptions: UserRole[] = ["Admin", "Manager", "Staff", "Viewer"];
const statusOptions: UserStatus[] = ["Active", "Inactive", "Pending"]; // Keep statuses if they are fixed

export function DataTableToolbar<TData>({
  table,
  globalFilter,
  setGlobalFilter,
  filterColumnIds = [],
  availableRoles = [] // <-- Destructure prop with default empty array
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || globalFilter.length > 0

   const renderFilterInput = (columnId: string) => {
    const column = table.getColumn(columnId);
    if (!column) return null;

    const filterValue = (column.getFilterValue() as string) ?? "";

    // --- Modified Role Filter Logic ---
    if (columnId === 'role') {
        const placeholder = "Filter by Role...";
        return (
            <Select
                value={filterValue}
                onValueChange={(value) => {
                    column.setFilterValue(value === 'all' ? undefined : value);
                }}
            >
                <SelectTrigger className="h-8 w-[150px] lg:w-[180px] text-muted-foreground">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {/* Map over availableRoles from props */}
                    {availableRoles.map((role) => (
                        // Use role.name for value and display
                        <SelectItem key={role.id} value={role.name}>
                            {role.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }
    // --- End Role Filter Logic ---

    // --- Status Filter Logic (Remains the same) ---
    if (columnId === 'status') {
        const placeholder = "Filter by Status...";
        return (
            <Select
                value={filterValue}
                onValueChange={(value) => {
                    column.setFilterValue(value === 'all' ? undefined : value);
                }}
            >
                 <SelectTrigger className="h-8 w-[150px] lg:w-[180px] text-muted-foreground">
                     <SelectValue placeholder={placeholder} />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    // Fallback for other columns (if any) - render simple input
    return (
         <Input
            placeholder={`Filter by ${columnId}...`}
            value={filterValue}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className="h-8 w-[150px] lg:w-[200px]"
        />
     );
  };


  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex flex-1 items-center space-x-2">
        {/* Global Search Input */}
        <Input
          placeholder="Search users (name, email)..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {/* Render specific filters based on filterColumnIds */}
        {filterColumnIds.includes('role') && renderFilterInput('role')}
        {filterColumnIds.includes('status') && renderFilterInput('status')}
         {/* Add more specific filters here if needed */}

        {/* Reset Button */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
                 setGlobalFilter(""); // Clear global search
                 table.resetColumnFilters(); // Clear column filters
                }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {/* Optional: View options, data export etc. can go here */}
    </div>
  )
}