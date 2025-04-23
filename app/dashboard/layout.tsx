// app/(dashboard)/layout.tsx
import React from 'react';
import Sidebar from '@/components/layout/sidebar';
// Optional: import Header from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Optional Header */}
        {/* <Header /> */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 mt-16 md:mt-0" >
            {children}
        </main>
      </div>
    </div>
  );
}