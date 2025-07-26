import express from 'express'
import { executeQuery } from '../config/database.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// GET /api/uploads - List uploaded files
router.get('/', async (req, res) => {
  try {
    const { processed, timesheet_id } = req.query

    let query = `
      SELECT * FROM uploaded_files 
      WHERE 1=1
    `
    const values = []

    if (processed !== undefined) {
      query += ` AND processed = $${values.length + 1}`
      values.push(processed === 'true')
    }
    
    if (timesheet_id) {
      query += ` AND timesheet_id = $${values.length + 1}`
      values.push(timesheet_id)
    }

    query += ` ORDER BY created_at DESC`

    const result = await executeQuery(query, values)

    res.json({
      success: true,
      data: result.rows || [],
      count: result.rows?.length || 0
    })
  } catch (error) {
    console.error('Error fetching uploads:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch uploads',
      message: error.message
    })
  }
})

// POST /api/uploads - Handle file upload (base64)
router.post('/', async (req, res) => {
  try {
    const { 
      filename, 
      file_data, 
      file_type, 
      timesheet_id,
      processing_data,
      employee_name,
      work_order
    } = req.body

    if (!filename || !file_data) {
      return res.status(400).json({
        success: false,
        error: 'Filename and file data are required'
      })
    }

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}_${filename}`
    
    // Calculate file size (approximate from base64)
    const fileSize = Math.floor((file_data.length * 3) / 4)

    const uploadData = {
      filename: uniqueFilename,
      original_name: filename,
      file_type: file_type || 'image/jpeg',
      file_size: fileSize,
      file_path: `/uploads/${uniqueFilename}`,
      timesheet_id: timesheet_id || null,
      employee_name: employee_name || null,
      work_order: work_order || null,
      processed: false,
      processing_status: 'pending',
      extracted_data: processing_data ? JSON.stringify(processing_data) : null
    }

    const query = `
      INSERT INTO uploaded_files (
        filename, original_name, file_type, file_size, file_path, 
        timesheet_id, employee_name, work_order, processed, 
        processing_status, extracted_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `
    const values = [
      uploadData.filename,
      uploadData.original_name,
      uploadData.file_type,
      uploadData.file_size,
      uploadData.file_path,
      uploadData.timesheet_id,
      uploadData.employee_name,
      uploadData.work_order,
      uploadData.processed,
      uploadData.processing_status,
      uploadData.extracted_data
    ]

    const result = await executeQuery(query, values)
    const data = result.rows[0]

    // If processing data is provided, simulate OCR processing
    if (processing_data) {
      // Update with processing results
      const updateQuery = `
        UPDATE uploaded_files 
        SET processed = true, processing_status = 'completed'
        WHERE id = $1
      `
      await executeQuery(updateQuery, [data.id])
    }

    res.status(201).json({
      success: true,
      data,
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      message: error.message
    })
  }
})

// POST /api/uploads/:id/process - Process uploaded file
router.post('/:id/process', async (req, res) => {
  try {
    const { id } = req.params
    const { extracted_data } = req.body

    // Update file as processed
    const updateQuery = `
      UPDATE uploaded_files 
      SET processed = true, processing_status = 'completed', extracted_data = $1
      WHERE id = $2
      RETURNING *
    `
    const updateResult = await executeQuery(updateQuery, [
      extracted_data ? JSON.stringify(extracted_data) : null,
      id
    ])

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Upload not found'
      })
    }

    const data = updateResult.rows[0]

    // If extracted data is provided, create a timesheet
    if (extracted_data && extracted_data.employee_name) {
      const timesheetData = {
        employee_name: extracted_data.employee_name,
        work_date: extracted_data.date || new Date().toISOString().split('T')[0],
        shift_time: parseFloat(extracted_data.shift_time) || null,
        total_hours: extracted_data.work_entries?.reduce((sum, entry) => 
          sum + (parseFloat(entry.hours) || 0), 0) || 0,
        status: 'draft'
      }

      const timesheetQuery = `
        INSERT INTO timesheets (employee_name, work_date, shift_time, total_hours, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `
      const timesheetValues = [
        timesheetData.employee_name,
        timesheetData.work_date,
        timesheetData.shift_time,
        timesheetData.total_hours,
        timesheetData.status
      ]

      const timesheetResult = await executeQuery(timesheetQuery, timesheetValues)
      const timesheet = timesheetResult.rows[0]

      if (timesheet) {
        // Link the file to the timesheet
        await executeQuery(
          'UPDATE uploaded_files SET timesheet_id = $1 WHERE id = $2',
          [timesheet.id, id]
        )

        // Add timesheet entries
        if (extracted_data.work_entries && Array.isArray(extracted_data.work_entries)) {
          for (const entry of extracted_data.work_entries) {
            const entryQuery = `
              INSERT INTO timesheet_entries (timesheet_id, work_order, customer, description, task_code, hours)
              VALUES ($1, $2, $3, $4, $5, $6)
            `
            const entryValues = [
              timesheet.id,
              entry.work_order?.trim() || null,
              entry.customer?.trim() || null,
              entry.description?.trim() || null,
              entry.code?.trim() || null,
              parseFloat(entry.hours) || 0
            ]
            await executeQuery(entryQuery, entryValues)
          }
        }

        return res.json({
          success: true,
          data: {
            upload: data,
            timesheet
          },
          message: 'File processed and timesheet created successfully'
        })
      }
    }

    res.json({
      success: true,
      data,
      message: 'File processed successfully'
    })
  } catch (error) {
    console.error('Error processing file:', error)
    
    // Update file with error status
    await executeQuery(
      'UPDATE uploaded_files SET processing_status = $1, processing_error = $2 WHERE id = $3',
      ['error', error.message, req.params.id]
    )

    res.status(500).json({
      success: false,
      error: 'Failed to process file',
      message: error.message
    })
  }
})

// DELETE /api/uploads/:id - Delete uploaded file
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await executeQuery('DELETE FROM uploaded_files WHERE id = $1', [id])

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      })
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
      message: error.message
    })
  }
})

// GET /api/uploads/stats - Get upload statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await executeQuery('SELECT processed, processing_status FROM uploaded_files')
    const allFiles = result.rows

    const stats = {
      total: allFiles.length,
      processed: allFiles.filter(f => f.processed).length,
      pending: allFiles.filter(f => f.processing_status === 'pending').length,
      error: allFiles.filter(f => f.processing_status === 'error').length
    }

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching upload stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upload statistics',
      message: error.message
    })
  }
})

// GET /api/uploads/:id/download - Download uploaded file
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params

    // Get file info from database
    const result = await executeQuery('SELECT * FROM uploaded_files WHERE id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      })
    }

    const file = result.rows[0]

    // For now, return a mock file since we don't have actual file storage
    // In production, you would retrieve the actual file from storage
    const mockFileContent = `Mock file content for ${file.original_name}`
    const buffer = Buffer.from(mockFileContent, 'utf8')

    res.setHeader('Content-Type', file.file_type || 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`)
    res.setHeader('Content-Length', buffer.length)
    
    res.send(buffer)
  } catch (error) {
    console.error('Error downloading file:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to download file',
      message: error.message
    })
  }
})

export default router 