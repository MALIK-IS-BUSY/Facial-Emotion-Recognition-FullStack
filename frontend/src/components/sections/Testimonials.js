import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import Typewriter from '../../components/Typewriter';
import ScrollAnimation from '../../components/ScrollAnimation';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './Testimonials.css';

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [key, setKey] = useState(0);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'UX Designer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
      rating: 5,
      text: 'This emotion recognition system has revolutionized how we analyze user feedback. Incredibly accurate and easy to integrate!'
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
      rating: 5,
      text: 'The real-time emotion detection capabilities are outstanding. Our customer satisfaction has improved significantly since implementation.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Research Scientist',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=80',
      rating: 5,
      text: 'As a researcher, I appreciate the high accuracy and detailed analytics. This tool has become essential for our studies.'
    },
    {
      name: 'David Kim',
      role: 'Software Engineer',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
      rating: 5,
      text: 'The API integration was seamless, and the documentation is excellent. Great developer experience overall!'
    },
    {
      name: 'Lisa Anderson',
      role: 'Marketing Director',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80',
      rating: 5,
      text: 'We use this to analyze customer reactions to our campaigns. The insights have been invaluable for our marketing strategy.'
    }
  ];

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <ScrollAnimation className="section-header">
          <h2 className="section-title">What People Say</h2>
          <p className="section-description">
            Hear from our satisfied users and clients
          </p>
        </ScrollAnimation>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
            setKey(prev => prev + 1);
          }}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            }
          }}
          className="testimonials-swiper"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <ScrollAnimation delay={index * 0.1} className="testimonial-card-wrapper">
                <motion.div
                  className="testimonial-card"
                >
                  <div className="testimonial-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FiStar key={i} className="star-icon" />
                    ))}
                  </div>
                  <p className="testimonial-text">
                    "
                    {index === activeIndex ? (
                      <Typewriter 
                        key={key}
                        text={testimonial.text} 
                        speed={30}
                        delay={300}
                        showCursor={true}
                      />
                    ) : (
                      testimonial.text
                    )}
                    "
                  </p>
                  <div className="testimonial-author">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="author-avatar"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="author-info">
                      <h4 className="author-name">{testimonial.name}</h4>
                      <p className="author-role">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              </ScrollAnimation>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;

