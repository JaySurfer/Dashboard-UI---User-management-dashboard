// lib/types.ts
export type UserRole = "Admin" | "Staff" | "Manager" | "Viewer";
export type UserStatus = "Active" | "Inactive" | "Pending";

export interface User {
  id: string;
  name: string;
  email: string; // Or username
  avatar?: string; // URL to avatar image
  role: UserRole;
  status: UserStatus;
  department?: string; // Optional
  location?: string;   // Optional
  dateCreated: Date;
  lastLogin?: Date;   // Optional
  mockPassword?: string;
}

// Add other types as needed (e.g., Role, Permission, AuditLog)
export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: string[]; // Array of permission keys/names
}