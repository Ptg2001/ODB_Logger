import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      projectId, 
      format = 'pdf', 
      reportType = 'comprehensive',
      dateFrom, 
      dateTo,
      includeVehicles = true,
      includeFaultCodes = true,
      includeReadiness = true,
      includeLiveData = true
    } = body

    // Validate required parameters
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Validate format
    const allowedFormats = ['pdf', 'csv', 'txt']
    if (!allowedFormats.includes(format)) {
      return NextResponse.json({ 
        error: `Invalid format. Allowed formats: ${allowedFormats.join(', ')}` 
      }, { status: 400 })
    }

    // Verify project exists
    try {
    const projectQuery = `
      SELECT * FROM projects WHERE id = ?
    `
    const projectResult = await executeQuery(projectQuery, [projectId]) as any[]

    if (!projectResult || projectResult.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const project = projectResult[0]

    // Set date range (use last 30 days if not provided)
    const now = new Date()
    const defaultStartDate = new Date(now)
    defaultStartDate.setDate(now.getDate() - 30)
    
    const from = dateFrom ? new Date(dateFrom) : defaultStartDate
    const to = dateTo ? new Date(dateTo) : now
    
      // Generate a numeric ID for the report
      const reportId = Math.floor(1000000 + Math.random() * 9000000)
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ')
      const reportName = `${project.name} ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`

      // First, check if the reports table has the needed columns
      try {
        // Check current structure
        const describeQuery = `DESCRIBE reports`;
        const tableStructure = await executeQuery(describeQuery) as any[];
        
        // Check for essential columns
        const columnNames = tableStructure.map((col: any) => col.Field.toLowerCase());
        
        // If we don't have the new columns, we need to add them via the admin endpoint
        if (!columnNames.includes('date_from') || 
            !columnNames.includes('date_to') || 
            !columnNames.includes('include_vehicles')) {
          console.log('Report table missing required columns, attempting to dynamically add them');
          
          try {
            // Since we're here because we don't have all the columns, let's try to add them
            const columnsToAdd = [];
            
            if (!columnNames.includes('date_from')) {
              columnsToAdd.push('ADD COLUMN date_from DATE NULL');
            }
            
            if (!columnNames.includes('date_to')) {
              columnsToAdd.push('ADD COLUMN date_to DATE NULL');
            }
            
            if (!columnNames.includes('include_vehicles')) {
              columnsToAdd.push('ADD COLUMN include_vehicles TINYINT(1) DEFAULT 1');
            }
            
            if (!columnNames.includes('include_fault_codes')) {
              columnsToAdd.push('ADD COLUMN include_fault_codes TINYINT(1) DEFAULT 1');
            }
            
            if (!columnNames.includes('include_readiness')) {
              columnsToAdd.push('ADD COLUMN include_readiness TINYINT(1) DEFAULT 1');
            }
            
            if (!columnNames.includes('include_live_data')) {
              columnsToAdd.push('ADD COLUMN include_live_data TINYINT(1) DEFAULT 1');
            }
            
            if (columnsToAdd.length > 0) {
              // Execute ALTER TABLE if needed
              const alterQuery = `ALTER TABLE reports ${columnsToAdd.join(', ')}`;
              console.log('Executing SQL:', alterQuery);
              await executeQuery(alterQuery);
              console.log('Added missing columns to reports table');
            }
          } catch (schemaError) {
            console.error('Error updating table schema:', schemaError);
            // Continue with the insert anyway - it might work if the columns are actually there
          }
        }
      } catch (describeError) {
        console.error('Error checking table structure:', describeError);
        // Continue anyway - the insert will fail if the structure is wrong
      }

      // Check if data column exists - if so, we'll revert to saving JSON
      let useJsonData = false;
      let hasDataColumn = false;
      
      try {
        const descQuery = `DESCRIBE reports`;
        const tableDesc = await executeQuery(descQuery) as any[];
        hasDataColumn = tableDesc.some((col: any) => col.Field.toLowerCase() === 'data');
        useJsonData = hasDataColumn;
      } catch (error) {
        console.error('Error checking for data column:', error);
      }

      // Now try to save the report to the database
      try {
        // Prepare data for query
        const fromDate = from.toISOString().split('T')[0];  // date_from
        const toDate = to.toISOString().split('T')[0];     // date_to
        const includeVehiclesVal = includeVehicles ? 1 : 0;
        const includeFaultCodesVal = includeFaultCodes ? 1 : 0;
        const includeReadinessVal = includeReadiness ? 1 : 0;
        const includeLiveDataVal = includeLiveData ? 1 : 0;
        
        let insertQuery;
        let queryParams;
        
        if (useJsonData) {
          console.log('Using JSON data storage (legacy mode)');
          // Compile JSON data
    const reportData = {
      project,
      dateRange: {
              from: fromDate,
              to: toDate
            },
            metadata: {
              reportType,
              format,
              generatedAt: timestamp,
              includeVehicles,
              includeFaultCodes,
              includeReadiness,
              includeLiveData
            }
          };
          
          const jsonData = JSON.stringify(reportData);
          
          insertQuery = `
        INSERT INTO reports 
        (id, project_id, name, report_type, format, created_at, data) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          
          queryParams = [
            reportId, 
            projectId, 
            reportName,
            reportType,
            format,
            timestamp,
            jsonData
          ];
        } else {
          console.log('Using normalized data storage');
          // First check if we have all the required columns
          if (hasDataColumn) {
            // Use a query with all the columns
            insertQuery = `
              INSERT INTO reports 
              (id, project_id, name, report_type, format, created_at, date_from, date_to, include_vehicles, include_fault_codes, include_readiness, include_live_data) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            queryParams = [
        reportId, 
        projectId, 
        reportName,
        reportType,
        format,
        timestamp,
              fromDate,
              toDate,
              includeVehiclesVal,
              includeFaultCodesVal,
              includeReadinessVal,
              includeLiveDataVal
            ];
          } else {
            // Fallback to a minimal insert if columns don't exist
            insertQuery = `
              INSERT INTO reports 
              (id, project_id, name, report_type, format, created_at) 
              VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            queryParams = [
              reportId, 
              projectId, 
              reportName,
              reportType,
              format,
              timestamp
            ];
          }
        }
        
        await executeQuery(insertQuery, queryParams);
        console.log('Report saved successfully with ID:', reportId);
        
      } catch (dbError: any) {
        console.error('Database error details:', dbError);
        // Check for specific error types
        if (dbError.code === 'ER_BAD_FIELD_ERROR') {
          return NextResponse.json({ 
            error: 'Database schema issue', 
            details: 'Some columns are missing in the reports table. Please run the DB update API first.',
            errorCode: dbError.code,
            originalError: dbError.message
          }, { status: 500 });
        }
        
      return NextResponse.json(
          { error: 'Error saving report', details: dbError.message || String(dbError) },
        { status: 500 }
        );
      }

      // Count vehicles for the project
      let vehicleCount = 0
      try {
        const vehicleCountQuery = `SELECT COUNT(*) as count FROM vehicles WHERE project_id = ?`
        const countResult = await executeQuery(vehicleCountQuery, [projectId]) as any[]
        vehicleCount = countResult[0]?.count || 0
      } catch (error) {
        console.error('Error counting vehicles:', error)
      }

      // Count fault codes for the project
      let faultCodeCount = 0
      try {
        const faultCodeCountQuery = `
          SELECT COUNT(*) as count 
          FROM fault_codes fc
          JOIN vehicles v ON fc.vehicle_id = v.id
          WHERE v.project_id = ?
        `
        const countResult = await executeQuery(faultCodeCountQuery, [projectId]) as any[]
        faultCodeCount = countResult[0]?.count || 0
      } catch (error) {
        console.error('Error counting fault codes:', error)
      }

      // Ensure we have date strings for the response
      const fromDate = from.toISOString().split('T')[0];
      const toDate = to.toISOString().split('T')[0];

    // Return success response with download URL
    return NextResponse.json({
      success: true,
        id: reportId,
      reportId,
      name: reportName,
      format,
      timestamp,
      downloadUrl: `/api/reports/download/${reportId}?format=${format}`,
      summary: {
          dateRange: {
            from: fromDate,
            to: toDate
          },
          vehiclesCount: vehicleCount,
          faultCodesCount: faultCodeCount
        }
      })
    } catch (error) {
      console.error('Error verifying project:', error)
      return NextResponse.json(
        { error: 'Error verifying project', details: (error as Error).message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report', details: (error as Error).message },
      { status: 500 }
    )
  }
} 