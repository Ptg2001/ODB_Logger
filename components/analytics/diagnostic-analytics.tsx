"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for diagnostic analytics
const faultDistributionData = [
  { name: "Engine", value: 35 },
  { name: "Transmission", value: 15 },
  { name: "Emissions", value: 25 },
  { name: "Electrical", value: 10 },
  { name: "Fuel System", value: 15 },
]

const faultTrendData = [
  { month: "Jan", engine: 5, transmission: 2, emissions: 3, electrical: 1, fuel: 2 },
  { month: "Feb", engine: 4, transmission: 1, emissions: 4, electrical: 2, fuel: 1 },
  { month: "Mar", engine: 6, transmission: 3, emissions: 2, electrical: 1, fuel: 3 },
  { month: "Apr", engine: 7, transmission: 2, emissions: 5, electrical: 2, fuel: 2 },
  { month: "May", engine: 5, transmission: 1, emissions: 3, electrical: 1, fuel: 1 },
  { month: "Jun", engine: 8, transmission: 3, emissions: 4, electrical: 2, fuel: 3 },
]

const severityData = [
  { name: "Critical", value: 15 },
  { name: "Warning", value: 35 },
  { name: "Info", value: 50 },
]

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]
const SEVERITY_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"]

export function DiagnosticAnalytics() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fault Code Distribution by System</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                chart1: {
                  label: "Engine",
                  color: "hsl(var(--chart-1))",
                },
                chart2: {
                  label: "Transmission",
                  color: "hsl(var(--chart-2))",
                },
                chart3: {
                  label: "Emissions",
                  color: "hsl(var(--chart-3))",
                },
                chart4: {
                  label: "Electrical",
                  color: "hsl(var(--chart-4))",
                },
                chart5: {
                  label: "Fuel System",
                  color: "hsl(var(--chart-5))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={faultDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {faultDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fault Code Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                chart1: {
                  label: "Critical",
                  color: "hsl(var(--chart-1))",
                },
                chart2: {
                  label: "Warning",
                  color: "hsl(var(--chart-2))",
                },
                chart3: {
                  label: "Info",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fault Code Trends by System</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              engine: {
                label: "Engine",
                color: "hsl(var(--chart-1))",
              },
              transmission: {
                label: "Transmission",
                color: "hsl(var(--chart-2))",
              },
              emissions: {
                label: "Emissions",
                color: "hsl(var(--chart-3))",
              },
              electrical: {
                label: "Electrical",
                color: "hsl(var(--chart-4))",
              },
              fuel: {
                label: "Fuel System",
                color: "hsl(var(--chart-5))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={faultTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="engine" stackId="a" fill="hsl(var(--chart-1))" />
                <Bar dataKey="transmission" stackId="a" fill="hsl(var(--chart-2))" />
                <Bar dataKey="emissions" stackId="a" fill="hsl(var(--chart-3))" />
                <Bar dataKey="electrical" stackId="a" fill="hsl(var(--chart-4))" />
                <Bar dataKey="fuel" stackId="a" fill="hsl(var(--chart-5))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

