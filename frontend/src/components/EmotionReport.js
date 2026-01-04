import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiX, FiSmile, FiTrendingUp } from 'react-icons/fi';
import './EmotionReport.css';

const EmotionReport = ({ result, image, onClose, onDownload }) => {
  /* -------------------- HOOKS (ALWAYS AT TOP) -------------------- */
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageRef.current && image) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({
          width: img.width,
          height: img.height,
        });
      };
      img.src = image;
    }
  }, [image]);

  /* -------------------- SAFE EARLY RETURN -------------------- */
  if (!result || !result.success) {
    return null;
  }

  /* -------------------- DATA -------------------- */
  const { emotion, confidence, all_emotions, bbox } = result;
  const emotions = all_emotions || {};

  /* -------------------- HELPERS -------------------- */
  const getBboxStyle = () => {
    if (!bbox || !imageDimensions.width || !imageDimensions.height) return null;

    const [x1, y1, x2, y2] = bbox;

    return {
      left: `${(x1 / imageDimensions.width) * 100}%`,
      top: `${(y1 / imageDimensions.height) * 100}%`,
      width: `${((x2 - x1) / imageDimensions.width) * 100}%`,
      height: `${((y2 - y1) / imageDimensions.height) * 100}%`,
    };
  };

  const getEmotionEmoji = (emo) => {
    const map = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      surprise: '😲',
      surprised: '😲',
      neutral: '😐',
      fear: '😨',
      disgust: '🤢',
      contempt: '😤',
    };
    return map[emo?.toLowerCase()] || '😐';
  };

  const getEmotionColor = (emo) => {
    const map = {
      happy: '#22c55e',
      sad: '#3b82f6',
      angry: '#ef4444',
      surprise: '#f59e0b',
      surprised: '#f59e0b',
      neutral: '#6b7280',
      fear: '#8b5cf6',
      disgust: '#ec4899',
      contempt: '#f97316',
    };
    return map[emo?.toLowerCase()] || '#6b7280';
  };

  const sortedEmotions = Object.entries(emotions)
    .map(([name, conf]) => ({ name, confidence: conf }))
    .sort((a, b) => b.confidence - a.confidence);

  const formatDate = () =>
    new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  /* -------------------- JSX -------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="emotion-report-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="emotion-report"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="report-header">
          <div>
            <h2 className="report-title">
              <FiSmile /> Emotion Analysis Report
            </h2>
            <p className="report-date">{formatDate()}</p>
          </div>
          <div className="report-actions">
            {onDownload && (
              <button onClick={onDownload}>
                <FiDownload /> Download
              </button>
            )}
            <button onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="report-content">
          {/* IMAGE */}
          <div className="image-container">
            <img
              ref={imageRef}
              src={image}
              alt="Analyzed"
              className="analyzed-image"
              onLoad={() =>
                setImageDimensions({
                  width: imageRef.current.naturalWidth,
                  height: imageRef.current.naturalHeight,
                })
              }
            />
            {bbox && <div className="face-bbox" style={getBboxStyle()} />}
          </div>

          {/* RESULTS */}
          <div className="report-results-section">
            <div className="primary-emotion-card">
              <span className="emotion-emoji-large">
                {getEmotionEmoji(emotion)}
              </span>
              <h3>{emotion?.toUpperCase()}</h3>
              <div>{(confidence * 100).toFixed(1)}%</div>
            </div>

            <h4>
              <FiTrendingUp /> All Detected Emotions
            </h4>

            <div className="emotions-grid">
              {sortedEmotions.map(({ name, confidence }, index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="emotion-card"
                >
                  <span>{getEmotionEmoji(name)}</span>
                  <strong>{name}</strong>
                  <div>{(confidence * 100).toFixed(1)}%</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmotionReport;
