"use client"

import React, { useEffect, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

interface ChartData {
  name: string
  total: number
}

export function FaultCodeSummary() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Start the timer for minimum loading duration
        const startTime = Date.now()
        
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const result = await response.json()
        
        // Ensure loading state shows for at least 1 second for better UX
        const elapsed = Date.now() - startTime
        if (elapsed < 1000) {
          await new Promise(resolve => setTimeout(resolve, 1000 - elapsed))
        }
        
        if (result.faultCodeCategories && Array.isArray(result.faultCodeCategories)) {
          setData(result.faultCodeCategories)
        }
      } catch (error) {
        console.error('Error fetching fault code data:', error)
        // Fallback data
        setData([
          { name: 'Engine', total: 16 },
          { name: 'Transmission', total: 8 },
          { name: 'Fuel System', total: 12 },
          { name: 'Emissions', total: 9 },
          { name: 'Sensors', total: 7 },
          { name: 'Electrical', total: 5 },
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <Skeleton className="h-[300px] w-full absolute" />
        <div className="z-10 text-muted-foreground text-sm animate-pulse">
          Loading chart data...
        </div>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
            contentStyle={{ 
              background: '#333', 
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '12px',
            }}
            formatter={(value) => [`${value} codes`, 'Count']}
          />
          <Bar 
            dataKey="total" 
            radius={[4, 4, 0, 0]} 
            fill="hsl(var(--chart-1))"
            className="fill-primary"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

