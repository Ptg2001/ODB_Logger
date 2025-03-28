import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const vehicleIds = searchParams.get('vehicleIds')
  
  // Create array of vehicle IDs if provided
  const vehicleIdArray = vehicleIds ? vehicleIds.split(',') : []
  
  try {
    // Determine which filter to use based on parameters provided
    let whereClause = ''
    let params: any[] = []
    
    if (vehicleIdArray.length > 0) {
      // Filter by specific vehicle IDs
      const placeholders = vehicleIdArray.map(() => '?').join(',')
      whereClause = `WHERE vehicle_id IN (${placeholders})`
      params = vehicleIdArray
    } else if (projectId) {
      // Filter by project
      whereClause = 'WHERE vehicle_id IN (SELECT id FROM vehicles WHERE project_id = ?)'
      params = [projectId]
    }
    
    // Query for fault codes by severity
    const severityQuery = `
      SELECT 
        severity, 
        COUNT(*) as count
      FROM fault_codes
      ${whereClause}
      GROUP BY severity
      ORDER BY FIELD(severity, 'Critical', 'High', 'Medium', 'Low', 'Unknown')
    `
    console.log('Executing severity query:', severityQuery)
    
    const severityData = await executeQuery(severityQuery, params) as any[]
    console.log('Severity data results:', severityData)
    
    // Query for top fault codes
    const topCodesQuery = `
      SELECT 
        code, 
        description,
        COUNT(*) as count
      FROM fault_codes
      ${whereClause}
      GROUP BY code, description
      ORDER BY count DESC
      LIMIT 10
    `
    
    const topCodes = await executeQuery(topCodesQuery, params) as any[]
    
    // Query for fault codes by vehicle make
    const makeQuery = `
      SELECT 
        v.make, 
        COUNT(f.id) as count
      FROM fault_codes f
      JOIN vehicles v ON f.vehicle_id = v.id
      ${whereClause.replace('vehicle_id', 'f.vehicle_id')}
      GROUP BY v.make
      ORDER BY count DESC
    `
    
    const makeData = await executeQuery(makeQuery, params) as any[]
    
    // Query for fault codes by status
    const statusQuery = `
      SELECT 
        status, 
        COUNT(*) as count
      FROM fault_codes
      ${whereClause}
      GROUP BY status
      ORDER BY count DESC
    `
    
    const statusData = await executeQuery(statusQuery, params) as any[]
    
    // Format response for the visual report - update structure to match component expectations
    const response = {
      bySeverity: severityData.length > 0 ? severityData : getSampleSeverityData(),
      topFaultCodes: topCodes.length > 0 ? topCodes : getSampleTopCodesData(),
      byVehicleMake: makeData.length > 0 ? makeData : getSampleMakeData(),
      byStatus: statusData.length > 0 ? statusData : getSampleStatusData()
    }
    
    console.log('API response data:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching fault code data:', error)
    return NextResponse.json(
      { message: 'An error occurred while fetching fault code data' },
      { status: 500 }
    )
  }
}

// Sample data for testing
function getSampleSeverityData() {
  return [
    { severity: 'Critical', count: 12 },
    { severity: 'High', count: 24 },
    { severity: 'Medium', count: 38 },
    { severity: 'Low', count: 45 },
    { severity: 'Unknown', count: 7 }
  ]
}

function getSampleTopCodesData() {
  return [
    { code: 'P0300', description: 'Random/Multiple Cylinder Misfire Detected', count: 18 },
    { code: 'P0171', description: 'System Too Lean (Bank 1)', count: 15 },
    { code: 'P0420', description: 'Catalyst System Efficiency Below Threshold', count: 12 },
    { code: 'P0172', description: 'System Too Rich (Bank 1)', count: 9 },
    { code: 'P0101', description: 'Mass or Volume Air Flow Circuit Range/Performance', count: 7 }
  ]
}

function getSampleMakeData() {
  return [
    { make: 'Toyota', count: 35 },
    { make: 'Honda', count: 28 },
    { make: 'Ford', count: 21 },
    { make: 'Chevrolet', count: 18 },
    { make: 'Nissan', count: 15 }
  ]
}

function getSampleStatusData() {
  return [
    { status: 'Active', count: 37 },
    { status: 'Pending', count: 25 },
    { status: 'Cleared', count: 48 },
    { status: 'Permanent', count: 16 }
  ]
} 