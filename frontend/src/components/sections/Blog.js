import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiArrowRight } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import ScrollAnimation from '../../components/ScrollAnimation';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './Blog.css';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Understanding Emotion Recognition Technology',
      excerpt: 'Discover how AI-powered emotion recognition is revolutionizing human-computer interaction and understanding human behavior.',
      author: 'Malik Abdullah',
      date: '2024-01-15',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop&q=80',
      category: 'Technology'
    },
    {
      id: 2,
      title: 'The Future of AI in Healthcare',
      excerpt: 'Explore how emotion recognition can be used in healthcare to improve patient care and mental health monitoring.',
      author: 'Malik M. Farhan',
      date: '2024-01-10',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
      category: 'Healthcare'
    },
    {
      id: 3,
      title: 'Privacy and Ethics in Emotion AI',
      excerpt: 'A deep dive into the ethical considerations and privacy concerns surrounding emotion recognition technology.',
      author: 'Malik Abdullah',
      date: '2024-01-05',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&q=80',
      category: 'Ethics'
    },
    {
      id: 4,
      title: 'Real-Time Emotion Detection Applications',
      excerpt: 'Learn about practical applications of real-time emotion detection in various industries and use cases.',
      author: 'Malik M. Farhan',
      date: '2024-01-01',
      image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=600&fit=crop&q=80',
      category: 'Applications'
    },
    {
      id: 5,
      title: 'Machine Learning Models for Emotion Recognition',
      excerpt: 'Technical deep dive into the machine learning models and algorithms powering modern emotion recognition systems.',
      author: 'Malik Abdullah',
      date: '2023-12-28',
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop&q=80',
      category: 'Machine Learning'
    },
    {
      id: 6,
      title: 'Improving User Experience with Emotion AI',
      excerpt: 'How businesses are using emotion recognition to create more personalized and empathetic user experiences.',
      author: 'Malik M. Farhan',
      date: '2023-12-20',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
      category: 'UX Design'
    }
  ];

  return (
    <section className="blog-section" id="blog">
      <div className="container">
        <ScrollAnimation className="section-header">
          <h2 className="section-title">Latest Blog Posts</h2>
          <p className="section-description">
            Stay updated with the latest insights, research, and news about emotion recognition technology
          </p>
        </ScrollAnimation>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            }
          }}
          className="blog-swiper"
        >
          {blogPosts.map((post, index) => (
            <SwiperSlide key={post.id}>
              <ScrollAnimation delay={index * 0.1}>
                <motion.article
                  className="blog-card"
                >
                <div className="blog-image-wrapper">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="blog-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="blog-category">{post.category}</div>
                </div>
                <div className="blog-content">
                  <div className="blog-meta">
                    <span className="blog-author">
                      <FiUser /> {post.author}
                    </span>
                    <span className="blog-date">
                      <FiCalendar /> {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="blog-title">{post.title}</h3>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  <a href="#blog" className="blog-read-more">
                    Read More <FiArrowRight />
                  </a>
                </div>
              </motion.article>
              </ScrollAnimation>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Blog;

