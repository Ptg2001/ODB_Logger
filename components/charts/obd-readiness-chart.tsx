"use client"

import { useState, useEffect } from 'react'
import {
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type OBDReadinessChartProps = {
  vehicleId: string
}

const MONITOR_COLORS = {
  COMPLETE: '#22c55e',  // Green
  INCOMPLETE: '#f97316', // Orange
  NOT_APPLICABLE: '#94a3b8', // Slate
  UNSUPPORTED: '#64748b'  // Slate dark
}

export function OBDReadinessChart({ vehicleId }: OBDReadinessChartProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [readinessData, setReadinessData] = useState<{
    vehicleInfo: {
      make: string
      model: string
      year: number
      vin: string
    } | null,
    moduleId: string,
    monitorStatus: Record<string, string>,
    readinessPercentage: number,
    completedMonitors: number,
    applicableMonitors: number
  }>({
    vehicleInfo: null,
    moduleId: '',
    monitorStatus: {},
    readinessPercentage: 0,
    completedMonitors: 0,
    applicableMonitors: 0
  })
  
  useEffect(() => {
    if (!vehicleId) {
      setError('No vehicle selected')
      setLoading(false)
      return
    }
    
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/analytics/obd-readiness?vehicleId=${vehicleId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('No readiness data found for this vehicle')
          }
          throw new Error('Failed to fetch readiness data')
        }
        
        const result = await response.json()
        setReadinessData({
          vehicleInfo: result.vehicleInfo || null,
          moduleId: result.moduleId || '',
          monitorStatus: result.monitorStatus || {},
          readinessPercentage: result.readinessPercentage || 0,
          completedMonitors: result.completedMonitors || 0,
          applicableMonitors: result.applicableMonitors || 0
        })
      } catch (err) {
        console.error('Error fetching OBD readiness data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load readiness data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [vehicleId])
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OBD Readiness Status</CardTitle>
          <CardDescription>Loading readiness data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OBD Readiness Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }
  
  const gaugeData = [
    {
      name: 'Readiness',
      value: readinessData.readinessPercentage,
      fill: getColorForPercentage(readinessData.readinessPercentage)
    }
  ]
  
  // Transform monitor status into a format for the PieChart
  const monitorPieData = Object.entries(readinessData.monitorStatus)
    .filter(([, status]) => status !== 'NOT_APPLICABLE' && status !== 'UNSUPPORTED')
    .map(([monitor, status]) => ({
      name: formatMonitorName(monitor),
      value: 1,
      status: status
    }))
  
  return (
    <Card className="overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
      <CardHeader>
        <CardTitle>OBD Readiness Status</CardTitle>
        <CardDescription>
          {readinessData.vehicleInfo ? 
            `${readinessData.vehicleInfo.year} ${readinessData.vehicleInfo.make} ${readinessData.vehicleInfo.model}` : 
            'Vehicle Readiness Status'
          }
          {readinessData.vehicleInfo?.vin && (
            <span className="block text-xs mt-1">VIN: {readinessData.vehicleInfo.vin}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-4">Overall Readiness</h3>
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="60%" 
                  outerRadius="100%" 
                  barSize={20} 
                  data={gaugeData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                    fill="#82ca9d"
                  />
                  <Tooltip formatter={(value) => [`${value}%`, 'Readiness']} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center">
              <p className="text-2xl font-bold">{readinessData.readinessPercentage}%</p>
              <p className="text-sm text-muted-foreground">
                {readinessData.completedMonitors} of {readinessData.applicableMonitors} monitors complete
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Monitor Status</h3>
            <div className="space-y-4">
              {Object.entries(readinessData.monitorStatus).map(([monitor, status]) => (
                <div key={monitor} className="flex items-center gap-2">
                  {status === 'COMPLETE' && <CheckCircle2 className="text-green-500" size={20} />}
                  {status === 'INCOMPLETE' && <XCircle className="text-orange-500" size={20} />}
                  {status === 'NOT_APPLICABLE' && <HelpCircle className="text-slate-400" size={20} />}
                  {status === 'UNSUPPORTED' && <HelpCircle className="text-slate-500" size={20} />}
                  <span className="flex-1">{formatMonitorName(monitor)}</span>
                  <Badge 
                    variant={getBadgeVariant(status)}
                    className="ml-auto"
                  >
                    {formatStatus(status)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatMonitorName(monitor: string): string {
  return monitor
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatStatus(status: string): string {
  switch (status) {
    case 'COMPLETE':
      return 'Complete'
    case 'INCOMPLETE':
      return 'Incomplete'
    case 'NOT_APPLICABLE':
      return 'Not Applicable'
    case 'UNSUPPORTED':
      return 'Unsupported'
    default:
      return status
  }
}

function getBadgeVariant(status: string): 'default' | 'secondary' | 'success' | 'destructive' | 'outline' {
  switch (status) {
    case 'COMPLETE':
      return 'success'
    case 'INCOMPLETE':
      return 'destructive'
    case 'NOT_APPLICABLE':
      return 'secondary'
    case 'UNSUPPORTED':
      return 'outline'
    default:
      return 'default'
  }
}

function getColorForPercentage(percentage: number): string {
  if (percentage >= 90) return '#22c55e' // Green
  if (percentage >= 70) return '#84cc16' // Lime
  if (percentage >= 50) return '#eab308' // Yellow
  if (percentage >= 30) return '#f97316' // Orange
  return '#ef4444' // Red
} 