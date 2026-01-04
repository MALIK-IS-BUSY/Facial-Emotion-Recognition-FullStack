import React from 'react';
import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';
import ScrollAnimation from '../../ScrollAnimation';
import './ContactHero.css';

const ContactHero = () => {
  return (
    <section className="contact-hero">
      <div className="container">
        <ScrollAnimation className="contact-hero-content">
          <div className="contact-hero-icon">
            <FiMail />
          </div>
          <h1 className="contact-hero-title">Get In Touch</h1>
          <p className="contact-hero-description">
            Have questions or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default ContactHero;

