import mysql from 'mysql2/promise'
import { config } from 'dotenv'

config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
  ssl: {
    rejectUnauthorized: false
  },
  multipleStatements: true
};

async function fixUsersTable() {
  console.log('Starting to add missing columns to users table...');
  
  // Set up MySQL connection
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('Connected to database');
  
  try {
    // Start a transaction for safety
    await connection.beginTransaction();
    
    // Check if role column exists
    const [roleColumn] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role' AND TABLE_SCHEMA = ?
    `, [dbConfig.database]);
    
    if (roleColumn.length === 0) {
      console.log('Adding role column to users table...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(20) DEFAULT 'viewer'
      `);
      console.log('✓ Role column added');
    } else {
      console.log('✓ Role column already exists');
    }
    
    // Check if status column exists
    const [statusColumn] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'status' AND TABLE_SCHEMA = ?
    `, [dbConfig.database]);
    
    if (statusColumn.length === 0) {
      console.log('Adding status column to users table...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN status VARCHAR(20) DEFAULT 'Active'
      `);
      console.log('✓ Status column added');
    } else {
      console.log('✓ Status column already exists');
    }
    
    // Check if last_login column exists
    const [lastLoginColumn] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login' AND TABLE_SCHEMA = ?
    `, [dbConfig.database]);
    
    if (lastLoginColumn.length === 0) {
      console.log('Adding last_login column to users table...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN last_login TIMESTAMP NULL
      `);
      console.log('✓ Last_login column added');
    } else {
      console.log('✓ Last_login column already exists');
    }
    
    // Update admin users with the correct role
    console.log('Updating admin users...');
    const [updateResult] = await connection.query(`
      UPDATE users 
      SET role = 'admin' 
      WHERE id = 1 OR username = 'admin' OR email = 'admin@example.com'
    `);
    
    console.log(`Updated ${updateResult.affectedRows} admin users`);
    
    // Check for user_projects table
    const [projectTables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'user_projects' AND TABLE_SCHEMA = ?
    `, [dbConfig.database]);
    
    if (projectTables.length === 0) {
      console.log('Creating user_projects table...');
      await connection.query(`
        CREATE TABLE user_projects (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          project_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY (user_id, project_id)
        )
      `);
      console.log('✓ User_projects table created');
    } else {
      console.log('✓ User_projects table already exists');
    }
    
    // Add project associations for all users
    console.log('Adding project associations for all users...');
    const [projects] = await connection.query(`
      SELECT id FROM projects LIMIT 1
    `);
    
    if (projects.length > 0) {
      const projectId = projects[0].id;
      const [users] = await connection.query(`
        SELECT id FROM users
      `);
      
      for (const user of users) {
        try {
          await connection.query(`
            INSERT IGNORE INTO user_projects (user_id, project_id)
            VALUES (?, ?)
          `, [user.id, projectId]);
        } catch (error) {
          console.log(`Error adding project for user ${user.id}:`, error.message);
        }
      }
      
      console.log(`Added project associations for ${users.length} users`);
    }
    
    // Commit the transaction
    await connection.commit();
    console.log('\n✅ Users table update complete!');
    
    // Show the current state
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = ?
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database]);
    
    console.log('\nCurrent columns in users table:');
    columns.forEach(column => {
      console.log(` - ${column.COLUMN_NAME}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error updating users table:', error.message);
    await connection.rollback();
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

// Run the script
fixUsersTable().catch(console.error); 