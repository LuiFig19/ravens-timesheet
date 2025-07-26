# Ravens TimeSheet - PostgreSQL Database Setup

This guide will help you set up PostgreSQL for the Ravens TimeSheet application using Supabase (recommended) or a local PostgreSQL installation.

## 🚀 Quick Start with Supabase (Recommended)

### 1. Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### 2. Get Your Credentials
From your Supabase dashboard:
- **Project URL**: `https://your-project-id.supabase.co`
- **Anon Key**: Found in Settings > API
- **Service Role Key**: Found in Settings > API (keep this secret!)

### 3. Configure Environment Variables
Copy `env.example` to `.env` and fill in your credentials:

```bash
cp env.example .env
```

Edit `.env`:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend API URL
VITE_API_URL=http://localhost:3001
```

### 4. Install Dependencies & Setup Database
```bash
# Install dependencies
npm install

# Setup database tables
npm run db:setup

# Migrate sample data (optional)
npm run db:migrate
```

### 5. Start the Application
```bash
# Start both frontend and backend
npm run dev:full

# OR start separately:
npm run dev:server  # Backend only
npm run dev         # Frontend only
```

---

## 🐘 Local PostgreSQL Setup (Alternative)

### 1. Install PostgreSQL
**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Install with default settings
- Remember your password!

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
```

### 2. Create Database and User
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE ravens_timesheet;
CREATE USER ravens_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE ravens_timesheet TO ravens_user;
\q
```

### 3. Configure Environment Variables
Edit `.env`:
```env
# Direct PostgreSQL Connection
DATABASE_URL=postgresql://ravens_user:secure_password_here@localhost:5432/ravens_timesheet

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend API URL
VITE_API_URL=http://localhost:3001
```

### 4. Setup Database Schema
```bash
npm run db:setup
npm run db:migrate
```

---

## 📊 Database Schema

### Tables Created:

#### **employees**
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Required)
- `email` (VARCHAR, Unique)
- `phone` (VARCHAR)
- `position` (VARCHAR)
- `department` (VARCHAR)
- `hire_date` (DATE)
- `is_active` (BOOLEAN, Default: true)
- `created_at`, `updated_at` (TIMESTAMP)

#### **jobs**
- `id` (UUID, Primary Key)
- `work_order` (VARCHAR, Unique, Required)
- `job_name` (VARCHAR, Required)
- `customer` (VARCHAR, Required)
- `location` (VARCHAR)
- `description` (TEXT)
- `status` (ENUM: active, completed, on_hold, cancelled)
- `total_hours`, `completed_hours` (DECIMAL)
- `start_date`, `end_date` (DATE)
- `created_at`, `updated_at` (TIMESTAMP)

#### **job_sections**
- `id` (UUID, Primary Key)
- `job_id` (UUID, Foreign Key → jobs.id)
- `section_name` (VARCHAR, Required)
- `estimated_hours`, `completed_hours` (DECIMAL)
- `created_at`, `updated_at` (TIMESTAMP)

#### **timesheets**
- `id` (UUID, Primary Key)
- `employee_id` (UUID, Foreign Key → employees.id)
- `employee_name` (VARCHAR, Required)
- `work_date` (DATE, Required)
- `shift_time` (DECIMAL)
- `total_hours` (DECIMAL)
- `status` (ENUM: draft, submitted, approved, rejected)
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

#### **timesheet_entries**
- `id` (UUID, Primary Key)
- `timesheet_id` (UUID, Foreign Key → timesheets.id)
- `job_id` (UUID, Foreign Key → jobs.id)
- `work_order` (VARCHAR)
- `customer` (VARCHAR)
- `description` (TEXT)
- `task_code` (VARCHAR)
- `hours` (DECIMAL, Required)
- `created_at`, `updated_at` (TIMESTAMP)

#### **attendance**
- `id` (UUID, Primary Key)
- `employee_id` (UUID, Foreign Key → employees.id)
- `work_date` (DATE, Required)
- `day_of_week` (INTEGER, 1-7)
- `hours_worked` (DECIMAL)
- `status` (ENUM: present, absent, partial, holiday)
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)
- **Unique Constraint**: (employee_id, work_date)

#### **uploaded_files**
- `id` (UUID, Primary Key)
- `filename` (VARCHAR, Required)
- `original_name` (VARCHAR, Required)
- `file_type` (VARCHAR)
- `file_size` (INTEGER)
- `file_path` (VARCHAR)
- `timesheet_id` (UUID, Foreign Key → timesheets.id)
- `processed` (BOOLEAN, Default: false)
- `processing_status` (VARCHAR)
- `processing_error` (TEXT)
- `created_at` (TIMESTAMP)

---

## 🔧 Database Management

### Access Database
**Supabase:**
- Use the Supabase Dashboard SQL Editor
- Or connect via any PostgreSQL client using your connection string

**Local PostgreSQL:**
```bash
# Command line
psql -h localhost -U ravens_user -d ravens_timesheet

