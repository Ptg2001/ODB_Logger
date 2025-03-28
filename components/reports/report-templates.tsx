"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileTextIcon, PlusIcon, CopyIcon, EditIcon, TrashIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

// Mock data for report templates
const templates = [
  {
    id: "TEMP-001",
    name: "Diagnostic Report Template",
    description: "Standard template for vehicle diagnostic reports",
    type: "Diagnostic",
    lastModified: "2023-11-15",
    createdBy: "John Doe",
  },
  {
    id: "TEMP-002",
    name: "Performance Test Template",
    description: "Template for vehicle performance analysis",
    type: "Performance",
    lastModified: "2023-11-20",
    createdBy: "Jane Smith",
  },
  {
    id: "TEMP-003",
    name: "Emissions Test Template",
    description: "Standard template for emissions testing reports",
    type: "Emissions",
    lastModified: "2023-11-25",
    createdBy: "John Doe",
  },
  {
    id: "TEMP-004",
    name: "Monthly Summary Template",
    description: "Template for monthly project summaries",
    type: "Summary",
    lastModified: "2023-11-30",
    createdBy: "Jane Smith",
  },
  {
    id: "TEMP-005",
    name: "Quarterly Report Template",
    description: "Comprehensive quarterly report template",
    type: "Summary",
    lastModified: "2023-12-01",
    createdBy: "John Doe",
  },
  {
    id: "TEMP-006",
    name: "Custom Diagnostic Template",
    description: "Customized template for specific diagnostic tests",
    type: "Diagnostic",
    lastModified: "2023-12-05",
    createdBy: "Jane Smith",
  },
]

export function ReportTemplates() {
  const [templatesList, setTemplatesList] = useState(templates)

  const handleCreateTemplate = () => {
    toast({
      title: "Create new template",
      description: "Opening template creation wizard...",
    })
  }

  const handleDuplicate = (id: string) => {
    const template = templatesList.find((t) => t.id === id)
    if (template) {
      const newTemplate = {
        ...template,
        id: `TEMP-${String(templatesList.length + 1).padStart(3, "0")}`,
        name: `${template.name} (Copy)`,
        lastModified: new Date().toISOString().split("T")[0],
      }
      setTemplatesList([...templatesList, newTemplate])
      toast({
        title: "Template duplicated",
        description: `Created a copy of template ${id}.`,
      })
    }
  }

  const handleEdit = (id: string) => {
    toast({
      title: "Edit template",
      description: `Opening template ${id} for editing...`,
    })
  }

  const handleDelete = (id: string) => {
    setTemplatesList(templatesList.filter((template) => template.id !== id))
    toast({
      title: "Template deleted",
      description: `Template ${id} has been deleted.`,
    })
  }

  const handleUse = (id: string) => {
    const template = templatesList.find(t => t.id === id)
    if (template) {
      // Open dialog to select project and format
      toast({
        title: "Using template",
        description: `Creating a new report using the ${template.name} template...`,
      })
      
      // In a real application, this would open a dialog to select a project
      // For now, we'll simulate this by opening an alert
      alert(`In a real application, this would open a dialog to:
1. Select a project to run this report on
2. Choose export format (PDF, Excel, CSV)
3. Set date ranges and other parameters

The API is already implemented at:
POST /api/reports/generate

With template type: ${template.type}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreateTemplate}>
          <PlusIcon className="mr-2 h-4 w-4" /> Create Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templatesList.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <FileTextIcon className="mr-2 h-5 w-5" />
                    {template.name}
                  </CardTitle>
                  <Badge
                    className="mt-2"
                    variant={
                      template.type === "Diagnostic"
                        ? "default"
                        : template.type === "Performance"
                          ? "secondary"
                          : template.type === "Emissions"
                            ? "outline"
                            : "success"
                    }
                  >
                    {template.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">{template.description}</p>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Last modified: {template.lastModified}</p>
                <p>Created by: {template.createdBy}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <Button variant="outline" size="sm" onClick={() => handleUse(template.id)}>
                Use Template
              </Button>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => handleDuplicate(template.id)}>
                  <CopyIcon className="h-4 w-4" />
                  <span className="sr-only">Duplicate</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(template.id)}>
                  <EditIcon className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}>
                  <TrashIcon className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

