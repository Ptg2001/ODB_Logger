import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { SidebarInset } from "@/components/ui/sidebar"
import { AuthProvider } from "@/components/auth-provider"
import { RouteChangeProvider } from "@/components/route-change-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <RouteChangeProvider>
        <div 
          className="flex min-h-screen flex-col md:flex-row"
          style={{
            backgroundImage: "url('/assets/dashboard-bg.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
          }}
        >
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col bg-transparent w-full">
            <Header />
            <main className="flex-1 overflow-auto h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] p-0 animate-fade-in">
              <div className="h-full w-full cv-auto overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </RouteChangeProvider>
    </AuthProvider>
  )
}

