"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for fault code summary
const systemData = [
  { name: "Engine", value: 12 },
  { name: "Transmission", value: 5 },
  { name: "Emissions", value: 8 },
  { name: "Fuel System", value: 6 },
  { name: "Air Intake", value: 4 },
  { name: "Electrical", value: 7 },
]

const severityData = [
  { name: "Critical", value: 8 },
  { name: "Warning", value: 20 },
  { name: "Info", value: 14 },
]

const monthlyData = [
  { month: "Jan", codes: 5 },
  { month: "Feb", codes: 8 },
  { month: "Mar", codes: 12 },
  { month: "Apr", codes: 10 },
  { month: "May", codes: 7 },
  { month: "Jun", codes: 9 },
  { month: "Jul", codes: 15 },
  { month: "Aug", codes: 11 },
  { month: "Sep", codes: 9 },
  { month: "Oct", codes: 14 },
  { month: "Nov", codes: 10 },
  { month: "Dec", codes: 12 },
]

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
]
const SEVERITY_COLORS = {
  Critical: "hsl(var(--chart-1))",
  Warning: "hsl(var(--chart-2))",
  Info: "hsl(var(--chart-3))",
}

export function FaultCodesSummary() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Fault Codes by System</CardTitle>
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
                label: "Fuel System",
                color: "hsl(var(--chart-4))",
              },
              chart5: {
                label: "Air Intake",
                color: "hsl(var(--chart-5))",
              },
              chart6: {
                label: "Electrical",
                color: "hsl(var(--chart-6))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={systemData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {systemData.map((entry, index) => (
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
          <CardTitle>Fault Codes by Severity</CardTitle>
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
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name === "Critical" ? "hsl(var(--chart-1))" :
                        entry.name === "Warning" ? "hsl(var(--chart-2))" :
                        "hsl(var(--chart-3))"
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Fault Code Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              codes: {
                label: "Fault Codes",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="codes" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

