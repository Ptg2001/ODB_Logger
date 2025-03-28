import { executeQuery } from '../lib/db'

async function testDatabaseConnection() {
  console.log('Testing database connection...')
  
  try {
    // Try a simple query to test the connection
    const result = await executeQuery('SELECT 1 AS test')
    console.log('Database connection successful!')
    console.log('Database query result:', result)
    
    // Try checking if the reports table exists
    const tablesResult = await executeQuery(`
      SHOW TABLES LIKE 'reports'
    `)
    
    if (Array.isArray(tablesResult) && tablesResult.length > 0) {
      console.log('Reports table exists')
      
      // Get reports table structure
      const tableStructure = await executeQuery(`
        DESCRIBE reports
      `)
      console.log('Reports table structure:', tableStructure)
    } else {
      console.log('Reports table does not exist yet. Creating it...')
      
      try {
        // Create reports table if it doesn't exist
        await executeQuery(`
          CREATE TABLE IF NOT EXISTS reports (
            id VARCHAR(36) PRIMARY KEY,
            project_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            report_type VARCHAR(50) NOT NULL,
            format VARCHAR(20) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            data JSON,
            FOREIGN KEY (project_id) REFERENCES projects(id)
          )
        `)
        console.log('Reports table created successfully')
      } catch (error) {
        console.error('Error creating reports table:', error)
      }
    }
    
  } catch (error) {
    console.error('Database connection failed:', error)
  }
}

// Execute the test
testDatabaseConnection() 