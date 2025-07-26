import React, { useState, useEffect } from 'react'
import { employeeAPI, attendanceAPI, apiHelpers } from '../services/api'

const Attendance = ({ onBack }) => {
  const [employees, setEmployees] = useState([])
  const [newEmployee, setNewEmployee] = useState({ name: '', hours: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(apiHelpers.getCurrentWeekMonday())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load employees and attendance data from PostgreSQL
  useEffect(() => {
    loadEmployeesAndAttendance()
  }, [currentWeek])

  const loadEmployeesAndAttendance = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('🔄 Loading employees and attendance data...')
      
      // Test API connectivity first (especially important for mobile)
      const connectivityTest = await apiHelpers.testAndUpdateConnection()
      if (!connectivityTest.success) {
        console.warn('⚠️ API connectivity test failed, but continuing anyway')
        console.warn('Attempted URLs:', connectivityTest.attemptedUrls)
        // Don't throw error, just warn and continue with fallback
      } else {
        console.log('✅ API connectivity verified')
      }
      
      // Load employees from database
      const employeesResponse = await employeeAPI.getAll()
      const dbEmployees = employeesResponse.data.data || []
      console.log(`✅ Loaded ${dbEmployees.length} employees from database`)

      // Load weekly attendance data
      const attendanceResponse = await attendanceAPI.getWeekly(currentWeek)
      const weeklyData = attendanceResponse.data.data || []
      console.log(`✅ Loaded ${weeklyData.length} attendance records`)

      // Convert database format to component format
      const formattedEmployees = dbEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email || '',
        position: emp.position || 'Employee',
        department: emp.department || 'Operations',
        totalHours: 0,
        weeklyHours: {
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
          sunday: 0
        }
      }))

      // Merge with weekly attendance data if available
      if (weeklyData.length > 0) {
        weeklyData.forEach(weekEmp => {
          const existingEmp = formattedEmployees.find(emp => emp.id === weekEmp.employee_id)
          if (existingEmp) {
            existingEmp.weeklyHours = weekEmp.weekly_hours || existingEmp.weeklyHours
            existingEmp.totalHours = weekEmp.total_hours || 0
          }
        })
      }

      // Migration: Add any localStorage employees not in database
      const localEmployees = JSON.parse(localStorage.getItem('ravensEmployees') || '[]')
      for (const localEmp of localEmployees) {
        if (!formattedEmployees.find(emp => emp.name === localEmp.name)) {
          console.log(`🔄 Migrating local employee: ${localEmp.name}`)
          formattedEmployees.push({
            id: `local_${Date.now()}_${Math.random()}`,
            name: localEmp.name,
            email: '',
            position: 'Employee',
            department: 'Operations',
            totalHours: localEmp.totalHours || 0,
            weeklyHours: localEmp.weeklyHours || {
              monday: 0,
              tuesday: 0,
              wednesday: 0,
              thursday: 0,
              friday: 0,
              saturday: 0,
              sunday: 0
            }
          })
        }
      }

      console.log(`✅ Total employees loaded: ${formattedEmployees.length}`)
      setEmployees(formattedEmployees)
      
      // Clear localStorage after successful migration
      if (localEmployees.length > 0 && dbEmployees.length > 0) {
        localStorage.removeItem('ravensEmployees')
        console.log('🗑️ Cleared localStorage after migration')
      }
      
    } catch (error) {
      console.error('❌ Error loading employees and attendance:', error)
      console.error('Error details:', error.response?.data || error.message)
      setError(apiHelpers.formatErrorMessage(error))
      
      // Fallback to localStorage if database fails
      const localEmployees = JSON.parse(localStorage.getItem('ravensEmployees') || '[]')
      console.log(`🔄 Falling back to ${localEmployees.length} local employees`)
      setEmployees(localEmployees)
    } finally {
      setLoading(false)
    }
  }

  function getDayStatus(employee, dayIndex) {
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayName = dayNames[dayIndex]
    
    if (!employee.weeklyHours || !employee.weeklyHours[dayName]) {
      if (dayIndex < 5) { // Weekday (M-F)
        return 'red'
      } else { // Weekend (S-S)
        return 'grey'
      }
    }
    
    const hours = employee.weeklyHours[dayName]
    if (hours >= 10) {
      return 'green'
    } else if (hours > 0) {
      return 'yellow'
    } else {
      return dayIndex < 5 ? 'red' : 'grey'
    }
  }

  async function addEmployee() {
    if (!newEmployee.name.trim()) {
      alert('Please enter an employee name')
      return
    }

    setLoading(true)
    try {
      console.log('🔄 Creating employee in database:', newEmployee.name.trim())
      
      // Try to create in database first
      const response = await employeeAPI.create({
        name: newEmployee.name.trim(),
        email: '',
        position: 'Employee',
        department: 'Operations',
        phone: '',
        hire_date: new Date().toISOString().split('T')[0],
        is_active: true
      })

      const dbEmployee = response.data.data
      console.log('✅ Employee created in database:', dbEmployee)

      const employee = {
        id: dbEmployee.id,
        name: dbEmployee.name,
        email: dbEmployee.email || '',
        position: dbEmployee.position || 'Employee',
        department: dbEmployee.department || 'Operations',
        totalHours: 0,
        weeklyHours: {
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
          sunday: 0
        }
      }

      setEmployees([...employees, employee])
      setNewEmployee({ name: '', hours: '' })
      setShowAddForm(false)
      
      console.log('✅ Employee added to local state')
      
    } catch (error) {
      console.error('❌ Error creating employee in database:', error)
      console.error('Error details:', error.response?.data || error.message)
      
      // Fallback to localStorage
      console.log('🔄 Falling back to localStorage')
      const employee = {
        id: `local_${Date.now()}_${Math.random()}`,
        name: newEmployee.name.trim(),
        email: '',
        position: 'Employee',
        department: 'Operations',
        totalHours: 0,
        weeklyHours: {
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
          sunday: 0
        }
      }

      const updatedEmployees = [...employees, employee]
      setEmployees(updatedEmployees)
      localStorage.setItem('ravensEmployees', JSON.stringify(updatedEmployees))
      
      setNewEmployee({ name: '', hours: '' })
      setShowAddForm(false)
      
      console.log('✅ Employee saved to localStorage as fallback')
    } finally {
      setLoading(false)
    }
  }

  async function removeEmployee(employeeId) {
    if (!confirm('Are you sure you want to remove this employee?')) return

    setLoading(true)
    try {
      // Try to delete from database if it has a valid UUID
      if (typeof employeeId === 'string' && employeeId.includes('-')) {
        await employeeAPI.delete(employeeId)
      }

      const updatedEmployees = employees.filter(emp => emp.id !== employeeId)
      setEmployees(updatedEmployees)
      
      // Update localStorage as backup
      localStorage.setItem('ravensEmployees', JSON.stringify(updatedEmployees))
    } catch (error) {
      console.error('Error removing employee:', error)
      // Still remove from local state even if database delete fails
      const updatedEmployees = employees.filter(emp => emp.id !== employeeId)
      setEmployees(updatedEmployees)
      localStorage.setItem('ravensEmployees', JSON.stringify(updatedEmployees))
    } finally {
      setLoading(false)
    }
  }

  async function updateEmployeeHours(employeeId, day, hours) {
    const hoursValue = parseFloat(hours) || 0
    
    // Update local state immediately for better UX
    const updatedEmployees = employees.map(emp => {
      if (emp.id === employeeId) {
        const updatedWeeklyHours = {
          ...emp.weeklyHours,
          [day]: hoursValue
        }
        
        const totalHours = Object.values(updatedWeeklyHours).reduce((sum, h) => sum + h, 0)
        
        return {
          ...emp,
          weeklyHours: updatedWeeklyHours,
          totalHours: totalHours
        }
      }
      return emp
    })
    
    setEmployees(updatedEmployees)
    
    // Update localStorage as backup
    localStorage.setItem('ravensEmployees', JSON.stringify(updatedEmployees))

    // Try to update database
    try {
      if (typeof employeeId === 'string' && employeeId.includes('-')) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const dayOfWeek = dayNames.indexOf(day)
        
        if (dayOfWeek > 0) {
          const workDate = new Date(currentWeek)
          workDate.setDate(workDate.getDate() + dayOfWeek - 1)
          
          await attendanceAPI.create({
            employee_id: employeeId,
            work_date: workDate.toISOString().split('T')[0],
            hours_worked: hoursValue,
            status: hoursValue > 0 ? 'present' : 'absent'
          })
        }
      }
    } catch (error) {
      console.error('Error updating attendance in database:', error)
      // Don't show error to user since local update worked
    }
  }

  async function importFromTimesheets() {
    setLoading(true)
    try {
      // Migrate any localStorage data to database
      await apiHelpers.migrateLocalStorageData()
      
      // Reload employees and attendance
      await loadEmployeesAndAttendance()
    } catch (error) {
      console.error('Error importing data:', error)
      setError('Failed to import data from database')
      
      // Fallback: Add some sample employees to localStorage
      const sampleEmployees = [
        {
          id: Date.now() + 1,
          name: 'John Smith',
          totalHours: 42,
          weeklyHours: {
            monday: 8,
            tuesday: 8,
            wednesday: 8,
            thursday: 8,
            friday: 8,
            saturday: 2,
            sunday: 0
          }
        },
        {
          id: Date.now() + 2,
          name: 'Jane Doe',
          totalHours: 38,
          weeklyHours: {
            monday: 8,
            tuesday: 8,
            wednesday: 6,
            thursday: 8,
            friday: 8,
            saturday: 0,
            sunday: 0
          }
        }
      ]
      
      const updatedEmployees = [...employees, ...sampleEmployees]
      setEmployees(updatedEmployees)
      localStorage.setItem('ravensEmployees', JSON.stringify(updatedEmployees))
    } finally {
      setLoading(false)
    }
  }

  function getWeekDays() {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    return days
  }

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <div className="ravens-logo-container">
          <img 
            src="/ravens-logo.png" 
            alt="Ravens Logo" 
            className="ravens-logo-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback text if image fails to load */}
          <div className="ravens-logo-fallback">
            <div className="ravens-logo-text">RAVENS</div>
          </div>
        </div>
        <h2>👥 Employee Attendance</h2>
        <p>Track employee hours and weekly attendance</p>
        {error && (
          <div style={{ 
            background: '#fee', 
            color: '#c33', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Add Employee Section */}
      <div className="add-employee-section">
        <h3>➕ Add Employee</h3>
        <div className="employee-form">
          <div className="form-row">
            <div className="input-group">
              <label>Employee Name</label>
              <input
                type="text"
                className="form-input"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                placeholder="Enter employee name"
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label>&nbsp;</label>
              <button 
                className="btn btn-primary" 
                onClick={addEmployee}
                disabled={loading}
              >
                {loading ? '⏳ Adding...' : '➕ Add Employee'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="import-section">
        <h3>📊 Import from Database</h3>
        <button 
          className="btn btn-secondary" 
          onClick={importFromTimesheets}
          disabled={loading}
        >
          {loading ? '⏳ Loading...' : '📥 Import Employee Data'}
        </button>
      </div>

      {/* Employees List */}
      <div className="employees-list">
        <h3>👥 Employee List</h3>
        {loading && employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            ⏳ Loading employees...
          </div>
        ) : employees.length === 0 ? (
          <div className="no-employees">
            <p>No employees added yet. Add employees manually or import from database.</p>
          </div>
        ) : (
          <div className="employees-grid">
            {employees.map(employee => (
              <div key={employee.id} className="employee-card">
                <div className="employee-header">
                  <h4 className="employee-name">{employee.name}</h4>
                  <div className="employee-total">
                    <span className="total-hours">{employee.totalHours.toFixed(1)} hrs</span>
                    <button 
                      className="remove-employee-btn"
                      onClick={() => removeEmployee(employee.id)}
                      disabled={loading}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Weekly Days */}
                <div className="weekly-days">
                  <div className="days-header">
                    <span>Weekly Attendance:</span>
                  </div>
                  <div className="days-grid">
                    {getWeekDays().map((day, index) => {
                      const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                      const dayName = dayNames[index]
                      const status = getDayStatus(employee, index)
                      const hours = employee.weeklyHours[dayName] || 0
                      
                      return (
                        <div key={index} className="day-item">
                          <div className={`day-indicator ${status}`}>
                            {day}
                          </div>
                          <input
                            type="number"
                            className="day-hours-input"
                            value={hours}
                            onChange={(e) => updateEmployeeHours(employee.id, dayName, e.target.value)}
                            placeholder="0"
                            min="0"
                            max="24"
                            step="0.5"
                            disabled={loading}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Status Legend */}
                <div className="status-legend">
                  <div className="legend-item">
                    <span className="legend-color green"></span>
                    <span>10+ hours</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color yellow"></span>
                    <span>1-9 hours</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color red"></span>
                    <span>No hours (weekday)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color grey"></span>
                    <span>Weekend</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Home
        </button>
      </div>
    </div>
  )
}

export default Attendance 