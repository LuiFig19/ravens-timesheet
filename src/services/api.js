import axios from 'axios'

// Dynamic API Base URL detection with mobile-specific handling
const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (import.meta.env.VITE_API_URL) {
    console.log('🔧 Using environment VITE_API_URL:', import.meta.env.VITE_API_URL)
    return import.meta.env.VITE_API_URL
  }
  
  // Production deployment - use same origin
  if (import.meta.env.PROD) {
    const prodUrl = `${window.location.protocol}//${window.location.host}`
    console.log('🚀 Production mode, using same origin:', prodUrl)
    return prodUrl
  }
  
  // Get current hostname
  const currentHost = window.location.hostname
  console.log('🌐 Current hostname detected:', currentHost)
  
  // Mobile detection - check if accessing from network IP
  const isNetworkAccess = currentHost !== 'localhost' && 
                         currentHost !== '127.0.0.1' && 
                         currentHost !== '0.0.0.0'
  
  let apiUrl
  
  if (isNetworkAccess) {
    // Mobile/Network access - use the same IP for API
    apiUrl = `http://${currentHost}:3001`
    console.log('📱 Mobile/Network access detected, using:', apiUrl)
  } else {
    // Local access - use localhost
    apiUrl = 'http://localhost:3001'
    console.log('💻 Local access detected, using:', apiUrl)
  }
  
  return apiUrl
}

const API_BASE_URL = getApiBaseUrl()

// Debug logging for API configuration
console.log('🌐 API Configuration:')
console.log(`   Current Host: ${window.location.hostname}`)
console.log(`   API Base URL: ${API_BASE_URL}`)
console.log(`   Full API URL: ${API_BASE_URL}/api`)
console.log(`   User Agent: ${navigator.userAgent}`)
console.log(`   Platform: ${navigator.platform}`)

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor with mobile fallback
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`)
    return response
  },
  async (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message)
    
    // Check if this is a network error on mobile
    if ((error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') && 
        window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
      
      console.log('🔄 Network error on mobile detected, attempting fallback...')
      
      // Try alternative API URLs
      const fallbackUrls = [
        `http://192.168.88.241:3001`,
        `http://${window.location.hostname}:3001`,
        `http://localhost:3001`
      ]
      
      for (const fallbackUrl of fallbackUrls) {
        try {
          console.log(`🔄 Trying fallback API: ${fallbackUrl}`)
          
          // Create a new request with the fallback URL
          const fallbackConfig = {
            ...error.config,
            baseURL: `${fallbackUrl}/api`
          }
          
          // Test connection first
          const testResponse = await axios.get(`${fallbackUrl}/health`, { timeout: 3000 })
          if (testResponse.status === 200) {
            console.log(`✅ Fallback API working: ${fallbackUrl}`)
            
            // Update the base URL for future requests
            api.defaults.baseURL = `${fallbackUrl}/api`
            
            // Retry the original request
            return axios(fallbackConfig)
          }
        } catch (fallbackError) {
          console.log(`❌ Fallback failed: ${fallbackUrl}`)
          continue
        }
      }
    }
    
    if (error.response?.status === 404) {
      console.warn('Resource not found')
    } else if (error.response?.status >= 500) {
      console.error('Server error occurred')
    }
    
    return Promise.reject(error)
  }
)

// Employee API
export const employeeAPI = {
  // Get all employees
  getAll: () => api.get('/employees'),
  
  // Get employee by ID
  getById: (id) => api.get(`/employees/${id}`),
  
  // Create new employee
  create: (employeeData) => api.post('/employees', employeeData),
  
  // Update employee
  update: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
  
  // Delete employee (soft delete)
  delete: (id) => api.delete(`/employees/${id}`),
  
  // Get employee attendance
  getAttendance: (id, params = {}) => api.get(`/employees/${id}/attendance`, { params })
}

// Job API
export const jobAPI = {
  // Get all jobs
  getAll: (params = {}) => api.get('/jobs', { params }),
  
  // Get job by ID
  getById: (id) => api.get(`/jobs/${id}`),
  
  // Get job by work order
  getByWorkOrder: (workOrder) => api.get(`/jobs/work-order/${workOrder}`),
  
  // Create new job
  create: (jobData) => api.post('/jobs', jobData),
  
  // Update job
  update: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  
  // Delete job
  delete: (id) => api.delete(`/jobs/${id}`)
}

// Timesheet API
export const timesheetAPI = {
  // Get all timesheets
  getAll: (params = {}) => api.get('/timesheets', { params }),
  
  // Get timesheet by ID
  getById: (id) => api.get(`/timesheets/${id}`),
  
  // Create new timesheet
  create: (timesheetData) => api.post('/timesheets', timesheetData),
  
  // Update timesheet
  update: (id, timesheetData) => api.put(`/timesheets/${id}`, timesheetData),
  
  // Delete timesheet
  delete: (id) => api.delete(`/timesheets/${id}`),
  
  // Submit timesheet for approval
  submit: (id) => api.post(`/timesheets/${id}/submit`)
}

