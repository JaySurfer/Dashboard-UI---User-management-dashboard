// lib/data.ts (Replace with actual API calls)
import { User, UserRole, UserStatus , Role} from './types';

// Simulate a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockUsers: User[] = [
  { id: 'usr_1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Admin', status: 'Active', dateCreated: new Date('2023-01-15'), department: 'IT', location: 'New York',  mockPassword: 'password123' },
  { id: 'usr_2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Manager', status: 'Active', dateCreated: new Date('2023-02-20'), department: 'Engineering', lastLogin: new Date('2024-07-20'),  mockPassword: 'password123' },
  { id: 'usr_3', name: 'Charlie Chaplin', email: 'charlie@example.com', role: 'Staff', status: 'Inactive', dateCreated: new Date('2023-03-10'), department: 'Marketing',  mockPassword: 'password123' },
  { id: 'usr_4', name: 'Diana Prince', email: 'diana@example.com', role: 'Staff', status: 'Pending', dateCreated: new Date('2024-07-01'), department: 'Sales', location: 'London',  mockPassword: 'password123' },
  // Add more users...
  { id: 'usr_5', name: 'Ethan Hunt', email: 'ethan@example.com', role: 'Manager', status: 'Active', dateCreated: new Date('2023-05-05'), department: 'Operations',  mockPassword: 'password123' },
  { id: 'usr_6', name: 'Fiona Shrek', email: 'fiona@example.com', role: 'Admin', status: 'Active', dateCreated: new Date('2022-11-11'), department: 'HR',  mockPassword: 'password123' },
  { id: 'usr_7', name: 'George Costanza', email: 'george@example.com', role: 'Staff', status: 'Active', dateCreated: new Date('2024-01-30'), department: 'Sales',  mockPassword: 'password123' },
  { id: 'usr_8', name: 'Hermione Granger', email: 'hermione@example.com', role: 'Staff', status: 'Inactive', dateCreated: new Date('2023-09-01'), department: 'Research',  mockPassword: 'password123' },
  { id: 'usr_9', name: 'Indiana Jones', email: 'indy@example.com', role: 'Manager', status: 'Active', dateCreated: new Date('2023-06-15'), department: 'Archaeology',  mockPassword: 'password123' },
  { id: 'usr_10', name: 'Jack Sparrow', email: 'jack@example.com', role: 'Staff', status: 'Pending', dateCreated: new Date('2024-07-15'), department: 'Maritime',  mockPassword: 'password123' },
];

export async function fetchUsers(options: { page?: number, limit?: number, query?: string, filters?: Record<string, string> } = {}): Promise<{ users: User[], totalCount: number }> {
    await delay(500); // Simulate network latency
    const { page = 1, limit = 5, query = '', filters = {} } = options;

    let filteredUsers = mockUsers;

    // Apply search query
    if (query) {
        const lowerQuery = query.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
            user.name.toLowerCase().includes(lowerQuery) ||
            user.email.toLowerCase().includes(lowerQuery)
        );
    }

    // Apply filters (role, status, department)
    Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') { // Ignore empty or 'all' filters
             filteredUsers = filteredUsers.filter(user =>
                String(user[key as keyof User] ?? '').toLowerCase() === value.toLowerCase()
            );
        }
    });

    const totalCount = filteredUsers.length;
    const startIndex = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);

    return { users: paginatedUsers, totalCount };
}

export async function fetchUserById(id: string): Promise<User | undefined> {
  await delay(300);
  return mockUsers.find(user => user.id === id);
}

export async function createUser(userData: Omit<User, 'id' | 'dateCreated'> & { password?: string }): Promise<User> {
  await delay(400);
  const newUser: User = {
    ...userData,
    id: `usr_${Date.now()}`, // Simple unique ID generation
    dateCreated: new Date(),
    mockPassword: userData.password || 'password123',
  };
  mockUsers.unshift(newUser); // Add to the beginning
  return newUser;
}

