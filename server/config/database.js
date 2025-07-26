import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

// PostgreSQL connection configuration
const poolConfig = process.env.DATABASE_URL 
  ? {
      // Production: Use DATABASE_URL (Railway, Render, etc.)
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000, // Increased for production
    }
  : {
      // Development: Use individual environment variables
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'ravenstimesheet',
      password: process.env.DB_PASSWORD || 'password',
      port: parseInt(process.env.DB_PORT) || 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }

// Create PostgreSQL connection pool
export const pgPool = new Pool(poolConfig)

// Database connection test
export const testConnection = async () => {
  try {
    console.log('🔄 Testing PostgreSQL connection...')
    console.log(`📊 Connecting to: ${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`)
    
    const client = await pgPool.connect()
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version')
    client.release()
    
    console.log('✅ PostgreSQL connection successful')
    console.log(`⏰ Server time: ${result.rows[0].current_time}`)
    console.log(`🐘 PostgreSQL version: ${result.rows[0].pg_version.split(' ')[0]}`)
    
    return true
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message)
    console.error('💡 Make sure PostgreSQL is running and your credentials are correct')
    return false
  }
}

// Helper function to execute raw SQL queries
export const executeQuery = async (query, params = []) => {
  const client = await pgPool.connect()
  try {
    const result = await client.query(query, params)
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  } finally {
    client.release()
  }
}

// Helper function to execute transactions
export const executeTransaction = async (queries) => {
  const client = await pgPool.connect()
  try {
    await client.query('BEGIN')
    
    const results = []
    for (const { query, params = [] } of queries) {
      const result = await client.query(query, params)
      results.push(result)
    }
    
    await client.query('COMMIT')
    return results
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Transaction error:', error)
    throw error
  } finally {
    client.release()
  }
}

// Helper function to check if table exists
export const tableExists = async (tableName) => {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `
    const result = await executeQuery(query, [tableName])
    return result.rows[0].exists
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

// Helper function to get table info
export const getTableInfo = async (tableName) => {
  try {
    const query = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position
    `
    const result = await executeQuery(query, [tableName])
    return result.rows
  } catch (error) {
    console.error(`Error getting table info for ${tableName}:`, error)
    return []
  }
}

// Graceful shutdown function
export const closePool = async () => {
  try {
    await pgPool.end()
    console.log('✅ Database connection pool closed')
  } catch (error) {
    console.error('❌ Error closing database pool:', error)
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...')
  await closePool()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...')
  await closePool()
  process.exit(0)
}) 