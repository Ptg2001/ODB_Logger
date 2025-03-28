import pgPromise from 'pg-promise'
import { config } from 'dotenv'

config();

// Disable SSL verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const pgp = pgPromise()

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 5432,
  ssl: true
}

async function testConnection() {
  console.log('Testing connection to PostgreSQL database...')
  console.log(`Host: ${dbConfig.host}`)
  console.log(`Port: ${dbConfig.port}`)
  console.log(`User: ${dbConfig.user}`)
  console.log(`Database: ${dbConfig.database}`)

  const db = pgp(dbConfig)
  
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