// lib/schema.ts
import * as z from "zod";
import { UserRole, UserStatus } from "./types"; // Adjust path as needed

export const ALL_PERMISSIONS = [ // <-- Make sure 'export' is here
  'dashboard:view',
  'users:read',
  'users:create',
  'users:edit',
  'users:delete',
  'roles:manage',
  'settings:manage',
  'auditlog:view',
] as const;

export const userSchema = z.object({
  id: z.string().optional(), // Optional because it's not present on create
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.string().min(1, { message: "Role is required." }), // Changed from z.enum to z.string()
  status: z.enum(["Active", "Inactive", "Pending"], { // Use enum for defined statuses
    required_error: "Status is required.",
  }),
  department: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  // Password/confirmPassword handled separately in the form component schema
  // avatar: z.string().url().optional(), // If storing avatar URL
});

export const roleSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, { message: "Role name must be at least 2 characters." }).max(50),
    description: z.string().max(200).optional(),
    permissions: z.array(z.string()).min(1, { message: "At least one permission is required."}), // Assuming permissions are strings
})

// ... existing userSchema ...


export const profileSettingsSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  email: z.string().email().optional(), // Often email is read-only here or needs verification to change
  department: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  // Add other editable profile fields if needed
});

export const passwordSettingsSchema = z.object({
    currentPassword: z.string().min(1, { message: "Current password is required." }), // Basic check, real validation on backend
    newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"], // Attach error to confirmPassword field
});