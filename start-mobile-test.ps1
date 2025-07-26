Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    RAVENS TIMESHEET - MOBILE TESTING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 Getting network information..." -ForegroundColor Yellow
node get-network-info.js

Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host ""
Write-Host "📱 Use one of the URLs above on your phone!" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

npm run dev:full 