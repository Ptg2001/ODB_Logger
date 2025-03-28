import mysql from 'mysql2/promise'
import { config } from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

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
  multipleStatements: true // Important for running multiple SQL statements
};

async function applyFullSchema() {
  // Read the schema.sql file
  const schemaPath = path.join(process.cwd(), 'schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
  
  // Split the SQL by semicolons to execute each statement separately
  const statements = schemaSQL
    .split(';')
    .filter(statement => statement.trim() !== '');
  
  // Set up MySQL connection
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('Connected to database');
  console.log(`Found ${statements.length} SQL statements to execute`);
  
  try {
    // Start a transaction
    await connection.beginTransaction();
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
        
        await connection.query(statement);
        console.log('✓ Success');
      } catch (error) {
        // If the error is about the table already existing, continue
        if (error.message.includes('already exists')) {
          console.log(`⚠️ Table already exists, continuing...`);
        } else {
          throw error;
        }
      }
    }
    
    // Commit the transaction
    await connection.commit();
    console.log('\n✅ Schema successfully applied');
    
    // Verify the users table has all required columns
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = ?
    `, [dbConfig.database]);
    
    console.log('\nVerifying users table columns:');
    const columnNames = columns.map(col => col.COLUMN_NAME);
    
    ['id', 'username', 'email', 'password_hash', 'role', 'status', 'last_login']
      .forEach(requiredCol => {
        if (columnNames.includes(requiredCol)) {
          console.log(`✓ ${requiredCol} exists`);
        } else {
          console.log(`❌ ${requiredCol} is missing!`);
        }
      });
    
    // Check user_projects table
    try {
      const [projectTable] = await connection.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'user_projects' AND TABLE_SCHEMA = ?
      `, [dbConfig.database]);
      
      if (projectTable.length > 0) {
        console.log('\n✓ user_projects table exists');
      } else {
        console.log('\n❌ user_projects table is missing!');
      }
    } catch (error) {
      console.log('\n❌ Error checking user_projects table:', error.message);
    }
    
  } catch (error) {
    console.error('\n❌ Error applying schema:', error.message);
    await connection.rollback();
  } finally {
    await connection.end();
  }
}

// Run the script
applyFullSchema().catch(console.error); 