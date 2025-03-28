"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, UploadIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ProjectsList } from "@/components/projects/projects-list"
import { ProjectsGrid } from "@/components/projects/projects-grid"
import { ProjectImport } from "@/components/projects/project-import"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProjectAnalysis } from "@/components/projects/project-analysis"

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [importOpen, setImportOpen] = useState(false)

  const handleCreateProject = () => {
    toast({
      title: "Create new project",
      description: "Opening project creation wizard...",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage vehicle projects and their OBD-II test data</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={handleCreateProject}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create Project
          </Button>
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UploadIcon className="mr-2 h-4 w-4" /> Import Projects
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Import Projects</DialogTitle>
                <DialogDescription>Import projects from CSV, Excel, or PDF files.</DialogDescription>
              </DialogHeader>
              <ProjectImport />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="grid" className="space-y-4">
          <ProjectsGrid searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="list" className="space-y-4">
          <ProjectsList searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="analysis" className="space-y-4">
          <ProjectAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  )
}

