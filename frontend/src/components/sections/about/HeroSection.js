import React from 'react';
import { motion } from 'framer-motion';
import { FiInfo } from 'react-icons/fi';
import ScrollAnimation from '../../ScrollAnimation';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="about-hero">
      <div className="container">
        <ScrollAnimation className="about-hero-content">
          <div className="about-hero-icon">
            <FiInfo />
          </div>
          <h1 className="about-hero-title">About Us</h1>
          <p className="about-hero-description">
            We are passionate about advancing emotion recognition technology to create
            meaningful connections between humans and AI systems.
          </p>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default HeroSection;

