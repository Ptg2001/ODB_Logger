"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontalIcon, EyeIcon, EditIcon, TrashIcon, BarChart3Icon, FileTextIcon, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

// Project type definition
type Project = {
  id: string
  name: string
  description: string
  status: string
  testsCount: number
  lastTest: string
  createdDate: string
  manager: string
}

export function ProjectsList({ searchTerm = "" }: { searchTerm?: string }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        const response = await fetch('/api/projects')
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }
        
        const data = await response.json()
        setProjects(data)
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError('Failed to load projects. Please try again later.')
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load projects",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
  }, [])

  const handleViewProject = (id: string) => {
    toast({
      title: "View project",
      description: `Opening project ${id} details...`,
    })
  }

  const handleEditProject = (id: string) => {
    toast({
      title: "Edit project",
      description: `Opening project ${id} for editing...`,
    })
  }

  const handleDeleteProject = async (id: string) => {
    try {
      // In a real app, this would be an API call to delete the project
      // For now, just update the UI
      setProjects(projects.filter((project) => project.id !== id))
      toast({
        title: "Project deleted",
        description: `Project ${id} has been deleted.`,
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete project",
      })
    }
  }

  const handleViewReports = (id: string) => {
    toast({
      title: "View reports",
      description: `Opening reports for project ${id}...`,
    })
  }

  const handleViewAnalytics = (id: string) => {
    toast({
      title: "View analytics",
      description: `Opening analytics for project ${id}...`,
    })
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>Loading projects...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-500">
          {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Last Test</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.id}</TableCell>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.description}</TableCell>
                    <TableCell>
                      <Badge variant={project.status === "Active" ? "success" : "secondary"}>{project.status}</Badge>
                    </TableCell>
                    <TableCell>{project.testsCount}</TableCell>
                    <TableCell>{project.lastTest}</TableCell>
                    <TableCell>{project.createdDate}</TableCell>
                    <TableCell>{project.manager}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProject(project.id)}>
                            <EyeIcon className="mr-2 h-4 w-4" />
                            View Project
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewReports(project.id)}>
                            <FileTextIcon className="mr-2 h-4 w-4" />
                            View Reports
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewAnalytics(project.id)}>
                            <BarChart3Icon className="mr-2 h-4 w-4" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProject(project.id)}>
                            <EditIcon className="mr-2 h-4 w-4" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteProject(project.id)}>
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

