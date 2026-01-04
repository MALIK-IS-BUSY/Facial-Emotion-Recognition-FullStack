import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiSmile } from 'react-icons/fi';
import Typewriter from '../../components/Typewriter';
import ScrollAnimation from '../../components/ScrollAnimation';
import './Hero.css';

const Hero = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const handleGetStarted = (e) => {
    e.preventDefault();
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    // Simple animated background effect
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="hero">
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-text"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="hero-icon"
          >
            <FiSmile />
          </motion.div>
          <h1 className="hero-title">
            <Typewriter 
              text="Advanced Face Emotion Recognition" 
              speed={80}
              delay={500}
              showCursor={true}
            />
          </h1>
          <p className="hero-description">
            <Typewriter 
              text="Experience cutting-edge AI technology that accurately detects and analyzes human emotions in real-time. Powered by deep learning and neural networks." 
              speed={30}
              delay={3000}
              showCursor={false}
            />
          </p>
          <div className="hero-buttons">
            <a href="#" onClick={handleGetStarted} className="btn btn-primary">
              Get Started
              <FiArrowRight />
            </a>
            <Link to="/about" className="btn btn-secondary">
              Learn More
            </Link>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hero-image"
        >
          <div className="hero-image-placeholder">
            <img 
              src="https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1200&h=800&fit=crop&q=80" 
              alt="Emotion Recognition Technology"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="image-fallback" style={{ display: 'none' }}>
              <FiSmile />
            </div>
            <div className="hero-image-overlay">
              <div className="hero-badge">
                <span>AI Powered</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="hero-scroll">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <span>Scroll Down</span>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

