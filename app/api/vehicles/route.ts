import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    let query = `
      SELECT id, name, make, model, year, project_id
      FROM vehicles
    `
    
    const params: any[] = []
    
    if (projectId) {
      query += ' WHERE project_id = ?'
      params.push(projectId)
    }
    
    query += ' ORDER BY make, model, year'
    
    const vehicles = await executeQuery(query, params)
    
    return NextResponse.json(vehicles)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    )
  }
} 