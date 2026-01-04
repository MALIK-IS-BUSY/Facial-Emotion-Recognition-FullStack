import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiTwitter, FiMail } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">FER Emotion Recognition</h3>
            <p className="footer-description">
              Advanced face emotion recognition technology powered by AI and machine learning.
            </p>
            <div className="footer-social">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FiGithub />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FiLinkedin />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FiTwitter />
              </a>
              <a href="mailto:contact@fer.com" aria-label="Email">
                <FiMail />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-links">
              <li><a href="#faq">FAQs</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#team">Team</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Contact Info</h4>
            <ul className="footer-contact">
              <li>Email: contact@fer.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Tech Street, City, Country</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FER Emotion Recognition. All rights reserved.</p>
          <p>Developed by Malik Abdullah & Malik M. Farhan</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

