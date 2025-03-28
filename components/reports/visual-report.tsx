"use client"

import { useState, useEffect } from "react"
import { 
  BarChart, Bar, 
  PieChart, Pie, 
  LineChart, Line,
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

type VisualReportProps = {
  reportId: string
  projectId: string
  isPdfMode?: boolean
}

export function VisualReport({ reportId, projectId, isPdfMode = false }: VisualReportProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchReportData()
  }, [reportId, projectId])
  
  const fetchReportData = async () => {
    if (!reportId) return;
    
    setLoading(true);
    try {
      console.log('Fetching report data...');
      // Fetch basic report data
      const res = await fetch(`/api/reports/view/${reportId}?project=${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch report data');
      
      const reportData = await res.json();
      console.log('Report data fetched successfully');
      
      // Extract vehicle IDs for analytics
      const vehicleIds = reportData.data?.vehicles?.map((v: any) => v.id).filter(Boolean) || [];
      
      // Fetch additional analytics data
      const analyticsData: any = {};
      
      if (vehicleIds.length > 0) {
        // Parallel fetch for all analytics endpoints
        const [
          faultCodeAnalyticsRes, 
          obd2ReadinessRes,
          liveDataHistoryRes,
          vehicleComparisonRes
        ] = await Promise.all([
          // Fault code analytics
          fetch(`/api/analytics/fault-codes?vehicleIds=${vehicleIds.join(',')}`).then(res => 
            res.ok ? res.json() : null
          ).catch(() => null),
          
          // OBD-II readiness data
          fetch(`/api/analytics/obd2-readiness?vehicleIds=${vehicleIds.join(',')}`).then(res => 
            res.ok ? res.json() : null
          ).catch(() => null),
          
          // Live data history
          fetch(`/api/analytics/live-data-history?vehicleIds=${vehicleIds.join(',')}`).then(res => 
            res.ok ? res.json() : null
          ).catch(() => null),
          
          // Vehicle comparison data (if multiple vehicles)
          vehicleIds.length > 1 ? 
            fetch(`/api/analytics/vehicle-comparison?vehicleIds=${vehicleIds.join(',')}`).then(res => 
              res.ok ? res.json() : null
            ).catch(() => null) : null
        ]);
        
        // Populate analytics data object
        if (faultCodeAnalyticsRes) analyticsData.faultCodeAnalytics = faultCodeAnalyticsRes;
        if (obd2ReadinessRes) analyticsData.obd2Readiness = obd2ReadinessRes;
        if (liveDataHistoryRes) analyticsData.liveDataHistory = liveDataHistoryRes;
        if (vehicleComparisonRes) analyticsData.vehicleComparison = vehicleComparisonRes;
      }
      
      // Combine all data
      const completeData = {
        ...reportData,
        analytics: analyticsData
      };
      
      console.log('All data fetched successfully', completeData);
      setData(completeData);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading report data...</span>
      </div>
    )
  }
  
  if (error || !data) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-700">
        <p className="font-semibold">Error loading report data</p>
        <p>{error || 'Unknown error occurred'}</p>
        <Button variant="outline" onClick={fetchReportData} className="mt-2">
          Retry
        </Button>
      </div>
    )
  }
  
  // Extract vehicles data for visualization
  const vehiclesData = data.data.vehicles || []
  
  // Group vehicles by make for pie chart
  const vehiclesByMake = vehiclesData.reduce((acc: any, vehicle: any) => {
    const make = vehicle.make || 'Unknown'
    acc[make] = (acc[make] || 0) + 1
    return acc
  }, {})
  
  const vehicleMakesPieData = Object.entries(vehiclesByMake).map(([name, value]) => ({
    name,
    value
  }))
  
  // Group vehicles by year for bar chart
  const vehiclesByYear = vehiclesData.reduce((acc: any, vehicle: any) => {
    const year = vehicle.year || 'Unknown'
    acc[year] = (acc[year] || 0) + 1
    return acc
  }, {})
  
  const vehicleYearsBarData = Object.entries(vehiclesByYear)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name))
  
  // Extract fault codes data
  const faultCodesData = data.data.faultCodes || []
  
  // Group fault codes by severity
  const faultCodesBySeverity = faultCodesData.reduce((acc: any, code: any) => {
    const severity = code.severity || 'Unknown'
    acc[severity] = (acc[severity] || 0) + 1
    return acc
  }, {})
  
  const faultCodesPieData = Object.entries(faultCodesBySeverity).map(([name, value]) => ({
    name,
    value
  }))

  // For PDF mode, we'll render all sections in a single column
  if (isPdfMode) {
    return (
      <div className="space-y-8 print:p-0">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{data.project_name} Visual Report</h1>
          <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
          <p className="mt-2">Report period: {data.date_from || 'All time'} to {data.date_to || 'Present'}</p>
        </div>

        {/* Vehicles section */}
        <section className="page-break-after">
          <h2 className="text-2xl font-bold mb-4">Vehicle Analysis</h2>
          
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Vehicles by Make</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleMakesPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {vehicleMakesPieData.map((entry, index) => (
                        <Cell key={`vehicle-make-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Vehicles by Year</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={vehicleYearsBarData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Vehicles" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Vehicle Details ({vehiclesData.length} vehicles)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIN</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vehiclesData.map((vehicle: any) => (
                      <tr key={vehicle.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{vehicle.make}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{vehicle.model}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{vehicle.year}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{vehicle.vin || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Fault Code Analysis */}
        <section className="page-break-after">
          <h2 className="text-2xl font-bold mb-4">Fault Code Analysis</h2>
          
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Fault Codes by Severity</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={faultCodesPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {faultCodesPieData.map((entry, index) => (
                        <Cell key={`fault-code-severity-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {data.analytics?.faultCodeAnalytics?.makeData && (
              <Card>
                <CardHeader>
                  <CardTitle>Fault Codes by Vehicle Make</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.analytics.faultCodeAnalytics.makeData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="make" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Fault Codes" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            
            {data.analytics?.faultCodeAnalytics?.topCodes && (
              <Card>
                <CardHeader>
                  <CardTitle>Most Common Fault Codes</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.analytics.faultCodeAnalytics.topCodes}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 60,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="code" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Occurrences" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            
            {data.analytics?.faultCodeAnalytics?.statusData && (
              <Card>
                <CardHeader>
                  <CardTitle>Fault Code Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.analytics.faultCodeAnalytics.statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                      >
                        {data.analytics.faultCodeAnalytics.statusData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Fault Code Details ({faultCodesData.length} codes)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {faultCodesData.slice(0, 10).map((code: any, index: number) => (
                      <tr key={`code-${index}`}>
                        <td className="px-4 py-2 whitespace-nowrap">{code.code}</td>
                        <td className="px-4 py-2">{code.description || 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{code.severity || 'N/A'}</td>
                      </tr>
                    ))}
                    {faultCodesData.length > 10 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-center text-sm text-gray-500">
                          ... and {faultCodesData.length - 10} more fault codes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* OBD-II Readiness section */}
        {data.analytics?.obd2Readiness && (
          <section className="page-break-after">
            <h2 className="text-2xl font-bold mb-4">OBD-II Readiness Status</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Monitor Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monitor</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.analytics.obd2Readiness.monitors?.map((monitor: any, index: number) => (
                        <tr key={`monitor-${index}`}>
                          <td className="px-4 py-2">{monitor.name}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              monitor.status === 'Complete' ? 'bg-green-100 text-green-800' : 
                              monitor.status === 'Incomplete' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {monitor.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${monitor.status === 'Complete' ? 'bg-green-600' : 'bg-yellow-400'}`} 
                                style={{ width: monitor.status === 'Complete' ? '100%' : 
                                         monitor.status === 'Incomplete' ? '50%' : '0%' }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
        
        {/* Performance Metrics & Historical Data */}
        <section className="page-break-after">
          <h2 className="text-2xl font-bold mb-4">Performance Metrics & Historical Data</h2>
          
          <div className="grid grid-cols-1 gap-8">
            {/* Recent Sensor Readings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sensor Readings</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {data.data.liveData && data.data.liveData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.data.liveData.slice(0, 20).map((item: any) => ({
                        name: new Date(item.timestamp || item.created_at).toLocaleTimeString(),
                        value: parseFloat(item.value) || 0,
                        parameter: item.parameter
                      }))}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} name="Sensor Value" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Historical Data Trends */}
            {data.analytics?.liveDataHistory?.historicalData && (
              <Card>
                <CardHeader>
                  <CardTitle>Historical Data Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.analytics.liveDataHistory.historicalData.map((item: any) => ({
                        timestamp: new Date(item.timestamp).toLocaleDateString(),
                        value: parseFloat(item.value) || 0,
                      }))}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#82ca9d" name="Historical Value" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            
            {/* Parameter Distribution */}
            {data.analytics?.liveDataHistory?.parameterDistribution && (
              <Card>
                <CardHeader>
                  <CardTitle>Parameter Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.analytics.liveDataHistory.parameterDistribution}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="parameter" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Readings Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
        
        {/* Vehicle Comparison */}
        {data.analytics?.vehicleComparison && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Vehicle Comparison</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Fault Codes by Vehicle</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.analytics.vehicleComparison.data}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 70,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vehicle" angle={-45} textAnchor="end" interval={0} height={70} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Fault Code Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    )
  }
  
  // Regular interactive mode
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visual Report: {data.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vehicles" className="space-y-4">
            <TabsList>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="faultCodes">Fault Codes</TabsTrigger>
              <TabsTrigger value="readiness">OBD Readiness</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vehicles" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicles by Make</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={vehicleMakesPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {vehicleMakesPieData.map((entry, index) => (
                            <Cell key={`vehicle-make-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicles by Year</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={vehicleYearsBarData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Vehicles" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIN</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {vehiclesData.map((vehicle: any) => (
                          <tr key={vehicle.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{vehicle.make}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{vehicle.model}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{vehicle.year}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{vehicle.vin || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="faultCodes" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fault Codes by Severity</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={faultCodesPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {faultCodesPieData.map((entry, index) => (
                            <Cell key={`fault-code-severity-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {data.analytics?.faultCodeAnalytics?.makeData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Fault Codes by Vehicle Make</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data.analytics.faultCodeAnalytics.makeData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="make" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Fault Codes" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
                
                {data.analytics?.faultCodeAnalytics?.topCodes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Most Common Fault Codes</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data.analytics.faultCodeAnalytics.topCodes}
                          layout="vertical"
                          margin={{
                            top: 5,
                            right: 30,
                            left: 60,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="code" type="category" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Occurrences" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
                
                {data.analytics?.faultCodeAnalytics?.statusData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Fault Code Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.analytics.faultCodeAnalytics.statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="status"
                          >
                            {data.analytics.faultCodeAnalytics.statusData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Fault Code Details</CardTitle>
                </CardHeader>
                <CardContent className="h-80 overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {faultCodesData.map((code: any, index: number) => (
                        <tr key={`code-${index}`}>
                          <td className="px-4 py-2 whitespace-nowrap">{code.code}</td>
                          <td className="px-4 py-2">{code.description || 'N/A'}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{code.severity || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="readiness" className="space-y-6">
              {data.analytics?.obd2Readiness ? (
                <Card>
                  <CardHeader>
                    <CardTitle>OBD-II Readiness Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monitor</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data.analytics.obd2Readiness.monitors?.map((monitor: any, index: number) => (
                            <tr key={`monitor-${index}`}>
                              <td className="px-4 py-2">{monitor.name}</td>
                              <td className="px-4 py-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  monitor.status === 'Complete' ? 'bg-green-100 text-green-800' : 
                                  monitor.status === 'Incomplete' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {monitor.status}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className={`h-2.5 rounded-full ${monitor.status === 'Complete' ? 'bg-green-600' : 'bg-yellow-400'}`} 
                                    style={{ width: monitor.status === 'Complete' ? '100%' : 
                                             monitor.status === 'Incomplete' ? '50%' : '0%' }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {data.analytics.obd2Readiness.vehicleInfo && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">Vehicle Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Make</p>
                            <p>{data.analytics.obd2Readiness.vehicleInfo.make || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Model</p>
                            <p>{data.analytics.obd2Readiness.vehicleInfo.model || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Year</p>
                            <p>{data.analytics.obd2Readiness.vehicleInfo.year || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">VIN</p>
                            <p>{data.analytics.obd2Readiness.vehicleInfo.vin || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No OBD readiness data available for this report.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {data.data.liveData && data.data.liveData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={data.data.liveData.slice(0, 20).map((item: any) => ({
                          name: new Date(item.timestamp || item.created_at).toLocaleTimeString(),
                          value: parseFloat(item.value) || 0,
                          parameter: item.parameter
                        }))}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">No performance data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-6">
              {data.analytics?.vehicleComparison ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Comparison</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.analytics.vehicleComparison.data}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 70,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="vehicle" angle={-45} textAnchor="end" interval={0} height={70} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" name="Fault Code Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Vehicle comparison data is only available when multiple vehicles are present in the report.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={() => window.print()}>
          Print Report
        </Button>
      </div>
    </div>
  )
} 