import React from 'react';
import ScrollAnimation from '../../ScrollAnimation';
import './Stats.css';

const Stats = () => {

  const stats = [
    { number: '95%', label: 'Accuracy Rate' },
    { number: '10K+', label: 'Users' },
    { number: '50K+', label: 'Images Processed' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <section className="stats">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <ScrollAnimation
              key={index}
              delay={index * 0.1}
              direction="scale"
              distance={0}
              className="stat-card-wrapper"
            >
              <div className="stat-card">
              <h3 className="stat-number">{stat.number}</h3>
              <p className="stat-label">{stat.label}</p>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;

