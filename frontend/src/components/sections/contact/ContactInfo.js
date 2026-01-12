import React from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import ScrollAnimation from '../../ScrollAnimation';
import './ContactInfo.css';

const ContactInfo = () => {
  const contactMethods = [
    {
      icon: <FiMail />,
      title: 'Email',
      info: 'contact@fer.com',
      link: 'mailto:contact@fer.com'
    },
    {
      icon: <FiPhone />,
      title: 'Phone',
      info: '+1 (555) 123-4567',
      link: 'tel:+15551234567'
    },
    {
      icon: <FiMapPin />,
      title: 'Address',
      info: '123 Tech Street, City, Country',
      link: '#'
    },
    {
      icon: <FiClock />,
      title: 'Hours',
      info: 'Mon - Fri: 9AM - 6PM',
      link: '#'
    }
  ];

  return (
    <section className="contact-info">
      <div className="container">
        <div className="contact-info-grid">
          {contactMethods.map((method, index) => (
            <ScrollAnimation
              key={index}
              delay={index * 0.1}
              className="contact-info-card-wrapper"
            >
              <a
                href={method.link}
                className="contact-info-card"
              >
              <div className="contact-info-icon">{method.icon}</div>
              <h3 className="contact-info-title">{method.title}</h3>
              <p className="contact-info-text">{method.info}</p>
              </a>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;

