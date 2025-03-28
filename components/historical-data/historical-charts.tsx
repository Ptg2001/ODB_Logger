"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for historical charts
const monthlyData = [
  { month: "Jan", tests: 42, faults: 12 },
  { month: "Feb", tests: 38, faults: 8 },
  { month: "Mar", tests: 45, faults: 15 },
  { month: "Apr", tests: 50, faults: 10 },
  { month: "May", tests: 35, faults: 5 },
  { month: "Jun", tests: 60, faults: 18 },
  { month: "Jul", tests: 65, faults: 20 },
  { month: "Aug", tests: 70, faults: 15 },
  { month: "Sep", tests: 55, faults: 12 },
  { month: "Oct", tests: 75, faults: 22 },
  { month: "Nov", tests: 80, faults: 18 },
  { month: "Dec", tests: 90, faults: 25 },
]

const projectData = [
  { name: "Harrier/Safari", value: 35 },
  { name: "Tiago/Altroz", value: 25 },
  { name: "Curvv", value: 15 },
  { name: "Nexon", value: 25 },
]

const testTypeData = [
  { name: "Diagnostic", value: 45 },
  { name: "Performance", value: 30 },
  { name: "Emissions", value: 25 },
]

const COLORS = [
  "hsl(var(--chart-1))", 
  "hsl(var(--chart-2))", 
  "hsl(var(--chart-3))", 
  "hsl(var(--chart-4))"
]

export function HistoricalCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Test Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              tests: {
                label: "Tests",
                color: "hsl(var(--chart-1))",
              },
              faults: {
                label: "Faults",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="tests" stroke="hsl(var(--chart-1))" />
                <Line type="monotone" dataKey="faults" stroke="hsl(var(--chart-2))" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tests by Project</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              chart1: {
                label: "Harrier/Safari",
                color: "hsl(var(--chart-1))",
              },
              chart2: {
                label: "Tiago/Altroz",
                color: "hsl(var(--chart-2))",
              },
              chart3: {
                label: "Curvv",
                color: "hsl(var(--chart-3))",
              },
              chart4: {
                label: "Nexon",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {projectData.map((entry, index) => (
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
          <CardTitle>Tests by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              chart1: {
                label: "Diagnostic",
                color: "hsl(var(--chart-1))",
              },
              chart2: {
                label: "Performance",
                color: "hsl(var(--chart-2))",
              },
              chart3: {
                label: "Emissions",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={testTypeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]}>
                  {testTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

