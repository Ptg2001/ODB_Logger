// Script to update all users with a last_login timestamp
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

async function updateLastLogin() {
  console.log('Starting to update last_login for all users...');
  
  // Set up MySQL connection
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('Connected to database');
  
  try {
    // Start a transaction for safety
    await connection.beginTransaction();
    
    // Check if last_login column exists
    const [lastLoginColumn] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login' AND TABLE_SCHEMA = ?
    `, [dbConfig.database]);
    
    if (lastLoginColumn.length === 0) {
      console.log('❌ last_login column does not exist in users table');
      return;
    }
    
    // Get all users
    const [users] = await connection.query(`
      SELECT id, username FROM users
    `);
    
    console.log(`Found ${users.length} users to update`);
    
    // Update each user with a different timestamp (spaced a few hours apart)
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      // Set a timestamp from the past few days with some variation
      // This uses DATE_SUB to subtract a random amount of time from now
      await connection.query(`
        UPDATE users 
        SET last_login = DATE_SUB(NOW(), INTERVAL ? HOUR) 
        WHERE id = ?
      `, [Math.floor(Math.random() * 72), user.id]);
      
      console.log(`✓ Updated last_login for user ${user.username} (ID: ${user.id})`);
    }
    
    // Commit the transaction
    await connection.commit();
    console.log('\n✅ Last login update complete!');
    
    // Show the current values
    const [updatedUsers] = await connection.query(`
      SELECT id, username, last_login 
      FROM users 
      ORDER BY last_login DESC
    `);
    
    console.log('\nCurrent last_login values:');
    updatedUsers.forEach(user => {
      console.log(` - ${user.username} (ID: ${user.id}): ${user.last_login}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error updating last_login:', error.message);
    await connection.rollback();
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

// Run the script
updateLastLogin().catch(console.error); 