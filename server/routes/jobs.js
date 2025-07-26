import express from 'express'
import { executeQuery } from '../config/database.js'

const router = express.Router()

// GET /api/jobs - List all jobs
router.get('/', async (req, res) => {
  try {
    const { status, customer } = req.query

    let query = `
      SELECT j.*, 
             COUNT(js.id) as section_count,
             COALESCE(SUM(js.estimated_hours), 0) as total_estimated_hours,
             COALESCE(SUM(js.completed_hours), 0) as total_completed_hours
      FROM jobs j
      LEFT JOIN job_sections js ON j.id = js.job_id
      WHERE 1=1
    `
    const values = []

    if (status) {
      query += ` AND j.status = $${values.length + 1}`
      values.push(status)
    }

    if (customer) {
      query += ` AND j.customer ILIKE $${values.length + 1}`
      values.push(`%${customer}%`)
    }

    query += ` GROUP BY j.id ORDER BY j.created_at DESC`

    const result = await executeQuery(query, values)

    res.json({
      success: true,
      data: result.rows || [],
      count: result.rows?.length || 0
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
      message: error.message
    })
  }
})

// GET /api/jobs/:id - Get job by ID with sections
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Get job details
    const jobResult = await executeQuery('SELECT * FROM jobs WHERE id = $1', [id])

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      })
    }

    // Get job sections
    const sectionsResult = await executeQuery(
      'SELECT * FROM job_sections WHERE job_id = $1 ORDER BY created_at',
      [id]
    )

    const job = jobResult.rows[0]
    job.sections = sectionsResult.rows

    res.json({
      success: true,
      data: job
    })
  } catch (error) {
    console.error('Error fetching job:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job',
      message: error.message
    })
  }
})

// POST /api/jobs - Create new job
router.post('/', async (req, res) => {
  try {
    const { 
      work_order, 
      job_name, 
      customer, 
      location, 
      description, 
      total_hours, 
      start_date, 
      end_date,
      sections 
    } = req.body

    if (!work_order || !job_name || !customer) {
      return res.status(400).json({
        success: false,
        error: 'Work order, job name, and customer are required'
      })
    }

    // Start transaction
    const client = await executeQuery('BEGIN')

    try {
      // Create job
      const jobQuery = `
        INSERT INTO jobs (work_order, job_name, customer, location, description, total_hours, start_date, end_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `
      const jobValues = [
        work_order.trim(),
        job_name.trim(),
        customer.trim(),
        location?.trim() || null,
        description?.trim() || null,
        parseFloat(total_hours) || 0,
        start_date || null,
        end_date || null
      ]

      const jobResult = await executeQuery(jobQuery, jobValues)
      const job = jobResult.rows[0]

      // Create job sections if provided
      if (sections && Array.isArray(sections)) {
        for (const section of sections) {
          if (section.name && section.estimated_hours) {
            const sectionQuery = `
              INSERT INTO job_sections (job_id, section_name, estimated_hours)
              VALUES ($1, $2, $3)
            `
            await executeQuery(sectionQuery, [
              job.id,
              section.name.trim(),
              parseFloat(section.estimated_hours)
            ])
          }
        }
      }

      await executeQuery('COMMIT')

      // Get complete job with sections
      const completeJobResult = await executeQuery(
        'SELECT * FROM jobs WHERE id = $1',
        [job.id]
      )
      const sectionsResult = await executeQuery(
        'SELECT * FROM job_sections WHERE job_id = $1 ORDER BY created_at',
        [job.id]
      )

      const completeJob = completeJobResult.rows[0]
      completeJob.sections = sectionsResult.rows

      res.status(201).json({
        success: true,
        data: completeJob,
        message: 'Job created successfully'
      })
    } catch (error) {
      await executeQuery('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error creating job:', error)
    
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Job with this work order already exists'
      })
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create job',
      message: error.message
    })
  }
})

// PUT /api/jobs/:id - Update job
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { 
      work_order, 
      job_name, 
      customer, 
      location, 
      description, 
      total_hours, 
      start_date, 
      end_date,
      status 
    } = req.body

    if (!work_order || !job_name || !customer) {
      return res.status(400).json({
        success: false,
        error: 'Work order, job name, and customer are required'
      })
    }

    const query = `
      UPDATE jobs 
      SET work_order = $1, job_name = $2, customer = $3, location = $4, 
          description = $5, total_hours = $6, start_date = $7, end_date = $8, status = $9
      WHERE id = $10
      RETURNING *
    `
    const values = [
      work_order.trim(),
      job_name.trim(),
      customer.trim(),
      location?.trim() || null,
      description?.trim() || null,
      parseFloat(total_hours) || 0,
      start_date || null,
      end_date || null,
      status || 'active',
      id
    ]

    const result = await executeQuery(query, values)

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      })
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Job updated successfully'
    })
  } catch (error) {
    console.error('Error updating job:', error)
    
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Job with this work order already exists'
      })
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update job',
      message: error.message
    })
  }
})

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await executeQuery('DELETE FROM jobs WHERE id = $1', [id])

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      })
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting job:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete job',
      message: error.message
    })
  }
})

// GET /api/jobs/:id/sections - Get job sections
router.get('/:id/sections', async (req, res) => {
  try {
    const { id } = req.params

    const result = await executeQuery(
      'SELECT * FROM job_sections WHERE job_id = $1 ORDER BY created_at',
      [id]
    )

    res.json({
      success: true,
      data: result.rows || [],
      count: result.rows?.length || 0
    })
  } catch (error) {
    console.error('Error fetching job sections:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job sections',
      message: error.message
    })
  }
})

export default router 