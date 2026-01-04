import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiX, FiSmile, FiTrendingUp } from 'react-icons/fi';
import './EmotionReport.css';

const EmotionReport = ({ result, image, onClose, onDownload }) => {
  if (!result || !result.success) {
    return null;
  }

  const { emotion, confidence, all_emotions, bbox } = result;
  const emotions = all_emotions || {};
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageRef.current && image) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = image;
    }
  }, [image]);

  // Convert bbox from pixel coordinates to percentages
  const getBboxStyle = () => {
    if (!bbox || !imageDimensions.width || !imageDimensions.height) return null;
    
    // bbox format from Python API: [x1, y1, x2, y2] where (x1,y1) is top-left and (x2,y2) is bottom-right
    const [x1, y1, x2, y2] = bbox;
    const leftPercent = (x1 / imageDimensions.width) * 100;
    const topPercent = (y1 / imageDimensions.height) * 100;
    const widthPercent = ((x2 - x1) / imageDimensions.width) * 100;
    const heightPercent = ((y2 - y1) / imageDimensions.height) * 100;
    
    return {
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
      width: `${widthPercent}%`,
      height: `${heightPercent}%`
    };
  };

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
    return emojis[emotion?.toLowerCase()] || '😐';
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
    return colors[emotion?.toLowerCase()] || '#6b7280';
  };

  const sortedEmotions = Object.entries(emotions)
    .map(([name, conf]) => ({ name, confidence: conf }))
    .sort((a, b) => b.confidence - a.confidence);

  const formatDate = () => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="emotion-report-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="emotion-report"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="report-header">
          <div className="report-title-section">
            <h2 className="report-title">
              <FiSmile className="report-icon" />
              Emotion Analysis Report
            </h2>
            <p className="report-date">{formatDate()}</p>
          </div>
          <div className="report-actions">
            {onDownload && (
              <button className="report-download-btn" onClick={onDownload}>
                <FiDownload /> Download
              </button>
            )}
            <button className="report-close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        <div className="report-content">
          <div className="report-image-section">
            <div className="image-container">
              <img 
                ref={imageRef}
                src={image} 
                alt="Analyzed face" 
                className="analyzed-image"
                onLoad={() => {
                  if (imageRef.current) {
                    setImageDimensions({
                      width: imageRef.current.naturalWidth,
                      height: imageRef.current.naturalHeight
                    });
                  }
                }}
              />
              {bbox && getBboxStyle() && (
                <div
                  className="face-bbox"
                  style={getBboxStyle()}
                />
              )}
            </div>
          </div>

          <div className="report-results-section">
            <div className="primary-emotion-card">
              <div className="emotion-badge-large">
                <span className="emotion-emoji-large">{getEmotionEmoji(emotion)}</span>
              </div>
              <h3 className="primary-emotion-label">{emotion?.charAt(0).toUpperCase() + emotion?.slice(1)}</h3>
              <div className="confidence-display">
                <div className="confidence-value">
                  {(confidence * 100).toFixed(1)}%
                </div>
                <div className="confidence-bar-container">
                  <div
                    className="confidence-bar-fill"
                    style={{
                      width: `${confidence * 100}%`,
                      backgroundColor: getEmotionColor(emotion)
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="all-emotions-section">
              <h4 className="section-title">
                <FiTrendingUp /> All Detected Emotions
              </h4>
              <div className="emotions-grid">
                {sortedEmotions.map(({ name, confidence: conf }) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sortedEmotions.indexOf({ name, confidence: conf }) * 0.05 }}
                    className={`emotion-card ${name.toLowerCase() === emotion?.toLowerCase() ? 'active' : ''}`}
                    style={{
                      borderColor: name.toLowerCase() === emotion?.toLowerCase() ? getEmotionColor(name) : 'transparent'
                    }}
                  >
                    <div className="emotion-card-header">
                      <span className="emotion-emoji-small">{getEmotionEmoji(name)}</span>
                      <span className="emotion-name-card">{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                    </div>
                    <div className="emotion-card-value">
                      {(conf * 100).toFixed(1)}%
                    </div>
                    <div className="emotion-card-bar">
                      <div
                        className="emotion-card-bar-fill"
                        style={{
                          width: `${conf * 100}%`,
                          backgroundColor: getEmotionColor(name)
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="report-summary">
              <h4 className="section-title">Analysis Summary</h4>
              <div className="summary-content">
                <div className="summary-item">
                  <span className="summary-label">Primary Emotion:</span>
                  <span className="summary-value" style={{ color: getEmotionColor(emotion) }}>
                    {emotion?.charAt(0).toUpperCase() + emotion?.slice(1)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Confidence Level:</span>
                  <span className="summary-value">
                    {confidence >= 0.8 ? 'Very High' : confidence >= 0.6 ? 'High' : confidence >= 0.4 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Emotions Detected:</span>
                  <span className="summary-value">{sortedEmotions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmotionReport;

