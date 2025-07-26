import React, { useState, useRef, useEffect } from 'react'

const CameraCapture = ({ onImageCapture, onUseDemo, onBack }) => {
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setCapturedImage(null)
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL('image/jpeg')
    setCapturedImage(imageData)
    setIsCapturing(false)
  }

  const retakePhoto = () => {
    setCapturedImage(null)
  }

  const confirmPhoto = () => {
    if (capturedImage) {
      onImageCapture(capturedImage)
    }
  }

  return (
    <div className="camera-container">
      <h2>📷 Capture Time Sheet</h2>
      <p>Take a photo of your time sheet or use demo data</p>

      <div className="camera-preview">
        {!capturedImage ? (
          stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
              <p>Camera not started</p>
            </div>
          )
        ) : (
          <img src={capturedImage} alt="Captured time sheet" />
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="camera-controls">
        {!stream && !capturedImage && (
          <button className="btn btn-primary" onClick={startCamera}>
            📷 Open Camera
          </button>
        )}

        {stream && !capturedImage && (
          <>
            <button className="btn btn-primary" onClick={captureImage} disabled={isCapturing}>
              {isCapturing ? 'Capturing...' : '📸 Take Photo'}
            </button>
            <button className="btn btn-secondary" onClick={stopCamera}>
              ❌ Stop Camera
            </button>
          </>
        )}

        {capturedImage && (
          <>
            <button className="btn btn-primary" onClick={confirmPhoto}>
              ✅ Use This Photo
            </button>
            <button className="btn btn-secondary" onClick={retakePhoto}>
              🔄 Retake Photo
            </button>
          </>
        )}

        <button className="btn btn-secondary" onClick={onUseDemo}>
          🎭 Use Demo Data
        </button>

        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  )
}

export default CameraCapture 