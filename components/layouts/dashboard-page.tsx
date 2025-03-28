import { ReactNode } from "react"

interface DashboardPageProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function DashboardPage({ children, title, subtitle }: DashboardPageProps) {
  return (
    <div className="dashboard-page w-full flex flex-col min-h-screen">
      <div className="dashboard-header px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 border-b border-border/30 bg-background/95 backdrop-blur-sm shadow-sm">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="dashboard-content flex-1 w-full p-3 sm:p-4 md:p-6">
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
} 