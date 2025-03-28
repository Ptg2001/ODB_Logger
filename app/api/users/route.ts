import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: Request) {
  try {
    console.log('Executing users API query');
    
    // First check which columns exist in the users table
    const userColumns = await executeQuery(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'users'`
    ) as any[];
    
    // Create a map of existing columns
    const columnExists: Record<string, boolean> = {};
    userColumns.forEach((col: any) => {
      columnExists[col.COLUMN_NAME.toLowerCase()] = true;
    });
    
    // Build the query based on existing columns
    let query = `
      SELECT 
        id, 
        username, 
        email`;
    
    // Add conditional columns if they exist
    if (columnExists['role']) query += `,\n        role`;
    if (columnExists['status']) query += `,\n        status`;
    if (columnExists['last_login']) {
      query += `,\n        last_login,
        CASE 
          WHEN last_login IS NULL THEN 'Never' 
          ELSE DATE_FORMAT(last_login, '%b %d, %Y %H:%i') 
        END as last_login_formatted`;
    }
    
    query += `,\n        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM users 
      ORDER BY id ASC`;
    
    // Fetch users from the database
    const users = await executeQuery(query, []) as any[];
    console.log(`Found ${users.length} users in database`);
    
    // Check if user_projects table exists
    const userProjectsTable = await executeQuery(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'user_projects'`
    ) as any[];
    
    const hasUserProjects = userProjectsTable.length > 0;
    
    // For each user, add default values and fetch projects if table exists
    const enhancedUsers = await Promise.all(users.map(async (user: any) => {
      // Add default values for missing columns
      if (!columnExists['role']) user.role = 'viewer';
      if (!columnExists['status']) user.status = 'active';
      
      // Use formatted last_login if available
      if (columnExists['last_login']) {
        user.last_login = user.last_login_formatted || 'Never';
        delete user.last_login_formatted;
      } else {
        user.last_login = 'Never';
      }
      
      // Initialize empty projects array
      let projects: any[] = [];
      
      // Fetch projects if the table exists
      if (hasUserProjects) {
        try {
          // Get user projects with names
          projects = await executeQuery(
            `SELECT p.id, p.name 
             FROM projects p
             JOIN user_projects up ON p.id = up.project_id
             WHERE up.user_id = ?
             ORDER BY p.name ASC`,
            [user.id]
          ) as any[];
          
          // Log for debugging
          console.log(`Found ${projects.length} projects for user ${user.id} (${user.username})`);
        } catch (error) {
          console.error(`Error fetching projects for user ${user.id}:`, error);
        }
      }
      
      // Return user with their projects
      return {
        ...user,
        projects: projects.length > 0 ? projects : []
      };
    }));

    console.log(`Returning ${enhancedUsers.length} users with projects`);
    // Ensure we return an array even if empty
    return NextResponse.json(enhancedUsers || []);
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return an empty array on error to avoid breaking the UI
    return NextResponse.json([]);
  }
} 