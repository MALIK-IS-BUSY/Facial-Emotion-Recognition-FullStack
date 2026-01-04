import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSmile, FiUser, FiArrowRight, FiLogOut, FiImage } from 'react-icons/fi';
import './UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user || !user.id) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user || !user.id) {
    return null;
  }

  return (
    <div className="user-dashboard-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="dashboard-wrapper"
        >
          <div className="dashboard-header">
            <div className="welcome-section">
              <h1 className="welcome-title">
                Welcome back, <span className="user-name">{user.name}</span>!
              </h1>
              <p className="welcome-subtitle">
                What would you like to do today?
              </p>
            </div>
            <button className="logout-header-btn" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </div>

          <div className="dashboard-options">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="option-card emotion-card"
              onClick={() => navigate('/emotion-detection')}
            >
              <div className="option-icon emotion-icon">
                <FiSmile />
              </div>
              <div className="option-content">
                <h2 className="option-title">Detect Emotions</h2>
                <p className="option-description">
                  Use your webcam to detect and analyze your emotions in real-time. 
                  Our advanced AI will recognize your facial expressions and provide 
                  detailed emotion analysis.
                </p>
                <div className="option-features">
                  <span className="feature-tag">Real-Time</span>
                  <span className="feature-tag">AI Powered</span>
                  <span className="feature-tag">Accurate</span>
                </div>
              </div>
              <div className="option-arrow">
                <FiArrowRight />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="option-card profile-card"
              onClick={() => navigate('/profile')}
            >
              <div className="option-icon profile-icon">
                <FiUser />
              </div>
              <div className="option-content">
                <h2 className="option-title">Update Profile</h2>
                <p className="option-description">
                  Manage your account settings, view your activity statistics, 
                  check your login history, and update your personal information.
                </p>
                <div className="option-features">
                  <span className="feature-tag">Settings</span>
                  <span className="feature-tag">Statistics</span>
                  <span className="feature-tag">History</span>
                </div>
              </div>
              <div className="option-arrow">
                <FiArrowRight />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="option-card image-card"
              onClick={() => navigate('/image-analyses')}
            >
              <div className="option-icon image-icon">
                <FiImage />
              </div>
              <div className="option-content">
                <h2 className="option-title">Image Analyses</h2>
                <p className="option-description">
                  View and manage all your uploaded image emotion analyses. 
                  Browse through your analysis history, view detailed reports, 
                  and track your emotional patterns from images.
                </p>
                <div className="option-features">
                  <span className="feature-tag">Gallery</span>
                  <span className="feature-tag">Reports</span>
                  <span className="feature-tag">History</span>
                </div>
              </div>
              <div className="option-arrow">
                <FiArrowRight />
              </div>
            </motion.div>
          </div>

          <div className="dashboard-quick-stats">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="quick-stat"
            >
              <div className="stat-value">Member</div>
              <div className="stat-label">Since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="quick-stat"
            >
              <div className="stat-value">{user.role === 'admin' ? 'Admin' : 'User'}</div>
              <div className="stat-label">Account Type</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;

