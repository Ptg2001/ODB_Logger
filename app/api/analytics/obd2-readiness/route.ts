import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const vehicleIds = searchParams.get('vehicleIds')
  const vehicleId = searchParams.get('vehicleId') // Support for single vehicle ID too
  
  // Determine which vehicle ID to use
  let vehicleIdToUse: string | null = null
  let vehicleIdArray: string[] = []
  
  if (vehicleIds) {
    vehicleIdArray = vehicleIds.split(',')
    vehicleIdToUse = vehicleIdArray[0] // Use the first vehicle for OBD-II readiness
  } else if (vehicleId) {
    vehicleIdToUse = vehicleId
  }
  
  try {
    if (!vehicleIdToUse) {
      return NextResponse.json(getSampleReadinessData(), { status: 200 })
    }
    
    // Get vehicle info
    const vehicleQuery = `
      SELECT id, make, model, year, vin
      FROM vehicles
      WHERE id = ?
    `
    
    const vehicleInfo = await executeQuery(vehicleQuery, [vehicleIdToUse]) as any[]
    
    // Get OBD-II monitor data
    const monitorQuery = `
      SELECT 
        monitor_name as name,
        status,
        last_updated
      FROM obd_monitors
      WHERE vehicle_id = ?
      ORDER BY last_updated DESC
      LIMIT 10
    `
    
    const monitorData = await executeQuery(monitorQuery, [vehicleIdToUse]) as any[]
    
    // Process monitor status
    const processedMonitors = monitorData.map((monitor: any) => ({
      name: monitor.name,
      status: monitor.status || 'Not Available',
      lastUpdated: monitor.last_updated
    }))
    
    // Return data or sample data if empty
    if (vehicleInfo.length > 0 && processedMonitors.length > 0) {
      return NextResponse.json({
        vehicleInfo: vehicleInfo[0],
        monitors: processedMonitors
      })
    } else {
      return NextResponse.json(getSampleReadinessData())
    }
  } catch (error) {
    console.error('Error fetching OBD-II readiness data:', error)
    return NextResponse.json(
      { message: 'An error occurred while fetching OBD-II readiness data' },
      { status: 500 }
    )
  }
}

// Sample data for testing
function getSampleReadinessData() {
  return {
    vehicleInfo: {
      id: 'sample-vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      year: 2018,
      vin: 'JTMZF4DV8D5043652'
    },
    monitors: [
      { name: 'Misfire Monitor', status: 'Complete', lastUpdated: '2023-07-15T14:32:45Z' },
      { name: 'Fuel System Monitor', status: 'Complete', lastUpdated: '2023-07-15T14:32:45Z' },
      { name: 'Comprehensive Component Monitor', status: 'Complete', lastUpdated: '2023-07-15T14:32:45Z' },
      { name: 'Catalyst Monitor', status: 'Incomplete', lastUpdated: '2023-07-15T14:32:45Z' },
      { name: 'Heated Catalyst Monitor', status: 'Not Available', lastUpdated: '2023-07-15T14:32:45Z' },
      { name: 'Evaporative System Monitor', status: 'Complete', lastUpdated: '2023-07-15T14:32:45Z' },
      { name: 'Secondary Air System Monitor', status: 'Not Available', lastUpdated: '2023-07-15T14:32:45Z' },
      { name: 'Oxygen Sensor Monitor', status: 'Incomplete', lastUpdated: '2023-07-15T14:32:45Z' },
      { name: 'Oxygen Sensor Heater Monitor', status: 'Complete', lastUpdated: '2023-07-15T14:32:45Z' },
      { name: 'EGR System Monitor', status: 'Complete', lastUpdated: '2023-07-15T14:32:45Z' }
    ]
  }
} 