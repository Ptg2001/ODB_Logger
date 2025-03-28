"use client"

import { useState, useEffect, memo, useCallback } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { MoonIcon, SunIcon, ActivityIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function Header() {
  const { user } = useAuth()
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user?.projects && user.projects.length > 0) {
      setSelectedProject(user.projects[0]?.id || null)
    }
  }, [user])

  // Get page title from pathname
  const getPageTitle = useCallback(() => {
    const path = pathname.split("/")[1]
    if (!path) return "Dashboard"
    return path
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }, [pathname])

  if (!user) return null

  return (
    <header className="sticky top-0 z-20 flex h-14 sm:h-16 items-center gap-1 sm:gap-4 border-b border-border/40 bg-background/95 backdrop-blur-md px-2 sm:px-4 md:px-6 shadow-sm">
      <SidebarTrigger className="text-foreground hover:text-primary transition-colors" />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-base sm:text-xl font-semibold truncate tracking-tight">{getPageTitle()}</h1>
          <div className="flex sm:flex items-center">
            <ActivityIcon size={14} className="text-primary animate-pulse" />
            <span className="ml-1 text-[10px] sm:text-xs text-muted-foreground">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-4">
          {user?.projects?.length > 0 && (
            <Select 
              value={selectedProject ? selectedProject.toString() : ""} 
              onValueChange={(value) => setSelectedProject(Number(value))}
            >
              <SelectTrigger className="w-[110px] sm:w-[180px] text-xs sm:text-sm border-border/50 bg-background/80 h-8 sm:h-9 rounded-md">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {user.projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {mounted && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 sm:h-9 sm:w-9 border-border/50 bg-background/80 relative overflow-hidden ml-1 rounded-full transition-colors hover:bg-muted/80 shadow-sm"
              aria-label="Toggle theme"
            >
              <div className="absolute inset-0 transition-colors dark:bg-zinc-800"></div>
              <SunIcon className="h-[1rem] w-[1rem] sm:h-[1.2rem] sm:w-[1.2rem] rotate-0 scale-100 transition-all absolute inset-0 m-auto dark:-rotate-90 dark:scale-0 text-amber-500" />
              <MoonIcon className="h-[1rem] w-[1rem] sm:h-[1.2rem] sm:w-[1.2rem] rotate-90 scale-0 transition-all absolute inset-0 m-auto dark:rotate-0 dark:scale-100 text-sky-500" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

