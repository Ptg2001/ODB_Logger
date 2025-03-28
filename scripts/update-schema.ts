import mysql from 'mysql2/promise';
import { config } from 'dotenv';

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
  }
};

async function updateSchema() {
  console.log('Starting database schema update...');
  
  let connection;

  try {
    // Create a connection to the database
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Start a transaction
    await connection.beginTransaction();
    console.log('Transaction started');

    // Store results for logging
    const results: string[] = [];
    
    // Check if the users table exists
    const [tables] = await connection.query<mysql.RowDataPacket[]>(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'obd_logger']);
    
    if (tables.length === 0) {
      console.log('The users table does not exist. Creating it first...');
      await connection.execute(`
        CREATE TABLE users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      results.push('Created users table');
    }
    
    // Check if the role column exists in the users table
    const [roleColumn] = await connection.query<mysql.RowDataPacket[]>(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'obd_logger']);
    
    if (roleColumn.length === 0) {
      console.log('Adding role column to users table...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(20) DEFAULT 'viewer'
      `);
      results.push('Added role column to users table');
    } else {
      results.push('Role column already exists');
    }
    
    // Check if the status column exists in the users table
    const [statusColumn] = await connection.query<mysql.RowDataPacket[]>(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'status' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'obd_logger']);
    
    if (statusColumn.length === 0) {
      console.log('Adding status column to users table...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN status VARCHAR(20) DEFAULT 'Active'
      `);
      results.push('Added status column to users table');
    } else {
      results.push('Status column already exists');
    }
    
    // Check if the last_login column exists in the users table
    const [lastLoginColumn] = await connection.query<mysql.RowDataPacket[]>(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'obd_logger']);
    
    if (lastLoginColumn.length === 0) {
      console.log('Adding last_login column to users table...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN last_login TIMESTAMP NULL
      `);
      results.push('Added last_login column to users table');
    } else {
      results.push('Last_login column already exists');
    }
    
    // Check if the user_projects table exists
    const [projectTables] = await connection.query<mysql.RowDataPacket[]>(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'user_projects' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'obd_logger']);
    
    if (projectTables.length === 0) {
      console.log('Creating user_projects table...');
      await connection.execute(`
        CREATE TABLE user_projects (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          project_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY (user_id, project_id)
        )
      `);
      results.push('Created user_projects table');
    } else {
      results.push('User_projects table already exists');
    }
    
    // Update admin users to have admin role
    console.log('Updating admin users...');
    const [updateResult] = await connection.execute<mysql.ResultSetHeader>(`
      UPDATE users 
      SET role = 'admin' 
      WHERE id = 1 OR username = 'admin' OR email = 'admin@example.com'
    `);
    
    results.push(`Updated ${updateResult.affectedRows} admin users`);
    
    // Check current state of users table
    const [users] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT id, username, email, role, status, last_login 
      FROM users 
      LIMIT 5
    `);
    
    console.log('\nCurrent users in the table:');
    console.log(users);
    
    // Commit the transaction
    await connection.commit();
    console.log('Transaction committed');
    
    console.log('\nSchema update results:');
    results.forEach(result => console.log(` - ${result}`));
    
    console.log('\n✅ Schema update complete!');

  } catch (error) {
    // Rollback on error
    if (connection) {
      await connection.rollback();
    }
    console.error('❌ Error updating schema:', error);
  } finally {
    // Close the connection
    if (connection) {
      await connection.end();
    }
    console.log('Database connection closed');
  }
}

// Run the script
updateSchema().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 