import React, { useState } from 'react'
import './App.css'
import WelcomeScreen from './components/WelcomeScreen'
import CameraCapture from './components/CameraCapture'
import ImageAnalysis from './components/ImageAnalysis'
import DataProcessing from './components/DataProcessing'
import FileExport from './components/FileExport'
import FoldersView from './components/FoldersView'
import JobManagement from './components/JobManagement'
import Attendance from './components/Attendance'

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showFolders, setShowFolders] = useState(false)
  const [showJobManagement, setShowJobManagement] = useState(false)
  const [showAttendance, setShowAttendance] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [processedData, setProcessedData] = useState(null)

  const handleStart = () => {
    setCurrentStep(1)
  }

  const handleShowFolders = () => {
    setShowFolders(true)
  }

  const handleShowJobManagement = () => {
    setShowJobManagement(true)
  }

  const handleShowAttendance = () => {
    setShowAttendance(true)
  }

  const handleBackFromFolders = () => {
    setShowFolders(false)
  }

  const handleBackFromJobManagement = () => {
    setShowJobManagement(false)
  }

  const handleBackFromAttendance = () => {
    setShowAttendance(false)
  }

  const handleImageCapture = (imageData) => {
    setCapturedImage(imageData)
    setCurrentStep(2)
  }

  const handleImageAnalysis = (data) => {
    setProcessedData(data)
    setCurrentStep(3)
  }

  const handleUseDemo = () => {
    const demoData = {
      employeeName: 'John Smith',
      date: new Date().toISOString().split('T')[0],
      shiftTime: '8',
      workEntries: [
        {
          workOrder: '4363',
          customer: 'ABC Manufacturing',
          description: 'Welding repair on production line',
          code: 'WELD',
          hours: '2.5'
        },
        {
          workOrder: '4364',
          customer: 'XYZ Corp',
          description: 'Fabrication of steel brackets',
          code: 'FAB',
          hours: '3.0'
        },
        {
          workOrder: '4365',
          customer: 'DEF Industries',
          description: 'Quality inspection and testing',
          code: 'QA',
          hours: '2.5'
        }
      ]
    }
    setProcessedData(demoData)
    setCurrentStep(3)
  }

  const handleProcessingComplete = (data) => {
    setProcessedData(data)
    setCurrentStep(4)
  }

  const handleExportComplete = () => {
    setCurrentStep(0)
    setCapturedImage(null)
    setProcessedData(null)
    setShowFolders(false)
    setShowJobManagement(false)
    setShowAttendance(false)
  }

  const handleBackToWelcome = () => {
    setCurrentStep(0)
    setCapturedImage(null)
    setProcessedData(null)
    setShowFolders(false)
    setShowJobManagement(false)
    setShowAttendance(false)
  }

  return (
    <div className="App">
      {currentStep > 0 && (
        <header className="App-header">
          <div className="header-content">
            <div className="header-left">
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
            </div>
            <div className="header-center">
              {/* Title removed */}
            </div>
            <div className="header-right">
              {/* Empty for now, could add user info or other controls */}
            </div>
          </div>
          
          <div className="progress-bar" data-progress={currentStep}>
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>📷 Capture</div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>🔍 Analyze</div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>⚙️ Process</div>
            <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>📊 Export</div>
          </div>
        </header>
      )}

      <main className="App-main">
        {showFolders && (
          <FoldersView onBack={handleBackFromFolders} />
        )}

        {showJobManagement && (
          <JobManagement onBack={handleBackFromJobManagement} />
        )}

        {showAttendance && (
          <Attendance onBack={handleBackFromAttendance} />
        )}

        {!showFolders && !showJobManagement && !showAttendance && (
          <>
            {currentStep === 0 && (
              <WelcomeScreen
                onStart={handleStart}
                onShowFolders={handleShowFolders}
                onShowJobManagement={handleShowJobManagement}
                onShowAttendance={handleShowAttendance}
              />
            )}

            {currentStep === 1 && (
              <CameraCapture
                onImageCapture={handleImageCapture}
                onUseDemo={handleUseDemo}
                onBack={handleBackToWelcome}
              />
            )}

            {currentStep === 2 && (
              <ImageAnalysis
                image={capturedImage}
                onAnalysisComplete={handleImageAnalysis}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <DataProcessing
                data={processedData}
                onProcessingComplete={handleProcessingComplete}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 4 && (
              <FileExport
                data={processedData}
                onExportComplete={handleExportComplete}
                onBack={() => setCurrentStep(3)}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App 