import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import puppeteer from 'puppeteer'
import { headers } from 'next/headers'
import { format as formatDate } from 'date-fns'

// Define helper delay function since waitForTimeout isn't available
async function delay(page: any, ms: number) {
  return page.evaluate((timeout: number) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }, ms);
}

// Debug helper with console.error for more visibility
function debugLog(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] VISUAL-PDF: ${message}`
  console.error(logMessage, data ? data : '') // Use console.error for better visibility in logs
}

type ReportParams = Promise<{ reportId: string }>;

export async function GET(
  request: Request,
  { params }: { params: ReportParams }
) {
  let browser: any = null; // Use any type for browser to avoid TypeScript errors
  
  try {
    const { reportId } = await params
    
    debugLog(`Starting PDF generation for report ${reportId}`)
    
    // Get the project ID from query params if available
    const { searchParams } = new URL(request.url)
    const projectIdFromQuery = searchParams.get('project')
    
    debugLog(`Project from query: ${projectIdFromQuery || 'not provided'}`)
    
    // Get the basic report data
    const reportQuery = `
      SELECT r.*, p.name as project_name 
      FROM reports r
      JOIN projects p ON r.project_id = p.id
      WHERE r.id = ?
    `
    const reportResults = await executeQuery(reportQuery, [reportId]) as any[]
    
    if (!reportResults.length) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    
    const report = reportResults[0]
    
    // Use project ID from query params if available, otherwise use the one from the report
    const projectId = projectIdFromQuery || report.project_id
    
    debugLog(`Using real data from database for project ${projectId}`)
    
    // Get the origin for the absolute URL to the visual report page
    const headersList = headers()
    // Host is used for building the URL that puppeteer will access
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const origin = `${protocol}://${host}`
    
    debugLog(`Using origin: ${origin}`)
    
    try {
      // Generate PDF using puppeteer to capture the visual report page
      debugLog('Launching Puppeteer browser')
      
      try {
        // Launch browser with maximum compatibility settings
        browser = await puppeteer.launch({
          headless: true, // Use true instead of 'new' for wider compatibility
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1200,800'
          ],
          ignoreDefaultArgs: ['--disable-extensions'],
          pipe: true // Use pipe instead of WebSocket
        });
        
        debugLog('Browser launched successfully, creating page')
        const page = await browser.newPage();
        
        // Set viewport for consistent rendering
        await page.setViewport({ width: 1200, height: 800 });
        
        // Set a longer timeout for navigation
        await page.setDefaultNavigationTimeout(90000); // 90 seconds
        
        // Create a URL with a dummy project ID if none provided (for testing)
        const projectIdForUrl = projectId || 'project_1'
        
        // Include a timestamp to prevent caching
        const timestamp = Date.now()
        const visualPageUrl = `${origin}/reports/visuals/${reportId}?pdf=true&project=${projectIdForUrl}&t=${timestamp}`;
        debugLog(`Navigating to URL: ${visualPageUrl}`);
        
        // Listen for console logs from the page
        page.on('console', (msg: any) => debugLog(`Page console: ${msg.text()}`));
        page.on('error', (err: Error) => debugLog(`Page error: ${err.toString()}`));
        
        // Navigate to the page and wait for load
        const response = await page.goto(visualPageUrl, { 
          waitUntil: 'networkidle0', // Wait until no more network requests
          timeout: 90000 // 90 seconds
        });
        
        if (!response) {
          throw new Error('No response from page navigation');
        }
        
        const statusCode = response.status();
        debugLog(`Page loaded with status: ${statusCode}`);
        
        if (statusCode !== 200) {
          throw new Error(`Failed to load page: ${statusCode}`);
        }
        
        // Wait extra time for JavaScript and charts to render
        debugLog('Waiting for page to fully render...');
        await delay(page, 10000); // 10 seconds
        
        // Make sure SVGs are present
        const svgCount = await page.evaluate(() => {
          return document.querySelectorAll('svg').length;
        });
        
        debugLog(`Found ${svgCount} SVG elements`);
        
        if (svgCount === 0) {
          // Add test data if no SVGs found
          debugLog('No SVGs found - injecting test data for demo');
          await page.evaluate(() => {
            const testChart = document.createElement('div');
            testChart.innerHTML = `
              <h2>Demo Chart (Sample Data)</h2>
              <svg width="400" height="200">
                <rect width="50" height="100" x="20" y="20" fill="#0088FE"></rect>
                <rect width="50" height="150" x="80" y="20" fill="#00C49F"></rect>
                <rect width="50" height="80" x="140" y="20" fill="#FFBB28"></rect>
                <rect width="50" height="120" x="200" y="20" fill="#FF8042"></rect>
                <text x="20" y="140">Toyota</text>
                <text x="80" y="190">Honda</text>
                <text x="140" y="120">Ford</text>
                <text x="200" y="160">BMW</text>
              </svg>
            `;
            document.body.appendChild(testChart);
          });
          
          // Wait for the test chart to be added
          await delay(page, 1000);
        }
        
        // Generate PDF
        debugLog('Generating PDF...');
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
          }
        });
        
        debugLog(`PDF generated successfully: ${pdfBuffer.length} bytes`);
        
        // Prepare response headers
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', 
          `attachment; filename="Visual_Report_${reportId}_${formatDate(new Date(), 'yyyy-MM-dd')}.pdf"`);
        
        // Close browser before returning response
        await browser.close();
        browser = null;
        
        // Return PDF data
        return new NextResponse(pdfBuffer, { 
          status: 200,
          headers
        });
      } catch (browserError) {
        // Log the browser error
        debugLog(`Browser error: ${browserError instanceof Error ? browserError.message : 'Unknown error'}`);
        
        // Make sure browser is closed
        if (browser) {
          try {
            await browser.close();
          } catch (closeError) {
            debugLog(`Error closing browser: ${closeError instanceof Error ? closeError.message : 'Unknown error'}`);
          }
          browser = null;
        }
        
        throw browserError;
      }
    } catch (puppeteerError: unknown) {
      debugLog(`Puppeteer error: ${puppeteerError instanceof Error ? puppeteerError.message : 'Unknown error'}`);
      
      // Try to generate a text fallback report
      debugLog('Attempting to generate fallback text report');
      
      try {
        // Make sure browser is closed if still open
        if (browser) {
          try {
            await browser.close();
          } catch (closeError) {
            debugLog(`Error closing browser in fallback: ${closeError instanceof Error ? closeError.message : 'Unknown error'}`);
          }
          browser = null;
        }
        
        // Build the URL to fetch report data from the view endpoint
        const viewUrl = `${process.env.NEXT_PUBLIC_BASE_URL || origin}/api/reports/view/${reportId}`
        debugLog(`Fetching report data from: ${viewUrl}?project=${projectId}`)
        
        // Make the request to get report data
        const reportDataResponse = await fetch(`${viewUrl}?project=${projectId}`, {
          headers: {
            'Host': host,
            'Accept': 'application/json'
          }
        })
        
        if (!reportDataResponse.ok) {
          debugLog(`Failed to fetch report data: ${reportDataResponse.status}`)
          throw new Error(`Failed to fetch report data: ${reportDataResponse.status}`)
        }
        
        debugLog('Successfully fetched report data for text fallback')
        const reportData = await reportDataResponse.json()
        
        // Generate a text fallback report
        debugLog('Generating text-based fallback report')
        const textReport = generateTextBasedReport(report, reportData)
        
        // Return as plain text download
        debugLog('Returning text fallback report')
        const headers = new Headers()
        headers.set('Content-Type', 'text/plain')
        headers.set(
          'Content-Disposition',
          `attachment; filename="Visual_Report_Fallback_${formatDate(new Date(), 'yyyy-MM-dd')}.txt"`
        )
        
        return new NextResponse(textReport, { 
          status: 200,
          headers
        })
      } catch (fallbackError) {
        console.error('Error generating fallback report:', fallbackError)
        debugLog(`Fallback report generation failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`)
      }
      
      // If fallback also fails, return the original error
      return NextResponse.json({
        error: 'Failed to generate visual report PDF',
        details: puppeteerError instanceof Error ? puppeteerError.message : 'Unknown error during PDF generation'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error generating visual PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate visual report PDF', details: (error as Error).message },
      { status: 500 }
    )
  }
}