// Attendance API
export const attendanceAPI = {
  // Get attendance records
  getAll: (params = {}) => api.get('/attendance', { params }),
  
  // Get weekly attendance summary
  getWeekly: (week) => api.get('/attendance/weekly', { params: { week } }),
  
  // Create/update attendance record
  create: (attendanceData) => api.post('/attendance', attendanceData),
  
  // Update attendance record
  update: (id, attendanceData) => api.put(`/attendance/${id}`, attendanceData),
  
  // Bulk create/update attendance
  bulkCreate: (data) => api.post('/attendance/bulk', data),
  
  // Delete attendance record
  delete: (id) => api.delete(`/attendance/${id}`)
}

// Upload API
export const uploadAPI = {
  // Get all uploads
  getAll: (params = {}) => api.get('/uploads', { params }),
  
  // Upload file
  upload: (fileData) => api.post('/uploads', fileData),
  
  // Process uploaded file
  process: (id, extractedData) => api.post(`/uploads/${id}/process`, { extracted_data: extractedData }),
  
  // Delete uploaded file
  delete: (id) => api.delete(`/uploads/${id}`),
  
  // Download uploaded file
  download: (id) => api.get(`/uploads/${id}/download`),
  
  // Get upload statistics
  getStats: () => api.get('/uploads/stats')
}

// Health check
export const healthAPI = {
  check: () => api.get('/health', { baseURL: API_BASE_URL })
}

// Helper functions
export const apiHelpers = {
  // Test API connectivity and update base URL if needed
  testAndUpdateConnection: async () => {
    const currentHost = window.location.hostname
    console.log('🔍 Testing API connectivity from:', currentHost)
    
    const testUrls = [
      API_BASE_URL, // Current configured URL
      `http://192.168.88.241:3001`, // Known working IP
      `http://${currentHost}:3001`, // Current hostname
      'http://localhost:3001' // Localhost fallback
    ]
    
    // Remove duplicates
    const uniqueUrls = [...new Set(testUrls)]
    
    for (const testUrl of uniqueUrls) {
      try {
        console.log(`🔄 Testing: ${testUrl}`)
        
        // Use a shorter timeout and more permissive settings
        const response = await axios.get(`${testUrl}/health`, { 
          timeout: 3000,
          validateStatus: (status) => status < 500 // Accept any status < 500
        })
        
        if (response.status === 200) {
          console.log(`✅ API connection successful: ${testUrl}`)
          console.log(`   Response:`, response.data)
          
          // Update API base URL if different
          if (api.defaults.baseURL !== `${testUrl}/api`) {
            console.log(`🔧 Updating API base URL to: ${testUrl}/api`)
            api.defaults.baseURL = `${testUrl}/api`
          }
          
          return { success: true, url: testUrl, data: response.data }
        } else {
          console.log(`⚠️ ${testUrl} returned status ${response.status}`)
        }
      } catch (error) {
        console.log(`❌ Failed: ${testUrl} - ${error.code || error.message}`)
        if (error.response) {
          console.log(`   Status: ${error.response.status}, Data:`, error.response.data)
        }
        continue
      }
    }
    
    console.log('⚠️ All API tests failed, but continuing with configured URL')
    return { success: false, error: 'No API endpoints reachable', attemptedUrls: uniqueUrls }
  },
  // Convert localStorage data to API format
  migrateLocalStorageData: async () => {
    try {
      console.log('🔄 Migrating localStorage data to PostgreSQL...')
      
      // Migrate employees
      const localEmployees = JSON.parse(localStorage.getItem('ravensEmployees') || '[]')
      for (const employee of localEmployees) {
        try {
          await employeeAPI.create({
            name: employee.name,
            email: employee.email || null,
            position: 'Employee',
            department: 'Operations'
          })
        } catch (error) {
          // Ignore duplicates
          if (error.response?.status !== 409) {
            console.error('Error migrating employee:', error)
          }
        }
      }
      
      // Migrate jobs
      const localJobs = JSON.parse(localStorage.getItem('ravensJobs') || '[]')
      for (const job of localJobs) {
        try {
          await jobAPI.create({
            work_order: job.workOrder || job.work_order,
            job_name: job.jobName || job.job_name,
            customer: job.customer,
            location: job.location,
            description: job.description,
            total_hours: job.totalHours || job.total_hours || 0,
            completed_hours: job.completedHours || job.completed_hours || 0,
            sections: job.sections || []
          })
        } catch (error) {
          // Ignore duplicates
          if (error.response?.status !== 409) {
            console.error('Error migrating job:', error)
          }
        }
      }
      
      console.log('✅ localStorage data migration completed')
      return true
    } catch (error) {
      console.error('❌ Migration failed:', error)
      return false
    }
  },
  
  // Get current week Monday date
  getCurrentWeekMonday: () => {
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - now.getDay() + 1)
    return monday.toISOString().split('T')[0]
  },
  
  // Format error message
  formatErrorMessage: (error) => {
    console.log('🔍 Error details for formatting:', {
      code: error.code,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    })
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      return `Network Error: Cannot connect to server. Please check if the backend is running. (${error.code})`
    } else if (error.response?.status === 404) {
      return `Not Found: The requested resource was not found. (${error.response.status})`
    } else if (error.response?.status >= 500) {
      return `Server Error: The server encountered an error. (${error.response.status})`
    } else if (error.response?.data?.message) {
      return error.response.data.message
    } else if (error.response?.data?.error) {
      return error.response.data.error
    } else if (error.message) {
      return error.message
    } else {
      return 'An unexpected error occurred'
    }
  }
}

export default api 