"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for performance analytics
const performanceData = [
  { rpm: 1000, torque: 120, power: 15, speed: 20 },
  { rpm: 1500, torque: 150, power: 25, speed: 35 },
  { rpm: 2000, torque: 180, power: 40, speed: 50 },
  { rpm: 2500, torque: 200, power: 55, speed: 65 },
  { rpm: 3000, torque: 210, power: 70, speed: 80 },
  { rpm: 3500, torque: 205, power: 85, speed: 95 },
  { rpm: 4000, torque: 195, power: 100, speed: 110 },
  { rpm: 4500, torque: 180, power: 110, speed: 125 },
  { rpm: 5000, torque: 165, power: 120, speed: 140 },
  { rpm: 5500, torque: 150, power: 125, speed: 155 },
  { rpm: 6000, torque: 135, power: 130, speed: 170 },
]

const fuelEfficiencyData = [
  { speed: 20, efficiency: 12 },
  { speed: 40, efficiency: 16 },
  { speed: 60, efficiency: 18 },
  { speed: 80, efficiency: 17 },
  { speed: 100, efficiency: 15 },
  { speed: 120, efficiency: 12 },
  { speed: 140, efficiency: 10 },
]

const accelerationData = [
  { time: 0, speed: 0 },
  { time: 1, speed: 10 },
  { time: 2, speed: 25 },
  { time: 3, speed: 40 },
  { time: 4, speed: 55 },
  { time: 5, speed: 65 },
  { time: 6, speed: 75 },
  { time: 7, speed: 85 },
  { time: 8, speed: 95 },
  { time: 9, speed: 100 },
  { time: 10, speed: 105 },
]

export function PerformanceAnalytics() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Power and Torque Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              power: {
                label: "Power (HP)",
                color: "hsl(var(--chart-1))",
              },
              torque: {
                label: "Torque (Nm)",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="rpm" label={{ value: "RPM", position: "insideBottom", offset: -5 }} />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="power" stroke="var(--color-power)" activeDot={{ r: 8 }} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="torque"
                  stroke="var(--color-torque)"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fuel Efficiency vs Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                efficiency: {
                  label: "Fuel Efficiency (km/l)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelEfficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="speed" label={{ value: "Speed (km/h)", position: "insideBottom", offset: -5 }} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="efficiency" fill="var(--color-efficiency)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acceleration Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                speed: {
                  label: "Speed (km/h)",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accelerationData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" label={{ value: "Time (seconds)", position: "insideBottom", offset: -5 }} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="speed" stroke="var(--color-speed)" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

