import React, { useState, useEffect } from 'react'
import './App.css'
import PinGate from './components/PinGate'
import WelcomeScreen from './components/WelcomeScreen'
import CameraCapture from './components/CameraCapture'
import ImageAnalysis from './components/ImageAnalysis'
import DataProcessing from './components/DataProcessing'
import FileExport from './components/FileExport'
import FoldersView from './components/FoldersView'
import JobManagement from './components/JobManagement'
import Attendance from './components/Attendance'
import ThemeSwitcher from './components/ThemeSwitcher'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showFolders, setShowFolders] = useState(false)
  const [showJobManagement, setShowJobManagement] = useState(false)
  const [showAttendance, setShowAttendance] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [processedData, setProcessedData] = useState(null)

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
  }

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
          code: "130",
          hours: 4
        },
        {
          workOrder: "WO-2024-002", 
          customer: "Marine Solutions Inc",
          description: "Engine Maintenance",
          code: "260",
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

    // Main timesheet flow
    switch (currentStep) {
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
            onAnalysisComplete={handleProcessedData}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <DataProcessing
            data={processedData}
            onNext={() => setCurrentStep(4)}
            onBack={handleBack}
            onDataUpdate={setProcessedData}
          />
        )
      case 4:
        return (
          <FileExport
            data={processedData}
            onBack={handleBack}
            onComplete={() => setCurrentStep(0)}
          />
        )
      default:
        return (
          <WelcomeScreen 
            onStart={handleStart}
            onShowFolders={handleShowFolders}
            onShowJobManagement={handleShowJobManagement}
            onShowAttendance={handleShowAttendance}
          />
        )
    }
  }

  return (
    <PinGate onAuthenticated={handleAuthenticated}>
      <div className="App ravens-theme-buttons">
        <main className="App-main">
          {renderCurrentStep()}
        </main>
        <ThemeSwitcher />
      </div>
    </PinGate>
  )
}

export default App 