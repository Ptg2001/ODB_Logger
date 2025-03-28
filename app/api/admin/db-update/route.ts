import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function POST(request: Request) {
  try {
    // Add security check here in production code
    // This is a potentially dangerous endpoint that should be secured

    // Check if the reports table has the needed columns
    try {
      // First check current structure
      const describeQuery = `DESCRIBE reports`;
      const tableStructure = await executeQuery(describeQuery) as any[];
      
      console.log('Current reports table structure:', tableStructure);
      
      // Check for columns we need
      const columns = tableStructure.map((col: any) => col.Field.toLowerCase());
      
      const columnsToAdd = [];
      
      if (!columns.includes('date_from')) {
        columnsToAdd.push('ADD COLUMN date_from DATE');
      }
      
      if (!columns.includes('date_to')) {
        columnsToAdd.push('ADD COLUMN date_to DATE');
      }
      
      if (!columns.includes('include_vehicles')) {
        columnsToAdd.push('ADD COLUMN include_vehicles TINYINT(1) DEFAULT 1');
      }
      
      if (!columns.includes('include_fault_codes')) {
        columnsToAdd.push('ADD COLUMN include_fault_codes TINYINT(1) DEFAULT 1');
      }
      
      if (!columns.includes('include_readiness')) {
        columnsToAdd.push('ADD COLUMN include_readiness TINYINT(1) DEFAULT 1');
      }
      
      if (!columns.includes('include_live_data')) {
        columnsToAdd.push('ADD COLUMN include_live_data TINYINT(1) DEFAULT 1');
      }
      
      // Execute ALTER TABLE if needed
      if (columnsToAdd.length > 0) {
        const alterQuery = `ALTER TABLE reports ${columnsToAdd.join(', ')}`;
        console.log('Executing SQL:', alterQuery);
        
        await executeQuery(alterQuery);
        
        return NextResponse.json({
          success: true,
          message: `Reports table updated with ${columnsToAdd.length} new columns`,
          columns: columnsToAdd
        });
      } else {
        return NextResponse.json({
          success: true,
          message: 'Reports table already has all required columns'
        });
      }
    } catch (error) {
      console.error('Error updating database schema:', error);
      return NextResponse.json(
        { error: 'Failed to update database schema', details: (error as Error).message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in db-update API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
} 