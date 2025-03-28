"use client"

import { useState, useEffect } from "react"
import { DashboardPage } from "@/components/layouts/dashboard-page"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentTests } from "@/components/dashboard/recent-tests"
import { InfoIcon, AlertTriangle, Gauge, FileText, Car, BarChart3 } from "lucide-react"
import { FaultCodeSummary } from "@/components/dashboard/fault-code-summary"
import { ProjectOverview } from "@/components/dashboard/project-overview"
import Link from "next/link"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [tabLoading, setTabLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Set a minimum load time of 800ms for better loading animation visibility
        const startTime = Date.now()
        const res = await fetch('/api/dashboard/stats')
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status}`)
        }
        
        const data = await res.json()
        
        // Ensure loading animation is visible for at least 800ms
        const elapsed = Date.now() - startTime
        if (elapsed < 800) {
          await new Promise(resolve => setTimeout(resolve, 800 - elapsed))
        }
        
        setStats(data)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Using sample data instead.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Handle tab changes with loading animation
  const handleTabChange = (value: string) => {
    setTabLoading(true)
    setActiveTab(value)
    
    // Add a delay when switching tabs for better loading animation visibility
    setTimeout(() => {
      setTabLoading(false)
    }, 600)
  }

  return (
    <DashboardPage title="Dashboard" subtitle="Welcome to your OBD-II logger dashboard">
      <div className="px-4 sm:px-6 md:px-8 space-y-6 w-full">
        {error && (
          <Alert variant="warning" className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Alert className="md:flex-1">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Welcome to the OBD-II Data Logger Dashboard</AlertTitle>
            <AlertDescription>
              Your connected vehicle data will appear here
            </AlertDescription>
          </Alert>
          
          <Button asChild variant="default" className="gap-2">
            <Link href="/dashboard/analytics">
              <BarChart3 className="h-4 w-4" />
              Advanced Analytics
            </Link>
          </Button>
        </div>

        <Tabs 
          defaultValue="overview" 
          className="space-y-4 w-full"
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <DashboardStats stats={stats} loading={loading || (tabLoading && activeTab === "overview")} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Live Data Status</CardTitle>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Connected</div>
                  <p className="text-xs text-muted-foreground">Last updated: 2 minutes ago</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Fault Codes</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">2 critical, 1 warning</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28</div>
                  <p className="text-xs text-muted-foreground">This month: 12 PDF, 8 Excel, 8 CSV</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Fault Code Analysis</CardTitle>
                  <CardDescription>Distribution of fault codes across vehicles</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <FaultCodeSummary />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Vehicle Distribution</CardTitle>
                  <CardDescription>Vehicles by manufacturer</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectOverview />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Toyota Corolla</CardTitle>
                  <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-green-500 text-green-50">Active</div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Last scan: 2 hours ago</div>
                  <div className="mt-2 text-xs text-muted-foreground">12 fault codes recorded</div>
                  <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                    View Details
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Honda Civic</CardTitle>
                  <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-green-500 text-green-50">Active</div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Last scan: 1 day ago</div>
                  <div className="mt-2 text-xs text-muted-foreground">3 fault codes recorded</div>
                  <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                    View Details
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ford Focus</CardTitle>
                  <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-yellow-500 text-yellow-50">Inactive</div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Last scan: 2 weeks ago</div>
                  <div className="mt-2 text-xs text-muted-foreground">7 fault codes recorded</div>
                  <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                    View Details
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">BMW 3 Series</CardTitle>
                  <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-green-500 text-green-50">Active</div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Last scan: 5 hours ago</div>
                  <div className="mt-2 text-xs text-muted-foreground">2 fault codes recorded</div>
                  <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-4">
            <RecentTests recentActivity={stats?.recentActivity || []} loading={loading || (tabLoading && activeTab === "recent")} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPage>
  )
}

