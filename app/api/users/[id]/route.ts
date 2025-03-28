import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import bcrypt from 'bcryptjs'

type UserParams = Promise<{ id: string }>;

export async function DELETE(
  request: Request,
  { params }: { params: UserParams }
) {
  try {
    const { id } = await params
    
    // Start transaction
    await executeQuery('START TRANSACTION', [])
    
    try {
      // Check if user_projects table exists
      const tables = await executeQuery(
        `SELECT TABLE_NAME 
         FROM INFORMATION_SCHEMA.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'user_projects'`,
        []
      ) as any[]
      
      // Delete user's project associations if table exists
      if (tables.length > 0) {
        await executeQuery(
          'DELETE FROM user_projects WHERE user_id = ?',
          [id]
        )
      }
      
      // Delete the user
      const result = await executeQuery(
        'DELETE FROM users WHERE id = ?',
        [id]
      ) as any
      
      // Commit transaction
      await executeQuery('COMMIT', [])
      
      // Check if any rows were affected
      if (result.affectedRows === 0) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ 
        message: 'User deleted successfully',
        deleted: true
      })
    } catch (error) {
      // Rollback transaction on error
      await executeQuery('ROLLBACK', [])
      throw error
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { message: 'An error occurred while deleting the user' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: UserParams }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Check if user exists
    const users = await executeQuery(
      'SELECT id FROM users WHERE id = ?',
      [id]
    ) as any[];
    
    if (users.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Start building the update query
    let updateFields = [];
    let queryParams = [];
    
    // Check for basic field updates
    if (data.username) {
      updateFields.push('username = ?');
      queryParams.push(data.username);
    }
    
    if (data.email) {
      updateFields.push('email = ?');
      queryParams.push(data.email);
    }
    
    // Check for role update
    if (data.role) {
      // Validate role
      if (!['admin', 'tester', 'viewer'].includes(data.role)) {
        return NextResponse.json(
          { message: 'Invalid role' },
          { status: 400 }
        );
      }
      
      updateFields.push('role = ?');
      queryParams.push(data.role);
    }
    
    // Check for password update
    if (data.password) {
      // Validate password length
      if (data.password.length < 8) {
        return NextResponse.json(
          { message: 'Password must be at least 8 characters' },
          { status: 400 }
        );
      }
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      
      updateFields.push('password_hash = ?');
      queryParams.push(hashedPassword);
    }
    
    // Check for status update
    if (data.status) {
      // Validate status
      if (!['Active', 'Inactive'].includes(data.status)) {
        return NextResponse.json(
          { message: 'Invalid status' },
          { status: 400 }
        );
      }
      
      updateFields.push('status = ?');
      queryParams.push(data.status);
    }
    
    // Start a transaction for atomicity
    await executeQuery('START TRANSACTION');
    
    try {
      // If there are fields to update
      if (updateFields.length > 0) {
        // Add user ID to query params
        queryParams.push(id);
        
        // Execute update query
        await executeQuery(
          `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
          queryParams
        );
      }
      
      // Check for project updates
      if (data.projects && Array.isArray(data.projects)) {
        // Check if user_projects table exists
        const [projectTable] = await executeQuery(`
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_NAME = 'user_projects' AND TABLE_SCHEMA = DATABASE()
        `) as any[];
        
        if (projectTable.length > 0) {
          // Delete existing project associations
          await executeQuery(
            'DELETE FROM user_projects WHERE user_id = ?',
            [id]
          );
          
          // Insert new project associations
          for (const projectId of data.projects) {
            await executeQuery(
              'INSERT INTO user_projects (user_id, project_id) VALUES (?, ?)',
              [id, projectId]
            );
          }
        }
      }
      
      await executeQuery('COMMIT');
      
      return NextResponse.json({ message: 'User updated successfully' });
    } catch (error) {
      // Rollback on error
      await executeQuery('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the user' },
      { status: 500 }
    );
  }
} 