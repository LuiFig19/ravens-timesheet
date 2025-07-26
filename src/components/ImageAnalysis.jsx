import React, { useState, useEffect } from 'react'

const ImageAnalysis = ({ image, onAnalysisComplete, onBack }) => {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Starting analysis...')

  useEffect(() => {
    const simulateAnalysis = async () => {
      const steps = [
        { progress: 20, status: 'Loading image...' },
        { progress: 40, status: 'Extracting text...' },
        { progress: 60, status: 'Identifying fields...' },
        { progress: 80, status: 'Processing data...' },
        { progress: 100, status: 'Analysis complete!' }
      ]

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setProgress(step.progress)
        setStatus(step.status)
      }

      // Simulate extracted data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const extractedData = {
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

      onAnalysisComplete(extractedData)
    }

    simulateAnalysis()
  }, [onAnalysisComplete])

  return (
    <div className="analysis-container">
      <h2>🔍 Analyzing Time Sheet</h2>
      <p>Processing your image to extract time sheet data</p>

      {image && (
        <img src={image} alt="Time sheet being analyzed" className="analysis-image" />
      )}

      <div className="progress-indicator">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <p style={{ marginTop: '1rem', fontWeight: '600', color: '#333' }}>
        {status}
      </p>

      <div style={{ marginTop: '2rem' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  )
}

export default ImageAnalysis 