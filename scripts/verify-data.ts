import mysql from 'mysql2/promise'
import { config } from 'dotenv'

config();

// Disable SSL verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

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
}

async function verifyData() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    
    try {
      console.log('Connected to MySQL database. Verifying data...')
      
      // Check projects
      const [projects] = await connection.execute('SELECT id, name, description FROM projects') as any[]
      console.log(`\nProjects (${projects.length} rows):`)
      console.table(projects)
      
      // Check vehicles
      const [vehicles] = await connection.execute('SELECT id, project_id, name, make, model, year FROM vehicles') as any[]
      console.log(`\nVehicles (${vehicles.length} rows):`)
      console.table(vehicles)
      
      // Check live data samples
      const [liveData] = await connection.execute('SELECT vehicle_id, speed, rpm, throttle_position FROM live_data LIMIT 5') as any[]
      console.log(`\nLive Data (${liveData.length} rows shown, sample):`)
      console.table(liveData)
      
      // Check fault codes
      const [faultCodes] = await connection.execute('SELECT vehicle_id, code, description, severity, status FROM fault_codes') as any[]
      console.log(`\nFault Codes (${faultCodes.length} rows):`)
      console.table(faultCodes)
      
      // Check historical data samples
      const [historicalData] = await connection.execute('SELECT vehicle_id, data_type, value, unit FROM historical_data LIMIT 10') as any[]
      console.log(`\nHistorical Data (${historicalData.length} rows shown, sample):`)
      console.table(historicalData)
      
      // Check OBD readiness data
      const [readinessData] = await connection.execute('SELECT * FROM obd_readiness') as any[]
      console.log(`\nOBD Readiness (${readinessData.length} rows):`)
      console.table(readinessData)
      
      // Check freeze frame data
      const [freezeFrameData] = await connection.execute('SELECT vehicle_id, fault_code_id, rpm, speed, engine_load FROM freeze_frame_data') as any[]
      console.log(`\nFreeze Frame Data (${freezeFrameData.length} rows):`)
      console.table(freezeFrameData)
      
      // Check vehicle info
      const [vehicleInfo] = await connection.execute('SELECT vehicle_id, calibration_id, ecu_name FROM vehicle_info') as any[]
      console.log(`\nVehicle Info (${vehicleInfo.length} rows):`)
      console.table(vehicleInfo)
      
      // Check reports
      const [reports] = await connection.execute('SELECT project_id, vehicle_id, name, report_type FROM reports') as any[]
      console.log(`\nReports (${reports.length} rows):`)
      console.table(reports)
      
      // Count of records in each table
      console.log('\nTotal record counts:')
      const tables = ['projects', 'vehicles', 'live_data', 'fault_codes', 'historical_data', 'obd_readiness', 'freeze_frame_data', 'vehicle_info', 'reports']
      for (const table of tables) {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`) as any[]
        console.log(`- ${table}: ${count[0].count} records`)
      }
      
    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('Error verifying data:', error)
    throw error
  }
}

verifyData()
  .then(() => {
    console.log('\nData verification completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nData verification failed:', error)
    process.exit(1)
  }) 