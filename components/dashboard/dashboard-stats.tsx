"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Car, FileText, AlertTriangle, BarChart3 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface StatsData {
  vehiclesCount: number
  projectsCount: number
  faultCodesCount: number
  activeVehiclesCount: number
  severityDistribution: Array<{ severity: string; count: number }>
  vehiclesByMake: Array<{ make: string; count: number }>
}

interface DashboardStatsProps {
  stats: StatsData | null
  loading: boolean
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={`dashboard-stats-skeleton-${i}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px] mb-2" />
              <Skeleton className="h-4 w-[140px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  // Calculate critical and high severity fault counts
  const criticalFaults = stats.severityDistribution?.find(d => d.severity === 'Critical')?.count || 0
  const highFaults = stats.severityDistribution?.find(d => d.severity === 'Warning')?.count || 0
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.vehiclesCount}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeVehiclesCount} active in the last 30 days
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.projectsCount}</div>
          <p className="text-xs text-muted-foreground">
            Across {stats.vehiclesByMake?.length || 0} different manufacturers
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fault Codes</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.faultCodesCount}</div>
          <p className="text-xs text-muted-foreground">
            {criticalFaults} critical, {highFaults} warning
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Make</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.vehiclesByMake?.[0]?.make || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.vehiclesByMake?.[0]?.count || 0} vehicles in database
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-primary text-primary-foreground">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Analytics</CardTitle>
          <BarChart3 className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">View Analytics</div>
          <Link 
            href="/dashboard/analytics" 
            className="text-xs underline hover:text-primary-foreground/90"
          >
            Advanced data visualization
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

