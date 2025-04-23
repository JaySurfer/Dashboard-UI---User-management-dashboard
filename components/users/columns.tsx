// components/users/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User, UserRole, UserStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Eye, Ban } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Helper function to get initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// Define action handlers props type
type ColumnActionsProps = {
    onEdit: (user: User) => void;
    onView: (user: User) => void;
    onDelete: (userId: string) => void;
    // onSuspend?: (userId: string, currentStatus: UserStatus) => void; // Optional suspend action
}

// Factory function to create columns with actions
export const columns = ({ onEdit, onView, onDelete }: ColumnActionsProps): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
     cell: ({ row }) => {
      const user = row.original;
      return (
          <div className="flex items-center gap-3">
             <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.name}</span>
          </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
        const role = row.getValue("role") as UserRole;
        // Optional: Add styling based on role
        let variant: "secondary" | "outline" | "default" = "secondary";
        if (role === 'Admin') variant = 'default';
        if (role === 'Manager') variant = 'outline';

        return <Badge variant={variant}>{role}</Badge>
    },
     // Add filter function for TanStack Table
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: "Status",
     cell: ({ row }) => {
        const status = row.getValue("status") as UserStatus;
        let colorClass = '';
        switch (status) {
            case 'Active': colorClass = 'bg-green-500'; break;
            case 'Inactive': colorClass = 'bg-gray-500'; break;
            case 'Pending': colorClass = 'bg-yellow-500'; break;
        }
        return (
            <div className="flex items-center">
                <span className={`mr-2 h-2 w-2 rounded-full ${colorClass}`}></span>
                {status}
            </div>
        );
    },
     // Add filter function for TanStack Table
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
    },
  },
   {
    accessorKey: "department",
    header: "Department",
     cell: ({ row }) => row.getValue("department") || 'N/A',
  },
  {
    accessorKey: "dateCreated",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("dateCreated"))
      return <div className="text-right font-medium">{date.toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(user)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="mr-2 h-4 w-4" /> Edit User
            </DropdownMenuItem>
            {/* Optional Suspend/Activate Action
            <DropdownMenuItem onClick={() => onSuspend?.(user.id, user.status)}>
               <Ban className="mr-2 h-4 w-4" />
               {user.status === 'Active' ? 'Suspend' : 'Activate'} User
            </DropdownMenuItem>
             */}
            <DropdownMenuSeparator />
            <DropdownMenuItem
                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                onClick={() => onDelete(user.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]