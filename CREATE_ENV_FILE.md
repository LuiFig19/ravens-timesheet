# 🚨 URGENT: Create .env File

## The site is blank because the .env file is missing!

### 📋 **Step 1: Create `.env` file**
In the `ravenstimesheet` folder, create a new file called `.env` (no extension)

### 📝 **Step 2: Add this content to the .env file:**

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ravenstimesheet
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend API URL
VITE_API_URL=http://localhost:3001

# Clerk Authentication Configuration (React + Vite format)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_bW92aW5nLWphdmVsaW4tNzguY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_CGaGZ1qfG9qIJ8OlqYBDFJbSJ257YhSFNnxyhbNCbj
```

### 🔄 **Step 3: Restart the development server**
```bash
npm run dev:full
```

## ✅ **What this fixes:**
- ✅ Site will load properly
- ✅ Authentication will work
- ✅ No more blank page
- ✅ Correct environment variables for React (not Next.js)

## 📍 **Important Notes:**
- Your credentials were for Next.js (`NEXT_PUBLIC_`) but we're using React + Vite
- React + Vite uses `VITE_` prefix for frontend environment variables
- The `.env` file should be in the `ravenstimesheet` folder (same level as `package.json`) 