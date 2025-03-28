"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CarFront, FileText, Clock, FileBarChart } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'

interface RecentActivity {
  type: string
  vehicle: string
  timestamp: string
  code?: string
  report?: string
}

interface RecentTestsProps {
  recentActivity: RecentActivity[]
  loading: boolean
}

export function RecentTests({ recentActivity, loading }: RecentTestsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Activity</CardTitle>
          <CardDescription>Latest diagnostic tests and fault codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm text-center mb-4 animate-pulse">
            Loading recent activities...
          </div>
          <div className="space-y-8">
            {[...Array(5)].map((_, i) => (
              <div className="flex items-center" key={`skeleton-activity-${i}`}>
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-4 space-y-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[160px]" />
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!recentActivity || recentActivity.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Activity</CardTitle>
          <CardDescription>No recent diagnostic tests or fault codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <FileBarChart className="h-12 w-12 opacity-20 mb-2" />
            <p>No recent activity to display</p>
            <p className="text-sm">Run a diagnostic scan to see data here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Activity</CardTitle>
        <CardDescription>Latest diagnostic tests and fault codes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {recentActivity.map((item, i) => (
            <div className="flex items-center" key={`activity-${i}`}>
              <div className="mr-4 rounded-full p-2 bg-muted">
                {item.type === 'fault_code' ? (
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                ) : item.type === 'report' ? (
                  <FileBarChart className="h-6 w-6 text-blue-500" />
                ) : (
                  <CarFront className="h-6 w-6 text-green-500" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {item.vehicle}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.type === 'fault_code' ? (
                    <>Fault code: <span className="font-mono">{item.code}</span></>
                  ) : item.type === 'report' ? (
                    <>Report: {item.report}</>
                  ) : (
                    <>Diagnostic test</>
                  )}
                </p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

