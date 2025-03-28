import { config } from 'dotenv';
import { Pool } from 'pg';

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function insertTestData() {
  try {
    const client = await pool.connect();
    // Your test data insertion code here
    console.log('Test data inserted successfully');
    await client.release();
  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    await pool.end();
  }
}

insertTestData(); 