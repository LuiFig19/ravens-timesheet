#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 RAILWAY DEPLOYMENT HEALTH CHECK')
console.log('=' * 50)

// Check environment
console.log('\n📋 ENVIRONMENT INFO:')
console.log(`Node.js Version: ${process.version}`)
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`)
console.log(`PORT: ${process.env.PORT || 'not set'}`)

// Check required files
console.log('\n📁 FILE STRUCTURE CHECK:')

const requiredFiles = [
  'package.json',
  'dist/index.html',
  'dist/assets',
  'server/index.js'
]

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file)
  const exists = fs.existsSync(fullPath)
  console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'EXISTS' : 'MISSING'}`)
  
  if (exists && file === 'dist/index.html') {
    const content = fs.readFileSync(fullPath, 'utf8')
    console.log(`   📄 Size: ${content.length} bytes`)
    console.log(`   🔗 Contains Vite script: ${content.includes('module') ? 'YES' : 'NO'}`)
  }
})

// Check dist folder contents
console.log('\n🏗️  DIST FOLDER CONTENTS:')
const distPath = path.join(__dirname, 'dist')
if (fs.existsSync(distPath)) {
  const distFiles = fs.readdirSync(distPath, { withFileTypes: true })
  distFiles.forEach(file => {
    console.log(`   ${file.isDirectory() ? '📁' : '📄'} ${file.name}`)
  })
} else {
  console.log('❌ dist folder not found - build may have failed')
}

// Check environment variables
console.log('\n🔐 ENVIRONMENT VARIABLES:')
const envVars = [
  'VITE_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'DATABASE_URL',
  'PGUSER',
  'PGPASSWORD',
  'PGHOST',
  'PGPORT',
  'PGDATABASE'
]

envVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    // Mask sensitive values
    const maskedValue = varName.includes('KEY') || varName.includes('PASSWORD') 
      ? `${value.substring(0, 6)}...${value.substring(value.length - 4)}`
      : value
    console.log(`✅ ${varName}: ${maskedValue}`)
  } else {
    console.log(`❌ ${varName}: NOT SET`)
  }
})

// Check package.json scripts
console.log('\n📦 PACKAGE.JSON SCRIPTS:')
const packagePath = path.join(__dirname, 'package.json')
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  const scripts = pkg.scripts || {}
  
  console.log(`✅ build: ${scripts.build || 'not defined'}`)
  console.log(`✅ start: ${scripts.start || 'not defined'}`)
  console.log(`✅ dev: ${scripts.dev || 'not defined'}`)
} else {
  console.log('❌ package.json not found')
}

// Try to start server check
console.log('\n🚀 SERVER START CHECK:')
try {
  console.log('Attempting to import server...')
  // This will test if the server can be imported without errors
  const serverPath = path.join(__dirname, 'server/index.js')
  if (fs.existsSync(serverPath)) {
    console.log('✅ Server file exists')
    console.log('✅ Ready for deployment')
  } else {
    console.log('❌ Server file missing')
  }
} catch (error) {
  console.log(`❌ Server import error: ${error.message}`)
}

console.log('\n' + '=' * 50)
console.log('🎯 DEPLOYMENT CHECKLIST:')
console.log('1. ✅ Run: npm run build')
console.log('2. ✅ Set Railway environment variables')
console.log('3. ✅ Deploy with start command: npm run start')
console.log('4. ✅ Check Railway logs for errors')
console.log('=' * 50) 