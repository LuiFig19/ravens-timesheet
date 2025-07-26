import express from 'express'
import { executeQuery } from '../config/database.js'

const router = express.Router()

// GET /api/timesheets - List all timesheets
router.get('/', async (req, res) => {
  try {
    const { employee_id, employee_name, status, start_date, end_date } = req.query

    let query = `
      SELECT t.*, 
             COUNT(te.id) as entry_count,
             COALESCE(SUM(te.hours), 0) as total_hours
      FROM timesheets t
      LEFT JOIN timesheet_entries te ON t.id = te.timesheet_id
      WHERE 1=1
    `
    const values = []

    if (employee_id) {
      query += ` AND t.employee_id = $${values.length + 1}`
      values.push(employee_id)
    }

    if (employee_name) {
      query += ` AND t.employee_name ILIKE $${values.length + 1}`
      values.push(`%${employee_name}%`)
    }

    if (status) {
      query += ` AND t.status = $${values.length + 1}`
      values.push(status)
    }

    if (start_date) {
      query += ` AND t.work_date >= $${values.length + 1}`
      values.push(start_date)
    }

    if (end_date) {
      query += ` AND t.work_date <= $${values.length + 1}`
      values.push(end_date)
    }

    query += ` GROUP BY t.id ORDER BY t.work_date DESC`

    const result = await executeQuery(query, values)

    res.json({
      success: true,
      data: result.rows || [],
      count: result.rows?.length || 0
    })
  } catch (error) {
    console.error('Error fetching timesheets:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timesheets',
      message: error.message
    })
  }
})

// GET /api/timesheets/:id - Get timesheet by ID with entries
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Get timesheet details
    const timesheetResult = await executeQuery('SELECT * FROM timesheets WHERE id = $1', [id])

    if (timesheetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Timesheet not found'
      })
    }

    // Get timesheet entries
    const entriesResult = await executeQuery(
      'SELECT * FROM timesheet_entries WHERE timesheet_id = $1 ORDER BY created_at',
      [id]
    )

    const timesheet = timesheetResult.rows[0]
    timesheet.entries = entriesResult.rows

    res.json({
      success: true,
      data: timesheet
    })
  } catch (error) {
    console.error('Error fetching timesheet:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timesheet',
      message: error.message
    })
  }
})

// POST /api/timesheets - Create new timesheet
router.post('/', async (req, res) => {
  try {
    const { 
      employee_id, 
      employee_name, 
      work_date, 
      shift_time, 
      total_hours, 
      status, 
      notes,
      entries 
    } = req.body

    if (!employee_name || !work_date) {
      return res.status(400).json({
        success: false,
        error: 'Employee name and work date are required'
      })
    }

    // Start transaction
    await executeQuery('BEGIN')

    try {
      // Create timesheet
      const timesheetQuery = `
        INSERT INTO timesheets (employee_id, employee_name, work_date, shift_time, total_hours, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `
      const timesheetValues = [
        employee_id || null,
        employee_name.trim(),
        work_date,
        parseFloat(shift_time) || null,
        parseFloat(total_hours) || 0,
        status || 'draft',
        notes?.trim() || null
      ]

      const timesheetResult = await executeQuery(timesheetQuery, timesheetValues)
      const timesheet = timesheetResult.rows[0]

      // Create timesheet entries if provided
      if (entries && Array.isArray(entries)) {
        for (const entry of entries) {
          if (entry.hours && entry.hours > 0) {
            const entryQuery = `
              INSERT INTO timesheet_entries (timesheet_id, work_order, customer, description, task_code, hours)
              VALUES ($1, $2, $3, $4, $5, $6)
            `
            await executeQuery(entryQuery, [
              timesheet.id,
              entry.work_order?.trim() || null,
              entry.customer?.trim() || null,
              entry.description?.trim() || null,
              entry.task_code?.trim() || null,
              parseFloat(entry.hours)
            ])
          }
        }
      }

      await executeQuery('COMMIT')

      // Get complete timesheet with entries
      const completeTimesheetResult = await executeQuery(
        'SELECT * FROM timesheets WHERE id = $1',
        [timesheet.id]
      )
      const entriesResult = await executeQuery(
        'SELECT * FROM timesheet_entries WHERE timesheet_id = $1 ORDER BY created_at',
        [timesheet.id]
      )

      const completeTimesheet = completeTimesheetResult.rows[0]
      completeTimesheet.entries = entriesResult.rows

      res.status(201).json({
        success: true,
        data: completeTimesheet,
        message: 'Timesheet created successfully'
      })
    } catch (error) {
      await executeQuery('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error creating timesheet:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create timesheet',
      message: error.message
    })
  }
})

