import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiMail, FiMessageSquare, FiTrendingUp, FiLogOut, FiClock, FiEye, FiEyeOff, FiActivity, FiUserPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import EmotionCharts from '../components/EmotionCharts';
import api from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [userEmotionStats, setUserEmotionStats] = useState(null);
  const [loadingEmotions, setLoadingEmotions] = useState(false);
  const [userImageAnalyses, setUserImageAnalyses] = useState(null);
  const [loadingImageAnalyses, setLoadingImageAnalyses] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(null);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [editUserForm, setEditUserForm] = useState({ role: '', password: '' });
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Check and update online status first (don't fail if this fails)
      try {
        await api.get('/admin/check-online');
      } catch (checkError) {
        console.warn('Online status check failed:', checkError);
      }
      
      const [statsRes, usersRes, contactsRes, newslettersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/contacts'),
        api.get('/admin/newsletters')
      ]);

      setStats(statsRes.data?.stats || null);
      setUsers(usersRes.data?.users || []);
      setContacts(contactsRes.data?.contacts || []);
      setNewsletters(newslettersRes.data?.newsletters || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      } else {
        // Set empty data on error so UI doesn't break
        setStats(null);
        setUsers([]);
        setContacts([]);
        setNewsletters([]);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    fetchData();
  }, [navigate, fetchData]);

  // Refresh data periodically and check online status
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const markContactAsRead = async (id) => {
    try {
      await api.put(`/admin/contacts/${id}/read`);
      setContacts(contacts.map(c => c._id === id ? { ...c, read: true } : c));
    } catch (error) {
      console.error('Error marking contact as read:', error);
    }
  };

  const fetchUserEmotions = async (userId) => {
    setLoadingEmotions(true);
    try {
      const response = await api.get(`/admin/users/${userId}/emotions?period=hour`);
      setUserEmotionStats(response.data);
    } catch (error) {
      console.error('Error fetching user emotions:', error);
      setUserEmotionStats(null);
    } finally {
      setLoadingEmotions(false);
    }
  };

  const fetchUserImageAnalyses = async (userId) => {
    setLoadingImageAnalyses(true);
    try {
      const response = await api.get(`/admin/users/${userId}/image-analyses`);
      setUserImageAnalyses(response.data);
    } catch (error) {
      console.error('Error fetching user image analyses:', error);
      setUserImageAnalyses(null);
    } finally {
      setLoadingImageAnalyses(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchUserEmotions(user.id || user._id);
    fetchUserImageAnalyses(user.id || user._id);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/admin/users', newUserForm);
      if (response.data.success) {
        setShowCreateUser(false);
        setNewUserForm({ name: '', email: '', password: '', role: 'user' });
        fetchData();
        alert('User created successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const userId = showEditUser.id || showEditUser._id;
      
      // Update role if changed
      if (editUserForm.role && editUserForm.role !== showEditUser.role) {
        await api.put(`/admin/users/${userId}/role`, { role: editUserForm.role });
      }
      
      // Update password if provided
      if (editUserForm.password && editUserForm.password.length >= 6) {
        await api.put(`/admin/users/${userId}/password`, { password: editUserForm.password });
      }
      
      setShowEditUser(null);
      setEditUserForm({ role: '', password: '' });
      fetchData();
      alert('User updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchData();
      alert('User deleted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          <FiLogOut /> Logout
        </button>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <button
            className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`sidebar-item ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            Contacts
          </button>
          <button
            className={`sidebar-item ${activeTab === 'newsletters' ? 'active' : ''}`}
            onClick={() => setActiveTab('newsletters')}
          >
            Newsletters
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overview-section"
            >
              <h2 className="section-title">Dashboard Overview</h2>
              {loading ? (
                <div className="loading-state">Loading dashboard data...</div>
              ) : stats ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiUsers />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stats.totalUsers || 0}</h3>
                    <p className="stat-label">Total Users</p>
                    {stats.onlineUsers > 0 && (
                      <span className="stat-badge online">{stats.onlineUsers} online</span>
                    )}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiMessageSquare />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stats.totalContacts}</h3>
                    <p className="stat-label">Contact Messages</p>
                    {stats.unreadContacts > 0 && (
                      <span className="stat-badge">{stats.unreadContacts} unread</span>
                    )}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiMail />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stats.totalNewsletters}</h3>
                    <p className="stat-label">Newsletter Subscribers</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiTrendingUp />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stats.totalAdmins}</h3>
                    <p className="stat-label">Admin Users</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiClock />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stats.totalTimeAllUsersFormatted || '0h 0m 0s'}</h3>
                    <p className="stat-label">Total Time (All Users)</p>
                    <span className="stat-badge">Avg: {stats.avgTimePerUserFormatted || '0h 0m 0s'}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiUsers />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stats.recentLogins || 0}</h3>
                    <p className="stat-label">Recent Logins (24h)</p>
                  </div>
                </div>
              </div>
              ) : (
                <div className="error-state">
                  <p>Failed to load dashboard data. Please try refreshing the page.</p>
                  <button onClick={fetchData} className="retry-button">Retry</button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="users-section"
            >
              <div className="section-header-with-action">
                <h2 className="section-title">All Users</h2>
                <button className="create-user-btn" onClick={() => setShowCreateUser(true)}>
                  <FiUserPlus /> Create User
                </button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Password</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Time on Site</th>
                      <th>Logins</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id || user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <div className="password-cell">
                            <span className="password-hash">
                              {showPasswords[user.id || user._id] 
                                ? (user.password || user.plaintextPassword || 'N/A') 
                                : '••••••••••••'}
                            </span>
                            <button
                              className="toggle-password"
                              onClick={() => setShowPasswords({
                                ...showPasswords,
                                [user.id || user._id]: !showPasswords[user.id || user._id]
                              })}
                              title={showPasswords[user.id || user._id] ? "Hide password" : "Show password"}
                            >
                              {showPasswords[user.id || user._id] ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.isOnline ? 'online' : 'offline'}`}>
                            {user.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td>
                          <div className="time-info">
                            <span>{user.totalTimeFormatted || '0h 0m 0s'}</span>
                            {user.isOnline && user.currentSessionTimeFormatted && (
                              <span className="current-session">
                                (Current: {user.currentSessionTimeFormatted})
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{user.loginCount || 0}</td>
                        <td>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="view-details-btn"
                              onClick={() => handleUserSelect(user)}
                            >
                              View Details
                            </button>
                            <button
                              className="edit-role-btn"
                              onClick={() => setShowEditUser(user)}
                              title="Change Role"
                            >
                              <FiEdit />
                            </button>
                            <button
                              className="delete-user-btn"
                              onClick={() => handleDeleteUser(user.id || user._id)}
                              title="Delete User"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'contacts' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="contacts-section"
            >
              <h2 className="section-title">Contact Messages</h2>
              <div className="contacts-list">
                {contacts.map(contact => (
                  <div
                    key={contact._id}
                    className={`contact-card ${!contact.read ? 'unread' : ''}`}
                  >
                    <div className="contact-header">
                      <div>
                        <h3>{contact.name}</h3>
                        <p>{contact.email}</p>
                      </div>
                      {!contact.read && (
                        <button
                          onClick={() => markContactAsRead(contact._id)}
                          className="mark-read-button"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                    <h4 className="contact-subject">{contact.subject}</h4>
                    <p className="contact-message">{contact.message}</p>
                    <p className="contact-date">
                      {new Date(contact.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'newsletters' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="newsletters-section"
            >
              <h2 className="section-title">Newsletter Subscribers</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Subscribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsletters.map(newsletter => (
                      <tr key={newsletter._id}>
                        <td>{newsletter.email}</td>
                        <td>{new Date(newsletter.subscribedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="user-modal-overlay" onClick={() => setSelectedUser(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="user-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>User Details: {selectedUser.name}</h2>
              <button className="close-modal" onClick={() => setSelectedUser(null)}>×</button>
            </div>
            <div className="modal-content">
              <div className="user-detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <p>{selectedUser.name}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <p>{selectedUser.email}</p>
                  </div>
                  <div className="detail-item">
                    <label>Role:</label>
                    <span className={`role-badge ${selectedUser.role}`}>{selectedUser.role}</span>
                  </div>
                  <div className="detail-item">
                    <label>Password (Plaintext):</label>
                    <div className="password-display">
                      <code className="password-plaintext">{selectedUser.password || selectedUser.plaintextPassword || 'N/A'}</code>
                      {selectedUser.hashedPassword && selectedUser.password && (
                        <small className="password-hint">(Original unhashed password shown above)</small>
                      )}
                      {!selectedUser.password && !selectedUser.plaintextPassword && (
                        <small className="password-hint warning">(Password was hashed before plaintext storage was implemented)</small>
                      )}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Account Created:</label>
                    <p>{new Date(selectedUser.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated:</label>
                    <p>{new Date(selectedUser.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="user-detail-section">
                <h3>Activity Statistics</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Total Time on Site:</label>
                    <p className="highlight">{selectedUser.totalTimeFormatted}</p>
                  </div>
                  <div className="detail-item">
                    <label>Current Session:</label>
                    <p className="highlight">
                      {selectedUser.isOnline ? selectedUser.currentSessionTimeFormatted : 'Offline'}
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Total Logins:</label>
                    <p className="highlight">{selectedUser.loginCount}</p>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedUser.isOnline ? 'online' : 'offline'}`}>
                      {selectedUser.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Last Login:</label>
                    <p>{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Last Logout:</label>
                    <p>{selectedUser.lastLogout ? new Date(selectedUser.lastLogout).toLocaleString() : 'Never'}</p>
                  </div>
                </div>
              </div>

              {selectedUser.loginHistory && selectedUser.loginHistory.length > 0 && (
                <div className="user-detail-section">
                  <h3>Login History (Last 10)</h3>
                  <div className="login-history-list">
                    {selectedUser.loginHistory.slice().reverse().slice(0, 10).map((session, index) => (
                      <div key={index} className="history-item">
                        <div className="history-header">
                          <span>Login #{selectedUser.loginHistory.length - index}</span>
                          <span>{new Date(session.loginTime).toLocaleString()}</span>
                        </div>
                        <div className="history-details">
                          {session.logoutTime && (
                            <span>Logout: {new Date(session.logoutTime).toLocaleString()}</span>
                          )}
                          {session.sessionDuration && (
                            <span>Duration: {formatTime(session.sessionDuration)}</span>
                          )}
                          {session.ipAddress && <span>IP: {session.ipAddress}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emotion Dashboard Section */}
              <div className="user-detail-section">
                <h3>
                  <FiActivity /> Emotion Recognition Dashboard (Real-time)
                </h3>
                {loadingEmotions ? (
                  <div className="loading-emotions">
                    <div className="loading-spinner-small"></div>
                    <p>Loading emotion statistics...</p>
                  </div>
                ) : userEmotionStats && userEmotionStats.overall.totalRecords > 0 ? (
                  <div className="user-emotion-dashboard">
                    <div className="emotion-summary-cards">
                      <div className="emotion-summary-card">
                        <div className="summary-label">Total Records</div>
                        <div className="summary-value">{userEmotionStats.overall.totalRecords}</div>
                      </div>
                      <div className="emotion-summary-card">
                        <div className="summary-label">Most Common</div>
                        <div className="summary-value">{userEmotionStats.overall.mostCommonEmotion}</div>
                        <div className="summary-sub">{userEmotionStats.overall.mostCommonCount} detections</div>
                      </div>
                    </div>
                    <div className="emotion-charts-wrapper">
                      <EmotionCharts userId={selectedUser.id || selectedUser._id} adminView={true} />
                    </div>
                  </div>
                ) : (
                  <div className="no-emotion-data">
                    <p>No emotion data available for this user yet.</p>
                    <p className="hint">User needs to use the emotion detection feature to generate data.</p>
                  </div>
                )}
              </div>

              {/* Image Analyses Dashboard Section */}
              <div className="user-detail-section">
                <h3>
                  <FiTrendingUp /> Image Analyses Dashboard
                </h3>
                {loadingImageAnalyses ? (
                  <div className="loading-emotions">
                    <div className="loading-spinner-small"></div>
                    <p>Loading image analyses...</p>
                  </div>
                ) : userImageAnalyses && userImageAnalyses.stats.totalAnalyses > 0 ? (
                  <div className="user-image-analyses-dashboard">
                    <div className="emotion-summary-cards">
                      <div className="emotion-summary-card">
                        <div className="summary-label">Total Image Analyses</div>
                        <div className="summary-value">{userImageAnalyses.stats.totalAnalyses}</div>
                      </div>
                      <div className="emotion-summary-card">
                        <div className="summary-label">Avg Confidence</div>
                        <div className="summary-value">{(userImageAnalyses.stats.avgConfidence * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                    {userImageAnalyses.stats.emotionStats && Object.keys(userImageAnalyses.stats.emotionStats).length > 0 && (
                      <div className="image-emotion-stats">
                        <h4>Emotion Distribution</h4>
                        <div className="emotion-stats-grid">
                          {Object.entries(userImageAnalyses.stats.emotionStats).map(([emotion, data]) => (
                            <div key={emotion} className="emotion-stat-item">
                              <div className="stat-emotion-name">{emotion}</div>
                              <div className="stat-emotion-count">{data.count}</div>
                              <div className="stat-emotion-percentage">{data.percentage}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {userImageAnalyses.analyses && userImageAnalyses.analyses.length > 0 && (
                      <div className="recent-image-analyses">
                        <h4>Recent Image Analyses</h4>
                        <div className="image-analyses-grid">
                          {userImageAnalyses.analyses.slice(0, 6).map((analysis) => (
                            <div key={analysis._id} className="image-analysis-card">
                              <div className="analysis-image-preview">
                                <img 
                                  src={analysis.imageUrl} 
                                  alt="Analysis" 
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="image-fallback" style={{ display: 'none' }}>
                                  <FiTrendingUp />
                                </div>
                                <div className="analysis-emotion-overlay">
                                  {analysis.emotion}
                                </div>
                              </div>
                              <div className="analysis-info">
                                <div className="analysis-emotion">{analysis.emotion}</div>
                                <div className="analysis-confidence">
                                  {(analysis.confidence * 100).toFixed(1)}%
                                </div>
                                <div className="analysis-date">
                                  {new Date(analysis.timestamp).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {userImageAnalyses.total > 6 && (
                          <p className="more-analyses-hint">
                            Showing 6 of {userImageAnalyses.total} analyses
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-emotion-data">
                    <p>No image analyses available for this user yet.</p>
                    <p className="hint">User needs to upload and analyze images to generate data.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="modal-overlay" onClick={() => setShowCreateUser(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Create New User</h2>
              <button className="close-modal" onClick={() => setShowCreateUser(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateUser(false)}>Cancel</button>
                <button type="submit">Create User</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit User Role Modal */}
      {showEditUser && (
        <div className="modal-overlay" onClick={() => setShowEditUser(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit User: {showEditUser.name}</h2>
              <button className="close-modal" onClick={() => setShowEditUser(null)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Change Role</label>
                <select
                  value={editUserForm.role || showEditUser.role}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Change Password (leave empty to keep current)</label>
                <input
                  type="password"
                  value={editUserForm.password}
                  onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                  placeholder="New password (min 6 characters)"
                  minLength={6}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditUser(null)}>Cancel</button>
                <button type="submit">Update User</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
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

export default AdminDashboard;

