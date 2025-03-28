"use client"

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

type FaultCodeAnalysisProps = {
  projectId?: string
}

const COLORS = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))', 
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7, 200 100% 60%))',
  'hsl(var(--chart-8, 130 60% 50%))',
  'hsl(var(--chart-9, 50 100% 60%))',
  'hsl(var(--chart-10, 320 80% 60%))'
]

const SEVERITY_COLORS = {
  'Critical': 'hsl(var(--chart-1))',
  'High': 'hsl(var(--chart-2))',
  'Medium': 'hsl(var(--chart-3))',
  'Low': 'hsl(var(--chart-4))',
  'Unknown': 'hsl(var(--chart-5))'
}

export function FaultCodeAnalysis({ projectId }: FaultCodeAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('severity')
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')
  const [data, setData] = useState<{
    bySeverity: any[],
    topFaultCodes: any[],
    byVehicleMake: any[],
    byStatus: any[]
  }>({
    bySeverity: [],
    topFaultCodes: [],
    byVehicleMake: [],
    byStatus: []
  })
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        const url = projectId && projectId !== 'all'
          ? `/api/analytics/fault-codes?projectId=${projectId}` 
          : '/api/analytics/fault-codes'
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch fault code data')
        }
        
        const result = await response.json()
        console.log('Fault code data received:', result)
        setData({
          bySeverity: result.bySeverity || [],
          topFaultCodes: result.topFaultCodes || [],
          byVehicleMake: result.byVehicleMake || [],
          byStatus: result.byStatus || []
        })
      } catch (err) {
        console.error('Error fetching fault code data:', err)
        setError('Failed to load fault code data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [projectId])
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fault Code Analysis</CardTitle>
          <CardDescription>Loading data...</CardDescription>
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
          <CardTitle>Fault Code Analysis</CardTitle>
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
  
  const renderChart = (chartData: any[] | undefined, dataKey: string, nameKey: string) => {
    console.log(`Rendering chart for ${nameKey}, data:`, chartData)
    if (!chartData || chartData.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No data available for this category</AlertDescription>
        </Alert>
      )
    }
    
    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={150}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {chartData.map((entry, index) => {
                let color
                if (activeTab === 'severity' && SEVERITY_COLORS[entry.severity as keyof typeof SEVERITY_COLORS]) {
                  color = SEVERITY_COLORS[entry.severity as keyof typeof SEVERITY_COLORS]
                } else {
                  color = COLORS[index % COLORS.length]
                }
                return <Cell key={`pie-cell-${activeTab}-${index}-${entry[nameKey]}`} fill={color} />
              })}
            </Pie>
            <Tooltip formatter={(value: any) => [`${value} codes`, '']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )
    }
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={nameKey} 
            angle={-45} 
            textAnchor="end" 
            height={80}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip formatter={(value: any) => [`${value} codes`, '']} />
          <Legend />
          <Bar dataKey={dataKey} fill="hsl(var(--chart-1))">
            {chartData.map((entry, index) => {
              let color
              if (activeTab === 'severity' && SEVERITY_COLORS[entry.severity as keyof typeof SEVERITY_COLORS]) {
                color = SEVERITY_COLORS[entry.severity as keyof typeof SEVERITY_COLORS]
              } else {
                color = COLORS[index % COLORS.length]
              }
              return <Cell key={`bar-cell-${activeTab}-${index}-${entry[nameKey]}`} fill={color} />
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }
  
  return (
    <Card className="overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
      <CardHeader>
        <CardTitle>Fault Code Analysis</CardTitle>
        <CardDescription>
          Analyze fault codes by various categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="severity">By Severity</TabsTrigger>
              <TabsTrigger value="topCodes">Top Fault Codes</TabsTrigger>
              <TabsTrigger value="vehicleMake">By Vehicle Make</TabsTrigger>
              <TabsTrigger value="status">By Status</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="ml-4 flex flex-col gap-1">
            <Label htmlFor="chart-type" className="text-sm">Chart Type</Label>
            <Select value={chartType} onValueChange={(value: 'pie' | 'bar') => setChartType(value)}>
              <SelectTrigger id="chart-type" className="w-[140px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
          <div className={activeTab === "severity" ? "block" : "hidden"}>
            <h3 className="text-lg font-medium mb-2">Fault Codes by Severity</h3>
            {renderChart(data.bySeverity, 'count', 'severity')}
          </div>
          <div className={activeTab === "topCodes" ? "block" : "hidden"}>
            <h3 className="text-lg font-medium mb-2">Top Fault Codes</h3>
            {renderChart(data.topFaultCodes, 'count', 'code')}
          </div>
          <div className={activeTab === "vehicleMake" ? "block" : "hidden"}>
            <h3 className="text-lg font-medium mb-2">Fault Codes by Vehicle Make</h3>
            {renderChart(data.byVehicleMake, 'count', 'make')}
          </div>
          <div className={activeTab === "status" ? "block" : "hidden"}>
            <h3 className="text-lg font-medium mb-2">Fault Codes by Status</h3>
            {renderChart(data.byStatus, 'count', 'status')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 