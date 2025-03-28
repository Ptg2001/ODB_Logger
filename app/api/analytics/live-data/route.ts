import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const vehicleId = searchParams.get('vehicleId')
  
  if (!vehicleId) {
    return NextResponse.json(
      { message: 'Vehicle ID is required' },
      { status: 400 }
    )
  }
  
  try {
    // Fetch latest live data
    const liveDataQuery = `
      SELECT 
        id,
        vehicle_id,
        timestamp,
        speed,
        rpm,
        throttle_position,
        engine_load,
        coolant_temp,
        fuel_pressure,
        intake_pressure,
        maf,
        o2_voltage,
        fuel_level,
        battery_voltage
      FROM live_data
      WHERE vehicle_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `
    
    const liveData = await executeQuery(liveDataQuery, [vehicleId]) as any[]
    
    if (liveData.length === 0) {
      return NextResponse.json(
        { message: 'No live data found for this vehicle' },
        { status: 404 }
      )
    }
    
    // Fetch historical data for trend analysis
    const historicalQuery = `
      SELECT 
        data_type, 
        value, 
        timestamp
      FROM historical_data
      WHERE vehicle_id = ?
      AND data_type IN ('speed', 'rpm', 'throttle_position', 'engine_load', 'coolant_temp', 'fuel_efficiency')
      ORDER BY timestamp DESC
      LIMIT 100
    `
    
    const historicalData = await executeQuery(historicalQuery, [vehicleId]) as any[]
    
    // Group historical data by type
    const groupedData: Record<string, any[]> = {}
    historicalData.forEach((row: any) => {
      if (!groupedData[row.data_type]) {
        groupedData[row.data_type] = []
      }
      groupedData[row.data_type].push({
        timestamp: row.timestamp,
        value: row.value
      })
    })
    
    // Calculate trends using simple linear regression
    const trends: Record<string, {direction: 'up' | 'down' | 'stable', percentage: number}> = {}
    Object.entries(groupedData).forEach(([type, data]) => {
      if (data.length >= 2) {
        // Sort by timestamp
        data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        
        // Simple linear regression to determine trend
        const n = data.length
        const x = [...Array(n).keys()] // [0, 1, 2, ...]
        const y = data.map(d => d.value)
        
        // Calculate slope
        const sumX = x.reduce((a, b) => a + b, 0)
        const sumY = y.reduce((a, b) => a + b, 0)
        const sumXY = x.reduce((a, i) => a + (i * y[i]), 0)
        const sumXX = x.reduce((a, i) => a + (i * i), 0)
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
        
        // Calculate percentage change
        const startValue = y[0]
        const endValue = y[n - 1]
        const percentChange = startValue !== 0 
          ? Math.abs(Math.round(((endValue - startValue) / startValue) * 100))
          : 0
        
        trends[type] = {
          direction: slope > 0.01 ? 'up' : (slope < -0.01 ? 'down' : 'stable'),
          percentage: percentChange
        }
      }
    })
    
    // Fetch vehicle info
    const vehicleQuery = `
      SELECT 
        make, 
        model, 
        year, 
        vin
      FROM vehicles
      WHERE id = ?
    `
    
    const vehicleInfo = await executeQuery(vehicleQuery, [vehicleId]) as any[]
    
    // Prepare gauge data
    const gaugeData = [
      {
        id: 'speed',
        label: 'Speed',
        value: liveData[0].speed,
        color: '#8884d8',
        range: { min: 0, max: 200 },
        chartData: generateChartData(groupedData.speed || [])
      },
      {
        id: 'rpm',
        label: 'RPM',
        value: liveData[0].rpm,
        color: '#82ca9d',
        range: { min: 0, max: 8000 },
        chartData: generateChartData(groupedData.rpm || [])
      },
      {
        id: 'throttle_position',
        label: 'Throttle Position',
        value: liveData[0].throttle_position,
        color: '#ffc658',
        range: { min: 0, max: 100 },
        chartData: generateChartData(groupedData.throttle_position || [])
      },
      {
        id: 'engine_load',
        label: 'Engine Load',
        value: liveData[0].engine_load,
        color: '#ff8042',
        range: { min: 0, max: 100 },
        chartData: generateChartData(groupedData.engine_load || [])
      },
      {
        id: 'coolant_temp',
        label: 'Coolant Temperature',
        value: liveData[0].coolant_temp,
        color: '#00C49F',
        range: { min: 0, max: 150 },
        chartData: generateChartData(groupedData.coolant_temp || [])
      },
      {
        id: 'battery_voltage',
        label: 'Battery Voltage',
        value: liveData[0].battery_voltage,
        color: '#FFBB28',
        range: { min: 0, max: 20 },
        chartData: []
      }
    ]
    
    return NextResponse.json({
      vehicleInfo: vehicleInfo.length > 0 ? vehicleInfo[0] : null,
      liveData: liveData[0],
      gaugeData,
      trends
    })
  } catch (error) {
    console.error('Error fetching live data:', error)
    return NextResponse.json(
      { message: 'An error occurred while fetching live data' },
      { status: 500 }
    )
  }
}

// Helper function to generate chart data from historical data
function generateChartData(data: any[]): any[] {
  // Return last 10 data points or less
  const chartData = data.slice(-10).map(d => ({
    timestamp: new Date(d.timestamp).toLocaleTimeString(),
    value: d.value
  }))
  
  return chartData
} 