// Define the expected input type for clarity
type UserUpdateData = Partial<Omit<User, 'id' | 'dateCreated' | 'mockPassword'>> & { password?: string };

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'dateCreated'>>): Promise<User | undefined> {
    await delay(400);
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;

     // Separate password from other updates
     const { mockPassword, ...otherUpdates } = updates;

     // Prepare the final updates, including the mock password if provided
     const finalUpdates: Partial<User> = { ...otherUpdates };
     if (mockPassword) {
         finalUpdates.mockPassword = mockPassword; // Store the new password
     }

    const updatedUser = { ...mockUsers[userIndex], ...updates };
    mockUsers[userIndex] = updatedUser;
    return updatedUser;
}

export async function deleteUser(id: string): Promise<boolean> {
    await delay(600);
    const initialLength = mockUsers.length;
    mockUsers = mockUsers.filter(user => user.id !== id);
    return mockUsers.length < initialLength;
}

// --- Mock Roles Data (Example) ---
let mockRoles: Role[] = [
    { id: 'role_admin', name: 'Admin', description: 'Full access to all features', permissions: ['users:read', 'users:create', 'users:edit', 'users:delete', 'roles:manage', 'settings:manage'] },
    { id: 'role_manager', name: 'Manager', description: 'Manage users within their department', permissions: ['users:read', 'users:create', 'users:edit', 'dashboard:view'] },
    { id: 'role_staff', name: 'Staff', description: 'Standard user access', permissions: ['users:read', 'dashboard:view'] },
    { id: 'role_viewer', name: 'Viewer', description: 'Read-only access', permissions: ['users:read'] },
];

export async function fetchRoles(): Promise<Role[]> {
    await delay(200);
    return mockRoles;
}

// Add functions for createRole, updateRole, deleteRole if needed

// --- NEW: Create Role Function ---
export async function createRole(roleData: Omit<Role, 'id'>): Promise<Role> {
    console.log("Creating role (mock):", roleData);
    await delay(500); // Simulate network latency

    // Basic validation example (real app would have more robust backend validation)
    if (!roleData.name || roleData.name.length < 2) {
        throw new Error("Role name is too short (mock validation).");
    }
    if (mockRoles.some(r => r.name.toLowerCase() === roleData.name.toLowerCase())) {
        throw new Error(`Role with name "${roleData.name}" already exists (mock validation).`);
    }
    if (!roleData.permissions || roleData.permissions.length === 0) {
        throw new Error("Role must have at least one permission (mock validation).");
    }

    const newRole: Role = {
        ...roleData,
        id: `role_${Date.now()}_${Math.random().toString(36).substring(7)}`, // More unique mock ID
    };
    mockRoles.push(newRole); // Add to the array
    console.log("Role created:", newRole);
    return { ...newRole }; // Return a copy
}

// --- Mock Dashboard Stats ---
export async function fetchDashboardStats() {
    await delay(100);
    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(u => u.status === 'Active').length;
    const inactiveUsers = totalUsers - activeUsers;
    const usersByRole = mockUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {} as Record<UserRole, number>);
    const recentSignups = mockUsers.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime()).slice(0, 5);

    return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        usersByRole,
        recentSignups: recentSignups.length, // Just count for simplicity here
    };
}

// --- NEW: Data structure for Chart ---
export interface UserGrowthDataPoint {
    month: string; // e.g., "Jan '23", "Feb '23"
    totalUsers: number; // Cumulative total users at the end of that month
}

// --- NEW: Function to generate mock growth data ---
export async function fetchUserGrowthData(): Promise<UserGrowthDataPoint[]> {
    console.log("Fetching user growth data...");
    await delay(600); // Simulate network latency

    if (!mockUsers || mockUsers.length === 0) {
        return [];
    }

    // Sort users by creation date to process chronologically
    const sortedUsers = [...mockUsers].sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime());

    const usersByMonth: Record<string, number> = {}; // Key: "YYYY-MM", Value: Count of *new* users in that month

    // Count new users per month
    sortedUsers.forEach(user => {
        const year = user.dateCreated.getFullYear();
        const month = String(user.dateCreated.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, pad to 2 digits
        const monthKey = `${year}-${month}`;
        usersByMonth[monthKey] = (usersByMonth[monthKey] || 0) + 1;
    });

    // Get sorted list of months where users were added
    const sortedMonths = Object.keys(usersByMonth).sort();

    let runningTotal = 0;
    const formattedGrowthData: UserGrowthDataPoint[] = [];
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' });

    // Calculate cumulative total for each month
    sortedMonths.forEach(monthKey => {
        runningTotal += usersByMonth[monthKey];
        const [year, month] = monthKey.split('-');
        const dateOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1); // Date object for formatting

        formattedGrowthData.push({
            month: monthFormatter.format(dateOfMonth), // Format as "Mon 'YY"
            totalUsers: runningTotal
        });
    });

    console.log("Generated growth data:", formattedGrowthData);
    return formattedGrowthData;
}

