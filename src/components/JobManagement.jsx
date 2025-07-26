import React, { useState, useEffect } from 'react'

// Predefined task codes and descriptions
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

const JobManagement = ({ onBack }) => {
  const [jobs, setJobs] = useState(() => {
    const savedJobs = localStorage.getItem('ravensJobs')
    return savedJobs ? JSON.parse(savedJobs) : [
      {
        id: 1,
        workOrder: '4363',
        jobName: 'ABC Manufacturing Repair',
        location: '123 Industrial Blvd, City, State',
        totalHours: 40,
        completedHours: 12.5,
        sections: [
          { name: 'Excavation', budgetedHours: 10, completedHours: 3.5 },
          { name: 'Formwork', budgetedHours: 6, completedHours: 2.0 },
          { name: 'Welding', budgetedHours: 15, completedHours: 5.0 },
          { name: 'Finishing', budgetedHours: 9, completedHours: 2.0 }
        ],
        status: 'active'
      },
      {
        id: 2,
        workOrder: '4364',
        jobName: 'XYZ Corp Fabrication',
        location: '456 Factory Lane, City, State',
        totalHours: 60,
        completedHours: 45.0,
        sections: [
          { name: 'Steel Cutting', budgetedHours: 20, completedHours: 18.0 },
          { name: 'Assembly', budgetedHours: 25, completedHours: 20.0 },
          { name: 'Quality Check', budgetedHours: 15, completedHours: 7.0 }
        ],
        status: 'active'
      },
      {
        id: 3,
        workOrder: '4365',
        jobName: 'DEF Industries QA',
        location: '789 Warehouse Dr, City, State',
        totalHours: 30,
        completedHours: 8.0,
        sections: [
          { name: 'Inspection', budgetedHours: 15, completedHours: 4.0 },
          { name: 'Testing', budgetedHours: 10, completedHours: 3.0 },
          { name: 'Documentation', budgetedHours: 5, completedHours: 1.0 }
        ],
        status: 'active'
      }
    ]
  })

  const [newJob, setNewJob] = useState({
    workOrder: '',
    jobName: '',
    location: '',
    totalHours: '',
    sections: [{ name: '', budgetedHours: '' }]
  })

  const [editingJob, setEditingJob] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Save jobs to localStorage whenever jobs change
  useEffect(() => {
    localStorage.setItem('ravensJobs', JSON.stringify(jobs))
  }, [jobs])

  const getJobStatus = (job) => {
    const percentage = (job.completedHours / job.totalHours) * 100
    if (percentage <= 100) return 'green'
    if (percentage <= 120) return 'yellow'
    return 'red'
  }

  const getJobStatusText = (job) => {
    const percentage = (job.completedHours / job.totalHours) * 100
    if (percentage <= 100) return 'On Budget'
    if (percentage <= 120) return 'Over Budget'
    return 'Significantly Over'
  }

  const addJob = () => {
    if (!newJob.workOrder || !newJob.jobName || !newJob.location || !newJob.totalHours) {
      alert('Please fill in all required fields')
      return
    }

    // Validate sections
    const validSections = newJob.sections.filter(section => section.name && section.budgetedHours)
    if (validSections.length === 0) {
      alert('Please add at least one job section')
      return
    }

    const totalSectionHours = validSections.reduce((sum, section) => sum + parseFloat(section.budgetedHours), 0)
    if (Math.abs(totalSectionHours - parseFloat(newJob.totalHours)) > 0.1) {
      alert('Total section hours must equal total job hours')
      return
    }

    const job = {
      id: Date.now(),
      workOrder: newJob.workOrder,
      jobName: newJob.jobName,
      location: newJob.location,
      totalHours: parseFloat(newJob.totalHours),
      completedHours: 0,
      sections: validSections.map(section => ({
        name: section.name,
        budgetedHours: parseFloat(section.budgetedHours),
        completedHours: 0
      })),
      status: 'active'
    }

    setJobs([...jobs, job])
    setNewJob({ workOrder: '', jobName: '', location: '', totalHours: '', sections: [{ name: '', budgetedHours: '' }] })
    setShowAddForm(false)
  }

  const updateJob = () => {
    if (!editingJob.workOrder || !editingJob.jobName || !editingJob.location || !editingJob.totalHours) {
      alert('Please fill in all required fields')
      return
    }

    const validSections = editingJob.sections.filter(section => section.name && section.budgetedHours)
    if (validSections.length === 0) {
      alert('Please add at least one job section')
      return
    }

    const totalSectionHours = validSections.reduce((sum, section) => sum + parseFloat(section.budgetedHours), 0)
    if (Math.abs(totalSectionHours - parseFloat(editingJob.totalHours)) > 0.1) {
      alert('Total section hours must equal total job hours')
      return
    }

    setJobs(jobs.map(job => 
      job.id === editingJob.id ? { 
        ...editingJob, 
        totalHours: parseFloat(editingJob.totalHours),
        sections: validSections.map(section => ({
          ...section,
          budgetedHours: parseFloat(section.budgetedHours)
        }))
      } : job
    ))
    setEditingJob(null)
  }

  const deleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      setJobs(jobs.filter(job => job.id !== jobId))
    }
  }

  const addTask = (jobId) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? {
        ...job,
        sections: [...job.sections, { name: '', budgetedHours: '' }]
      } : job
    ))
  }

  const removeTask = (jobId, taskIndex) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? {
        ...job,
        sections: job.sections.filter((_, index) => index !== taskIndex)
      } : job
    ))
  }

  const updateTask = (jobId, taskIndex, field, value) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? {
        ...job,
        sections: job.sections.map((section, index) => 
          index === taskIndex ? { ...section, [field]: value } : section
        )
      } : job
    ))
  }

  const addNewJobSection = () => {
    setNewJob(prev => ({
      ...prev,
      sections: [...prev.sections, { name: '', budgetedHours: '' }]
    }))
  }

  const removeNewJobSection = (index) => {
    setNewJob(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }))
  }

  const updateNewJobSection = (index, field, value) => {
    setNewJob(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }))
  }

  const getJobByWorkOrder = (workOrder) => {
    return jobs.find(job => job.workOrder === workOrder)
  }

  const updateCompletedHours = (workOrder, hours) => {
    setJobs(jobs.map(job => 
      job.workOrder === workOrder 
        ? { ...job, completedHours: job.completedHours + parseFloat(hours) }
        : job
    ))
  }

  return (
    <div className="job-management-container">
      <div className="job-management-header">
        <div className="ravens-marine-logo-container">
          <img 
            src="/ravens-marine-logo.png" 
            alt="Ravens Marine Logo" 
            className="ravens-marine-logo"
          />
        </div>
        <h2>🏢 Job Management Dashboard</h2>
        <p>Track job progress, budgets, and section breakdowns</p>
      </div>

      {/* Add New Job Section */}
      <div className="add-job-section">
        <h3>➕ Add New Job</h3>
        <div className="job-form">
          <div className="form-row">
            <div className="input-group">
              <label>Work Order Number</label>
              <input
                type="text"
                className="form-input"
                value={newJob.workOrder}
                onChange={(e) => setNewJob({ ...newJob, workOrder: e.target.value })}
                placeholder="e.g., 4363"
              />
            </div>
            <div className="input-group">
              <label>Job Name</label>
              <input
                type="text"
                className="form-input"
                value={newJob.jobName}
                onChange={(e) => setNewJob({ ...newJob, jobName: e.target.value })}
                placeholder="e.g., ABC Manufacturing Repair"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Location</label>
              <input
                type="text"
                className="form-input"
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                placeholder="e.g., 123 Industrial Blvd, City, State"
              />
            </div>
            <div className="input-group">
              <label>Total Hours</label>
              <input
                type="number"
                className="form-input"
                value={newJob.totalHours}
                onChange={(e) => setNewJob({ ...newJob, totalHours: e.target.value })}
                placeholder="40"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          {/* Job Sections */}
          <div className="job-sections-input">
            <label>Job Sections</label>
            <div className="section-inputs">
              {newJob.sections.map((section, index) => (
                <div key={index} className="section-input-row">
                  <input
                    type="text"
                    className="form-input"
                    value={section.name}
                    onChange={(e) => updateNewJobSection(index, 'name', e.target.value)}
                    placeholder="Section name (e.g., Excavation)"
                  />
                  <input
                    type="number"
                    className="form-input"
                    value={section.budgetedHours}
                    onChange={(e) => updateNewJobSection(index, 'budgetedHours', e.target.value)}
                    placeholder="Hours"
                    min="0"
                    step="0.5"
                  />
                  {newJob.sections.length > 1 && (
                    <button 
                      className="remove-section-btn"
                      onClick={() => removeNewJobSection(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button className="add-section-btn" onClick={addNewJobSection}>
              ➕ Add Section
            </button>
          </div>

          <button className="btn btn-primary" onClick={addJob}>
            ➕ Add Job
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="jobs-grid">
        {jobs.map(job => {
          const status = getJobStatus(job)
          const statusText = getJobStatusText(job)
          const percentage = (job.completedHours / job.totalHours) * 100

          return (
            <div key={job.id} className={`job-card status-${status}`}>
              <div className="job-card-header">
                <h3 className="job-card-title">{job.jobName}</h3>
                <span className={`job-card-status ${status}`}>
                  {statusText}
                </span>
              </div>

              <div className="job-card-location">
                📍 {job.location}
              </div>

              <div className="job-card-progress">
                <div className="job-card-progress-header">
                  <span className="job-card-progress-title">Overall Progress</span>
                  <span className="job-card-progress-percentage">{percentage.toFixed(1)}%</span>
                </div>
                <div className="job-card-progress-bar">
                  <div 
                    className={`job-card-progress-fill ${status}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="job-card-hours">
                  <span>{job.completedHours.toFixed(1)} / {job.totalHours} hours</span>
                  <span>{Math.max(job.totalHours - job.completedHours, 0).toFixed(1)} remaining</span>
                </div>
              </div>

              {/* Job Sections */}
              <div className="job-sections">
                <div className="job-sections-title">Section Breakdown</div>
                {job.sections.map((section, index) => {
                  const sectionPercentage = (section.completedHours / section.budgetedHours) * 100
                  const isOverBudget = section.completedHours > section.budgetedHours

                  return (
                    <div key={index} className="job-section">
                      <div className="job-section-header">
                        <span className="job-section-name">{section.name}</span>
                        <span className="job-section-hours">
                          {section.completedHours.toFixed(1)} / {section.budgetedHours} hrs
                        </span>
                      </div>
                      <div className="job-section-progress">
                        <div 
                          className={`job-section-progress-fill ${isOverBudget ? 'over' : ''}`}
                          style={{ width: `${Math.min(sectionPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="job-card-actions">
                <button 
                  className="job-card-btn job-card-btn-edit"
                  onClick={() => setEditingJob(job)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="job-card-btn job-card-btn-delete"
                  onClick={() => deleteJob(job.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>✏️ Edit Job</h3>
            <div className="form-row">
              <div className="input-group">
                <label>Work Order Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingJob.workOrder}
                  onChange={(e) => setEditingJob({ ...editingJob, workOrder: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Job Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingJob.jobName}
                  onChange={(e) => setEditingJob({ ...editingJob, jobName: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingJob.location}
                  onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Total Hours</label>
                <input
                  type="number"
                  className="form-input"
                  value={editingJob.totalHours}
                  onChange={(e) => setEditingJob({ ...editingJob, totalHours: e.target.value })}
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            {/* Edit Task Selection */}
            <div className="job-sections-input">
              <label>Task Selection</label>
              <div className="section-inputs">
                {editingJob.sections.map((section, index) => (
                  <div key={index} className="section-input-row">
                    <div className="task-dropdown-container">
                      <select
                        className="form-input task-select"
                        value={section.name}
                        onChange={(e) => updateTask(editingJob.id, index, 'name', e.target.value)}
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
                            checked={!TASK_CODES.some(task => task.fullDisplay === section.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateTask(editingJob.id, index, 'name', 'Custom: ')
                              } else {
                                updateTask(editingJob.id, index, 'name', '')
                              }
                            }}
                          />
                          <span className="custom-task-label">Custom Task</span>
                        </label>
                        {!TASK_CODES.some(task => task.fullDisplay === section.name) && (
                          <input
                            type="text"
                            className="form-input custom-task-input"
                            value={section.name.startsWith('Custom: ') ? section.name.substring(8) : section.name}
                            onChange={(e) => updateTask(editingJob.id, index, 'name', `Custom: ${e.target.value}`)}
                            placeholder="Enter custom task name"
                          />
                        )}
                      </div>
                    </div>
                    <input
                      type="number"
                      className="form-input"
                      value={section.budgetedHours}
                      onChange={(e) => updateTask(editingJob.id, index, 'budgetedHours', e.target.value)}
                      min="0"
                      step="0.5"
                    />
                    {editingJob.sections.length > 1 && (
                      <button 
                        className="remove-task-btn"
                        onClick={() => removeTask(editingJob.id, index)}
                        title="Remove this task"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button className="add-section-btn" onClick={() => addTask(editingJob.id)}>
                ➕ Add Task
              </button>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={updateJob}>
                ✅ Update Job
              </button>
              <button className="btn btn-secondary" onClick={() => setEditingJob(null)}>
                ❌ Cancel
              </button>
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

export default JobManagement 