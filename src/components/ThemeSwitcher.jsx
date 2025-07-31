import React, { useState, useEffect } from 'react'

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState('light')

  // Load saved theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('ravensTheme') || 'light'
    setCurrentTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  // Apply theme to document body
  const applyTheme = (theme) => {
    // Remove all theme classes
    document.body.classList.remove('theme-dark', 'theme-light')
    
    // Add the selected theme class - always add a theme class
    if (theme === 'dark') {
      document.body.classList.add('theme-dark')
    } else {
      document.body.classList.add('theme-light')
    }
    
    // Also update any app containers
    const appElements = document.querySelectorAll('.App, .app-container')
    appElements.forEach(el => {
      el.classList.remove('theme-dark', 'theme-light')
      el.classList.add(`theme-${theme}`)
    })
  }

  // Handle theme change
  const changeTheme = (theme) => {
    setCurrentTheme(theme)
    applyTheme(theme)
    localStorage.setItem('ravensTheme', theme)
  }

  return (
    <div className="theme-switcher">
      <button
        className={`theme-button light-mode ${currentTheme === 'light' ? 'active' : ''}`}
        onClick={() => changeTheme('light')}
        title="Light Mode"
        aria-label="Switch to Light Mode"
      >
        ☀️
      </button>
      
      <button
        className={`theme-button dark-mode ${currentTheme === 'dark' ? 'active' : ''}`}
        onClick={() => changeTheme('dark')}
        title="Dark Mode"
        aria-label="Switch to Dark Mode"
      >
        🌙
      </button>
    </div>
  )
}

export default ThemeSwitcher 