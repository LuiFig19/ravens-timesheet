import React from 'react'

const WelcomeScreen = ({ onStart, onShowFolders, onShowJobManagement, onShowAttendance }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-header">
        {/* Ravens Logo */}
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