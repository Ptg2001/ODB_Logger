import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const vehicleIds = searchParams.get('vehicleIds')
  const dataType = searchParams.get('dataType') || 'speed' // Default to speed

  // Create array of vehicle IDs if provided
  const vehicleIdArray = vehicleIds ? vehicleIds.split(',') : []
  
  try {
    // Need at least 1 vehicle for comparison
    if (vehicleIdArray.length < 1) {
      return NextResponse.json(
        { message: 'At least one vehicle ID is required' },
        { status: 400 }
      )
    }
    
    // Get vehicle labels for comparison
    const vehicleLabelsQuery = `
      SELECT 
        id, 
        CONCAT(make, ' ', model, ' (', year, ')') as label
      FROM vehicles
      WHERE id IN (${vehicleIdArray.map(() => '?').join(',')})
    `
    
    const vehicleLabels = await executeQuery(vehicleLabelsQuery, vehicleIdArray) as any[]
    
    // Create a map of vehicle IDs to labels
    const idToLabelMap = vehicleLabels.reduce((map: any, v: any) => {
      map[v.id] = v.label
      return map
    }, {})
    
    // Extract vehicle names list from the labels
    const vehicleNames = Object.values(idToLabelMap).map(label => String(label));
    
    // Default result structure
    let comparisonData: any[] = [];
    let unit = '';
    
    // Map data type to the corresponding unit
    switch (dataType) {
      case 'speed': unit = 'km/h'; break;
      case 'rpm': unit = 'RPM'; break;
      case 'throttle_position': unit = '%'; break;
      case 'engine_load': unit = '%'; break;
      case 'coolant_temp': unit = '°C'; break;
      case 'fuel_pressure': unit = 'kPa'; break;
      case 'intake_pressure': unit = 'kPa'; break;
      case 'maf': unit = 'g/s'; break;
      case 'o2_voltage': unit = 'V'; break;
      case 'fuel_level': unit = '%'; break;
      case 'battery_voltage': unit = 'V'; break;
      case 'fuel_efficiency': unit = 'MPG'; break;
      default: unit = '';
    }
    
    // First check if the data type is part of live_data direct columns
    const directColumns = ['speed', 'rpm', 'throttle_position', 'engine_load', 'coolant_temp', 
                           'fuel_pressure', 'intake_pressure', 'maf', 'o2_voltage', 
                           'fuel_level', 'battery_voltage'];
    
    if (directColumns.includes(dataType)) {
      // Use direct column query for live_data table
      const query = `
        SELECT 
          vehicle_id,
          timestamp,
          ${dataType} as value
        FROM live_data
        WHERE vehicle_id IN (${vehicleIdArray.map(() => '?').join(',')})
        AND ${dataType} IS NOT NULL
        ORDER BY timestamp
        LIMIT 500
      `;
      
      const data = await executeQuery(query, vehicleIdArray) as any[];
      
      if (data.length > 0) {
        // Group by timestamp
        const timeMap = new Map();
        
        data.forEach(row => {
          const timestamp = new Date(row.timestamp).toISOString().split('T')[0];
          const vehicleLabel = idToLabelMap[row.vehicle_id];
          
          if (!timeMap.has(timestamp)) {
            timeMap.set(timestamp, { timestamp });
          }
          
          const point = timeMap.get(timestamp);
          point[vehicleLabel] = row.value;
        });
        
        comparisonData = Array.from(timeMap.values());
      }
    } else if (dataType === 'fuel_efficiency') {
      // Check historical_data table for fuel_efficiency
      const query = `
        SELECT 
          vehicle_id,
          timestamp,
          value
        FROM historical_data
        WHERE vehicle_id IN (${vehicleIdArray.map(() => '?').join(',')})
        AND data_type = 'fuel_efficiency'
        ORDER BY timestamp
        LIMIT 500
      `;
      
      const data = await executeQuery(query, vehicleIdArray) as any[];
      
      if (data.length > 0) {
        // Group by timestamp
        const timeMap = new Map();
        
        data.forEach(row => {
          const timestamp = new Date(row.timestamp).toISOString().split('T')[0];
          const vehicleLabel = idToLabelMap[row.vehicle_id];
          
          if (!timeMap.has(timestamp)) {
            timeMap.set(timestamp, { timestamp });
          }
          
          const point = timeMap.get(timestamp);
          point[vehicleLabel] = row.value;
        });
        
        comparisonData = Array.from(timeMap.values());
      }
    } else if (dataType === 'dtc_count') {
      // Get fault code counts from fault_codes table
      const faultCodeQuery = `
        SELECT 
          vehicle_id,
          COUNT(*) as count
        FROM fault_codes
        WHERE vehicle_id IN (${vehicleIdArray.map(() => '?').join(',')})
        GROUP BY vehicle_id
      `;
      
      const dtcData = await executeQuery(faultCodeQuery, vehicleIdArray) as any[];
      unit = 'codes';
      
      // Map vehicle IDs to their labels for the bar chart
      if (dtcData.length > 0) {
        // Create a time-point format consistent with other graphs
        const dataPoint: { timestamp: string; [key: string]: any } = { timestamp: 'Current' };
        
        dtcData.forEach((item: any) => {
          const vehicleLabel = idToLabelMap[item.vehicle_id] || `Vehicle ${item.vehicle_id}`;
          dataPoint[vehicleLabel] = item.count;
        });
        
        comparisonData = [dataPoint];
      }
    }
    
    // If no data, use sample data for better UI experience
    if (comparisonData.length === 0) {
      console.log('No comparison data found for', dataType, 'using sample dataset');
      
      // Generate sample data so the UI can display something
      const sampleData = generateSampleData(vehicleNames, dataType);
      
      return NextResponse.json({
        data: sampleData.data,
        vehicles: vehicleNames,
        unit: sampleData.unit,
        isSampleData: true
      });
    }
    
    // Return real data
    return NextResponse.json({
      data: comparisonData,
      vehicles: vehicleNames,
      unit: unit
    });
  } catch (error) {
    console.error('Error fetching vehicle comparison data:', error);
    
    // Generate fallback sample data on error
    const sampleData = generateSampleData(
      vehicleIds ? vehicleIds.split(',').map(id => `Vehicle ${id}`) : ['Vehicle 1', 'Vehicle 2'],
      dataType || 'speed'
    );
    
    return NextResponse.json({
      data: sampleData.data,
      vehicles: sampleData.vehicles,
      unit: sampleData.unit,
      isSampleData: true,
      error: 'An error occurred while fetching vehicle comparison data'
    });
  }
}

