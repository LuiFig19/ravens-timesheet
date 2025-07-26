@echo off
echo.
echo ========================================
echo    RAVENS TIMESHEET - MOBILE TESTING
echo ========================================
echo.

echo 🔍 Getting network information...
node get-network-info.js

echo.
echo 🚀 Starting development server...
echo.
echo 📱 Use one of the URLs above on your phone!
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev:full 