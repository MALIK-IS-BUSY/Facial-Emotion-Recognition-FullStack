import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../utils/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/admin/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Dispatch event to update navbar
      window.dispatchEvent(new Event('userLogin'));
      
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-background">
        <div className="admin-login-bg-image"></div>
        <div className="admin-login-bg-overlay"></div>
        <div className="admin-login-bg-shapes">
          <motion.div
            className="shape shape-1"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="shape shape-2"
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="shape shape-3"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 3, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="admin-login-container"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="admin-login-header"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="admin-login-icon"
          >
            <FiShield />
          </motion.div>
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="admin-login-subtitle">Secure access to the admin dashboard</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="error-message"
            >
              {error}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="form-group"
          >
            <label htmlFor="email">
              <FiMail /> Admin Email
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@fer.com"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="form-group"
          >
            <label htmlFor="password">
              <FiLock /> Password
            </label>
            <div className="input-wrapper password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter admin password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button type="submit" className="admin-login-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In as Admin
                  <FiShield />
                </>
              )}
            </button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="admin-login-footer"
        >
          <p>
            <Link to="/login">Regular User Login</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
