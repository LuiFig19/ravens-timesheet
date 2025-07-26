import { supabase } from '../config/database.js'

const migrateLocalStorageData = async () => {
  console.log('🔄 Migrating localStorage data to PostgreSQL...')
  
  try {
    // Sample data migration (you can customize this based on your needs)
    console.log('📋 Migrating sample employee data...')
    
    // Insert sample employees
    const sampleEmployees = [
      {
        name: 'John Smith',
        email: 'john.smith@company.com',
        position: 'Senior Technician',
        department: 'Manufacturing',
        hire_date: '2023-01-15'
      },
      {
        name: 'Jane Doe',
        email: 'jane.doe@company.com',
        position: 'Quality Inspector',
        department: 'Quality Assurance',
        hire_date: '2023-03-20'
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        position: 'Welder',
        department: 'Manufacturing',
        hire_date: '2022-11-10'
      }
    ]

    const { data: employeesData, error: employeesError } = await supabase
      .from('employees')
      .insert(sampleEmployees)
      .select()

    if (employeesError && employeesError.code !== '23505') { // Ignore duplicate errors
      console.error('Employee migration error:', employeesError)
    } else {
      console.log(`✅ Migrated ${sampleEmployees.length} employees`)
    }

    // Insert sample jobs
    console.log('🏗️ Migrating sample job data...')
    const sampleJobs = [
      {
        work_order: '4363',
        job_name: 'Production Line Repair',
        customer: 'ABC Manufacturing',
        location: 'Plant A - Line 3',
        description: 'Welding repair on production line equipment',
        status: 'active',
        total_hours: 40,
        completed_hours: 15,
        start_date: '2024-01-15'
      },
      {
        work_order: '4364',
        job_name: 'Steel Bracket Fabrication',
        customer: 'XYZ Corp',
        location: 'Workshop B',
        description: 'Fabrication of custom steel brackets for construction project',
        status: 'active',
        total_hours: 32,
        completed_hours: 24,
        start_date: '2024-01-20'
      },
      {
        work_order: '4365',
        job_name: 'Quality Inspection Project',
        customer: 'DEF Industries',
        location: 'QA Lab',
        description: 'Quality inspection and testing of manufactured components',
        status: 'active',
        total_hours: 20,
        completed_hours: 8,
        start_date: '2024-01-25'
      }
    ]

    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .insert(sampleJobs)
      .select()

    if (jobsError && jobsError.code !== '23505') {
      console.error('Jobs migration error:', jobsError)
    } else {
      console.log(`✅ Migrated ${sampleJobs.length} jobs`)
    }

    // Add job sections for the first job
    if (jobsData && jobsData.length > 0) {
      console.log('📊 Adding job sections...')
      const jobSections = [
        {
          job_id: jobsData[0].id,
          section_name: 'Preparation',
          estimated_hours: 8,
          completed_hours: 8
        },
        {
          job_id: jobsData[0].id,
          section_name: 'Welding',
          estimated_hours: 24,
          completed_hours: 7
        },
        {
          job_id: jobsData[0].id,
          section_name: 'Finishing',
          estimated_hours: 8,
          completed_hours: 0
        }
      ]

      const { error: sectionsError } = await supabase
        .from('job_sections')
        .insert(jobSections)

      if (sectionsError) {
        console.error('Job sections migration error:', sectionsError)
      } else {
        console.log(`✅ Added ${jobSections.length} job sections`)
      }
    }

    // Create sample timesheet data
    if (employeesData && employeesData.length > 0 && jobsData && jobsData.length > 0) {
      console.log('📝 Creating sample timesheet data...')
      
      const sampleTimesheet = {
        employee_id: employeesData[0].id,
        employee_name: employeesData[0].name,
        work_date: '2024-01-22',
        shift_time: 8,
        total_hours: 8,
        status: 'submitted'
      }

      const { data: timesheetData, error: timesheetError } = await supabase
        .from('timesheets')
        .insert(sampleTimesheet)
        .select()

      if (timesheetError && timesheetError.code !== '23505') {
        console.error('Timesheet migration error:', timesheetError)
      } else {
        console.log('✅ Created sample timesheet')

        // Add timesheet entries
        if (timesheetData && timesheetData.length > 0) {
          const timesheetEntries = [
            {
              timesheet_id: timesheetData[0].id,
              job_id: jobsData[0].id,
              work_order: '4363',
              customer: 'ABC Manufacturing',
              description: 'Welding repair on production line',
              task_code: 'WELD',
              hours: 2.5
            },
            {
              timesheet_id: timesheetData[0].id,
              job_id: jobsData[1].id,
              work_order: '4364',
              customer: 'XYZ Corp',
              description: 'Fabrication of steel brackets',
              task_code: 'FAB',
              hours: 3.0
            },
            {
              timesheet_id: timesheetData[0].id,
              job_id: jobsData[2].id,
              work_order: '4365',
              customer: 'DEF Industries',
              description: 'Quality inspection and testing',
              task_code: 'QA',
              hours: 2.5
            }
          ]

          const { error: entriesError } = await supabase
            .from('timesheet_entries')
            .insert(timesheetEntries)

          if (entriesError) {
            console.error('Timesheet entries migration error:', entriesError)
          } else {
            console.log(`✅ Added ${timesheetEntries.length} timesheet entries`)
          }
        }
      }

      // Create attendance records
      console.log('👥 Creating sample attendance data...')
      const currentDate = new Date()
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1) // Monday

      const attendanceRecords = []
      for (let i = 0; i < 5; i++) { // Monday to Friday
        const workDate = new Date(startOfWeek)
        workDate.setDate(startOfWeek.getDate() + i)
        
        attendanceRecords.push({
          employee_id: employeesData[0].id,
          work_date: workDate.toISOString().split('T')[0],
          day_of_week: i + 1,
          hours_worked: i === 2 ? 6 : 8, // Wednesday only 6 hours
          status: 'present'
        })
      }

      const { error: attendanceError } = await supabase
        .from('attendance')
        .insert(attendanceRecords)

      if (attendanceError && attendanceError.code !== '23505') {
        console.error('Attendance migration error:', attendanceError)
      } else {
        console.log(`✅ Created ${attendanceRecords.length} attendance records`)
      }
    }

    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    throw error
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateLocalStorageData().then(() => {
    console.log('✅ Data migration complete!')
    process.exit(0)
  }).catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
}

export default migrateLocalStorageData 