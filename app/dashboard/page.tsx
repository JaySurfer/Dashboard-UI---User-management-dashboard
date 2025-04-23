// app/(dashboard)/page.tsx (or app/dashboard/page.tsx)
"use client";

import React, { useState, useEffect } from 'react';
// Fetch Functions & Types
import { fetchDashboardStats, fetchUserGrowthData, UserGrowthDataPoint } from '@/lib/data'; // Import new items
// Components
import StatCard from '@/components/dashboard/stat-card';
import UserGrowthChart from '@/components/dashboard/user-growth-chart'; // Import the chart component
import { Skeleton } from '@/components/ui/skeleton';
// Icons
import { Users, UserCheck, UserX, ShieldCheck, UserPlus } from 'lucide-react';

// Define a type for the stats
interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Record<string, number>;
    recentSignups: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [chartData, setChartData] = useState<UserGrowthDataPoint[]>([]); // State for chart data
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isLoadingChart, setIsLoadingChart] = useState(true); // Separate loading state for chart
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadDashboardData() {
            setIsLoadingStats(true);
            setIsLoadingChart(true);
            setError(null);
            try {
                // Fetch stats and chart data concurrently
                const [statsResult, chartResult] = await Promise.all([
                    fetchDashboardStats(),
                    fetchUserGrowthData() // Fetch chart data
                ]);
                setStats(statsResult);
                setChartData(chartResult);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Failed to load dashboard data. Please try again.");
                // toast.error("Failed to load dashboard data."); // Optional
            } finally {
                setIsLoadingStats(false);
                setIsLoadingChart(false);
            }
        }
        loadDashboardData();
    }, []); // Run only on mount

    const StatCardSkeleton = () => (
        <Skeleton className="h-[120px] w-full rounded-lg" />
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Dashboard Overview</h1>

            {error && <p className="text-red-500">{error}</p>}

             {/* Stats Cards Grid */}
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoadingStats || !stats ? ( // Use isLoadingStats
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        {/* Render StatCard components with stats data */}
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers.toString()}
                            icon={Users}
                            description="All registered users"
                        />
                        <StatCard
                            title="Active Users"
                            value={stats.activeUsers.toString()}
                            icon={UserCheck}
                            description={`${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total`}
                            color="text-green-600"
                        />
                        <StatCard
                            title="Inactive/Pending"
                            value={(stats.inactiveUsers + (stats.totalUsers - stats.activeUsers - stats.inactiveUsers)).toString()} // Calculate pending too maybe? Adjust logic as needed. Let's assume inactiveUsers from API is correct for non-active.
                            // value={(stats.totalUsers - stats.activeUsers).toString()} // Simpler: Total - Active
                            icon={UserX}
                            description="Users not currently active"
                            color="text-yellow-600"
                        />
                         <StatCard
                            title="Recent Signups"
                            value={stats.recentSignups.toString()}
                            icon={UserPlus}
                            description="New users this period" // Adjust description if needed
                        />
                    </>
                )}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                 {/* Users by Role Card */}
                 <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
                    {isLoadingStats || !stats ? ( // Use isLoadingStats here
                         <Skeleton className="h-[150px] w-full" />
                    ) : (
                        <div className="space-y-2">
                            {Object.entries(stats.usersByRole).length > 0 ? (
                                Object.entries(stats.usersByRole).map(([role, count]) => (
                                    <div key={role} className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-muted-foreground" /> {role}
                                        </span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No role data available.</p>
                            )}
                        </div>
                    )}
                 </div>

                {/* --- User Growth Chart Card --- */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                    <div className="h-[200px]"> {/* Give the container a height */}
                        {isLoadingChart ? ( // Use separate loading state for chart
                             <Skeleton className="h-full w-full" />
                        ) : (
                            // Render the actual chart component
                            <UserGrowthChart data={chartData} />
                        )}
                    </div>
                 </div>
            </div>
        </div>
    );
}