import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const reportType = searchParams.get('reportType')

    let query = `
      SELECT
        r.id,
        r.name,
        p.name as project,
        r.project_id,
        r.created_at as date,
        r.report_type as type,
        COALESCE(r.format, 'pdf') as format,
        CONCAT(ROUND(RAND() * 4 + 1, 1), ' MB') as size,
        'System' as createdBy
      FROM reports r
      JOIN projects p ON r.project_id = p.id
      WHERE 1=1
    `

    const params = []

    if (projectId) {
      query += ' AND r.project_id = ?'
      params.push(projectId)
    }

    if (dateFrom) {
      query += ' AND r.created_at >= ?'
      params.push(dateFrom)
    }

    if (dateTo) {
      query += ' AND r.created_at <= ?'
      params.push(dateTo)
    }

    if (reportType) {
      query += ' AND r.report_type = ?'
      params.push(reportType)
    }

    query += ' ORDER BY r.created_at DESC'

    const reports = await executeQuery(query, params) as any[]
    console.log('Filtered reports query:', { query, params, count: reports.length })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching reports:', error)

    // Return empty list in case of error
    return NextResponse.json([])
  }
} 