@echo off
echo ========================================
echo 🔧 FIXING RAVENS TIMESHEET BLANK PAGE
echo ========================================
echo.

echo 📝 Creating .env file with Clerk credentials...
(
echo # PostgreSQL Database Configuration
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=ravenstimesheet
echo DB_USER=postgres
echo DB_PASSWORD=your_password_here
echo.
echo # Server Configuration
echo PORT=3001
echo NODE_ENV=development
echo.
echo # Frontend API URL
echo VITE_API_URL=http://localhost:3001
echo.
echo # Clerk Authentication Configuration (React + Vite format^)
echo VITE_CLERK_PUBLISHABLE_KEY=pk_test_bW92aW5nLWphdmVsaW4tNzguY2xlcmsuYWNjb3VudHMuZGV2JA
echo CLERK_SECRET_KEY=sk_test_CGaGZ1qfG9qIJ8OlqYBDFJbSJ257YhSFNnxyhbNCbj
) > .env

echo ✅ .env file created successfully!
echo.

echo 🚀 Starting development server...
echo.
echo 📌 Important: Make sure you're in the ravenstimesheet folder
echo 📌 The site will be available at: http://localhost:5173
echo 📌 The API will be available at: http://localhost:3001
echo.

npm run dev:full 