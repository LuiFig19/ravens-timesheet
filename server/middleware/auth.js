import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'

// Create Clerk middleware for protecting routes
export const requireAuth = ClerkExpressRequireAuth({
  onError: (error) => {
    console.error('Clerk authentication error:', error)
    return {
      status: 401,
      message: 'Authentication required'
    }
  }
})

// Optional: middleware to get user info without requiring auth
export const getAuth = (req, res, next) => {
  try {
    // Extract user info from Clerk if available
    if (req.auth && req.auth.userId) {
      req.userId = req.auth.userId
      req.userInfo = {
        userId: req.auth.userId,
        sessionId: req.auth.sessionId,
        orgId: req.auth.orgId,
      }
    }
    next()
  } catch (error) {
    console.warn('Auth extraction failed:', error.message)
    next() // Continue without auth info
  }
}

// Middleware to add user context to database operations
export const addUserContext = (req, res, next) => {
  if (req.auth && req.auth.userId) {
    // Add user ID to query parameters or body as needed
    if (req.method === 'POST' || req.method === 'PUT') {
      req.body.userId = req.auth.userId
      req.body.createdBy = req.auth.userId
      req.body.updatedBy = req.auth.userId
    }
  }
  next()
} 