"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DownloadIcon, FilterIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { HistoricalTable } from "@/components/historical-data/historical-table"
import { HistoricalCharts } from "@/components/historical-data/historical-charts"

export default function HistoricalDataPage() {
  const [project, setProject] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [testType, setTestType] = useState<string>("all")

  const handleExport = (format: string) => {
    toast({
      title: "Export initiated",
      description: `Exporting historical data as ${format}...`,
    })
  }

  const handleFilter = () => {
    toast({
      title: "Filters applied",
      description: "Historical data has been filtered according to your criteria.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Historical Data</h2>
          <p className="text-muted-foreground">View and analyze past OBD-II test results</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => handleExport("PDF")}>
            <DownloadIcon className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("Excel")}>
            <DownloadIcon className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport("CSV")}>
            <DownloadIcon className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="harrier-safari">Harrier/Safari</SelectItem>
                  <SelectItem value="tiago-altroz">Tiago/Altroz</SelectItem>
                  <SelectItem value="curvv">Curvv</SelectItem>
                  <SelectItem value="nexon">Nexon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-from">Date From</Label>
              <Input id="date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">Date To</Label>
              <Input id="date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-type">Test Type</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger id="test-type">
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="emissions">Emissions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleFilter}>
              <FilterIcon className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="charts">Charts View</TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="space-y-4">
          <HistoricalTable />
        </TabsContent>
        <TabsContent value="charts" className="space-y-4">
          <HistoricalCharts />
        </TabsContent>
      </Tabs>
    </div>
  )
}

