import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { username, email, password, role, status, projects } = data;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user with same username or email already exists
    const existingUser = await executeQuery(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    ) as any[];

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: 'User with this username or email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check which columns exist in the users table
    const columns = await executeQuery(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'users'`,
      []
    ) as any[];

    // Create a map of existing columns
    const columnExists: Record<string, boolean> = {};
    columns.forEach((col: any) => {
      columnExists[col.COLUMN_NAME.toLowerCase()] = true;
    });

    // Build the insert query based on which columns exist
    let query = 'INSERT INTO users (username, email, password_hash';
    const params = [username, email, hashedPassword];

    if (columnExists['role']) {
      query += ', role';
      params.push(role || 'viewer');
    }

    if (columnExists['status']) {
      query += ', status';
      params.push(status || 'active');
    }

    query += ') VALUES (' + '?, '.repeat(params.length - 1) + '?)';

    // Execute the query and get the inserted ID
    const result = await executeQuery(query, params) as any;
    const userId = result.insertId;

    // Check if user_projects table exists and if projects were provided
    if (projects && projects.length > 0) {
      const userProjectsTable = await executeQuery(
        `SELECT TABLE_NAME 
         FROM INFORMATION_SCHEMA.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'user_projects'`,
        []
      ) as any[];

      if (userProjectsTable.length > 0) {
        // Insert user project associations
        for (const projectId of projects) {
          await executeQuery(
            'INSERT INTO user_projects (user_id, project_id) VALUES (?, ?)',
            [userId, projectId]
          );
        }
      }
    } else {
      // If no projects provided, assign to the first project by default
      const defaultProject = await executeQuery(
        'SELECT id FROM projects ORDER BY id ASC LIMIT 1',
        []
      ) as any[];
      
      if (defaultProject.length > 0) {
        const projectId = defaultProject[0].id;
        await executeQuery(
          'INSERT INTO user_projects (user_id, project_id) VALUES (?, ?)',
          [userId, projectId]
        );
      }
    }

    // Return the created user
    const responseUser = {
      id: userId,
      username,
      email,
      role: columnExists['role'] ? role || 'viewer' : 'viewer',
      status: columnExists['status'] ? status || 'active' : 'active',
      projects: projects || []
    };

    return NextResponse.json(responseUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the user' },
      { status: 500 }
    );
  }
} 