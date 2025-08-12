/**
 * Direct database connection utility for Supabase Edge Functions
 */

// Type guard to safely check for Deno environment
function isDeno(): boolean {
  return typeof globalThis !== 'undefined' && 
         'Deno' in globalThis && 
         globalThis.Deno !== undefined
}

// Safe Deno environment access
function getEnv(key: string): string | undefined {
  if (isDeno()) {
    return (globalThis as any).Deno.env.get(key)
  }
  // Fallback to process.env in Node.js environments
  return typeof process !== 'undefined' ? process.env[key] : undefined
}

export interface DirectDBConfig {
  connectionString?: string
}

export type QueryResult<T = unknown> = 
  | { success: true; data?: T[]; rowCount?: number }
  | { success: false; error: string }

// Note: This is a placeholder implementation
// In a real-world scenario, you'd use a proper PostgreSQL client
export class DirectDB {
  private readonly connectionString: string

  constructor(config: DirectDBConfig = {}) {
    if (config.connectionString) {
      this.connectionString = config.connectionString
    } else {
      const dbUrl = getEnv('DATABASE_URL')
      if (dbUrl) {
        this.connectionString = dbUrl
      } else {
        // Check if we're in development mode
        const nodeEnv = getEnv('NODE_ENV')
        const denoEnv = getEnv('DENO_ENV')
        
        if (nodeEnv === 'development' || denoEnv === 'development') {
          console.warn('🔧 Using local development database connection')
          this.connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
        } else {
          console.error('❌ DATABASE_URL environment variable is missing')
          throw new Error(
            'DATABASE_URL environment variable is required for production/edge environments. ' +
            'Please set DATABASE_URL in your environment variables or provide config.connectionString. ' +
            'Example: DATABASE_URL=postgresql://user:pass@host:port/dbname'
          )
        }
      }
    }
  }

  async query<T = unknown>(sql: string, params: ReadonlyArray<unknown> = []): Promise<QueryResult<T>> {
    try {
      // This is a placeholder - in production you'd use a proper DB client
      const sqlPreview = sql.length > 100 ? `${sql.substring(0, 100)}...` : sql
      const paramsInfo = `${params.length} params of types: [${params.map(p => typeof p).join(', ')}]`
      console.debug('DirectDB: Using placeholder implementation. SQL preview:', sqlPreview, paramsInfo)
      
      return {
        success: true,
        data: [],
        rowCount: 0
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  async transaction<T>(callback: (db: DirectDB) => Promise<T>): Promise<T> {
    // Placeholder transaction implementation
    console.warn('DirectDB: Using placeholder transaction implementation')
    return await callback(this)
  }

  async close(): Promise<void> {
    // TODO: Implement actual resource cleanup (connection pooling, prepared statements, etc.)
    // Currently a no-op placeholder
    console.debug('DirectDB: close() called - placeholder implementation')
    return Promise.resolve()
  }
}

export function createDirectDB(config?: DirectDBConfig): DirectDB {
  return new DirectDB(config)
}