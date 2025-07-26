import { testConnection, executeQuery, tableExists } from '../config/database.js'

const setupDatabase = async () => {
  console.log('🚀 Setting up Ravens TimeSheet Database...')
  
  // Test connection first
  const connected = await testConnection()
  if (!connected) {
    console.error('❌ Cannot connect to database. Please check your configuration.')
    process.exit(1)
  }

  try {
    // Create employees table
    console.log('📋 Creating employees table...')
    const employeesSQL = `
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        position VARCHAR(100),
        department VARCHAR(100),
        hire_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name);
      CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);
    `
    await executeQuery(employeesSQL)

    // Create jobs table
    console.log('🏗️ Creating jobs table...')
    const jobsSQL = `
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        work_order VARCHAR(100) NOT NULL UNIQUE,
        job_name VARCHAR(255) NOT NULL,
        customer VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        description TEXT,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
        total_hours DECIMAL(10,2) DEFAULT 0,
        completed_hours DECIMAL(10,2) DEFAULT 0,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_jobs_work_order ON jobs(work_order);
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_customer ON jobs(customer);
    `
    await executeQuery(jobsSQL)

    // Create job_sections table
    console.log('📊 Creating job_sections table...')
    const jobSectionsSQL = `
      CREATE TABLE IF NOT EXISTS job_sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        section_name VARCHAR(255) NOT NULL,
        estimated_hours DECIMAL(10,2) DEFAULT 0,
        completed_hours DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_job_sections_job_id ON job_sections(job_id);
    `
    await executeQuery(jobSectionsSQL)

    // Create timesheets table
    console.log('📝 Creating timesheets table...')
    const timesheetsSQL = `
      CREATE TABLE IF NOT EXISTS timesheets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
        employee_name VARCHAR(255) NOT NULL,
        work_date DATE NOT NULL,
        shift_time DECIMAL(5,2),
        total_hours DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_timesheets_employee_id ON timesheets(employee_id);
      CREATE INDEX IF NOT EXISTS idx_timesheets_work_date ON timesheets(work_date);
      CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
    `
    await executeQuery(timesheetsSQL)

    // Create timesheet_entries table
    console.log('⏰ Creating timesheet_entries table...')
    const timesheetEntriesSQL = `
      CREATE TABLE IF NOT EXISTS timesheet_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        timesheet_id UUID NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
        job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
        work_order VARCHAR(100),
        customer VARCHAR(255),
        description TEXT,
        task_code VARCHAR(50),
        hours DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_timesheet_entries_timesheet_id ON timesheet_entries(timesheet_id);
      CREATE INDEX IF NOT EXISTS idx_timesheet_entries_job_id ON timesheet_entries(job_id);
    `
    await executeQuery(timesheetEntriesSQL)

    // Create attendance table
    console.log('👥 Creating attendance table...')
    const attendanceSQL = `
      CREATE TABLE IF NOT EXISTS attendance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        work_date DATE NOT NULL,
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
        hours_worked DECIMAL(5,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'partial', 'holiday')),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(employee_id, work_date)
      );
      
      CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, work_date);
      CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(work_date);
    `
    await executeQuery(attendanceSQL)

    // Create uploaded_files table
    console.log('📁 Creating uploaded_files table...')
    const uploadedFilesSQL = `
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(100),
        file_size INTEGER,
        file_path VARCHAR(500),
        timesheet_id UUID REFERENCES timesheets(id) ON DELETE SET NULL,
        employee_name VARCHAR(255),
        work_order VARCHAR(100),
        processed BOOLEAN DEFAULT false,
        processing_status VARCHAR(50) DEFAULT 'pending',
        processing_error TEXT,
        extracted_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_uploaded_files_timesheet_id ON uploaded_files(timesheet_id);
      CREATE INDEX IF NOT EXISTS idx_uploaded_files_processed ON uploaded_files(processed);
      CREATE INDEX IF NOT EXISTS idx_uploaded_files_employee ON uploaded_files(employee_name);
      CREATE INDEX IF NOT EXISTS idx_uploaded_files_work_order ON uploaded_files(work_order);
      CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON uploaded_files(created_at);
    `
    await executeQuery(uploadedFilesSQL)

    // Create database functions
    console.log('⚙️ Creating database functions...')
    const functionsSQL = `
      -- Function to update timestamps
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create triggers for updated_at
      DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
      CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
      CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_job_sections_updated_at ON job_sections;
      CREATE TRIGGER update_job_sections_updated_at BEFORE UPDATE ON job_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_timesheets_updated_at ON timesheets;
      CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON timesheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_timesheet_entries_updated_at ON timesheet_entries;
      CREATE TRIGGER update_timesheet_entries_updated_at BEFORE UPDATE ON timesheet_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_attendance_updated_at ON attendance;
      CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `
    await executeQuery(functionsSQL)

    console.log('✅ Database schema created successfully!')
    console.log('📊 Tables created:')
    console.log('   • employees - Store employee information')
    console.log('   • jobs - Track job/project details')
    console.log('   • job_sections - Job section breakdowns')
    console.log('   • timesheets - Individual timesheet records')
    console.log('   • timesheet_entries - Work entries within timesheets')
    console.log('   • attendance - Daily attendance tracking')
    console.log('   • uploaded_files - File upload tracking')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    process.exit(1)
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().then(() => {
    console.log('🎉 Database setup complete!')
    process.exit(0)
  }).catch((error) => {
    console.error('Setup failed:', error)
    process.exit(1)
  })
}

export default setupDatabase 