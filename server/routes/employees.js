import express from 'express'
import { executeQuery } from '../config/database.js'

const router = express.Router()

// GET /api/employees - List all employees
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT * FROM employees 
      WHERE is_active = true 
      ORDER BY name
    `
    const result = await executeQuery(query)

    res.json({
      success: true,
      data: result.rows || [],
      count: result.rows?.length || 0
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employees',
      message: error.message
    })
  }
})

// GET /api/employees/:id - Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const query = `
      SELECT * FROM employees 
      WHERE id = $1 AND is_active = true
    `
    const result = await executeQuery(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      })
    }

    res.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error fetching employee:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employee',
      message: error.message
    })
  }
})

// POST /api/employees - Create new employee
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, position, department, hire_date } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Employee name is required'
      })
    }

    const query = `
      INSERT INTO employees (name, email, phone, position, department, hire_date, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    const values = [
      name.trim(),
      email?.trim() || null,
      phone?.trim() || null,
      position?.trim() || null,
      department?.trim() || null,
      hire_date || null,
      true
    ]

    const result = await executeQuery(query, values)

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Employee created successfully'
    })
  } catch (error) {
    console.error('Error creating employee:', error)
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Employee with this email already exists'
      })
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create employee',
      message: error.message
    })
  }
})

// PUT /api/employees/:id - Update employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, position, department, hire_date, is_active } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Employee name is required'
      })
    }

    const query = `
      UPDATE employees 
      SET name = $1, email = $2, phone = $3, position = $4, department = $5, hire_date = $6, is_active = $7
      WHERE id = $8
      RETURNING *
    `
    const values = [
      name.trim(),
      email?.trim() || null,
      phone?.trim() || null,
      position?.trim() || null,
      department?.trim() || null,
      hire_date || null,
      is_active !== undefined ? is_active : true,
      id
    ]

    const result = await executeQuery(query, values)

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      })
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Employee updated successfully'
    })
  } catch (error) {
    console.error('Error updating employee:', error)
    
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Employee with this email already exists'
      })
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update employee',
      message: error.message
    })
  }
})

// DELETE /api/employees/:id - Soft delete employee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const query = `
      UPDATE employees 
      SET is_active = false 
      WHERE id = $1
      RETURNING *
    `
    const result = await executeQuery(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      })
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting employee:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete employee',
      message: error.message
    })
  }
})

// GET /api/employees/:id/attendance - Get employee attendance
router.get('/:id/attendance', async (req, res) => {
  try {
    const { id } = req.params
    const { start_date, end_date } = req.query

    let query = `
      SELECT a.*, e.name as employee_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.employee_id = $1
    `
    const values = [id]

    if (start_date) {
      query += ` AND a.work_date >= $${values.length + 1}`
      values.push(start_date)
    }

    if (end_date) {
      query += ` AND a.work_date <= $${values.length + 1}`
      values.push(end_date)
    }

    query += ` ORDER BY a.work_date DESC`

    const result = await executeQuery(query, values)

    res.json({
      success: true,
      data: result.rows || [],
      count: result.rows?.length || 0
    })
  } catch (error) {
    console.error('Error fetching employee attendance:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employee attendance',
      message: error.message
    })
  }
})

export default router 