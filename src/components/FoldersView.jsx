import React, { useState, useEffect } from 'react'
import { uploadAPI, timesheetAPI, employeeAPI, apiHelpers } from '../services/api'

const FoldersView = ({ onBack }) => {
  const [allDocuments, setAllDocuments] = useState([])
  const [employees, setEmployees] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showTopFolderPopup, setShowTopFolderPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedEmployees, setExpandedEmployees] = useState(new Set())

  // Load all documents and employees on component mount
  useEffect(() => {
    loadSavedFoldersData()
  }, [])

  const loadSavedFoldersData = async () => {
    setLoading(true)
    setError('')
    try {
      // Check if backend is available first
      console.log('🔄 Loading saved folders data...')
      
      // Load all uploaded files and timesheets
      const [uploadsResponse, timesheetsResponse, employeesResponse] = await Promise.all([
        uploadAPI.getAll().catch(err => {
          console.warn('⚠️ Uploads API not available:', err.message)
          return { data: { data: [] } }
        }),
        timesheetAPI.getAll().catch(err => {
          console.warn('⚠️ Timesheets API not available:', err.message)
          return { data: { data: [] } }
        }),
        employeeAPI.getAll().catch(err => {
          console.warn('⚠️ Employees API not available:', err.message)
          return { data: { data: [] } }
        })
      ])

      const uploads = uploadsResponse.data.data || []
      const timesheets = timesheetsResponse.data.data || []
      const dbEmployees = employeesResponse.data.data || []

      // Combine uploads and timesheets into documents
      const documents = []
      
      // Add uploaded files
      uploads.forEach(upload => {
        documents.push({
          id: upload.id,
          type: 'upload',
          filename: upload.original_name,
          date: new Date(upload.created_at).toLocaleDateString(),
          workOrder: upload.work_order || 'N/A',
          employee: upload.employee_name || 'Unknown',
          fileType: upload.file_type,
          processed: upload.processed,
          status: upload.processing_status,
          timesheetId: upload.timesheet_id,
          createdAt: upload.created_at
        })
      })

      // Add timesheets
      timesheets.forEach(timesheet => {
        documents.push({
          id: timesheet.id,
          type: 'timesheet',
          filename: `Timesheet_${timesheet.employee_name}_${timesheet.work_date}`,
          date: timesheet.work_date,
          workOrder: timesheet.work_order || 'N/A',
          employee: timesheet.employee_name,
          fileType: 'timesheet',
          processed: true,
          status: timesheet.status,
          totalHours: timesheet.total_hours,
          createdAt: timesheet.created_at
        })
      })

      // Sort by newest first
      documents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      setAllDocuments(documents)

      // Create employee list with their associated files
      const employeeMap = new Map()
      
      // Add ALL employees from database first (ensures all employees show up)
      dbEmployees.forEach(emp => {
        employeeMap.set(emp.name, {
          id: emp.id,
          name: emp.name,
          email: emp.email,
          position: emp.position,
          department: emp.department,
          files: [],
          timesheets: [],
          uploads: []
        })
      })

      // Group documents by employee and type
      documents.forEach(doc => {
        if (!employeeMap.has(doc.employee)) {
          // Auto-create new employee entry for employees not in database
          employeeMap.set(doc.employee, {
            id: `auto_${Date.now()}_${Math.random()}`,
            name: doc.employee,
            email: '',
            position: 'Unknown',
            department: 'Unknown',
            files: [],
            timesheets: [],
            uploads: []
          })
        }
        
        const employee = employeeMap.get(doc.employee)
        employee.files.push(doc)
        
        // Separate by type for better organization
        if (doc.type === 'timesheet') {
          employee.timesheets.push(doc)
        } else if (doc.type === 'upload') {
          employee.uploads.push(doc)
        }
      })

      // Sort employees alphabetically and sort their files by date
      const sortedEmployees = Array.from(employeeMap.values())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(emp => ({
          ...emp,
          files: emp.files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
          timesheets: emp.timesheets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
          uploads: emp.uploads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }))

      setEmployees(sortedEmployees)

    } catch (error) {
      console.error('Error loading saved folders data:', error)
      
      // Check if it's a connection error (backend not running)
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('⚠️ Backend server is not running. Please start the backend server with: npm run dev:server')
      } else {
        setError(apiHelpers.formatErrorMessage(error))
      }
    } finally {
      setLoading(false)
    }
  }

  // Filter documents based on search term
  const filteredDocuments = allDocuments.filter(doc => {
    const searchLower = searchTerm.toLowerCase()
    return (
      doc.filename.toLowerCase().includes(searchLower) ||
      doc.date.toLowerCase().includes(searchLower) ||
      doc.workOrder.toLowerCase().includes(searchLower) ||
      doc.employee.toLowerCase().includes(searchLower)
    )
  })

  // Filter employees based on search term (show ALL employees if no search term)
  const filteredEmployees = employees.filter(emp => {
    if (!searchTerm) return true // Show all employees when no search
    
    const searchLower = searchTerm.toLowerCase()
    return (
      emp.name.toLowerCase().includes(searchLower) ||
      emp.position?.toLowerCase().includes(searchLower) ||
      emp.department?.toLowerCase().includes(searchLower) ||
      emp.files.some(file => 
        file.filename.toLowerCase().includes(searchLower) ||
        file.date.toLowerCase().includes(searchLower) ||
        file.workOrder.toLowerCase().includes(searchLower)
      )
    )
  })

  const toggleEmployeeExpansion = (employeeId) => {
    const newExpanded = new Set(expandedEmployees)
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId)
    } else {
      newExpanded.add(employeeId)
    }
    setExpandedEmployees(newExpanded)
  }

  const downloadFile = async (document) => {
    try {
      if (document.type === 'timesheet') {
        // Generate and download timesheet as PDF/CSV
        const response = await timesheetAPI.getById(document.id)
        const timesheet = response.data.data
        
        // Create CSV content
        const csvContent = generateTimesheetCSV(timesheet)
        downloadCSV(csvContent, `${document.filename}.csv`)
      } else {
        // Download uploaded file
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/uploads/${document.id}/download`)
        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = document.filename
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file')
    }
  }

  const generateTimesheetCSV = (timesheet) => {
    const headers = ['Employee', 'Date', 'Work Order', 'Description', 'Hours', 'Total Hours']
    const rows = [headers]
    
    // Add timesheet data
    if (timesheet.entries && timesheet.entries.length > 0) {
      timesheet.entries.forEach(entry => {
        rows.push([
          timesheet.employee_name,
          timesheet.work_date,
          entry.work_order || 'N/A',
          entry.description || 'N/A',
          entry.hours,
          timesheet.total_hours
        ])
      })
    } else {
      rows.push([
        timesheet.employee_name,
        timesheet.work_date,
        'N/A',
        'N/A',
        timesheet.total_hours,
        timesheet.total_hours
      ])
    }
    
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'green'
      case 'pending':
      case 'draft':
        return 'yellow'
      case 'error':
      case 'rejected':
        return 'red'
      default:
        return 'grey'
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType === 'timesheet') return '📝'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('image')) return '📷'
    if (fileType.includes('csv') || fileType.includes('excel')) return '📊'
    return '📁'
  }

  return (
    <div className="saved-folders-container">
      <div className="saved-folders-header">
        <div className="ravens-marine-logo-container">
          <img 
            src="/ravens-marine-logo.svg" 
            alt="Ravens Marine Logo" 
            className="ravens-marine-logo"
          />
        </div>
        <h2>📁 Saved Folders</h2>
        <p>Organized document storage and retrieval system</p>
      </div>

      {/* Top Folder Button */}
      <div className="top-folder-section">
        <button 
          className="btn btn-primary top-folder-btn"
          onClick={() => setShowTopFolderPopup(true)}
        >
          🗂️ View All Documents
        </button>
      </div>

      {/* Search Functionality */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by name, date, work order, or employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading saved folders...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <p>❌ {error}</p>
          <button className="btn btn-secondary" onClick={loadSavedFoldersData}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Employee-Based File Organization */}
      {!loading && !error && (
        <div className="employees-section">
          <h3>👥 Employee Files</h3>
          
          {/* No Data Message */}
          {filteredEmployees.length === 0 && employees.length === 0 && (
            <div className="no-data-container">
              <div className="no-data-message">
                <h4>📁 No Files Found</h4>
                <p>Start by processing some timesheets to see saved documents here.</p>
                <div className="no-data-tips">
                  <p><strong>💡 Tips:</strong></p>
                  <ul>
                    <li>📷 Process timesheet images from the main page</li>
                    <li>🏗️ Create jobs in Job Management</li>
                    <li>👥 Add employees in Attendance</li>
                    <li>🖥️ Make sure the backend server is running</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="employees-list">
            {filteredEmployees.map(employee => (
              <div key={employee.id} className="employee-card">
                <div 
                  className="employee-header"
                  onClick={() => toggleEmployeeExpansion(employee.id)}
                >
                  <div className="employee-info">
                    <div className="employee-main">
                      <span className="employee-name">👤 {employee.name}</span>
                      {employee.position && employee.position !== 'Unknown' && (
                        <span className="employee-position">• {employee.position}</span>
                      )}
                      {employee.department && employee.department !== 'Unknown' && (
                        <span className="employee-department">• {employee.department}</span>
                      )}
                    </div>
                    <div className="employee-stats">
                      <span className="employee-file-count">
                        📁 {employee.files.length} total files
                      </span>
                      {employee.timesheets.length > 0 && (
                        <span className="timesheet-count">
                          📊 {employee.timesheets.length} timesheets
                        </span>
                      )}
                      {employee.uploads.length > 0 && (
                        <span className="upload-count">
                          📎 {employee.uploads.length} uploads
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="employee-actions">
                    <span className={`expand-icon ${expandedEmployees.has(employee.id) ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {expandedEmployees.has(employee.id) && (
                  <div className="employee-files">
                    {employee.files.length === 0 ? (
                      <div className="no-files">
                        <p>📝 No timesheet files found for this employee</p>
                        <p className="no-files-hint">Files will appear here when timesheets are processed</p>
                      </div>
                    ) : (
                      <div className="files-sections">
                        {/* Timesheets Section */}
                        {employee.timesheets.length > 0 && (
                          <div className="file-section">
                            <h5 className="section-title">📊 Timesheets ({employee.timesheets.length})</h5>
                            {employee.timesheets.map(file => (
                              <div key={file.id} className="file-item timesheet-file">
                                <div className="file-info">
                                  <span className="file-icon">📊</span>
                                  <div className="file-details">
                                    <span className="file-name">{file.filename}</span>
                                    <span className="file-date">📅 {file.date}</span>
                                    <span className="file-work-order">🧾 {file.workOrder}</span>
                                    {file.totalHours && (
                                      <span className="file-hours">⏱️ {file.totalHours} hours</span>
                                    )}
                                  </div>
                                </div>
                                <div className="file-actions">
                                  <button 
                                    className="download-btn"
                                    onClick={() => downloadFile(file)}
                                    title="Download timesheet"
                                  >
                                    💾
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Uploads Section */}
                        {employee.uploads.length > 0 && (
                          <div className="file-section">
                            <h5 className="section-title">📎 Uploaded Files ({employee.uploads.length})</h5>
                            {employee.uploads.map(file => (
                              <div key={file.id} className="file-item upload-file">
                                <div className="file-info">
                                  <span className="file-icon">
                                    {getFileIcon(file.fileType)}
                                  </span>
                                  <div className="file-details">
                                    <span className="file-name">{file.filename}</span>
                                    <span className="file-date">📅 {file.date}</span>
                                    <span className="file-work-order">🧾 {file.workOrder}</span>
                                  </div>
                                </div>
                                <div className="file-actions">
                                  <span className={`file-status ${getStatusColor(file.status)}`}>
                                    {file.status}
                                  </span>
                                  <button 
                                    className="download-btn"
                                    onClick={() => downloadFile(file)}
                                    title="Download file"
                                  >
                                    ⬇️
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Folder Popup */}
      {showTopFolderPopup && (
        <div className="modal-overlay" onClick={() => setShowTopFolderPopup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🗂️ All Submitted Documents</h3>
              <button 
                className="close-btn"
                onClick={() => setShowTopFolderPopup(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-search">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="documents-list">
              {filteredDocuments.length === 0 ? (
                <p className="no-documents">No documents found</p>
              ) : (
                filteredDocuments.map(doc => (
                  <div key={doc.id} className="document-item">
                    <div className="document-info">
                      <span className="document-icon">
                        {getFileIcon(doc.fileType)}
                      </span>
                      <div className="document-details">
                        <span className="document-name">{doc.filename}</span>
                        <div className="document-meta">
                          <span className="document-date">📅 {doc.date}</span>
                          <span className="document-employee">👤 {doc.employee}</span>
                          <span className="document-work-order">🧾 {doc.workOrder}</span>
                        </div>
                      </div>
                    </div>
                    <div className="document-actions">
                      <span className={`document-status ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                      <button 
                        className="download-btn"
                        onClick={() => downloadFile(doc)}
                        title="Download document"
                      >
                        ⬇️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Home
        </button>
      </div>
    </div>
  )
}

export default FoldersView 