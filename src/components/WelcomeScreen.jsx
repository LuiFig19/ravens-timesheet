import React from 'react'

const WelcomeScreen = ({ onStart, onShowFolders, onShowJobManagement, onShowAttendance }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-header">
        {/* Ravens Marine Logo */}
        <div className="ravens-marine-logo-container">
          <img 
            src="/ravens-marine-logo.png" 
            alt="Ravens Marine Logo" 
            className="ravens-marine-logo"
          />
        </div>
        
        {/* Centered clipboard icon */}
        <div className="jumping-clipboard">📋</div>
      </div>
      
      <div className="welcome-actions">
        {/* Main call-to-action button */}
        <button className="btn btn-primary main-action-btn" onClick={onStart}>
          📷 Start Processing Time Sheet
        </button>
        
        {/* Secondary navigation buttons */}
        <div className="secondary-actions">
          <button className="btn btn-secondary" onClick={onShowFolders}>
            📁 Saved Folders
          </button>

          <button className="btn btn-secondary" onClick={onShowJobManagement}>
            🏗️ Job Management
          </button>

          <button className="btn btn-secondary" onClick={onShowAttendance}>
            👥 Attendance
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen 