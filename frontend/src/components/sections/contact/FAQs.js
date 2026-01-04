import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import ScrollAnimation from '../../ScrollAnimation';
import './FAQs.css';

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How accurate is the emotion recognition system?',
      answer: 'Our system achieves over 95% accuracy in emotion detection, thanks to advanced deep learning models trained on diverse datasets.'
    },
    {
      question: 'Is my data secure and private?',
      answer: 'Absolutely. We prioritize privacy and security. Images are processed in real-time and are never stored on our servers. All data transmission is encrypted.'
    },
    {
      question: 'What emotions can the system detect?',
      answer: 'Our system can detect seven primary emotions: happiness, sadness, anger, surprise, fear, disgust, and neutral states.'
    },
    {
      question: 'Do I need to create an account to use the service?',
      answer: 'While you can try our demo without an account, creating an account gives you access to advanced features, usage history, and API access.'
    },
    {
      question: 'Can I integrate this into my own application?',
      answer: 'Yes! We provide a comprehensive API that allows you to integrate emotion recognition into your own applications. Check our documentation for details.'
    },
    {
      question: 'What are the system requirements?',
      answer: 'Our web-based system works on any modern browser. For optimal performance, we recommend Chrome, Firefox, or Safari with JavaScript enabled.'
    },
    {
      question: 'Is there a mobile app available?',
      answer: 'Currently, we offer a fully responsive web application that works seamlessly on mobile devices. A native mobile app is in development.'
    },
    {
      question: 'How can I contact support?',
      answer: 'You can reach our support team through the contact form on this page, or email us directly at support@fer.com. We typically respond within 24 hours.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faqs" id="faq">
      <div className="container">
        <ScrollAnimation className="section-header">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-description">
            Find answers to common questions about our emotion recognition system
          </p>
        </ScrollAnimation>

        <div className="faqs-list">
          {faqs.map((faq, index) => (
            <ScrollAnimation
              key={index}
              delay={index * 0.05}
              distance={20}
              className="faq-item-wrapper"
            >
              <div className="faq-item">
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FiChevronDown />
                </motion.span>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="faq-answer-wrapper"
                  >
                    <p className="faq-answer">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQs;

