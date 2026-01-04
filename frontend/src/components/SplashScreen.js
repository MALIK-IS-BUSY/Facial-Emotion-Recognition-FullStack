import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSmile, FiArrowRight, FiZap, FiX } from 'react-icons/fi';
import Typewriter from './Typewriter';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const handleContinue = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Show content after a brief delay
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showContent && currentStep < 3) {
      // Slower transitions - wait longer between steps to allow reading
      const delay = currentStep === 0 ? 5000 : currentStep === 1 ? 6000 : 7000;
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else if (currentStep >= 3) {
      // Auto-complete after showing all steps - give more time to read
      const timer = setTimeout(() => {
        handleContinue();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showContent, currentStep, handleContinue]);

  const steps = [
    {
      title: 'Welcome to',
      subtitle: 'FER Emotion Recognition',
      icon: <FiSmile />
    },
    {
      title: 'Advanced AI Technology',
      subtitle: 'Real-time emotion detection powered by deep learning',
      icon: <FiZap />
    },
    {
      title: 'Experience the Future',
      subtitle: 'Discover how AI understands human emotions',
      icon: <FiSmile />
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="splash-screen"
      >
        {/* Skip Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          onClick={handleContinue}
          className="splash-skip-button"
          aria-label="Skip animation"
        >
          <FiX />
        </motion.button>

        <div className="splash-background">
          <div className="splash-pattern"></div>
        </div>

        <div className="splash-content">
          {showContent && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="splash-step"
            >
              {steps[currentStep]?.icon && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 0.2, 
                    type: "spring", 
                    stiffness: 200,
                    damping: 15
                  }}
                  className="splash-icon"
                >
                  {steps[currentStep].icon}
                </motion.div>
              )}

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="splash-title"
              >
                <Typewriter
                  key={currentStep}
                  text={steps[currentStep]?.title || ''}
                  speed={60}
                  delay={800}
                  showCursor={true}
                />
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="splash-subtitle"
              >
                <Typewriter
                  key={`subtitle-${currentStep}`}
                  text={steps[currentStep]?.subtitle || ''}
                  speed={40}
                  delay={2000}
                  showCursor={false}
                />
              </motion.p>

              {currentStep >= steps.length - 1 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  onClick={handleContinue}
                  className="splash-button"
                >
                  Continue
                  <FiArrowRight />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Loading dots */}
          {currentStep < steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="splash-loading"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="loading-dot"
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="splash-progress">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={`progress-dot ${index <= currentStep ? 'active' : ''}`}
              initial={{ scale: 0 }}
              animate={{ scale: index <= currentStep ? 1 : 0.5 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;

