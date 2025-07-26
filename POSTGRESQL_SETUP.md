# PostgreSQL Backend Setup Guide

## ✅ Supabase Removal Complete

The backend has been successfully converted from Supabase to direct PostgreSQL integration. All Supabase SDK references have been removed and replaced with native PostgreSQL queries.

## 🔧 What You Need to Provide

### Database Credentials
You need to provide the following PostgreSQL connection details:

1. **Database Host** (`DB_HOST`)
   - Default: `localhost`
   - Your PostgreSQL server address

2. **Database Port** (`DB_PORT`)
   - Default: `5432`
   - Your PostgreSQL port (usually 5432)

3. **Database Name** (`DB_NAME`)
   - Default: `ravenstimesheet`
   - The name of your PostgreSQL database

4. **Database User** (`DB_USER`)
   - Default: `postgres`
   - Your PostgreSQL username

5. **Database Password** (`DB_PASSWORD`)
   - **Required**: Your PostgreSQL password
   - No default value for security

## 📝 Environment Setup

### Step 1: Create .env file
Copy the template and update with your credentials:

```bash
cp env.template .env
```

### Step 2: Update .env with your PostgreSQL details
```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ravenstimesheet
DB_USER=postgres
DB_PASSWORD=your_actual_password_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend API URL
VITE_API_URL=http://localhost:3001
```

## 🗄️ Database Setup

### Step 1: Install PostgreSQL
If you haven't installed PostgreSQL yet:

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the password you set for the postgres user

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: Create Database
```bash
# Connect to PostgreSQL as postgres user
psql -U postgres

# Create the database
CREATE DATABASE ravenstimesheet;

# Verify it was created
\l

# Exit psql
\q
```

### Step 3: Run Database Setup
```bash
# Install dependencies (if not already done)
npm install

# Setup database tables and schema
npm run db:setup
```

## 🚀 Starting the Application

### Step 1: Start Backend Server
```bash
npm run dev:server
```

You should see:
```
🔄 Testing PostgreSQL connection...
📊 Connecting to: localhost:5432/ravenstimesheet
✅ PostgreSQL connection successful
⏰ Server time: 2024-01-15 10:30:00
🐘 PostgreSQL version: PostgreSQL
🚀 Ravens TimeSheet Server running on http://localhost:3001
```

### Step 2: Start Frontend (in new terminal)
```bash
npm run dev
```

You should see:
```
VITE v7.0.5  ready in 631 ms
➜  Local:   http://localhost:5173/
```

### Step 3: Or Start Both Together
```bash
npm run dev:full
```

## 🔍 Testing the Connection

### Health Check
Visit: `http://localhost:3001/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

### API Endpoints
All endpoints are available at `http://localhost:3001/api/`:

- `GET /api/employees` - List employees
- `GET /api/jobs` - List jobs
- `GET /api/timesheets` - List timesheets
- `GET /api/attendance` - List attendance
- `GET /api/uploads` - List uploaded files

## 🛠️ Troubleshooting

### Connection Issues
1. **"Connection refused"**
   - Make sure PostgreSQL is running
   - Check if port 5432 is correct
   - Verify firewall settings

2. **"Authentication failed"**
   - Double-check username and password
   - Ensure the user has access to the database

3. **"Database does not exist"**
   - Create the database: `CREATE DATABASE ravenstimesheet;`
   - Check database name in .env file

### Common Commands
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Connect to PostgreSQL
psql -U postgres -d ravenstimesheet

# List databases
\l

# List tables (after setup)
\dt

# Exit psql
\q
```

## 📊 Database Schema

The setup script creates the following tables:

- **employees** - Employee information
- **jobs** - Job/project details
- **job_sections** - Job section breakdowns
- **timesheets** - Individual timesheet records
- **timesheet_entries** - Work entries within timesheets
- **attendance** - Daily attendance tracking
- **uploaded_files** - File upload tracking

## 🔄 Migration from Supabase

If you have existing data in Supabase:

1. **Export data** from Supabase dashboard
2. **Import to PostgreSQL** using pgAdmin or psql
3. **Update any foreign key references** if needed

## ✅ Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `ravenstimesheet` created
- [ ] `.env` file configured with correct credentials
- [ ] `npm run db:setup` completed successfully
- [ ] Backend server starts without errors
- [ ] Health check endpoint returns "connected"
- [ ] Frontend can connect to backend
- [ ] All API endpoints respond correctly

## 🎉 Success!

Once all steps are completed, your application will be running with:
- **Frontend**: `http://localhost:5173/`
- **Backend**: `http://localhost:3001/`
- **Database**: PostgreSQL with all tables and functions

The Saved Folders feature and all other functionality will work with the new PostgreSQL backend! 