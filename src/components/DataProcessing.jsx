import React, { useState, useEffect } from 'react'

// Predefined task codes and descriptions (same as JobManagement)
const TASK_CODES = [
  { code: '100', description: 'Planning/Setup', fullDisplay: '100 - Planning/Setup' },
  { code: '110', description: 'Weld/Fab', fullDisplay: '110 - Weld/Fab' },
  { code: '120', description: 'Cut', fullDisplay: '120 - Cut' },
  { code: '130', description: 'Assembly', fullDisplay: '130 - Assembly' },
  { code: '140', description: 'Installation', fullDisplay: '140 - Installation' },
  { code: '150', description: 'Inspection', fullDisplay: '150 - Inspection' },
  { code: '160', description: 'Testing', fullDisplay: '160 - Testing' },
  { code: '170', description: 'Maintenance', fullDisplay: '170 - Maintenance' },
  { code: '180', description: 'Repair', fullDisplay: '180 - Repair' },
  { code: '190', description: 'Quality Control', fullDisplay: '190 - Quality Control' },
  { code: '200', description: 'Documentation', fullDisplay: '200 - Documentation' },
  { code: '210', description: 'Transportation', fullDisplay: '210 - Transportation' },
  { code: '220', description: 'Cleanup', fullDisplay: '220 - Cleanup' },
  { code: '230', description: 'Training', fullDisplay: '230 - Training' },
  { code: '240', description: 'Safety Meeting', fullDisplay: '240 - Safety Meeting' },
  { code: '250', description: 'Material Handling', fullDisplay: '250 - Material Handling' },
  { code: '260', description: 'Excavation', fullDisplay: '260 - Excavation' },
  { code: '270', description: 'Formwork', fullDisplay: '270 - Formwork' },
  { code: '280', description: 'Finishing', fullDisplay: '280 - Finishing' },
  { code: '290', description: 'Miscellaneous', fullDisplay: '290 - Miscellaneous' }
]

