// Type imports only for TypeScript - no runtime impact
import type { Pool, PoolConnection } from 'mysql2/promise';
import { LRUCache } from 'lru-cache';
import { Pool as PgPool } from 'pg';

// Server-side only check
const isServer = typeof window === 'undefined';

// Type definitions - available on both client and server
type DbLogEntry = {
  timestamp: Date;
  operation: string;
  success: boolean;
  duration: number;
  message?: string;
};

// Query options
export type QueryOptions = {
  cacheKey?: string;
  cacheTTL?: number;
  skipCache?: boolean;
  logQuery?: boolean;
  description?: string;
};

// Transaction options
export type TransactionOptions = {
  logTransaction?: boolean;
  description?: string;
};

// In-memory log storage - accessible on both client and server
const MAX_LOGS = 100;
const dbLogs: DbLogEntry[] = [];

// Add a log entry without printing to console
function addLogEntry(entry: DbLogEntry) {
  // Add to the front to show newest first
  dbLogs.unshift(entry);
  
  // Keep logs under the limit
  if (dbLogs.length > MAX_LOGS) {
    dbLogs.pop();
  }
}

// Get logs for the debug panel - safe to call from client or server
export function getDbLogs(): DbLogEntry[] {
  return [...dbLogs];
}

// Clear logs - safe to call from client or server
export function clearDbLogs() {
  dbLogs.length = 0;
}

// LRU cache for query results
const queryCache = new LRUCache<string, any>({
  // Default max size of 100 items
  max: 100,
  // Default TTL of 60 seconds if not specified
  ttl: 1000 * 60,
});

// Global connection pool - server side only
let connectionPool: any = null;

// Server-side only database functions
// These will only be defined on the server
let getConnectionPool: () => Promise<any>;
let executeQuery: (query: string, params?: any[], options?: QueryOptions) => Promise<any>;
let executeTransaction: (queries: Array<{ query: string; params: any[] }>, options?: TransactionOptions) => Promise<any>;
let getConnection: () => Promise<any>;
let clearQueryCache: () => void;
let closeConnectionPool: () => Promise<void>;

