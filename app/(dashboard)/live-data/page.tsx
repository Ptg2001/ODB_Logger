"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, PlayIcon, MonitorStopIcon as StopIcon, DownloadIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { LiveGauges } from "@/components/live-data/live-gauges"
import { LiveCharts } from "@/components/live-data/live-charts"
import { LiveTable } from "@/components/live-data/live-table"
import { DashboardPage } from "@/components/layouts/dashboard-page"

// Mock function to simulate getting live OBD-II data
function generateRandomData() {
  return {
    rpm: Math.floor(1500 + Math.random() * 2000),
    speed: Math.floor(45 + Math.random() * 40),
    engineTemp: Math.floor(85 + Math.random() * 15),
    batteryVoltage: (12.0 + Math.random() * 1.2).toFixed(1),
    fuelPressure: Math.floor(300 + Math.random() * 100),
    o2Voltage: (0.8 + Math.random() * 0.1).toFixed(2),
    intakePressure: Math.floor(90 + Math.random() * 15),
    engineLoad: Math.floor(35 + Math.random() * 20),
    fuelLevel: Math.floor(25 + Math.random() * 5),
    throttlePosition: Math.floor(30 + Math.random() * 15),
    maf: (14.5 + Math.random() * 1.5).toFixed(1),
  }
}

export default function LiveDataPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [liveData, setLiveData] = useState(generateRandomData())
  const [recordedData, setRecordedData] = useState<Array<any>>([])
  const updateIntervalRef = useRef<number | null>(null)
  const recordingIntervalRef = useRef<number | null>(null)

  // Function to update live data
  const updateLiveData = () => {
    setLiveData(generateRandomData())
  }

  // Handle OBD-II connection/disconnection
  const handleConnect = () => {
    if (isConnected) {
      // Clean up intervals when disconnecting
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
        updateIntervalRef.current = null
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
      setIsRecording(false)
      setIsConnected(false)
      toast({
        title: "Disconnected",
        description: "OBD-II connection closed",
      })
    } else {
      // Set up data update interval when connecting
      setIsConnected(true)
      updateIntervalRef.current = window.setInterval(updateLiveData, 500) // Update every 500ms
      toast({
        title: "Connected",
        description: "OBD-II connection established",
      })
    }
  }

  // Handle recording start/stop
  const handleRecord = () => {
    if (isRecording) {
      // Stop recording
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
      setIsRecording(false)
      toast({
        title: "Recording stopped",
        description: `Recorded ${recordedData.length} data points`,
      })
    } else {
      // Start recording
      setIsRecording(true)
      setRecordedData([]) // Reset recorded data
      recordingIntervalRef.current = window.setInterval(() => {
        const timestamp = new Date().toISOString()
        setRecordedData(prev => [...prev, { ...liveData, timestamp }])
      }, 1000) // Record every second
      toast({
        title: "Recording started",
        description: "Data recording has been started",
      })
    }
  }

  // Handle data export
  const handleExport = (format: string) => {
    if (recordedData.length === 0) {
      toast({
        title: "No data to export",
        description: "Start recording to collect data first",
        variant: "destructive",
      })
      return
    }

    if (format === "CSV") {
      exportCSV()
    } else if (format === "PDF") {
      exportPDF()
    }
  }

  // Function to export data as CSV
  const exportCSV = () => {
    // Create CSV header
    const headers = ["timestamp", ...Object.keys(recordedData[0] || {}).filter(key => key !== "timestamp")]
    let csv = headers.join(",") + "\n"
    
    // Add data rows
    recordedData.forEach(record => {
      const row = headers.map(header => {
        return header === "timestamp" 
          ? new Date(record.timestamp).toLocaleString() 
          : record[header]
      })
      csv += row.join(",") + "\n"
    })
    
    // Create and download the file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `obd_data_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "CSV Export Complete",
      description: `Exported ${recordedData.length} data points as CSV`,
    })
  }

  // Function to export data as PDF
  const exportPDF = () => {
    // In a real app, you would use a PDF library like jsPDF
    // For this example, we'll just simulate PDF creation
    setTimeout(() => {
      toast({
        title: "PDF Export Complete",
        description: `Exported ${recordedData.length} data points as PDF`,
      })
    }, 1500)
  }

  // Clean up intervals on component unmount
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current)
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
    }
  }, [])

  // Update custom event for LiveGauges and LiveCharts components
  useEffect(() => {
    if (isConnected) {
      // Dispatch a custom event that the other components can listen for
      const event = new CustomEvent("obd-data-update", { detail: liveData })
      window.dispatchEvent(event)
    }
  }, [liveData, isConnected])

  return (
    <DashboardPage title="Live Data" subtitle="Real-time OBD-II data monitoring and recording">
      <div className="px-4 sm:px-6 md:px-8 space-y-6 w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleConnect} variant={isConnected ? "destructive" : "default"}>
              {isConnected ? "Disconnect" : "Connect OBD-II"}
            </Button>
            <Button onClick={handleRecord} variant="outline" disabled={!isConnected}>
              {isRecording ? (
                <>
                  <StopIcon className="mr-2 h-4 w-4" /> Stop Recording
                </>
              ) : (
                <>
                  <PlayIcon className="mr-2 h-4 w-4" /> Start Recording
                </>
              )}
            </Button>
          </div>
          
          {isRecording && (
            <div className="flex items-center gap-2">
              <span className="text-sm">Recording: </span>
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-sm">{recordedData.length} points</span>
            </div>
          )}
        </div>

        {!isConnected && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Not connected</AlertTitle>
            <AlertDescription>Connect to an OBD-II device to start monitoring live data.</AlertDescription>
          </Alert>
        )}

        {isConnected && (
          <>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">RPM</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{liveData.rpm.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Speed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{liveData.speed} km/h</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engine Temperature</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{liveData.engineTemp} °C</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Battery Voltage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{liveData.batteryVoltage} V</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fuel Pressure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{liveData.fuelPressure} kPa</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">O2 Sensor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{liveData.o2Voltage} V</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="gauges" className="space-y-4 w-full">
              <div className="flex justify-between flex-wrap">
                <TabsList>
                  <TabsTrigger value="gauges">Gauges</TabsTrigger>
                  <TabsTrigger value="charts">Charts</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleExport("PDF")}
                    disabled={recordedData.length === 0}
                  >
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleExport("CSV")}
                    disabled={recordedData.length === 0}
                  >
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
              <TabsContent value="gauges" className="space-y-4">
                <LiveGauges liveData={liveData} />
              </TabsContent>
              <TabsContent value="charts" className="space-y-4">
                <LiveCharts liveData={liveData} />
              </TabsContent>
              <TabsContent value="table" className="space-y-4">
                <LiveTable liveData={liveData} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardPage>
  )
}

