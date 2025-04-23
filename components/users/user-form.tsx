// components/users/user-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// --- Ensure ALL needed types are imported ---
import { User, Role, UserStatus, UserRole } from "@/lib/types";
// --- End Ensure ---
import { createUser, updateUser } from "@/lib/data"; // Import API functions
// --- Ensure correct schema import if using extended one ---
import { userSchema } from "@/lib/schema"; // Import base user schema
// --- End Ensure ---
import { useState } from "react";

// Define the Zod schema for THIS form, extending the base user schema
const formSchema = userSchema.extend({
    password: z.string().min(8, { message: "Password must be at least 8 characters." }).optional(),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    // Require password in create mode (id won't exist)
    if (!data.id && !data.password) return false;
    // Check password confirmation only if password is provided
    if (data.password && data.password !== data.confirmPassword) return false;
    return true;
}, {
    message: "Passwords required or do not match",
    path: ["confirmPassword"], // Attach error to confirmPassword field
});

// Infer the TS type from THIS form's Zod schema
type UserFormValues = z.infer<typeof formSchema>;

// Define available statuses (likely fixed)
const statuses: UserStatus[] = ["Active", "Inactive", "Pending"];

// --- Updated Props Interface ---
interface UserFormProps {
  mode: "create" | "edit";
  initialData?: User | null;
  availableRoles: Role[]; // Expect an array of Role objects
  onSuccess: () => void;
  onCancel: () => void;
}
// --- End Update ---

export default function UserForm({ mode, initialData, availableRoles, onSuccess, onCancel }: UserFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isEditMode = mode === "edit";

    // Initialize the form
    const form = useForm<UserFormValues>({
        resolver: zodResolver(formSchema), // Use the extended schema defined above
        defaultValues: isEditMode && initialData ? {
            // Pre-fill for edit mode
            id: initialData.id,
            name: initialData.name,
            email: initialData.email,
            role: initialData.role, // role is just a string here from User type initially
            status: initialData.status,
            department: initialData.department || "",
            location: initialData.location || "",
            password: "", // Always clear passwords on edit load
            confirmPassword: "",
        } : {
            // Defaults for create mode
            name: "",
            email: "",
            // Sensible default role from available list
            role: availableRoles.find(r => r.name === 'Staff')?.name || availableRoles[0]?.name || "", // Pick Staff, first, or empty
            status: "Pending",
            department: "",
            location: "",
            password: "",
            confirmPassword: "",
        },
    });

    // Submission handler
    async function onSubmit(values: UserFormValues) {
        setIsLoading(true);
        // Destructure password fields separately
        const { password, confirmPassword, ...baseUserData } = values;

        // Construct the data payload for the API call
        const finalUserData = {
            ...baseUserData, // Includes name, email, status
            // --- Apply Type Assertion for Role ---
            role: values.role as UserRole, // Assert string is a valid UserRole
            // --- End Type Assertion ---
            department: values.department || undefined,
            location: values.location || undefined,
            // Conditionally include password only if provided
            ...(password && { password: password })
        };

        try {
             const promise = isEditMode && initialData?.id
                // Pass correctly typed data to updateUser
                ? () => updateUser(initialData.id, finalUserData)
                // Pass correctly typed data to createUser, including optional password
                : () => createUser(finalUserData as Omit<User, 'id' | 'dateCreated'> & { password?: string });

             toast.promise(promise, {
                loading: isEditMode ? 'Updating user...' : 'Creating user...',
                success: () => { // Result not needed here if form closes
                    onSuccess();
                    return `User ${isEditMode ? 'updated' : 'created'} successfully!`;
                },
                error: (err: Error) => {
                    console.error("Form submission error:", err);
                    return err.message || `Failed to ${isEditMode ? 'update' : 'create'} user.`;
                },
                 finally: () => {
                     setIsLoading(false);
                 }
            });

        } catch (error) {
            console.error("Submission failed:", error);
            toast.error(`An unexpected error occurred.`);
             setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            {/* Email Field */}
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email Address</FormLabel> <FormControl><Input type="email" placeholder="e.g., john.doe@example.com" {...field} /></FormControl> <FormDescription>Used for login and notifications.</FormDescription> <FormMessage /> </FormItem> )} />
            {/* Password Fields (Conditional) */}
            <FormField control={form.control} name="password" render={({ field }) => ( <FormItem> <FormLabel>{isEditMode ? 'New Password (optional)' : 'Password'}</FormLabel> <FormControl><Input type="password" placeholder="********" {...field} /></FormControl> <FormDescription>{isEditMode ? 'Leave blank to keep the current password.' : 'Minimum 8 characters.'}</FormDescription> <FormMessage /> </FormItem> )} />
             {form.watch('password') && ( <FormField control={form.control} name="confirmPassword" render={({ field }) => ( <FormItem> <FormLabel>Confirm Password</FormLabel> <FormControl><Input type="password" placeholder="********" {...field} /></FormControl> <FormMessage /> </FormItem> )} /> )}

            {/* --- Role Select (Uses availableRoles prop) --- */}
            <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                             <SelectValue placeholder={availableRoles.length > 0 ? "Select a role" : "No roles available"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {/* Map over the passed-in roles */}
                        {availableRoles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            {/* --- End Role Select --- */}

            {/* Status Select */}
            <FormField control={form.control} name="status" render={({ field }) => ( <FormItem> <FormLabel>Status</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl> <SelectContent>{statuses.map((status) => ( <SelectItem key={status} value={status}>{status}</SelectItem> ))}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
            {/* Department Field */}
            <FormField control={form.control} name="department" render={({ field }) => ( <FormItem> <FormLabel>Department (Optional)</FormLabel> <FormControl><Input placeholder="e.g., Engineering" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            {/* Location Field */}
            <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Location (Optional)</FormLabel> <FormControl><Input placeholder="e.g., New York" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            {/* Optional Avatar Placeholder */}

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-4">
                 <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}> Cancel </Button>
                 <Button type="submit" disabled={isLoading}> {isLoading ? "Saving..." : (isEditMode ? "Save Changes" : "Create User")} </Button>
            </div>
        </form>
        </Form>
    );
}