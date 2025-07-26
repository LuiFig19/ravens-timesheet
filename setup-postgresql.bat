@echo off
echo ========================================
echo PostgreSQL Setup for Ravens TimeSheet
echo ========================================
echo.

echo Creating .env file with your credentials...
(
echo # PostgreSQL Database Configuration
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=ravenstimesheet
echo DB_USER=TaskChrono
echo DB_PASSWORD=my@i5gy$*9cUQw5
echo.
echo # Server Configuration
echo PORT=3001
echo NODE_ENV=development
echo.
echo # Frontend API URL
echo VITE_API_URL=http://localhost:3001
) > .env

echo ✅ .env file created successfully!
echo.

echo Installing dependencies...
npm install

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Install PostgreSQL if not already installed
echo 2. Create database: CREATE DATABASE ravenstimesheet;
echo 3. Run: npm run db:setup
echo 4. Start server: npm run dev:server
echo 5. Start frontend: npm run dev
echo.
echo Your credentials are configured:
echo - Username: TaskChrono
echo - Password: my@i5gy$*9cUQw5
echo - Database: ravenstimesheet
echo.
pause 