const DataProcessing = ({ data, onProcessingComplete, onBack }) => {
  const [formData, setFormData] = useState(data || {})
  const [validationError, setValidationError] = useState('')
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
    
    // Load jobs from localStorage
    const savedJobs = localStorage.getItem('ravensJobs')
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs))
    }
  }, [data])

  const getJobInfo = (workOrder) => {
    return jobs.find(job => job.workOrder === workOrder)
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setValidationError('')
  }

  const updateWorkEntry = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      workEntries: prev.workEntries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }))
    setValidationError('')
  }

  const addWorkEntry = () => {
    setFormData(prev => ({
      ...prev,
      workEntries: [
        ...prev.workEntries,
        {
          workOrder: '',
          customer: '',
          description: '',
          code: '',
          hours: ''
        }
      ]
    }))
  }

  const removeWorkEntry = (index) => {
    setFormData(prev => ({
      ...prev,
      workEntries: prev.workEntries.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const totalHours = formData.workEntries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.hours) || 0)
    }, 0)

    const shiftTime = parseFloat(formData.shiftTime) || 0

    if (totalHours > shiftTime) {
      setValidationError(`Total hours (${totalHours}) cannot exceed shift time (${shiftTime})`)
      return false
    }

    // Check if any work order exceeds remaining hours
    for (const entry of formData.workEntries) {
      const job = getJobInfo(entry.workOrder)
      if (job) {
        const remainingHours = job.totalHours - job.completedHours
        const entryHours = parseFloat(entry.hours) || 0
        if (entryHours > remainingHours) {
          setValidationError(`Work Order ${entry.workOrder} only has ${remainingHours.toFixed(1)} hours remaining (${entryHours} requested)`)
          return false
        }
      }
    }

    return true
  }

  const handleSubmit = () => {
    if (validateForm()) {
      // Update completed hours for each job
      const updatedJobs = jobs.map(job => {
        const entry = formData.workEntries.find(entry => entry.workOrder === job.workOrder)
        if (entry) {
          return {
            ...job,
            completedHours: job.completedHours + (parseFloat(entry.hours) || 0)
          }
        }
        return job
      })
      
      // Save updated jobs to localStorage
      localStorage.setItem('ravensJobs', JSON.stringify(updatedJobs))
      
      onProcessingComplete(formData)
    }
  }

  const totalHours = formData.workEntries?.reduce((sum, entry) => {
    return sum + (parseFloat(entry.hours) || 0)
  }, 0) || 0

  return (
    <div className="data-container">
      <div className="data-header">
        <h2>✏️ Edit Time Sheet Data</h2>
        <p>Review and edit the extracted information</p>
      </div>

      <div className="form-section">
        <h3>Employee Information</h3>
        <div className="input-group">
          <label>Employee Name</label>
          <input
            type="text"
            className="form-input"
            value={formData.employeeName || ''}
            onChange={(e) => updateFormData('employeeName', e.target.value)}
            placeholder="Enter employee name"
          />
        </div>

        <div className="input-group">
          <label>Date</label>
          <input
            type="date"
            className="form-input"
            value={formData.date || ''}
            onChange={(e) => updateFormData('date', e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Shift Time (hours)</label>
          <input
            type="number"
            className="form-input"
            value={formData.shiftTime || ''}
            onChange={(e) => updateFormData('shiftTime', e.target.value)}
            placeholder="8"
            min="0"
            step="0.5"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Work Entries</h3>
        {formData.workEntries?.map((entry, index) => {
          const jobInfo = getJobInfo(entry.workOrder)
          const remainingHours = jobInfo ? jobInfo.totalHours - jobInfo.completedHours : 0
          
          return (
            <div key={index} style={{ 
              border: '2px solid #e9ecef', 
              borderRadius: '15px', 
              padding: '1.5rem', 
              marginBottom: '1.5rem',
              background: '#f8f9fa'
            }}>
              {/* Job Information Display */}
              {jobInfo && (
                <div style={{ 
                  background: '#e3f2fd', 
                  padding: '1rem', 
                  borderRadius: '10px', 
                  marginBottom: '1rem',
                  border: '1px solid #2196f3'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>
                    📋 {jobInfo.jobName}
                  </h4>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                    <strong>Location:</strong> {jobInfo.location}
                  </p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                    <strong>Total Hours:</strong> {jobInfo.totalHours} | 
                    <strong> Completed:</strong> {jobInfo.completedHours.toFixed(1)} | 
                    <strong> Remaining:</strong> {remainingHours.toFixed(1)}
                  </p>
                  <div className="progress-bar" style={{ height: '6px', marginTop: '0.5rem' }}>
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${Math.min((jobInfo.completedHours / jobInfo.totalHours) * 100, 100)}%`,
                        backgroundColor: jobInfo.completedHours >= jobInfo.totalHours ? '#28a745' : '#667eea'
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="task-main-fields">
                <div className="input-group">
                  <label className="highlighted">Work Order Number</label>
                  <input
                    type="text"
                    className="form-input highlighted"
                    value={entry.workOrder || ''}
                    onChange={(e) => updateWorkEntry(index, 'workOrder', e.target.value)}
                    placeholder="4363"
                  />
                  {jobInfo && (
                    <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      ✅ Job found in system
                    </small>
                  )}
                  {entry.workOrder && !jobInfo && (
                    <small style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      ⚠️ Work order not found in job management
                    </small>
                  )}
                </div>

                <div className="input-group">
                  <label className="highlighted">Task</label>
                  <div className="task-selection-container">
                    <select
                      className="form-input highlighted task-select"
                      value={entry.description || ''}
                      onChange={(e) => updateWorkEntry(index, 'description', e.target.value)}
                    >
                      <option value="">Select a task...</option>
                      {TASK_CODES.map((task) => (
                        <option key={task.code} value={task.fullDisplay}>
                          {task.fullDisplay}
                        </option>
                      ))}
                    </select>
                    <div className="custom-task-option">
                      <label className="custom-task-toggle">
                        <input
                          type="checkbox"
                          checked={!TASK_CODES.some(task => task.fullDisplay === entry.description)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateWorkEntry(index, 'description', 'Custom: ')
                            } else {
                              updateWorkEntry(index, 'description', '')
                            }
                          }}
                        />
                        <span className="custom-task-label">Custom Task</span>
                      </label>
                      {!TASK_CODES.some(task => task.fullDisplay === entry.description) && (
                        <input
                          type="text"
                          className="form-input highlighted custom-task-input"
                          value={entry.description?.startsWith('Custom: ') ? entry.description.substring(8) : entry.description || ''}
                          onChange={(e) => updateWorkEntry(index, 'description', `Custom: ${e.target.value}`)}
                          placeholder="Enter custom task description"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label className="highlighted">Hours Worked</label>
                  <input
                    type="number"
                    className="hours-input highlighted"
                    value={entry.hours || ''}
                    onChange={(e) => updateWorkEntry(index, 'hours', e.target.value)}
                    placeholder="2.5"
                    min="0"
                    step="0.5"
                    max={remainingHours}
                  />
                  {jobInfo && (
                    <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Max: {remainingHours.toFixed(1)} hours remaining
                    </small>
                  )}
                </div>
              </div>

              <div className="task-secondary-fields">
                <div className="input-group">
                  <label>Customer</label>
                  <input
                    type="text"
                    className="form-input"
                    value={entry.customer || ''}
                    onChange={(e) => updateWorkEntry(index, 'customer', e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="input-group">
                  <label>Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={entry.code || ''}
                    onChange={(e) => updateWorkEntry(index, 'code', e.target.value)}
                    placeholder="WELD, FAB, QA, etc."
                  />
                </div>
              </div>

              {formData.workEntries.length > 1 && (
                <button 
                  className="remove-task-btn"
                  onClick={() => removeWorkEntry(index)}
                >
                  🗑️ Remove Entry
                </button>
              )}
            </div>
          )
        })}

        <button className="add-task-btn" onClick={addWorkEntry}>
          ➕ Add Work Entry
        </button>
      </div>

      {validationError && (
        <div className="error-message">
          {validationError}
        </div>
      )}

      <div style={{ 
        background: '#e9ecef', 
        padding: '1rem', 
        borderRadius: '10px', 
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <strong>Total Hours: {totalHours.toFixed(1)}</strong>
        {formData.shiftTime && (
          <span style={{ marginLeft: '1rem', color: '#666' }}>
            (Shift: {formData.shiftTime} hours)
          </span>
        )}
      </div>

      <div className="action-buttons">
        <button className="btn btn-primary" onClick={handleSubmit}>
          ✅ Continue to Export
        </button>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  )
}

export default DataProcessing 