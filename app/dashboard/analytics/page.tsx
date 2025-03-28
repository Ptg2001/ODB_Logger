"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ChevronLeft } from 'lucide-react'
import { VehicleComparisonChart } from '@/components/charts/vehicle-comparison-chart'
import { FaultCodeAnalysis } from '@/components/charts/fault-code-analysis'
import { OBDReadinessChart } from '@/components/charts/obd-readiness-chart'
import { LiveDataDashboard } from '@/components/charts/live-data-dashboard'

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('comparison')
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [vehicleOptions, setVehicleOptions] = useState<Array<{id: string, name: string}>>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [projects, setProjects] = useState<Array<{id: string, name: string}>>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/vehicles')
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles')
        }
        
        const data = await response.json()
        setVehicleOptions(data.map((vehicle: any) => ({
          id: vehicle.id.toString(),
          name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`
        })))
        
        // Group vehicles by project to create project options
        const projectMap = new Map<string, string>()
        data.forEach((vehicle: any) => {
          if (vehicle.project_id && !projectMap.has(vehicle.project_id.toString())) {
            projectMap.set(vehicle.project_id.toString(), vehicle.project_name || `Project ${vehicle.project_id}`)
          }
        })
        
        const projectList = Array.from(projectMap.entries()).map(([id, name]) => ({ id, name }))
        setProjects(projectList)
        
        // Pre-select comparison vehicles
        if (data.length > 0) {
          const comparisonVehicleIds = data
            .slice(0, Math.min(4, data.length))
            .map((vehicle: any) => vehicle.id.toString())
          setSelectedVehicles(comparisonVehicleIds)
          
          // Pre-select first vehicle for detail views
          setSelectedVehicleId(data[0].id.toString())
          
          // Pre-select first project
          if (projectList.length > 0) {
            setSelectedProjectId(projectList[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchVehicles()
  }, [])
  
  const handleVehicleChange = (vehicleId: string) => {
    if (selectedVehicles.includes(vehicleId)) {
      setSelectedVehicles(selectedVehicles.filter(id => id !== vehicleId))
    } else {
      setSelectedVehicles([...selectedVehicles, vehicleId])
    }
  }
  
  const handleVehicleSelectChange = (value: string) => {
    setSelectedVehicleId(value)
  }
  
  const handleProjectChange = (value: string) => {
    setSelectedProjectId(value === "all" ? "" : value)
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        </div>
      </div>
      
      <Separator className="my-2" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comparison">Vehicle Comparison</TabsTrigger>
          <TabsTrigger value="fault-codes">Fault Code Analysis</TabsTrigger>
          <TabsTrigger value="readiness">OBD Readiness</TabsTrigger>
          <TabsTrigger value="live-data">Live Data & Trends</TabsTrigger>
        </TabsList>
        
        <div className="mt-4 overflow-y-auto max-h-[calc(100vh-12rem)] scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
          <TabsContent value="comparison" className="overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
            <Card>
              <CardHeader>
                <CardTitle>Compare Vehicles</CardTitle>
                <CardDescription>
                  Select up to 4 vehicles to compare their performance data
                </CardDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  {vehicleOptions.map((vehicle) => (
                    <Button
                      key={vehicle.id}
                      variant={selectedVehicles.includes(vehicle.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVehicleChange(vehicle.id)}
                    >
                      {vehicle.name}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto">
                {selectedVehicles.length > 0 ? (
                  <VehicleComparisonChart vehicleIds={selectedVehicles} />
                ) : (
                  <div className="flex items-center justify-center h-[400px] bg-muted/50 rounded-md">
                    <p className="text-muted-foreground">Select vehicles to compare</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fault-codes" className="overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
            <Card>
              <CardHeader>
                <CardTitle>Fault Code Analysis</CardTitle>
                <CardDescription>
                  Analyze fault codes across all vehicles or by project
                </CardDescription>
                <div className="w-[260px] mt-2">
                  <Label htmlFor="project-select">Filter by Project</Label>
                  <Select value={selectedProjectId} onValueChange={handleProjectChange}>
                    <SelectTrigger id="project-select">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto">
                <FaultCodeAnalysis projectId={selectedProjectId || undefined} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="readiness" className="overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
            <Card>
              <CardHeader>
                <CardTitle>OBD Readiness Status</CardTitle>
                <CardDescription>
                  View readiness monitor status for a specific vehicle
                </CardDescription>
                <div className="w-[300px] mt-2">
                  <Label htmlFor="vehicle-select-readiness">Select Vehicle</Label>
                  <Select value={selectedVehicleId} onValueChange={handleVehicleSelectChange}>
                    <SelectTrigger id="vehicle-select-readiness">
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleOptions.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto">
                {selectedVehicleId ? (
                  <OBDReadinessChart vehicleId={selectedVehicleId} />
                ) : (
                  <div className="flex items-center justify-center h-[400px] bg-muted/50 rounded-md">
                    <p className="text-muted-foreground">Select a vehicle to view readiness data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="live-data" className="overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
            <Card>
              <CardHeader>
                <CardTitle>Live Data & Trend Analysis</CardTitle>
                <CardDescription>
                  View live data and performance trends for a specific vehicle
                </CardDescription>
                <div className="w-[300px] mt-2">
                  <Label htmlFor="vehicle-select-live">Select Vehicle</Label>
                  <Select value={selectedVehicleId} onValueChange={handleVehicleSelectChange}>
                    <SelectTrigger id="vehicle-select-live">
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleOptions.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto">
                {selectedVehicleId ? (
                  <LiveDataDashboard vehicleId={selectedVehicleId} />
                ) : (
                  <div className="flex items-center justify-center h-[400px] bg-muted/50 rounded-md">
                    <p className="text-muted-foreground">Select a vehicle to view live data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
} 