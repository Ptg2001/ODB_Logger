"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontalIcon, EyeIcon, EditIcon, TrashIcon, BarChart3Icon, FileTextIcon, CarIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

// Mock data for projects
const projects = [
  {
    id: "PROJ-001",
    name: "Harrier/Safari",
    description: "Tata Harrier and Safari SUV models",
    status: "Active",
    testsCount: 45,
    lastTest: "2023-12-10",
    createdDate: "2023-01-15",
    manager: "John Doe",
  },
  {
    id: "PROJ-002",
    name: "Tiago/Altroz",
    description: "Tata Tiago and Altroz hatchback models",
    status: "Active",
    testsCount: 38,
    lastTest: "2023-12-08",
    createdDate: "2023-02-20",
    manager: "Jane Smith",
  },
  {
    id: "PROJ-003",
    name: "Curvv",
    description: "Tata Curvv SUV coupe model",
    status: "Active",
    testsCount: 22,
    lastTest: "2023-12-05",
    createdDate: "2023-05-10",
    manager: "John Doe",
  },
  {
    id: "PROJ-004",
    name: "Nexon",
    description: "Tata Nexon compact SUV model",
    status: "Active",
    testsCount: 42,
    lastTest: "2023-12-09",
    createdDate: "2023-03-05",
    manager: "Jane Smith",
  },
  {
    id: "PROJ-005",
    name: "Punch",
    description: "Tata Punch micro SUV model",
    status: "Inactive",
    testsCount: 15,
    lastTest: "2023-11-20",
    createdDate: "2023-06-15",
    manager: "John Doe",
  },
  {
    id: "PROJ-006",
    name: "Tigor",
    description: "Tata Tigor compact sedan model",
    status: "Inactive",
    testsCount: 12,
    lastTest: "2023-11-15",
    createdDate: "2023-07-10",
    manager: "Jane Smith",
  },
]

export function ProjectsGrid({ searchTerm = "" }: { searchTerm?: string }) {
  const [projectsList, setProjectsList] = useState(projects)

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

  const handleDeleteProject = (id: string) => {
    setProjectsList(projectsList.filter((project) => project.id !== id))
    toast({
      title: "Project deleted",
      description: `Project ${id} has been deleted.`,
    })
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

  const filteredProjects = projectsList.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredProjects.map((project) => (
        <Card key={project.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <CarIcon className="mr-2 h-5 w-5" />
                  {project.name}
                </CardTitle>
                <Badge className="mt-2" variant={project.status === "Active" ? "success" : "secondary"}>
                  {project.status}
                </Badge>
              </div>
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
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">{project.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Tests:</p>
                <p className="font-medium">{project.testsCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Test:</p>
                <p className="font-medium">{project.lastTest}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created:</p>
                <p className="font-medium">{project.createdDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Manager:</p>
                <p className="font-medium">{project.manager}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="outline" size="sm" onClick={() => handleViewProject(project.id)}>
              View Details
            </Button>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => handleViewReports(project.id)}>
                <FileTextIcon className="h-4 w-4" />
                <span className="sr-only">Reports</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleViewAnalytics(project.id)}>
                <BarChart3Icon className="h-4 w-4" />
                <span className="sr-only">Analytics</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

