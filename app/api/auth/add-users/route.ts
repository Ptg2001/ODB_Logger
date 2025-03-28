import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import bcrypt from 'bcryptjs'

// This is a protected admin-only route to add required users
// In a production environment, this would need proper authorization
export async function GET(request: Request) {
  try {
    // Check if users already exist to prevent duplicates
    const users = await executeQuery(
      'SELECT id, username, email FROM users WHERE id IN (2, 3)',
      []
    ) as any[]

    const testerExists = users.some(user => user.id === 2)
    const viewerExists = users.some(user => user.id === 3)

    // Results to return with proper typing
    const results: {
      success: boolean;
      message: string;
      tester: { exists: boolean; added?: boolean };
      viewer: { exists: boolean; added?: boolean };
    } = {
      success: true,
      message: 'Users check completed',
      tester: { exists: testerExists },
      viewer: { exists: viewerExists }
    }

    // Add tester if doesn't exist
    if (!testerExists) {
      // Generate hashed password for 'password'
      const hashedPassword = await bcrypt.hash('password', 10)
      
      await executeQuery(
        'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
        [2, 'tester', 'tester@example.com', hashedPassword]
      )
      
      results.tester.added = true
      results.message = 'New users added'
    }

    // Add viewer if doesn't exist
    if (!viewerExists) {
      // Generate hashed password for 'password'
      const hashedPassword = await bcrypt.hash('password', 10)
      
      await executeQuery(
        'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
        [3, 'viewer', 'viewer@example.com', hashedPassword]
      )
      
      results.viewer.added = true
      results.message = 'New users added'
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error adding users:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'An error occurred while adding users',
        error: (error as Error).message
      },
      { status: 500 }
    )
  }
} 