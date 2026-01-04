import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiSend } from 'react-icons/fi';
import ScrollAnimation from '../../components/ScrollAnimation';
import api from '../../utils/api';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await api.post('/newsletter', { email });
      setStatus({ type: 'success', message: 'Successfully subscribed to newsletter!' });
      setEmail('');
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Something went wrong. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter" id="newsletter">
      <div className="container">
        <ScrollAnimation className="newsletter-content">
          <div className="newsletter-icon">
            <FiMail />
          </div>
          <h2 className="newsletter-title">Stay Updated</h2>
          <p className="newsletter-description">
            Subscribe to our newsletter and get the latest updates on emotion recognition technology
          </p>
          <form onSubmit={handleSubmit} className="newsletter-form">
            <div className="newsletter-input-group">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="newsletter-input"
              />
              <button 
                type="submit" 
                className="newsletter-button"
                disabled={loading}
              >
                {loading ? 'Subscribing...' : <FiSend />}
              </button>
            </div>
            {status && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`newsletter-status ${status.type}`}
              >
                {status.message}
              </motion.p>
            )}
          </form>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default Newsletter;