// Generate sample vehicle comparison data for better UI experience
function generateSampleData(vehicleNames: string[], dataType: string) {
  const data: any[] = [];
  let unit = '';
  
  switch (dataType) {
    case 'fuel_efficiency':
      unit = 'MPG';
      // Generate time series data for fuel efficiency
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const point: any = { timestamp: dateStr };
        vehicleNames.forEach(vehicle => {
          // Random MPG between 20 and 40
          point[vehicle] = Math.floor(Math.random() * 20) + 20;
        });
        
        data.push(point);
      }
      break;
      
    case 'speed':
      unit = 'km/h';
      // Generate time series data for speed
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const point: any = { timestamp: dateStr };
        vehicleNames.forEach(vehicle => {
          // Random speed between 0 and 120 km/h
          point[vehicle] = Math.floor(Math.random() * 120);
        });
        
        data.push(point);
      }
      break;
      
    case 'dtc_count':
      unit = 'codes';
      // Generate sample data for dtc count - this is a bar chart, not time series
      const dataPoint: { timestamp: string; [key: string]: any } = { timestamp: 'Current' };
      vehicleNames.forEach(vehicle => {
        // Random number of fault codes between 0 and 20
        dataPoint[vehicle] = Math.floor(Math.random() * 20);
      });
      data.push(dataPoint);
      break;
      
    default:
      unit = dataType === 'coolant_temp' ? '°C' : 
             dataType === 'battery_voltage' ? 'V' :
             dataType === 'rpm' ? 'RPM' :
             dataType === 'throttle_position' ? '%' :
             dataType === 'maf' ? 'g/s' :
             dataType === 'fuel_pressure' ? 'kPa' :
             dataType === 'intake_pressure' ? 'kPa' :
             dataType === 'o2_voltage' ? 'V' :
             dataType === 'fuel_level' ? '%' : '';
      
      // Generate time series data for any other parameter
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const point: any = { timestamp: dateStr };
        vehicleNames.forEach(vehicle => {
          // Generate some random value appropriate for the data type
          let value = Math.floor(Math.random() * 100);
          
          if (dataType === 'coolant_temp') value = Math.floor(Math.random() * 50) + 50; // 50-100°C
          if (dataType === 'battery_voltage') value = 11 + Math.random() * 3; // 11-14V
          if (dataType === 'rpm') value = Math.floor(Math.random() * 5000) + 500; // 500-5500 RPM
          if (dataType === 'maf') value = Math.floor(Math.random() * 100) + 10; // 10-110 g/s
          if (dataType === 'fuel_pressure') value = Math.floor(Math.random() * 400) + 100; // 100-500 kPa
          if (dataType === 'intake_pressure') value = Math.floor(Math.random() * 100) + 10; // 10-110 kPa
          if (dataType === 'o2_voltage') value = Math.random() * 1.1; // 0-1.1 V
          if (dataType === 'fuel_level') value = Math.floor(Math.random() * 100); // 0-100%
          
          point[vehicle] = value;
        });
        
        data.push(point);
      }
      break;
  }
  
  // Sort data by timestamp for time series
  data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  return {
    data,
    vehicles: vehicleNames,
    unit
  };
} 