import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiPause } from 'react-icons/fi';
import ScrollAnimation from '../../components/ScrollAnimation';
import './VideoShowcase.css';

const VideoShowcase = () => {
  const [playingIndex, setPlayingIndex] = useState(null);
  const videoRefs = [useRef(null), useRef(null), useRef(null)];

  const videos = [
    {
      id: 1,
      title: 'Real-Time Emotion Detection',
      description: 'Watch our AI detect emotions in real-time',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 2,
      title: 'Advanced AI Technology',
      description: 'See how our deep learning models work',
      thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
      id: 3,
      title: 'User Experience',
      description: 'Experience seamless emotion recognition',
      thumbnail: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=600&fit=crop',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    }
  ];

  const handlePlay = (index) => {
    videoRefs.forEach((ref, i) => {
      if (ref.current) {
        if (i === index) {
          ref.current.play();
          setPlayingIndex(index);
        } else {
          ref.current.pause();
        }
      }
    });
  };

  const handlePause = (index) => {
    if (videoRefs[index].current) {
      videoRefs[index].current.pause();
      setPlayingIndex(null);
    }
  };

  return (
    <section className="video-showcase">
      <div className="container">
        <ScrollAnimation className="section-header">
          <h2 className="section-title">See It In Action</h2>
          <p className="section-description">
            Watch our emotion recognition technology in action through these demonstration videos
          </p>
        </ScrollAnimation>

        <div className="videos-grid">
          {videos.map((video, index) => (
            <ScrollAnimation
              key={video.id}
              delay={index * 0.1}
              className="video-card-wrapper"
            >
              <div className="video-card">
              <div className="video-wrapper">
                <video
                  ref={videoRefs[index]}
                  src={video.videoUrl}
                  poster={video.thumbnail}
                  className="showcase-video"
                  loop
                  muted
                />
                <div className="video-overlay">
                  {playingIndex === index ? (
                    <button
                      className="play-button"
                      onClick={() => handlePause(index)}
                    >
                      <FiPause />
                    </button>
                  ) : (
                    <button
                      className="play-button"
                      onClick={() => handlePlay(index)}
                    >
                      <FiPlay />
                    </button>
                  )}
                </div>
              </div>
              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <p className="video-description">{video.description}</p>
              </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;

