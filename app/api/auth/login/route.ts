import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    // Get the credentials from the request
    const { email, password } = await request.json()

    // Validate the input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Query the database to find the user
    const users = await executeQuery(
      'SELECT id, username, email, password_hash FROM users WHERE email = ?',
      [email]
    ) as any[]

    // Check if user exists
    if (users.length === 0) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]

    // For demo purposes, allow password 'password' for all users
    // In production, you'd use bcrypt.compare(password, user.password_hash)
    const validPassword = password === 'password' || 
      (user.password_hash && await bcrypt.compare(password, user.password_hash))

    if (!validPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last_login timestamp
    try {
      // Try to update last_login directly, even if the column check fails
      // This helps ensure the timestamp gets updated even if the information schema query has issues
      await executeQuery(
        'UPDATE users SET last_login = NOW() WHERE id = ?',
        [user.id]
      );
      console.log(`Updated last_login for user ${user.id}`);
      
      // Also update user's role if it's still null
      await executeQuery(
        'UPDATE users SET role = CASE WHEN role IS NULL THEN ? ELSE role END WHERE id = ?',
        [user.id === 1 || user.email.includes('admin') ? 'admin' : 
          user.id === 2 || user.email.includes('tester') ? 'tester' : 'viewer', 
          user.id]
      );
    } catch (error) {
      console.error('Error updating user data:', error);
      // Continue even if updating last_login fails
    }

    // Get user projects with names
    const projects = await executeQuery(
      `SELECT p.id, p.name 
       FROM projects p 
       JOIN user_projects up ON p.id = up.project_id 
       WHERE up.user_id = ?`,
      [user.id]
    ) as any[]

    // Get user role (default to viewer if not exists)
    const roleResult = await executeQuery(
      'SELECT role FROM users WHERE id = ?',
      [user.id]
    ) as any[]
    
    // Determine role based on user id or existing role
    let role = 'viewer' // Default role
    if (roleResult.length > 0 && roleResult[0].role) {
      role = roleResult[0].role
    } else if (user.id === 1 || user.email.includes('admin')) {
      role = 'admin'
      // Update role in database
      try {
        await executeQuery(
          'UPDATE users SET role = ? WHERE id = ?',
          [role, user.id]
        )
        console.log(`Updated role to ${role} for user ${user.id}`)
      } catch (error) {
        console.error('Error updating role:', error)
      }
    } else if (user.id === 2 || user.email.includes('tester')) {
      role = 'tester'
      // Update role in database
      try {
        await executeQuery(
          'UPDATE users SET role = ? WHERE id = ?',
          [role, user.id]
        )
        console.log(`Updated role to ${role} for user ${user.id}`)
      } catch (error) {
        console.error('Error updating role:', error)
      }
    }

    // Create a user object to return (excluding the password hash)
    const userToReturn = {
      id: user.id,
      name: user.username,
      email: user.email,
      role: role,
      projects: projects.length > 0 ? projects.map((p: any) => ({
        id: p.id,
        name: p.name
      })) : []
    }

    // Return the user data
    return NextResponse.json({ user: userToReturn })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    )
  }
} 