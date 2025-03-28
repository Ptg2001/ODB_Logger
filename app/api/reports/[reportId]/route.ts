import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

type ReportParams = Promise<{ reportId: string }>;

export async function GET(
  request: Request,
  { params }: { params: ReportParams }
) {
  try {
    const { reportId } = await params
    
    // Get the basic report metadata only
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
    
    // Return only the report metadata without the full data
    return NextResponse.json({
      id: report.id,
      name: report.name,
      project_id: report.project_id,
      project_name: report.project_name,
      created_at: report.created_at,
      date_from: report.date_from,
      date_to: report.date_to,
      report_type: report.report_type,
      format: report.format,
      include_vehicles: report.include_vehicles,
      include_fault_codes: report.include_fault_codes,
      include_readiness: report.include_readiness,
      include_live_data: report.include_live_data
    })
    
  } catch (error) {
    console.error('Error fetching report metadata:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report metadata' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: ReportParams }
) {
  try {
    const { reportId } = await params

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    // First verify if the report exists
    const checkQuery = `
      SELECT id FROM reports WHERE id = ?
    `
    const checkResult = await executeQuery(checkQuery, [reportId]) as any[]

    if (!checkResult || checkResult.length === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Delete the report
    const deleteQuery = `
      DELETE FROM reports WHERE id = ?
    `
    await executeQuery(deleteQuery, [reportId])

    return NextResponse.json({ 
      success: true,
      message: 'Report deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json(
      { error: 'Failed to delete report', details: (error as Error).message },
      { status: 500 }
    )
  }
} 