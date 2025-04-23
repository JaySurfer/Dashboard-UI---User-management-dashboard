// components/dashboard/stat-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    description?: string;
    color?: string; // Optional text color class (e.g., "text-green-600")
}

export default function StatCard({ title, value, icon: Icon, description, color }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={cn("h-5 w-5 text-muted-foreground", color)} />
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold", color)}>{value}</div>
                {description && (
                     <p className="text-xs text-muted-foreground pt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}