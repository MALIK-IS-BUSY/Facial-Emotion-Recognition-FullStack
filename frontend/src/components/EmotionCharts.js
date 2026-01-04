import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { FiTrendingUp, FiClock, FiBarChart2 } from 'react-icons/fi';
import api from '../utils/api';
import './EmotionCharts.css';

const EMOTION_COLORS = {
  Anger: '#ef4444',
  Contempt: '#f97316',
  Disgust: '#ec4899',
  Fear: '#8b5cf6',
  Happy: '#22c55e',
  Neutral: '#6b7280',
  Sad: '#3b82f6',
  Surprise: '#f59e0b'
};

const EmotionCharts = ({ userId, sessionId, adminView = false }) => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('hour');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchStats();
    // Refresh stats every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, userId, adminView]);

  const fetchStats = async () => {
    if (!userId) return;
    try {
      const endpoint = adminView 
        ? `/admin/users/${userId}/emotions?period=${period}`
        : `/emotions/stats?period=${period}`;
      const response = await api.get(endpoint);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching emotion stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLabel = (timeStr) => {
    try {
      if (period === 'second') {
        return format(parseISO(timeStr), 'HH:mm:ss');
      } else if (period === 'minute') {
        return format(parseISO(timeStr), 'HH:mm');
      } else {
        return format(parseISO(timeStr), 'HH:00');
      }
    } catch {
      return timeStr;
    }
  };

  if (loading) {
    return (
      <div className="emotion-charts-loading">
        <div className="loading-spinner"></div>
        <p>Loading emotion statistics...</p>
      </div>
    );
  }

  if (!stats || !stats.stats || stats.stats.length === 0) {
    return (
      <div className="emotion-charts-empty">
        <FiBarChart2 size={48} />
        <p>No emotion data available yet</p>
        <p className="empty-hint">Start detecting emotions to see statistics</p>
      </div>
    );
  }

  // Prepare data for charts
  const timeSeriesData = stats.stats.map(stat => ({
    time: formatTimeLabel(stat.time),
    ...stat.emotions,
    dominant: stat.dominantEmotion
  }));

  const pieData = Object.entries(stats.overall.emotionCounts)
    .map(([emotion, count]) => ({
      name: emotion,
      value: count,
      percentage: parseFloat(stats.overall.emotionPercentages[emotion])
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const barData = Object.entries(stats.overall.emotionCounts)
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: parseFloat(stats.overall.emotionPercentages[emotion])
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="emotion-charts-container">
      <div className="charts-header">
        <h2 className="charts-title">
          <FiTrendingUp /> Emotion Statistics
        </h2>
        <div className="period-selector">
          <button
            className={period === 'second' ? 'active' : ''}
            onClick={() => setPeriod('second')}
          >
            <FiClock /> Seconds
          </button>
          <button
            className={period === 'minute' ? 'active' : ''}
            onClick={() => setPeriod('minute')}
          >
            <FiClock /> Minutes
          </button>
          <button
            className={period === 'hour' ? 'active' : ''}
            onClick={() => setPeriod('hour')}
          >
            <FiClock /> Hours
          </button>
        </div>
      </div>

      {/* Overall Stats Cards */}
      <div className="overall-stats-cards">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card-overall"
        >
          <div className="stat-card-icon" style={{ background: EMOTION_COLORS[stats.overall.mostCommonEmotion] + '20', color: EMOTION_COLORS[stats.overall.mostCommonEmotion] }}>
            {stats.overall.mostCommonEmotion.charAt(0)}
          </div>
          <div className="stat-card-content">
            <h3>Most Common</h3>
            <p className="stat-value">{stats.overall.mostCommonEmotion}</p>
            <p className="stat-label">{stats.overall.mostCommonCount} detections</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card-overall"
        >
          <div className="stat-card-icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>
            <FiBarChart2 />
          </div>
          <div className="stat-card-content">
            <h3>Total Records</h3>
            <p className="stat-value">{stats.overall.totalRecords}</p>
            <p className="stat-label">Emotions detected</p>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="chart-card"
        >
          <h3 className="chart-title">Emotion Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="chart-card"
        >
          <h3 className="chart-title">Emotion Counts</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="emotion" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" animationDuration={1000}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.emotion]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Time Series Line Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="chart-card chart-card-full"
        >
          <h3 className="chart-title">Emotion Over Time ({period})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(EMOTION_COLORS).map(emotion => (
                <Line
                  key={emotion}
                  type="monotone"
                  dataKey={emotion}
                  stroke={EMOTION_COLORS[emotion]}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1000}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Dominant Emotion Timeline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="chart-card chart-card-full"
        >
          <h3 className="chart-title">Dominant Emotion Timeline</h3>
          <div className="timeline-container">
            {stats.stats.slice(-20).map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.02 }}
                className="timeline-item"
                style={{ borderLeftColor: EMOTION_COLORS[stat.dominantEmotion] }}
              >
                <div className="timeline-time">{formatTimeLabel(stat.time)}</div>
                <div className="timeline-emotion">
                  <span
                    className="emotion-badge"
                    style={{
                      background: EMOTION_COLORS[stat.dominantEmotion] + '20',
                      color: EMOTION_COLORS[stat.dominantEmotion]
                    }}
                  >
                    {stat.dominantEmotion}
                  </span>
                  <span className="timeline-percentage">{stat.dominantPercentage}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmotionCharts;

