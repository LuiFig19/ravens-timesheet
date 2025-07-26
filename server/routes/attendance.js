import express from 'express'
import { executeQuery } from '../config/database.js'

const router = express.Router()

// GET /api/attendance - List attendance records
router.get('/', async (req, res) => {
  try {
    const { employee_id, start_date, end_date, week } = req.query

    let query = `
      SELECT a.*, e.name as employee_name, e.email, e.position, e.department
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
      WHERE 1=1
    `
    const values = []

    if (employee_id) {
      query += ` AND a.employee_id = $${values.length + 1}`
      values.push(employee_id)
    }
    
    if (start_date) {
      query += ` AND a.work_date >= $${values.length + 1}`
      values.push(start_date)
    }
    
    if (end_date) {
      query += ` AND a.work_date <= $${values.length + 1}`
      values.push(end_date)
    }
    
    // If week is specified, get that week's data
    if (week) {
      const weekStart = new Date(week)
      const weekEnd = new Date(week)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      query += ` AND a.work_date >= $${values.length + 1} AND a.work_date <= $${values.length + 2}`
      values.push(weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0])
    }

    query += ` ORDER BY a.work_date DESC`

    const result = await executeQuery(query, values)

    res.json({
      success: true,
      data: result.rows || [],
      count: result.rows?.length || 0
    })
  } catch (error) {
    console.error('Error fetching attendance:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance',
      message: error.message
    })
  }
})

// GET /api/attendance/weekly - Get weekly attendance summary
router.get('/weekly', async (req, res) => {
  try {
    const { week } = req.query
    
    if (!week) {
      return res.status(400).json({
        success: false,
        error: 'Week parameter is required (YYYY-MM-DD format)'
      })
    }

    const weekStart = new Date(week)
    const weekEnd = new Date(week)
    weekEnd.setDate(weekStart.getDate() + 6)

    // Get all employees
    const employeesResult = await executeQuery(
      'SELECT * FROM employees WHERE is_active = true ORDER BY name'
    )

    // Get attendance records for the week
    const attendanceResult = await executeQuery(
      'SELECT * FROM attendance WHERE work_date >= $1 AND work_date <= $2',
      [weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]]
    )

    const employees = employeesResult.rows
    const attendance = attendanceResult.rows

    // Create weekly summary
    const weeklyData = employees.map(employee => {
      const employeeAttendance = attendance.filter(a => a.employee_id === employee.id)
      
      const weeklyHours = {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
      }

      employeeAttendance.forEach(record => {
        const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][record.day_of_week - 1]
        weeklyHours[dayName] = parseFloat(record.hours_worked) || 0
      })

      const totalHours = Object.values(weeklyHours).reduce((sum, hours) => sum + hours, 0)

      return {
        employee_id: employee.id,
        employee_name: employee.name,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        weekly_hours: weeklyHours,
        total_hours: totalHours,
        days_present: employeeAttendance.length
      }
    })

    res.json({
      success: true,
      data: weeklyData,
      week_start: weekStart.toISOString().split('T')[0],
      week_end: weekEnd.toISOString().split('T')[0]
    })
  } catch (error) {
    console.error('Error fetching weekly attendance:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weekly attendance',
      message: error.message
    })
  }
})

// POST /api/attendance - Create attendance record
router.post('/', async (req, res) => {
  try {
    const { employee_id, work_date, hours_worked, status, notes } = req.body

    if (!employee_id || !work_date) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID and work date are required'
      })
    }

    // Calculate day of week (1=Monday, 7=Sunday)
    const date = new Date(work_date)
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay()

    const query = `
      INSERT INTO attendance (employee_id, work_date, day_of_week, hours_worked, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (employee_id, work_date) 
      DO UPDATE SET 
        hours_worked = EXCLUDED.hours_worked,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING *
    `
    const values = [
      employee_id,
      work_date,
      dayOfWeek,
      parseFloat(hours_worked) || 0,
      status || 'present',
      notes || null
    ]

    const result = await executeQuery(query, values)

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Attendance record created successfully'
    })
  } catch (error) {
    console.error('Error creating attendance:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create attendance record',
      message: error.message
    })
  }
})

// PUT /api/attendance/:id - Update attendance record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { hours_worked, status, notes } = req.body

    const query = `
      UPDATE attendance 
      SET hours_worked = $1, status = $2, notes = $3
      WHERE id = $4
      RETURNING *
    `
    const values = [
      parseFloat(hours_worked) || 0,
      status || 'present',
      notes || null,
      id
    ]

    const result = await executeQuery(query, values)

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      })
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Attendance record updated successfully'
    })
  } catch (error) {
    console.error('Error updating attendance:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update attendance record',
      message: error.message
    })
  }
})

// DELETE /api/attendance/:id - Delete attendance record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await executeQuery('DELETE FROM attendance WHERE id = $1', [id])

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      })
    }

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting attendance:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete attendance record',
      message: error.message
    })
  }
})

export default router 