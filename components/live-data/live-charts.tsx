"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Interface for the component props
type LiveDataType = {
  rpm: number
  speed: number
  engineTemp: number
  batteryVoltage: string
  fuelPressure: number
  o2Voltage: string
  intakePressure: number
  engineLoad: number
  fuelLevel: number
  throttlePosition: number
  maf: string
}

type LiveChartsProps = {
  liveData?: LiveDataType
}

// Mock data for real-time charts
const generateTimeData = () => {
  const data = []
  const now = new Date()
  for (let i = 20; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 1000)
    data.push({
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      rpm: Math.floor(Math.random() * 1000) + 2000,
      speed: Math.floor(Math.random() * 20) + 55,
      temp: Math.floor(Math.random() * 5) + 90,
      voltage: (Math.random() * 0.5 + 12.5).toFixed(1),
      fuel_level: Math.floor(Math.random() * 10) + 25,
      fuel_pressure: Math.floor(Math.random() * 50) + 320,
      o2_voltage: (Math.random() * 0.2 + 0.7).toFixed(2),
      intake_pressure: Math.floor(Math.random() * 20) + 90,
      maf: (Math.random() * 1.5 + 12).toFixed(1),
    })
  }
  return data
}

export function LiveCharts({ liveData }: LiveChartsProps) {
  const [timeData, setTimeData] = useState(generateTimeData())
  const chartUpdateIntervalRef = useRef<number | null>(null)
  
  // Update chart data with new reading from liveData
  useEffect(() => {
    if (liveData) {
      const now = new Date()
      const newPoint = {
        time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        rpm: liveData.rpm,
        speed: liveData.speed,
        temp: liveData.engineTemp,
        voltage: liveData.batteryVoltage,
        fuel_level: liveData.fuelLevel,
        fuel_pressure: liveData.fuelPressure,
        o2_voltage: liveData.o2Voltage,
        intake_pressure: liveData.intakePressure,
        maf: liveData.maf,
      }
      
      // Add new point and remove oldest to maintain a sliding window
      setTimeData(prevData => {
        const newData = [...prevData, newPoint]
        if (newData.length > 21) {
          return newData.slice(1)
        }
        return newData
      })
    }
  }, [liveData])
  
  // Start auto-update interval if no liveData prop provided
  useEffect(() => {
    if (!liveData && !chartUpdateIntervalRef.current) {
      chartUpdateIntervalRef.current = window.setInterval(() => {
        setTimeData(generateTimeData())
      }, 1000)
    }
    
    return () => {
      if (chartUpdateIntervalRef.current) {
        clearInterval(chartUpdateIntervalRef.current)
        chartUpdateIntervalRef.current = null
      }
    }
  }, [liveData])
  
  // Listen for global update events (alternative approach)
  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      const newData = event.detail
      if (newData && !liveData) {
        // Only use events if props aren't provided
        // Add new data point with the values from the event
      }
    }
    
    window.addEventListener('obd-data-update', handleDataUpdate as EventListener)
    return () => {
      window.removeEventListener('obd-data-update', handleDataUpdate as EventListener)
    }
  }, [liveData])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>RPM & Speed</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              rpm: {
                label: "RPM",
                color: "#f59e0b",
              },
              speed: {
                label: "Speed (km/h)",
                color: "#10b981",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line yAxisId="left" type="monotone" dataKey="rpm" stroke="#f59e0b" dot={false} isAnimationActive={true} />
                <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#10b981" dot={false} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Temperature & Voltage</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              temp: {
                label: "Temperature (°C)",
                color: "#ef4444",
              },
              voltage: {
                label: "Voltage (V)",
                color: "#059669",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" dot={false} isAnimationActive={true} />
                <Line yAxisId="right" type="monotone" dataKey="voltage" stroke="#059669" dot={false} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Fuel System</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              fuel_level: {
                label: "Fuel Level (%)",
                color: "#3b82f6",
              },
              fuel_pressure: {
                label: "Fuel Pressure (kPa)",
                color: "#f97316",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line yAxisId="left" type="monotone" dataKey="fuel_level" stroke="#3b82f6" dot={false} isAnimationActive={true} />
                <Line yAxisId="right" type="monotone" dataKey="fuel_pressure" stroke="#f97316" dot={false} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Intake & O2 Sensors</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              o2_voltage: {
                label: "O2 Voltage (V)",
                color: "#06b6d4",
              },
              intake_pressure: {
                label: "Intake Pressure (kPa)",
                color: "#8b5cf6",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line yAxisId="left" type="monotone" dataKey="o2_voltage" stroke="#06b6d4" dot={false} isAnimationActive={true} />
                <Line yAxisId="right" type="monotone" dataKey="intake_pressure" stroke="#8b5cf6" dot={false} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

