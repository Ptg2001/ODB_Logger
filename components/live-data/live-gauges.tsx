"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

// Default placeholder data for gauges
const defaultGaugeData = {
  rpm: { value: 65, empty: 35 },
  speed: { value: 45, empty: 55 },
  temp: { value: 75, empty: 25 },
  fuel: { value: 30, empty: 70 },
  fuelPressure: { value: 50, empty: 50 },
  intakePressure: { value: 40, empty: 60 },
  o2Voltage: { value: 55, empty: 45 },
  batteryVoltage: { value: 85, empty: 15 },
}

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

type LiveGaugesProps = {
  liveData?: LiveDataType
}

export function LiveGauges({ liveData }: LiveGaugesProps) {
  const [gaugeData, setGaugeData] = useState(defaultGaugeData)
  
  // Update gauge data when live data changes
  useEffect(() => {
    if (liveData) {
      // Calculate gauge percentages based on live data
      const rpmPercent = Math.min(100, Math.round((liveData.rpm / 8000) * 100))
      const speedPercent = Math.min(100, Math.round((liveData.speed / 220) * 100))
      const tempPercent = Math.min(100, Math.round((liveData.engineTemp / 120) * 100))
      const fuelPercent = liveData.fuelLevel
      const fuelPressurePercent = Math.min(100, Math.round((liveData.fuelPressure / 700) * 100))
      const intakePressurePercent = Math.min(100, Math.round((liveData.intakePressure / 255) * 100))
      const o2VoltagePercent = Math.min(100, Math.round((parseFloat(liveData.o2Voltage) / 1.5) * 100))
      const batteryVoltagePercent = Math.min(100, Math.round(((parseFloat(liveData.batteryVoltage) - 8) / 8) * 100))
      
      setGaugeData({
        rpm: { value: rpmPercent, empty: 100 - rpmPercent },
        speed: { value: speedPercent, empty: 100 - speedPercent },
        temp: { value: tempPercent, empty: 100 - tempPercent },
        fuel: { value: fuelPercent, empty: 100 - fuelPercent },
        fuelPressure: { value: fuelPressurePercent, empty: 100 - fuelPressurePercent },
        intakePressure: { value: intakePressurePercent, empty: 100 - intakePressurePercent },
        o2Voltage: { value: o2VoltagePercent, empty: 100 - o2VoltagePercent },
        batteryVoltage: { value: batteryVoltagePercent, empty: 100 - batteryVoltagePercent },
      })
    }
  }, [liveData])
  
  // Listen for global update events (alternative approach)
  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      const newData = event.detail
      if (newData && !liveData) {
        // Only use events if props aren't provided
        // Calculate gauge values as above...
      }
    }
    
    window.addEventListener('obd-data-update', handleDataUpdate as EventListener)
    return () => {
      window.removeEventListener('obd-data-update', handleDataUpdate as EventListener)
    }
  }, [liveData])

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {/* First row - Basic parameters */}
      <GaugeCard 
        title="RPM" 
        value={liveData ? liveData.rpm.toLocaleString() : "2,450"} 
        maxValue="8,000" 
        data={[
          { name: "RPM", value: gaugeData.rpm.value },
          { name: "Empty", value: gaugeData.rpm.empty },
        ]} 
        color="#f59e0b" 
      />
      <GaugeCard 
        title="Speed" 
        value={liveData ? liveData.speed.toString() : "65"} 
        maxValue="220" 
        unit="km/h" 
        data={[
          { name: "Speed", value: gaugeData.speed.value },
          { name: "Empty", value: gaugeData.speed.empty },
        ]} 
        color="#10b981" 
      />
      <GaugeCard
        title="Engine Temperature"
        value={liveData ? liveData.engineTemp.toString() : "92"}
        maxValue="120"
        unit="°C"
        data={[
          { name: "Temperature", value: gaugeData.temp.value },
          { name: "Empty", value: gaugeData.temp.empty },
        ]}
        color="#ef4444"
      />
      <GaugeCard 
        title="Fuel Level" 
        value={liveData ? liveData.fuelLevel.toString() : "30"} 
        maxValue="100" 
        unit="%" 
        data={[
          { name: "Fuel", value: gaugeData.fuel.value },
          { name: "Empty", value: gaugeData.fuel.empty },
        ]} 
        color="#3b82f6" 
      />
      
      {/* Second row - Additional parameters */}
      <GaugeCard 
        title="Fuel Pressure" 
        value={liveData ? liveData.fuelPressure.toString() : "350"} 
        maxValue="700" 
        unit="kPa" 
        data={[
          { name: "Fuel Pressure", value: gaugeData.fuelPressure.value },
          { name: "Empty", value: gaugeData.fuelPressure.empty },
        ]} 
        color="#f97316" 
      />
      <GaugeCard 
        title="Intake Pressure" 
        value={liveData ? liveData.intakePressure.toString() : "101"} 
        maxValue="255" 
        unit="kPa" 
        data={[
          { name: "Intake Pressure", value: gaugeData.intakePressure.value },
          { name: "Empty", value: gaugeData.intakePressure.empty },
        ]} 
        color="#8b5cf6" 
      />
      <GaugeCard 
        title="O2 Sensor" 
        value={liveData ? liveData.o2Voltage : "0.85"} 
        maxValue="1.5" 
        unit="V" 
        data={[
          { name: "O2 Voltage", value: gaugeData.o2Voltage.value },
          { name: "Empty", value: gaugeData.o2Voltage.empty },
        ]} 
        color="#06b6d4" 
      />
      <GaugeCard 
        title="Battery Voltage" 
        value={liveData ? liveData.batteryVoltage : "12.7"} 
        maxValue="16" 
        unit="V" 
        data={[
          { name: "Battery", value: gaugeData.batteryVoltage.value },
          { name: "Empty", value: gaugeData.batteryVoltage.empty },
        ]} 
        color="#059669" 
      />
    </div>
  )
}

function GaugeCard({
  title,
  value,
  maxValue,
  unit = "",
  data,
  color,
}: {
  title: string
  value: string
  maxValue: string
  unit?: string
  data: { name: string; value: number }[]
  color: string
}) {
  // Create a simple chart config
  const chartConfig = {
    gauge: {
      color: color
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="mb-2 flex justify-between">
          <div className="text-2xl font-bold" style={{ color }}>
            {value}
            {unit && <span className="text-lg ml-1">{unit}</span>}
          </div>
          <p className="text-xs text-muted-foreground">Max: {maxValue}</p>
        </div>
        <ChartContainer className="h-[150px]" config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={0}
                dataKey="value"
                strokeWidth={0}
                animationDuration={300}
              >
                <Cell fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
                <Cell fill="#e5e7eb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="text-center mt-2">
          <p className="text-sm font-medium">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}

