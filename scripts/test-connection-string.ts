import pgPromise from 'pg-promise'
import { config } from 'dotenv'

config();

// Disable SSL verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const pgp = pgPromise()

// Using connection string from environment variable
const connectionString = process.env.DATABASE_URL

async function testConnection() {
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Testing connection to PostgreSQL database...')
  console.log('Using connection string from environment variable')

  const db = pgp(connectionString)
  
  try {
    const version = await db.one('SELECT version()')
    console.log('Connection successful!')
    console.log('PostgreSQL version:', version.version)
  } catch (error) {
    console.error('Connection failed:', error)
    throw error
  } finally {
    // Close the connection
    pgp.end()
  }
}

testConnection()
  .then(() => {
    console.log('Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Test failed:', error)
    process.exit(1)
  }) 