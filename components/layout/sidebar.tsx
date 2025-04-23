// components/layout/sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  UserPlus,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelRightClose,
  Menu, // For mobile trigger
} from 'lucide-react';
import React, { useState } from 'react';

const navItems = [
  // Assuming your routes are prefixed with /dashboard/
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/users', label: 'All Users', icon: Users },
  { href: '/dashboard/roles', label: 'Roles & Permissions', icon: ShieldCheck },
  // Link to the add user page if you created it, otherwise keep the old path or remove
  // { href: '/dashboard/users/add', label: 'Add New User', icon: UserPlus },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

// Determine if Add User should be a direct link or trigger (adjust based on your setup)
const showAddUserLink = true; // Set to true if you have the /dashboard/users/add page
if (showAddUserLink) {
    // Find the index of 'Roles & Permissions' to insert 'Add New User' after it
    const rolesIndex = navItems.findIndex(item => item.href === '/dashboard/roles');
    if (rolesIndex !== -1) {
        navItems.splice(rolesIndex + 1, 0, { href: '/dashboard/users/add', label: 'Add New User', icon: UserPlus });
    } else {
        // Fallback: Add to end if roles not found (shouldn't happen with current items)
        navItems.push({ href: '/dashboard/users/add', label: 'Add New User', icon: UserPlus });
    }
}

// Style constants for reuse
const baseTextColor = "text-white"; // Base text color for icons and inactive links
const hoverTextColor = "text-white";
const hoverBgColor = "hover:bg-white/50"; // Subtle white overlay on hover
const activeBgColor = "bg-white/10"; // Background for the active item
const activeTextColor = "text-white";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Define NavContent once, used by both desktop and mobile
  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <nav className={`flex h-full flex-col gap-2 px-4 py-4 ${isCollapsed && !isMobile ? 'items-center px-2' : ''}`}>
      {/* Logo/Title Section */}
      <div className={`mb-6 ${isCollapsed && !isMobile ? 'self-center' : 'self-start'}`}>
        <Link href="/dashboard" className={`flex items-center gap-2.5 font-bold text-lg ${hoverTextColor}`}>
          <Users className={`h-6 w-6 ${hoverTextColor}`} />
          {(!isCollapsed || isMobile) && <span>User Mgmt</span>}
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1"> {/* Allows logout to stick to bottom */}
        {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
                <Button
                key={item.href}
                variant="ghost" // Use ghost and control styling with cn
                className={cn(
                    "w-full justify-start h-10 mb-1", // Added margin-bottom
                    baseTextColor,
                    hoverBgColor,
                    hoverTextColor,
                    isActive && `${activeBgColor} ${activeTextColor}`, // Active styles
                    isCollapsed && !isMobile ? 'justify-center px-2' : ''
                )}
                asChild
                >
                <Link href={item.href}>
                    <item.icon className={cn(
                        "h-5 w-5",
                        isActive ? activeTextColor : baseTextColor, // Icon color matches text
                        (!isCollapsed || isMobile) ? 'mr-3' : '' // Margin only when expanded or mobile
                    )} />
                    {(!isCollapsed || isMobile) && item.label}
                </Link>
                </Button>
            );
        })}
      </div>

      {/* Logout Button */}
      <div className="mt-auto"> {/* Pushes logout down */}
        <Button
            variant="ghost" // Use ghost and control styling with cn
            className={cn(
                "w-full justify-start h-10",
                 baseTextColor,
                 hoverBgColor,
                 hoverTextColor,
                isCollapsed && !isMobile ? 'justify-center px-2' : ''
            )}
          // Add onClick handler for actual logout
          onClick={() => console.log("Logout clicked")}
        >
          <LogOut className={cn(
              "h-5 w-5",
              baseTextColor, // Use base color
              (!isCollapsed || isMobile) ? 'mr-3' : ''
            )} />
          {(!isCollapsed || isMobile) && "Logout"}
        </Button>
      </div>
    </nav>
  );

  return (
    <>
      {/* --- Desktop Sidebar --- */}
      <div className={cn(
        "hidden md:flex flex-col border-r border-gray-700/50 transition-all duration-300 ease-in-out", // Adjusted border color
        "bg-[rgb(21,22,53)]", // Applied new background color
        isCollapsed ? "w-20" : "w-64"
      )}>
         {/* Header section within Desktop Sidebar */}
         <div className={cn(
             "flex h-16 items-center border-b border-gray-700/50 px-4", // Adjusted border color
             isCollapsed ? "justify-center" : "justify-between" // Center icon when collapsed
             )}>
            {!isCollapsed && <span className={`font-semibold ${activeTextColor}`}>Menu</span>}
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className={`${baseTextColor} ${hoverTextColor} ${hoverBgColor}`}>
              {isCollapsed ? <PanelRightClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </Button>
          </div>
          {/* Render NavContent for Desktop */}
          <NavContent />
      </div>

      {/* --- Mobile Sidebar (Sheet) --- */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        {/* Sheet Component from Shadcn */}
        <Sheet>
          <SheetTrigger asChild>
            {/* Button to trigger the mobile menu */}
            <Button variant="outline" size="icon" className="border-gray-300 bg-white/80 backdrop-blur-sm">
              <Menu className="h-6 w-6 text-gray-800" />
            </Button>
          </SheetTrigger>
          {/* Content of the Sheet (Mobile Menu) */}
          <SheetContent
            side="left"
            className={cn(
                "w-64 p-0 border-r-0",
                "bg-[rgb(21,22,53)]" // <-- Using the same dark blue
                )}
          >
             <NavContent isMobile={true} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}