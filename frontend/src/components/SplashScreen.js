import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSmile, FiArrowRight, FiX } from 'react-icons/fi';
import Typewriter from './Typewriter';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [showContent, setShowContent] = useState(false);

  const handleContinue = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Show content after a brief delay
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-complete after 4 seconds
    const timer = setTimeout(() => {
      handleContinue();
    }, 4000);

    return () => clearTimeout(timer);
  }, [handleContinue]);

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
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="splash-step"
            >
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
                <FiSmile />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="splash-title"
              >
                <Typewriter
                  text="FER Emotion Recognition"
                  speed={80}
                  delay={600}
                  showCursor={true}
                />
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="splash-subtitle"
              >
                <Typewriter
                  text="Advanced AI-powered emotion detection system"
                  speed={50}
                  delay={2000}
                  showCursor={false}
                />
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                onClick={handleContinue}
                className="splash-button"
              >
                Enter
                <FiArrowRight />
              </motion.button>
            </motion.div>
          )}

          {/* Loading animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;

