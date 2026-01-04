import React, { useState, useEffect } from 'react';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import VideoShowcase from '../components/sections/VideoShowcase';
import Blog from '../components/sections/Blog';
import Testimonials from '../components/sections/Testimonials';
import Newsletter from '../components/sections/Newsletter';
import SplashScreen from '../components/SplashScreen';
import './Home.css';

const Home = () => {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Check if splash should be shown
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    const isRefresh = navigationEntry?.type === 'reload' || 
                      (typeof performance.navigation !== 'undefined' && performance.navigation.type === 1);
    
    // Show splash on first visit or refresh
    if (!hasSeenSplash || isRefresh) {
      setShowSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Mark as seen after completion
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      <div className={`home-page ${showSplash ? 'splash-active' : ''}`}>
        <Hero />
        <Features />
        <VideoShowcase />
        <Blog />
        <Testimonials />
        <Newsletter />
      </div>
    </>
  );
};

export default Home;

