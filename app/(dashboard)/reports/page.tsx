"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DownloadIcon, FilterIcon, PlusIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ReportsList } from "@/components/reports/reports-list"
import { ReportTemplates } from "@/components/reports/report-templates"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

type Project = {
  id: string
  name: string
  description: string
}

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<string>("")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [reportType, setReportType] = useState<string>("full")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf")
  const [isGenerating, setIsGenerating] = useState(false)
  const [includeVehicles, setIncludeVehicles] = useState(true)
  const [includeFaultCodes, setIncludeFaultCodes] = useState(true)
  const [includeReadiness, setIncludeReadiness] = useState(true)
  const [includeLiveData, setIncludeLiveData] = useState(true)
  
  useEffect(() => {
    fetchProjects()
  }, [])
  
  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const data = await response.json()
      console.log('Projects loaded:', data)
      setProjects(data)
      if (data.length > 0) {
        setProject(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format: string) => {
    setSelectedFormat(format.toLowerCase())
    setDialogOpen(true)
  }

  const handleFilter = () => {
    // Validate date inputs
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      toast({
        title: "Invalid Date Range",
        description: "The 'From' date must be earlier than the 'To' date.",
        variant: "destructive"
      })
      return
    }

    // Call the reports API with filters
    fetchFilteredReports()
    
    toast({
      title: "Filters applied",
      description: "Reports have been filtered according to your criteria.",
    })
  }

  const fetchFilteredReports = async () => {
    try {
      // Build query parameters
      const params = new URLSearchParams()
      if (project) params.append('projectId', project)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)
      if (reportType) params.append('reportType', reportType)
      
      // Make API call to get filtered reports
      const response = await fetch(`/api/reports?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch filtered reports')
      }
      
      const data = await response.json()
      console.log('Filtered reports:', data)
      
      // You can update the UI with the filtered reports here
      // For example, if you have a state for reports, you could set it:
      // setReports(data)
      
    } catch (error) {
      console.error('Error fetching filtered reports:', error)
      toast({
        title: "Error",
        description: "Failed to apply filters. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleCreateReport = () => {
    // Clear the form fields
    if (projects.length > 0) {
      setProject(projects[0].id)
    } else {
      setProject("")
    }
    setDateFrom("")
    setDateTo("")
    setReportType("full")
    setSelectedFormat("pdf")
    setIncludeVehicles(true)
    setIncludeFaultCodes(true)
    setIncludeReadiness(true)
    setIncludeLiveData(true)
    
    // Open the dialog
    setDialogOpen(true)
  }
  
  const handleGenerateReport = async () => {
    if (!project) {
      toast({
        title: "Error",
        description: "Please select a project.",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsGenerating(true)
      
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: project,
          format: selectedFormat === 'visuals' ? 'txt' : selectedFormat,
          reportType: reportType,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          includeVehicles,
          includeFaultCodes,
          includeReadiness,
          includeLiveData
        })
      })
      
      let errorData = null;
      try {
        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.error || errorData.details || 'Failed to generate report');
          } else {
            const text = await response.text();
            console.error('API Error (non-JSON):', text);
            throw new Error(`Server error (${response.status}): Please try again.`);
          }
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        throw new Error(`Server error (${response.status}): Could not process the response.`);
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Could not parse the server response. Please try again.');
      }
      
      if (!data) {
        throw new Error('No data received from server');
      }
      
      // Close the dialog
      setDialogOpen(false)
      
      // Handle different formats differently
      if (selectedFormat === 'visuals') {
        // For visuals, redirect to the export-visual endpoint
        toast({
          title: "Report Generated",
          description: "Your visual report is being prepared. It will download automatically.",
        })
        
        window.location.href = `/api/reports/export-visual/${data.id}?project=${project}`;
      } else {
        // For other formats, use the standard flow
        toast({
          title: "Report Generated",
          description: `Your ${data.format.toUpperCase()} report has been generated successfully.`,
        })
        
        // Download the report
        try {
          setTimeout(() => {
            window.location.href = data.downloadUrl
          }, 500)
        } catch (downloadError) {
          console.error('Error during download:', downloadError)
          toast({
            title: "Download Error",
            description: "The report was generated but couldn't be downloaded automatically. You can find it in the reports list.",
            variant: "destructive"
          })
        }
      }
      
    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Generate and manage OBD-II test reports</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={() => handleExport("Visuals")}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <DownloadIcon className="mr-2 h-4 w-4" /> Visuals
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => handleExport("TXT")}>
            <DownloadIcon className="mr-2 h-4 w-4" /> Export TXT
          </Button>
          <Button variant="outline" onClick={() => handleExport("PDF")}>
            <DownloadIcon className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("CSV")}>
            <DownloadIcon className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
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
                  {loading ? (
                    <SelectItem value="loading">Loading projects...</SelectItem>
                  ) : !projects || projects.length === 0 ? (
                    <SelectItem value="none">No projects available</SelectItem>
                  ) : (
                    Array.isArray(projects) ? projects.map((proj) => (
                      <SelectItem key={proj.id} value={proj.id}>
                        {proj.name}
                      </SelectItem>
                    )) : <SelectItem value="none">No projects available</SelectItem>
                  )}
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
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Report</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="emissions">Emissions</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
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

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Generated Reports</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="reports" className="space-y-4">
          <ReportsList />
        </TabsContent>
        <TabsContent value="templates" className="space-y-4">
          <ReportTemplates />
        </TabsContent>
      </Tabs>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate {selectedFormat === 'visuals' ? 'Visual' : selectedFormat.toUpperCase()} Report</DialogTitle>
            <DialogDescription>
              Select options for your report
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dialog-project">Project</Label>
                <Select value={project} onValueChange={setProject}>
                  <SelectTrigger id="dialog-project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(projects) && projects.length > 0 ? projects.map((proj) => (
                      <SelectItem key={proj.id} value={proj.id}>
                        {proj.name}
                      </SelectItem>
                    )) : <SelectItem value="none">No projects available</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dialog-report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="dialog-report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Report</SelectItem>
                    <SelectItem value="diagnostic">Diagnostic</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="emissions">Emissions</SelectItem>
                    <SelectItem value="summary">Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Include in Report</Label>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-vehicles" checked={includeVehicles} onCheckedChange={(checked) => setIncludeVehicles(checked as boolean)} />
                  <Label htmlFor="include-vehicles" className="font-normal">Vehicles</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-fault-codes" checked={includeFaultCodes} onCheckedChange={(checked) => setIncludeFaultCodes(checked as boolean)} />
                  <Label htmlFor="include-fault-codes" className="font-normal">Fault Codes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-readiness" checked={includeReadiness} onCheckedChange={(checked) => setIncludeReadiness(checked as boolean)} />
                  <Label htmlFor="include-readiness" className="font-normal">OBD Readiness</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-live-data" checked={includeLiveData} onCheckedChange={(checked) => setIncludeLiveData(checked as boolean)} />
                  <Label htmlFor="include-live-data" className="font-normal">Live Data</Label>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dialog-date-from">Date From</Label>
                <Input id="dialog-date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dialog-date-to">Date To</Label>
                <Input id="dialog-date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate & Download"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

