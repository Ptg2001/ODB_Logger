import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { format as formatDate } from 'date-fns'
import { Readable } from 'stream'

type ReportParams = Promise<{ reportId: string }>;

export async function GET(
  request: Request,
  { params }: { params: ReportParams }
) {
  try {
    const { reportId } = await params
    const { searchParams } = new URL(request.url)
    const fileFormat = searchParams.get('format') || 'pdf'

    // Validate the reportId
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    // Validate format
    const allowedFormats = ['pdf', 'csv', 'txt']
    if (!allowedFormats.includes(fileFormat)) {
      return NextResponse.json({ 
        error: `Invalid format. Allowed formats: ${allowedFormats.join(', ')}` 
      }, { status: 400 })
    }

    // Get report metadata from database
    const reportQuery = `
      SELECT * FROM reports WHERE id = ?
    `
    const reportResult = await executeQuery(reportQuery, [reportId]) as any[]

    if (!reportResult || reportResult.length === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const report = reportResult[0]
    
    // Check if this report uses JSON data (legacy format) or normalized data
    let hasJsonData = report.data != null && report.data !== '';
    
    // Collect data for the report
    let reportData: any = {}
    
    try {
      if (hasJsonData) {
        // Handle JSON data approach (legacy)
        console.log('Using legacy JSON data storage for report download');
        try {
          // Parse JSON data
          reportData = JSON.parse(report.data);
          
          // If the parsed data doesn't include project, still fetch it
          if (!reportData.project) {
            // Get basic project info
            const projectQuery = `
              SELECT * FROM projects WHERE id = ?
            `
            const projectResult = await executeQuery(projectQuery, [report.project_id]) as any[]
            if (projectResult && projectResult.length > 0) {
              reportData.project = projectResult[0];
            }
          }
          
          // Ensure we have metadata
          if (!reportData.metadata) {
            reportData.metadata = {
              reportType: report.report_type,
              format: report.format,
              generatedAt: report.created_at
            };
          }
        } catch (jsonError) {
          console.error('Error parsing JSON data:', jsonError);
          // If JSON parsing fails, fall back to normalized approach
          hasJsonData = false;
        }
      }
      
      if (!hasJsonData) {
        // Use normalized approach - fetch data from relational tables
        console.log('Using normalized data storage for report download');
        
        // Get project data
        const projectQuery = `
          SELECT * FROM projects WHERE id = ?
        `
        const projectResult = await executeQuery(projectQuery, [report.project_id]) as any[]
        
        if (!projectResult || projectResult.length === 0) {
          return NextResponse.json({ error: 'Project not found for this report' }, { status: 404 })
        }
        
        const project = projectResult[0]
        
        // Determine if we have include flags in the report table
        const hasIncludeFlags = 
          report.hasOwnProperty('include_vehicles') || 
          report.hasOwnProperty('include_fault_codes') ||
          report.hasOwnProperty('include_readiness') ||
          report.hasOwnProperty('include_live_data');
        
        // Get vehicles if needed
        let vehicles = []
        if (!hasIncludeFlags || report.include_vehicles) {
          try {
        const vehiclesQuery = `
          SELECT * FROM vehicles WHERE project_id = ?
        `
            vehicles = await executeQuery(vehiclesQuery, [report.project_id]) as any[] || []
          } catch (error) {
            console.error('Error fetching vehicles:', error);
          }
        }
        
        // Get vehicle IDs for related queries
        const vehicleIds = vehicles.map((v: any) => v.id)
        
        // Get fault codes if needed
        let faultCodes = []
        if ((!hasIncludeFlags || report.include_fault_codes) && vehicleIds.length > 0) {
          try {
        const faultCodesQuery = `
          SELECT fc.*, v.make, v.model
          FROM fault_codes fc
          JOIN vehicles v ON fc.vehicle_id = v.id
          WHERE v.project_id = ?
        `
            faultCodes = await executeQuery(faultCodesQuery, [report.project_id]) as any[] || []
          } catch (error) {
            console.error('Error fetching fault codes for report:', error)
          }
        }
        
        // Get readiness data if needed
        let readinessData = []
        if ((!hasIncludeFlags || report.include_readiness) && vehicleIds.length > 0) {
          try {
            const readinessTableCheck = `
              SELECT COUNT(*) as table_exists 
              FROM information_schema.tables 
              WHERE table_schema = DATABASE() 
              AND table_name = 'obd_readiness'
            `
            const tableCheck = await executeQuery(readinessTableCheck) as any[]
            
            if (tableCheck[0].table_exists > 0) {
              const readinessQuery = `
                SELECT r.*, v.make, v.model, v.name as vehicle_name
                FROM obd_readiness r
                JOIN vehicles v ON r.vehicle_id = v.id
                WHERE v.project_id = ?
                ORDER BY r.timestamp DESC
                LIMIT 200
              `
              readinessData = await executeQuery(readinessQuery, [report.project_id]) as any[] || []
            }
          } catch (error) {
            console.error('Error fetching readiness data:', error)
          }
        }
        
        // Get live data if needed
        let liveData = []
        if ((!hasIncludeFlags || report.include_live_data) && vehicleIds.length > 0) {
          try {
            const liveDataTableCheck = `
              SELECT COUNT(*) as table_exists 
              FROM information_schema.tables 
              WHERE table_schema = DATABASE() 
              AND table_name = 'live_data'
            `
            const tableCheck = await executeQuery(liveDataTableCheck) as any[]
            
            if (tableCheck[0].table_exists > 0) {
              const liveDataQuery = `
                SELECT ld.*, v.make, v.model, v.name as vehicle_name
                FROM live_data ld
                JOIN vehicles v ON ld.vehicle_id = v.id
                WHERE v.project_id = ? 
                ORDER BY ld.created_at DESC
                LIMIT 100
              `
              liveData = await executeQuery(liveDataQuery, [report.project_id]) as any[] || []
            }
          } catch (error) {
            console.error('Error fetching live data:', error)
          }
        }
        
        // Determine report date range from stored data or default to last 30 days
        const now = new Date();
        const defaultFrom = new Date(now);
        defaultFrom.setDate(now.getDate() - 30);
        
        const from = report.date_from ? new Date(report.date_from) : defaultFrom;
        const to = report.date_to ? new Date(report.date_to) : now;
        
        // Compile the report data from relational tables
        reportData = {
          project,
          dateRange: {
            from: from.toISOString().split('T')[0],
            to: to.toISOString().split('T')[0]
          },
          vehicles,
          faultCodes,
          readinessData,
          liveData,
          metadata: {
            reportType: report.report_type,
            format: report.format,
            generatedAt: report.created_at,
            includeVehicles: !!report.include_vehicles,
            includeFaultCodes: !!report.include_fault_codes,
            includeReadiness: !!report.include_readiness,
            includeLiveData: !!report.include_live_data
          }
        }
      }
    } catch (error) {
      console.error('Error collecting report data:', error)
      return NextResponse.json({ 
        error: 'Error collecting report data', 
        details: (error as Error).message 
      }, { status: 500 })
    }

    // Generate report content based on format
    let content: any = '';
    let headers = new Headers();
    const fileName = `${report.name.replace(/\s+/g, '_')}_${formatDate(new Date(), 'yyyyMMdd')}.${fileFormat}`;
    
    if (fileFormat === 'csv') {
      content = generateCsvReport(reportData);
      headers.set('Content-Type', 'text/csv');
      headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return new NextResponse(content, { headers });
    } 
    else if (fileFormat === 'txt' || fileFormat === 'pdf') {
      // For both TXT and PDF formats, generate the text-based preview
      content = generateTextBasedPdfPreview(reportData);
      headers.set('Content-Type', 'text/plain');
      
      // Set proper extension for TXT files
      const fileExtension = fileFormat === 'txt' ? '.txt' : '.pdf';
      headers.set('Content-Disposition', `attachment; filename="${report.name.replace(/\s+/g, '_')}_${formatDate(new Date(), 'yyyyMMdd')}${fileExtension}"`);
      
      return new NextResponse(content, { headers });
    }

    return NextResponse.json({ error: 'Unknown format' }, { status: 400 });
  } catch (error) {
    console.error('Error generating report download:', error)
    return NextResponse.json(
      { error: 'Failed to download report', details: (error as Error).message },
      { status: 500 }
    )
  }
}

// Helper function to generate a CSV report
function generateCsvReport(data: any): string {
  let csvContent = 'Project,Date Generated\n';
  const project = data.project;
  
  if (project) {
    csvContent += `${project.name},${new Date().toISOString()}\n\n`;
  }
  
  // Add vehicles section
  if (data.vehicles && data.vehicles.length > 0) {
    csvContent += '\nVehicles\n';
    csvContent += 'ID,Make,Model,Year,VIN\n';
    
    data.vehicles.forEach((vehicle: any) => {
      csvContent += `${vehicle.id},${vehicle.make},${vehicle.model},${vehicle.year || ''},${vehicle.vin || ''}\n`;
    });
  }
  
  // Add fault codes section
  if (data.faultCodes && data.faultCodes.length > 0) {
    csvContent += '\nFault Codes\n';
    csvContent += 'Vehicle,Code,Description,Severity,Status\n';
    
    data.faultCodes.forEach((faultCode: any) => {
      const vehicleName = `${faultCode.make || ''} ${faultCode.model || ''}`.trim() || `Vehicle ID ${faultCode.vehicle_id}`;
      csvContent += `${vehicleName},${faultCode.code || ''},${faultCode.description || ''},${faultCode.severity || ''},${faultCode.status || ''}\n`;
    });
  }
  
  // Add readiness data section
  if (data.readinessData && data.readinessData.length > 0) {
    csvContent += '\nOBD Readiness\n';
    csvContent += 'Vehicle,Status,Timestamp\n';
    
    data.readinessData.forEach((item: any) => {
      const vehicleName = item.vehicle_name || `${item.make || ''} ${item.model || ''}`.trim() || `Vehicle ID ${item.vehicle_id}`;
      csvContent += `${vehicleName},${item.status || ''},${new Date(item.timestamp).toLocaleString()}\n`;
    });
  }
  
  // Add live data section
  if (data.liveData && data.liveData.length > 0) {
    csvContent += '\nLive Data\n';
    csvContent += 'Vehicle,Parameter,Value,Unit,Timestamp\n';
    
    data.liveData.forEach((item: any) => {
      const vehicleName = item.vehicle_name || `${item.make || ''} ${item.model || ''}`.trim() || `Vehicle ID ${item.vehicle_id}`;
      csvContent += `${vehicleName},${item.parameter || ''},${item.value || ''},${item.unit || ''},${new Date(item.created_at).toLocaleString()}\n`;
    });
  }
  
  return csvContent;
}

// Helper function to generate a text-based PDF preview
function generateTextBasedPdfPreview(data: any): string {
  const project = data.project || {};
  const dateRange = data.dateRange || {};
  const vehicles = data.vehicles || [];
  const faultCodes = data.faultCodes || [];
  const readinessData = data.readinessData || [];
  const liveData = data.liveData || [];
  const metadata = data.metadata || {};
  
  let text = '';
  
  // Title
  text += '===========================================================\n';
  text += `                ${project.name || 'Project'} Report\n`;
  text += '===========================================================\n\n';
  
  // Metadata
  text += 'REPORT INFORMATION\n';
  text += '-----------------\n';
  text += `Date Generated: ${new Date().toLocaleString()}\n`;
  text += `Report Type: ${metadata.reportType || 'Comprehensive'}\n`;
  text += `Date Range: ${dateRange.from || 'N/A'} to ${dateRange.to || 'N/A'}\n\n`;
  
  // Project Information
  text += 'PROJECT INFORMATION\n';
  text += '------------------\n';
  text += `Project Name: ${project.name || 'N/A'}\n`;
  text += `Description: ${project.description || 'N/A'}\n`;
  text += `Created: ${project.created_at ? new Date(project.created_at).toLocaleString() : 'N/A'}\n\n`;
  
  // Vehicles Summary
  text += 'VEHICLES SUMMARY\n';
  text += '---------------\n';
  text += `Total Vehicles: ${vehicles.length}\n\n`;
  
  if (vehicles.length > 0) {
    text += 'VEHICLES\n';
    text += '--------\n';
    vehicles.forEach((vehicle: any, index: number) => {
      text += `[${index + 1}] ${vehicle.make || ''} ${vehicle.model || ''} (${vehicle.year || 'N/A'})\n`;
      text += `    VIN: ${vehicle.vin || 'N/A'}\n`;
      text += `    Status: ${vehicle.status || 'N/A'}\n`;
      text += '\n';
    });
  }
  
  // Fault Codes Summary
  text += 'FAULT CODES SUMMARY\n';
  text += '-------------------\n';
  text += `Total Fault Codes: ${faultCodes.length}\n\n`;
  
  if (faultCodes.length > 0) {
    text += 'FAULT CODES\n';
    text += '-----------\n';
    faultCodes.forEach((code: any, index: number) => {
      const vehicleName = `${code.make || ''} ${code.model || ''}`.trim() || `Vehicle ID ${code.vehicle_id}`;
      text += `[${index + 1}] ${code.code || 'N/A'}: ${code.description || 'N/A'}\n`;
      text += `    Vehicle: ${vehicleName}\n`;
      text += `    Severity: ${code.severity || 'N/A'}\n`;
      text += `    Status: ${code.status || 'N/A'}\n`;
      text += '\n';
    });
  }
  
  // Readiness Data
  if (readinessData.length > 0) {
    text += 'OBD READINESS\n';
    text += '-------------\n';
    const groupedByVehicle = readinessData.reduce((acc: any, item: any) => {
      const key = item.vehicle_id;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
    
    Object.keys(groupedByVehicle).forEach((vehicleId) => {
      const items = groupedByVehicle[vehicleId];
      if (items.length > 0) {
        const item = items[0];
        const vehicleName = item.vehicle_name || `${item.make || ''} ${item.model || ''}`.trim() || `Vehicle ID ${item.vehicle_id}`;
        text += `Vehicle: ${vehicleName}\n`;
        items.slice(0, 5).forEach((readiness: any) => {
          text += `    Status: ${readiness.status || 'N/A'} (${new Date(readiness.timestamp).toLocaleString()})\n`;
        });
        text += '\n';
      }
    });
  }
  
  // Live Data Summary
  if (liveData.length > 0) {
    text += 'LIVE DATA SUMMARY\n';
    text += '----------------\n';
    text += `Total Records: ${liveData.length}\n\n`;
    text += 'Sample of data (limited to 10 records):\n';
    
    liveData.slice(0, 10).forEach((item: any, index: number) => {
      const vehicleName = item.vehicle_name || `${item.make || ''} ${item.model || ''}`.trim() || `Vehicle ID ${item.vehicle_id}`;
      text += `[${index + 1}] ${item.parameter || 'N/A'}: ${item.value || 'N/A'} ${item.unit || ''}\n`;
      text += `    Vehicle: ${vehicleName}\n`;
      text += `    Timestamp: ${new Date(item.created_at).toLocaleString()}\n`;
      text += '\n';
    });
  }
  
  // Footer
  text += '===========================================================\n';
  text += 'REPORT END\n';
  text += '===========================================================\n';
  
  return text;
} 