// PUT /api/timesheets/:id - Update timesheet
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { 
      employee_id, 
      employee_name, 
      work_date, 
      shift_time, 
      total_hours, 
      status, 
      notes,
      entries 
    } = req.body

    if (!employee_name || !work_date) {
      return res.status(400).json({
        success: false,
        error: 'Employee name and work date are required'
      })
    }

    // Start transaction
    await executeQuery('BEGIN')

    try {
      // Update timesheet
      const timesheetQuery = `
        UPDATE timesheets 
        SET employee_id = $1, employee_name = $2, work_date = $3, shift_time = $4, 
            total_hours = $5, status = $6, notes = $7
        WHERE id = $8
        RETURNING *
      `
      const timesheetValues = [
        employee_id || null,
        employee_name.trim(),
        work_date,
        parseFloat(shift_time) || null,
        parseFloat(total_hours) || 0,
        status || 'draft',
        notes?.trim() || null,
        id
      ]

      const timesheetResult = await executeQuery(timesheetQuery, timesheetValues)

      if (timesheetResult.rows.length === 0) {
        await executeQuery('ROLLBACK')
        return res.status(404).json({
          success: false,
          error: 'Timesheet not found'
        })
      }

      // Update entries if provided
      if (entries && Array.isArray(entries)) {
        // Delete existing entries
        await executeQuery('DELETE FROM timesheet_entries WHERE timesheet_id = $1', [id])

        // Create new entries
        for (const entry of entries) {
          if (entry.hours && entry.hours > 0) {
            const entryQuery = `
              INSERT INTO timesheet_entries (timesheet_id, work_order, customer, description, task_code, hours)
              VALUES ($1, $2, $3, $4, $5, $6)
            `
            await executeQuery(entryQuery, [
              id,
              entry.work_order?.trim() || null,
              entry.customer?.trim() || null,
              entry.description?.trim() || null,
              entry.task_code?.trim() || null,
              parseFloat(entry.hours)
            ])
          }
        }
      }

      await executeQuery('COMMIT')

      // Get complete timesheet with entries
      const completeTimesheetResult = await executeQuery(
        'SELECT * FROM timesheets WHERE id = $1',
        [id]
      )
      const entriesResult = await executeQuery(
        'SELECT * FROM timesheet_entries WHERE timesheet_id = $1 ORDER BY created_at',
        [id]
      )

      const completeTimesheet = completeTimesheetResult.rows[0]
      completeTimesheet.entries = entriesResult.rows

      res.json({
        success: true,
        data: completeTimesheet,
        message: 'Timesheet updated successfully'
      })
    } catch (error) {
      await executeQuery('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error updating timesheet:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update timesheet',
      message: error.message
    })
  }
})

// DELETE /api/timesheets/:id - Delete timesheet
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await executeQuery('DELETE FROM timesheets WHERE id = $1', [id])

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Timesheet not found'
      })
    }

    res.json({
      success: true,
      message: 'Timesheet deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting timesheet:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete timesheet',
      message: error.message
    })
  }
})

// GET /api/timesheets/:id/entries - Get timesheet entries
router.get('/:id/entries', async (req, res) => {
  try {
    const { id } = req.params

    const result = await executeQuery(
      'SELECT * FROM timesheet_entries WHERE timesheet_id = $1 ORDER BY created_at',
      [id]
    )

    res.json({
      success: true,
      data: result.rows || [],
      count: result.rows?.length || 0
    })
  } catch (error) {
    console.error('Error fetching timesheet entries:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timesheet entries',
      message: error.message
    })
  }
})

export default router 