// Helper function for fallback report generation
function generateTextBasedReport(report: any, data: any): string {
  const projectName = data.project_name || 'Project Report';
  
  let text = '';
  
  // Title
  text += '===========================================================\n';
  text += `                ${projectName} Visual Report\n`;
  text += '===========================================================\n\n';
  
  // Metadata
  text += 'REPORT INFORMATION\n';
  text += '-----------------\n';
  text += `Date Generated: ${new Date().toLocaleString()}\n`;
  text += `Report Type: ${report.report_type || 'Comprehensive'}\n`;
  text += `Date Range: ${report.date_from || 'N/A'} to ${report.date_to || 'N/A'}\n\n`;
  
  // Add vehicles data
  if (data.data.vehicles && data.data.vehicles.length > 0) {
    text += 'VEHICLES\n';
    text += '--------\n';
    text += `Total Vehicles: ${data.data.vehicles.length}\n\n`;
    
    // Group vehicles by make
    const makeCount: Record<string, number> = {};
    data.data.vehicles.forEach((vehicle: any) => {
      const make = vehicle.make || 'Unknown';
      makeCount[make] = (makeCount[make] || 0) + 1;
    });
    
    text += 'Vehicles by Make:\n';
    Object.entries(makeCount).forEach(([make, count]) => {
      text += `  - ${make}: ${count}\n`;
    });
    text += '\n';
    
    // List some vehicles
    text += 'Vehicle Details (up to 10):\n';
    data.data.vehicles.slice(0, 10).forEach((vehicle: any, index: number) => {
      text += `  ${index + 1}. ${vehicle.make || 'Unknown'} ${vehicle.model || 'Unknown'} (${vehicle.year || 'Unknown'})\n`;
    });
    text += '\n';
  }
  
  // Add fault codes data
  if (data.data.faultCodes && data.data.faultCodes.length > 0) {
    text += 'FAULT CODES\n';
    text += '-----------\n';
    text += `Total Fault Codes: ${data.data.faultCodes.length}\n\n`;
    
    // Group by severity
    const severityCount: Record<string, number> = {};
    data.data.faultCodes.forEach((code: any) => {
      const severity = code.severity || 'Unknown';
      severityCount[severity] = (severityCount[severity] || 0) + 1;
    });
    
    text += 'Fault Codes by Severity:\n';
    Object.entries(severityCount).forEach(([severity, count]) => {
      text += `  - ${severity}: ${count}\n`;
    });
    text += '\n';
    
    // List some codes
    text += 'Fault Code Details (up to 10):\n';
    data.data.faultCodes.slice(0, 10).forEach((code: any, index: number) => {
      text += `  ${index + 1}. ${code.code || 'Unknown'}: ${code.description || 'No description'} (${code.severity || 'Unknown severity'})\n`;
    });
    text += '\n';
  }
  
  text += '\nNote: This is a text-based report as visual PDF generation failed.\n';
  text += 'Please try again or contact support if you need graphical reports.\n\n';
  
  // Footer
  text += '===========================================================\n';
  text += 'REPORT END\n';
  text += '===========================================================\n';
  
  return text;
} 