// Simple authentication middleware for internal use
// No external dependencies needed

const requireAuth = (req, res, next) => {
  // For now, allow all requests since this is an internal tool
  // In production, you could add API key validation here
  next()
}

const getAuth = (req, res, next) => {
  // Simple auth context for compatibility
  req.auth = {
    userId: 'internal-user',
    sessionId: 'internal-session',
    orgId: 'ravens-marine'
  }
  next()
}

const addUserContext = (req, res, next) => {
  // Add user context for database operations
  req.user = {
    id: 'internal-user',
    email: 'internal@ravensmarine.com',
    name: 'Internal User'
  }
  next()
}

export { requireAuth, getAuth, addUserContext } 