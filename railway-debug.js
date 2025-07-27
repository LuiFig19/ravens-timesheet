// Railway Deployment Debug Script
// This script helps diagnose deployment issues

console.log('🔍 RAILWAY DEPLOYMENT DEBUG')
console.log('==============================')

// Check Node.js environment
console.log('📌 Node.js Version:', process.version)
console.log('📌 Platform:', process.platform)
console.log('📌 Architecture:', process.arch)

// Check environment variables
console.log('\n🔑 Environment Variables:')
console.log('NODE_ENV:', process.env.NODE_ENV || '❌ NOT SET')
console.log('PORT:', process.env.PORT || '❌ NOT SET')

// Check Clerk configuration
console.log('\n🔐 Clerk Configuration:')
console.log('VITE_CLERK_PUBLISHABLE_KEY:', process.env.VITE_CLERK_PUBLISHABLE_KEY ? '✅ SET' : '❌ NOT SET')
console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? '✅ SET' : '❌ NOT SET')

// Check API URL
console.log('\n🌐 API Configuration:')
console.log('VITE_API_URL:', process.env.VITE_API_URL || '❌ NOT SET')

// Check database configuration
console.log('\n🐘 Database Configuration:')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET')
console.log('DB_HOST:', process.env.DB_HOST || '❌ NOT SET')
console.log('DB_NAME:', process.env.DB_NAME || '❌ NOT SET')

// Check if build directory exists
const fs = require('fs')
const path = require('path')

console.log('\n📁 Build Status:')
const distPath = path.join(__dirname, 'dist')
const distExists = fs.existsSync(distPath)
console.log('dist/ directory:', distExists ? '✅ EXISTS' : '❌ NOT FOUND')

if (distExists) {
  const indexPath = path.join(distPath, 'index.html')
  const indexExists = fs.existsSync(indexPath)
  console.log('dist/index.html:', indexExists ? '✅ EXISTS' : '❌ NOT FOUND')
}

// Runtime checks
console.log('\n⚡ Runtime Status:')
console.log('Memory Usage:', process.memoryUsage().rss / 1024 / 1024, 'MB')
console.log('Uptime:', process.uptime(), 'seconds')

// Critical issues check
console.log('\n🚨 Critical Issues Check:')
const issues = []

if (!process.env.VITE_CLERK_PUBLISHABLE_KEY) {
  issues.push('Missing VITE_CLERK_PUBLISHABLE_KEY - This will cause blank page!')
}

if (!process.env.CLERK_SECRET_KEY) {
  issues.push('Missing CLERK_SECRET_KEY - Authentication will fail!')
}

if (!process.env.VITE_API_URL) {
  issues.push('Missing VITE_API_URL - Frontend won\'t connect to backend!')
}

if (!distExists) {
  issues.push('Missing dist/ directory - Frontend build failed!')
}

if (issues.length > 0) {
  console.log('❌ CRITICAL ISSUES FOUND:')
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`)
  })
} else {
  console.log('✅ No critical issues found!')
}

console.log('\n🎯 Deployment Status:', issues.length === 0 ? '✅ READY' : '❌ NEEDS FIXES')
console.log('==============================') 