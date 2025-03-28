"use client";

import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { RouteChangeProvider } from "@/components/route-change-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <RouteChangeProvider>
          <SidebarProvider>
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
          </SidebarProvider>
          <Toaster />
        </RouteChangeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 