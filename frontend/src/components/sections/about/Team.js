import React from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import ScrollAnimation from '../../ScrollAnimation';
import './Team.css';

const Team = () => {
  const teamMembers = [
    {
      name: 'Malik Abdullah',
      role: 'Lead Developer & AI Engineer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&q=80',
      bio: 'Passionate about AI and machine learning, Malik specializes in deep learning models and neural networks. With years of experience in computer vision and emotion recognition systems.',
      social: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        email: 'malik.abdullah@fer.com'
      }
    },
    {
      name: 'Malik M. Farhan',
      role: 'Full Stack Developer & Designer',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&q=80',
      bio: 'Expert in full-stack development and UI/UX design, creating beautiful and functional web applications. Specializes in modern web technologies and user experience optimization.',
      social: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        email: 'malik.farhan@fer.com'
      }
    }
  ];

  return (
    <section className="team" id="team">
      <div className="container">
        <ScrollAnimation className="section-header">
          <h2 className="section-title">Our Team</h2>
          <p className="section-description">
            Meet the talented individuals behind FER Emotion Recognition
          </p>
        </ScrollAnimation>

        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <ScrollAnimation
              key={index}
              delay={index * 0.2}
              className="team-card-wrapper"
            >
              <div className="team-card">
              <div className="team-image-wrapper">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="team-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="team-image-fallback" style={{ display: 'none' }}>
                  {member.name.charAt(0)}
                </div>
              </div>
              <div className="team-info">
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
                <div className="team-social">
                  <a href={member.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <FiGithub />
                  </a>
                  <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <FiLinkedin />
                  </a>
                  <a href={`mailto:${member.social.email}`} aria-label="Email">
                    <FiMail />
                  </a>
                </div>
              </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;

