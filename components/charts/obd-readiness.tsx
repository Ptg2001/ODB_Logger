"use client"

import { useState, useEffect } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type OBDReadinessProps = {
  vehicleId: string
}

export function OBDReadiness({ vehicleId }: OBDReadinessProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    vehicleInfo: {
      make: string
      model: string
      year: string
    }
    moduleId: string
    monitorStatuses: any[]
    readinessPercentage: number
    completedMonitors: number
    applicableMonitors: number
  }>({
    vehicleInfo: {
      make: '',
      model: '',
      year: ''
    },
    moduleId: '',
    monitorStatuses: [],
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
          throw new Error('Failed to fetch OBD readiness data')
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching OBD readiness data:', err)
        setError('Failed to load OBD readiness data')
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
          <CardTitle>OBD Readiness</CardTitle>
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
          <CardTitle>OBD Readiness</CardTitle>
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
        <CardTitle>OBD Readiness Status</CardTitle>
        <CardDescription>
          {data.vehicleInfo.make} {data.vehicleInfo.model} {data.vehicleInfo.year} - Module ID: {data.moduleId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Overall Readiness</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">
                    {data.completedMonitors} of {data.applicableMonitors} monitors complete
                  </span>
                  <span className="text-sm font-medium">
                    {data.readinessPercentage}%
                  </span>
                </div>
                <Progress value={data.readinessPercentage} className="h-2" />
              </div>
              
              <div className="space-y-2">
                {data.monitorStatuses.map((monitor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{monitor.name}</span>
                    <div className="flex items-center">
                      {monitor.status === 'complete' ? (
                        <Badge className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" /> Complete
                        </Badge>
                      ) : monitor.status === 'incomplete' ? (
                        <Badge variant="outline" className="text-amber-500 border-amber-500">
                          <X className="h-3 w-3 mr-1" /> Incomplete
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Not Applicable
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={data.monitorStatuses}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Completion Percentage"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Completion']}
                  labelFormatter={(label) => `Monitor: ${label}`}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 