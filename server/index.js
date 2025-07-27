import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { testConnection } from './config/database.js'

// ES module compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import authentication middleware
import { requireAuth, getAuth, addUserContext } from './middleware/auth.js'

// Import route handlers
import employeeRoutes from './routes/employees.js'
import jobRoutes from './routes/jobs.js'
import timesheetRoutes from './routes/timesheets.js'
import attendanceRoutes from './routes/attendance.js'
import uploadRoutes from './routes/uploads.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const isProduction = process.env.NODE_ENV === 'production'

// Middleware - Enhanced CORS for mobile access
app.use(cors({
  origin: isProduction 
    ? true // Allow all origins in production (deployed app)
    : (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true)
        
        // Allow localhost and network IPs
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:3000', 
          'http://0.0.0.0:5173',
          'http://127.0.0.1:5173',
          'http://192.168.88.241:5173'
        ]
        
        // Allow any local network IP (192.168.x.x)
        const isLocalNetwork = /^http:\/\/192\.168\.\d+\.\d+:5173$/.test(origin)
        
        if (allowedOrigins.includes(origin) || isLocalNetwork) {
          callback(null, true)
        } else {
          console.log('🌐 CORS: Allowing origin:', origin)
          callback(null, true) // Allow all origins in development
        }
      },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve static files in production
if (isProduction) {
  const distPath = path.join(__dirname, '../dist')
  console.log('📁 Serving static files from:', distPath)
  app.use(express.static(distPath))
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection()
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    version: '1.0.0'
  })
})

// API Routes with Authentication
// Public routes (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', auth: 'not required for health check' })
})

// Protected routes (require authentication)
app.use('/api/employees', requireAuth, addUserContext, employeeRoutes)
app.use('/api/jobs', requireAuth, addUserContext, jobRoutes)
app.use('/api/timesheets', requireAuth, addUserContext, timesheetRoutes)
app.use('/api/attendance', requireAuth, addUserContext, attendanceRoutes)
app.use('/api/uploads', requireAuth, addUserContext, uploadRoutes)

// Optional: User info endpoint
app.get('/api/user', requireAuth, (req, res) => {
  res.json({
    userId: req.auth?.userId,
    sessionId: req.auth?.sessionId,
    orgId: req.auth?.orgId,
    message: 'User authenticated successfully'
  })
})

// Serve static files from React build in production
if (isProduction) {
  console.log('🏗️  Production mode: Serving static files from dist/')
  
  // Serve static assets
  app.use(express.static(path.join(__dirname, '../dist')))
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    console.log(`📄 Serving React app for route: ${req.path}`)
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
} else {
  // 404 handler for development
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`
    })
  })
}

// Error handling middleware (should be last)
app.use((error, req, res, next) => {
  console.error('Server Error:', error)
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  })
})

// Start server
const startServer = async () => {
  try {
    // Test database connection
    console.log('🔄 Testing database connection...')
    const connected = await testConnection()
    
    if (!connected) {
      console.warn('⚠️  Starting server without database connection')
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Ravens TimeSheet Server running on http://localhost:${PORT}`)
      console.log(`🌐 Network access: http://0.0.0.0:${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/health`)
      console.log(`🔗 API Base: http://localhost:${PORT}/api`)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📝 Available endpoints:')
        console.log('   • GET  /api/employees - List employees')
        console.log('   • POST /api/employees - Create employee')
        console.log('   • GET  /api/jobs - List jobs')
        console.log('   • POST /api/jobs - Create job')
        console.log('   • GET  /api/timesheets - List timesheets')
        console.log('   • POST /api/timesheets - Create timesheet')
        console.log('   • GET  /api/attendance - List attendance')
        console.log('   • POST /api/attendance - Create attendance record')
      }
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app 