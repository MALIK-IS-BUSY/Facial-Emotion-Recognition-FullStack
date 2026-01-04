import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';
import ScrollAnimation from '../../ScrollAnimation';
import api from '../../../utils/api';
import './ContactForm.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await api.post('/contact', formData);
      setStatus({ type: 'success', message: 'Message sent successfully! We\'ll get back to you soon.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
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
    <section className="contact-form-section">
      <div className="container">
        <ScrollAnimation className="contact-form-wrapper">
          <h2 className="contact-form-title">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="What's this about?"
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Tell us what's on your mind..."
              />
            </div>
            {status && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`form-status ${status.type}`}
              >
                {status.message}
              </motion.div>
            )}
            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? 'Sending...' : (
                <>
                  Send Message
                  <FiSend />
                </>
              )}
            </button>
          </form>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default ContactForm;

