import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiClock, FiLogIn, FiLogOut, FiEdit2, FiSave, FiX, FiArrowLeft, FiShield, FiActivity } from 'react-icons/fi';
import EmotionCharts from '../components/EmotionCharts';
import api from '../utils/api';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    // Update session time every 30 seconds
    const interval = setInterval(fetchProfile, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setUser(response.data.user);
      setEditForm({
        name: response.data.user.name,
        email: response.data.user.email
      });
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      name: user.name,
      email: user.email
    });
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/users/profile', editForm);
      setUser(response.data.user);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      // Still logout even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="profile-container"
        >
          <div className="profile-header">
            <button className="back-button" onClick={() => navigate('/dashboard')}>
              <FiArrowLeft /> Back to Dashboard
            </button>
          </div>

          <div className="profile-header-main">
            <div className="profile-avatar">
              <FiUser />
            </div>
            <div className="profile-header-info">
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-email">{user.email}</p>
              <span className={`profile-role ${user.role}`}>{user.role}</span>
            </div>
            {!editing ? (
              <button className="edit-button" onClick={handleEdit}>
                <FiEdit2 /> Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-button" onClick={handleSave}>
                  <FiSave /> Save
                </button>
                <button className="cancel-button" onClick={handleCancel}>
                  <FiX /> Cancel
                </button>
              </div>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="alert alert-error"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="alert alert-success"
            >
              {success}
            </motion.div>
          )}

          <div className="profile-content">
            <div className="profile-section">
              <div className="section-header-inline">
                <h2 className="section-title">
                  <FiUser /> Personal Information
                </h2>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <label>
                    <FiUser /> Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    <p>{user.name}</p>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FiMail /> Email Address
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    <p>{user.email}</p>
                  )}
                </div>
                <div className="info-item">
                  <label>Account Created</label>
                  <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="info-item">
                  <label>Last Updated</label>
                  <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="section-header-inline">
                <h2 className="section-title">
                  <FiActivity /> Activity Statistics
                </h2>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiClock />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{user.totalTimeFormatted}</h3>
                    <p className="stat-label">Total Time on Site</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiLogIn />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{user.loginCount}</h3>
                    <p className="stat-label">Total Logins</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiClock />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">
                      {user.isOnline ? user.currentSessionTimeFormatted : 'Offline'}
                    </h3>
                    <p className="stat-label">Current Session</p>
                    <span className={`status-badge ${user.isOnline ? 'online' : 'offline'}`}>
                      {user.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiLogIn />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </h3>
                    <p className="stat-label">Last Login</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="section-header-inline">
                <h2 className="section-title">
                  <FiShield /> Login History
                </h2>
              </div>
              <div className="login-history">
                {user.loginHistory && user.loginHistory.length > 0 ? (
                  <div className="history-list">
                    {user.loginHistory.slice().reverse().slice(0, 10).map((session, index) => (
                      <div key={index} className="history-item">
                        <div className="history-main">
                          <div className="history-time">
                            <FiLogIn />
                            <span>{new Date(session.loginTime).toLocaleString()}</span>
                          </div>
                          {session.logoutTime && (
                            <div className="history-time">
                              <FiLogOut />
                              <span>{new Date(session.logoutTime).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="history-details">
                          {session.sessionDuration && (
                            <span className="session-duration">
                              Duration: {formatTime(session.sessionDuration)}
                            </span>
                          )}
                          {session.ipAddress && (
                            <span className="session-ip">IP: {session.ipAddress}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-history">No login history available</p>
                )}
              </div>
            </div>

            <div className="profile-actions">
              <button className="logout-button" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          </div>

          {/* Emotion Statistics Charts */}
          <div className="profile-section">
            <div className="section-header-inline">
              <h2 className="section-title">
                <FiActivity /> Emotion Statistics & Analytics
              </h2>
            </div>
            {user && <EmotionCharts userId={user.id} />}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export default Profile;

