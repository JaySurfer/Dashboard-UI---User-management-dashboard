// components/roles/role-form.tsx
"use client";

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area"; // To handle many permissions

import { Role } from "@/lib/types";
import { roleSchema, ALL_PERMISSIONS } from "@/lib/schema"; // Import schema and permissions list
import { createRole } from "@/lib/data"; // Import API function

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  mode: "create"; // Add "edit" later if needed
  initialData?: Partial<RoleFormValues>; // For pre-filling in edit mode
  onSuccess: (newRole: Role) => void; // Callback on successful submission
  onCancel: () => void; // Callback for cancel button
}

export default function RoleForm({ mode, initialData, onSuccess, onCancel }: RoleFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: initialData || {
            name: "",
            description: "",
            permissions: [], // Start with no permissions selected
        },
    });

    async function onSubmit(values: RoleFormValues) {
        setIsLoading(true);
        const roleData = {
            name: values.name,
            description: values.description || undefined,
            permissions: values.permissions || [], // Ensure it's always an array
        };

        console.log("Submitting role data:", roleData); // Debug log

        const promise = () => createRole(roleData); // Assuming mode is 'create'

        toast.promise(promise, {
            loading: "Creating role...",
            success: (newRole) => {
                onSuccess(newRole); // Pass the created role back
                return `Role "${newRole.name}" created successfully!`;
            },
            error: (err: Error) => {
                console.error("Role creation error:", err);
                // Display specific error message from mock API or a generic one
                return err.message || "Failed to create role.";
            },
            finally: () => {
                setIsLoading(false);
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Role Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Marketing Manager" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Role Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Briefly describe the role's purpose..." className="resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Permissions */}
                <FormField
                    control={form.control}
                    name="permissions"
                    render={() => ( // We use Controller below for checkboxes
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Permissions</FormLabel>
                                <FormDescription>
                                    Select the actions this role can perform.
                                </FormDescription>
                            </div>
                            <ScrollArea className="h-40 w-full rounded-md border p-4"> {/* Scroll area for many checkboxes */}
                                <div className="space-y-2">
                                    {ALL_PERMISSIONS.map((permissionId) => (
                                        <FormField
                                            key={permissionId}
                                            control={form.control}
                                            name="permissions"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={permissionId}
                                                        className="flex flex-row items-center space-x-3 space-y-0"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(permissionId)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...(field.value || []), permissionId]) // Add permission
                                                                        : field.onChange( // Remove permission
                                                                            field.value?.filter(
                                                                                (value) => value !== permissionId
                                                                            )
                                                                        );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-sm font-normal cursor-pointer">
                                                            {permissionId}
                                                        </FormLabel>
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                            <FormMessage /> {/* Show validation errors for the permissions array */}
                        </FormItem>
                    )}
                />


                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Role"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}