"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for emissions analytics
const emissionsData = [
  { rpm: 1000, co: 0.5, hc: 50, nox: 100 },
  { rpm: 1500, co: 0.6, hc: 55, nox: 120 },
  { rpm: 2000, co: 0.7, hc: 60, nox: 150 },
  { rpm: 2500, co: 0.8, hc: 70, nox: 180 },
  { rpm: 3000, co: 0.9, hc: 80, nox: 220 },
  { rpm: 3500, co: 1.0, hc: 90, nox: 250 },
  { rpm: 4000, co: 1.1, hc: 100, nox: 280 },
  { rpm: 4500, co: 1.2, hc: 110, nox: 300 },
  { rpm: 5000, co: 1.3, hc: 120, nox: 320 },
]

const emissionsTrendData = [
  { month: "Jan", co: 0.7, hc: 70, nox: 180 },
  { month: "Feb", co: 0.8, hc: 75, nox: 190 },
  { month: "Mar", co: 0.7, hc: 72, nox: 185 },
  { month: "Apr", co: 0.9, hc: 80, nox: 200 },
  { month: "May", co: 0.8, hc: 78, nox: 195 },
  { month: "Jun", co: 0.7, hc: 75, nox: 190 },
  { month: "Jul", co: 0.8, hc: 77, nox: 195 },
  { month: "Aug", co: 0.9, hc: 82, nox: 205 },
  { month: "Sep", co: 0.8, hc: 80, nox: 200 },
  { month: "Oct", co: 0.7, hc: 75, nox: 190 },
  { month: "Nov", co: 0.8, hc: 78, nox: 195 },
  { month: "Dec", co: 0.7, hc: 74, nox: 185 },
]

const complianceData = [
  { standard: "BS-III", co: 2.3, hc: 200, nox: 150, actual_co: 0.8, actual_hc: 80, actual_nox: 120 },
  { standard: "BS-IV", co: 1.5, hc: 100, nox: 80, actual_co: 0.7, actual_hc: 75, actual_nox: 70 },
  { standard: "BS-VI", co: 1.0, hc: 60, nox: 60, actual_co: 0.6, actual_hc: 50, actual_nox: 50 },
]

export function EmissionsAnalytics() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Emissions vs RPM</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              co: {
                label: "CO (%)",
                color: "hsl(var(--chart-1))",
              },
              hc: {
                label: "HC (ppm)",
                color: "hsl(var(--chart-2))",
              },
              nox: {
                label: "NOx (ppm)",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={emissionsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="rpm" label={{ value: "RPM", position: "insideBottom", offset: -5 }} />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <YAxis yAxisId="right2" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="co" stroke="var(--color-co)" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="hc" stroke="var(--color-hc)" activeDot={{ r: 8 }} />
                <Line yAxisId="right2" type="monotone" dataKey="nox" stroke="var(--color-nox)" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Emissions Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                co: {
                  label: "CO (%)",
                  color: "hsl(var(--chart-1))",
                },
                hc: {
                  label: "HC (ppm)",
                  color: "hsl(var(--chart-2))",
                },
                nox: {
                  label: "NOx (ppm)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={emissionsTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <YAxis yAxisId="right2" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="co" stroke="var(--color-co)" />
                  <Line yAxisId="right" type="monotone" dataKey="hc" stroke="var(--color-hc)" />
                  <Line yAxisId="right2" type="monotone" dataKey="nox" stroke="var(--color-nox)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emissions Standards Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                co: {
                  label: "CO Limit (%)",
                  color: "hsl(var(--chart-1))",
                },
                actual_co: {
                  label: "Actual CO (%)",
                  color: "hsl(var(--chart-4))",
                },
                hc: {
                  label: "HC Limit (ppm)",
                  color: "hsl(var(--chart-2))",
                },
                actual_hc: {
                  label: "Actual HC (ppm)",
                  color: "hsl(var(--chart-5))",
                },
                nox: {
                  label: "NOx Limit (ppm)",
                  color: "hsl(var(--chart-3))",
                },
                actual_nox: {
                  label: "Actual NOx (ppm)",
                  color: "hsl(var(--chart-6))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="standard" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="co" fill="var(--color-co)" />
                  <Bar dataKey="actual_co" fill="var(--color-actual_co)" />
                  <Bar dataKey="hc" fill="var(--color-hc)" />
                  <Bar dataKey="actual_hc" fill="var(--color-actual_hc)" />
                  <Bar dataKey="nox" fill="var(--color-nox)" />
                  <Bar dataKey="actual_nox" fill="var(--color-actual_nox)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