# Or use a GUI tool like:
# - pgAdmin
# - DBeaver
# - DataGrip
```

### Modify Schema
To modify the database schema:

1. Edit `server/scripts/setupDatabase.js`
2. Run the setup script:
   ```bash
   npm run db:setup
   ```

### Backup Data
**Supabase:**
- Use Supabase Dashboard > Settings > Database > Backups
- Or use `pg_dump` with your connection string

**Local PostgreSQL:**
```bash
pg_dump -h localhost -U ravens_user ravens_timesheet > backup.sql
```

### Restore Data
```bash
psql -h localhost -U ravens_user -d ravens_timesheet < backup.sql
```

---

## 🌐 API Endpoints

The backend provides RESTful API endpoints:

### Employees
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Jobs
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job by ID
- `GET /api/jobs/work-order/:workOrder` - Get job by work order
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Timesheets
- `GET /api/timesheets` - List all timesheets
- `POST /api/timesheets` - Create new timesheet
- `GET /api/timesheets/:id` - Get timesheet by ID
- `PUT /api/timesheets/:id` - Update timesheet
- `DELETE /api/timesheets/:id` - Delete timesheet
- `POST /api/timesheets/:id/submit` - Submit for approval

### Attendance
- `GET /api/attendance` - List attendance records
- `GET /api/attendance/weekly?week=YYYY-MM-DD` - Weekly summary
- `POST /api/attendance` - Create attendance record
- `POST /api/attendance/bulk` - Bulk create/update
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance

### Health Check
- `GET /health` - Server and database status

---

## 🚨 Troubleshooting

### Connection Issues
```bash
# Test database connection
npm run db:setup
```

### Port Already in Use
```bash
# Kill processes on port 3001
npx kill-port 3001

# Or change port in .env
PORT=3002
```

### Supabase Issues
1. **Check Project Status**: Ensure your Supabase project is active
2. **Verify Credentials**: Double-check URL and keys in `.env`
3. **API Limits**: Free tier has rate limits
4. **Row Level Security**: Disable RLS for development in Supabase Dashboard

### Local PostgreSQL Issues
1. **Service Not Running**:
   ```bash
   # Windows
   net start postgresql-x64-15
   
   # macOS
   brew services restart postgresql
   
   # Linux
   sudo systemctl restart postgresql
   ```

2. **Connection Refused**:
   - Check if PostgreSQL is running
   - Verify port (default: 5432)
   - Check firewall settings

3. **Authentication Failed**:
   - Verify username/password
   - Check `pg_hba.conf` settings

---

## 🔒 Security Notes

### Production Deployment
1. **Use Strong Passwords**: Generate secure passwords for database users
2. **Enable SSL**: Always use SSL in production
3. **Row Level Security**: Enable RLS policies in Supabase
4. **Environment Variables**: Never commit `.env` files
5. **API Rate Limiting**: Implement rate limiting for production
6. **Database Backups**: Set up automated backups

### Supabase Security
- Enable Row Level Security (RLS)
- Create proper security policies
- Use service role key only on backend
- Monitor API usage in dashboard

---

## 📈 Performance Optimization

### Database Indexes
The setup script creates indexes on:
- `employees.name`
- `jobs.work_order`
- `timesheets.work_date`
- `attendance.employee_id, work_date`

### Query Optimization
- Use Supabase's built-in query optimization
- Monitor slow queries in dashboard
- Consider connection pooling for high traffic

### Scaling
- **Supabase Pro**: Upgrade for higher limits
- **Read Replicas**: For read-heavy workloads
- **Connection Pooling**: Use pgBouncer
- **Caching**: Implement Redis for session data

---

## 📞 Support

### Getting Help
1. **Check Logs**: Look at server console output
2. **Supabase Dashboard**: Check logs and metrics
3. **Database Status**: Run health check endpoint
4. **Documentation**: Refer to Supabase or PostgreSQL docs

### Common Commands
```bash
# Check server status
curl http://localhost:3001/health

# View database logs (Supabase)
# Check Logs section in dashboard

# Reset database (CAUTION: Deletes all data)
npm run db:setup

# Check API endpoints
curl http://localhost:3001/api/employees
```

---

✅ **Your Ravens TimeSheet database is now ready!**

Visit `http://localhost:5173` to access the application and `http://localhost:3001/health` to check the backend status. 