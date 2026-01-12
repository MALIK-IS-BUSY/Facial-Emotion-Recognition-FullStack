import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrash2, FiEye, FiImage, FiTrendingUp, FiSmile } from 'react-icons/fi';
import EmotionReport from '../components/EmotionReport';
import ScrollAnimation from '../components/ScrollAnimation';
import api from '../utils/api';
import './ImageAnalyses.css';

const ImageAnalyses = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/emotions/image-analyses');
      if (response.data.success) {
        setAnalyses(response.data.analyses || []);
      }
    } catch (err) {
      setError('Failed to load image analyses');
      console.error('Error fetching analyses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/emotions/image-analyses/stats');
      if (response.data.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
    fetchStats();
  }, [fetchAnalyses, fetchStats]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) return;

    try {
      await api.delete(`/emotions/image-analyses/${id}`);
      setAnalyses(prev => prev.filter(a => a._id !== id));
      fetchStats();
    } catch (err) {
      setError('Failed to delete analysis');
      console.error('Error deleting analysis:', err);
    }
  };

  const handleViewReport = (analysis) => {
    setSelectedAnalysis({
      id: analysis._id,
      success: true,
      emotion: analysis.emotion,
      confidence: analysis.confidence,
      all_emotions: analysis.allEmotions || {},
      bbox: analysis.bbox || null
    });
    setShowReport(true);
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
      contempt: '😤',
      Anger: '😠',
      Happy: '😊',
      Sad: '😢',
      Surprise: '😲',
      Neutral: '😐',
      Fear: '😨',
      Disgust: '🤢',
      Contempt: '😤'
    };
    return emojis[emotion] || '😐';
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: '#22c55e',
      Happy: '#22c55e',
      sad: '#3b82f6',
      Sad: '#3b82f6',
      angry: '#ef4444',
      Anger: '#ef4444',
      surprise: '#f59e0b',
      Surprise: '#f59e0b',
      neutral: '#6b7280',
      Neutral: '#6b7280',
      fear: '#8b5cf6',
      Fear: '#8b5cf6',
      disgust: '#ec4899',
      Disgust: '#ec4899',
      contempt: '#f97316',
      Contempt: '#f97316'
    };
    return colors[emotion] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="image-analyses-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading image analyses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="image-analyses-page">
      <div className="container">
        <ScrollAnimation direction="up" className="analyses-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <FiArrowLeft /> Back to Dashboard
          </button>
          <div className="header-content">
            <h1 className="page-title">
              <FiImage /> Image Analyses Dashboard
            </h1>
            <p className="page-subtitle">
              View and manage all your image emotion analyses
            </p>
          </div>
        </ScrollAnimation>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="error-message"
          >
            {error}
          </motion.div>
        )}

        {/* Statistics */}
        {stats && (
          <ScrollAnimation className="stats-section">
            <h2 className="section-title">
              <FiTrendingUp /> Statistics
            </h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.totalAnalyses || 0}</div>
                <div className="stat-label">Total Analyses</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{(stats.avgConfidence * 100).toFixed(1)}%</div>
                <div className="stat-label">Avg Confidence</div>
              </div>
              {stats.emotionStats && Object.entries(stats.emotionStats).map(([emotion, data]) => (
                <div key={emotion} className="stat-card emotion-stat">
                  <div className="stat-emoji">{getEmotionEmoji(emotion)}</div>
                  <div className="stat-value">{data.count}</div>
                  <div className="stat-label">{emotion}</div>
                  <div className="stat-percentage">{data.percentage}%</div>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        )}

        {/* Analyses Grid */}
        {analyses.length === 0 ? (
          <ScrollAnimation className="empty-state">
            <FiImage size={64} />
            <h3>No Image Analyses Yet</h3>
            <p>Upload and analyze images to see them here</p>
            <button className="btn btn-primary" onClick={() => navigate('/emotion-detection')}>
              Go to Emotion Detection
            </button>
          </ScrollAnimation>
        ) : (
          <div className="analyses-grid">
            {analyses.map((analysis, index) => (
              <ScrollAnimation
                key={analysis._id}
                delay={index * 0.05}
                className="analysis-card"
              >
                <div className="analysis-image-wrapper">
                  <img 
                    src={analysis.imageUrl} 
                    alt="Analysis" 
                    className="analysis-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="image-fallback" style={{ display: 'none' }}>
                    <FiImage />
                  </div>
                  {analysis.bbox && (
                    <div
                      className="analysis-bbox"
                      style={{
                        left: `${(analysis.bbox[0] / 100) * 100}%`,
                        top: `${(analysis.bbox[1] / 100) * 100}%`,
                        width: `${((analysis.bbox[2] - analysis.bbox[0]) / 100) * 100}%`,
                        height: `${((analysis.bbox[3] - analysis.bbox[1]) / 100) * 100}%`
                      }}
                    />
                  )}
                  <div 
                    className="analysis-emotion-badge"
                    style={{ backgroundColor: getEmotionColor(analysis.emotion) }}
                  >
                    {getEmotionEmoji(analysis.emotion)}
                  </div>
                </div>
                <div className="analysis-info">
                  <h3 className="analysis-emotion">{analysis.emotion}</h3>
                  <div className="analysis-confidence">
                    <span>Confidence: </span>
                    <strong>{(analysis.confidence * 100).toFixed(1)}%</strong>
                  </div>
                  {analysis.fileName && (
                    <div className="analysis-filename">{analysis.fileName}</div>
                  )}
                  <div className="analysis-date">
                    {new Date(analysis.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="analysis-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => handleViewReport(analysis)}
                  >
                    <FiEye /> View Report
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(analysis._id)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        )}

        {/* Report Modal */}
        {showReport && selectedAnalysis && (() => {
          const analysis = analyses.find(a => a._id === selectedAnalysis.id);
          return analysis ? (
            <EmotionReport
              result={selectedAnalysis}
              image={analysis.imageUrl}
              onClose={() => {
                setShowReport(false);
                setSelectedAnalysis(null);
              }}
            />
          ) : null;
        })()}
      </div>
    </div>
  );
};

export default ImageAnalyses;

