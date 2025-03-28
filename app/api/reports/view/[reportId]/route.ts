import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

type ReportParams = Promise<{ reportId: string }>;

export async function GET(
  request: Request,
  { params }: { params: ReportParams }
) {
  try {
    const { reportId } = await params
    
    // Get the project ID from query params if available
    const { searchParams } = new URL(request.url)
    const projectIdFromQuery = searchParams.get('project')
    
    // Get the basic report data
    const reportQuery = `
      SELECT r.*, p.name as project_name 
      FROM reports r
      JOIN projects p ON r.project_id = p.id
      WHERE r.id = ?
    `
    const reportResults = await executeQuery(reportQuery, [reportId]) as any[]
    
    if (!reportResults.length) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    
    const report = reportResults[0]
    
    // Use project ID from query params if available, otherwise use the one from the report
    const projectId = projectIdFromQuery || report.project_id
    
    // Fetch all data needed for the visual report
    const data: any = {
      vehicles: [],
      faultCodes: [],
      liveData: []
    }
    
    // Get vehicles data if included in report
    if (report.include_vehicles) {
      const vehiclesQuery = `
        SELECT v.* 
        FROM vehicles v
        JOIN projects p ON v.project_id = p.id
        WHERE p.id = ?
        ORDER BY v.created_at DESC
      `
      data.vehicles = await executeQuery(vehiclesQuery, [projectId]) as any[]
    }
    
    // Get fault codes if included in report
    if (report.include_fault_codes) {
      const faultCodesQuery = `
        SELECT fc.* 
        FROM fault_codes fc
        JOIN vehicles v ON fc.vehicle_id = v.id
        JOIN projects p ON v.project_id = p.id
        WHERE p.id = ?
        ORDER BY fc.created_at DESC
      `
      data.faultCodes = await executeQuery(faultCodesQuery, [projectId]) as any[]
    }
    
    // Get live data if included in report
    if (report.include_live_data) {
      const liveDataQuery = `
        SELECT ld.* 
        FROM live_data ld
        JOIN vehicles v ON ld.vehicle_id = v.id
        JOIN projects p ON v.project_id = p.id
        WHERE p.id = ?
        ORDER BY ld.timestamp DESC
        LIMIT 100
      `
      data.liveData = await executeQuery(liveDataQuery, [projectId]) as any[]
    }
    
    // Return the full report data
    return NextResponse.json({
      id: report.id,
      name: report.name,
      project_id: projectId,
      project_name: report.project_name,
      created_at: report.created_at,
      date_from: report.date_from,
      date_to: report.date_to,
      report_type: report.report_type,
      format: report.format,
      data
    })
    
  } catch (error) {
    console.error('Error fetching report data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    )
  }
} 