// --- Mock Auth/Current User Data ---

// In a real app, you'd get the current user ID from the session/token
const MOCK_CURRENT_USER_ID = 'usr_1'; // Let's assume Alice is logged in

export async function fetchCurrentUser(): Promise<User | null> {
    console.log("Fetching current user data...");
    await delay(400); // Simulate network latency
    const user = mockUsers.find(u => u.id === MOCK_CURRENT_USER_ID);
    if (!user) {
        console.error("Mock current user not found!");
        return null;
    }
    // Return a copy to avoid direct mutation issues if needed elsewhere
    return { ...user };
}

export async function updateCurrentUserProfile(updates: Partial<Pick<User, 'name' | 'location' | 'department' /* add other updatable fields */>>): Promise<User | null> {
    console.log("Updating current user profile:", updates);
    await delay(600);
    const userIndex = mockUsers.findIndex(u => u.id === MOCK_CURRENT_USER_ID);
    if (userIndex === -1) return null;

    // Only update allowed fields
    const allowedUpdates: Partial<User> = {};
    if (updates.name !== undefined) allowedUpdates.name = updates.name;
    if (updates.location !== undefined) allowedUpdates.location = updates.location;
    if (updates.department !== undefined) allowedUpdates.department = updates.department;
    // Add more fields here

    mockUsers[userIndex] = { ...mockUsers[userIndex], ...allowedUpdates };
    console.log("Updated user:", mockUsers[userIndex]);
    return { ...mockUsers[userIndex] };
}

// Placeholder for password change - real implementation needs secure backend handling
export async function changeCurrentUserPassword(data: { currentPassword: string, newPassword: string }): Promise<{ success: boolean; message: string }> {
    console.log("Attempting to change password (mock - always succeeds if current matches 'password')");
    await delay(800);

    // !! SECURITY WARNING !!
    // This is a MOCK implementation. NEVER handle passwords like this client-side.
    // Real password change requires secure backend validation.
    // if (data.currentPassword !== 'password123') { // Simulate checking current password
    //      return { success: false, message: "Incorrect current password (mock)." };
    // }
    // if (data.newPassword.length < 8) {
    //     return { success: false, message: "New password too short (mock)." };
    // }

    // console.log("Mock password change successful for user:", MOCK_CURRENT_USER_ID);
    // // In a real scenario, the backend would hash and store the new password.
    // return { success: true, message: "Password updated successfully (mock)." };
       // Find the current user
       const userIndex = mockUsers.findIndex(u => u.id === MOCK_CURRENT_USER_ID);
       if (userIndex === -1) {
            return { success: false, message: "Current user not found (mock)." };
       }
       const user = mockUsers[userIndex];
   
       // Compare with the stored mockPassword
       if (user.mockPassword !== data.currentPassword) {
            console.log(`Password mismatch: provided='${data.currentPassword}', stored='${user.mockPassword}'`); // Debug log
            return { success: false, message: "Incorrect current password (mock)." };
       }
   
       // Basic validation for new password
       if (data.newPassword.length < 8) {
           return { success: false, message: "New password too short (mock)." };
       }
   
       // Update the mockPassword in the array
       mockUsers[userIndex].mockPassword = data.newPassword;
       console.log("Mock password change successful, updated mockPassword for user:", MOCK_CURRENT_USER_ID);
       return { success: true, message: "Password updated successfully (mock)." };
}