import React from 'react';
import { FiZap, FiShield, FiTrendingUp, FiCpu, FiEye, FiGlobe } from 'react-icons/fi';
import ScrollAnimation from '../../components/ScrollAnimation';
import './Features.css';

const Features = () => {
  const features = [
    {
      icon: <FiZap />,
      title: 'Real-Time Processing',
      description: 'Instant emotion detection with minimal latency for seamless user experience. Process emotions as they happen, not after the fact.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80'
    },
    {
      icon: <FiShield />,
      title: 'Privacy First',
      description: 'Your data is secure. We process images locally and never store your photos. Your privacy is our top priority.',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&q=80'
    },
    {
      icon: <FiTrendingUp />,
      title: 'High Accuracy',
      description: 'State-of-the-art AI models with 95%+ accuracy in emotion recognition. Trusted by researchers and businesses worldwide.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80'
    },
    {
      icon: <FiCpu />,
      title: 'AI Powered',
      description: 'Advanced deep learning algorithms trained on millions of facial expressions. Continuously improving with each interaction.',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop&q=80'
    },
    {
      icon: <FiEye />,
      title: 'Multi-Emotion Detection',
      description: 'Detect happiness, sadness, anger, surprise, fear, disgust, and neutral states. Comprehensive emotion analysis.',
      image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&h=400&fit=crop&q=80'
    },
    {
      icon: <FiGlobe />,
      title: 'Cross-Platform',
      description: 'Works seamlessly across all devices and platforms with responsive design. Access from anywhere, anytime.',
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop&q=80'
    }
  ];

  return (
    <section className="features" id="features">
      <div className="container">
        <ScrollAnimation className="section-header">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-description">
            Discover the advanced capabilities of our emotion recognition system
          </p>
        </ScrollAnimation>

        <div className="features-grid">
          {features.map((feature, index) => (
            <ScrollAnimation
              key={index}
              delay={index * 0.1}
              direction="up"
              className="feature-card-wrapper"
            >
              <div className="feature-card">
              <div className="feature-image-wrapper">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="feature-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="feature-content">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

