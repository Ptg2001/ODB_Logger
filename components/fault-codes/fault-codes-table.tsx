"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontalIcon, EyeIcon, BookOpenIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

// Mock data for fault codes
const faultCodes = [
  {
    id: "P0300",
    description: "Random/Multiple Cylinder Misfire Detected",
    severity: "Critical",
    system: "Engine",
    status: "Active",
    firstSeen: "2023-12-01",
    lastSeen: "2023-12-10",
    occurrences: 5,
  },
  {
    id: "P0171",
    description: "System Too Lean (Bank 1)",
    severity: "Warning",
    system: "Fuel System",
    status: "Active",
    firstSeen: "2023-12-03",
    lastSeen: "2023-12-10",
    occurrences: 3,
  },
  {
    id: "P0420",
    description: "Catalyst System Efficiency Below Threshold (Bank 1)",
    severity: "Warning",
    system: "Emissions",
    status: "Active",
    firstSeen: "2023-12-05",
    lastSeen: "2023-12-10",
    occurrences: 2,
  },
  {
    id: "P0455",
    description: "Evaporative Emission System Leak Detected (Gross Leak)",
    severity: "Info",
    system: "Emissions",
    status: "Inactive",
    firstSeen: "2023-11-15",
    lastSeen: "2023-11-20",
    occurrences: 1,
  },
  {
    id: "P0102",
    description: "Mass or Volume Air Flow Circuit Low Input",
    severity: "Warning",
    system: "Air Intake",
    status: "Inactive",
    firstSeen: "2023-11-10",
    lastSeen: "2023-11-12",
    occurrences: 2,
  },
  {
    id: "P0401",
    description: "Exhaust Gas Recirculation Flow Insufficient Detected",
    severity: "Warning",
    system: "Emissions",
    status: "Inactive",
    firstSeen: "2023-10-25",
    lastSeen: "2023-10-28",
    occurrences: 3,
  },
  {
    id: "P0440",
    description: "Evaporative Emission Control System Malfunction",
    severity: "Info",
    system: "Emissions",
    status: "Inactive",
    firstSeen: "2023-10-15",
    lastSeen: "2023-10-16",
    occurrences: 1,
  },
  {
    id: "P0700",
    description: "Transmission Control System Malfunction",
    severity: "Critical",
    system: "Transmission",
    status: "Inactive",
    firstSeen: "2023-09-20",
    lastSeen: "2023-09-25",
    occurrences: 4,
  },
]

export function FaultCodesTable({
  searchTerm = "",
  activeOnly = false,
}: {
  searchTerm?: string
  activeOnly?: boolean
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const handleViewDetails = (id: string) => {
    toast({
      title: "Viewing fault code details",
      description: `Opening details for fault code ${id}...`,
    })
  }

  const handleLookupCode = (id: string) => {
    toast({
      title: "Looking up fault code",
      description: `Searching for more information about ${id}...`,
    })
  }

  const filteredCodes = faultCodes.filter(
    (code) =>
      (code.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.system.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!activeOnly || code.status === "Active"),
  )

  const totalPages = Math.ceil(filteredCodes.length / itemsPerPage)
  const currentCodes = filteredCodes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>First Seen</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Occurrences</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCodes.length > 0 ? (
                currentCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono font-medium">{code.id}</TableCell>
                    <TableCell>{code.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          code.severity === "Critical"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {code.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{code.system}</TableCell>
                    <TableCell>
                      <Badge variant={code.status === "Active" ? "destructive" : "outline"}>{code.status}</Badge>
                    </TableCell>
                    <TableCell>{code.firstSeen}</TableCell>
                    <TableCell>{code.lastSeen}</TableCell>
                    <TableCell>{code.occurrences}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(code.id)}>
                            <EyeIcon className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleLookupCode(code.id)}>
                            <BookOpenIcon className="mr-2 h-4 w-4" />
                            Lookup Code
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No fault codes found.
                  </TableCell>
                </TableRow>
              )}
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

