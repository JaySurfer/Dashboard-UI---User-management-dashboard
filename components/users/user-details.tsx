// components/users/user-details.tsx
import { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MapPin, Briefcase, CalendarDays, Clock } from "lucide-react";

// Helper function to get initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

interface UserDetailsProps {
    user: User;
}

export default function UserDetails({ user }: UserDetailsProps) {
    const formatDate = (date?: Date) => {
        return date ? new Date(date).toLocaleDateString() : 'N/A';
    }
     const formatDateTime = (date?: Date) => {
        return date ? new Date(date).toLocaleString() : 'N/A';
    }

    return (
        <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Access</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
             <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                     <Avatar className="h-16 w-16">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-xl">{user.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                     <Separator />
                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                    </div>
                     {user.department && (
                         <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{user.department}</span>
                        </div>
                    )}
                     {user.location && (
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{user.location}</span>
                        </div>
                     )}
                     <div className="flex items-center gap-2 text-sm">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span>Joined: {formatDate(user.dateCreated)}</span>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
             <Card>
                 <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                     <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Last Login: {formatDateTime(user.lastLogin)}</span>
                     </div>
                     <Separator />
                     {/* Placeholder for Activity Log Items */}
                     <p className="text-sm text-muted-foreground">
                         (Activity log entries would appear here - e.g., profile updated, password changed, project assigned)
                     </p>
                     {/* Example Log Item Structure:
                     <div className="text-sm">
                         <span className="font-medium">Profile Updated</span> - <span className="text-muted-foreground">{new Date().toLocaleString()}</span>
                     </div>
                      */}
                 </CardContent>
             </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Role & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Role</span>
                        <Badge variant={user.role === 'Admin' ? 'default' : user.role === 'Manager' ? 'outline' : 'secondary'}>
                            {user.role}
                        </Badge>
                    </div>
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <div className="flex items-center gap-2">
                             <span className={`h-2 w-2 rounded-full ${
                                user.status === 'Active' ? 'bg-green-500' :
                                user.status === 'Inactive' ? 'bg-gray-500' :
                                'bg-yellow-500'
                             }`}></span>
                            <span>{user.status}</span>
                        </div>
                    </div>
                     <Separator />
                     {/* Placeholder for Permissions */}
                     <p className="text-sm text-muted-foreground">
                         (Detailed permissions associated with the '{user.role}' role could be listed here)
                     </p>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
    );
}