import React, { useState } from 'react'
import './App.css'
import ClerkProviderWrapper, { AuthHeader, ProtectedRoute } from './components/ClerkProvider'
import WelcomeScreen from './components/WelcomeScreen'
import CameraCapture from './components/CameraCapture'
import ImageAnalysis from './components/ImageAnalysis'
import DataProcessing from './components/DataProcessing'
import FileExport from './components/FileExport'
import FoldersView from './components/FoldersView'
import JobManagement from './components/JobManagement'
import Attendance from './components/Attendance'

function AppContent() {
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

  const handleBack = () => {
    if (showFolders) {
      setShowFolders(false)
      return
    }
    if (showJobManagement) {
      setShowJobManagement(false)
      return
    }
    if (showAttendance) {
      setShowAttendance(false)
      return
    }
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleImageCapture = (imageData) => {
    setCapturedImage(imageData)
    setCurrentStep(2)
  }

  const handleProcessedData = (data) => {
    setProcessedData(data)
    setCurrentStep(3)
  }

  const handleUseDemo = () => {
    const demoData = {
      employeeName: "John Smith",
      date: "2024-01-15",
      shiftTime: 8,
      workEntries: [
        {
          workOrder: "WO-2024-001",
          customer: "Acme Corp",
          description: "Hull Inspection",
          code: "110",
          hours: 4
        },
        {
          workOrder: "WO-2024-002", 
          customer: "Marine Solutions Inc",
          description: "Engine Maintenance",
          code: "120",
          hours: 4
        }
      ]
    }
    setProcessedData(demoData)
    setCurrentStep(3)
  }

  const getStepName = (step) => {
    switch(step) {
      case 0: return 'Welcome'
      case 1: return 'Camera'
      case 2: return 'Analysis'
      case 3: return 'Process'
      case 4: return 'Export'
      default: return 'Welcome'
    }
  }

  const renderCurrentStep = () => {
    // Show folders view
    if (showFolders) {
      return <FoldersView onBack={handleBack} />
    }

    // Show job management
    if (showJobManagement) {
      return <JobManagement onBack={handleBack} />
    }

    // Show attendance
    if (showAttendance) {
      return <Attendance onBack={handleBack} />
    }

    // Show main workflow steps
    switch(currentStep) {
      case 0:
        return (
          <WelcomeScreen 
            onStart={handleStart}
            onShowFolders={handleShowFolders}
            onShowJobManagement={handleShowJobManagement}
            onShowAttendance={handleShowAttendance}
          />
        )
      case 1:
        return (
          <CameraCapture 
            onImageCapture={handleImageCapture}
            onUseDemo={handleUseDemo}
            onBack={handleBack}
          />
        )
      case 2:
        return (
          <ImageAnalysis 
            image={capturedImage}
            onProcessed={handleProcessedData}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <DataProcessing 
            data={processedData}
            onNext={(processedData) => {
              setProcessedData(processedData)
              setCurrentStep(4)
            }}
            onBack={handleBack}
          />
        )
      case 4:
        return (
          <FileExport 
            data={processedData}
            onExportComplete={() => setCurrentStep(0)}
            onBack={handleBack}
          />
        )
      default:
        return <WelcomeScreen onStart={handleStart} />
    }
  }

  return (
    <ProtectedRoute>
      <div className="App">
        {currentStep > 0 && (
          <header className="App-header">
            <div className="header-content">
              <div className="header-left">
                <div className="ravens-marine-logo-container">
                  <img 
                    src="/ravens-marine-logo.png" 
                    alt="Ravens Marine Logo" 
                    className="ravens-marine-logo"
                  />
                </div>
              </div>
              
              <div className="header-center">
                <div className="progress-container">
                  <div className="progress-bar">
                    {[1, 2, 3, 4].map(step => (
                      <div 
                        key={step}
                        className={`step ${currentStep >= step ? 'active' : ''}`}
                      >
                        {step === 1 && '📷'}
                        {step === 2 && '🔍'}
                        {step === 3 && '✏️'}
                        {step === 4 && '📤'}
                        <span className="step-label">{getStepName(step)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="header-right">
                <AuthHeader />
              </div>
            </div>
          </header>
        )}

        {currentStep === 0 && (
          <div className="welcome-header-auth">
            <AuthHeader />
          </div>
        )}

        <main className="App-main">
          {renderCurrentStep()}
        </main>
      </div>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <ClerkProviderWrapper>
      <AppContent />
    </ClerkProviderWrapper>
  )
}

export default App 