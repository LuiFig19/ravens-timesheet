import React from 'react'

const SimpleLogo = ({ size = 'medium', className = '' }) => {
  const sizeConfig = {
    small: { width: 120, height: 40 },
    medium: { width: 180, height: 60 },
    large: { width: 240, height: 80 },
    xlarge: { width: 360, height: 120 }
  }
  
  const config = sizeConfig[size] || sizeConfig.medium
  
  return (
    <div className={`simple-logo ${className}`} style={{ width: config.width, height: config.height }}>
      <img
        src="/ravens_logo_reference.png"
        alt="Ravens Logo"
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        onError={(e) => {
          // Fallback to text if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div 
        style={{
          display: 'none',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '12px',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: config.width / 10 + 'px',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          textAlign: 'center',
          letterSpacing: '1px'
        }}
      >
        RAVENS
      </div>
    </div>
  )
}

export default SimpleLogo 