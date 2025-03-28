"use client"

import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#d1d5db']

interface VehicleData {
  name: string
  value: number
}

export function ProjectOverview() {
  const [data, setData] = useState<VehicleData[]>([])
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
        
        if (result.vehiclesByMake && Array.isArray(result.vehiclesByMake)) {
          // Map DB data to chart format
          const chartData = result.vehiclesByMake.map((item: { make: string, count: number }) => ({
            name: item.make,
            value: item.count
          }))
          setData(chartData)
        }
      } catch (error) {
        console.error('Error fetching vehicle distribution data:', error)
        // Fallback data
        setData([
          { name: 'Toyota', value: 9 },
          { name: 'Honda', value: 7 },
          { name: 'Ford', value: 5 },
          { name: 'BMW', value: 4 },
          { name: 'Others', value: 7 }
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} vehicles`, 'Count']}
            contentStyle={{ 
              background: '#333', 
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '12px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

