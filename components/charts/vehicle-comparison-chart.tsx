"use client"

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { ChartContainer } from '@/components/ui/chart'

type VehicleComparisonChartProps = {
  vehicleIds: string[]
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', 
  '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'
]

const DATA_TYPES = [
  { value: 'fuel_efficiency', label: 'Fuel Efficiency (MPG)' },
  { value: 'speed', label: 'Speed (km/h)' },
  { value: 'rpm', label: 'RPM' },
  { value: 'throttle_position', label: 'Throttle Position (%)' },
  { value: 'engine_load', label: 'Engine Load (%)' },
  { value: 'coolant_temp', label: 'Coolant Temperature (°C)' },
  { value: 'battery_voltage', label: 'Battery Voltage (V)' },
  { value: 'test_results', label: 'Test Results' },
  { value: 'dtc_count', label: 'DTC Count' },
  { value: 'ecm_voltage', label: 'ECM Voltage (V)' },
  { value: 'calibration_id', label: 'Calibration ID' }
]

export function VehicleComparisonChart({ vehicleIds }: VehicleComparisonChartProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<string[]>([])
  const [unit, setUnit] = useState('')
  const [dataType, setDataType] = useState('fuel_efficiency')
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  
  useEffect(() => {
    if (vehicleIds.length === 0) {
      setError('No vehicles selected for comparison')
      setLoading(false)
      return
    }
    
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/analytics/vehicle-comparison?vehicleIds=${vehicleIds.join(',')}&dataType=${dataType}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch comparison data')
        }
        
        const result = await response.json()
        console.log('API response:', result)
        
        if (!result.data || result.data.length === 0) {
          setError('No comparison data available for the selected parameters')
          setData([])
          setVehicles([])
          setUnit('')
          setSelectedVehicles([])
          setLoading(false)
          return
        }
        
        // Format data for chart display
        const formattedData: Record<string, any>[] = [];
        if (result.data && result.data.length > 0) {
          // For time-series data, it might already be in the right format
          // For comparative data (like fault codes), we need to transform it
          const hasTimestamp = result.data[0] && 'timestamp' in result.data[0];
          
          if (hasTimestamp) {
            // Time series data
            formattedData.push(...result.data);
          } else {
            // For bar/pie comparisons, create a single data point with all vehicles
            const dataPoint: Record<string, any> = { timestamp: 'Current' };
            result.data.forEach((item: { vehicle: string; count: number }) => {
              dataPoint[item.vehicle] = item.count;
            });
            formattedData.push(dataPoint);
          }
        }

        setData(formattedData)
        setUnit(result.unit || '')
        
        if (result.vehicles && result.vehicles.length > 0) {
          setVehicles(result.vehicles)
          setSelectedVehicles(result.vehicles) // Initially select all vehicles
        } else if (result.data && result.data.length > 0) {
          // Extract vehicles from data if not provided directly
          const vehicleNames = result.data.map((item: { vehicle: string }) => item.vehicle);
          setVehicles(vehicleNames)
          setSelectedVehicles(vehicleNames)
        }
        
        console.log('Processed data:', { 
          formattedData, 
          vehicles: result.vehicles || result.data.map((item: { vehicle: string }) => item.vehicle),
          unit: result.unit
        })
      } catch (err) {
        console.error('Error fetching vehicle comparison data:', err)
        setError('Failed to load comparison data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [vehicleIds, dataType])
  
  const handleVehicleToggle = (vehicle: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicle)
        ? prev.filter(v => v !== vehicle)
        : [...prev, vehicle]
    )
  }
  
  const handleDataTypeChange = (value: string) => {
    setDataType(value)
  }
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Comparison</CardTitle>
          <CardDescription>Loading comparison data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }
  
  const selectedDataType = DATA_TYPES.find(dt => dt.value === dataType)
  
  return (
    <Card className="overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
      <CardHeader>
        <CardTitle>Vehicle Comparison</CardTitle>
        <CardDescription>
          Compare {selectedDataType?.label || dataType} between different vehicles
        </CardDescription>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="w-48">
            <Select value={dataType} onValueChange={handleDataTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                {DATA_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Vehicles</Label>
            <div className="flex flex-wrap gap-3">
              {vehicles?.length > 0 ? vehicles.map((vehicle, idx) => (
                <div key={vehicle} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vehicle-${idx}`}
                    checked={selectedVehicles.includes(vehicle)}
                    onCheckedChange={() => handleVehicleToggle(vehicle)}
                    style={{ accentColor: COLORS[idx % COLORS.length] }}
                  />
                  <Label htmlFor={`vehicle-${idx}`} className="text-sm font-normal">
                    {vehicle}
                  </Label>
                </div>
              )) : (
                <div>No vehicles available for comparison</div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ 
                  value: unit, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }} 
              />
              <Tooltip 
                formatter={(value: number) => [`${value} ${unit}`, '']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend />
              {vehicles?.map((vehicle, idx) => (
                selectedVehicles.includes(vehicle) && (
                  <Line
                    key={`vehicle-line-${vehicle}-${idx}`}
                    type="monotone"
                    dataKey={vehicle}
                    stroke={COLORS[idx % COLORS.length]}
                    activeDot={{ r: 8 }}
                    connectNulls
                    name={vehicle}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 