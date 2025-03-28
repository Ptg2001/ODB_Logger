import { executeQuery } from '../lib/db'

async function updateReportsTable() {
  console.log('Starting reports table update...')
  
  try {
    // Check if format column already exists
    const columnsResult = await executeQuery(`
      SHOW COLUMNS FROM reports LIKE 'format'
    `)
    
    if (Array.isArray(columnsResult) && columnsResult.length === 0) {
      console.log('Adding format column to reports table...')
      
      await executeQuery(`
        ALTER TABLE reports 
        ADD COLUMN format VARCHAR(20) DEFAULT 'pdf' NOT NULL,
        ADD COLUMN size VARCHAR(20),
        ADD COLUMN download_url VARCHAR(255),
        ADD COLUMN data JSON
      `)
      
      console.log('Reports table updated successfully')
    } else {
      console.log('Format column already exists in reports table')
    }
    
    // Display the updated table structure
    const tableStructure = await executeQuery(`
      DESCRIBE reports
    `)
    console.log('Current reports table structure:', tableStructure)
    
  } catch (error) {
    console.error('Error updating reports table:', error)
  }
}

// Execute the update
updateReportsTable() 