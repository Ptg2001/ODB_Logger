import { executeQuery } from '../lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface VehicleRow extends RowDataPacket {
  id: number;
}

// Format date for MySQL
function formatDateForMySQL(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

async function insertComparisonData() {
  console.log('Starting insertion of vehicle comparison data...');

  try {
    // First, create new vehicle entries for comparison
    const vehicles = [
      { 
        name: 'Tata Nexon EV', 
        vin: 'TN2023EV000001', 
        make: 'Tata', 
        model: 'Nexon EV', 
        year: 2023,
        project_id: 1,
        type: 'EV' 
      },
      { 
        name: 'Tata Tigor EV', 
        vin: 'TT2022EV000001', 
        make: 'Tata', 
        model: 'Tigor EV', 
        year: 2022,
        project_id: 1,
        type: 'EV' 
      },
      { 
        name: 'Tata Harrier', 
        vin: 'TH2023IC000001', 
        make: 'Tata', 
        model: 'Harrier', 
        year: 2023,
        project_id: 1,
        type: 'IC' 
      },
      { 
        name: 'Tata Altroz', 
        vin: 'TA2022IC000001', 
        make: 'Tata', 
        model: 'Altroz', 
        year: 2022,
        project_id: 1,
        type: 'IC' 
      },
      { 
        name: 'Tata Safari', 
        vin: 'TS2023IC000001', 
        make: 'Tata', 
        model: 'Safari', 
        year: 2023,
        project_id: 1,
        type: 'IC' 
      },
    ];

    // Insert vehicles and get their IDs
    const vehicleIds: number[] = [];
    for (const vehicle of vehicles) {
      // Check if vehicle with this VIN already exists
      const existingVehicle = await executeQuery(
        'SELECT id FROM vehicles WHERE vin = ?',
        [vehicle.vin]
      ) as VehicleRow[];
      
      if (Array.isArray(existingVehicle) && existingVehicle.length > 0) {
        vehicleIds.push(existingVehicle[0].id);
        console.log(`Vehicle ${vehicle.name} already exists with ID ${existingVehicle[0].id}`);
      } else {
        const result = await executeQuery(
          'INSERT INTO vehicles (name, vin, make, model, year, project_id) VALUES (?, ?, ?, ?, ?, ?)',
          [vehicle.name, vehicle.vin, vehicle.make, vehicle.model, vehicle.year, vehicle.project_id]
        ) as ResultSetHeader;
        
        if (result && 'insertId' in result) {
          vehicleIds.push(result.insertId);
          console.log(`Inserted vehicle ${vehicle.name} with ID ${result.insertId}`);
        }
      }
    }

    // Generate comparison data across multiple timepoints for each vehicle
    const timepoints = 10; // Number of data points per vehicle
    const startDate = new Date('2023-01-01');
    
    // Parameters structure with Type (Mode) and PID mappings
    const parameters = [
      // Mode 1 (Current Data)
      { type: 'fuel_efficiency', pid: '0x01', unit: 'mpg', mode: 1, min: 25, max: 60, ev_value: null as number | null },
      { type: 'speed', pid: '0x0D', unit: 'km/h', mode: 1, min: 0, max: 120, ev_min: 0, ev_max: 140 },
      { type: 'rpm', pid: '0x0C', unit: 'rpm', mode: 1, min: 800, max: 4000, ev_value: 0 },
      { type: 'throttle_position', pid: '0x11', unit: '%', mode: 1, min: 0, max: 100, ev_min: 0, ev_max: 100 },
      { type: 'engine_load', pid: '0x04', unit: '%', mode: 1, min: 10, max: 80, ev_value: null as number | null },
      { type: 'coolant_temp', pid: '0x05', unit: '°C', mode: 1, min: 70, max: 95, ev_min: 20, ev_max: 50 },
      { type: 'battery_voltage', pid: '0x42', unit: 'V', mode: 1, min: 12, max: 14.5, ev_min: 360, ev_max: 420 },
      
      // Mode 2 (Freeze Frame)
      { type: 'freeze_fuel_system', pid: '0x03', unit: '', mode: 2, min: 1, max: 2, ev_value: null as number | null },
      { type: 'freeze_engine_load', pid: '0x04', unit: '%', mode: 2, min: 10, max: 90, ev_value: null as number | null },
      
      // Mode 3 (Trouble Codes)
      { type: 'dtc_count', pid: '', unit: 'count', mode: 3, min: 0, max: 3, ev_min: 0, ev_max: 2 },
      
      // Mode 4 (Clear Codes)
      { type: 'codes_cleared', pid: '', unit: 'boolean', mode: 4, min: 0, max: 1, ev_min: 0, ev_max: 1 },
      
      // Mode 5 (Oxygen Sensor)
      { type: 'o2_sensor_voltage', pid: '0x01', unit: 'V', mode: 5, min: 0.1, max: 0.9, ev_value: null as number | null },
      
      // Mode 6 (Test Results)
      { type: 'test_results', pid: '0x01', unit: '', mode: 6, min: 0, max: 100, ev_min: 0, ev_max: 100 },
      
      // Mode 7 (Pending Codes)
      { type: 'pending_code_count', pid: '', unit: 'count', mode: 7, min: 0, max: 2, ev_min: 0, ev_max: 1 },
      
      // Mode 8 (Control)
      { type: 'control_status', pid: '0x01', unit: '', mode: 8, min: 0, max: 1, ev_min: 0, ev_max: 1 },
      
      // Mode 9 (Vehicle Info)
      { type: 'vin_check', pid: '0x02', unit: 'boolean', mode: 9, min: 1, max: 1, ev_min: 1, ev_max: 1 },
      { type: 'calibration_id', pid: '0x04', unit: '', mode: 9, min: 100, max: 999, ev_min: 500, ev_max: 999 },
      { type: 'ecm_voltage', pid: '0x0A', unit: 'V', mode: 9, min: 11.5, max: 14.5, ev_min: 11.5, ev_max: 14.5 }
    ];
    
    // Insert historical data for each vehicle
    for (let i = 0; i < vehicleIds.length; i++) {
      const vehicleId = vehicleIds[i];
      const vehicle = vehicles[i];
      const isEV = vehicle.type === 'EV';
      
      // Generate data for each timepoint
      for (let t = 0; t < timepoints; t++) {
        const timestamp = new Date(startDate);
        timestamp.setDate(timestamp.getDate() + t * 7); // Weekly data points
        
        // Format timestamp for MySQL
        const formattedTimestamp = formatDateForMySQL(timestamp);
        const currentTimestamp = formatDateForMySQL(new Date());
        
        // Insert data for each parameter
        for (const param of parameters) {
          // Skip parameters that don't apply to EVs
          if (isEV && param.ev_value === null) {
            continue;
          }
          
          let value: number | null;
          if (isEV && param.ev_value !== undefined && param.ev_value !== null) {
            // Use specific EV value if provided
            value = param.ev_value;
          } else if (isEV && param.ev_min !== undefined && param.ev_max !== undefined) {
            // Generate random value in EV range
            value = param.ev_min + Math.random() * (param.ev_max - param.ev_min);
          } else if (!isEV) {
            // Generate random value in normal range for IC vehicles
            value = param.min + Math.random() * (param.max - param.min);
          } else {
            // Skip if no appropriate value can be determined
            continue;
          }
          
          // Round to 2 decimal places if value is not null
          if (value !== null) {
            value = Math.round(value * 100) / 100;
          }
          
          await executeQuery(
            'INSERT INTO historical_data (vehicle_id, timestamp, data_type, value, unit, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [vehicleId, formattedTimestamp, param.type, value, param.unit, currentTimestamp]
          );
        }
        
        // Also insert corresponding live data for the most recent timepoint
        if (t === timepoints - 1) {
          // For simplicity, we'll just add the latest historical data values to live_data
          // For Mode 1 parameters relevant to live_data
          const mode1Params = parameters.filter(p => p.mode === 1);
          
          // Create an object to collect all the values
          const liveDataValues: Record<string, number | null> = {};
          
          for (const param of mode1Params) {
            if (isEV && param.ev_value === null) {
              liveDataValues[param.type] = null; // Skip parameters that don't apply to EVs
              continue;
            }
            
            let value: number | null;
            if (isEV && param.ev_value !== undefined && param.ev_value !== null) {
              value = param.ev_value;
            } else if (isEV && param.ev_min !== undefined && param.ev_max !== undefined) {
              value = param.ev_min + Math.random() * (param.ev_max - param.ev_min);
            } else if (!isEV) {
              value = param.min + Math.random() * (param.max - param.min);
            } else {
              continue;
            }
            
            if (value !== null) {
              value = Math.round(value * 100) / 100;
            }
            liveDataValues[param.type] = value;
          }
          
          // Insert to live_data table
          const liveDataQuery = `
            INSERT INTO live_data (
              vehicle_id, timestamp, 
              speed, rpm, throttle_position, engine_load, 
              coolant_temp, fuel_pressure, intake_pressure, 
              maf, o2_voltage, fuel_level, battery_voltage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          await executeQuery(liveDataQuery, [
            vehicleId, 
            currentTimestamp, 
            liveDataValues.speed || null,
            liveDataValues.rpm || null,
            liveDataValues.throttle_position || null,
            liveDataValues.engine_load || null,
            liveDataValues.coolant_temp || null,
            Math.random() * 50, // fuel_pressure
            Math.random() * 40, // intake_pressure
            Math.random() * 20, // maf
            isEV ? null : (Math.random() * 0.9 + 0.1), // o2_voltage
            Math.random() * 100, // fuel_level
            liveDataValues.battery_voltage || null
          ]);
          
          console.log(`Added live data for vehicle ${vehicle.name}`);
        }
      }
      
      console.log(`Completed data generation for vehicle ${vehicle.name}`);
    }

    console.log('Successfully inserted vehicle comparison data');
  } catch (error) {
    console.error('Error inserting comparison data:', error);
  } finally {
    process.exit(0);
  }
}

insertComparisonData(); 