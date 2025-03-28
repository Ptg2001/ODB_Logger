"use client"

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Gauge, Car, GaugeCircle, Thermometer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Droplet, Wind, Sunrise, Battery } from "lucide-react"

type MetricCardProps = {
  title: string
  value: string
  unit: string
  icon: React.ReactNode
  trend?: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
  }
  minValue: number
  maxValue: number
  currentValue: number
}

function MetricCard({ 
  title, 
  value, 
  unit, 
  icon, 
  trend, 
  minValue, 
  maxValue, 
  currentValue 
}: MetricCardProps) {
  const percentage = Math.max(0, Math.min(100, ((currentValue - minValue) / (maxValue - minValue)) * 100))
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-full text-primary">
              {icon}
            </div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.direction === 'up' && <TrendingUp className="text-red-500" size={16} />}
              {trend.direction === 'down' && <TrendingDown className="text-green-500" size={16} />}
              {trend.direction === 'stable' && <Minus className="text-gray-500" size={16} />}
              <span className={`text-xs ${
                trend.direction === 'up' ? 'text-red-500' : 
                trend.direction === 'down' ? 'text-green-500' : 'text-gray-500'
              }`}>
                {trend.percentage}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
          <Progress value={percentage} className="h-1.5" style={{backgroundColor: "#e5e7eb"}} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{minValue}</span>
            <span>{maxValue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type LiveDataDashboardProps = {
  vehicleId: string
}

export function LiveDataDashboard({ vehicleId }: LiveDataDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    vehicleInfo: {
      make: string
      model: string
      year: number
      vin: string
    } | null,
    liveData: Record<string, any>,
    gaugeData: any[],
    trends: Record<string, {
      direction: 'up' | 'down' | 'stable',
      percentage: number
    }>
  }>({
    vehicleInfo: null,
    liveData: {},
    gaugeData: [],
    trends: {}
  })
  const [viewMode, setViewMode] = useState('table')
  
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
        
        const response = await fetch(`/api/analytics/live-data?vehicleId=${vehicleId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('No live data found for this vehicle')
          }
          throw new Error('Failed to fetch live data')
        }
        
        const result = await response.json()
        setData({
          vehicleInfo: result.vehicleInfo || null,
          liveData: result.liveData || {},
          gaugeData: result.gaugeData || [],
          trends: result.trends || {}
        })
      } catch (err) {
        console.error('Error fetching vehicle live data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load live data')
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
          <CardTitle>Vehicle Live Data</CardTitle>
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
          <CardTitle>Vehicle Live Data</CardTitle>
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

  const getTrendIcon = (direction: string) => {
    if (direction === 'up') return <TrendingUp className="text-red-500" size={16} />
    if (direction === 'down') return <TrendingDown className="text-green-500" size={16} />
    return <Minus className="text-gray-500" size={16} />
  }
  
  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined) return 'N/A'
    
    // Add units based on parameter type
    switch (key) {
      case 'speed':
        return `${value} km/h`
      case 'rpm':
        return `${value} RPM`
      case 'fuel_level':
        return `${value}%`
      case 'coolant_temp':
        return `${value}°C`
      case 'intake_temp':
        return `${value}°C`
      case 'engine_load':
        return `${value}%`
      case 'throttle_position':
        return `${value}%`
      case 'fuel_efficiency':
        return `${value} MPG`
      case 'battery_voltage':
        return `${value}v`
      default:
        return value
    }
  }
  
  const formatParamName = (param: string) => {
    return param.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  
  const getGaugeValue = (param: string) => {
    const values: Record<string, number> = {
      engine_speed: 2450,
      vehicle_speed: 65,
      engine_load: 45,
      coolant_temp: 92,
      fuel_pressure: 350,
      intake_pressure: 95,
      o2_voltage: 0.85,
      battery_voltage: 12.7
    }
    return values[param] || 0
  }
  
  const getColorArray = (param: string) => {
    const colors: Record<string, string[]> = {
      engine_speed: ["#9333ea", "#a855f7", "#d8b4fe"],
      vehicle_speed: ["#2563eb", "#3b82f6", "#93c5fd"],
      engine_load: ["#ea580c", "#f97316", "#fdba74"],
      coolant_temp: ["#dc2626", "#ef4444", "#fca5a5"],
      fuel_pressure: ["#16a34a", "#22c55e", "#86efac"],
      intake_pressure: ["#0284c7", "#0ea5e9", "#7dd3fc"],
      o2_voltage: ["#7c3aed", "#8b5cf6", "#c4b5fd"],
      battery_voltage: ["#b45309", "#d97706", "#fbbf24"]
    }
    return colors[param] || ["#6b7280", "#9ca3af", "#d1d5db"]
  }
  
  return (
    <Tabs defaultValue="analytics" className="h-full space-y-6">
      <div className="space-between flex items-center">
        <TabsList>
          <TabsTrigger value="analytics" className="relative">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent
        value="analytics"
        className="overflow-auto max-h-[70vh] border-t rounded-md border"
      >
        <ScrollArea className="h-full">
          <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Engine Speed Metric Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Engine Speed
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,450</div>
                <p className="text-xs text-muted-foreground">
                  RPM
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-300"
                    style={{ width: "65%" }}
                  />
                </div>
                <div className="mt-1 flex text-xs justify-between">
                  <span>0</span>
                  <span>8,000</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Vehicle Speed Metric Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Vehicle Speed
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">65</div>
                <p className="text-xs text-muted-foreground">
                  km/h
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-300" 
                    style={{ width: "32%" }}
                  />
                </div>
                <div className="mt-1 flex text-xs justify-between">
                  <span>0</span>
                  <span>200</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Engine Load Metric Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Engine Load
                </CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45%</div>
                <p className="text-xs text-muted-foreground">
                  Current load
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-300"
                    style={{ width: "45%" }}
                  />
                </div>
                <div className="mt-1 flex text-xs justify-between">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Coolant Temperature Metric Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Coolant Temperature
                </CardTitle>
                <Thermometer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92</div>
                <p className="text-xs text-muted-foreground">
                  °C
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-300"
                    style={{ width: "75%" }}
                  />
                </div>
                <div className="mt-1 flex text-xs justify-between">
                  <span>0</span>
                  <span>120</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Fuel Pressure Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Fuel Pressure
                </CardTitle>
                <Droplet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">350</div>
                <p className="text-xs text-muted-foreground">
                  kPa
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-300"
                    style={{ width: "70%" }}
                  />
                </div>
                <div className="mt-1 flex text-xs justify-between">
                  <span>0</span>
                  <span>500</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Intake Pressure Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Intake Pressure
                </CardTitle>
                <Wind className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95</div>
                <p className="text-xs text-muted-foreground">
                  kPa
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                    style={{ width: "63%" }}
                  />
                </div>
                <div className="mt-1 flex text-xs justify-between">
                  <span>0</span>
                  <span>150</span>
                </div>
              </CardContent>
            </Card>
            
            {/* O2 Voltage Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  O2 Sensor Voltage
                </CardTitle>
                <Sunrise className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.85</div>
                <p className="text-xs text-muted-foreground">
                  Volts
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-300"
                    style={{ width: "85%" }}
                  />
                </div>
                <div className="mt-1 flex text-xs justify-between">
                  <span>0</span>
                  <span>1.0</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Battery Voltage Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Battery Voltage
                </CardTitle>
                <Battery className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.7</div>
                <p className="text-xs text-muted-foreground">
                  Volts
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                    style={{ width: "80%" }}
                  />
                </div>
                <div className="mt-1 flex text-xs justify-between">
                  <span>8</span>
                  <span>16</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-2">
            {/* Engine Performance Trends */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Engine Performance Trends</CardTitle>
                <CardDescription>
                  Last 5 minutes of data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={288}>
                  <LineChart
                    data={[
                      { name: "00:00", rpm: 1250, speed: 0 },
                      { name: "01:00", rpm: 2100, speed: 35 },
                      { name: "02:00", rpm: 2450, speed: 65 },
                      { name: "03:00", rpm: 1900, speed: 45 },
                      { name: "04:00", rpm: 2200, speed: 55 },
                      { name: "05:00", rpm: 2450, speed: 65 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis width={50} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rpm" stroke="rgb(147, 51, 234)" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="speed" stroke="rgb(37, 99, 235)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* System Temperatures */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>System Temperatures</CardTitle>
                <CardDescription>
                  All temperature sensors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={288}>
                  <LineChart
                    data={[
                      { name: "00:00", coolant: 82, intake: 24 },
                      { name: "01:00", coolant: 85, intake: 26 },
                      { name: "02:00", coolant: 89, intake: 28 },
                      { name: "03:00", coolant: 92, intake: 30 },
                      { name: "04:00", coolant: 94, intake: 30 },
                      { name: "05:00", coolant: 92, intake: 29 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis width={50} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="coolant" stroke="rgb(220, 38, 38)" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="intake" stroke="rgb(2, 132, 199)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Fuel System Data */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Fuel System</CardTitle>
                <CardDescription>
                  Pressure and consumption metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={288}>
                  <LineChart
                    data={[
                      { name: "00:00", pressure: 320, level: 92 },
                      { name: "01:00", pressure: 330, level: 90 },
                      { name: "02:00", pressure: 350, level: 88 },
                      { name: "03:00", pressure: 345, level: 86 },
                      { name: "04:00", pressure: 340, level: 84 },
                      { name: "05:00", pressure: 350, level: 82 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis width={50} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pressure" stroke="rgb(22, 163, 74)" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="level" stroke="rgb(180, 83, 9)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Sensor Readings */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Sensor Readings</CardTitle>
                <CardDescription>
                  O2 and Intake pressure data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={288}>
                  <LineChart
                    data={[
                      { name: "00:00", o2: 0.82, intake: 90 },
                      { name: "01:00", o2: 0.83, intake: 91 },
                      { name: "02:00", o2: 0.85, intake: 95 },
                      { name: "03:00", o2: 0.86, intake: 94 },
                      { name: "04:00", o2: 0.85, intake: 93 },
                      { name: "05:00", o2: 0.85, intake: 95 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis width={50} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="o2" stroke="rgb(124, 58, 237)" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="intake" stroke="rgb(2, 132, 199)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="p-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Detailed Parameters</CardTitle>
                  <Select 
                    value={viewMode}
                    onValueChange={setViewMode}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>View Mode</SelectLabel>
                        <SelectItem value="gauge">Gauge View</SelectItem>
                        <SelectItem value="table">Table View</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>
                  All parameters from OBD-II
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {viewMode === "table" ? (
                    <table className="w-full">
                      <thead>
                        <tr className="m-0 p-0 even:bg-muted">
                          <th className="border px-4 py-2 text-left font-bold">Parameter</th>
                          <th className="border px-4 py-2 text-left font-bold">Value</th>
                          <th className="border px-4 py-2 text-left font-bold">Unit</th>
                          <th className="border px-4 py-2 text-left font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {["engine_speed", "vehicle_speed", "engine_load", "coolant_temp", 
                           "fuel_pressure", "intake_pressure", "o2_voltage", "battery_voltage"]
                          .map((param) => (
                          <tr key={param} className="m-0 p-0 even:bg-muted">
                            <td className="border px-4 py-2 text-left">{formatParamName(param)}</td>
                            <td className="border px-4 py-2 text-left">{getGaugeValue(param)}</td>
                            <td className="border px-4 py-2 text-left">
                              {param.includes("speed") && param !== "engine_speed" ? "km/h" : 
                               param === "engine_speed" ? "RPM" :
                               param.includes("temp") ? "°C" :
                               param.includes("load") ? "%" :
                               param.includes("pressure") ? "kPa" :
                               param.includes("voltage") ? "V" : ""}
                            </td>
                            <td className="border px-4 py-2 text-left">
                              <Badge 
                                variant={param.includes("temp") && getGaugeValue(param) > 90 ? "destructive" : "default"}
                                className="rounded-sm px-1 font-normal"
                              >
                                {param.includes("temp") && getGaugeValue(param) > 90 ? "Warning" : "Normal"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {["engine_speed", "vehicle_speed", "engine_load", "coolant_temp", 
                        "fuel_pressure", "intake_pressure", "o2_voltage", "battery_voltage"]
                        .map((param) => {
                        const colors = getColorArray(param);
                        return (
                          <Card key={param}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">{formatParamName(param)}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-xl font-bold">{getGaugeValue(param)}
                                <span className="text-sm font-normal ml-1">
                                  {param.includes("speed") && param !== "engine_speed" ? "km/h" : 
                                   param === "engine_speed" ? "RPM" :
                                   param.includes("temp") ? "°C" :
                                   param.includes("load") ? "%" :
                                   param.includes("pressure") ? "kPa" :
                                   param.includes("voltage") ? "V" : ""}
                                </span>
                              </div>
                              <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                                <div
                                  className="h-full rounded-full"
                                  style={{ 
                                    width: `${param === "engine_speed" ? 
                                      (getGaugeValue(param) / 8000) * 100 :
                                      param === "vehicle_speed" ? 
                                      (getGaugeValue(param) / 200) * 100 :
                                      param === "engine_load" ? 
                                      getGaugeValue(param) :
                                      param === "coolant_temp" ? 
                                      (getGaugeValue(param) / 120) * 100 :
                                      param === "fuel_pressure" ? 
                                      (getGaugeValue(param) / 500) * 100 :
                                      param === "intake_pressure" ? 
                                      (getGaugeValue(param) / 150) * 100 :
                                      param === "o2_voltage" ? 
                                      (getGaugeValue(param) / 1.0) * 100 :
                                      param === "battery_voltage" ? 
                                      ((getGaugeValue(param) - 8) / 8) * 100 :
                                      50}%`,
                                    backgroundImage: `linear-gradient(to right, ${colors[0]}, ${colors[1]})`
                                  }}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )
}

// Helper functions for generating sample data when API doesn't return expected format
function generateHistoricalTrendsData() {
  const data = []
  const now = new Date()
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() - (23 - i) * 3600000)
    data.push({
      timestamp: time.toLocaleTimeString(),
      rpm: 1000 + Math.random() * 2000,
      speed: 30 + Math.random() * 60,
      engine_load: 30 + Math.random() * 40,
      coolant_temp: 80 + Math.random() * 20
    })
  }
  
  return data
}

function generateTempHistoryData() {
  const data = []
  const now = new Date()
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() - (23 - i) * 3600000)
    data.push({
      timestamp: time.toLocaleTimeString(),
      coolantTemp: 80 + Math.random() * 20,
      intakeTemp: 30 + Math.random() * 40,
      ambientTemp: 20 + Math.random() * 20
    })
  }
  
  return data
} 