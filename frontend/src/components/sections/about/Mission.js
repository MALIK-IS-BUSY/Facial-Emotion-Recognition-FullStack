import React from 'react';
import { FiTarget, FiEye, FiHeart } from 'react-icons/fi';
import ScrollAnimation from '../../ScrollAnimation';
import './Mission.css';

const Mission = () => {
  const values = [
    {
      icon: <FiTarget />,
      title: 'Our Mission',
      description: 'To democratize emotion recognition technology and make it accessible to everyone, enabling better human-AI interactions and understanding.'
    },
    {
      icon: <FiEye />,
      title: 'Our Vision',
      description: 'A world where AI systems can understand and respond to human emotions naturally, creating more empathetic and effective technology solutions.'
    },
    {
      icon: <FiHeart />,
      title: 'Our Values',
      description: 'We believe in privacy, accuracy, and ethical AI. Every decision we make is guided by our commitment to responsible technology development.'
    }
  ];

  return (
    <section className="mission">
      <div className="container">
        <ScrollAnimation className="section-header">
          <h2 className="section-title">Our Mission & Vision</h2>
        </ScrollAnimation>

        <div className="mission-grid">
          {values.map((value, index) => (
            <ScrollAnimation
              key={index}
              delay={index * 0.2}
              className="mission-card-wrapper"
            >
              <div className="mission-card">
              <div className="mission-icon">{value.icon}</div>
              <h3 className="mission-title">{value.title}</h3>
              <p className="mission-description">{value.description}</p>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Mission;