// Initialize server-side functions
if (isServer) {
  // Disable SSL verification for development
  // This is safe because it only runs on the server
  if (isServer && process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
  
  // Create these functions only on the server
  getConnectionPool = async () => {
    if (connectionPool) return connectionPool;
    
    const startTime = performance.now();
    
    try {
      // Dynamically import mysql2 - this will only happen on the server
      const mysql = await import('mysql2/promise');
      
      // Use environment variables for database configuration
      const dbConfig: any = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: {
          rejectUnauthorized: false
        }
      };
      
      connectionPool = mysql.createPool(dbConfig);
      
      // Log successful connection pool creation
      addLogEntry({
        timestamp: new Date(),
        operation: 'CONNECTION_POOL',
        success: true,
        duration: performance.now() - startTime,
        message: 'Connection pool created successfully'
      });
      
      return connectionPool;
    } catch (error) {
      // Log error if connection pool creation fails
      addLogEntry({
        timestamp: new Date(),
        operation: 'CONNECTION_POOL',
        success: false,
        duration: performance.now() - startTime,
        message: error instanceof Error ? error.message : 'Unknown error creating connection pool'
      });
      
      throw error;
    }
  };
  
  getConnection = async () => {
    const pool = await getConnectionPool();
    const startTime = performance.now();
    
    try {
      const connection = await pool.getConnection();
      
      // Log successful connection acquisition
      addLogEntry({
        timestamp: new Date(),
        operation: 'CONNECTION',
        success: true,
        duration: performance.now() - startTime,
        message: 'Database connection acquired'
      });
      
      return connection;
    } catch (error) {
      // Log error if connection acquisition fails
      addLogEntry({
        timestamp: new Date(),
        operation: 'CONNECTION',
        success: false,
        duration: performance.now() - startTime,
        message: error instanceof Error ? error.message : 'Unknown error acquiring connection'
      });
      
      throw error;
    }
  };
  
  executeQuery = async (
    query: string, 
    params: any[] = [], 
    options: QueryOptions = {}
  ) => {
    const { 
      cacheKey = '', 
      cacheTTL, 
      skipCache = false,
      logQuery = false,
      description = ''
    } = options;
    
    const startTime = performance.now();
    let success = false;
    let resultMessage = '';
    
    // Check cache first if we have a cache key and not skipping cache
    if (cacheKey && !skipCache) {
      const cachedResult = queryCache.get(cacheKey);
      if (cachedResult !== undefined) {
        // Log cache hit
        if (logQuery) {
          addLogEntry({
            timestamp: new Date(),
            operation: 'QUERY_CACHE',
            success: true,
            duration: performance.now() - startTime,
            message: `Cache hit for: ${description || cacheKey}`
          });
        }
        return cachedResult;
      }
    }
    
    try {
      const pool = await getConnectionPool();
      const [results] = await pool.query(query, params);
      success = true;
      
      // Calculate result size for logging
      const resultCount = Array.isArray(results) ? results.length : 1;
      resultMessage = `${description ? description + ': ' : ''}Results: ${resultCount} row(s)`;
      
      // Cache results if we have a cache key
      if (cacheKey && !skipCache) {
        queryCache.set(cacheKey, results, {
          ttl: cacheTTL // undefined will use the default TTL
        });
      }
      
      // Log the query if requested
      if (logQuery) {
        addLogEntry({
          timestamp: new Date(),
          operation: 'QUERY',
          success: true,
          duration: performance.now() - startTime,
          message: resultMessage
        });
      }
      
      return results;
    } catch (error) {
      success = false;
      
      // Format error message for logging
      resultMessage = error instanceof Error 
        ? `Error: ${error.message}` 
        : 'Unknown error executing query';
      
      // Always log errors
      addLogEntry({
        timestamp: new Date(),
        operation: 'QUERY',
        success: false,
        duration: performance.now() - startTime,
        message: `${description ? description + ': ' : ''}${resultMessage}`
      });
      
      throw error;
    }
  };
  
  executeTransaction = async (
    queries: Array<{ query: string; params: any[] }>,
    options: TransactionOptions = {}
  ) => {
    const { logTransaction = false, description = '' } = options;
    const startTime = performance.now();
    let success = false;
    
    const pool = await getConnectionPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const results = [];
      
      for (const { query, params } of queries) {
        const [result] = await connection.query(query, params);
        results.push(result);
      }
      
      await connection.commit();
      success = true;
      
      // Log transaction if requested
      if (logTransaction) {
        addLogEntry({
          timestamp: new Date(),
          operation: 'TRANSACTION',
          success: true,
          duration: performance.now() - startTime,
          message: `${description || 'Transaction'}: ${queries.length} queries executed successfully`
        });
      }
      
      return results;
    } catch (error) {
      // Rollback on error
      await connection.rollback();
      
      // Format error message for logging
      const errorMessage = error instanceof Error 
        ? `Error: ${error.message}` 
        : 'Unknown error executing transaction';
      
      // Always log transaction errors
      addLogEntry({
        timestamp: new Date(),
        operation: 'TRANSACTION',
        success: false,
        duration: performance.now() - startTime,
        message: `${description || 'Transaction'}: ${errorMessage}`
      });
      
      throw error;
    } finally {
      connection.release();
    }
  };
  
  clearQueryCache = () => {
    queryCache.clear();
    
    addLogEntry({
      timestamp: new Date(),
      operation: 'CACHE',
      success: true,
      duration: 0,
      message: 'Query cache cleared'
    });
  };
  
  closeConnectionPool = async () => {
    const startTime = performance.now();
    
    if (connectionPool) {
      try {
        await connectionPool.end();
        connectionPool = null;
        
        addLogEntry({
          timestamp: new Date(),
          operation: 'CONNECTION_POOL',
          success: true,
          duration: performance.now() - startTime,
          message: 'Connection pool closed successfully'
        });
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? `Error: ${error.message}` 
          : 'Unknown error closing connection pool';
        
        addLogEntry({
          timestamp: new Date(),
          operation: 'CONNECTION_POOL',
          success: false,
          duration: performance.now() - startTime,
          message: errorMessage
        });
        
        throw error;
      }
    }
  };
} else {
  // Client-side stubs that log errors if accidentally called
  // These provide TypeScript compatibility but will show clear errors
  const createClientStub = (name: string) => {
    return async () => {
      console.error(`${name} was called on the client side, but it's a server-only function`);
      throw new Error(`${name} is a server-only function and cannot be called from the client`);
    };
  };
  
  getConnectionPool = createClientStub('getConnectionPool');
  executeQuery = createClientStub('executeQuery');
  executeTransaction = createClientStub('executeTransaction');
  getConnection = createClientStub('getConnection');
  clearQueryCache = () => {
    console.error('clearQueryCache was called on the client side, but it\'s a server-only function');
  };
  closeConnectionPool = createClientStub('closeConnectionPool');
}

// Export the database functions - these will be properly defined on server,
// and will be stubs on the client
export {
  getConnectionPool,
  executeQuery,
  executeTransaction,
  getConnection,
  clearQueryCache,
  closeConnectionPool
};

const pool = new PgPool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;

