import React from 'react';
import HeroSection from '../components/sections/about/HeroSection';
import Mission from '../components/sections/about/Mission';
import Team from '../components/sections/about/Team';
import Stats from '../components/sections/about/Stats';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <HeroSection />
      <Mission />
      <Stats />
      <Team />
    </div>
  );
};

export default About;

