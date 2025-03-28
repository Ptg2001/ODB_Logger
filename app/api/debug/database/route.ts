import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET() {
  let connection;
  try {
    connection = await getConnection();

    // Get all tables in the database
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `);

    // Get users table columns
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `);

    // Check if user_projects table exists
    const [projectsTable] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'user_projects'
    `);

    // Count users
    const [userCount] = await connection.query(`
      SELECT COUNT(*) as count FROM users
    `);

    // Get sample user
    const [sampleUser] = await connection.query(`
      SELECT id, username, email, 
        CASE WHEN \`role\` IS NULL THEN 'missing column' ELSE \`role\` END as role,
        CASE WHEN \`status\` IS NULL THEN 'missing column' ELSE \`status\` END as status,
        CASE WHEN \`last_login\` IS NULL THEN 'missing column' ELSE \`last_login\` END as last_login,
        created_at, updated_at
      FROM users LIMIT 1
    `);

    // Get user projects if the table exists
    let userProjects: RowDataPacket[] = [];
    if (projectsTable.length > 0) {
      const [projects] = await connection.query(`
        SELECT user_id, project_id FROM user_projects LIMIT 10
      `);
      userProjects = projects as RowDataPacket[];
    }

    return NextResponse.json({
      status: 'success',
      database: {
        tables: tables,
        users_table: {
          columns: columns,
          user_count: userCount[0]?.count || 0,
          sample_user: sampleUser.length > 0 ? sampleUser[0] : null
        },
        user_projects_table: {
          exists: projectsTable.length > 0,
          sample_entries: userProjects
        }
      }
    });
  } catch (error) {
    console.error('Database debug error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Error retrieving database information',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
} 