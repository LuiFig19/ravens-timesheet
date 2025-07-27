import React, { useState, useEffect, useRef } from 'react'
import './PinGate.css'

const PinGate = ({ children, onAuthenticated }) => {
  const [pin, setPin] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showError, setShowError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRef = useRef(null)

  // Hardcoded PIN - in production, this should come from environment variable
  const CORRECT_PIN = import.meta.env.VITE_ACCESS_PIN || '1234'

  useEffect(() => {
    // Always require PIN - no session persistence
    // This ensures PIN is required on every page load/refresh
    setIsAuthenticated(false)
    
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Only allow digits
    if (value.length <= 6) { // Limit to 6 digits max
      setPin(value)
      setShowError(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (pin.length === 0) return

    setIsLoading(true)
    
    // Add a small delay to simulate processing (prevents rapid fire attempts)
    await new Promise(resolve => setTimeout(resolve, 500))

    if (pin === CORRECT_PIN) {
      // Successful authentication - no session storage
      setIsAuthenticated(true)
      onAuthenticated && onAuthenticated()
    } else {
      // Failed authentication
      setShowError(true)
      setShake(true)
      setPin('')
      
      // Remove shake animation after it completes
      setTimeout(() => setShake(false), 500)
      
      // Focus back to input
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
    
    setIsLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  // If authenticated, render the children
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Render PIN gate
  return (
    <div className="pin-gate-overlay">
      <div className="pin-gate-container">
        <div className="pin-gate-content">
          {/* Logo/Icon */}
          <div className="pin-gate-icon">
            🔒
          </div>
          
          {/* Title */}
          <h1 className="pin-gate-title">
            Ravens TimeSheet
          </h1>
          
          {/* Subtitle */}
          <p className="pin-gate-subtitle">
            🔒 Enter Access PIN to Use the Site
          </p>
          
          {/* PIN Form */}
          <form onSubmit={handleSubmit} className="pin-gate-form">
            <div className={`pin-input-container ${shake ? 'shake' : ''}`}>
              <input
                ref={inputRef}
                type="password"
                value={pin}
                onChange={handlePinChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter PIN"
                className={`pin-input ${showError ? 'error' : ''}`}
                maxLength="6"
                autoComplete="off"
                disabled={isLoading}
              />
              
              {/* Pin dots indicator */}
              <div className="pin-dots">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`pin-dot ${i < pin.length ? 'filled' : ''}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Error message */}
            {showError && (
              <div className="pin-error">
                ❌ Incorrect PIN. Please try again.
              </div>
            )}
            
            {/* Submit button */}
            <button 
              type="submit" 
              className={`pin-submit ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || pin.length === 0}
            >
              {isLoading ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                'Access Site'
              )}
            </button>
          </form>
          
          {/* Footer */}
          <div className="pin-gate-footer">
            <p>🏢 For authorized personnel only</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PinGate 