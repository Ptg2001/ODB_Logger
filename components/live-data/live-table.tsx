"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Interface for the component props
type LiveDataType = {
  rpm: number
  speed: number
  engineTemp: number
  batteryVoltage: string
  fuelPressure: number
  o2Voltage: string
  intakePressure: number
  engineLoad: number
  fuelLevel: number
  throttlePosition: number
  maf: string
}

type LiveTableProps = {
  liveData?: LiveDataType
}

// Default OBD parameters when no live data is provided
const defaultObdParameters = [
  { pid: "0104", name: "Engine Load", value: "42%", unit: "%", description: "Calculated engine load value" },
  { pid: "010C", name: "Engine RPM", value: "2450", unit: "rpm", description: "Engine speed" },
  { pid: "010D", name: "Vehicle Speed", value: "65", unit: "km/h", description: "Vehicle speed" },
  { pid: "010E", name: "Timing Advance", value: "8.5", unit: "°", description: "Ignition timing advance" },
  { pid: "0110", name: "MAF Air Flow", value: "15.2", unit: "g/s", description: "Mass air flow sensor" },
  { pid: "0111", name: "Throttle Position", value: "35", unit: "%", description: "Absolute throttle position" },
  { pid: "011F", name: "Run Time", value: "1250", unit: "s", description: "Time since engine start" },
  { pid: "0121", name: "Distance with MIL", value: "0", unit: "km", description: "Distance traveled with MIL on" },
  { pid: "0142", name: "Control Module Voltage", value: "12.7", unit: "V", description: "Control module voltage" },
  { pid: "0146", name: "Ambient Air Temperature", value: "22", unit: "°C", description: "Ambient air temperature" },
  { pid: "015C", name: "Engine Oil Temperature", value: "95", unit: "°C", description: "Engine oil temperature" },
  { pid: "0105", name: "Coolant Temperature", value: "92", unit: "°C", description: "Engine coolant temperature" },
  { pid: "010A", name: "Fuel Pressure", value: "350", unit: "kPa", description: "Fuel pressure" },
  { pid: "012F", name: "Fuel Level", value: "30", unit: "%", description: "Fuel tank level input" },
  { pid: "0133", name: "Barometric Pressure", value: "101", unit: "kPa", description: "Barometric pressure" },
  { pid: "010B", name: "Intake Manifold Pressure", value: "95", unit: "kPa", description: "Intake manifold absolute pressure" },
  { pid: "0134", name: "O2 Sensor 1 Voltage", value: "0.85", unit: "V", description: "O2 Sensor 1 voltage" },
  { pid: "0144", name: "Fuel/Air Commanded Ratio", value: "14.7", unit: "ratio", description: "Commanded fuel-air equivalence ratio" },
  { pid: "013C", name: "Catalyst Temperature", value: "420", unit: "°C", description: "Catalyst temperature" },
  { pid: "0143", name: "Absolute Load Value", value: "38", unit: "%", description: "Absolute load value" },
  { pid: "015D", name: "Fuel Injection Timing", value: "10.5", unit: "°", description: "Fuel injection timing" },
  { pid: "0149", name: "Accelerator Position", value: "32", unit: "%", description: "Accelerator pedal position" },
  { pid: "014F", name: "Maximum Values", value: "95", unit: "%", description: "Maximum values for oxygen sensors" },
]

export function LiveTable({ liveData }: LiveTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [obdParameters, setObdParameters] = useState(defaultObdParameters)
  
  // Update OBD parameters when live data changes
  useEffect(() => {
    if (liveData) {
      // Create updated parameter list with live data
      const updatedParameters = [...defaultObdParameters]
      
      // Find and update the values for parameters we have live data for
      updatedParameters.forEach((param, index) => {
        if (param.name === "Engine Load" && liveData.engineLoad !== undefined) {
          updatedParameters[index] = { ...param, value: `${liveData.engineLoad}%` }
        } else if (param.name === "Engine RPM" && liveData.rpm !== undefined) {
          updatedParameters[index] = { ...param, value: liveData.rpm.toString() }
        } else if (param.name === "Vehicle Speed" && liveData.speed !== undefined) {
          updatedParameters[index] = { ...param, value: liveData.speed.toString() }
        } else if (param.name === "Throttle Position" && liveData.throttlePosition !== undefined) {
          updatedParameters[index] = { ...param, value: `${liveData.throttlePosition}%` }
        } else if (param.name === "MAF Air Flow" && liveData.maf !== undefined) {
          updatedParameters[index] = { ...param, value: liveData.maf }
        } else if (param.name === "Coolant Temperature" && liveData.engineTemp !== undefined) {
          updatedParameters[index] = { ...param, value: liveData.engineTemp.toString() }
        } else if (param.name === "Fuel Pressure" && liveData.fuelPressure !== undefined) {
          updatedParameters[index] = { ...param, value: liveData.fuelPressure.toString() }
        } else if (param.name === "Fuel Level" && liveData.fuelLevel !== undefined) {
          updatedParameters[index] = { ...param, value: `${liveData.fuelLevel}%` }
        } else if (param.name === "Intake Manifold Pressure" && liveData.intakePressure !== undefined) {
          updatedParameters[index] = { ...param, value: liveData.intakePressure.toString() }
        } else if (param.name === "O2 Sensor 1 Voltage" && liveData.o2Voltage !== undefined) {
          updatedParameters[index] = { ...param, value: liveData.o2Voltage }
        } else if (param.name === "Control Module Voltage" && liveData.batteryVoltage !== undefined) {
          updatedParameters[index] = { ...param, value: liveData.batteryVoltage }
        }
      })
      
      setObdParameters(updatedParameters)
    }
  }, [liveData])
  
  // Listen for global update events (alternative approach)
  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      const newData = event.detail
      if (newData && !liveData) {
        // Only use events if props aren't provided
        // Update parameters with the new data
      }
    }
    
    window.addEventListener('obd-data-update', handleDataUpdate as EventListener)
    return () => {
      window.removeEventListener('obd-data-update', handleDataUpdate as EventListener)
    }
  }, [liveData])

  const filteredParameters = obdParameters.filter(
    (param) =>
      param.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      param.pid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      param.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>OBD-II Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search parameters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PID</TableHead>
                <TableHead>Parameter</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParameters.map((param) => (
                <TableRow key={param.pid}>
                  <TableCell className="font-mono">{param.pid}</TableCell>
                  <TableCell>{param.name}</TableCell>
                  <TableCell>{param.value}</TableCell>
                  <TableCell>{param.unit}</TableCell>
                  <TableCell className="hidden md:table-cell">{param.description}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        (param.name === "Coolant Temperature" && parseInt(param.value) > 90) || 
                        (param.name === "Engine Oil Temperature" && parseInt(param.value) > 100) || 
                        (param.name === "Catalyst Temperature" && parseInt(param.value) > 450)
                          ? "destructive" 
                          : "default"
                      }
                      className="rounded-sm px-1 font-normal"
                    >
                      {(param.name === "Coolant Temperature" && parseInt(param.value) > 90) || 
                       (param.name === "Engine Oil Temperature" && parseInt(param.value) > 100) || 
                       (param.name === "Catalyst Temperature" && parseInt(param.value) > 450)
                        ? "Warning" 
                        : "Normal"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

