// app/dashboard/roles/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Role } from '@/lib/types';
import { fetchRoles } from '@/lib/data'; // Import fetchRoles
import { ALL_PERMISSIONS } from '@/lib/schema'; // Import permissions list from schema

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea if needed for table content

// Icons
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Import cn utility

// Import the RoleForm component
import RoleForm from '@/components/roles/role-form'; // Adjust path if needed

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddRoleOpen, setIsAddRoleOpen] = useState(false); // State for Add Role Dialog

    // --- Fetch Data Function using useCallback ---
    const loadRoles = useCallback(async () => {
        setIsLoading(true); // Set loading true at the start
        setError(null);
        try {
            const data = await fetchRoles();
            setRoles(data);
        } catch (err) {
            console.error("Failed to fetch roles:", err);
            setError("Failed to load roles.");
            toast.error("Failed to load roles.");
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array means this function is stable

    useEffect(() => {
        loadRoles();
    }, [loadRoles]); // Fetch roles on initial mount, useCallback ensures loadRoles is stable

    // --- Add Role Dialog Handlers ---
    const handleAddRoleSuccess = useCallback((newRole: Role) => {
        setIsAddRoleOpen(false); // Close the dialog
        loadRoles(); // Refetch the full list to ensure consistency
        // Toast success message is handled within RoleForm
    }, [loadRoles]); // Depend on loadRoles

    const handleAddRoleCancel = useCallback(() => {
        setIsAddRoleOpen(false); // Close the dialog
    }, []);

    // --- Other Handlers (Placeholders - Implement with actual API calls) ---
    const handleEditRole = useCallback((role: Role) => {
         toast.info(`Edit Role "${role.name}" functionality requires API integration.`);
         // 1. Open an Edit Dialog (similar to Add, but pre-filled)
         // 2. Need an <EditRoleForm /> component or modify RoleForm to handle 'edit' mode
         // 3. Need an updateRole API function in lib/data.ts
    }, []);

    const handleDeleteRole = useCallback(async (roleId: string, roleName: string) => {
        // IMPORTANT: Add a confirmation dialog here!
        // e.g., using Shadcn Alert Dialog: https://ui.shadcn.com/docs/components/alert-dialog
        const confirmed = window.confirm(`Are you sure you want to delete the role "${roleName}"? This cannot be undone.`); // Simple confirmation

        if (confirmed) {
            // Placeholder for actual deletion API call
            // const promise = () => deleteRole(roleId); // Assuming deleteRole exists in lib/data.ts
            const promise = () => new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

            toast.promise(promise, {
                loading: `Deleting role "${roleName}"...`,
                success: () => {
                    loadRoles(); // Refresh list after deletion
                    return `Role "${roleName}" deleted successfully (mock).`;
                },
                error: (err) => {
                    console.error("Deletion failed:", err);
                    return `Failed to delete role "${roleName}" (mock).`;
                },
            });
        }
    }, [loadRoles]); // Depend on loadRoles

    const handlePermissionToggle = useCallback(async (roleId: string, permission: string, enabled: boolean) => {
        // Placeholder for actual permission update API call
        // const promise = () => updateRolePermissions(roleId, permission, enabled); // Function needed in lib/data.ts
        const promise = () => new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

        toast.promise(promise, {
            loading: 'Updating permission...',
            success: () => {
                 // Optimistic UI update - NOTE: might get out of sync if API fails after this
                 setRoles(prevRoles => prevRoles.map(role => {
                    if (role.id === roleId) {
                        const currentPermissions = role.permissions || [];
                        const newPermissions = enabled
                            ? [...currentPermissions, permission]
                            : currentPermissions.filter(p => p !== permission);
                        return { ...role, permissions: Array.from(new Set(newPermissions)) }; // Ensure unique
                    }
                    return role;
                 }));
                 return `Permission "${permission}" ${enabled ? 'enabled' : 'disabled'} for role (mock).`;
            },
            error: (err) => {
                 console.error("Permission update failed:", err);
                 // Consider reverting optimistic update here or calling loadRoles()
                 return `Failed to update permission (mock).`;
            }
        });


    }, []); // No dependency on loadRoles needed if using optimistic update

    // --- Skeleton Component for Table Rows ---
    const RoleRowSkeleton = () => (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
            {/* Skeletons for permission checkboxes */}
            {ALL_PERMISSIONS.map(p => (
                 <TableCell key={`${p}-skel`} className="text-center"><Skeleton className="h-6 w-6 rounded-sm mx-auto" /></TableCell>
            ))}
            <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell> {/* Adjust alignment if needed */}
        </TableRow>
    );


    return (
        <div className="space-y-6">
            {/* Header: Title and Add Button */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Roles & Permissions</h1>
                 {/* Add Role Button with Dialog */}
                 <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
                    <DialogTrigger asChild>
                        {/* Button triggers the dialog - no onClick needed here */}
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Role
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Role</DialogTitle>
                            <DialogDescription>
                                Define a new role and select its permissions.
                            </DialogDescription>
                        </DialogHeader>
                        {/* Render the RoleForm inside the Dialog */}
                        <RoleForm
                            mode="create"
                            onSuccess={handleAddRoleSuccess}
                            onCancel={handleAddRoleCancel}
                        />
                    </DialogContent>
                 </Dialog>
            </div>

            {/* Description under the header */}
             <CardDescription>
                Define roles and manage what actions users with each role can perform.
             </CardDescription>

            {/* Display error message if fetching failed */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Card containing the Permissions Table */}
            <Card>
                 <CardHeader>
                     <CardTitle>Permission Matrix</CardTitle>
                     {/* Optional: Add search/filter for permissions here later */}
                 </CardHeader>
                <CardContent>
                    <ScrollArea className="w-full whitespace-nowrap"> {/* Added ScrollArea for horizontal scroll on small screens */}
                        <Table className="min-w-[800px]"> {/* Set min-width to encourage scrolling */}
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px] sticky left-0 bg-card z-10">Role</TableHead> {/* Sticky role column */}
                                    <TableHead className="w-[250px]">Description</TableHead>
                                    {/* Render headers for each permission */}
                                    {ALL_PERMISSIONS.map(permission => (
                                        <TableHead key={permission} className="text-center text-xs px-2 min-w-[80px]">
                                            {/* Simple formatting for readability */}
                                            {permission.split(':')[0]} <br /> {permission.split(':')[1]}
                                        </TableHead>
                                    ))}
                                    <TableHead className="w-[100px] text-right sticky right-0 bg-card z-10">Actions</TableHead> {/* Sticky actions column */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    // Render Skeleton rows while loading
                                    Array.from({ length: 3 }).map((_, i) => <RoleRowSkeleton key={`skel-${i}`} />)
                                ) : roles.length > 0 ? (
                                    // Render actual role rows
                                    roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell className="font-medium sticky left-0 bg-card z-10">{role.name}</TableCell> {/* Sticky role cell */}
                                        <TableCell className="text-sm text-muted-foreground whitespace-normal">{role.description || 'N/A'}</TableCell>
                                        {/* Render checkbox for each permission */}
                                        {ALL_PERMISSIONS.map(permission => (
                                            <TableCell key={`${role.id}-${permission}`} className="text-center">
                                                <Checkbox
                                                    checked={role.permissions.includes(permission)}
                                                    onCheckedChange={(checked) => handlePermissionToggle(role.id, permission, !!checked)}
                                                    aria-label={`Enable ${permission} for ${role.name}`}
                                                    // Example: Disable edits for default Admin role
                                                    disabled={role.name === 'Admin'}
                                                />
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-right sticky right-0 bg-card z-10"> {/* Sticky actions cell */}
                                            <div className="flex gap-1 justify-end">
                                                {/* Edit Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditRole(role)}
                                                    disabled={role.name === 'Admin'} // Disable edit for Admin
                                                    aria-label={`Edit role ${role.name}`}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {/* Delete Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteRole(role.id, role.name)}
                                                    disabled={role.name === 'Admin'} // Disable delete for Admin
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    aria-label={`Delete role ${role.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    ))
                                ) : (
                                    // Render message if no roles are found
                                    <TableRow>
                                        <TableCell colSpan={ALL_PERMISSIONS.length + 3} className="h-24 text-center">
                                            No roles defined yet. Click "Add Role" to create one.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                 </CardContent>
             </Card>
        </div>
    );
}