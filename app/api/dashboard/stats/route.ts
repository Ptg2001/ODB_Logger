import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

interface CountResult {
  count: number
}

// Sample data to use when database connection fails
const sampleData = {
  vehiclesCount: 32,
  projectsCount: 8,
  faultCodesCount: 145,
  activeVehiclesCount: 24,
  severityDistribution: [
    { severity: 'Critical', count: 12 },
    { severity: 'Warning', count: 38 },
    { severity: 'Info', count: 95 }
  ],
  vehiclesByMake: [
    { make: 'Toyota', count: 9 },
    { make: 'Honda', count: 7 },
    { make: 'Ford', count: 5 },
    { make: 'BMW', count: 4 },
    { make: 'Others', count: 7 }
  ],
  recentActivity: [
    { type: 'fault_code', vehicle: 'Toyota Corolla', code: 'P0171', timestamp: new Date().toISOString() },
    { type: 'diagnostic', vehicle: 'Honda Civic', test: 'Full Scan', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { type: 'fault_code', vehicle: 'Ford Focus', code: 'P0300', timestamp: new Date(Date.now() - 172800000).toISOString() },
    { type: 'report', vehicle: 'BMW 3 Series', report: 'Monthly Diagnostic', timestamp: new Date(Date.now() - 259200000).toISOString() }
  ]
};

// Create tables if they don't exist
async function ensureTablesExist() {
  try {
    // Create vehicles table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        make VARCHAR(50) NOT NULL,
        model VARCHAR(50) NOT NULL,
        year INT,
        vin VARCHAR(17),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, [], { logQuery: false });
    
    // Create user_projects table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS user_projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, [], { logQuery: false });
    
    // Create fault_codes table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS fault_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT NOT NULL,
        code VARCHAR(10) NOT NULL,
        description TEXT,
        severity VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, [], { logQuery: false });
    
    // Create sensor_data table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS sensor_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT NOT NULL,
        sensor_type VARCHAR(50) NOT NULL,
        value FLOAT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, [], { logQuery: false });
    
    // Create reports table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, [], { logQuery: false });

    // Insert some sample data if tables are empty
    await insertSampleData();
    
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Insert sample data if tables are empty
async function insertSampleData() {
  try {
    // Check if vehicles table is empty
    const vehiclesCount = await executeQuery('SELECT COUNT(*) as count FROM vehicles', [], { logQuery: false });
    
    if (vehiclesCount[0].count === 0) {
      // Insert sample vehicles
      await executeQuery(`
        INSERT INTO vehicles (make, model, year, vin) VALUES 
        ('Toyota', 'Corolla', 2019, 'JT2BF22K1W0123456'),
        ('Honda', 'Civic', 2020, 'JHMEH6267WS018472'),
        ('Ford', 'Focus', 2018, '1FADP3E29JL123456'),
        ('BMW', '3 Series', 2021, 'WBA8A9C50GK123456')
      `, [], { logQuery: false });
      
      // Get the vehicle IDs
      const vehicles = await executeQuery('SELECT id FROM vehicles', [], { logQuery: false });
      
      // Insert sample fault codes for each vehicle
      for (const vehicle of vehicles) {
        const codesCount = Math.floor(Math.random() * 10) + 1;
        const severities = ['Critical', 'Warning', 'Info'];
        
        for (let i = 0; i < codesCount; i++) {
          const code = `P${Math.floor(1000 + Math.random() * 9000)}`;
          const severity = severities[Math.floor(Math.random() * severities.length)];
          
          await executeQuery(`
            INSERT INTO fault_codes (vehicle_id, code, description, severity) 
            VALUES (?, ?, ?, ?)
          `, [vehicle.id, code, `Description for ${code}`, severity], { logQuery: false });
        }
        
        // Insert sample sensor data
        const sensorTypes = ['Speed', 'Temperature', 'Fuel', 'Battery', 'RPM'];
        for (const type of sensorTypes) {
          await executeQuery(`
            INSERT INTO sensor_data (vehicle_id, sensor_type, value)
            VALUES (?, ?, ?)
          `, [vehicle.id, type, Math.random() * 100], { logQuery: false });
        }
        
        // Insert sample reports
        await executeQuery(`
          INSERT INTO reports (vehicle_id, title, content)
          VALUES (?, ?, ?)
        `, [vehicle.id, 'Monthly Diagnostic', 'Regular maintenance check report'], { logQuery: false });
      }
      
      // Insert sample projects
      await executeQuery(`
        INSERT INTO user_projects (user_id, name, description)
        VALUES 
        (1, 'Fleet Monitoring', 'Monitoring the fleet of company vehicles'),
        (1, 'Emissions Testing', 'Testing vehicles for emissions compliance')
      `, [], { logQuery: false });
    }
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

export async function GET() {
  try {
    // Ensure tables exist and sample data is loaded
    await ensureTablesExist();
    
    // Get the vehicles count
    let vehiclesCount;
    try {
      const vehiclesResult = await executeQuery('SELECT COUNT(*) as count FROM vehicles', [], {
        cacheKey: 'vehicles-count',
        description: 'Dashboard vehicles count'
      });
      vehiclesCount = vehiclesResult[0].count;
    } catch (error) {
      console.error('Error fetching vehicles count:', error);
      vehiclesCount = sampleData.vehiclesCount;
    }

    // Get the projects count
    let projectsCount;
    try {
      const projectsResult = await executeQuery('SELECT COUNT(*) as count FROM user_projects', [], {
        cacheKey: 'projects-count',
        description: 'Dashboard projects count'
      });
      projectsCount = projectsResult[0].count;
    } catch (error) {
      console.error('Error fetching projects count:', error);
      projectsCount = sampleData.projectsCount;
    }

    // Get the fault codes count
    let faultCodesCount;
    try {
      const faultCodesResult = await executeQuery('SELECT COUNT(*) as count FROM fault_codes', [], {
        cacheKey: 'fault-codes-count',
        description: 'Dashboard fault codes count'
      });
      faultCodesCount = faultCodesResult[0].count;
    } catch (error) {
      console.error('Error fetching fault codes count:', error);
      faultCodesCount = sampleData.faultCodesCount;
    }

    // Get the active vehicles count (vehicles with data in the last 30 days)
    let activeVehiclesCount;
    try {
      const activeVehiclesResult = await executeQuery(
        'SELECT COUNT(DISTINCT vehicle_id) as count FROM sensor_data WHERE timestamp > DATE_SUB(NOW(), INTERVAL 30 DAY)',
        [],
        {
          cacheKey: 'active-vehicles-count',
          description: 'Dashboard active vehicles count'
        }
      );
      activeVehiclesCount = activeVehiclesResult[0].count;
    } catch (error) {
      console.error('Error fetching active vehicles count:', error);
      activeVehiclesCount = sampleData.activeVehiclesCount;
    }

    // Get the severity distribution
    let severityDistribution;
    try {
      const severityResult = await executeQuery(
        'SELECT severity, COUNT(*) as count FROM fault_codes GROUP BY severity ORDER BY count DESC',
        [],
        {
          cacheKey: 'severity-distribution',
          description: 'Dashboard severity distribution'
        }
      );
      severityDistribution = severityResult;
    } catch (error) {
      console.error('Error fetching severity distribution:', error);
      severityDistribution = sampleData.severityDistribution;
    }

    // Get the vehicle distribution by make
    let vehiclesByMake;
    try {
      const makeResult = await executeQuery(
        'SELECT make, COUNT(*) as count FROM vehicles GROUP BY make ORDER BY count DESC LIMIT 5',
        [],
        {
          cacheKey: 'vehicles-by-make',
          description: 'Dashboard vehicles by make'
        }
      );
      vehiclesByMake = makeResult;
    } catch (error) {
      console.error('Error fetching vehicles by make:', error);
      vehiclesByMake = sampleData.vehiclesByMake;
    }

    // Get recent activity (most recent fault codes only)
    let recentActivity;
    try {
      const recentResult = await executeQuery(
        `SELECT 
            'fault_code' as type, 
            CONCAT(v.make, ' ', v.model) as vehicle, 
            fc.code, 
            fc.created_at as timestamp
         FROM fault_codes fc
         JOIN vehicles v ON fc.vehicle_id = v.id
         ORDER BY fc.created_at DESC
         LIMIT 10`,
        [],
        {
          cacheKey: 'recent-activity',
          description: 'Dashboard recent activity'
        }
      );
      recentActivity = recentResult;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      recentActivity = sampleData.recentActivity;
    }

    // Get fault code categories
    let faultCodeCategories;
    try {
      // Simulated categories based on fault code prefixes
      const categoriesResult = await executeQuery(
        `SELECT 
            CASE
                WHEN code LIKE 'P0%' THEN 'Engine'
                WHEN code LIKE 'P1%' THEN 'Transmission'
                WHEN code LIKE 'P2%' THEN 'Fuel System'
                WHEN code LIKE 'P3%' THEN 'Emissions'
                WHEN code LIKE 'B%' THEN 'Body'
                WHEN code LIKE 'C%' THEN 'Chassis'
                ELSE 'Other'
            END as name,
            COUNT(*) as total
        FROM fault_codes
        GROUP BY name
        ORDER BY total DESC`,
        [],
        {
          cacheKey: 'fault-code-categories',
          description: 'Dashboard fault code categories'
        }
      );
      faultCodeCategories = categoriesResult;
    } catch (error) {
      console.error('Error fetching fault code categories:', error);
      faultCodeCategories = [
        { name: 'Engine', total: 16 },
        { name: 'Transmission', total: 8 },
        { name: 'Fuel System', total: 12 },
        { name: 'Emissions', total: 9 },
        { name: 'Sensors', total: 7 },
        { name: 'Electrical', total: 5 },
      ];
    }

    return NextResponse.json({
      vehiclesCount,
      projectsCount,
      faultCodesCount,
      activeVehiclesCount,
      severityDistribution,
      vehiclesByMake,
      recentActivity,
      faultCodeCategories
    });
  } catch (error) {
    console.error('Error in dashboard stats API:', error);
    
    // Return sample data if there's an error
    return NextResponse.json({
      ...sampleData,
      faultCodeCategories: [
        { name: 'Engine', total: 16 },
        { name: 'Transmission', total: 8 },
        { name: 'Fuel System', total: 12 },
        { name: 'Emissions', total: 9 },
        { name: 'Sensors', total: 7 },
        { name: 'Electrical', total: 5 },
      ]
    });
  }
} 