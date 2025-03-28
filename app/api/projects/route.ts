import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: Request) {
  try {
    // Fetch all projects from the database
    const projects = await executeQuery(
      'SELECT id, name, description FROM projects ORDER BY name',
      []
    ) as any[]

    console.log('Projects API response:', { count: projects.length, projects })

    // Return projects directly without nesting them in an object
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { message: 'An error occurred while fetching projects' },
      { status: 500 }
    )
  }
} 