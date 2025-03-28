"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { VisualReport } from "@/components/reports/visual-report"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VisualReportPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const reportId = params.reportId as string
  const [projectId, setProjectId] = useState<string>("")
  const [reportName, setReportName] = useState<string>("")
  const [isPdfMode, setIsPdfMode] = useState(false)
  
  useEffect(() => {
    // Check if this is for PDF generation
    setIsPdfMode(searchParams.has('pdf'))
    
    // Get project ID from query params if available
    const projectFromParams = searchParams.get('project')
    if (projectFromParams) {
      setProjectId(projectFromParams)
    }
    
    // Fetch report metadata
    const fetchReportData = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}`)
        if (response.ok) {
          const data = await response.json()
          // Only set project ID if not already set from URL params
          if (!projectFromParams) {
            setProjectId(data.project_id)
          }
          setReportName(data.name)
        }
      } catch (error) {
        console.error("Error fetching report data:", error)
      }
    }
    
    if (reportId) {
      fetchReportData()
    }
  }, [reportId, searchParams])
  
  // For PDF generation, we use a cleaner layout without navigation
  if (isPdfMode) {
    return (
      <div className="container mx-auto py-6 px-4">
        {reportId && projectId && (
          <VisualReport reportId={reportId} projectId={projectId} isPdfMode={true} />
        )}
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Visual Report: {reportName || reportId}
        </h1>
      </div>
      
      {reportId && projectId && (
        <VisualReport reportId={reportId} projectId={projectId} />
      )}
    </div>
  )
} 