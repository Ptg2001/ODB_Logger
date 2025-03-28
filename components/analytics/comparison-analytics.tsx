"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FilterIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Mock data for comparison analytics
const performanceComparisonData = [
  { name: "0-60 km/h", harrier: 5.2, tiago: 6.8, curvv: 5.5, nexon: 5.8 },
  { name: "0-100 km/h", harrier: 10.5, tiago: 14.2, curvv: 11.0, nexon: 11.5 },
  { name: "Top Speed", harrier: 180, tiago: 160, curvv: 175, nexon: 170 },
  { name: "Fuel Efficiency", harrier: 14, tiago: 18, curvv: 16, nexon: 17 },
  { name: "Braking", harrier: 42, tiago: 38, curvv: 40, nexon: 39 },
]

const emissionsComparisonData = [
  { name: "CO", harrier: 0.7, tiago: 0.6, curvv: 0.65, nexon: 0.68 },
  { name: "HC", harrier: 75, tiago: 65, curvv: 70, nexon: 72 },
  { name: "NOx", harrier: 190, tiago: 170, curvv: 180, nexon: 185 },
  { name: "PM", harrier: 0.025, tiago: 0.02, curvv: 0.022, nexon: 0.023 },
]

const faultComparisonData = [
  { name: "Engine", harrier: 12, tiago: 8, curvv: 10, nexon: 11 },
  { name: "Transmission", harrier: 5, tiago: 3, curvv: 4, nexon: 4 },
  { name: "Emissions", harrier: 8, tiago: 6, curvv: 7, nexon: 7 },
  { name: "Electrical", harrier: 7, tiago: 5, curvv: 6, nexon: 6 },
  { name: "Fuel System", harrier: 6, tiago: 4, curvv: 5, nexon: 5 },
]

export function ComparisonAnalytics() {
  const [project1, setProject1] = useState<string>("harrier")
  const [project2, setProject2] = useState<string>("nexon")

  const handleCompare = () => {
    toast({
      title: "Comparison updated",
      description: `Comparing ${project1} with ${project2}`,
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Project Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="w-full sm:w-64">
              <Select value={project1} onValueChange={setProject1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harrier">Harrier/Safari</SelectItem>
                  <SelectItem value="tiago">Tiago/Altroz</SelectItem>
                  <SelectItem value="curvv">Curvv</SelectItem>
                  <SelectItem value="nexon">Nexon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-64">
              <Select value={project2} onValueChange={setProject2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harrier">Harrier/Safari</SelectItem>
                  <SelectItem value="tiago">Tiago/Altroz</SelectItem>
                  <SelectItem value="curvv">Curvv</SelectItem>
                  <SelectItem value="nexon">Nexon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCompare}>
              <FilterIcon className="mr-2 h-4 w-4" /> Compare
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              harrier: {
                label: "Harrier/Safari",
                color: "hsl(var(--chart-1))",
              },
              tiago: {
                label: "Tiago/Altroz",
                color: "hsl(var(--chart-2))",
              },
              curvv: {
                label: "Curvv",
                color: "hsl(var(--chart-3))",
              },
              nexon: {
                label: "Nexon",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={performanceComparisonData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Radar
                  name="Harrier/Safari"
                  dataKey="harrier"
                  stroke="var(--color-harrier)"
                  fill="var(--color-harrier)"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Tiago/Altroz"
                  dataKey="tiago"
                  stroke="var(--color-tiago)"
                  fill="var(--color-tiago)"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Curvv"
                  dataKey="curvv"
                  stroke="var(--color-curvv)"
                  fill="var(--color-curvv)"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Nexon"
                  dataKey="nexon"
                  stroke="var(--color-nexon)"
                  fill="var(--color-nexon)"
                  fillOpacity={0.2}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Emissions Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                harrier: {
                  label: "Harrier/Safari",
                  color: "hsl(var(--chart-1))",
                },
                tiago: {
                  label: "Tiago/Altroz",
                  color: "hsl(var(--chart-2))",
                },
                curvv: {
                  label: "Curvv",
                  color: "hsl(var(--chart-3))",
                },
                nexon: {
                  label: "Nexon",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emissionsComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="harrier" fill="var(--color-harrier)" />
                  <Bar dataKey="tiago" fill="var(--color-tiago)" />
                  <Bar dataKey="curvv" fill="var(--color-curvv)" />
                  <Bar dataKey="nexon" fill="var(--color-nexon)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fault Code Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                harrier: {
                  label: "Harrier/Safari",
                  color: "hsl(var(--chart-1))",
                },
                tiago: {
                  label: "Tiago/Altroz",
                  color: "hsl(var(--chart-2))",
                },
                curvv: {
                  label: "Curvv",
                  color: "hsl(var(--chart-3))",
                },
                nexon: {
                  label: "Nexon",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={faultComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="harrier" fill="var(--color-harrier)" />
                  <Bar dataKey="tiago" fill="var(--color-tiago)" />
                  <Bar dataKey="curvv" fill="var(--color-curvv)" />
                  <Bar dataKey="nexon" fill="var(--color-nexon)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

