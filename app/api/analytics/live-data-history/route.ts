import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const vehicleIds = searchParams.get('vehicleIds')
  
  // Create array of vehicle IDs if provided
  const vehicleIdArray = vehicleIds ? vehicleIds.split(',') : []
  
  try {
    // If no vehicle IDs provided, return sample data
    if (vehicleIdArray.length === 0) {
      return NextResponse.json(getSampleHistoryData(), { status: 200 })
    }
    
    // Use the first vehicle ID for historical data
    const primaryVehicleId = vehicleIdArray[0]
    
    // Get historical data for a specific parameter (e.g., engine RPM)
    const historicalQuery = `
      SELECT 
        parameter,
        value,
        timestamp
      FROM live_data
      WHERE vehicle_id = ? AND parameter = 'ENGINE_RPM'
      ORDER BY timestamp DESC
      LIMIT 30
    `
    
    const historicalData = await executeQuery(historicalQuery, [primaryVehicleId]) as any[]
    
    // Get parameter distribution 
    const parameterQuery = `
      SELECT 
        parameter,
        COUNT(*) as count
      FROM live_data
      WHERE vehicle_id = ?
      GROUP BY parameter
      ORDER BY count DESC
      LIMIT 10
    `
    
    const parameterDistribution = await executeQuery(parameterQuery, [primaryVehicleId]) as any[]
    
    // Return data or sample data if empty
    if (historicalData.length > 0 || parameterDistribution.length > 0) {
      return NextResponse.json({
        historicalData: historicalData.reverse(), // Reverse to get chronological order
        parameterDistribution
      })
    } else {
      return NextResponse.json(getSampleHistoryData())
    }
  } catch (error) {
    console.error('Error fetching live data history:', error)
    return NextResponse.json(
      { message: 'An error occurred while fetching live data history' },
      { status: 500 }
    )
  }
}

// Sample data for testing
function getSampleHistoryData() {
  const now = new Date()
  const historicalData = Array.from({ length: 30 }, (_, i) => {
    const timestamp = new Date(now)
    timestamp.setMinutes(now.getMinutes() - (30 - i))
    
    return {
      parameter: 'ENGINE_RPM',
      value: Math.floor(800 + Math.random() * 2000).toString(),
      timestamp: timestamp.toISOString()
    }
  })
  
  const parameterDistribution = [
    { parameter: 'ENGINE_RPM', count: 254 },
    { parameter: 'VEHICLE_SPEED', count: 241 },
    { parameter: 'ENGINE_COOLANT_TEMP', count: 198 },
    { parameter: 'INTAKE_AIR_TEMP', count: 187 },
    { parameter: 'MAF_SENSOR', count: 175 },
    { parameter: 'THROTTLE_POSITION', count: 162 },
    { parameter: 'O2_VOLTAGE', count: 148 },
    { parameter: 'FUEL_PRESSURE', count: 123 },
    { parameter: 'TIMING_ADVANCE', count: 102 },
    { parameter: 'ENGINE_LOAD', count: 94 }
  ]
  
  return {
    historicalData,
    parameterDistribution
  }
} 