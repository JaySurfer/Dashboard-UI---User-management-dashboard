// app/dashboard/users/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link'; // Keep if used elsewhere, like in sidebar link logic
import { cn } from "@/lib/utils";

// Types and Data functions
import { User, Role } from '@/lib/types'; // Import User and Role types
import { fetchUsers, deleteUser, fetchRoles } from '@/lib/data'; // Import data fetching functions

// Components
import { columns } from '@/components/users/columns'; // Table column definitions
import { DataTable } from '@/components/users/data-table'; // Reusable data table
import { Button } from '@/components/ui/button'; // Button component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Dialog components
import UserForm from '@/components/users/user-form'; // Add/Edit User Form
import UserDetails from '@/components/users/user-details'; // User Details View
import { Skeleton } from '@/components/ui/skeleton'; // Loading state skeletons

// Icons
import { UserPlus, RefreshCw } from 'lucide-react';

// Notifications
import { toast } from "sonner";

export default function UsersPage() {
  // State for Users Data
  const [data, setData] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // State for Roles Data
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  // State for Table Interaction
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 }); // TanStack Table uses 0-based index
  const [globalFilter, setGlobalFilter] = useState(''); // Global search term
  const [columnFilters, setColumnFilters] = useState<any[]>([]); // Column-specific filters (e.g., role, status)

  // State for Dialogs
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // User data for Edit/View dialogs

  // State for Errors
  const [error, setError] = useState<string | null>(null);

  // Calculate page count for pagination
  const pageCount = useMemo(() => {
      // Avoid division by zero if pageSize is somehow 0
      if (!pagination.pageSize || pagination.pageSize <= 0) return 0;
      return Math.ceil(totalCount / pagination.pageSize);
  }, [totalCount, pagination.pageSize]);

  // --- Data Fetching Function ---
  // Use useCallback to memoize the fetch function, preventing unnecessary re-renders
  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    setIsLoadingRoles(true); // Start loading roles too
    setError(null);
    try {
        // Prepare filters for the API call
        const filters: Record<string, string> = columnFilters.reduce((acc, filter) => {
            acc[filter.id] = filter.value;
            return acc;
        }, {});

        // Fetch users and roles concurrently for efficiency
        const [usersResult, rolesResult] = await Promise.all([
            fetchUsers({
                page: pagination.pageIndex + 1, // API might use 1-based index
                limit: pagination.pageSize,
                query: globalFilter,
                filters: filters,
            }),
            fetchRoles() // Fetch the list of available roles
        ]);

        // Update state with fetched data
        setData(usersResult.users);
        setTotalCount(usersResult.totalCount);
        setAvailableRoles(rolesResult);

    } catch (err) {
      console.error("Failed to fetch page data:", err);
      const errorMsg = "Failed to load data. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg); // Notify user of fetch error
    } finally {
      // Ensure loading states are set to false regardless of success/failure
      setIsLoadingData(false);
      setIsLoadingRoles(false);
    }
  // Dependencies for useCallback: these state values trigger a refetch when changed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, columnFilters]); // Dependencies array for useCallback

  // --- Initial Data Load ---
  // useEffect hook to call fetchData when the component mounts or fetchData dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Dependency array includes the memoized fetchData function

  // --- Action Handlers (Memoized with useCallback) ---

  // Refresh data manually
  const handleRefresh = useCallback(() => {
    fetchData(); // Call the main fetch function
  }, [fetchData]);

  // Called after UserForm successfully adds a user
  const handleUserAdded = useCallback(() => {
    setIsAddUserOpen(false); // Close the dialog
    toast.success("User added successfully!"); // Show success message
    fetchData(); // Refresh the user list (and roles)
  }, [fetchData]);

  // Called after UserForm successfully updates a user
  const handleUserUpdated = useCallback(() => {
    setIsEditUserOpen(false); // Close the dialog
    setCurrentUser(null); // Clear the selected user
    toast.success("User updated successfully!"); // Show success message
    fetchData(); // Refresh the user list
  }, [fetchData]);

   // Set user for viewing and open dialog
   const handleViewUser = useCallback((user: User) => {
    setCurrentUser(user);
    setIsViewUserOpen(true);
  }, []); // No dependencies needed as it only sets state

  // Set user for editing and open dialog
  const handleEditUser = useCallback((user: User) => {
    // Setting the user and opening the dialog
    setCurrentUser(user);
    setIsEditUserOpen(true);
  }, []); // No dependencies needed

  // Handle user deletion with confirmation and feedback
  const handleDeleteUser = useCallback(async (userId: string, userName: string) => {
    // IMPORTANT: Replace window.confirm with a Shadcn AlertDialog for better UX in a real app
    const confirmed = window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`);
    if (!confirmed) return;

    // Use toast.promise for async feedback
    const promise = () => deleteUser(userId); // Call the delete API function
    toast.promise(promise, {
        loading: `Deleting user "${userName}"...`,
        success: (deleted) => {
            if (deleted) {
                // Check if the deletion affects the current page count
                if (data.length === 1 && pagination.pageIndex > 0) {
                     // Go back one page if the last item on a page > 1 was deleted
                     setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }));
                     // Note: fetchData will be called by the useEffect watching pagination change
                 } else {
                     fetchData(); // Refresh current page data
                 }
                return `User "${userName}" deleted successfully!`;
            } else {
                // This might happen if the user was already deleted elsewhere
                fetchData(); // Refresh data anyway
                return `User "${userName}" could not be found or already deleted.`;
            }
        },
        error: (err) => {
            console.error("Deletion failed:", err);
            return `Failed to delete user "${userName}".`; // Provide error feedback
        },
    });
  }, [fetchData, data.length, pagination.pageIndex]); // Add dependencies used inside

  // --- Memoize Table Columns ---
  // useMemo prevents redefining columns on every render unless dependencies change
  const dynamicColumns = useMemo(() => columns({
    onEdit: handleEditUser,
    onView: handleViewUser,
    // Define inline function to pass necessary args to handleDeleteUser
    onDelete: (userId: string) => {
        // Find the user in the current data to get their name for the confirmation
        const userToDelete = data.find(u => u.id === userId);
        handleDeleteUser(userId, userToDelete?.name || 'Unknown User');
    },
  }), [handleEditUser, handleViewUser, handleDeleteUser, data]); // Include 'data' as dependency if name lookup needed

  // --- Render Component ---
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoadingData || isLoadingRoles} // Disable if any data is loading
            aria-label="Refresh user list"
          >
            <RefreshCw className={`h-4 w-4 ${(isLoadingData || isLoadingRoles) ? 'animate-spin' : ''}`} />
          </Button>

          {/* Add User Dialog Trigger */}
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              {/* Disable button while roles are loading */}
              <Button
                className={cn("bg-[rgb(21,22,53)] text-white hover:bg-[rgb(40,42,75)]")}
                disabled={isLoadingRoles}
              >
                <UserPlus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              {/* Show skeleton or form based on role loading state */}
              {isLoadingRoles ? (
                   <div className="space-y-4 py-4">
                       <Skeleton className="h-10 w-full" /> {/* Name */}
                       <Skeleton className="h-10 w-full" /> {/* Email */}
                       <Skeleton className="h-10 w-full" /> {/* Role */}
                       <Skeleton className="h-10 w-full" /> {/* Status */}
                       <div className="flex justify-end gap-2 pt-4">
                          <Skeleton className="h-9 w-20" /> {/* Cancel button */}
                          <Skeleton className="h-9 w-24" /> {/* Create button */}
                       </div>
                   </div>
              ) : (
                    <UserForm
                        mode="create"
                        onSuccess={handleUserAdded}
                        onCancel={() => setIsAddUserOpen(false)}
                        availableRoles={availableRoles} // Pass fetched roles to the form
                    />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Display Global Error Message */}
      {error && <p className="text-red-500 px-1 py-2">{error}</p>}

      {/* Data Table */}
      {/* Pass necessary props including loading state and roles for toolbar filtering */}
      <DataTable
        columns={dynamicColumns}
        data={data}
        isLoading={isLoadingData} // Only pass user data loading state to table body skeleton
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        filterColumnIds={['role', 'status']} // Columns filterable by the toolbar
        availableRoles={availableRoles} // Pass roles to table for toolbar filter
      />

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={(open) => { setIsEditUserOpen(open); if (!open) setCurrentUser(null); }}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {/* Ensure currentUser exists and roles are loaded before rendering the form */}
          {currentUser && !isLoadingRoles ? (
            <UserForm
              mode="edit"
              initialData={currentUser}
              onSuccess={handleUserUpdated}
              onCancel={() => { setIsEditUserOpen(false); setCurrentUser(null); }}
              availableRoles={availableRoles} // Pass fetched roles to the form
            />
          ) : (
              // Show loading skeleton if roles not ready or user not selected
               <div className="space-y-4 py-4">
                   <Skeleton className="h-10 w-full" /> {/* Name */}
                   <Skeleton className="h-10 w-full" /> {/* Email */}
                   <Skeleton className="h-10 w-full" /> {/* Role */}
                   <Skeleton className="h-10 w-full" /> {/* Status */}
                   <div className="flex justify-end gap-2 pt-4">
                      <Skeleton className="h-9 w-20" /> {/* Cancel button */}
                      <Skeleton className="h-9 w-24" /> {/* Save button */}
                   </div>
               </div>
          )}
        </DialogContent>
      </Dialog>

       {/* View User Details Dialog */}
       <Dialog open={isViewUserOpen} onOpenChange={(open) => { setIsViewUserOpen(open); if (!open) setCurrentUser(null); }}>
            <DialogContent className="sm:max-w-[500px] md:max-w-[700px] max-h-[85vh] overflow-y-auto">
                 <DialogHeader>
                     <DialogTitle>User Details</DialogTitle>
                 </DialogHeader>
                 {/* Render UserDetails only if a currentUser is selected */}
                 {currentUser ? (
                     <UserDetails user={currentUser} />
                 ) : (
                      // Optional: Skeleton for view dialog if needed
                      <div className="space-y-4 py-4">
                          <Skeleton className="h-16 w-16 rounded-full" />
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-64" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                      </div>
                 )}
            </DialogContent>
       </Dialog>
    </div>
  );
}