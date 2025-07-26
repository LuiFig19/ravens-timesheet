import React, { useState, useRef, useEffect } from 'react'

const CameraCapture = ({ onImageCapture, onUseDemo, onBack }) => {
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [videoReady, setVideoReady] = useState(false)
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
    setCameraLoading(true)
    setCameraError(null)
    setVideoReady(false)

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported by this browser')
      }

      // Try multiple camera configurations for better compatibility
      const constraints = [
        // Try rear camera first (best for documents)
        { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } },
        // Fallback to any camera with high resolution
        { video: { width: { ideal: 1920 }, height: { ideal: 1080 } } },
        // Fallback to default camera
        { video: { facingMode: 'environment' } },
        // Last resort - any video
        { video: true }
      ]

      let mediaStream = null
      for (const constraint of constraints) {
        try {
          console.log('Trying camera constraint:', constraint)
          mediaStream = await navigator.mediaDevices.getUserMedia(constraint)
          break
        } catch (err) {
          console.log('Camera constraint failed:', constraint, err)
          continue
        }
      }

      if (!mediaStream) {
        throw new Error('Could not access camera with any configuration')
      }

      console.log('Camera stream obtained:', mediaStream)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // Add event listeners for video loading
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded')
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err)
            setCameraError('Error starting video playback')
          })
        }

        videoRef.current.oncanplay = () => {
          console.log('Video can play')
          setVideoReady(true)
          setCameraLoading(false)
        }

        videoRef.current.onerror = (err) => {
          console.error('Video error:', err)
          setCameraError('Error loading video stream')
          setCameraLoading(false)
        }

        // Timeout for camera loading
        setTimeout(() => {
          if (cameraLoading) {
            setCameraLoading(false)
            if (!videoReady) {
              setCameraError('Camera loading timeout - please try again')
            }
          }
        }, 10000) // 10 second timeout
      }

    } catch (error) {
      console.error('Error accessing camera:', error)
      setCameraLoading(false)
      
      let errorMessage = 'Unable to access camera. '
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Camera permission denied. Please allow camera access and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.'
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported by this browser.'
      } else {
        errorMessage += error.message || 'Please check permissions and try again.'
      }
      
      setCameraError(errorMessage)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setCapturedImage(null)
    setVideoReady(false)
    setCameraError(null)
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !videoReady) return

    setIsCapturing(true)
    
    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      // Set canvas size to match video
      canvas.width = video.videoWidth || video.clientWidth
      canvas.height = video.videoHeight || video.clientHeight

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert to image data with high quality
      const imageData = canvas.toDataURL('image/jpeg', 0.9)
      setCapturedImage(imageData)
      console.log('Image captured successfully')
    } catch (error) {
      console.error('Error capturing image:', error)
      alert('Error capturing image. Please try again.')
    }
    
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
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  backgroundColor: '#000'
                }}
              />
              {(cameraLoading || !videoReady) && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  textAlign: 'center',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                  <div>Loading camera...</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
              {cameraError ? (
                <div style={{ color: 'red', textAlign: 'center', padding: '1rem' }}>
                  <p><strong>Camera Error:</strong></p>
                  <p>{cameraError}</p>
                </div>
              ) : (
                <p>Camera not started</p>
              )}
            </div>
          )
        ) : (
          <img src={capturedImage} alt="Captured time sheet" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="camera-controls">
        {!stream && !capturedImage && (
          <button className="btn btn-primary" onClick={startCamera} disabled={cameraLoading}>
            {cameraLoading ? '⏳ Starting Camera...' : '📷 Open Camera'}
          </button>
        )}

        {stream && !capturedImage && (
          <>
            <button 
              className="btn btn-primary" 
              onClick={captureImage} 
              disabled={isCapturing || !videoReady}
            >
              {isCapturing ? 'Capturing...' : !videoReady ? 'Loading...' : '📸 Take Photo'}
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