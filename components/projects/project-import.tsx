"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import {
  FileIcon,
  UploadIcon,
  FileSpreadsheetIcon,
  FileIcon as FilePdfIcon,
  FileTextIcon,
  DownloadIcon,
} from "lucide-react"

export function ProjectImport() {
  const [file, setFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<string>("csv")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to upload",
      })
      return
    }

    setUploading(true)
    setProgress(0)

    // Create a FormData object to send the file
    const formData = new FormData()
    formData.append("file", file)
    formData.append("fileType", fileType)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 5
        })
      }, 200)

      // Send the file to the server
      const response = await fetch("/api/projects/import", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to import projects")
      }

      const data = await response.json()

      toast({
        title: "Import successful",
        description: `Successfully imported ${data.count} projects`,
      })

      // Reset the form
      setFile(null)
      setProgress(0)

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Error importing projects:", error)
      toast({
        variant: "destructive",
        title: "Import failed",
        description: error instanceof Error ? error.message : "An error occurred during import",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadTemplate = () => {
    window.location.href = "/api/projects/template"
  }

  const getFileIcon = () => {
    switch (fileType) {
      case "csv":
        return <FileTextIcon className="h-8 w-8 text-blue-500" />
      case "excel":
        return <FileSpreadsheetIcon className="h-8 w-8 text-green-500" />
      case "pdf":
        return <FilePdfIcon className="h-8 w-8 text-red-500" />
      default:
        return <FileIcon className="h-8 w-8 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Projects</CardTitle>
        <CardDescription>
          Import projects from CSV, Excel, or PDF files. The data will be analyzed and stored in the database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-type">File Type</Label>
          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger id="file-type">
              <SelectValue placeholder="Select file type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload">Upload File</Label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed">
              {file ? getFileIcon() : <UploadIcon className="h-8 w-8 text-muted-foreground" />}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                id="file-upload"
                type="file"
                accept={
                  fileType === "csv" ? ".csv" : fileType === "excel" ? ".xlsx,.xls" : fileType === "pdf" ? ".pdf" : ""
                }
                onChange={handleFileChange}
                disabled={uploading}
              />
              {file && <p className="text-sm text-muted-foreground">{file.name}</p>}
            </div>
          </div>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="flex items-center gap-1">
            <DownloadIcon className="h-4 w-4" />
            Download Template
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">
            Download a sample CSV template to see the required format.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? "Importing..." : "Import Projects"}
        </Button>
      </CardFooter>
    </Card>
  )
}

