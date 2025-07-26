# PowerShell script to create .env file
Write-Host "Creating .env file with PostgreSQL credentials..." -ForegroundColor Green

$envContent = @"
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ravenstimesheet
DB_USER=TaskChrono
DB_PASSWORD=my@i5gy$*9cUQw5

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend API URL
VITE_API_URL=http://localhost:3001
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Install PostgreSQL if not already installed" -ForegroundColor White
Write-Host "2. Create database: CREATE DATABASE ravenstimesheet;" -ForegroundColor White
Write-Host "3. Run: npm run db:setup" -ForegroundColor White
Write-Host "4. Start server: npm run dev:server" -ForegroundColor White
Write-Host "5. Start frontend: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Your credentials are configured:" -ForegroundColor Cyan
Write-Host "- Username: TaskChrono" -ForegroundColor White
Write-Host "- Password: my@i5gy$*9cUQw5" -ForegroundColor White
Write-Host "- Database: ravenstimesheet" -ForegroundColor White 