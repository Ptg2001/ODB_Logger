"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DownloadIcon,
  FileIcon,
  MoreHorizontalIcon,
  EyeIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

// Mock data for historical tests
const historicalTests = [
  {
    id: "TEST-001",
    project: "Harrier/Safari",
    date: "2023-12-01",
    type: "Diagnostic",
    status: "Completed",
    faults: 0,
    duration: "00:15:32",
  },
  {
    id: "TEST-002",
    project: "Tiago/Altroz",
    date: "2023-12-02",
    type: "Performance",
    status: "Completed",
    faults: 2,
    duration: "00:22:15",
  },
  {
    id: "TEST-003",
    project: "Curvv",
    date: "2023-12-03",
    type: "Emissions",
    status: "Completed",
    faults: 1,
    duration: "00:18:45",
  },
  {
    id: "TEST-004",
    project: "Nexon",
    date: "2023-12-04",
    type: "Diagnostic",
    status: "Completed",
    faults: 0,
    duration: "00:12:30",
  },
  {
    id: "TEST-005",
    project: "Harrier/Safari",
    date: "2023-12-05",
    type: "Performance",
    status: "Failed",
    faults: 5,
    duration: "00:08:22",
  },
  {
    id: "TEST-006",
    project: "Tiago/Altroz",
    date: "2023-12-06",
    type: "Diagnostic",
    status: "Completed",
    faults: 1,
    duration: "00:14:18",
  },
  {
    id: "TEST-007",
    project: "Nexon",
    date: "2023-12-07",
    type: "Emissions",
    status: "Completed",
    faults: 0,
    duration: "00:20:05",
  },
  {
    id: "TEST-008",
    project: "Curvv",
    date: "2023-12-08",
    type: "Performance",
    status: "Completed",
    faults: 2,
    duration: "00:25:40",
  },
  {
    id: "TEST-009",
    project: "Harrier/Safari",
    date: "2023-12-09",
    type: "Diagnostic",
    status: "Failed",
    faults: 3,
    duration: "00:10:15",
  },
  {
    id: "TEST-010",
    project: "Tiago/Altroz",
    date: "2023-12-10",
    type: "Emissions",
    status: "Completed",
    faults: 1,
    duration: "00:16:50",
  },
]

export function HistoricalTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [tests, setTests] = useState(historicalTests)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const handleExport = (id: string, format: string) => {
    toast({
      title: "Export initiated",
      description: `Exporting test ${id} as ${format}...`,
    })
  }

  const handleDelete = (id: string) => {
    setTests(tests.filter((test) => test.id !== id))
    toast({
      title: "Test deleted",
      description: `Test ${id} has been deleted.`,
    })
  }

  const handleView = (id: string) => {
    toast({
      title: "Viewing test details",
      description: `Opening test ${id} details...`,
    })
  }

  const filteredTests = tests.filter(
    (test) =>
      test.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage)
  const currentTests = filteredTests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Test Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Faults</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>{test.id}</TableCell>
                  <TableCell>{test.project}</TableCell>
                  <TableCell>{test.date}</TableCell>
                  <TableCell>{test.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        test.status === "Completed"
                          ? "success"
                          : test.status === "In Progress"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {test.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{test.faults}</TableCell>
                  <TableCell>{test.duration}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(test.id)}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(test.id, "PDF")}>
                          <DownloadIcon className="mr-2 h-4 w-4" />
                          Export as PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(test.id, "Excel")}>
                          <FileIcon className="mr-2 h-4 w-4" />
                          Export as Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(test.id, "CSV")}>
                          <FileIcon className="mr-2 h-4 w-4" />
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(test.id)}>
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

