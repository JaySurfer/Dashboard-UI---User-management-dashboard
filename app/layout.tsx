// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // Assuming you setup ThemeProvider
import { Toaster } from "@/components/ui/sonner"; // Use Sonner's Toaster

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "User Management Dashboard",
  description: "Manage users effectively",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors /> {/* Sonner Toaster */}
        </ThemeProvider>
      </body>
    </html>
  );
}