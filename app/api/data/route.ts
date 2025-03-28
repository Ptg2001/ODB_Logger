import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// Cache duration in milliseconds
const CACHE_TTL = 60 * 1000; // 1 minute for frequently changing data

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'default';
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;
    
    // Different cache durations based on data type
    const cacheDuration = type === 'historical' ? CACHE_TTL * 10 : CACHE_TTL;
    
    // Create cache key based on query parameters
    const cacheKey = `data:${type}:${limit}:${page}`;
    
    // Build query based on data type
    let query = '';
    let params: any[] = [];
    
    switch (type) {
      case 'live':
        query = `SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        params = [limit, offset];
        break;
      case 'historical':
        query = `SELECT DATE(timestamp) as date, 
                AVG(value) as avg_value, 
                MAX(value) as max_value, 
                MIN(value) as min_value, 
                COUNT(*) as count 
                FROM sensor_data 
                GROUP BY DATE(timestamp) 
                ORDER BY date DESC 
                LIMIT ? OFFSET ?`;
        params = [limit, offset];
        break;
      case 'faults':
        query = `SELECT * FROM fault_codes ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        params = [limit, offset];
        break;
      default:
        query = `SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        params = [limit, offset];
    }
    
    // Execute query with caching
    const data = await executeQuery(query, params, {
      cacheKey,
      cacheTTL: cacheDuration,
      skipCache: false, // Enable caching by default
      logQuery: true,   // Enable internal logging to the debug panel
      description: `Fetch ${type} data (page ${page}, limit ${limit})`
    });
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM sensor_data${type === 'historical' ? ' GROUP BY DATE(timestamp)' : ''}`;
    const countResults = await executeQuery(countQuery, [], {
      cacheKey: `count:${type}`,
      cacheTTL: cacheDuration,
      skipCache: false,
      logQuery: true,
      description: `Count ${type} data for pagination`
    });
    
    const total = Array.isArray(countResults) && countResults.length > 0 
      ? type === 'historical' 
        ? countResults.length 
        : (countResults[0] as any).total
      : 0;
    
    // Return data with pagination info
    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    // Use internal logging system instead of console.error
    // Error is already logged by the executeQuery function
    return NextResponse.json(
      { error: 'Failed to fetch data', message: error.message },
      { status: 500 }
    );
  }
} 