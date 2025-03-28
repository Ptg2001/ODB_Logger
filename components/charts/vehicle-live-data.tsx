"use client"

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react'

type VehicleLiveDataProps = {
  vehicleId: string
}

export function VehicleLiveData({ vehicleId }: VehicleLiveDataProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    vehicleInfo: {
      make: string
      model: string
      year: string
    }
    latestData: any
    gaugeData: any[]
    trendData: Record<string, any>
  }>({
    vehicleInfo: {
      make: '',
      model: '',
      year: ''
    },
    latestData: {},
    gaugeData: [],
    trendData: {}
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
        
        const response = await fetch(`/api/analytics/live-data?vehicleId=${vehicleId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch vehicle live data')
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching vehicle live data:', err)
        setError('Failed to load vehicle live data')
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
          <CardDescription>Loading vehicle data...</CardDescription>
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
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Vehicle Performance Data</CardTitle>
        <CardDescription>
          {data.vehicleInfo.make} {data.vehicleInfo.model} {data.vehicleInfo.year}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gauges">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gauges">Current Values</TabsTrigger>
            <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gauges">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {data.gaugeData.map((gauge, index) => (
                <Card key={index} className="p-4">
                  <div className="text-sm text-muted-foreground mb-2">{gauge.label}</div>
                  <div className="text-3xl font-bold mb-2">
                    {gauge.value} {gauge.unit}
                  </div>
                  <div className="flex items-center space-x-2">
                    {gauge.trend === 'increasing' ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : gauge.trend === 'decreasing' ? (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-500" />
                    )}
                    <span className={`text-sm ${
                      gauge.trend === 'increasing' 
                        ? 'text-green-500' 
                        : gauge.trend === 'decreasing' 
                          ? 'text-red-500' 
                          : 'text-gray-500'
                    }`}>
                      {gauge.trend === 'increasing' 
                        ? 'Increasing' 
                        : gauge.trend === 'decreasing' 
                          ? 'Decreasing' 
                          : 'Stable'}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="h-[400px]">
            <div className="space-y-8 mt-4">
              {Object.entries(data.trendData).map(([key, trendData]) => (
                <div key={key}>
                  <h3 className="text-lg font-medium mb-2">{key.replace('_', ' ')}</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={trendData.data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`${value} ${trendData.unit}`, '']}
                          labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.2} 
                          name={key.replace('_', ' ')} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {trendData.trend === 'increasing' ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : trendData.trend === 'decreasing' ? (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-500" />
                    )}
                    <span className={`text-sm ${
                      trendData.trend === 'increasing' 
                        ? 'text-green-500' 
                        : trendData.trend === 'decreasing' 
                          ? 'text-red-500' 
                          : 'text-gray-500'
                    }`}>
                      {trendData.trendDescription}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 