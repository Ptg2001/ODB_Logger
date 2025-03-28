"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { useRouteChangeStatus } from "@/components/route-change-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Car,
  Database,
  FileText,
  Gauge,
  Home,
  LogOut,
  Settings,
  Users,
  AlertTriangle,
  History,
  Loader2,
} from "lucide-react"

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { isRouteChanging } = useRouteChangeStatus()

  if (!user) return null

  const isActive = (path: string) => pathname === path

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["admin", "tester", "viewer"],
    },
    {
      title: "Live Data",
      href: "/live-data",
      icon: Gauge,
      roles: ["admin", "tester", "viewer"],
    },
    {
      title: "Historical Data",
      href: "/historical-data",
      icon: History,
      roles: ["admin", "tester", "viewer"],
    },
    {
      title: "Fault Codes",
      href: "/fault-codes",
      icon: AlertTriangle,
      roles: ["admin", "tester", "viewer"],
    },
    {
      title: "Reports",
      href: "/reports",
      icon: FileText,
      roles: ["admin", "tester", "viewer"],
    },
    {
      title: "Projects",
      href: "/projects",
      icon: Car,
      roles: ["admin", "tester", "viewer"],
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      roles: ["admin", "tester", "viewer"],
    },
  ]

  const adminNavItems = [
    {
      title: "User Management",
      href: "/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: "User Roles",
      href: "/user-roles",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: "Database",
      href: "/database",
      icon: Database,
      roles: ["admin"],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["admin", "tester"],
    },
  ]

  return (
    <Sidebar className="border-r border-border/30">
      <SidebarHeader className="flex items-center justify-center py-3 sm:py-4 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image 
            src="/assets/obd-logo.svg" 
            alt="OBD-II Logger" 
            width={32} 
            height={32}
            className="h-7 w-7 sm:h-8 sm:w-8"
          />
          <span className="text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">OBD-II Logger</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-1 sm:px-2 py-1 sm:py-2 bg-card/80 backdrop-blur-sm">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] sm:text-xs font-medium text-primary/70 px-2 py-1">Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems
                .filter((item) => item.roles.includes(user?.role))
                .map((item) => {
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild 
                        isActive={active} 
                        tooltip={item.title}
                        className={active 
                          ? "bg-primary/10 text-primary border-l-2 border-primary px-2 py-1 sm:py-1.5 rounded-md my-0.5" 
                          : "hover:bg-muted/50 px-2 py-1 sm:py-1.5 rounded-md my-0.5"
                        }
                      >
                        <Link 
                          href={item.href} 
                          className="flex items-center transition-colors duration-200 relative w-full"
                          prefetch={true}
                        >
                          {isRouteChanging && pathname !== item.href ? (
                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-2" />
                          ) : (
                            <item.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${active ? "text-primary" : ""} mr-2`} />
                          )}
                          <span className="text-xs sm:text-sm font-medium truncate">{item.title}</span>
                          {active && (
                            <span className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] sm:text-xs font-medium text-primary/70 px-2 py-1">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems
                  .filter((item) => item.roles.includes(user?.role))
                  .map((item) => {
                    const active = isActive(item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={active} 
                          tooltip={item.title}
                          className={active 
                            ? "bg-primary/10 text-primary border-l-2 border-primary px-2 py-1 sm:py-1.5 rounded-md my-0.5" 
                            : "hover:bg-muted/50 px-2 py-1 sm:py-1.5 rounded-md my-0.5"
                          }
                        >
                          <Link 
                            href={item.href} 
                            className="flex items-center transition-colors duration-200 relative w-full"
                            prefetch={true}
                          >
                            {isRouteChanging && pathname !== item.href ? (
                              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-2" />
                            ) : (
                              <item.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${active ? "text-primary" : ""} mr-2`} />
                            )}
                            <span className="text-xs sm:text-sm font-medium truncate">{item.title}</span>
                            {active && (
                              <span className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40 p-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => logout()}
          className="w-full justify-start gap-2 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-md px-2"
        >
          <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

