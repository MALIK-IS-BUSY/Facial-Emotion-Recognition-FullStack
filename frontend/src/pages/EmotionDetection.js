import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVideo, FiStopCircle, FiSmile, FiAlertCircle, FiArrowLeft, FiInfo, FiUpload, FiImage, FiX } from 'react-icons/fi';
import { predictEmotion, frameToBase64, resetClientState, checkPythonApiHealth } from '../utils/pythonApi';
import EmotionCharts from '../components/EmotionCharts';
import EmotionReport from '../components/EmotionReport';
import api from '../utils/api';
import './EmotionDetection.css';

const EmotionDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [emotion, setEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [lastRecordTime, setLastRecordTime] = useState(0);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const clientIdRef = useRef(`client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'image'
  const [uploadedImages, setUploadedImages] = useState([]); // Array of { file, preview, result, id }
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file', 'url', 'paste'
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!savedUser || !savedUser.id) {
      navigate('/login');
    } else {
      setUser(savedUser);
    }

    // Check Python API health on mount
    checkPythonApiHealth().then((health) => {
      if (health && health.model_status === 'loaded') {
        setApiStatus('ready');
      } else {
        setApiStatus('error');
        setError('Python API is not available. Please make sure the Flask server is running on port 8000.');
      }
    });

    // Store client ID for cleanup
    const currentClientId = clientIdRef.current;

    return () => {
      stopStream();
      // Reset client state when component unmounts
      resetClientState(currentClientId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const startStream = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        startEmotionDetection();
      }
    } catch (err) {
      setError('Unable to access camera. Please allow camera permissions and try again.');
      console.error('Camera error:', err);
    }
  };

  const stopStream = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsStreaming(false);
    setEmotion(null);
    // Reset client state when stopping
    await resetClientState(clientIdRef.current);
  };

  const startEmotionDetection = () => {
    let lastProcessTime = 0;
    const PROCESS_INTERVAL = 500; // Process every 500ms (2 FPS for API calls)

    const detectEmotion = async () => {
      if (!videoRef.current || !canvasRef.current || !isStreaming) return;

      const now = Date.now();
      const timeSinceLastProcess = now - lastProcessTime;

      // Process frame at specified interval
      if (timeSinceLastProcess >= PROCESS_INTERVAL && !isProcessing) {
        lastProcessTime = now;
        setIsProcessing(true);

        try {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          // Set canvas size to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Flip canvas horizontally to mirror the video (like a mirror)
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();

          // Convert canvas to base64
          const imageBase64 = frameToBase64(canvas);
          
          if (imageBase64) {
            // Send to Python API for emotion detection
            const result = await predictEmotion(imageBase64, clientIdRef.current);
            
            if (result.success && result.emotion) {
              const newEmotion = {
                emotion: result.emotion.toLowerCase(),
                confidence: result.confidence,
                allEmotions: result.all_emotions || {},
                timestamp: new Date()
              };

              setEmotion(newEmotion);
              setEmotionHistory(prev => [newEmotion, ...prev].slice(0, 10));
              setError(''); // Clear any previous errors

              // Save emotion record every second
              const now = Date.now();
              if (now - lastRecordTime >= 1000) {
                setLastRecordTime(now);
                saveEmotionRecord(result.emotion, result.confidence);
              }
            } else if (result.error) {
              // No face detected - this is normal, don't show as error
              if (result.error !== 'No face detected') {
                setError(result.error);
              }
            }
          }
        } catch (err) {
          console.error('Error in emotion detection:', err);
          // Error is already handled in predictEmotion function
          if (err.response) {
            // API responded with error
            setError(err.response.data?.error || 'Error detecting emotion');
          } else if (!err.message?.includes('connect')) {
            // Only show non-connection errors
            setError(err.message || 'Error detecting emotion');
          }
        } finally {
          setIsProcessing(false);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectEmotion);
    };

    detectEmotion();
  };

  useEffect(() => {
    if (isStreaming) {
      startEmotionDetection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming]);

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      surprise: '😲',
      surprised: '😲',
      neutral: '😐',
      fear: '😨',
      disgust: '🤢',
      contempt: '😤'
    };
    return emojis[emotion.toLowerCase()] || '😐';
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: '#22c55e',
      sad: '#3b82f6',
      angry: '#ef4444',
      surprise: '#f59e0b',
      surprised: '#f59e0b',
      neutral: '#6b7280',
      fear: '#8b5cf6',
      disgust: '#ec4899',
      contempt: '#f97316'
    };
    return colors[emotion.toLowerCase()] || '#6b7280';
  };

  const saveEmotionRecord = async (emotion, confidence) => {
    try {
      // Capitalize first letter to match backend enum
      const emotionCapitalized = emotion.charAt(0).toUpperCase() + emotion.slice(1);
      
      await api.post('/emotions/record', {
        emotion: emotionCapitalized,
        confidence: confidence,
        sessionId: sessionId
      });
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.error('Error saving emotion record:', error);
    }
  };

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setError('Please upload valid image files');
      return;
    }

    const newImages = validFiles.map((file, index) => {
      const id = `img_${Date.now()}_${index}`;
      return {
        id,
        file,
        preview: null,
        result: null,
        processing: false,
        source: 'file'
      };
    });

    // Load previews
    newImages.forEach((imgObj) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => {
          const updated = [...prev];
          const foundIndex = updated.findIndex(img => img.id === imgObj.id);
          if (foundIndex !== -1) {
            updated[foundIndex] = { ...updated[foundIndex], preview: reader.result };
          }
          return updated;
        });
      };
      reader.readAsDataURL(imgObj.file);
    });

    setUploadedImages(prev => {
      const updated = [...prev, ...newImages];
      setCurrentImageIndex(prev.length); // Set to first new image
      return updated;
    });
    
    setError('');
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(files);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageItems = Array.from(items).filter(item => item.type.startsWith('image/'));
    if (imageItems.length === 0) return;

    e.preventDefault();
    
    const files = imageItems.map(item => item.getAsFile()).filter(Boolean);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      setError('Please enter a valid image URL');
      return;
    }

    setIsLoadingUrl(true);
    setError('');

    try {
      // Validate URL
      const url = new URL(imageUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid URL protocol');
      }

      // Create image to validate and get base64
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Create canvas to convert to base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const base64 = canvas.toDataURL('image/png');
        
        const newImage = {
          id: `img_url_${Date.now()}`,
          file: null,
          preview: base64,
          result: null,
          processing: false,
          source: 'url',
          url: imageUrl
        };

        setUploadedImages(prev => {
          const updated = [...prev, newImage];
          setCurrentImageIndex(prev.length);
          return updated;
        });

        setImageUrl('');
        setIsLoadingUrl(false);
      };

      img.onerror = () => {
        setError('Failed to load image from URL. Please check the URL and ensure CORS is enabled.');
        setIsLoadingUrl(false);
      };

      img.src = imageUrl;
    } catch (err) {
      setError('Invalid URL. Please enter a valid image URL (e.g., https://example.com/image.jpg)');
      setIsLoadingUrl(false);
    }
  };

  useEffect(() => {
    // Add paste event listener
    const handlePasteEvent = (e) => {
      if (activeTab === 'image' && !e.target.closest('input') && !e.target.closest('textarea')) {
        const items = e.clipboardData?.items;
        if (!items) return;

        const imageItems = Array.from(items).filter(item => item.type.startsWith('image/'));
        if (imageItems.length === 0) return;

        e.preventDefault();
        
        const files = imageItems.map(item => item.getAsFile()).filter(Boolean);
        if (files.length > 0) {
          processFiles(files);
        }
      }
    };

    window.addEventListener('paste', handlePasteEvent);
    return () => window.removeEventListener('paste', handlePasteEvent);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const processImage = async (imageId = null) => {
    const targetId = imageId || uploadedImages[currentImageIndex]?.id;
    const imageIndex = uploadedImages.findIndex(img => img.id === targetId);
    
    if (imageIndex === -1 || !uploadedImages[imageIndex]?.preview) return;

    setIsProcessingImage(true);
    setError('');

    // Update processing state
    setUploadedImages(prev => {
      const updated = [...prev];
      updated[imageIndex] = { ...updated[imageIndex], processing: true };
      return updated;
    });

    try {
      const result = await predictEmotion(uploadedImages[imageIndex].preview, `image_${targetId}`);
      
      if (result.success) {
        const analysisData = {
          ...result,
          bbox: result.bbox || null
        };

        // Update image with result
        setUploadedImages(prev => {
          const updated = [...prev];
          updated[imageIndex] = { 
            ...updated[imageIndex], 
            result: analysisData,
            processing: false
          };
          return updated;
        });

        setCurrentImageIndex(imageIndex);
        setShowReport(true);
        
        // Save to image analyses database
        if (result.emotion && result.confidence) {
          try {
            const imageFile = uploadedImages[imageIndex].file;
            await api.post('/emotions/image-analysis', {
              imageUrl: uploadedImages[imageIndex].preview,
              emotion: result.emotion.charAt(0).toUpperCase() + result.emotion.slice(1),
              confidence: result.confidence,
              allEmotions: result.all_emotions || {},
              bbox: result.bbox || null,
              fileName: imageFile?.name || uploadedImages[imageIndex].url || 'uploaded-image',
              fileSize: imageFile?.size || 0
            });
          } catch (saveError) {
            console.error('Error saving image analysis:', saveError);
            // Don't show error to user, just log it
          }
        }
      } else {
        setError(result.error || 'Failed to detect emotion in image. Please ensure a face is visible.');
        setUploadedImages(prev => {
          const updated = [...prev];
          updated[imageIndex] = { ...updated[imageIndex], processing: false };
          return updated;
        });
      }
    } catch (err) {
      setError('Error processing image. Please try again.');
      console.error('Image processing error:', err);
      setUploadedImages(prev => {
        const updated = [...prev];
        updated[imageIndex] = { ...updated[imageIndex], processing: false };
        return updated;
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const clearImage = (imageId = null) => {
    if (imageId) {
      // Remove specific image
      setUploadedImages(prev => prev.filter(img => img.id !== imageId));
      if (currentImageIndex >= uploadedImages.length - 1) {
        setCurrentImageIndex(Math.max(0, uploadedImages.length - 2));
      }
    } else {
      // Clear all images
      setUploadedImages([]);
      setCurrentImageIndex(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setError('');
  };

  const processAllImages = async () => {
    for (let i = 0; i < uploadedImages.length; i++) {
      if (!uploadedImages[i].result && uploadedImages[i].preview) {
        await processImage(uploadedImages[i].id);
        // Small delay between processing
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const handleDownloadReport = () => {
    const currentImage = uploadedImages[currentImageIndex];
    if (!currentImage?.result || !currentImage?.preview) return;

    // Create a canvas to generate report image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 1600;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 50, 50, 1100, 800);
      
      // Add text annotations
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 48px Arial';
      ctx.fillText(`Emotion: ${currentImage.result.emotion}`, 50, 900);
      ctx.font = '36px Arial';
      ctx.fillText(`Confidence: ${(currentImage.result.confidence * 100).toFixed(1)}%`, 50, 970);
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `emotion-report-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };
    img.src = currentImage.preview;
  };

  return (
    <div className="emotion-detection-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="detection-header"
        >
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <FiArrowLeft /> Back to Dashboard
          </button>
          <div className="header-content">
            <h1 className="page-title">Emotion Detection</h1>
            <p className="page-subtitle">
              Detect emotions from your webcam or upload an image
            </p>
          </div>
          <button 
            className="info-button" 
            onClick={() => setShowInfo(!showInfo)}
            title="Information"
          >
            <FiInfo />
          </button>
        </motion.div>

        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="info-panel"
          >
            <h3>How It Works</h3>
            <ul>
              <li>Click "Start Camera" to begin real-time emotion detection</li>
              <li>Position your face clearly in front of the camera</li>
              <li>Our AI analyzes your facial expressions every second</li>
              <li>View detected emotions with confidence scores</li>
              <li>Track your emotion history during the session</li>
            </ul>
            <p className="info-note">
              <strong>Privacy:</strong> All processing happens in real-time. No video is stored or transmitted.
            </p>
          </motion.div>
        )}

        {/* Tab Selection */}
        <div className="detection-tabs">
          <button
            className={`tab-button ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('camera');
              if (isStreaming) stopStream();
            }}
          >
            <FiVideo /> Camera Detection
          </button>
          <button
            className={`tab-button ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('image');
              if (isStreaming) stopStream();
            }}
          >
            <FiImage /> Image Upload
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'camera' ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="detection-container"
            >
              <div className="video-section">
            <div className="video-wrapper">
              <video
                ref={videoRef}
                className="video-stream"
                playsInline
                muted
                autoPlay
              />
              <canvas ref={canvasRef} className="detection-canvas" />
              {!isStreaming && (
                <div className="video-placeholder">
                  <FiVideo size={64} />
                  <p>Click Start Camera to begin detection</p>
                  <p className="placeholder-hint">Make sure to allow camera permissions</p>
                </div>
              )}
            </div>
            
            <div className="video-controls">
              {!isStreaming ? (
                <button 
                  className="btn btn-primary" 
                  onClick={startStream}
                  disabled={apiStatus !== 'ready'}
                >
                  <FiVideo /> Start Camera
                </button>
              ) : (
                <button className="btn btn-danger" onClick={stopStream}>
                  <FiStopCircle /> Stop Camera
                </button>
              )}
              {apiStatus === 'checking' && (
                <span className="api-status checking">Checking API...</span>
              )}
              {apiStatus === 'ready' && (
                <span className="api-status ready">✓ API Ready</span>
              )}
              {apiStatus === 'error' && (
                <span className="api-status error">✗ API Error</span>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="error-message"
              >
                <FiAlertCircle /> {error}
              </motion.div>
            )}
          </div>

          <div className="results-section">
            {isStreaming && emotion ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="emotion-display"
              >
                <div 
                  className="emotion-icon-large"
                  style={{ borderColor: getEmotionColor(emotion.emotion) }}
                >
                  <span className="emotion-emoji">{getEmotionEmoji(emotion.emotion)}</span>
                </div>
                <h3 className="emotion-label">
                  {emotion.emotion.charAt(0).toUpperCase() + emotion.emotion.slice(1)}
                </h3>
                {emotion.allEmotions && Object.keys(emotion.allEmotions).length > 0 && (
                  <div className="all-emotions-preview">
                    <p className="emotions-title">All Emotions:</p>
                    <div className="emotions-list">
                      {Object.entries(emotion.allEmotions)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([emotionName, conf]) => (
                          <div key={emotionName} className="emotion-item-preview">
                            <span className="emotion-name">{emotionName}</span>
                            <span className="emotion-conf">{(conf * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                <div className="emotion-confidence">
                  <span>Confidence: {(emotion.confidence * 100).toFixed(1)}%</span>
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{ 
                        width: `${emotion.confidence * 100}%`,
                        background: getEmotionColor(emotion.emotion)
                      }}
                    />
                  </div>
                </div>
                <div className="emotion-time">
                  Detected at: {emotion.timestamp.toLocaleTimeString()}
                </div>
              </motion.div>
            ) : (
              <div className="waiting-state">
                <FiSmile size={64} />
                <p>Waiting for detection...</p>
                <p className="waiting-hint">Start the camera to begin</p>
              </div>
            )}

            {emotionHistory.length > 0 && (
              <div className="emotion-history">
                <h3 className="history-title">Recent Detections</h3>
                <div className="history-list">
                  {emotionHistory.map((item, index) => (
                    <div key={index} className="history-item">
                      <span className="history-emoji">{getEmotionEmoji(item.emotion)}</span>
                      <div className="history-details">
                        <span className="history-emotion">{item.emotion.charAt(0).toUpperCase() + item.emotion.slice(1)}</span>
                        <span className="history-confidence">{(item.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <span className="history-time">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emotion Statistics Charts */}
            {user && (
              <div className="emotion-charts-section">
                <EmotionCharts userId={user.id} sessionId={sessionId} />
              </div>
            )}
          </div>
            </motion.div>
          ) : (
            <motion.div
              key="image"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="image-upload-container"
            >
              <div className="image-upload-section">
                {/* File input - always available for "Add More" button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />

                {uploadedImages.length === 0 ? (
                  <div className="upload-area">
                    {/* Upload Method Tabs */}
                    <div className="upload-method-tabs">
                      <button
                        className={`method-tab ${uploadMethod === 'file' ? 'active' : ''}`}
                        onClick={() => setUploadMethod('file')}
                      >
                        <FiUpload /> File Upload
                      </button>
                      <button
                        className={`method-tab ${uploadMethod === 'url' ? 'active' : ''}`}
                        onClick={() => setUploadMethod('url')}
                      >
                        <FiImage /> Image URL
                      </button>
                      <button
                        className={`method-tab ${uploadMethod === 'paste' ? 'active' : ''}`}
                        onClick={() => setUploadMethod('paste')}
                      >
                        <FiImage /> Paste Image
                      </button>
                    </div>

                    {/* File Upload Method */}
                    {uploadMethod === 'file' && (
                      <div
                        ref={dropZoneRef}
                        className={`upload-placeholder ${isDragging ? 'dragging' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <FiUpload size={64} />
                        <h3>Upload Images</h3>
                        <p>Drag & drop images here or click to browse</p>
                        <button
                          className="btn btn-primary"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <FiUpload /> Choose Images
                        </button>
                        <p className="upload-hint">
                          Supported formats: JPG, PNG, GIF, WebP (Multiple selection supported)
                        </p>
                        <p className="upload-hint-small">
                          💡 Tip: You can drag and drop multiple images at once!
                        </p>
                      </div>
                    )}

                    {/* URL Method */}
                    {uploadMethod === 'url' && (
                      <div className="upload-placeholder url-upload">
                        <FiImage size={64} />
                        <h3>Load from URL</h3>
                        <p>Enter an image URL to analyze</p>
                        <div className="url-input-group">
                          <input
                            type="url"
                            className="url-input"
                            placeholder="https://example.com/image.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUrlSubmit();
                              }
                            }}
                            disabled={isLoadingUrl}
                          />
                          <button
                            className="btn btn-primary"
                            onClick={handleUrlSubmit}
                            disabled={isLoadingUrl || !imageUrl.trim()}
                          >
                            {isLoadingUrl ? 'Loading...' : 'Load Image'}
                          </button>
                        </div>
                        <p className="upload-hint">
                          Enter a direct link to an image (JPG, PNG, GIF, WebP)
                        </p>
                        <p className="upload-hint-small">
                          ⚠️ Note: The image must be publicly accessible and CORS-enabled
                        </p>
                      </div>
                    )}

                    {/* Paste Method */}
                    {uploadMethod === 'paste' && (
                      <div className="upload-placeholder paste-upload">
                        <FiImage size={64} />
                        <h3>Paste Image</h3>
                        <p>Copy an image and press <kbd>Ctrl+V</kbd> (or <kbd>Cmd+V</kbd> on Mac)</p>
                        <div className="paste-indicator">
                          <div className="paste-icon">📋</div>
                          <p>Press <kbd>Ctrl+V</kbd> to paste</p>
                        </div>
                        <p className="upload-hint">
                          You can paste images from:
                        </p>
                        <ul className="paste-sources">
                          <li>📋 Clipboard (after copying an image)</li>
                          <li>🖼️ Screenshots</li>
                          <li>📱 Images from other applications</li>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="images-container">
                    {/* Image Gallery */}
                    <div className="images-grid">
                      {uploadedImages.map((imgObj, index) => (
                        <motion.div
                          key={imgObj.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`image-item ${currentImageIndex === index ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <div className="image-item-wrapper">
                            {imgObj.preview && (
                              <img src={imgObj.preview} alt={`Upload ${index + 1}`} className="image-thumbnail" />
                            )}
                            {imgObj.processing && (
                              <div className="image-processing-overlay">
                                <div className="processing-spinner"></div>
                                <span>Processing...</span>
                              </div>
                            )}
                            {imgObj.result && (
                              <div className="image-result-badge">
                                <span>{getEmotionEmoji(imgObj.result.emotion)}</span>
                                <span>{(imgObj.result.confidence * 100).toFixed(0)}%</span>
                              </div>
                            )}
                            <button
                              className="image-remove-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearImage(imgObj.id);
                              }}
                            >
                              <FiX />
                            </button>
                          </div>
                          {imgObj.result && (
                            <div className="image-item-emotion">
                              {imgObj.result.emotion}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Add More Section - Quick Upload */}
                    <div 
                      className={`add-more-section ${isDragging ? 'dragging' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="upload-method-tabs">
                        <button
                          className={`method-tab ${uploadMethod === 'file' ? 'active' : ''}`}
                          onClick={() => {
                            setUploadMethod('file');
                            fileInputRef.current?.click();
                          }}
                        >
                          <FiUpload /> Add Files
                        </button>
                        <button
                          className={`method-tab ${uploadMethod === 'url' ? 'active' : ''}`}
                          onClick={() => setUploadMethod('url')}
                        >
                          <FiImage /> Add from URL
                        </button>
                        <button
                          className={`method-tab ${uploadMethod === 'paste' ? 'active' : ''}`}
                          onClick={() => setUploadMethod('paste')}
                        >
                          <FiImage /> Paste Image
                        </button>
                      </div>

                      {/* URL Input - shown when URL tab is active */}
                      {uploadMethod === 'url' && (
                        <div className="quick-url-input">
                          <div className="url-input-group">
                            <input
                              type="url"
                              className="url-input"
                              placeholder="https://example.com/image.jpg"
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleUrlSubmit();
                                }
                              }}
                              disabled={isLoadingUrl}
                            />
                            <button
                              className="btn btn-primary"
                              onClick={handleUrlSubmit}
                              disabled={isLoadingUrl || !imageUrl.trim()}
                            >
                              {isLoadingUrl ? 'Loading...' : 'Load'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Paste Indicator - shown when paste tab is active */}
                      {uploadMethod === 'paste' && (
                        <div className="quick-paste-indicator">
                          <p>Press <kbd>Ctrl+V</kbd> (or <kbd>Cmd+V</kbd> on Mac) to paste an image</p>
                        </div>
                      )}
                    </div>

                    {/* Current Image Preview and Actions */}
                    {uploadedImages[currentImageIndex] && (
                      <div className="current-image-section">
                        <div className="image-preview-wrapper">
                          <img 
                            src={uploadedImages[currentImageIndex].preview} 
                            alt="Current" 
                            className="preview-image" 
                          />
                        </div>
                        <div className="image-actions">
                          <button
                            className="btn btn-primary"
                            onClick={() => processImage(uploadedImages[currentImageIndex].id)}
                            disabled={isProcessingImage || apiStatus !== 'ready' || uploadedImages[currentImageIndex].processing}
                          >
                            {uploadedImages[currentImageIndex].processing ? (
                              <>Processing...</>
                            ) : uploadedImages[currentImageIndex].result ? (
                              <>
                                <FiSmile /> Re-analyze
                              </>
                            ) : (
                              <>
                                <FiSmile /> Analyze Emotion
                              </>
                            )}
                          </button>
                          {uploadedImages.length > 1 && (
                            <button
                              className="btn btn-primary"
                              onClick={processAllImages}
                              disabled={isProcessingImage || apiStatus !== 'ready'}
                            >
                              <FiSmile /> Analyze All
                            </button>
                          )}
                          <button
                            className="btn btn-secondary"
                            onClick={() => clearImage()}
                          >
                            <FiX /> Clear All
                          </button>
                          {uploadedImages[currentImageIndex].result && (
                            <button
                              className="btn btn-secondary"
                              onClick={() => {
                                setShowReport(true);
                              }}
                            >
                              <FiSmile /> View Report
                            </button>
                          )}
                          {apiStatus === 'checking' && (
                            <span className="api-status checking">Checking API...</span>
                          )}
                          {apiStatus === 'ready' && (
                            <span className="api-status ready">✓ API Ready</span>
                          )}
                          {apiStatus === 'error' && (
                            <span className="api-status error">✗ API Error</span>
                          )}
                        </div>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="error-message"
                          >
                            <FiAlertCircle /> {error}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emotion Report Modal */}
        {showReport && uploadedImages[currentImageIndex]?.result && uploadedImages[currentImageIndex]?.preview && (
          <EmotionReport
            result={uploadedImages[currentImageIndex].result}
            image={uploadedImages[currentImageIndex].preview}
            onClose={() => setShowReport(false)}
            onDownload={handleDownloadReport}
          />
        )}
      </div>
    </div>
  );
};

export default EmotionDetection;

