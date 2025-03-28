"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DownloadIcon, AlertTriangleIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { FaultCodesTable } from "@/components/fault-codes/fault-codes-table"
import { FaultCodesSummary } from "@/components/fault-codes/fault-codes-summary"
import { DashboardPage } from "@/components/layouts/dashboard-page"

export default function FaultCodesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const handleExport = (format: string) => {
    toast({
      title: "Export initiated",
      description: `Exporting fault codes as ${format}...`,
    })
  }

  return (
    <DashboardPage title="Fault Codes" subtitle="View and analyze OBD-II diagnostic trouble codes">
      <div className="px-4 sm:px-6 md:px-8 space-y-6 w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <AlertTriangleIcon className="mr-2 h-5 w-5 text-destructive" />
            <h3 className="text-lg font-medium">Active Diagnostic Codes</h3>
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
          <CardContent className="pt-6">
            <div className="mb-4">
              <Input
                placeholder="Search fault codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="active" className="space-y-4 w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="active">Active Codes</TabsTrigger>
            <TabsTrigger value="history">Code History</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            <div className="w-full">
              <FaultCodesTable searchTerm={searchTerm} activeOnly={true} />
            </div>
          </TabsContent>
          <TabsContent value="history" className="space-y-4">
            <div className="w-full">
              <FaultCodesTable searchTerm={searchTerm} activeOnly={false} />
            </div>
          </TabsContent>
          <TabsContent value="summary" className="space-y-4">
            <div className="w-full">
              <FaultCodesSummary />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPage>
  )
}

